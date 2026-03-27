import { generateCompareSlugs, getCompareStates } from '@/lib/db';
import { formatCurrency, formatPercent } from '@/lib/format';
import { breadcrumbSchema, faqSchema } from '@/lib/schema';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return generateCompareSlugs().map(slug => ({ slug }));
}

export const revalidate = 86400; // ISR daily

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = getCompareStates(slug);
  if (!data) return {};
  const { a, b } = data;
  return {
    title: `${a.state} vs ${b.state} Rent Comparison 2026`,
    description: `Compare fair market rents: ${a.state} avg 2BR ${formatCurrency(a.avg_rent_2br)}/mo vs ${b.state} ${formatCurrency(b.avg_rent_2br)}/mo. Income, tenant rights, and renter statistics side by side.`,
    alternates: { canonical: `/compare/${slug}/` },
  };
}

export default async function ComparePage({ params }: Props) {
  const { slug } = await params;
  const data = getCompareStates(slug);
  if (!data) notFound();

  const { a, b } = data;

  const metrics = [
    { label: 'Average 1BR Rent', aVal: formatCurrency(a.avg_rent_1br) + '/mo', bVal: formatCurrency(b.avg_rent_1br) + '/mo', aNum: a.avg_rent_1br, bNum: b.avg_rent_1br, lower: true },
    { label: 'Average 2BR Rent', aVal: formatCurrency(a.avg_rent_2br) + '/mo', bVal: formatCurrency(b.avg_rent_2br) + '/mo', aNum: a.avg_rent_2br, bNum: b.avg_rent_2br, lower: true },
    { label: 'Median Income', aVal: formatCurrency(a.median_income), bVal: formatCurrency(b.median_income), aNum: a.median_income, bNum: b.median_income, lower: false },
    { label: 'Renter %', aVal: formatPercent(a.renter_pct), bVal: formatPercent(b.renter_pct), aNum: a.renter_pct, bNum: b.renter_pct, lower: false },
    { label: 'Tenant Rights', aVal: `${a.tenant_rights_score}/10`, bVal: `${b.tenant_rights_score}/10`, aNum: a.tenant_rights_score, bNum: b.tenant_rights_score, lower: false },
  ];

  const rentDiff = Math.abs(a.avg_rent_2br - b.avg_rent_2br);
  const cheaperState = a.avg_rent_2br <= b.avg_rent_2br ? a : b;
  const pricierState = a.avg_rent_2br > b.avg_rent_2br ? a : b;
  const pctDiff = ((rentDiff / pricierState.avg_rent_2br) * 100).toFixed(0);

  const faqs = [
    {
      question: `Is ${a.state} or ${b.state} cheaper to rent in?`,
      answer: `${cheaperState.state} has lower average rents. A 2-bedroom averages ${formatCurrency(cheaperState.avg_rent_2br)}/mo, which is ${formatCurrency(rentDiff)} less per month than ${pricierState.state} (${pctDiff}% cheaper).`,
    },
    {
      question: `Which state has better tenant protections, ${a.state} or ${b.state}?`,
      answer: `${a.tenant_rights_score >= b.tenant_rights_score ? a.state : b.state} has stronger tenant rights with a score of ${Math.max(a.tenant_rights_score, b.tenant_rights_score)}/10 compared to ${Math.min(a.tenant_rights_score, b.tenant_rights_score)}/10.`,
    },
    {
      question: `What is the income difference between ${a.state} and ${b.state}?`,
      answer: `${a.state} median income: ${formatCurrency(a.median_income)}. ${b.state} median income: ${formatCurrency(b.median_income)}. Difference: ${formatCurrency(Math.abs(a.median_income - b.median_income))}/year.`,
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Compare', url: `/compare/${slug}/` },
        { name: `${a.state} vs ${b.state}`, url: `/compare/${slug}/` },
      ])) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />

      <nav className="text-sm text-slate-500 mb-4">
        <a href="/" className="hover:text-indigo-600">Home</a> &raquo; <span>Compare</span> &raquo; <span>{a.state} vs {b.state}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">{a.state} vs {b.state}: Rent Comparison 2026</h1>
      <p className="text-slate-600 mb-6">
        Side-by-side comparison of fair market rents, income, and tenant protections between {a.state} and {b.state}.
      </p>

      {/* Summary */}
      <div className="bg-indigo-50 rounded-lg p-4 mb-8">
        <p className="text-sm text-slate-700">
          <strong>{cheaperState.state}</strong> is {pctDiff}% cheaper for a 2-bedroom rental than {pricierState.state},
          saving renters approximately <strong>{formatCurrency(rentDiff)}/mo</strong> ({formatCurrency(rentDiff * 12)}/year).
        </p>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-slate-200">
              <th className="py-3 pr-4 text-left">Metric</th>
              <th className="py-3 pr-4 text-right">
                <a href={`/state/${a.slug}/`} className="text-indigo-600 hover:underline">{a.state}</a>
              </th>
              <th className="py-3 text-right">
                <a href={`/state/${b.slug}/`} className="text-indigo-600 hover:underline">{b.state}</a>
              </th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((m, i) => {
              const aWins = m.lower ? m.aNum < m.bNum : m.aNum > m.bNum;
              const bWins = m.lower ? m.bNum < m.aNum : m.bNum > m.aNum;
              return (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-3 pr-4">{m.label}</td>
                  <td className={`py-3 pr-4 text-right font-medium ${aWins ? 'text-green-700' : ''}`}>{m.aVal}</td>
                  <td className={`py-3 text-right font-medium ${bWins ? 'text-green-700' : ''}`}>{m.bVal}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Rent Burden Comparison */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Rent Burden Comparison</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[a, b].map(s => {
            const burden = ((s.avg_rent_2br * 12 / s.median_income) * 100).toFixed(1);
            const isBurdened = parseFloat(burden) >= 30;
            return (
              <div key={s.abbr} className={`rounded-lg p-4 ${isBurdened ? 'bg-red-50' : 'bg-green-50'}`}>
                <h3 className="font-semibold">{s.state}</h3>
                <p className="text-sm mt-1">2BR Rent: {formatCurrency(s.avg_rent_2br)}/mo of {formatCurrency(s.median_income)}/yr income</p>
                <p className={`text-lg font-bold mt-1 ${isBurdened ? 'text-red-700' : 'text-green-700'}`}>{burden}% of income</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQs */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
        {faqs.map((faq, i) => (
          <div key={i} className="mb-4">
            <h3 className="font-semibold text-slate-900">{faq.question}</h3>
            <p className="text-sm text-slate-600 mt-1">{faq.answer}</p>
          </div>
        ))}
      </section>

      {/* Cross-ref */}
      <div className="bg-slate-50 rounded-lg p-4 text-sm">
        <p className="font-medium mb-2">More Comparisons</p>
        <div className="flex flex-wrap gap-4">
          <a href={`/state/${a.slug}/`} className="text-indigo-600 hover:underline">{a.state} Rent Data &rarr;</a>
          <a href={`/state/${b.slug}/`} className="text-indigo-600 hover:underline">{b.state} Rent Data &rarr;</a>
          <a href="https://costbycity.com" className="text-indigo-600 hover:underline">Cost of Living Comparison &rarr;</a>
        </div>
      </div>
    </>
  );
}
