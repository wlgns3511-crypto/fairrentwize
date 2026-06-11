import { getAllStates, getStateBySlug, getCountiesByState, getMetrosByState, type StateRow } from '@/lib/db';
import { buildDbPageRobots, buildTrustUpdatedLabel, getDataVintageLabel, getDbPageGate, getReviewedAt, getReviewedBy, METHODOLOGY_URL } from '@/lib/db-page';
import { generateStateInsights } from '@/lib/state-insights';
import { formatCurrency, formatPercent, getDataYear } from '@/lib/format';
import { breadcrumbSchema, faqSchema, generateStateFAQs, statePageJsonLd } from '@/lib/schema';
import { AdSlot } from '@/components/AdSlot';
import { CiteButton } from '@/components/CiteButton';
import { FreshnessTag } from '@/components/FreshnessTag';
import { EditorNote } from '@/components/EditorNote';
import { DidYouKnow } from '@/components/DidYouKnow';
import { DataSourceBadge } from '@/components/DataSourceBadge';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';
import { AuthorBox } from '@/components/AuthorBox';
import { STATE_VINTAGE } from '@/lib/authorship';
import { FeedbackButton } from "@/components/FeedbackButton";
import { TrustBlock } from '@/components/upgrades/TrustBlock';
import { RentAffordabilityCheck } from '@/components/tools/RentAffordabilityCheck';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { StateRich } from '@/components/state/StateRich';
import { DataSuppressedNotice } from '@/components/DataSuppressedNotice';
import { getAllStateCommentary } from '@/lib/rent-commentary';
import { getNationalContext, getWageGap } from '@/lib/state-facts';
import { classifyRentBurdenTier } from '@/lib/rent-burden-tier';
import { classifyStateOorMultiple } from '@/lib/oor-housing-wage-multiple';
import { classifyStateFmrVariance } from '@/lib/fmr-county-variance-tier';
import { getFairRentInterpretation } from '@/lib/fairrent-interpretation';
import { FairRentInterpretation } from '@/components/FairRentInterpretation';
import { SOURCE_AUTHORITIES, PUBLISHER, EDITORIAL_TEAM } from '@/lib/authorship';
import { datasetSchema } from '@/lib/schema';
import { decodeStateCrosswalk, trimEntityForTitle, fairRentMultiCreatorDatasetSchema } from '@/lib/crosswalk-rent';
import { CrosswalkBridge } from '@/components/upgrades/CrosswalkBridge';
import { decodeFmrMarketGap } from '@/lib/fmr-market-gap';
import { FmrMarketGapBlock } from '@/components/upgrades/FmrMarketGapBlock';
import { StateHeroImage } from '@/components/StateHeroImage';
import { getStateImageByName } from '@/lib/state-images';

interface Props { params: Promise<{ slug: string }> }

export const dynamicParams = false;

function buildStateTopAnswer(state: StateRow, affordableRent: number | null): string {
  const parts: string[] = [];
  if (state.fmr_2br !== null) {
    parts.push(`${state.state} renters face an average 2-bedroom HUD Fair Market Rent of ${formatCurrency(state.fmr_2br)}/month`);
  } else {
    parts.push(`${state.state} HUD Fair Market Rent statistics`);
  }
  if (state.acs_median_household_income !== null) {
    parts[0] += ` against a median household income of ${formatCurrency(state.acs_median_household_income)}/year`;
  }
  parts[0] += '.';
  if (affordableRent !== null) {
    parts.push(`The 30% affordability rule implies a sustainable monthly rent of about ${formatCurrency(affordableRent)}, making this page a quick gauge of whether statewide rent levels are within reach for a median earner.`);
  }
  return parts.join(' ');
}

export async function generateStaticParams() {
  return getAllStates().map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const state = getStateBySlug(slug);
  if (!state) return {};
  const affordableRent = state.acs_median_household_income !== null
    ? Math.round(state.acs_median_household_income * 0.3 / 12)
    : null;
  const description = buildStateTopAnswer(state, affordableRent);
  const gate = getDbPageGate({
    alternativeLinkCount: 4,
    topAnswer: description,
  });
  // P1 verdict-in-title: `{StateShort} {Score}/100 — {VerdictShort}` ≤60 chars.
  // Use title.absolute to bypass layout template "%s | FairRentWize" suffix
  // (canonical URL carries the brand; verdict + score is the SERP signal).
  const crosswalk = decodeStateCrosswalk(state.abbr);
  const title = crosswalk
    ? { absolute: `${trimEntityForTitle(state.state)} ${crosswalk.composedScore}/100 — ${crosswalk.verdictShort}` }
    : `${state.state} Fair Market Rents ${getDataYear()} - Average Rent by County`;
  return {
    title,
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
  const affordableRent = state.acs_median_household_income !== null
    ? Math.round(state.acs_median_household_income * 0.3 / 12)
    : null;
  const isAffordable = affordableRent !== null && state.fmr_2br !== null && affordableRent >= state.fmr_2br;
  const topAnswer = buildStateTopAnswer(state, affordableRent);

  const commentary = getAllStateCommentary(state, allStates);
  const nationalCtx = getNationalContext(allStates);
  const wageGap = getWageGap(state);

  const burdenTier = classifyRentBurdenTier({
    fmr2br: state.fmr_2br,
    medianHouseholdIncome: state.acs_median_household_income,
    geographyName: state.state,
    geographyKind: 'state',
  });

  // PSU 1차 2026-05-12 — three-lever composite. OOR Multiple +
  // FMR County Variance + FairRent Interpretation surface atop
  // the 0차 RentBurdenTier baseline.
  const oorMultiple = classifyStateOorMultiple(state.abbr);
  const fmrVariance = classifyStateFmrVariance(state.abbr);
  const fairRentInterp = getFairRentInterpretation(state.abbr);
  // Phase 7 P0 wrapper — single source of truth for verdict score + multi-creator schema.
  const crosswalk = decodeStateCrosswalk(state.abbr);

  const stateSuppressedReasons: string[] = [];
  if (state.fmr_2br === null) stateSuppressedReasons.push('state-aggregate 2BR FMR');
  if (state.acs_median_household_income === null) stateSuppressedReasons.push('median household income');
  if (state.nlihc_housing_wage_2br === null) stateSuppressedReasons.push('NLIHC housing wage');

  return (
    <>
      {statePageJsonLd(state).map((node, i) => (
        <script
          key={`state-jsonld-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }}
        />
      ))}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: state.state, url: `/state/${slug}/` },
      ])) }} />
      {faqs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />}

      <nav className="text-sm text-slate-500 mb-4">
        <a href="/" className="hover:text-indigo-600">Home</a> &raquo; <span>{state.state}</span>
      </nav>

      {(() => { const stateImage = getStateImageByName(state.state); return stateImage ? <StateHeroImage img={stateImage} /> : null; })()}

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
          { name: "Census ACS 2023 5-Year (B25008/B25070/B19013)", url: "https://www.census.gov/topics/housing.html" },
          { name: "NLIHC Out of Reach 2025", url: "https://nlihc.org/oor" },
        ]}
        updated={buildTrustUpdatedLabel()}
        reviewedBy={getReviewedBy()}
        methodologyUrl={METHODOLOGY_URL}
      />

      {/* Per-lever dataset JSON-LD (Trap #105 per-call creator override). */}
      {oorMultiple && oorMultiple.confidence === 'high' && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(datasetSchema({
              title: `NLIHC Housing Wage Multiple — ${state.state}`,
              description: `NLIHC Out of Reach 2025 housing wage ($${oorMultiple.housingWage2BR.toFixed(2)}/hr) compared to mean renter wage ($${oorMultiple.meanRenterWage.toFixed(2)}/hr) for ${state.state}. 5-tier classifier indicates how far the renter sub-population's wage covers HUD FY 2025 FMR 2BR within the HUD 30% cost-burden threshold.`,
              url: `/state/${state.slug}/#fairrent-interpretation`,
              reviewedAt: STATE_VINTAGE,
              spatialName: state.state,
              creator: { name: 'National Low Income Housing Coalition', url: 'https://nlihc.org/oor' },
              variableMeasured: [
                'NLIHC OOR 2025 Housing Wage 2BR (USD/hour)',
                'NLIHC OOR 2025 Mean Renter Wage (USD/hour)',
                'Housing Wage / Mean Renter Wage Multiple',
                'OOR Multiple Tier (A–E)',
              ],
            })),
          }}
        />
      )}
      {fmrVariance && fmrVariance.confidence === 'high' && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(datasetSchema({
              title: `FMR County Variance — ${state.state}`,
              description: `Within-state coefficient of variation of HUD FY 2025 Fair Market Rent 2BR across ${fmrVariance.countyCount} counties of ${state.state}. 5-tier classifier indicates whether the state-level FMR aggregate hides a coastal/metro vs. balance-of-state split.`,
              url: `/state/${state.slug}/#fairrent-interpretation`,
              reviewedAt: STATE_VINTAGE,
              spatialName: state.state,
              creator: { name: SOURCE_AUTHORITIES[0].name, url: SOURCE_AUTHORITIES[0].url },
              variableMeasured: [
                'HUD FY 2025 FMR 2BR (USD, county-level)',
                'Within-State FMR 2BR Coefficient of Variation (%)',
                'Min/Max/Mean FMR 2BR (USD)',
                'FMR Variance Tier (A–E)',
              ],
              backedRowCount: fmrVariance.countyCount,
            })),
          }}
        />
      )}
      {fairRentInterp && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(datasetSchema({
              title: `FairRent Composite Verdict — ${state.state}`,
              description: `Three-lever composite verdict for ${state.state}: RentBurdenTier ${fairRentInterp.inputs.rentBurdenTier} × OOR Multiple ${fairRentInterp.inputs.oorMultipleTier} × FMR County Variance ${fairRentInterp.inputs.fmrVarianceTier}, classified into one of six mutually exclusive DominantSignal categories.`,
              url: `/state/${state.slug}/#fairrent-interpretation`,
              reviewedAt: STATE_VINTAGE,
              spatialName: state.state,
              creator: { name: SOURCE_AUTHORITIES[0].name, url: SOURCE_AUTHORITIES[0].url },
              variableMeasured: [
                'RentBurdenTier (A–E)',
                'OOR Housing Wage Multiple Tier (A–E)',
                'FMR County Variance Tier (A–E)',
                'FairRent DominantSignal Category',
              ],
            })),
          }}
        />
      )}

      {/* RentBurdenTier — composing HUD FMR 2BR × ACS B19013 median income */}
      {burdenTier.confidence !== 'insufficient-data' && (
        <section
          className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/60 p-5"
          data-upgrade="rent-burden-tier"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
            <h2 className="text-lg font-bold text-emerald-900">
              {state.state} RentBurdenTier: <span className="font-mono">Tier {burdenTier.tier}</span> &mdash; {burdenTier.label}
            </h2>
            <span className="text-sm font-semibold text-emerald-700">
              {burdenTier.burdenPct.toFixed(1)}% of median income
            </span>
          </div>
          <p className="text-sm leading-7 text-slate-700">{burdenTier.rationale}</p>
          <p className="mt-3 text-xs text-slate-600">
            Cutoffs: A &lt;18% &middot; B 18&ndash;22% &middot; C 22&ndash;26% &middot; D 26&ndash;30% &middot; E &ge;30% (HUD federal cost-burden threshold, 24 CFR 5.628 / 42 USC 1437a).{' '}
            Read the RentBurdenTier methodology &rarr;
          </p>
        </section>
      )}

      {(() => {
        const fmrGap = decodeFmrMarketGap(state.fmr_2br, state.acs_median_rent_2br);
        return fmrGap ? <FmrMarketGapBlock result={fmrGap} areaName={state.state} /> : null;
      })()}

      {/* OOR Housing Wage Multiple — NLIHC OOR 2025 labor-market gap */}
      {oorMultiple && oorMultiple.confidence === 'high' && (
        <section
          className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50/60 p-5"
          data-upgrade="oor-housing-wage-multiple"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
            <h2 className="text-lg font-bold text-indigo-900">
              {state.state} OOR Multiple: <span className="font-mono">Tier {oorMultiple.tier}</span> &mdash; {oorMultiple.label}
            </h2>
            <span className="text-sm font-semibold text-indigo-700">
              {oorMultiple.multiple.toFixed(2)}× &middot; {oorMultiple.hoursPerWeekAt40} hrs/wk at mean renter wage
            </span>
          </div>
          <p className="text-sm leading-7 text-slate-700">{oorMultiple.rationale}</p>
          <p className="mt-3 text-xs text-slate-600">
            Cutoffs: A &lt;1.10× &middot; B 1.10&ndash;1.25× &middot; C 1.25&ndash;1.45× &middot; D 1.45&ndash;1.65× &middot; E &ge;1.65× (NLIHC Out of Reach 2025; DOL FLSA federal min wage $7.25/hr at {oorMultiple.hoursPerWeekAtFedMinWage} hrs/wk).{' '}
            Read the OOR Multiple methodology &rarr;
          </p>
        </section>
      )}

      {/* FMR County Variance — within-state HUD FMR 2BR CoV */}
      {fmrVariance && fmrVariance.confidence === 'high' && (
        <section
          className="mb-6 rounded-xl border border-sky-200 bg-sky-50/60 p-5"
          data-upgrade="fmr-county-variance"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
            <h2 className="text-lg font-bold text-sky-900">
              {state.state} FMR Variance: <span className="font-mono">Tier {fmrVariance.tier}</span> &mdash; {fmrVariance.label}
            </h2>
            <span className="text-sm font-semibold text-sky-700">
              CoV {fmrVariance.covPct.toFixed(1)}% &middot; {fmrVariance.countyCount} counties &middot; ${fmrVariance.minFmr2br.toLocaleString()}&ndash;${fmrVariance.maxFmr2br.toLocaleString()}
            </span>
          </div>
          <p className="text-sm leading-7 text-slate-700">{fmrVariance.dispersionRationale}</p>
          <p className="mt-3 text-xs text-slate-600">
            Cutoffs: A &lt;11% &middot; B 11&ndash;15% &middot; C 15&ndash;20% &middot; D 20&ndash;28% &middot; E &ge;28% (HUD FY 2025 FMR-2BR coefficient of variation within state, ≥3 counties required).{' '}
            Read the FMR County Variance methodology &rarr;
          </p>
        </section>
      )}

      {/* FairRent composite verdict — atop the three levers above */}
      {fairRentInterp && <FairRentInterpretation interpretation={fairRentInterp} />}

      {/* Phase 7 P4 multi-creator dataset schema — HUD + Census + NLIHC + Congress */}
      {crosswalk && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              fairRentMultiCreatorDatasetSchema({
                name: `FairRent Crosswalk — ${state.state}`,
                description: crosswalk.decoderNotes,
                url: `/state/${state.slug}/`,
                spatialName: state.state,
                reviewedAt: STATE_VINTAGE,
                composedScore: crosswalk.composedScore,
                verdict: crosswalk.verdictShort,
              }),
            ),
          }}
        />
      )}

      {/* Phase 7 P5 cross-walk bridge — county-FIPS join cohort */}
      <CrosswalkBridge
        entityName={state.state}
        entitySlug={slug}
        entityKind="state"
      />

      {/* Layer 2: status-aware intro */}
      <section className="mb-6 rounded-xl border border-slate-200 bg-slate-50/40 p-5">
        <p className="text-sm leading-7 text-slate-700">{commentary.intro}</p>
      </section>

      {stateSuppressedReasons.length > 0 && (
        <DataSuppressedNotice
          reasons={stateSuppressedReasons}
          source="multiple"
        />
      )}

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

      <EditorNote note={`Fair Market Rents (FMRs) are set by HUD annually and represent roughly the 40th percentile of gross rents in ${state.state}. They determine Housing Choice Voucher payment standards and affect millions of renters statewide.`} />

      {/* State Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-slate-600">2BR FMR</p>
          <p className="text-xl font-bold text-indigo-700">
            {state.fmr_2br !== null ? `${formatCurrency(state.fmr_2br)}/mo` : '—'}
          </p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-slate-600">Housing Wage (2BR)</p>
          <p className="text-xl font-bold text-indigo-700">
            {state.nlihc_housing_wage_2br !== null ? `$${state.nlihc_housing_wage_2br.toFixed(2)}/hr` : '—'}
          </p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-slate-600">Median Income</p>
          <p className="text-xl font-bold text-indigo-700">
            {state.acs_median_household_income !== null ? formatCurrency(state.acs_median_household_income) : '—'}
          </p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-slate-600">Rent-Burdened</p>
          <p className="text-xl font-bold text-indigo-700">
            {state.acs_rent_burdened_pct !== null ? formatPercent(state.acs_rent_burdened_pct) : '—'}
          </p>
        </div>
      </div>

      {/* Affordability Analysis */}
      {affordableRent !== null && state.fmr_2br !== null && (
        <div className={`rounded-lg p-4 mb-8 ${isAffordable ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <h2 className="font-semibold mb-1">{isAffordable ? 'Rent is Generally Affordable' : 'Rent May Be a Burden'}</h2>
          <p className="text-sm text-slate-700">
            At the median income of {formatCurrency(state.acs_median_household_income)}/year, the 30% rule suggests spending up to {formatCurrency(affordableRent)}/mo on rent.
            The state-aggregate 2BR FMR of {formatCurrency(state.fmr_2br)}/mo is {isAffordable ? 'within' : 'above'} this threshold.
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-700">{commentary.affordability}</p>
        </div>
      )}

      {/* Renter Stats */}
      {state.acs_renter_pct !== null && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2">Renter Statistics</h2>
          <p className="text-sm text-slate-600">{formatPercent(state.acs_renter_pct)} of households in {state.state} are renters (ACS 2023 5-Year, B25008).</p>
        </div>
      )}

      {/* Layer 2: comparison vs national + housing wage gap */}
      <section className="mb-8 rounded-xl border border-indigo-100 bg-indigo-50/40 p-5">
        <h2 className="text-lg font-bold text-slate-900 mb-2">{state.state} vs. the US average</h2>
        <div className="grid gap-3 md:grid-cols-2 text-sm text-slate-700 mb-3">
          <div>
            <span className="font-medium">2BR FMR:</span>{' '}
            {state.fmr_2br !== null ? formatCurrency(state.fmr_2br) : '—'} vs.{' '}
            US avg {formatCurrency(Math.round(nationalCtx.usAvgFmr))}
          </div>
          <div>
            <span className="font-medium">Housing wage:</span>{' '}
            {state.nlihc_housing_wage_2br !== null ? `$${state.nlihc_housing_wage_2br.toFixed(2)}/hr` : '—'} vs.{' '}
            US avg ${nationalCtx.usAvgHousingWage.toFixed(2)}/hr
          </div>
          <div>
            <span className="font-medium">Renter share:</span>{' '}
            {state.acs_renter_pct !== null ? formatPercent(state.acs_renter_pct) : '—'} vs.{' '}
            US avg {formatPercent(nationalCtx.usAvgRenterPct)}
          </div>
          <div>
            <span className="font-medium">Cost-burdened:</span>{' '}
            {state.acs_rent_burdened_pct !== null ? formatPercent(state.acs_rent_burdened_pct) : '—'} vs.{' '}
            US avg {formatPercent(nationalCtx.usAvgRentBurden)}
          </div>
        </div>
        <p className="text-sm leading-7 text-slate-700">{commentary.comparison}</p>
      </section>

      {/* Housing wage gap detail (NLIHC) */}
      {wageGap && (
        <section className="mb-8 rounded-xl border border-slate-200 p-5">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Wage gap for renters in {state.state}</h2>
          <div className="grid gap-3 md:grid-cols-3 text-sm">
            <div>
              <p className="text-slate-500">Housing wage (2BR)</p>
              <p className="font-semibold text-slate-900">${wageGap.need.toFixed(2)}/hr</p>
            </div>
            <div>
              <p className="text-slate-500">Mean renter wage</p>
              <p className="font-semibold text-slate-900">${wageGap.earn.toFixed(2)}/hr</p>
            </div>
            <div>
              <p className="text-slate-500">{wageGap.gap > 0 ? 'Gap' : 'Surplus'}</p>
              <p className={`font-semibold ${wageGap.gap > 0 ? 'text-red-700' : 'text-green-700'}`}>
                {wageGap.gap > 0 ? '−' : '+'}${Math.abs(wageGap.gap).toFixed(2)}/hr
              </p>
            </div>
          </div>
          {wageGap.gap > 0 && (
            <p className="mt-3 text-sm text-slate-600">
              At the mean renter wage of ${wageGap.earn.toFixed(2)}/hr, a renter in {state.state} would need to work
              roughly <span className="font-semibold">{wageGap.weeklyHours} hours per week</span> to afford a 2-bedroom unit at FMR under the 30% rule.
              (NLIHC OOR 2025.)
            </p>
          )}
        </section>
      )}

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
                  <th className="py-2 text-right">3BR</th>
                </tr>
              </thead>
              <tbody>
                {metros.map(m => (
                  <tr key={m.slug} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 pr-4"><a href={`/metro/${m.slug}/`} className="text-indigo-600 hover:underline">{m.metro_name}</a></td>
                    <td className="py-2 pr-4 text-right">{formatCurrency(m.fmr_studio)}</td>
                    <td className="py-2 pr-4 text-right">{formatCurrency(m.fmr_1br)}</td>
                    <td className="py-2 pr-4 text-right font-medium">{formatCurrency(m.fmr_2br)}</td>
                    <td className="py-2 text-right">{formatCurrency(m.fmr_3br)}</td>
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

      {/* Tool surface v2 (2026-06-11): the old RentCalculator carried a
          hardcoded synthetic state-level FMR table — retired. This is the
          county-page affordability/voucher tool in state mode, fed by the
          REAL per-bedroom HUD FY2025 county FMRs already loaded above. */}
      <RentAffordabilityCheck
        stateName={state.state}
        counties={counties
          .filter((c) => c.fmr_studio && c.fmr_1br && c.fmr_2br && c.fmr_3br && c.fmr_4br)
          .map((c) => ({
            name: c.county_name,
            slug: c.slug,
            fmr: {
              studio: c.fmr_studio as number,
              br1: c.fmr_1br as number,
              br2: c.fmr_2br as number,
              br3: c.fmr_3br as number,
              br4: c.fmr_4br as number,
            },
          }))}
      />

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
                  <td className="py-2 pr-4 text-right">{formatCurrency(c.acs_median_household_income)}</td>
                  <td className="py-2 text-right">{formatPercent(c.acs_rent_burdened_pct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Layer 2: outlook — practical takeaway */}
      <section className="mb-8 rounded-xl border border-slate-200 p-5">
        <h2 className="text-lg font-bold text-slate-900 mb-2">What this means for renters in {state.state}</h2>
        <p className="text-sm leading-7 text-slate-700">{commentary.outlook}</p>
      </section>

      <DidYouKnow fact={`HUD updates Fair Market Rents each year using Census ACS data and local rent surveys to keep voucher payments aligned with actual housing costs. The state aggregate above blends NLIHC's 2025 estimate of the 2BR FMR across all ${state.state} counties.`} />

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
        { name: "NLIHC OOR 2025", url: "https://nlihc.org/oor" },
      ]} />

      <div className="flex items-center gap-4 mt-4">
        <CiteButton title={`${state.state} Fair Market Rents`} url={`https://fairrentwize.com/state/${slug}/`} source="FairRentWize (HUD + ACS + NLIHC)" />
      </div>

      <FeedbackButton pageId={slug} />

      <CrossSiteLinks current="FairRentWize" />

      <StateRich slug={slug} state={state} />

      <AuthorBox vintage={STATE_VINTAGE} source={`${state.state} state aggregates: HUD FY2025 FMR rolled up + ACS 2019-2023 5-Year (median rent + rent burden) + NLIHC OOR 2025 (housing wage).`} />

    </>
  );
}
