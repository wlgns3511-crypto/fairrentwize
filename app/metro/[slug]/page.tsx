import { getAllMetroSlugs, getMetroBySlug, getStateByAbbr, getTopMetrosByRent, type Metro } from '@/lib/db';
import { buildDbPageRobots, buildTrustUpdatedLabel, getDataVintageLabel, getDbPageGate, getReviewedAt, getReviewedBy, METHODOLOGY_URL } from '@/lib/db-page';
import { formatCurrency, getDataYear } from '@/lib/format';
import { breadcrumbSchema, faqSchema, generateMetroFAQs, metroPageJsonLd } from '@/lib/schema';
import { AdSlot } from '@/components/AdSlot';
import { AuthorBox } from '@/components/AuthorBox';
import { ENTITY_VINTAGE } from '@/lib/authorship';
import { FreshnessTag } from '@/components/FreshnessTag';
import { AnswerHero } from '@/components/upgrades/AnswerHero';
import { TrustBlock } from '@/components/upgrades/TrustBlock';
import { DecisionNext } from '@/components/upgrades/DecisionNext';
import { classifyRentBurdenTier } from '@/lib/rent-burden-tier';
import { decodeMetroCrosswalk, trimEntityForTitle, fairRentMultiCreatorDatasetSchema } from '@/lib/crosswalk-rent';
import { CrosswalkBridge } from '@/components/upgrades/CrosswalkBridge';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Props { params: Promise<{ slug: string }> }

export const dynamicParams = false;

const NATIONAL_AVG_2BR = 1727; // FY2025 HUD national average 2-bedroom FMR

function buildMetroTopAnswer(metro: Metro): string {
  const parts: string[] = [];
  if (metro.fmr_2br !== null) {
    const diff = metro.fmr_2br - NATIONAL_AVG_2BR;
    const pctDiff = Math.round((diff / NATIONAL_AVG_2BR) * 100);
    parts.push(`${metro.metro_name} has a HUD 2-bedroom Fair Market Rent of ${formatCurrency(metro.fmr_2br)}/month`);
    parts.push(`That is ${Math.abs(pctDiff)}% ${diff >= 0 ? 'above' : 'below'} the national 2BR FMR average of ${formatCurrency(NATIONAL_AVG_2BR)}/mo, a useful benchmark for whether this metro is a comparatively expensive or affordable rental market in FY ${getDataYear()}.`);
  } else {
    parts.push(`${metro.metro_name} HUD Fair Market Rent data for FY ${getDataYear()}.`);
  }
  return parts.join(' — ');
}

export async function generateStaticParams() {
  return getAllMetroSlugs().map(m => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const metro = getMetroBySlug(slug);
  if (!metro) return {};
  const description = buildMetroTopAnswer(metro);
  const gate = getDbPageGate({
    alternativeLinkCount: 4,
    topAnswer: description,
  });
  // P1 verdict-in-title — uses parent state's median for the burden frame
  // (CBSAs span multiple counties, so state aggregate is the consistent
  // income denominator across the metro index).
  const state = getStateByAbbr(metro.state_abbr);
  const crosswalk = decodeMetroCrosswalk({
    metroName: metro.metro_name,
    stateAbbr: metro.state_abbr,
    fmr2br: metro.fmr_2br,
    stateMedianHouseholdIncome: state?.acs_median_household_income ?? null,
  });
  // Use title.absolute to bypass layout template "%s | FairRentWize" suffix.
  const title = crosswalk
    ? { absolute: `${trimEntityForTitle(metro.metro_name)} ${crosswalk.composedScore}/100 — ${crosswalk.verdictShort}` }
    : `${metro.metro_name} Fair Market Rent ${getDataYear()} - Rental Costs by Bedroom`;
  return {
    title,
    description,
    alternates: { canonical: `/metro/${slug}/` },
    openGraph: { url: `/metro/${slug}/` },
    robots: buildDbPageRobots(gate.pass),
  };
}

export default async function MetroPage({ params }: Props) {
  const { slug } = await params;
  const metro = getMetroBySlug(slug);
  if (!metro) notFound();
  const year = getDataYear();

  const state = getStateByAbbr(metro.state_abbr);
  const faqs = generateMetroFAQs(metro);
  const allMetros = getTopMetrosByRent(20);
  const topAnswer = buildMetroTopAnswer(metro);

  // Use state-level median income for the affordability frame (metros span multiple counties).
  const stateMedianIncome = state?.acs_median_household_income ?? null;
  const affordableRent = stateMedianIncome !== null ? Math.round(stateMedianIncome * 0.3 / 12) : null;
  const rentBurden = (metro.fmr_2br !== null && stateMedianIncome !== null)
    ? ((metro.fmr_2br * 12) / stateMedianIncome * 100).toFixed(1)
    : null;
  const isBurdened = rentBurden !== null && parseFloat(rentBurden) >= 30;
  const vsNational = metro.fmr_2br !== null ? metro.fmr_2br - NATIONAL_AVG_2BR : null;
  const vsNationalPct = vsNational !== null ? Math.round((vsNational / NATIONAL_AVG_2BR) * 100) : null;

  const bedroomData = [
    { label: 'Studio', value: metro.fmr_studio },
    { label: '1 Bedroom', value: metro.fmr_1br },
    { label: '2 Bedroom', value: metro.fmr_2br },
    { label: '3 Bedroom', value: metro.fmr_3br },
    { label: '4 Bedroom', value: metro.fmr_4br },
  ];

  const burdenTier = classifyRentBurdenTier({
    fmr2br: metro.fmr_2br,
    medianHouseholdIncome: stateMedianIncome,
    geographyName: metro.metro_name,
    geographyKind: 'metro',
  });

  // Phase 7 P0 wrapper — multi-creator schema + cross-walk bridge consume this.
  const crosswalk = decodeMetroCrosswalk({
    metroName: metro.metro_name,
    stateAbbr: metro.state_abbr,
    fmr2br: metro.fmr_2br,
    stateMedianHouseholdIncome: stateMedianIncome,
  });
  const validValues = bedroomData.map(d => d.value).filter((v): v is number => v !== null);
  const maxRent = validValues.length > 0 ? Math.max(...validValues) : 1;

  return (
    <>
      {metroPageJsonLd(metro).map((node, i) => (
        <script
          key={`metro-jsonld-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }}
        />
      ))}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: state?.state || metro.state_abbr, url: `/state/${state?.slug || ''}/` },
        { name: metro.metro_name, url: `/metro/${slug}/` },
      ])) }} />
      {faqs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />}

      <nav className="text-sm text-slate-500 mb-4">
        <a href="/" className="hover:text-indigo-600">Home</a> &raquo;{' '}
        {state && <><a href={`/state/${state.slug}/`} className="hover:text-indigo-600">{state.state}</a> &raquo; </>}
        <span>{metro.metro_name}</span>
      </nav>

      <AnswerHero
        title={`${metro.metro_name} fair market rent`}
        subtitle={`HUD FMR ${year}`}
        tagline={topAnswer}
        badges={[
          ...(vsNationalPct !== null ? [{
            label: `${vsNationalPct >= 0 ? '+' : ''}${vsNationalPct}% vs national`,
            tone: (vsNationalPct >= 10 ? "amber" : vsNationalPct <= -10 ? "emerald" : "indigo") as "amber" | "emerald" | "indigo",
          }] : []),
          ...(rentBurden !== null ? [{
            label: `${rentBurden}% of state median income`,
            tone: (isBurdened ? "amber" : "emerald") as "amber" | "emerald",
          }] : []),
        ]}
        alternatives={allMetros.filter(m => m.slug !== slug).slice(0, 3).map(m => ({
          label: m.metro_name,
          href: `/metro/${m.slug}/`,
          sublabel: `${formatCurrency(m.fmr_2br)} 2BR`,
        }))}
        alternativesLabel="Compare with metros"
      />

      <FreshnessTag
        source="HUD Fair Market Rents"
        updated={getReviewedAt()}
        reviewedBy={getReviewedBy()}
        dataVintage={getDataVintageLabel()}
        methodologyUrl={METHODOLOGY_URL}
      />

      {/* Phase 7 P4 multi-creator dataset schema — HUD + Census + NLIHC + Congress */}
      {crosswalk && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              fairRentMultiCreatorDatasetSchema({
                name: `FairRent Crosswalk — ${metro.metro_name}`,
                description: crosswalk.decoderNotes,
                url: `/metro/${slug}/`,
                spatialName: metro.metro_name,
                reviewedAt: ENTITY_VINTAGE,
                composedScore: crosswalk.composedScore,
                verdict: crosswalk.verdictShort,
              }),
            ),
          }}
        />
      )}

      {/* RentBurdenTier — metro composing HUD CBSA FMR × parent-state ACS B19013 */}
      {burdenTier.confidence !== 'insufficient-data' && state && (
        <section
          className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/60 p-5"
          data-upgrade="rent-burden-tier"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
            <h2 className="text-lg font-bold text-emerald-900">
              {metro.metro_name} RentBurdenTier: <span className="font-mono">Tier {burdenTier.tier}</span> &mdash; {burdenTier.label}
            </h2>
            <span className="text-sm font-semibold text-emerald-700">
              {burdenTier.burdenPct.toFixed(1)}% of {state.state} median income
            </span>
          </div>
          <p className="text-sm leading-7 text-slate-700">{burdenTier.rationale}</p>
          <p className="mt-3 text-xs text-slate-600">
            Metro tier uses CBSA 2BR FMR against the parent-state ACS B19013 median household income (CBSAs span multiple counties, so the state aggregate is used for cross-metro consistency). Cutoffs: A &lt;18% &middot; B 18&ndash;22% &middot; C 22&ndash;26% &middot; D 26&ndash;30% &middot; E &ge;30% (HUD federal cost-burden threshold, 24 CFR 5.628 / 42 USC 1437a).{' '}
            How RentBurdenTier is computed &rarr;
          </p>
        </section>
      )}

      <TrustBlock
        sources={[
          { name: "HUD Fair Market Rents", url: `https://www.huduser.gov/portal/datasets/fmr.html` },
          { name: "HUD User FMR API", url: "https://www.huduser.gov/portal/dataset/fmr-api.html" },
          { name: "Census ACS Rent", url: "https://www.census.gov/topics/housing.html" },
          { name: "Section 8 Voucher Program", url: "https://www.hud.gov/topics/housing_choice_voucher_program_section_8" },
          { name: "BLS CPI Rent Index", url: "https://www.bls.gov/cpi/factsheets/owners-equivalent-rent-and-rent.htm" },
        ]}
        updated={buildTrustUpdatedLabel()}
        reviewedBy={getReviewedBy()}
        methodologyUrl={METHODOLOGY_URL}
      />

      {/* Phase 7 P5 cross-walk bridge — county-FIPS join cohort */}
      <CrosswalkBridge
        entityName={metro.metro_name}
        entitySlug={slug}
        entityKind="metro"
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-slate-600">2BR FMR</p>
          <p className="text-xl font-bold text-indigo-700">{formatCurrency(metro.fmr_2br)}/mo</p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-slate-600">1BR FMR</p>
          <p className="text-xl font-bold text-indigo-700">{formatCurrency(metro.fmr_1br)}/mo</p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-slate-600">vs National Avg</p>
          <p className="text-xl font-bold text-indigo-700">
            {vsNationalPct !== null ? `${vsNationalPct >= 0 ? '+' : ''}${vsNationalPct}%` : '—'}
          </p>
        </div>
        {rentBurden !== null ? (
          <div className={`rounded-lg p-4 ${isBurdened ? 'bg-red-50' : 'bg-green-50'}`}>
            <p className="text-sm text-slate-600">2BR vs State Income</p>
            <p className={`text-xl font-bold ${isBurdened ? 'text-red-700' : 'text-green-700'}`}>{rentBurden}%</p>
          </div>
        ) : (
          <div className="bg-indigo-50 rounded-lg p-4">
            <p className="text-sm text-slate-600">Studio FMR</p>
            <p className="text-xl font-bold text-indigo-700">{formatCurrency(metro.fmr_studio)}/mo</p>
          </div>
        )}
      </div>

      {/* Rent by Bedroom */}
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
                <div className="bg-indigo-500 h-6 rounded-full" style={{ width: d.value !== null ? `${(d.value / maxRent * 100).toFixed(0)}%` : '0%' }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Affordability — frames against state-level median income */}
      {state && stateMedianIncome !== null && affordableRent !== null && metro.fmr_2br !== null && rentBurden !== null && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Affordability vs. {state.state} state median</h2>
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-700 mb-2">
              Using the {state.state} state median household income of {formatCurrency(stateMedianIncome)}/year (ACS 2023 5-Year, B19013), the 30% rule allows up to <strong>{formatCurrency(affordableRent)}/mo</strong> on rent.
            </p>
            <p className="text-sm text-slate-700">
              The 2BR FMR in {metro.metro_name} of {formatCurrency(metro.fmr_2br)}/mo represents <strong>{rentBurden}%</strong> of state median income —
              {isBurdened ? ' above' : ' within'} the 30% affordability threshold for the typical state household.
              Within-metro income may differ from the state aggregate; see the county pages below for a tighter view.
            </p>
          </div>
        </section>
      )}

      <AdSlot id="metro-mid" />

      {/* National benchmark context */}
      {metro.fmr_2br !== null && vsNational !== null && vsNationalPct !== null && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">How {metro.metro_name} compares nationally</h2>
          <p className="text-sm text-slate-600">
            The {metro.metro_name} 2BR FMR of {formatCurrency(metro.fmr_2br)}/mo runs {Math.abs(vsNationalPct)}% {vsNational >= 0 ? 'above' : 'below'} the national 2-bedroom FMR average of {formatCurrency(NATIONAL_AVG_2BR)}/mo.
            {Math.abs(vsNationalPct) < 10
              ? ' Rents here track the US norm closely — voucher payment standards in this metro will look similar to most US metros.'
              : vsNationalPct > 0
                ? ' This metro sits in the higher-cost portion of the US rental market, which translates to higher voucher payment standards and tighter affordability for unsubsidized renters.'
                : ' This metro is comparatively affordable on the national scale, which often means voucher recipients have a wider pool of qualifying units to choose from.'}
          </p>
        </section>
      )}

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

      {/* Other Metros */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Compare with Other Metro Areas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {allMetros.filter(m => m.slug !== slug).slice(0, 8).map(m => (
            <a key={m.slug} href={`/metro/${m.slug}/`} className="p-3 border border-slate-200 rounded-lg hover:border-indigo-300">
              <p className="font-medium truncate">{m.metro_name}</p>
              <p className="text-slate-500">2BR: {formatCurrency(m.fmr_2br)}/mo</p>
            </a>
          ))}
        </div>
      </section>

      {/* Why this matters */}
      <section className="mb-8 mt-6" data-upgrade="why-it-matters">
        <h2 className="text-xl font-bold mb-3">
          Why fair market rent in {metro.metro_name} matters
        </h2>
        <div className="rounded-lg border border-slate-200 bg-white p-5 text-slate-700 leading-relaxed space-y-3">
          <p>
            Fair Market Rent (FMR) is published annually by HUD and used to
            set payment standards for the Section 8 Housing Choice Voucher
            program. FMR represents roughly the 40th percentile of recent
            asking rents in the metro &mdash; not the cheapest, not the
            most expensive, but the price point at which a vouchered
            tenant should be able to find a unit in a non-luxury,
            non-distressed building.
          </p>
          <p>
            For non-vouchered renters, FMR is one of the most useful
            benchmarks available. It&apos;s independent of any listing
            platform&apos;s incentives and is the same number every
            housing nonprofit and government agency uses. If asking rents
            you see online are far above FMR, you&apos;re looking at the
            top of the market &mdash; widen the search.
          </p>
          {state && stateMedianIncome !== null && affordableRent !== null && metro.fmr_2br !== null && rentBurden !== null && (
            <p>
              The standard US rule of thumb: housing should not exceed 30%
              of gross household income. At {formatCurrency(stateMedianIncome)}
              /year median income for {state.state}, that ceiling is
              {" "}{formatCurrency(affordableRent)}/month. The 2BR FMR of
              {" "}{formatCurrency(metro.fmr_2br)} is {rentBurden}% of
              the state median &mdash; {isBurdened ? "above" : "within"} the 30% rule for a typical state household.
            </p>
          )}
          <p className="text-sm text-slate-500">
            HUD updates FMRs every October for the federal fiscal year
            beginning October 1. Source: HUD User FMR documentation.
          </p>
        </div>
      </section>

      <DecisionNext
        cards={[
          {
            title: `Salary needed in ${metro.metro_name}`,
            blurb: `What gross income do you need to clear the 30% rent burden threshold here?`,
            href: `https://salarybycity.com`,
            cta: `Open SalaryByCity`,
            tone: "indigo" as const,
          },
          {
            title: `Cost of living in this metro`,
            blurb: `Rent is the biggest line, but not the only one. See total cost of living.`,
            href: `https://costbycity.com`,
            cta: `Open CostByCity`,
            tone: "emerald" as const,
          },
          {
            title: `Property tax if you buy`,
            blurb: `Comparing rent to buy? Property tax is often the deciding cost line.`,
            href: `https://propertytaxpeek.com`,
            cta: `Open PropertyTaxPeek`,
            tone: "amber" as const,
          },
        ]}
      />

      <AuthorBox vintage={ENTITY_VINTAGE} source={`${metro.metro_name} CBSA: HUD FY2025 FMR + Census ACS 5-Year median gross rent (CBSA roll-up).`} />

      {/* High-CPC footer */}
      <div className="bg-blue-50 rounded-lg p-6 text-sm">
        <h2 className="font-semibold mb-3 text-blue-900">Renting in {metro.metro_name}?</h2>
        <div className="grid md:grid-cols-2 gap-3 text-blue-800">
          <p>Search apartment listings in the {metro.metro_name} area</p>
          <p>Compare renters insurance quotes</p>
          <p>Get moving company estimates</p>
          <p>Explore rent-to-own programs</p>
          <p>Find housing assistance programs</p>
          <p>Check <a href="https://salarybycity.com" className="underline">salary data for this area</a></p>
        </div>
      </div>
    </>
  );
}
