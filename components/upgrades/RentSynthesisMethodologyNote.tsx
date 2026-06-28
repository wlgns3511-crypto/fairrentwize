import type { StateRow } from '@/lib/db';
import type { RentBurdenTierResult } from '@/lib/rent-burden-tier';
import type { OorMultipleResult } from '@/lib/oor-housing-wage-multiple';
import { decodeFmrMarketGap } from '@/lib/fmr-market-gap';

const usd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const usdHr = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });

export interface RentSynthesisMethodologyNoteProps {
  state: StateRow;
  burdenTier: RentBurdenTierResult;
  oorMultiple: OorMultipleResult | null;
}

/**
 * First-person provenance note for the rent-affordability synthesis on the
 * /state/[slug]/ page.
 *
 * The three levers below it (RentBurdenTier, the OOR housing-wage multiple, and
 * the FMR-vs-market voucher-headroom decoder) are genuine original computation:
 * they pull THREE different federal series — HUD Fair Market Rents, the Census
 * ACS, and NLIHC Out of Reach — and compose them into verdicts that appear in no
 * single government table. But the page states those verdicts in an impersonal
 * voice, which understates the first-hand-modeling (Experience) signal answer
 * engines weigh for E-E-A-T. This note narrates that ORIGINAL composition in
 * first person, with every figure pulled live from the same result objects the
 * page already computed (`burdenTier`, `oorMultiple`) and the FMR-vs-market gap
 * recomputed here from the same state columns the FmrMarketGapBlock uses — so it
 * stays accurate per state, including the states where a source is suppressed.
 * Editorial modeling on primary HUD/Census/NLIHC figures, not housing-assistance
 * advice; the full assumptions and cutoffs live in the cards directly below.
 */
export function RentSynthesisMethodologyNote({
  state,
  burdenTier,
  oorMultiple,
}: RentSynthesisMethodologyNoteProps) {
  const place = state.state;
  const fmrGap = decodeFmrMarketGap(state.fmr_2br, state.acs_median_rent_2br);

  // The page already gates this whole note behind burdenTier.confidence, but
  // branch defensively so the prose never asserts a number we don't have.
  const hasBurden = burdenTier.confidence !== 'insufficient-data' && burdenTier.burdenPct > 0;
  const hasOor = oorMultiple !== null && oorMultiple.confidence === 'high';

  return (
    <section
      className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm leading-relaxed text-slate-700"
      data-upgrade="rent-synthesis-methodology"
    >
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
        How we modeled this
      </p>

      {hasBurden ? (
        <p>
          In 2026, we built a rent-affordability model for all 50 states and DC
          that doesn&rsquo;t take any one agency&rsquo;s word for it &mdash; we
          composed three separate federal series that each measure only part of
          the picture. For {place}, we took HUD&rsquo;s FY 2025 Fair Market Rent
          for a 2-bedroom ({usd(burdenTier.fmr2br)}/month, the 40th-percentile
          gross rent HUD uses as the voucher payment standard), annualized it to{' '}
          {usd(burdenTier.annualRent)}, and set it against the Census ACS median
          household income of {usd(burdenTier.medianIncome)} (B19013, 2019&ndash;2023
          5-Year). That arithmetic &mdash; which neither HUD nor the Census
          publishes as a single figure &mdash; is how we measured a rent burden of{' '}
          {burdenTier.burdenPct.toFixed(1)}% for {place}, landing it in our Tier{' '}
          {burdenTier.tier} ({burdenTier.label}) band against the HUD federal 30%
          cost-burden line (24 CFR 5.628).
        </p>
      ) : (
        <p>
          In 2026, we built a rent-affordability model for all 50 states and DC
          that composes three separate federal series &mdash; HUD Fair Market
          Rents, the Census ACS, and NLIHC Out of Reach &mdash; into verdicts no
          single agency publishes. For {place}, HUD&rsquo;s 2BR Fair Market Rent
          or the Census ACS median household income is suppressed in our snapshot,
          so we couldn&rsquo;t honestly compute the income-side rent burden for
          this state &mdash; we don&rsquo;t fill that gap with a national stand-in.
        </p>
      )}

      {hasOor && (
        <p className="mt-2">
          Income alone hides the renter, though, so we ran a second composition
          that the all-household median can&rsquo;t see: we divided NLIHC&rsquo;s
          Out of Reach 2025 housing wage for {place} ({usdHr(oorMultiple.housingWage2BR)}/hour,
          what it takes to afford that same 2BR at HUD FMR without breaching the
          30% threshold) by NLIHC&rsquo;s mean renter wage for the state
          ({usdHr(oorMultiple.meanRenterWage)}/hour). We measured a{' '}
          {oorMultiple.multiple.toFixed(2)}&times; gap &mdash; meaning the typical
          {place} renter, paid at the state mean, would have to work about{' '}
          {oorMultiple.hoursPerWeekAt40} hours a week to clear that rent
          &mdash; which we read as our Tier {oorMultiple.tier} ({oorMultiple.label}).
          Because that wage is the renter sub-population, not all households, this
          lever and the burden figure above can disagree, and the disagreement is
          the point.
        </p>
      )}

      {fmrGap && (
        <p className="mt-2">
          Finally, we asked whether the voucher cap is even realistic for what{' '}
          {place} renters actually pay: we differenced HUD&rsquo;s {usd(fmrGap.fmr2br)}
          /month FY 2025 2BR standard against the Census ACS 2023 median 2BR rent
          of {usd(fmrGap.marketMedian2br)}/month (B25031) and measured{' '}
          {fmrGap.gapDollars >= 0 ? `${usd(fmrGap.gapDollars)} of headroom` : `a ${usd(Math.abs(fmrGap.gapDollars))} shortfall`}{' '}
          ({fmrGap.gapPct >= 0 ? '+' : '−'}{Math.abs(fmrGap.gapPct)}%) &mdash;
          our &ldquo;{fmrGap.bandLabel.toLowerCase()}&rdquo; read. A recent-mover
          40th-percentile standard normally sits above a lagging all-renter
          median, so we treat the thin-and-negative tail, not the cushion, as the
          signal that vouchers struggle to clear a unit.
        </p>
      )}

      <p className="mt-2 text-xs text-slate-500">
        Editorial modeling composed from primary HUD FY 2025 FMR, Census ACS, and
        NLIHC Out of Reach 2025 figures &mdash; not housing-assistance or
        eligibility advice. Full assumptions, cutoffs, and source citations are in
        the cards below.
      </p>
    </section>
  );
}
