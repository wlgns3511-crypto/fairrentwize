/**
 * FairRent Interpretation — composite verdict atop three deterministic
 * levers in this codebase, surfaced as the reader-help layer on /state/[slug]/
 * (the AdSense / HCU reapproval composite). Each US state and DC routes
 * into exactly one of six mutually exclusive DominantSignal categories,
 * with a 4-paragraph synthesis that explains how the three lever signatures
 * compose.
 *
 * Composes (axis 1 → axis 3):
 *   1. RentBurdenTier — 5-tier all-household read (lib/rent-burden-tier.ts,
 *      HUD FY 2025 FMR 2BR × Census ACS B19013 median household income,
 *      anchored to the HUD 30% cost-burden threshold at 24 CFR 5.628 /
 *      42 USC 1437a). "Is the typical household in this area cost-burdened
 *      at HUD FMR?"
 *   2. OorHousingWageMultiple — 5-tier renter-wage gap (lib/oor-housing-
 *      wage-multiple.ts, NLIHC Out of Reach 2025 housing wage / mean renter
 *      wage). "Is the renter sub-population's mean wage enough to clear
 *      HUD FMR within the 30% threshold?"
 *   3. FmrCountyVarianceTier — 5-tier within-state dispersion (lib/fmr-
 *      county-variance-tier.ts, CoV of HUD FY 2025 FMR 2BR across counties).
 *      "Does the state-level aggregate hide a coastal/metro vs. balance-of-
 *      state split?"
 *
 * Output: a single DominantSignal that names the load-bearing structural
 * read, plus a 4-paragraph synthesis (verdict / how the levers stack /
 * what the labor-market read says / what the next-step planner is for
 * a renter in this state).
 *
 *   AffordableStable                 All three levers low. HUD FMR fits
 *                                     inside ACS median income AND NLIHC
 *                                     mean renter wage AND within-state
 *                                     dispersion is geographically
 *                                     homogeneous. The state page is a
 *                                     reasonable read for any county.
 *   WageFloorFailure                 OOR Multiple tier E. Even at the area
 *                                     mean renter wage, a single full-time
 *                                     renter cannot clear FMR within the
 *                                     HUD 30% threshold. The labor market
 *                                     is structurally misaligned with the
 *                                     rental market.
 *   HighVarianceCountyLottery        FMR variance tier E with all-household
 *                                     burden moderate (tier ≤ D). The state
 *                                     aggregate hides a coastal/metro vs.
 *                                     rural split; reading the state page
 *                                     is misleading for any specific
 *                                     county.
 *   CoastalCrisis                    All three lever signals stacked high.
 *                                     RentBurdenTier E AND OOR Multiple
 *                                     tier D/E AND FMR variance tier D/E.
 *                                     A renter at the state median
 *                                     household income or the area mean
 *                                     renter wage is cost-burdened in
 *                                     every county; the high-FMR metros
 *                                     are catastrophic.
 *   BurdenedButEarningAboveWage      RentBurdenTier D/E (all-household
 *                                     burden) AND OOR Multiple tier A/B
 *                                     (renter wage close to housing wage).
 *                                     Diagnostic: the all-household
 *                                     median masks a renter sub-population
 *                                     with earnings concentrated above the
 *                                     all-household mean (typical of
 *                                     high-tech metros where renters
 *                                     skew younger and earn near the area
 *                                     mean but the all-household median
 *                                     is dragged down by retirees).
 *   QuietSqueeze                     Everything else. RentBurdenTier C/D
 *                                     AND OOR Multiple C/D AND FMR
 *                                     variance C/D. Middle-band signal:
 *                                     every read is "approaching cost-
 *                                     burdened" without any one lever
 *                                     hitting an extreme. The state is
 *                                     under structural rent pressure
 *                                     without an obvious dominant lever.
 *
 * Scope honesty:
 *   - This is a state-level composite. County and metro pages re-classify
 *     their own RentBurdenTier; the OOR Multiple and FMR variance levers
 *     are state-only (NLIHC OOR is published state-level, and the variance
 *     lever is by definition state-aggregate).
 *   - The composite reads three structural signals at a single year's
 *     snapshot. HUD FMR is updated annually (FY 2025 vintage), Census ACS
 *     is a 2019-2023 5-Year estimate, NLIHC OOR is 2025 vintage. Signals
 *     can drift across publication cycles.
 *   - The classifier is a deterministic read of three DB-backed lever
 *     outputs; it is not a legal eligibility determination for any HUD
 *     voucher program (24 CFR 982), LIHTC unit (26 USC 42), or state-level
 *     rent-stabilization regime. Pair with the relevant state housing
 *     agency before making a relocation, application, or budgeting
 *     decision.
 */
import Database from 'better-sqlite3';
import path from 'path';
import { classifyRentBurdenTier, type RentBurdenTierResult, type RentBurdenTier } from './rent-burden-tier';
import { classifyStateOorMultiple, type OorMultipleResult, type OorMultipleTier } from './oor-housing-wage-multiple';
import { classifyStateFmrVariance, type FmrVarianceResult, type FmrVarianceTier } from './fmr-county-variance-tier';

const DB_PATH = path.join(process.cwd(), 'data', 'rents.db');
let _db: Database.Database | null = null;
function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  }
  return _db;
}

export type DominantSignal =
  | 'AffordableStable'
  | 'WageFloorFailure'
  | 'HighVarianceCountyLottery'
  | 'CoastalCrisis'
  | 'BurdenedButEarningAboveWage'
  | 'QuietSqueeze';

export interface FairRentInterpretationInputs {
  stateName: string;
  stateAbbr: string;
  rentBurdenTier: RentBurdenTier;
  oorMultipleTier: OorMultipleTier;
  fmrVarianceTier: FmrVarianceTier;
  rentBurdenPct: number;
  oorMultiple: number;
  fmrVariancePct: number;
}

export interface FairRentInterpretationResult {
  dominantSignal: DominantSignal;
  signalLabel: string;
  tone: 'emerald' | 'sky' | 'amber' | 'rose' | 'slate';
  /** 1-2 sentence headline verdict. */
  verdict: string;
  /** 4 paragraphs: header, lever stack, labor-market read, next step. */
  paragraphs: [string, string, string, string];
  /** Primary cross-link guide for this dominant signal. */
  primaryGuide: { href: string; title: string };
  /** Secondary cross-link guides (the other levers, methodology). */
  secondaryGuides: Array<{ href: string; title: string }>;
  inputs: FairRentInterpretationInputs;
  underlying: {
    rentBurden: RentBurdenTierResult;
    oor: OorMultipleResult;
    variance: FmrVarianceResult;
  };
}

const SIGNAL_LABEL: Record<DominantSignal, string> = {
  AffordableStable: 'HUD FMR sits inside both household and renter-wage budgets',
  WageFloorFailure: 'NLIHC mean renter wage cannot clear HUD FMR',
  HighVarianceCountyLottery: 'State aggregate hides a coastal/metro vs. balance-of-state split',
  CoastalCrisis: 'All three rent-pressure signals stacked high',
  BurdenedButEarningAboveWage: 'All-household burden, renter sub-population earns above the mean',
  QuietSqueeze: 'Middle-band pressure without an obvious dominant lever',
};

const SIGNAL_TONE: Record<DominantSignal, FairRentInterpretationResult['tone']> = {
  AffordableStable: 'emerald',
  BurdenedButEarningAboveWage: 'sky',
  HighVarianceCountyLottery: 'amber',
  QuietSqueeze: 'amber',
  WageFloorFailure: 'rose',
  CoastalCrisis: 'rose',
};

function classifyDominantSignal(
  rentBurden: RentBurdenTier,
  oor: OorMultipleTier,
  variance: FmrVarianceTier,
): DominantSignal {
  const isHigh = (t: RentBurdenTier | OorMultipleTier | FmrVarianceTier) => t === 'D' || t === 'E';
  const isLow = (t: RentBurdenTier | OorMultipleTier | FmrVarianceTier) => t === 'A' || t === 'B';

  // Priority 1 — all three signals stacked high. Coastal-crisis dominant read.
  if (rentBurden === 'E' && isHigh(oor) && isHigh(variance)) return 'CoastalCrisis';

  // Priority 2 — wage-floor failure. OOR E means the renter sub-population's
  // mean wage structurally cannot clear FMR, regardless of all-household read.
  if (oor === 'E') return 'WageFloorFailure';

  // Priority 3 — high within-state variance (state aggregate misleading).
  // Catches the NY/CO/VA pattern where one or two metros drive the state
  // signal but the balance-of-state sits in a different rental market.
  if (variance === 'E') return 'HighVarianceCountyLottery';

  // Priority 4 — diagnostic disagreement: all-household burdened but renter wage close.
  if (isHigh(rentBurden) && isLow(oor)) return 'BurdenedButEarningAboveWage';

  // Priority 5 — all signals comfortably low (variance E already returned above).
  if (isLow(rentBurden) && isLow(oor)) return 'AffordableStable';

  // Fallback — middle-band, no dominant lever.
  return 'QuietSqueeze';
}

function buildVerdict(signal: DominantSignal, stateName: string): string {
  switch (signal) {
    case 'AffordableStable':
      return `In ${stateName}, the HUD FY 2025 Fair Market Rent for a 2BR fits inside both the Census ACS median household income (RentBurdenTier A/B) AND the NLIHC Out of Reach 2025 mean renter wage (OOR Multiple A/B), and within-state FMR dispersion is geographically homogeneous. The state page is a reasonable read for any county.`;
    case 'WageFloorFailure':
      return `In ${stateName}, the NLIHC OOR 2025 mean renter wage is structurally below the area's housing wage — a renter at the area mean cannot clear HUD FY 2025 FMR within the HUD 30% cost-burden threshold (24 CFR 5.628). The labor market and rental market are structurally misaligned.`;
    case 'HighVarianceCountyLottery':
      return `In ${stateName}, within-state HUD FY 2025 FMR 2BR variance is in the top decile of US states — the state-level aggregate is essentially an average of two different rental markets (typically a coastal/metro and a balance-of-state region). Read /county/ and /metro/ pages, not this state aggregate, for tier-level decisions.`;
    case 'CoastalCrisis':
      return `In ${stateName}, all three structural rent-pressure signals stack high — RentBurdenTier D/E AND NLIHC OOR Multiple D/E AND FMR within-state variance D/E. A renter at either the Census ACS median household income or the NLIHC mean renter wage is cost-burdened in essentially every county; the high-FMR metros are catastrophic.`;
    case 'BurdenedButEarningAboveWage':
      return `In ${stateName}, the all-household RentBurdenTier reads cost-burdened (D/E on Census ACS median household income) but the NLIHC OOR Multiple is comparatively low (A/B). Diagnostic: the renter sub-population earns above the all-household median — typical of metros where renters skew younger and the all-household median is dragged down by retirees.`;
    case 'QuietSqueeze':
      return `In ${stateName}, all three lever signals sit in the middle band — RentBurdenTier C/D, NLIHC OOR Multiple C/D, FMR within-state variance C/D. The state is under structural rent pressure but no single lever hits an extreme; HUD FMR, the renter wage gap, and within-state dispersion each contribute roughly equally.`;
  }
}

function buildLeverStackParagraph(inputs: FairRentInterpretationInputs): string {
  const burdenStr = inputs.rentBurdenPct.toFixed(1);
  const oorStr = inputs.oorMultiple.toFixed(2);
  const varStr = inputs.fmrVariancePct.toFixed(1);
  return `Three deterministic levers compose this state-level read. (1) RentBurdenTier ${inputs.rentBurdenTier}: HUD FY 2025 Fair Market Rent for a 2BR runs ${burdenStr}% of the Census ACS B19013 median household income — anchored to the HUD federal 30% cost-burden threshold at 24 CFR 5.628 / 42 USC 1437a. (2) OOR Multiple ${inputs.oorMultipleTier}: NLIHC Out of Reach 2025 reports a housing-wage-to-mean-renter-wage ratio of ${oorStr}× for ${inputs.stateName}, indicating the typical wage-earning renter would need that multiple of the area mean renter wage to afford a 2BR at FMR within the HUD 30% threshold. (3) FMR County Variance ${inputs.fmrVarianceTier}: within-${inputs.stateName} HUD FMR 2BR has a coefficient of variation of ${varStr}% across counties. The dominant signal above is the lever combination that constrains a renter's decision most tightly.`;
}

function buildLaborMarketParagraph(signal: DominantSignal, inputs: FairRentInterpretationInputs): string {
  const baseline = `Labor-market read: NLIHC Out of Reach 2025 reports the housing wage for ${inputs.stateName} as a single hourly figure required to afford the HUD FY 2025 2BR FMR at 30% of income, 40 hours per week, 52 weeks per year. The DOL FLSA federal minimum wage of $7.25/hour (unchanged since 2009-07-24) provides a constant floor across states; the area mean renter wage from NLIHC's CPS-derived field survey provides the state-specific renter sub-population read.`;
  switch (signal) {
    case 'AffordableStable':
      return `${baseline} For this state, the area mean renter wage clears the housing wage with slack — a single full-time wage-earning renter can afford the 2BR at HUD FMR within the HUD 30% threshold without supplemental income, second jobs, or roommates.`;
    case 'WageFloorFailure':
      return `${baseline} For this state, the area mean renter wage is structurally below the housing wage by a margin that no single-job, single-earner configuration can close. The wage-side fix is a labor-market intervention (minimum-wage increase, sector-wage premium, tipped-wage statute reform); the rent-side fix is a HUD or state-level supply intervention (LIHTC unit production under 26 USC 42, Section 8 voucher expansion under 42 USC 1437f). NLIHC OOR 2025 ranks this jurisdiction in the top decile of wage-rent gaps nationally.`;
    case 'HighVarianceCountyLottery':
      return `${baseline} The state aggregate masks the labor-market read at the county level — the high-FMR metro in this state likely has its own labor market with a renter wage that may or may not track the state mean. The OOR Multiple at the state level is a single weighted figure; the metro / balance-of-state split frequently produces an OOR Multiple closer to 2× in the metro and well below in the rural balance.`;
    case 'CoastalCrisis':
      return `${baseline} For this state, both axes signal failure: the all-household median income is cost-burdened against HUD FMR AND the renter sub-population's mean wage cannot close the gap either. NLIHC OOR 2025's headline statistic — "X hours/week at minimum wage needed to afford 2BR" — sits at multiple times the standard work week. Without HUD voucher access (24 CFR 982) or LIHTC unit supply (26 USC 42), the wage-side and the rent-side both require structural reform.`;
    case 'BurdenedButEarningAboveWage':
      return `${baseline} The diagnostic gap here is informative: when all-household burden is high but the OOR Multiple is low, the renter sub-population earns systematically above the all-household median. This is typical of metros where renters skew younger and higher-earning while the all-household median is pulled down by retirees on fixed income (Social Security, SSI). The state page's "is this affordable?" answer differs dramatically depending on whether the reader is in the renter sub-population or the all-household median.`;
    case 'QuietSqueeze':
      return `${baseline} For this state, no single lever is failing dramatically — the renter wage and the housing wage are within a typical national-band gap, and within-state dispersion is moderate. The composite signal is structural rent pressure without a single dominant cause; small shifts in any lever (a wage increase, an FMR adjustment, a HUD voucher allocation change) would move the composite either toward Affordable-Stable or toward a Coastal-Crisis read.`;
  }
}

function buildNextStepParagraph(signal: DominantSignal): string {
  switch (signal) {
    case 'AffordableStable':
      return `Next step for renters: the state aggregate is a reasonable starting read. /county/ pages can refine the FMR and median-income inputs but are unlikely to surface a tier shift. HUD voucher search (24 CFR 982) is unnecessary for renters at or above the area mean renter wage. The /guide/rent-burden-tier/ explains the 5-tier RentBurdenTier methodology; the /guide/oor-housing-wage-multiple/ explains the NLIHC labor-market gap classifier.`;
    case 'WageFloorFailure':
      return `Next step for renters: NLIHC OOR 2025's wage-side reality means a single full-time wage-earner cannot clear FMR without supplemental income, roommates, or HUD voucher assistance (24 CFR 982). The /guide/oor-housing-wage-multiple/ explains the labor-market gap classifier and links to NLIHC's state-by-state housing wage tables. State-level renter protections under the local landlord-tenant code are an additional pathway. Pair with a HUD-listed PHA (Public Housing Agency) intake to establish voucher eligibility.`;
    case 'HighVarianceCountyLottery':
      return `Next step for renters: do not use the state page as the source-of-truth read. Navigate to the /county/[slug]/ page for your specific county, or the /metro/[slug]/ page for your CBSA, before drawing any affordability conclusion. The /guide/fmr-county-variance/ explains how within-state dispersion classifies and which states are most prone to this aggregation cost.`;
    case 'CoastalCrisis':
      return `Next step for renters: HUD voucher access (24 CFR 982) and LIHTC unit availability (26 USC 42) are the structural pathways in coastal-crisis states. Pair with a HUD-listed Public Housing Agency for voucher intake; the wait list lengths in coastal-crisis states are commonly multi-year. The /guide/rent-burden-stacked-reading/ explains how to read all three lever signals together; the /guide/fairrent-interpretation/ explains the composite verdict logic. State-level tenant-protection statutes (rent stabilization, just-cause eviction, source-of-income discrimination protections) materially change the day-to-day outcome.`;
    case 'BurdenedButEarningAboveWage':
      return `Next step for renters: the diagnostic gap matters. If you are in the renter sub-population (typically younger, employed, urban) the OOR Multiple is the closer read for your affordability picture; if you are in the all-household median (retired, fixed income, suburban) the RentBurdenTier is closer. The /guide/renter-vs-median-income/ explains why these two reads diverge and which to use. HUD's voucher payment standards (24 CFR 982) follow the all-household median, not the renter sub-population — a subtlety in voucher administration.`;
    case 'QuietSqueeze':
      return `Next step for renters: a middle-band state requires reading the /county/ or /metro/ page for your specific area — within-state variance is non-trivial, and the composite signal at the state level can shift to either side at the county level. The /guide/rent-burden-stacked-reading/ documents how to read the three levers together. HUD FMR is updated annually (FY 2025 vintage); NLIHC OOR is annual (2025 vintage); both will be re-classified at the next data refresh.`;
  }
}

const PRIMARY_GUIDE: Record<DominantSignal, { href: string; title: string }> = {
  AffordableStable: { href: '/guide/rent-burden-tier/', title: 'RentBurdenTier methodology' },
  WageFloorFailure: { href: '/guide/oor-housing-wage-multiple/', title: 'OOR Housing Wage Multiple' },
  HighVarianceCountyLottery: { href: '/guide/fmr-county-variance/', title: 'FMR County Variance Tier' },
  CoastalCrisis: { href: '/guide/fairrent-interpretation/', title: 'How we synthesize the composite verdict' },
  BurdenedButEarningAboveWage: { href: '/guide/renter-vs-median-income/', title: 'Renter sub-population vs. all-household median' },
  QuietSqueeze: { href: '/guide/rent-burden-stacked-reading/', title: 'Reading the three levers stacked' },
};

const SECONDARY_GUIDES: Record<DominantSignal, Array<{ href: string; title: string }>> = {
  AffordableStable: [
    { href: '/guide/oor-housing-wage-multiple/', title: 'OOR Housing Wage Multiple' },
    { href: '/guide/fmr-county-variance/', title: 'FMR County Variance Tier' },
    { href: '/guide/fairrent-interpretation/', title: 'Composite verdict logic' },
  ],
  WageFloorFailure: [
    { href: '/guide/rent-burden-tier/', title: 'RentBurdenTier methodology' },
    { href: '/guide/renter-vs-median-income/', title: 'Renter sub-population vs. all-household median' },
    { href: '/guide/rent-burden-stacked-reading/', title: 'Reading the three levers stacked' },
  ],
  HighVarianceCountyLottery: [
    { href: '/guide/rent-burden-tier/', title: 'RentBurdenTier methodology' },
    { href: '/guide/oor-housing-wage-multiple/', title: 'OOR Housing Wage Multiple' },
    { href: '/guide/fairrent-interpretation/', title: 'Composite verdict logic' },
  ],
  CoastalCrisis: [
    { href: '/guide/rent-burden-tier/', title: 'RentBurdenTier methodology' },
    { href: '/guide/oor-housing-wage-multiple/', title: 'OOR Housing Wage Multiple' },
    { href: '/guide/fmr-county-variance/', title: 'FMR County Variance Tier' },
  ],
  BurdenedButEarningAboveWage: [
    { href: '/guide/rent-burden-tier/', title: 'RentBurdenTier methodology' },
    { href: '/guide/oor-housing-wage-multiple/', title: 'OOR Housing Wage Multiple' },
    { href: '/guide/fairrent-interpretation/', title: 'Composite verdict logic' },
  ],
  QuietSqueeze: [
    { href: '/guide/rent-burden-tier/', title: 'RentBurdenTier methodology' },
    { href: '/guide/oor-housing-wage-multiple/', title: 'OOR Housing Wage Multiple' },
    { href: '/guide/fmr-county-variance/', title: 'FMR County Variance Tier' },
  ],
};

export function getFairRentInterpretation(stateAbbr: string): FairRentInterpretationResult | null {
  const oor = classifyStateOorMultiple(stateAbbr);
  const variance = classifyStateFmrVariance(stateAbbr);
  if (!oor || !variance) return null;

  const row = getDb()
    .prepare(`SELECT state, fmr_2br, acs_median_household_income FROM states WHERE abbr = ?`)
    .get(stateAbbr) as { state: string; fmr_2br: number | null; acs_median_household_income: number | null } | undefined;
  if (!row) return null;

  const rentBurden = classifyRentBurdenTier({
    fmr2br: row.fmr_2br,
    medianHouseholdIncome: row.acs_median_household_income,
    geographyName: row.state,
    geographyKind: 'state',
  });

  if (rentBurden.confidence === 'insufficient-data') return null;

  const signal = classifyDominantSignal(rentBurden.tier, oor.tier, variance.tier);
  const inputs: FairRentInterpretationInputs = {
    stateName: row.state,
    stateAbbr,
    rentBurdenTier: rentBurden.tier,
    oorMultipleTier: oor.tier,
    fmrVarianceTier: variance.tier,
    rentBurdenPct: rentBurden.burdenPct,
    oorMultiple: oor.multiple,
    fmrVariancePct: variance.covPct,
  };
  const verdict = buildVerdict(signal, row.state);
  const paragraphs: [string, string, string, string] = [
    `${verdict} The dominant signal here is **${signal}** — ${SIGNAL_LABEL[signal]}.`,
    buildLeverStackParagraph(inputs),
    buildLaborMarketParagraph(signal, inputs),
    buildNextStepParagraph(signal),
  ];

  return {
    dominantSignal: signal,
    signalLabel: SIGNAL_LABEL[signal],
    tone: SIGNAL_TONE[signal],
    verdict,
    paragraphs,
    primaryGuide: PRIMARY_GUIDE[signal],
    secondaryGuides: SECONDARY_GUIDES[signal],
    inputs,
    underlying: { rentBurden, oor, variance },
  };
}

/**
 * Distribution of all 51 jurisdictions across the 6 dominant signals — used
 * by the /guide/fairrent-interpretation/ bucket table.
 */
export function getFairRentInterpretationDistribution(): {
  signal: DominantSignal;
  count: number;
  abbrs: string[];
}[] {
  const stateAbbrs = (getDb().prepare(`SELECT abbr FROM states ORDER BY abbr`).all() as { abbr: string }[]).map(
    (r) => r.abbr,
  );
  const buckets: Record<DominantSignal, string[]> = {
    AffordableStable: [],
    WageFloorFailure: [],
    HighVarianceCountyLottery: [],
    CoastalCrisis: [],
    BurdenedButEarningAboveWage: [],
    QuietSqueeze: [],
  };
  for (const abbr of stateAbbrs) {
    const r = getFairRentInterpretation(abbr);
    if (!r) continue;
    buckets[r.dominantSignal].push(abbr);
  }
  return (
    [
      'AffordableStable',
      'BurdenedButEarningAboveWage',
      'QuietSqueeze',
      'HighVarianceCountyLottery',
      'WageFloorFailure',
      'CoastalCrisis',
    ] as DominantSignal[]
  ).map((signal) => ({
    signal,
    count: buckets[signal].length,
    abbrs: buckets[signal].sort(),
  }));
}

export const FAIRRENT_INTERPRETATION_NOTES = {
  contract:
    'A state-level dominant signal across three deterministic DB-backed levers (HUD FMR FY 2025 + Census ACS 2019-2023 5-Year + NLIHC OOR 2025); not a legal eligibility determination for HUD voucher (24 CFR 982), LIHTC (26 USC 42), or state-level rent-stabilization regimes.',
  countyVsState:
    'Composite is state-level only. /county/ pages re-classify RentBurdenTier with county-level FMR and ACS inputs; OOR Multiple and FMR variance are by definition state-aggregate metrics.',
  vintageDrift:
    'Three input vintages: HUD FY 2025 (annual), Census ACS 2019-2023 5-Year (5-year rolling), NLIHC OOR 2025 (annual). Signals can drift across publication cycles.',
} as const;
