import type { County, StateRow } from './db';
import {
  bucketBurdenPct as bucketCountyBurden,
  bucketFmrVsNational,
  getCountyAffordability,
  getCountyVsNational,
  getCountyAffordableMaxSize,
  getBedroomPremium,
  NATIONAL_AVG_2BR,
  type FmrBucket,
} from './county-facts';
import {
  bucketBurdenPct as bucketStateBurden,
  bucketHousingWageRank,
  getStateAffordability,
  getNationalContext,
  getWageGap,
} from './state-facts';
import { pickVariantWithSalt, formatUsd, formatPct } from './content-helpers';

/**
 * Layer 2 commentary: status × slot × variant.
 *
 * Each commentary call returns a single sentence/paragraph string keyed by the
 * county/state slug. Variants rotate via slugHash so two adjacent counties
 * with the same status see different copy.
 *
 * Slots:
 *   - intro       — opening sentence framing the rent landscape
 *   - affordability — how the FMR squares against local income
 *   - comparison  — vs national or peer benchmarks
 *   - outlook     — practical takeaway for renters/voucher holders
 *
 * Status buckets: 9 county statuses, 6 state statuses (see helpers).
 */

export type CountySlot = 'intro' | 'affordability' | 'comparison' | 'outlook';
export type StateSlot = 'intro' | 'affordability' | 'comparison' | 'outlook';

type CountyStatus =
  | 'extreme-high-burdened'
  | 'extreme-high'
  | 'high-burdened'
  | 'high'
  | 'avg-burdened'
  | 'avg'
  | 'below-avg'
  | 'low'
  | 'data-thin';

function deriveCountyStatus(county: County): CountyStatus {
  const fmrBucket = bucketFmrVsNational(county.fmr_2br);
  const burden = bucketCountyBurden(county.acs_rent_burdened_pct);

  if (fmrBucket === 'unknown' && burden === 'unknown') return 'data-thin';
  if (fmrBucket === 'extreme-high' && (burden === 'extreme' || burden === 'high')) return 'extreme-high-burdened';
  if (fmrBucket === 'extreme-high' || fmrBucket === 'high') {
    return burden === 'extreme' || burden === 'high' ? 'high-burdened' : 'high';
  }
  if (fmrBucket === 'above-avg' || fmrBucket === 'avg') {
    return burden === 'extreme' || burden === 'high' ? 'avg-burdened' : 'avg';
  }
  if (fmrBucket === 'below-avg') return 'below-avg';
  if (fmrBucket === 'low') return 'low';
  return 'data-thin';
}

interface CountyCtx {
  county: County;
  state: StateRow | null;
  status: CountyStatus;
  fmrBucket: FmrBucket;
}

function buildCountyCtx(county: County, state: StateRow | null): CountyCtx {
  return {
    county,
    state,
    status: deriveCountyStatus(county),
    fmrBucket: bucketFmrVsNational(county.fmr_2br),
  };
}

function countyIntroVariants(ctx: CountyCtx): string[] {
  const c = ctx.county;
  const fmr = formatUsd(c.fmr_2br);
  const name = c.county_name;
  const stateAbbr = c.state_abbr;
  const vs = getCountyVsNational(c);
  const vsTxt = vs ? `${Math.abs(vs.pctDiff)}% ${vs.diff >= 0 ? 'above' : 'below'} the national 2-bedroom FMR average of ${formatUsd(NATIONAL_AVG_2BR)}` : '';

  switch (ctx.status) {
    case 'extreme-high-burdened':
    case 'extreme-high':
      return [
        `${name}, ${stateAbbr} sits at the high end of the US rental market with a 2-bedroom HUD Fair Market Rent of ${fmr}/month — ${vsTxt}.`,
        `In ${name}, the 2-bedroom FMR of ${fmr}/mo lands ${vsTxt}, putting renters here in one of the costlier corners of the country.`,
        `HUD's FY2025 2-bedroom Fair Market Rent for ${name} is ${fmr}/month, ${vsTxt} — a price tag that reflects this county's position among the most expensive US rental markets.`,
      ];
    case 'high-burdened':
    case 'high':
      return [
        `${name}, ${stateAbbr} carries an above-average 2-bedroom HUD Fair Market Rent of ${fmr}/month, ${vsTxt}.`,
        `Renters in ${name} face a 2BR FMR of ${fmr}/mo — ${vsTxt}, placing this county in the more expensive band of US rental markets.`,
        `The ${fmr}/mo 2-bedroom FMR in ${name}, ${stateAbbr} runs ${vsTxt}, which has direct implications for voucher payment standards and unsubsidized affordability alike.`,
      ];
    case 'avg-burdened':
    case 'avg':
      return [
        `${name}, ${stateAbbr} tracks the US norm with a 2-bedroom HUD Fair Market Rent of ${fmr}/month, ${vsTxt}.`,
        `The 2BR FMR for ${name} of ${fmr}/mo sits ${vsTxt}, putting this county close to the middle of the US rental cost distribution.`,
        `In ${name}, HUD's 2-bedroom FMR of ${fmr}/month falls ${vsTxt} — an average market by national standards, with local conditions deciding whether that translates to affordability or stretch.`,
      ];
    case 'below-avg':
      return [
        `${name}, ${stateAbbr} sits below the national rental cost average with a 2-bedroom HUD Fair Market Rent of ${fmr}/month — ${vsTxt}.`,
        `Renters in ${name} benefit from a comparatively affordable 2BR FMR of ${fmr}/mo, ${vsTxt}.`,
        `${name}'s 2-bedroom FMR of ${fmr}/month tracks ${vsTxt}, marking it as one of the more affordable counties in the federal voucher program.`,
      ];
    case 'low':
      return [
        `${name}, ${stateAbbr} is among the most affordable US rental markets, with a 2-bedroom HUD Fair Market Rent of ${fmr}/month — ${vsTxt}.`,
        `${name}'s 2BR FMR of ${fmr}/mo sits well below the national norm: ${vsTxt}. Voucher recipients here typically have a wide pool of qualifying units.`,
        `The 2-bedroom FMR for ${name} runs ${fmr}/month, ${vsTxt}, putting this county at the lower-cost end of the federal rental dataset.`,
      ];
    case 'data-thin':
    default:
      return [
        `${name}, ${stateAbbr} has limited HUD Fair Market Rent data published for FY2025, which keeps detailed affordability framing on this page partial.`,
        `For ${name}, the published FY2025 HUD FMR coverage is partial — we surface what is available without imputation.`,
        `${name}'s entry in the FY2025 HUD FMR dataset is sparse, so this page focuses on the figures that are actually reported.`,
      ];
  }
}

function countyAffordabilityVariants(ctx: CountyCtx): string[] {
  const aff = getCountyAffordability(ctx.county);
  if (!aff) {
    return [
      `Median household income data for ${ctx.county.county_name} is unavailable in the latest ACS release, so we don't compute a county-specific 30%-rule affordability figure on this page.`,
      `Without a published median household income for ${ctx.county.county_name}, the 30% affordability rule cannot be applied at the county level — see state-level figures for context.`,
      `${ctx.county.county_name}'s ACS median household income wasn't returned in the current release; we hold off on a 30%-rule calculation rather than estimate one.`,
    ];
  }

  const incomeNeeded = formatUsd(aff.incomeNeededFor2br);
  const burden = aff.rentBurdenAtFmr.toFixed(1);
  const affordableRent = formatUsd(aff.affordableMonthlyRent);
  const fmr = formatUsd(ctx.county.fmr_2br);

  if (aff.isCostBurdened) {
    return [
      `At HUD's 2BR FMR of ${fmr}/mo, a ${ctx.county.county_name} household at the median income would spend ${burden}% of gross earnings on rent — above the 30% cost-burdened threshold. Closing that gap requires roughly ${incomeNeeded}/year, or finding a unit below FMR.`,
      `${ctx.county.county_name}'s 2-bedroom FMR represents ${burden}% of median household income, which exceeds HUD's 30% affordability cutoff. The 30% rule allows up to ${affordableRent}/mo on rent at the local median, leaving a real gap against FMR.`,
      `Median earners in ${ctx.county.county_name} face a meaningful affordability stretch: paying the 2BR FMR of ${fmr}/mo would consume ${burden}% of gross income. The income needed to clear the 30% rule on this rent is ${incomeNeeded}/year.`,
    ];
  }
  return [
    `${ctx.county.county_name}'s 2BR FMR of ${fmr}/mo lands at ${burden}% of median household income — within the 30% affordability threshold. A median earner can rent at FMR without crossing into HUD's cost-burdened category.`,
    `At the local median income, paying the FMR rent of ${fmr}/mo absorbs ${burden}% of gross earnings — under the 30% rule, this counts as affordable. The 30% allowance is ${affordableRent}/mo, slightly above current FMR.`,
    `Renters earning the ${ctx.county.county_name} median can afford up to ${affordableRent}/mo under the 30% rule, which covers the 2-bedroom FMR of ${fmr} (${burden}% of income).`,
  ];
}

function countyComparisonVariants(ctx: CountyCtx): string[] {
  const c = ctx.county;
  const premium = getBedroomPremium(c);
  const maxSize = getCountyAffordableMaxSize(c);
  const sizeNote = maxSize === 'unknown' || maxSize === 'none'
    ? null
    : maxSize === '4BR' || maxSize === '3BR'
      ? `Median earners here can afford up to a ${maxSize} unit at FMR under the 30% rule.`
      : `Under the 30% rule, the median earner here can comfortably afford only a ${maxSize} unit at FMR.`;
  const ratioNote = premium && premium.ratio > 0
    ? `The 4BR-to-studio ratio is ${premium.ratio.toFixed(2)}× — ${premium.ratio > 2.5 ? 'a steep family premium relative to single-occupant units' : premium.ratio < 1.7 ? 'a comparatively flat curve, friendly for larger households' : 'in line with typical US bedroom-tier spreads'}.`
    : null;

  return [
    [`Within the same state, see how ${c.county_name} stacks up against neighboring counties on the related-counties section below.`, sizeNote, ratioNote].filter(Boolean).join(' '),
    [sizeNote, ratioNote, `For a wider context, the rankings page shows where ${c.county_name} lands nationally on price and affordability.`].filter(Boolean).join(' '),
    [ratioNote, `Cross-reference these figures with state-level housing wage estimates from NLIHC OOR 2025 to see how ${c.state_abbr}'s overall renter wage compares to the rent burden implied here.`, sizeNote].filter(Boolean).join(' '),
  ].filter((s) => s.length > 0);
}

function countyOutlookVariants(ctx: CountyCtx): string[] {
  const c = ctx.county;
  switch (ctx.status) {
    case 'extreme-high-burdened':
    case 'extreme-high':
      return [
        `For Section 8 voucher holders, the high FMR here works in your favor — payment standards in ${c.county_name} run elevated, expanding the pool of qualifying units. Unsubsidized renters should expect to budget aggressively or look at smaller-bedroom options.`,
        `In an expensive county like ${c.county_name}, comparing actual asking rents on listing platforms to FMR is essential — anything more than 10-15% above FMR generally indicates a higher-tier or amenity-rich property, not the median market.`,
        `${c.county_name}'s elevated FMR ties to elevated voucher payment standards, but cost-burdened renters without subsidy may need to widen the search to neighboring counties or accept a smaller unit to stay within the 30% rule.`,
      ];
    case 'high-burdened':
    case 'high':
      return [
        `Renters in ${c.county_name} can use the 30% rule against the 2BR FMR as a quick reality check — if a listing's gross rent runs more than ~10% above FMR, you're paying for above-baseline quality, not the local median.`,
        `For voucher holders in ${c.county_name}, the elevated FMR eases unit-finding, but unsubsidized renters should expect listings on platforms to run at or above FMR rather than below.`,
        `${c.county_name}'s above-average FMR translates to above-average voucher payment standards — useful if you're vouchered, harder if you're not. Adjacent lower-cost counties can sometimes provide a better unsubsidized fit.`,
      ];
    case 'avg-burdened':
    case 'avg':
      return [
        `${c.county_name} sits squarely in the middle of the US rental cost distribution, which means the standard 30% rule advice applies cleanly: target gross rent at or below 30% of monthly income.`,
        `For most renters in ${c.county_name}, the FMR figures here are a reliable benchmark — actual asking rents on listing platforms shouldn't deviate from FMR by more than ~10% in either direction at the median tier.`,
        `In a typical-cost market like ${c.county_name}, both voucher payment standards and the broader rental market track HUD's published FMR closely, making FMR a useful mental anchor for any rent decision.`,
      ];
    case 'below-avg':
      return [
        `${c.county_name}'s below-average FMR means voucher recipients have a wide pool of qualifying units, and unsubsidized renters can typically find above-FMR-quality stock without crossing the 30% rule.`,
        `In a comparatively affordable county like ${c.county_name}, the practical 30% rule allowance often exceeds FMR — leaving room for either savings or a step up in unit quality.`,
        `For renters moving into ${c.county_name}, FMR offers a conservative baseline — actual asking rents on listing platforms often run at or below FMR, especially for older or more remote units.`,
      ];
    case 'low':
      return [
        `${c.county_name} is a notably affordable market relative to the rest of the US — voucher payment standards here may translate to luxury-grade units in higher-cost counties.`,
        `Median earners in ${c.county_name} typically have substantial slack against the 30% rule, often enough to step up two bedroom sizes without crossing into cost-burdened territory.`,
        `In a low-FMR county like ${c.county_name}, the bigger affordability question is usually wages and job availability, not rent — see SalaryByCity.com for compensation context.`,
      ];
    case 'data-thin':
    default:
      return [
        `For ${c.county_name}, lean on the bedroom-size FMR table above as the primary signal — ACS-derived burden statistics are partial in this release.`,
        `Where ${c.county_name}'s ACS data is thin, cross-reference the state-level page and neighboring counties to triangulate local conditions.`,
        `${c.county_name}'s coverage in the ACS 2023 5-Year release is partial — for budgeting decisions, anchor on the published HUD FMR rather than imputed averages.`,
      ];
  }
}

export function getCountyCommentary(county: County, state: StateRow | null, slot: CountySlot): string {
  const ctx = buildCountyCtx(county, state);
  let variants: string[];
  switch (slot) {
    case 'intro':
      variants = countyIntroVariants(ctx);
      break;
    case 'affordability':
      variants = countyAffordabilityVariants(ctx);
      break;
    case 'comparison':
      variants = countyComparisonVariants(ctx);
      break;
    case 'outlook':
      variants = countyOutlookVariants(ctx);
      break;
  }
  return pickVariantWithSalt(county.slug, slot, variants);
}

export function getAllCountyCommentary(county: County, state: StateRow | null): Record<CountySlot, string> {
  return {
    intro: getCountyCommentary(county, state, 'intro'),
    affordability: getCountyCommentary(county, state, 'affordability'),
    comparison: getCountyCommentary(county, state, 'comparison'),
    outlook: getCountyCommentary(county, state, 'outlook'),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// State-level commentary

type StateStatus = 'top5-burdened' | 'top5' | 'high' | 'mid' | 'low' | 'bottom5' | 'data-thin';

function deriveStateStatus(state: StateRow, allStates: StateRow[]): StateStatus {
  const wage = bucketHousingWageRank(state.nlihc_housing_wage_rank, allStates.length);
  const burden = bucketStateBurden(state.acs_rent_burdened_pct);
  if (wage === 'unknown' && burden === 'unknown') return 'data-thin';
  if (wage === 'top5') return burden === 'extreme' || burden === 'high' ? 'top5-burdened' : 'top5';
  if (wage === 'high') return 'high';
  if (wage === 'mid') return 'mid';
  if (wage === 'low') return 'low';
  if (wage === 'bottom5') return 'bottom5';
  return 'data-thin';
}

function stateIntroVariants(state: StateRow, allStates: StateRow[]): string[] {
  const ctx = getNationalContext(allStates);
  const fmr = formatUsd(state.fmr_2br);
  const wage = state.nlihc_housing_wage_2br !== null ? `$${state.nlihc_housing_wage_2br.toFixed(2)}/hr` : '—';
  const usAvgWage = `$${ctx.usAvgHousingWage.toFixed(2)}/hr`;
  const status = deriveStateStatus(state, allStates);

  switch (status) {
    case 'top5-burdened':
    case 'top5':
      return [
        `${state.state} ranks among the highest-cost rental markets in the country, with a 2-bedroom HUD Fair Market Rent of ${fmr}/mo and an NLIHC housing wage of ${wage} — well above the national average of ${usAvgWage}.`,
        `Renters in ${state.state} face one of the steepest affordability landscapes in the US: a 2BR FMR of ${fmr}/mo backed by a housing wage of ${wage} (vs. ${usAvgWage} nationally).`,
        `${state.state}'s rental cost structure sits in the top tier nationally, with the NLIHC 2025 housing wage at ${wage} for a 2-bedroom — substantially higher than the US average of ${usAvgWage}.`,
      ];
    case 'high':
      return [
        `${state.state} runs above-average on rent costs: 2BR FMR of ${fmr}/mo and an NLIHC housing wage of ${wage}, both meaningfully ahead of US averages.`,
        `Renting in ${state.state} costs more than the typical state, with a 2BR FMR of ${fmr}/mo and a housing wage of ${wage} (US average ${usAvgWage}).`,
        `${state.state}'s housing wage of ${wage} sits in the upper tier of US states, paired with a 2BR FMR of ${fmr}/mo.`,
      ];
    case 'mid':
      return [
        `${state.state} tracks the US rental cost average, with a 2BR FMR of ${fmr}/mo and an NLIHC housing wage of ${wage} — in line with the national average of ${usAvgWage}.`,
        `Rent in ${state.state} sits near the US median: 2BR FMR of ${fmr}/mo and a housing wage of ${wage}, neither notably high nor low by national standards.`,
        `${state.state} represents a typical US rental cost profile, with a 2BR FMR of ${fmr}/mo and a housing wage close to the national average of ${usAvgWage}.`,
      ];
    case 'low':
    case 'bottom5':
      return [
        `${state.state} is one of the more affordable US rental markets, with a 2BR FMR of ${fmr}/mo and an NLIHC housing wage of ${wage} — below the national average of ${usAvgWage}.`,
        `Renters in ${state.state} benefit from comparatively low rent costs: 2BR FMR of ${fmr}/mo and a housing wage of just ${wage} (vs. ${usAvgWage} nationally).`,
        `${state.state}'s housing wage of ${wage} sits below the national norm, paired with a 2BR FMR of ${fmr}/mo — a relatively affordable rental market on the federal scale.`,
      ];
    case 'data-thin':
    default:
      return [
        `${state.state} has limited NLIHC OOR 2025 and HUD FMR coverage in the current dataset; this page reports what is published without imputation.`,
        `Coverage of ${state.state} in the FY2025 NLIHC and HUD releases is partial — the figures here are the published values.`,
        `${state.state}'s state-level rental cost statistics are sparse in the current release; the data here is direct, not modeled.`,
      ];
  }
}

function stateAffordabilityVariants(state: StateRow): string[] {
  const aff = getStateAffordability(state);
  if (!aff) {
    return [
      `Statewide affordability arithmetic for ${state.state} is partial — either median household income or 2BR FMR is missing in the current ACS/HUD release.`,
      `Without complete ACS or HUD figures for ${state.state}, the 30% rule isn't computed at the state level on this page; see county pages for granular figures.`,
      `${state.state}'s ACS-HUD affordability cross-walk is incomplete in this release; we hold the state-level 30% rule calculation rather than estimate it.`,
    ];
  }
  const fmr = formatUsd(state.fmr_2br);
  const monthly = formatUsd(aff.affordableMonthlyRent);
  const burden = aff.rentBurdenAtFmr.toFixed(1);
  if (aff.isCostBurdened) {
    return [
      `At ${state.state}'s state-level median income, the 30% rule allows up to ${monthly}/mo on rent — but the state-aggregate 2BR FMR of ${fmr} would consume ${burden}% of gross income, above the cost-burdened threshold.`,
      `${state.state} renters at the state median earn enough for ${monthly}/mo at the 30% rule, but the 2BR FMR runs ${burden}% of income — squarely in cost-burdened territory.`,
      `Across ${state.state}, paying the 2BR FMR of ${fmr}/mo absorbs ${burden}% of state median income — past HUD's 30% threshold and into formal cost-burdened territory.`,
    ];
  }
  return [
    `At ${state.state}'s median income, the 30% rule allows ${monthly}/mo on rent, comfortably above the state-aggregate 2BR FMR of ${fmr} (${burden}% of income).`,
    `${state.state}'s state-level affordability looks balanced: the 30% rule allows ${monthly}/mo, against a 2BR FMR of ${fmr} that consumes only ${burden}% of median income.`,
    `Statewide, ${state.state} renters at the median income can clear the 30% rule on a 2BR FMR rent of ${fmr}/mo (${burden}% of gross income).`,
  ];
}

function stateComparisonVariants(state: StateRow, allStates: StateRow[]): string[] {
  const ctx = getNationalContext(allStates);
  const burden = state.acs_rent_burdened_pct;
  const renter = state.acs_renter_pct;
  const burdenLine = burden !== null
    ? `Cost burden among renter households runs ${formatPct(burden)} (US average ${formatPct(ctx.usAvgRentBurden)}, ACS B25070).`
    : null;
  const renterLine = renter !== null
    ? `Renter households make up ${formatPct(renter)} of the state's housing (US average ${formatPct(ctx.usAvgRenterPct)}, ACS B25008).`
    : null;
  const wageGap = getWageGap(state);
  const gapLine = wageGap
    ? wageGap.gap > 0
      ? `The mean ${state.state} renter earns $${wageGap.earn.toFixed(2)}/hr — $${wageGap.gap.toFixed(2)} short of the $${wageGap.need.toFixed(2)} needed for a 2BR at FMR (NLIHC 2025).`
      : `The mean ${state.state} renter earns $${wageGap.earn.toFixed(2)}/hr, $${Math.abs(wageGap.gap).toFixed(2)} above the $${wageGap.need.toFixed(2)} housing wage for a 2BR at FMR.`
    : null;

  return [
    [burdenLine, renterLine, gapLine].filter(Boolean).join(' '),
    [renterLine, gapLine, burdenLine].filter(Boolean).join(' '),
    [gapLine, burdenLine, renterLine].filter(Boolean).join(' '),
  ].filter((s) => s.length > 0);
}

function stateOutlookVariants(state: StateRow): string[] {
  const status = deriveStateStatus(state, [state]); // local bucket only — fine for outlook copy
  switch (status) {
    case 'top5-burdened':
    case 'top5':
      return [
        `In a top-tier rental cost state like ${state.state}, voucher payment standards run high — but unsubsidized renters often face the largest affordability gap in the country relative to wages.`,
        `${state.state}'s elevated rental costs make HUD voucher payment standards particularly important; without a voucher, expect to budget aggressively or commute longer distances.`,
        `For renters considering a move to ${state.state}, the high housing wage means rent will be a dominant budget line regardless of which county you target.`,
      ];
    case 'high':
      return [
        `${state.state}'s above-average housing wage means rent will pressure budgets more than in the typical state — county-level variation matters more here than in lower-cost states.`,
        `Renters relocating to ${state.state} should anchor budgets on the state housing wage, not the FMR alone, since the state-level housing wage captures full-time-equivalent income needs better.`,
        `In ${state.state}, the gap between metro and rural counties is often substantial — checking county-level FMRs before committing to a region helps avoid above-state-median rent shocks.`,
      ];
    case 'mid':
      return [
        `${state.state} represents the US rental norm — standard 30% rule heuristics translate cleanly here without state-specific adjustments.`,
        `For ${state.state} renters, the gap between FMR and asking rents on listing platforms tends to be narrow at the median tier; large deviations usually signal premium properties, not market shifts.`,
        `In a typical-cost state like ${state.state}, voucher payment standards generally align with broader market expectations — useful if you're vouchered, comfortable if you're not.`,
      ];
    case 'low':
    case 'bottom5':
      return [
        `${state.state}'s low rental cost structure means voucher recipients often have substantial unit choice; for unsubsidized renters, the bigger budget pressure is usually wages, not rent.`,
        `In an affordable state like ${state.state}, the 30% rule allowance frequently exceeds FMR by a wide margin — leaving room to step up in unit quality or save aggressively.`,
        `${state.state} renters typically have meaningful slack against the 30% rule. The trade-off is often lower local wages — see SalaryByCity.com for compensation comparison.`,
      ];
    case 'data-thin':
    default:
      return [
        `For ${state.state}, lean on county-level pages where ACS coverage is fuller; the state-level summary here is by design conservative when source data is sparse.`,
        `Where ${state.state}'s state-level data is thin, county pages and the rankings index provide more granular signal.`,
        `${state.state}'s state-level entry is partial in this release; we surface what is published rather than fill gaps with imputation.`,
      ];
  }
}

export function getStateCommentary(state: StateRow, allStates: StateRow[], slot: StateSlot): string {
  let variants: string[];
  switch (slot) {
    case 'intro':
      variants = stateIntroVariants(state, allStates);
      break;
    case 'affordability':
      variants = stateAffordabilityVariants(state);
      break;
    case 'comparison':
      variants = stateComparisonVariants(state, allStates);
      break;
    case 'outlook':
      variants = stateOutlookVariants(state);
      break;
  }
  return pickVariantWithSalt(state.slug, slot, variants);
}

export function getAllStateCommentary(state: StateRow, allStates: StateRow[]): Record<StateSlot, string> {
  return {
    intro: getStateCommentary(state, allStates, 'intro'),
    affordability: getStateCommentary(state, allStates, 'affordability'),
    comparison: getStateCommentary(state, allStates, 'comparison'),
    outlook: getStateCommentary(state, allStates, 'outlook'),
  };
}
