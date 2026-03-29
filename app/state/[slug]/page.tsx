import { getAllStates, getStateBySlug, getCountiesByState, getMetrosByState } from '@/lib/db';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/format';
import { breadcrumbSchema, faqSchema, generateStateFAQs } from '@/lib/schema';
import { AdSlot } from '@/components/AdSlot';
import { CiteButton } from '@/components/CiteButton';
import { FreshnessTag } from '@/components/FreshnessTag';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getAllStates().map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const state = getStateBySlug(slug);
  if (!state) return {};
  return {
    title: `${state.state} Fair Market Rents 2026 - Average Rent by County`,
    description: `${state.state} FMR data: avg 1BR ${formatCurrency(state.avg_rent_1br)}/mo, 2BR ${formatCurrency(state.avg_rent_2br)}/mo. Browse rent by county, metro, and bedroom size. Tenant rights score: ${state.tenant_rights_score}/10.`,
    alternates: { canonical: `/state/${slug}/` },
  };
}

export default async function StatePage({ params }: Props) {
  const { slug } = await params;
  const state = getStateBySlug(slug);
  if (!state) notFound();

  const counties = getCountiesByState(state.abbr);
  const metros = getMetrosByState(state.abbr);
  const faqs = generateStateFAQs(state);
  const allStates = getAllStates();

  const affordableRent = Math.round(state.median_income * 0.3 / 12);
  const isAffordable = affordableRent >= state.avg_rent_2br;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Dataset",
            "name": `${state.state} Fair Market Rents 2026`,
            "description": `HUD Fair Market Rent data for ${state.state} by county and metro area. Average 1BR: ${formatCurrency(state.avg_rent_1br)}/mo, 2BR: ${formatCurrency(state.avg_rent_2br)}/mo.`,
            "url": `https://fairrentwize.com/state/${slug}/`,
            "license": "https://creativecommons.org/publicdomain/zero/1.0/",
            "creator": { "@type": "Organization", "name": "DataPeek Facts", "url": "https://datapeekfacts.com" },
            "temporalCoverage": "2024/2026",
            "distribution": { "@type": "DataDownload", "encodingFormat": "text/html" }
          })
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: state.state, url: `/state/${slug}/` },
      ])) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />

      <nav className="text-sm text-slate-500 mb-4">
        <a href="/" className="hover:text-indigo-600">Home</a> &raquo; <span>{state.state}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">{state.state} Fair Market Rents 2026</h1>
      <p className="text-slate-600 mb-6">
        HUD Fair Market Rent data for {state.state} ({state.abbr}). Average 1-bedroom rent: {formatCurrency(state.avg_rent_1br)}/mo.
        Average 2-bedroom rent: {formatCurrency(state.avg_rent_2br)}/mo.
      </p>

      {/* State Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-slate-600">Avg 1BR Rent</p>
          <p className="text-xl font-bold text-indigo-700">{formatCurrency(state.avg_rent_1br)}/mo</p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-slate-600">Avg 2BR Rent</p>
          <p className="text-xl font-bold text-indigo-700">{formatCurrency(state.avg_rent_2br)}/mo</p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-slate-600">Median Income</p>
          <p className="text-xl font-bold text-indigo-700">{formatCurrency(state.median_income)}</p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-slate-600">Tenant Rights</p>
          <p className="text-xl font-bold text-indigo-700">{state.tenant_rights_score}/10</p>
        </div>
      </div>

      {/* Affordability Analysis */}
      <div className={`rounded-lg p-4 mb-8 ${isAffordable ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <h2 className="font-semibold mb-1">{isAffordable ? 'Rent is Generally Affordable' : 'Rent May Be a Burden'}</h2>
        <p className="text-sm text-slate-700">
          At the median income of {formatCurrency(state.median_income)}/year, the 30% rule suggests spending up to {formatCurrency(affordableRent)}/mo on rent.
          The average 2BR rent of {formatCurrency(state.avg_rent_2br)}/mo is {isAffordable ? 'within' : 'above'} this threshold.
        </p>
      </div>

      {/* Renter Stats */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Renter Statistics</h2>
        <p className="text-sm text-slate-600">{formatPercent(state.renter_pct)} of households in {state.state} are renters.</p>
      </div>

      {/* Metro Areas */}
      {metros.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">{state.state} Metro Areas</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="py-2 pr-4">Metro Area</th>
                  <th className="py-2 pr-4 text-right">Studio</th>
                  <th className="py-2 pr-4 text-right">1BR</th>
                  <th className="py-2 pr-4 text-right">2BR</th>
                  <th className="py-2 text-right">Vacancy</th>
                </tr>
              </thead>
              <tbody>
                {metros.map(m => (
                  <tr key={m.slug} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 pr-4"><a href={`/metro/${m.slug}/`} className="text-indigo-600 hover:underline">{m.metro_name}</a></td>
                    <td className="py-2 pr-4 text-right">{formatCurrency(m.fmr_studio)}</td>
                    <td className="py-2 pr-4 text-right">{formatCurrency(m.fmr_1br)}</td>
                    <td className="py-2 pr-4 text-right font-medium">{formatCurrency(m.fmr_2br)}</td>
                    <td className="py-2 text-right">{m.vacancy_rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <AdSlot id="state-mid" />

      {/* Counties */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">{state.state} Counties - Fair Market Rents</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="py-2 pr-4">County</th>
                <th className="py-2 pr-4 text-right">Studio</th>
                <th className="py-2 pr-4 text-right">1BR</th>
                <th className="py-2 pr-4 text-right">2BR</th>
                <th className="py-2 pr-4 text-right">3BR</th>
                <th className="py-2 pr-4 text-right">Income</th>
                <th className="py-2 text-right">Burden</th>
              </tr>
            </thead>
            <tbody>
              {counties.map(c => (
                <tr key={c.slug} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2 pr-4"><a href={`/county/${c.slug}/`} className="text-indigo-600 hover:underline">{c.county_name}</a></td>
                  <td className="py-2 pr-4 text-right">{formatCurrency(c.fmr_studio)}</td>
                  <td className="py-2 pr-4 text-right">{formatCurrency(c.fmr_1br)}</td>
                  <td className="py-2 pr-4 text-right font-medium">{formatCurrency(c.fmr_2br)}</td>
                  <td className="py-2 pr-4 text-right">{formatCurrency(c.fmr_3br)}</td>
                  <td className="py-2 pr-4 text-right">{formatCurrency(c.median_income)}</td>
                  <td className="py-2 text-right">{formatPercent(c.rent_burden_pct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Compare with other states */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Compare {state.state} Rents</h2>
        <div className="flex flex-wrap gap-2 text-sm">
          {allStates.filter(s => s.abbr !== state.abbr).slice(0, 15).map(s => (
            <a key={s.abbr} href={`/compare/${state.slug}-vs-${s.slug}/`} className="px-3 py-1 bg-slate-100 rounded-full hover:bg-indigo-100 hover:text-indigo-700">
              {state.abbr} vs {s.abbr}
            </a>
          ))}
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

      <FreshnessTag source="HUD Fair Market Rents" />

      <div className="flex items-center gap-4 mt-4">
        <CiteButton title={`${state.state} Fair Market Rents`} url={`https://fairrentwize.com/state/${slug}/`} source="FairRentWize (HUD Data)" />
      </div>

      {/* Related Data Resources */}
      <section className="mt-8 p-4 bg-slate-50 rounded-lg">
        <h3 className="text-sm font-semibold text-slate-500 mb-2">Related Data Resources</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <a href="https://propertytaxpeek.com" className="text-indigo-600 hover:underline">PropertyTaxPeek - Property tax rates &rarr;</a>
          <a href="https://costbycity.com" className="text-indigo-600 hover:underline">CostByCity - Cost of living &rarr;</a>
          <a href="https://zippeek.com" className="text-indigo-600 hover:underline">ZipPeek - ZIP code demographics &rarr;</a>
        </div>
      </section>
    </>
  );
}
