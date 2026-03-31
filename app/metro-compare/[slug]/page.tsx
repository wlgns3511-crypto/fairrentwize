import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllMetroComparisonSlugs, getMetroComparisonBySlug } from '@/lib/db';
import { formatCurrency } from '@/lib/format';
import { breadcrumbSchema, faqSchema } from '@/lib/schema';
import { ComparisonBar } from '@/components/ComparisonBar';

interface Props { params: Promise<{ slug: string }> }

export const dynamicParams = true;
export const revalidate = false;

export async function generateStaticParams() {
  return getAllMetroComparisonSlugs(300).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = getMetroComparisonBySlug(slug);
  if (!data) return {};
  const { a, b } = data;
  return {
    title: `${a.metro_name} vs ${b.metro_name} Rent Comparison 2025`,
    description: `Compare fair market rents: ${a.metro_name} 2BR ${formatCurrency(a.fmr_2br)}/mo vs ${b.metro_name} ${formatCurrency(b.fmr_2br)}/mo. Studio, 1BR, 2BR, 3BR, 4BR rates side by side.`,
    alternates: { canonical: `/metro-compare/${slug}/` },
  };
}

export default async function MetroComparePage({ params }: Props) {
  const { slug } = await params;
  const data = getMetroComparisonBySlug(slug);
  if (!data) notFound();
  const { a, b } = data;

  const cheaper = a.fmr_2br <= b.fmr_2br ? a : b;
  const pricier = a.fmr_2br > b.fmr_2br ? a : b;
  const diff = Math.abs(a.fmr_2br - b.fmr_2br);
  const pctDiff = cheaper.fmr_2br > 0 ? ((diff / cheaper.fmr_2br) * 100).toFixed(0) : '0';

  const rows = [
    { label: 'Studio', aVal: formatCurrency(a.fmr_studio), bVal: formatCurrency(b.fmr_studio), diff: Math.abs(a.fmr_studio - b.fmr_studio) },
    { label: '1 Bedroom', aVal: formatCurrency(a.fmr_1br), bVal: formatCurrency(b.fmr_1br), diff: Math.abs(a.fmr_1br - b.fmr_1br) },
    { label: '2 Bedrooms', aVal: formatCurrency(a.fmr_2br), bVal: formatCurrency(b.fmr_2br), diff: Math.abs(a.fmr_2br - b.fmr_2br) },
    { label: '3 Bedrooms', aVal: formatCurrency(a.fmr_3br), bVal: formatCurrency(b.fmr_3br), diff: Math.abs(a.fmr_3br - b.fmr_3br) },
    { label: '4 Bedrooms', aVal: formatCurrency(a.fmr_4br), bVal: formatCurrency(b.fmr_4br), diff: Math.abs(a.fmr_4br - b.fmr_4br) },
    { label: 'Median Income', aVal: formatCurrency(a.median_income), bVal: formatCurrency(b.median_income), diff: Math.abs(a.median_income - b.median_income) },
  ];

  const faqs = [
    {
      question: `Is ${a.metro_name} or ${b.metro_name} cheaper to rent in?`,
      answer: `${cheaper.metro_name} is cheaper — a 2-bedroom Fair Market Rent is ${formatCurrency(cheaper.fmr_2br)}/mo vs ${formatCurrency(pricier.fmr_2br)}/mo in ${pricier.metro_name}. That's ${formatCurrency(diff)}/mo or ${formatCurrency(diff * 12)}/year more expensive in ${pricier.metro_name} (${pctDiff}% higher).`,
    },
    {
      question: `What is the 2-bedroom rent in ${a.metro_name} vs ${b.metro_name}?`,
      answer: `The HUD Fair Market Rent for a 2-bedroom in ${a.metro_name} is ${formatCurrency(a.fmr_2br)}/month. In ${b.metro_name}, a 2-bedroom FMR is ${formatCurrency(b.fmr_2br)}/month.`,
    },
    {
      question: `How do incomes compare between ${a.metro_name} and ${b.metro_name}?`,
      answer: `The median household income in ${a.metro_name} is ${formatCurrency(a.median_income)}/year. In ${b.metro_name} it is ${formatCurrency(b.median_income)}/year. ${a.median_income > b.median_income ? a.metro_name : b.metro_name} has the higher median income.`,
    },
    {
      question: `What is the studio rent in ${a.metro_name} vs ${b.metro_name}?`,
      answer: `A studio apartment Fair Market Rent in ${a.metro_name} is ${formatCurrency(a.fmr_studio)}/mo. In ${b.metro_name} it is ${formatCurrency(b.fmr_studio)}/mo.`,
    },
  ];

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Metro Compare', url: '/metro-compare/' },
    { name: `${a.metro_name} vs ${b.metro_name}`, url: `/metro-compare/${slug}/` },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <nav className="text-sm text-slate-500 mb-4">
        <a href="/" className="hover:underline">Home</a>
        {' / '}
        <a href="/metro-compare/" className="hover:underline">Metro Compare</a>
        {' / '}
        <span className="text-slate-800">{a.metro_name} vs {b.metro_name}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">{a.metro_name} vs {b.metro_name}</h1>
      <p className="text-slate-600 mb-8">Fair Market Rent Comparison — HUD 2025 Data</p>

      <div className="bg-indigo-50 rounded-xl p-6 mb-8">
        <h2 className="font-semibold mb-3">Quick Answer</h2>
        <p className="text-slate-700">
          <strong>{cheaper.metro_name}</strong> is {pctDiff}% cheaper for renters.
          A 2-bedroom rents for <strong>{formatCurrency(cheaper.fmr_2br)}/mo</strong> vs{' '}
          <strong>{formatCurrency(pricier.fmr_2br)}/mo</strong> in {pricier.metro_name} —
          saving {formatCurrency(diff * 12)}/year.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Rent by Unit Size</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100">
                <th className="p-3 text-left border border-slate-200">Unit Size</th>
                <th className="p-3 text-left border border-slate-200 text-indigo-600">{a.metro_name}</th>
                <th className="p-3 text-left border border-slate-200 text-indigo-600">{b.metro_name}</th>
                <th className="p-3 text-left border border-slate-200 text-slate-500">Difference</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="p-3 border border-slate-200 font-medium">{row.label}</td>
                  <td className="p-3 border border-slate-200">{row.aVal}</td>
                  <td className="p-3 border border-slate-200">{row.bVal}</td>
                  <td className="p-3 border border-slate-200 text-slate-500">{formatCurrency(row.diff)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Visual rent comparison */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
        <div>
          <h3 className="text-sm font-medium text-slate-600 mb-2">Studio Rent</h3>
          <ComparisonBar bars={[{ label: a.metro_name, value: a.fmr_studio }, { label: b.metro_name, value: b.fmr_studio }]} format={(v) => "$" + v.toLocaleString()} />
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-600 mb-2">2-Bedroom Rent</h3>
          <ComparisonBar bars={[{ label: a.metro_name, value: a.fmr_2br }, { label: b.metro_name, value: b.fmr_2br }]} format={(v) => "$" + v.toLocaleString()} />
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-600 mb-2">Median Income</h3>
          <ComparisonBar bars={[{ label: a.metro_name, value: a.median_income }, { label: b.metro_name, value: b.median_income }]} format={(v) => "$" + v.toLocaleString()} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {[a, b].map((m) => (
          <div key={m.slug} className="border border-slate-200 rounded-xl p-5 bg-white">
            <h3 className="font-bold text-lg mb-3">{m.metro_name}</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-slate-600">Studio</dt><dd className="font-semibold">{formatCurrency(m.fmr_studio)}/mo</dd></div>
              <div className="flex justify-between"><dt className="text-slate-600">1 BR</dt><dd className="font-semibold">{formatCurrency(m.fmr_1br)}/mo</dd></div>
              <div className="flex justify-between"><dt className="text-slate-600">2 BR</dt><dd className="font-semibold">{formatCurrency(m.fmr_2br)}/mo</dd></div>
              <div className="flex justify-between"><dt className="text-slate-600">3 BR</dt><dd className="font-semibold">{formatCurrency(m.fmr_3br)}/mo</dd></div>
              <div className="flex justify-between"><dt className="text-slate-600">4 BR</dt><dd className="font-semibold">{formatCurrency(m.fmr_4br)}/mo</dd></div>
              <div className="flex justify-between border-t pt-2"><dt className="text-slate-600">Median Income</dt><dd className="font-semibold">{formatCurrency(m.median_income)}/yr</dd></div>
            </dl>
            <a href={`/metro/${m.slug}/`} className="mt-4 block text-center text-sm text-indigo-600 hover:underline border border-indigo-200 rounded-lg py-2">
              Full {m.metro_name} profile →
            </a>
          </div>
        ))}
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
        {faqs.map((faq, i) => (
          <details key={i} className="border border-slate-200 rounded-lg mb-2" open={i === 0}>
            <summary className="p-4 cursor-pointer font-medium">{faq.question}</summary>
            <div className="px-4 pb-4 text-slate-600 text-sm">{faq.answer}</div>
          </details>
        ))}
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(breadcrumbs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />
    </div>
  );
}
