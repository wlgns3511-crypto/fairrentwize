import { getAllCountySlugs, getCountyBySlug, getRelatedCounties, getStateByAbbr } from '@/lib/db';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/format';
import { breadcrumbSchema, faqSchema, generateCountyFAQs } from '@/lib/schema';
import { AdSlot } from '@/components/AdSlot';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getAllCountySlugs().map(c => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const county = getCountyBySlug(slug);
  if (!county) return {};
  return {
    title: `${county.county_name}, ${county.state} Fair Market Rent 2026`,
    description: `${county.county_name}, ${county.state} HUD FMR: Studio ${formatCurrency(county.fmr_studio)}, 1BR ${formatCurrency(county.fmr_1br)}, 2BR ${formatCurrency(county.fmr_2br)}, 3BR ${formatCurrency(county.fmr_3br)}. Median income: ${formatCurrency(county.median_income)}. Rent burden: ${formatPercent(county.rent_burden_pct)}.`,
    alternates: { canonical: `/county/${slug}/` },
    openGraph: { url: `/county/${slug}/` },
  };
}

export default async function CountyPage({ params }: Props) {
  const { slug } = await params;
  const county = getCountyBySlug(slug);
  if (!county) notFound();

  const state = getStateByAbbr(county.state);
  const related = getRelatedCounties(county.state, slug);
  const faqs = generateCountyFAQs(county);

  const affordableRent = Math.round(county.median_income * 0.3 / 12);
  const gap = county.fmr_2br - affordableRent;
  const isBurdened = county.rent_burden_pct >= 30;

  const bedroomData = [
    { label: 'Studio', value: county.fmr_studio, color: 'bg-blue-500' },
    { label: '1 Bedroom', value: county.fmr_1br, color: 'bg-indigo-500' },
    { label: '2 Bedroom', value: county.fmr_2br, color: 'bg-purple-500' },
    { label: '3 Bedroom', value: county.fmr_3br, color: 'bg-pink-500' },
    { label: '4 Bedroom', value: county.fmr_4br, color: 'bg-red-500' },
  ];
  const maxRent = Math.max(...bedroomData.map(d => d.value));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: state?.state || county.state, url: `/state/${state?.slug || ''}/` },
        { name: county.county_name, url: `/county/${slug}/` },
      ])) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />

      <nav className="text-sm text-slate-500 mb-4">
        <a href="/" className="hover:text-indigo-600">Home</a> &raquo;{' '}
        {state && <><a href={`/state/${state.slug}/`} className="hover:text-indigo-600">{state.state}</a> &raquo; </>}
        <span>{county.county_name}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">{county.county_name}, {county.state} Fair Market Rent</h1>
      <p className="text-slate-600 mb-6">
        2026 HUD Fair Market Rents for {county.county_name}, {county.state}.
        Population: {formatNumber(county.population)}. Median household income: {formatCurrency(county.median_income)}/year.
      </p>

      {/* Rent by Bedroom Size - Visual */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Fair Market Rent by Bedroom Size</h2>
        <div className="space-y-3">
          {bedroomData.map(d => (
            <div key={d.label}>
              <div className="flex justify-between text-sm mb-1">
                <span>{d.label}</span>
                <span className="font-semibold">{formatCurrency(d.value)}/mo</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-6">
                <div className={`${d.color} h-6 rounded-full`} style={{ width: `${(d.value / maxRent * 100).toFixed(0)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Affordability Analysis */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Rent Affordability Analysis</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-indigo-50 rounded-lg p-4">
            <p className="text-sm text-slate-600">Median Income</p>
            <p className="text-xl font-bold text-indigo-700">{formatCurrency(county.median_income)}/yr</p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4">
            <p className="text-sm text-slate-600">Affordable Rent (30% Rule)</p>
            <p className="text-xl font-bold text-indigo-700">{formatCurrency(affordableRent)}/mo</p>
          </div>
          <div className={`rounded-lg p-4 ${isBurdened ? 'bg-red-50' : 'bg-green-50'}`}>
            <p className="text-sm text-slate-600">Rent Burden</p>
            <p className={`text-xl font-bold ${isBurdened ? 'text-red-700' : 'text-green-700'}`}>{formatPercent(county.rent_burden_pct)}</p>
          </div>
        </div>
        {gap > 0 && (
          <p className="text-sm text-red-600 mt-3">
            A household earning the median income would need to pay {formatCurrency(gap)}/mo more than the affordable level for a 2BR unit.
          </p>
        )}
      </section>

      <AdSlot id="county-mid" />

      {/* Income Needed */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Income Needed to Rent</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="py-2 pr-4">Unit Size</th>
                <th className="py-2 pr-4 text-right">Monthly FMR</th>
                <th className="py-2 pr-4 text-right">Annual Rent</th>
                <th className="py-2 text-right">Income Needed (30% Rule)</th>
              </tr>
            </thead>
            <tbody>
              {bedroomData.map(d => (
                <tr key={d.label} className="border-b border-slate-100">
                  <td className="py-2 pr-4">{d.label}</td>
                  <td className="py-2 pr-4 text-right">{formatCurrency(d.value)}</td>
                  <td className="py-2 pr-4 text-right">{formatCurrency(d.value * 12)}</td>
                  <td className="py-2 text-right font-medium">{formatCurrency(Math.round(d.value * 12 / 0.3))}/yr</td>
                </tr>
              ))}
            </tbody>
          </table>
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

      {/* Related Counties */}
      {related.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Other Counties in {state?.state || county.state}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {related.map(r => (
              <a key={r.slug} href={`/county/${r.slug}/`} className="p-3 border border-slate-200 rounded-lg hover:border-indigo-300">
                <p className="font-medium">{r.county_name}</p>
                <p className="text-slate-500">2BR: {formatCurrency(r.fmr_2br)}/mo</p>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* High-CPC footer */}
      <div className="bg-blue-50 rounded-lg p-6 text-sm">
        <h2 className="font-semibold mb-3 text-blue-900">Looking for Housing in {county.county_name}?</h2>
        <div className="grid md:grid-cols-2 gap-3 text-blue-800">
          <p>Search apartment listings near {county.county_name}</p>
          <p>Compare renters insurance quotes for {county.state}</p>
          <p>Get moving company estimates for your area</p>
          <p>Explore rent-to-own programs in {county.state}</p>
          <p>Find housing assistance programs nearby</p>
          <p>Check <a href="https://costbycity.com" className="underline">local cost of living data</a></p>
        </div>
      </div>
    </>
  );
}
