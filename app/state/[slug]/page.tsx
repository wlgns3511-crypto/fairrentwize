import { getAllStates, getStateBySlug, getCountiesByState, getMetrosByState } from '@/lib/db';
import { buildDbPageRobots, buildTrustUpdatedLabel, getDataVintageLabel, getDbPageGate, getReviewedAt, getReviewedBy, METHODOLOGY_URL } from '@/lib/db-page';
import { generateStateInsights } from '@/lib/state-insights';
import { formatCurrency, formatPercent, formatNumber, getDataYear } from '@/lib/format';
import { breadcrumbSchema, faqSchema, generateStateFAQs } from '@/lib/schema';
import { AdSlot } from '@/components/AdSlot';
import { CiteButton } from '@/components/CiteButton';
import { FreshnessTag } from '@/components/FreshnessTag';
import { EditorNote } from '@/components/EditorNote';
import { DidYouKnow } from '@/components/DidYouKnow';
import { DataSourceBadge } from '@/components/DataSourceBadge';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';
import { FeedbackButton } from "@/components/FeedbackButton";
import { TrustBlock } from '@/components/upgrades/TrustBlock';
import RentCalculator from '@/components/RentCalculator';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { StateRich } from '@/components/state/StateRich';

interface Props { params: Promise<{ slug: string }> }

export const dynamicParams = false;

function buildStateTopAnswer(state: NonNullable<ReturnType<typeof getStateBySlug>>, affordableRent: number) {
  return `${state.state} renters face an average 2-bedroom fair market rent of ${formatCurrency(state.avg_rent_2br)}/month against a median household income of ${formatCurrency(state.median_income)}/year. The 30% rule implies an affordable monthly rent of about ${formatCurrency(affordableRent)}, which shows whether the statewide rent baseline is broadly manageable or already pushing households into rent burden.`;
}

export async function generateStaticParams() {
  return getAllStates().map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const state = getStateBySlug(slug);
  if (!state) return {};
  const year = getDataYear();
  const affordableRent = Math.round(state.median_income * 0.3 / 12);
  const description = buildStateTopAnswer(state, affordableRent);
  const gate = getDbPageGate({
    alternativeLinkCount: 4,
    topAnswer: description,
  });
  return {
    title: `${state.state} Fair Market Rents ${year} - Average Rent by County`,
    description,
    alternates: { canonical: `/state/${slug}/` },
    openGraph: { url: `/state/${slug}/` },
    robots: buildDbPageRobots(gate.pass),
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
  const year = getDataYear();

  const insights = generateStateInsights(state, allStates);
  const affordableRent = Math.round(state.median_income * 0.3 / 12);
  const isAffordable = affordableRent >= state.avg_rent_2br;
  const topAnswer = buildStateTopAnswer(state, affordableRent);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Dataset",
            "name": `${state.state} Fair Market Rents ${year}`,
            "description": `HUD Fair Market Rent data for ${state.state} by county and metro area. Average 1BR: ${formatCurrency(state.avg_rent_1br)}/mo, 2BR: ${formatCurrency(state.avg_rent_2br)}/mo.`,
            "url": `https://fairrentwize.com/state/${slug}/`,
            "license": "https://creativecommons.org/publicdomain/zero/1.0/",
            "creator": { "@type": "Organization", "name": "DataPeek Facts", "url": "https://datapeekfacts.com" },
            "author": { "@type": "Organization", "name": "DataPeek" },
            "temporalCoverage": String(year),
            "distribution": { "@type": "DataDownload", "encodingFormat": "text/html", "contentUrl": `https://fairrentwize.com/state/${slug}/` }
          })
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: state.state, url: `/state/${slug}/` },
      ])) }} />
      {faqs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />}

      <nav className="text-sm text-slate-500 mb-4">
        <a href="/" className="hover:text-indigo-600">Home</a> &raquo; <span>{state.state}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">{state.state} Fair Market Rents {year}</h1>
      <p className="text-slate-600 mb-3">{topAnswer}</p>

      <FreshnessTag
        source="HUD Fair Market Rents"
        updated={getReviewedAt()}
        reviewedBy={getReviewedBy()}
        dataVintage={getDataVintageLabel()}
        methodologyUrl={METHODOLOGY_URL}
      />

      <TrustBlock
        sources={[
          { name: "HUD Fair Market Rents", url: "https://www.huduser.gov/portal/datasets/fmr.html" },
          { name: "Census ACS Housing", url: "https://www.census.gov/topics/housing.html" },
          { name: "HUD User FMR Documentation", url: "https://www.huduser.gov/portal/datasets/fmr.html#documentation" },
        ]}
        updated={buildTrustUpdatedLabel()}
        reviewedBy={getReviewedBy()}
        methodologyUrl={METHODOLOGY_URL}
      />

      <section className="grid gap-4 md:grid-cols-2 mb-6">
        <article className="rounded-xl border border-slate-200 p-5">
          <h2 className="text-lg font-bold text-slate-900 mb-2">What the statewide HUD rent means</h2>
          <p className="text-sm leading-6 text-slate-600">
            State pages matter because statewide rent pressure often feels different from one county or metro to the next. The statewide average here helps you judge whether affordability pressure is broad-based or whether a few high-cost submarkets are skewing the picture.
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 p-5">
          <h2 className="text-lg font-bold text-slate-900 mb-2">How to use this page</h2>
          <p className="text-sm leading-6 text-slate-600">
            Start with the statewide average, then move into counties and metros to see where the real burden sits. If the statewide 2-bedroom rent is already above the 30% rule threshold, local variation becomes critical for any relocation or voucher search.
          </p>
        </article>
      </section>

      <p className="text-slate-600 mb-6">
        HUD Fair Market Rent data for {state.state} ({state.abbr}). Average 1-bedroom rent: {formatCurrency(state.avg_rent_1br)}/mo.
        Average 2-bedroom rent: {formatCurrency(state.avg_rent_2br)}/mo.
      </p>

      <section className="my-6 p-6 bg-gradient-to-r from-indigo-50 to-slate-50 rounded-xl border border-indigo-100">
        <h2 className="text-lg font-bold text-slate-900 mb-3">Key Insights for {state.state}</h2>
        <ul className="space-y-2">
          {insights.map((insight, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-700">
              <span className="text-indigo-500 font-bold shrink-0">&bull;</span>
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </section>

      <EditorNote note={`Fair Market Rents (FMRs) are set by HUD annually and represent the 40th percentile of gross rents in ${state.state}. They determine Housing Choice Voucher payment standards and affect millions of renters statewide.`} />

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

      {/* Rent-by-bedroom cross-link (HCU depth expansion) */}
      <section className="my-6">
        <a
          href={`/state/${slug}/rent-by-bedroom/`}
          className="block rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-slate-50 p-5 hover:border-indigo-400 hover:shadow-sm transition-all"
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                Deeper breakdown
              </div>
              <h3 className="mt-1 text-lg font-bold text-slate-900">
                {state.state} rent by bedroom &mdash; studio / 1BR / 2BR / 3BR / 4BR percentile bands across counties
              </h3>
              <p className="mt-1 text-sm text-slate-600 max-w-2xl">
                Instead of one &ldquo;average rent&rdquo; number, see the full county-level distribution
                for every bedroom size &mdash; plus the 4BR-to-studio family premium ranked across {state.state}.
              </p>
            </div>
            <span className="text-indigo-700 font-semibold shrink-0">View bedroom breakdown &rarr;</span>
          </div>
        </a>
      </section>

      <RentCalculator />

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

      <DidYouKnow fact={`In ${state.state}, ${formatPercent(state.renter_pct)} of households rent their homes. HUD updates Fair Market Rents each year using Census data and local rent surveys to keep voucher payments aligned with actual housing costs.`} />

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

      <DataSourceBadge sources={[
        { name: "HUD FMR", url: "https://www.huduser.gov/portal/datasets/fmr.html" },
        { name: "Census Bureau", url: "https://www.census.gov" },
      ]} />

      <div className="flex items-center gap-4 mt-4">
        <CiteButton title={`${state.state} Fair Market Rents`} url={`https://fairrentwize.com/state/${slug}/`} source="FairRentWize (HUD Data)" />
      </div>

      <FeedbackButton pageId={slug} />

      <CrossSiteLinks current="FairRentWize" />

      <StateRich slug={slug} state={state} />

    </>
  );
}
