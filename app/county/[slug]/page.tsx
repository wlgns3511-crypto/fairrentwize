import { getAllCountySlugs, getCountyBySlug, getRelatedCounties, getStateByAbbr, type County } from '@/lib/db';
import { buildDbPageRobots, buildTrustUpdatedLabel, getDataVintageLabel, getDbPageGate, getReviewedAt, getReviewedBy, METHODOLOGY_URL } from '@/lib/db-page';
import { formatCurrency, formatPercent, formatNumber, getDataYear } from '@/lib/format';
import { breadcrumbSchema, faqSchema } from '@/lib/schema';
import { generateAutoFaqs } from '@/lib/auto-faqs';
import { AdSlot } from '@/components/AdSlot';
import RentCalculator from '@/components/RentCalculator';
import { RentAffordabilityCheck } from '@/components/tools/RentAffordabilityCheck';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { FreshnessTag } from '@/components/FreshnessTag';
import { TrustBlock } from '@/components/upgrades/TrustBlock';
import { InsightBlock } from '@/components/upgrades/InsightBlock';
import { RelatedEntities } from '@/components/upgrades/RelatedEntities';
import { getCountyInsights } from '@/lib/insights';
import { TableOfContents } from '@/components/upgrades/TableOfContents';
import { DataSuppressedNotice } from '@/components/DataSuppressedNotice';
import { getAllCountyCommentary } from '@/lib/rent-commentary';
import { getCountyVsNational, getMoeFlag, NATIONAL_AVG_2BR } from '@/lib/county-facts';

interface Props { params: Promise<{ slug: string }> }

export const dynamicParams = false;

function buildCountyTopAnswer(county: County, affordableRent: number | null) {
  const segments: string[] = [];
  if (county.fmr_2br !== null) {
    segments.push(`${county.county_name}, ${county.state_abbr} has a 2-bedroom HUD Fair Market Rent of ${formatCurrency(county.fmr_2br)}/month`);
  } else {
    segments.push(`${county.county_name}, ${county.state_abbr} HUD Fair Market Rent statistics`);
  }
  if (county.acs_median_household_income !== null) {
    segments[0] += ` and a median household income of ${formatCurrency(county.acs_median_household_income)}/year`;
  }
  segments[0] += '.';
  if (affordableRent !== null) {
    segments.push(`The 30% rule implies an affordable monthly rent of about ${formatCurrency(affordableRent)}, which lets you judge whether HUD's posted FMR aligns with what a median earner can sustainably pay.`);
  }
  return segments.join(' ');
}

export async function generateStaticParams() {
  return getAllCountySlugs().map(c => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const county = getCountyBySlug(slug);
  if (!county) return {};
  const year = getDataYear();
  const affordableRent = county.acs_median_household_income !== null
    ? Math.round(county.acs_median_household_income * 0.3 / 12)
    : null;
  // RANGE: efficiency/studio (low) vs 4BR (high) HUD fair market rent
  const low = county.fmr_studio !== null ? Math.round(county.fmr_studio) : null;
  const high = county.fmr_4br !== null ? Math.round(county.fmr_4br) : null;
  const range = (low !== null && high !== null)
    ? `: $${low.toLocaleString()}–$${high.toLocaleString()}/mo`
    : '';
  const title = `${county.county_name}, ${county.state_abbr} Fair Market Rent ${year}${range}`;
  const description = buildCountyTopAnswer(county, affordableRent);
  const gate = getDbPageGate({
    alternativeLinkCount: 4,
    topAnswer: description,
  });
  return {
    title,
    description,
    alternates: { canonical: `/county/${slug}/` },
    openGraph: { title, description, url: `/county/${slug}/` },
    robots: buildDbPageRobots(gate.pass),
  };
}

export default async function CountyPage({ params }: Props) {
  const { slug } = await params;
  const county = getCountyBySlug(slug);
  if (!county) notFound();
  const year = getDataYear();

  const state = getStateByAbbr(county.state_abbr);
  const related = getRelatedCounties(county.state_abbr, slug, 8);
  const faqs = generateAutoFaqs(county);

  const affordableRent = county.acs_median_household_income !== null
    ? Math.round(county.acs_median_household_income * 0.3 / 12)
    : null;
  const gap = (county.fmr_2br !== null && affordableRent !== null) ? county.fmr_2br - affordableRent : null;
  const isBurdened = county.acs_rent_burdened_pct !== null && county.acs_rent_burdened_pct >= 30;
  const topAnswer = buildCountyTopAnswer(county, affordableRent);

  const bedroomData = [
    { label: 'Studio', value: county.fmr_studio, color: 'bg-blue-500' },
    { label: '1 Bedroom', value: county.fmr_1br, color: 'bg-indigo-500' },
    { label: '2 Bedroom', value: county.fmr_2br, color: 'bg-purple-500' },
    { label: '3 Bedroom', value: county.fmr_3br, color: 'bg-pink-500' },
    { label: '4 Bedroom', value: county.fmr_4br, color: 'bg-red-500' },
  ];
  const validValues = bedroomData.map(d => d.value).filter((v): v is number => v !== null);
  const maxRent = validValues.length > 0 ? Math.max(...validValues) : 1;

  const commentary = getAllCountyCommentary(county, state ?? null);
  const vsNational = getCountyVsNational(county);
  const moe = getMoeFlag(county);

  // Layer 3: build the suppressed-fields list (only when truly missing — not just thin)
  const suppressedReasons: string[] = [];
  if (county.fmr_2br === null) suppressedReasons.push('2-bedroom HUD FMR');
  if (county.acs_median_household_income === null) suppressedReasons.push('median household income');
  if (county.acs_rent_burdened_pct === null) suppressedReasons.push('rent-burdened share');
  const suppressedSource: 'HUD FMR' | 'Census ACS 2023 5-Year' | 'multiple' =
    suppressedReasons.length === 0
      ? 'HUD FMR'
      : suppressedReasons.includes('2-bedroom HUD FMR') && suppressedReasons.length > 1
        ? 'multiple'
        : suppressedReasons.includes('2-bedroom HUD FMR')
          ? 'HUD FMR'
          : 'Census ACS 2023 5-Year';

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: state?.state || county.state_abbr, url: `/state/${state?.slug || ''}/` },
        { name: county.county_name, url: `/county/${slug}/` },
      ])) }} />
      {faqs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />}

      <nav className="text-sm text-slate-500 mb-4">
        <a href="/" className="hover:text-indigo-600">Home</a> &raquo;{' '}
        {state && <><a href={`/state/${state.slug}/`} className="hover:text-indigo-600">{state.state}</a> &raquo; </>}
        <span>{county.county_name}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">{county.county_name}, {county.state_abbr} Fair Market Rent</h1>
      <p className="text-slate-600 mb-3">{topAnswer}</p>

      <FreshnessTag
        source="HUD Fair Market Rents"
        updated={getReviewedAt()}
        reviewedBy={getReviewedBy()}
        dataVintage={getDataVintageLabel()}
        methodologyUrl={METHODOLOGY_URL}
      />

      <p className="text-slate-600 mb-6">
        HUD FY {year} Fair Market Rents for {county.county_name}, {county.state_abbr}.
        {county.acs_total_occupied_units !== null && ` Occupied housing units: ${formatNumber(county.acs_total_occupied_units)}.`}
        {county.acs_median_household_income !== null && ` Median household income: ${formatCurrency(county.acs_median_household_income)}/year.`}
      </p>

      {/* Layer 2: status × slot × variant intro */}
      <section className="mb-6 rounded-xl border border-slate-200 bg-slate-50/40 p-5">
        <p className="text-sm leading-7 text-slate-700">{commentary.intro}</p>
      </section>

      {suppressedReasons.length > 0 && (
        <DataSuppressedNotice
          reasons={suppressedReasons}
          source={suppressedSource}
          fallbackHref={state ? `/state/${state.slug}/` : undefined}
          fallbackLabel={state ? `See ${state.state} state-level figures` : undefined}
        />
      )}

      <TableOfContents />

      {/* Rent by Bedroom Size - Visual */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Fair Market Rent by Bedroom Size</h2>
        <div className="space-y-3">
          {bedroomData.map(d => (
            <div key={d.label}>
              <div className="flex justify-between text-sm mb-1">
                <span>{d.label}</span>
                <span className="font-semibold">{d.value !== null ? `${formatCurrency(d.value)}/mo` : '—'}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-6">
                <div className={`${d.color} h-6 rounded-full`} style={{ width: d.value !== null ? `${(d.value / maxRent * 100).toFixed(0)}%` : '0%' }} />
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
            <p className="text-xl font-bold text-indigo-700">
              {county.acs_median_household_income !== null ? `${formatCurrency(county.acs_median_household_income)}/yr` : '—'}
            </p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4">
            <p className="text-sm text-slate-600">Affordable Rent (30% Rule)</p>
            <p className="text-xl font-bold text-indigo-700">
              {affordableRent !== null ? `${formatCurrency(affordableRent)}/mo` : '—'}
            </p>
          </div>
          <div className={`rounded-lg p-4 ${isBurdened ? 'bg-red-50' : 'bg-green-50'}`}>
            <p className="text-sm text-slate-600">Rent Burden</p>
            <p className={`text-xl font-bold ${isBurdened ? 'text-red-700' : 'text-green-700'}`}>
              {county.acs_rent_burdened_pct !== null ? formatPercent(county.acs_rent_burdened_pct) : '—'}
            </p>
          </div>
        </div>
        {gap !== null && gap > 0 && (
          <p className="text-sm text-red-600 mt-3">
            A household earning the median income would need to pay {formatCurrency(gap)}/mo more than the affordable level for a 2BR unit.
          </p>
        )}
        <p className="mt-4 text-sm leading-7 text-slate-700">{commentary.affordability}</p>
      </section>

      {/* Layer 2: vs-national context for the 2BR FMR */}
      {vsNational && (
        <section className="mb-8 rounded-xl border border-indigo-100 bg-indigo-50/40 p-5">
          <h2 className="text-lg font-bold text-slate-900 mb-2">How {county.county_name} compares to the US average</h2>
          <p className="text-sm leading-7 text-slate-700">
            The national 2-bedroom HUD FMR for FY{year} averages{' '}
            <span className="font-semibold">{formatCurrency(NATIONAL_AVG_2BR)}/mo</span>. {county.county_name}&rsquo;s{' '}
            {county.fmr_2br !== null ? formatCurrency(county.fmr_2br) : '—'}/mo runs{' '}
            <span className="font-semibold">{Math.abs(vsNational.pctDiff)}%</span>{' '}
            {vsNational.diff >= 0 ? 'above' : 'below'} that benchmark.
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-700">{commentary.comparison}</p>
        </section>
      )}

      <AdSlot id="county-mid" />

      <RentAffordabilityCheck
        countyName={county.county_name}
        fmr={{
          studio: county.fmr_studio ?? 0,
          br1: county.fmr_1br ?? 0,
          br2: county.fmr_2br ?? 0,
          br3: county.fmr_3br ?? 0,
          br4: county.fmr_4br ?? 0,
        }}
      />

      <RentCalculator />

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
                  <td className="py-2 pr-4 text-right">{d.value !== null ? formatCurrency(d.value * 12) : '—'}</td>
                  <td className="py-2 text-right font-medium">{d.value !== null ? `${formatCurrency(Math.round(d.value * 12 / 0.3))}/yr` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Layer 2: outlook — practical takeaway, last block before sources */}
      <section className="mb-8 rounded-xl border border-slate-200 p-5">
        <h2 className="text-lg font-bold text-slate-900 mb-2">What this means for renters in {county.county_name}</h2>
        <p className="text-sm leading-7 text-slate-700">{commentary.outlook}</p>
        {moe.isWideMoe && (
          <p className="mt-2 text-xs text-slate-500">
            Note: ACS 2023 5-Year median rent estimate for {county.county_name} carries a wide margin of error
            ({moe.relativeMoe?.toFixed(0)}% relative MOE). Treat the rent-burden percentage as directional rather than precise.
          </p>
        )}
      </section>

      <TrustBlock
        sources={[
          { name: "HUD Fair Market Rents", url: "https://www.huduser.gov/portal/datasets/fmr.html" },
          { name: "Census ACS 2023 5-Year (B25008/B25070/B19013)", url: "https://www.census.gov/topics/housing.html" },
        ]}
        updated={buildTrustUpdatedLabel()}
        reviewedBy={getReviewedBy()}
        methodologyUrl={METHODOLOGY_URL}
      />

      <InsightBlock entityName={county.county_name} insights={getCountyInsights(county)} />

      {/* FAQs */}
      {faqs.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
          {faqs.map((faq, i) => (
            <div key={i} className="mb-4">
              <h3 className="font-semibold text-slate-900">{faq.question}</h3>
              <p className="text-sm text-slate-600 mt-1">{faq.answer}</p>
            </div>
          ))}
        </section>
      )}

      <RelatedEntities
        entityName={county.county_name}
        heading={`Other counties in ${state?.state || county.state_abbr}`}
        statLabel="2BR FMR"
        items={related.map((r) => ({
          name: r.county_name,
          href: `/county/${r.slug}/`,
          stat: `${formatCurrency(r.fmr_2br)}/mo`,
        }))}
      />

      {/* High-CPC footer */}
      <div className="bg-blue-50 rounded-lg p-6 text-sm">
        <h2 className="font-semibold mb-3 text-blue-900">Looking for Housing in {county.county_name}?</h2>
        <div className="grid md:grid-cols-2 gap-3 text-blue-800">
          <p>Search apartment listings near {county.county_name}</p>
          <p>Compare renters insurance quotes for {county.state_abbr}</p>
          <p>Get moving company estimates for your area</p>
          <p>Explore rent-to-own programs in {county.state_abbr}</p>
          <p>Find housing assistance programs nearby</p>
          <p>Check <a href="https://costbycity.com" className="underline">local cost of living data</a></p>
        </div>
      </div>
    </>
  );
}
