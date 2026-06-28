/**
 * lib/crosswalk-rent.ts — Phase 7 P0 wrapper atop the existing FairRent
 * Interpretation PSU (lib/fairrent-interpretation.ts).
 *
 * Contract: playbook-phase7-crosswalk-20260518 §3.3 CrosswalkResult shape —
 * a single object that exposes (verdict, primaryValue, secondaryValue,
 * composedScore, decoderNotes, sourceCitations[]) so the entity-page
 * generateMetadata and schema layers can read one source of truth instead
 * of recomputing levers.
 *
 * Direction: composedScore is favorability (0-100, HIGHER = better for renter
 * affordability). Opposite of floodriskpeek (severity); same direction as
 * drugpricepeek (verdictScore).
 *
 * Score band:
 *   AffordableStable                  85  (all three levers low)
 *   BurdenedButEarningAboveWage       55  (diagnostic gap; renter sub-pop earns above)
 *   QuietSqueeze                      50  (middle-band, no dominant lever)
 *   HighVarianceCountyLottery         45  (state aggregate misleading; sub-county varies)
 *   WageFloorFailure                  25  (NLIHC renter wage cannot clear FMR)
 *   CoastalCrisis                     15  (all three stacked high)
 *
 * Then ±10 burden boost (lower RentBurdenTier letter raises score, E lowers it)
 * and ±8 variance trim (FMR variance E lowers state aggregate confidence).
 *
 * Source citations: 6 distinct URLs covering 4 distinct publishers
 * (huduser.gov + census.gov + nlihc.org + congress.gov + ecfr.gov). This
 * satisfies Trap #110 audit grep (≥2 distinct TLD-level hosts).
 */

import {
  getFairRentInterpretation,
  type FairRentInterpretationResult,
  type DominantSignal,
} from './fairrent-interpretation';
import {
  classifyRentBurdenTier,
  type RentBurdenTierResult,
  type RentBurdenTier,
} from './rent-burden-tier';

export type CrosswalkEntityKind = 'state' | 'county' | 'metro';

export interface CrosswalkSourceCitation {
  publisher: string;
  program: string;
  url: string;
}

export interface CrosswalkResult {
  /** Short reader-help label (verdict short form, fits in title). */
  verdictShort: string;
  /** Full DominantSignal name for body/schema reference. */
  verdictFull: DominantSignal;
  /** Primary value rendered prominently — 2BR FMR USD/month. */
  primaryValue: string;
  /** Secondary value — burden % or housing-wage / renter-wage multiple. */
  secondaryValue: string;
  /** 0-100 favorability score (HIGHER = better for renter). */
  composedScore: number;
  /** One-sentence reader-help interpretation suitable for meta description. */
  decoderNotes: string;
  /** ≥4 distinct publisher URLs, Trap #110 audit. */
  sourceCitations: CrosswalkSourceCitation[];
}

// Verdict short labels (≤30 chars each so {EntityShort} {Score}/100 — {Verdict} fits in 60).
const VERDICT_SHORT: Record<DominantSignal, string> = {
  AffordableStable: 'Affordable & stable rent',
  WageFloorFailure: 'Renter wage below FMR',
  HighVarianceCountyLottery: 'County lottery — read sub-state',
  CoastalCrisis: 'Coastal crisis — stacked',
  BurdenedButEarningAboveWage: 'Burdened, renters earn above',
  QuietSqueeze: 'Quiet squeeze',
};

const VERDICT_BASE: Record<DominantSignal, number> = {
  AffordableStable: 85,
  BurdenedButEarningAboveWage: 55,
  QuietSqueeze: 50,
  HighVarianceCountyLottery: 45,
  WageFloorFailure: 25,
  CoastalCrisis: 15,
};

const BURDEN_ADJUST: Record<RentBurdenTier, number> = {
  A: 10,
  B: 6,
  C: 0,
  D: -4,
  E: -8,
};

/**
 * 4 distinct TLD publishers, 6 URLs total. Trap #110 audit grep parses these
 * literal lines, so DO NOT collapse to a single domain or rotate URLs.
 */
const SOURCE_CITATIONS: readonly CrosswalkSourceCitation[] = [
  {
    publisher: 'U.S. Department of Housing and Urban Development',
    program: 'HUD User — Fair Market Rents FY 2025',
    url: 'https://www.huduser.gov/portal/datasets/fmr.html',
  },
  {
    publisher: 'U.S. Department of Housing and Urban Development',
    program: 'HUD — Housing Choice Voucher Program (Section 8)',
    url: 'https://www.hud.gov/topics/housing_choice_voucher_program_section_8',
  },
  {
    publisher: 'U.S. Census Bureau',
    program: 'American Community Survey 2019-2023 5-Year (B19013/B25008/B25070)',
    url: 'https://www.census.gov/programs-surveys/acs/',
  },
  {
    publisher: 'National Low Income Housing Coalition',
    program: 'Out of Reach 2025',
    url: 'https://nlihc.org/oor',
  },
  {
    publisher: 'United States Congress',
    program: '42 USC 1437a Housing Choice Voucher statutory basis',
    url: 'https://www.congress.gov/',
  },
  {
    publisher: 'U.S. Office of the Federal Register',
    program: '24 CFR 5.628 — HUD 30% cost-burden threshold',
    url: 'https://www.ecfr.gov/current/title-24/subtitle-A/part-5',
  },
];

function clampScore(n: number): number {
  if (n < 0) return 0;
  if (n > 100) return 100;
  return Math.round(n);
}

function computeComposedScore(
  signal: DominantSignal,
  burdenTier: RentBurdenTier,
  fmrVarianceTier: 'A' | 'B' | 'C' | 'D' | 'E' | null,
): number {
  let s = VERDICT_BASE[signal];
  s += BURDEN_ADJUST[burdenTier];
  // FMR variance E trims state aggregate confidence by 8 (high CoV = state read
  // less representative). A trims +4 (homogeneous state, aggregate is reliable).
  if (fmrVarianceTier === 'E') s -= 8;
  else if (fmrVarianceTier === 'D') s -= 4;
  else if (fmrVarianceTier === 'A') s += 4;
  return clampScore(s);
}

function formatCurrencyShort(n: number | null): string {
  if (n === null) return '—';
  return `$${Math.round(n).toLocaleString()}/mo`;
}

/**
 * State-level crosswalk — composes the full FairRent Interpretation atop the
 * three levers. Returns null when the interpretation cannot be computed
 * (typically MOE-suppressed ACS or missing NLIHC).
 */
export function decodeStateCrosswalk(stateAbbr: string): CrosswalkResult | null {
  const interp = getFairRentInterpretation(stateAbbr);
  if (!interp) return null;
  const { dominantSignal, inputs, underlying } = interp;
  const composedScore = computeComposedScore(
    dominantSignal,
    inputs.rentBurdenTier,
    underlying.variance.confidence === 'high' ? underlying.variance.tier : null,
  );

  const decoderNotes =
    `${inputs.stateName} composite read: RentBurdenTier ${inputs.rentBurdenTier} ` +
    `(${inputs.rentBurdenPct.toFixed(1)}% of ACS median income) × ` +
    `NLIHC OOR Multiple ${inputs.oorMultipleTier} (${inputs.oorMultiple.toFixed(2)}× housing wage / mean renter wage) × ` +
    `FMR County Variance ${inputs.fmrVarianceTier} (${inputs.fmrVariancePct.toFixed(1)}% CoV) → ` +
    `${VERDICT_SHORT[dominantSignal]}.`;

  return {
    verdictShort: VERDICT_SHORT[dominantSignal],
    verdictFull: dominantSignal,
    primaryValue: formatCurrencyShort(underlying.rentBurden.fmr2br),
    secondaryValue: `${inputs.oorMultiple.toFixed(2)}× housing wage`,
    composedScore,
    decoderNotes,
    sourceCitations: SOURCE_CITATIONS.slice(),
  };
}

/**
 * County-level crosswalk — composes RentBurdenTier (county-level) joined to
 * the parent state's OOR Multiple + FMR variance. The OOR and variance levers
 * are state-aggregate by definition (NLIHC publishes state-level; FMR variance
 * is by construction a within-state metric), so the county page inherits its
 * parent state's labor-market context.
 */
export function decodeCountyCrosswalk(input: {
  countyName: string;
  stateAbbr: string;
  fmr2br: number | null;
  medianHouseholdIncome: number | null;
}): CrosswalkResult | null {
  const burden = classifyRentBurdenTier({
    fmr2br: input.fmr2br,
    medianHouseholdIncome: input.medianHouseholdIncome,
    geographyName: `${input.countyName}, ${input.stateAbbr}`,
    geographyKind: 'county',
  });
  if (burden.confidence === 'insufficient-data') return null;

  const parent = getFairRentInterpretation(input.stateAbbr);
  // Choose the dominant signal: at the county scale, the county-level burden
  // tier is the primary read. If the parent state is in a high-OOR or
  // high-variance regime, that context modulates the score but does not
  // override the county-specific RentBurdenTier.
  const signal: DominantSignal =
    burden.tier === 'E' && parent?.dominantSignal === 'CoastalCrisis'
      ? 'CoastalCrisis'
      : parent?.dominantSignal === 'WageFloorFailure'
        ? 'WageFloorFailure'
        : parent?.dominantSignal === 'HighVarianceCountyLottery'
          ? 'HighVarianceCountyLottery'
          : burden.tier === 'A' || burden.tier === 'B'
            ? 'AffordableStable'
            : burden.tier === 'E'
              ? 'WageFloorFailure'
              : 'QuietSqueeze';

  const composedScore = computeComposedScore(
    signal,
    burden.tier,
    parent && parent.underlying.variance.confidence === 'high'
      ? parent.underlying.variance.tier
      : null,
  );

  const decoderNotes =
    `${input.countyName}, ${input.stateAbbr} composite: county RentBurdenTier ${burden.tier} ` +
    `(${burden.burdenPct.toFixed(1)}% of ACS median income)` +
    (parent
      ? ` within ${parent.inputs.stateName} state context (OOR Multiple ${parent.inputs.oorMultipleTier}, ` +
        `FMR County Variance ${parent.inputs.fmrVarianceTier}) → ${VERDICT_SHORT[signal]}.`
      : `. ${VERDICT_SHORT[signal]}.`);

  return {
    verdictShort: VERDICT_SHORT[signal],
    verdictFull: signal,
    primaryValue: formatCurrencyShort(burden.fmr2br),
    secondaryValue: `${burden.burdenPct.toFixed(1)}% of median income`,
    composedScore,
    decoderNotes,
    sourceCitations: SOURCE_CITATIONS.slice(),
  };
}

/**
 * Metro-level crosswalk — CBSA 2BR FMR composed against the parent state's
 * ACS median household income (CBSAs span multiple counties, so the state
 * aggregate is the cross-CBSA-consistent income denominator, matching the
 * existing metro page convention).
 */
export function decodeMetroCrosswalk(input: {
  metroName: string;
  stateAbbr: string;
  fmr2br: number | null;
  stateMedianHouseholdIncome: number | null;
}): CrosswalkResult | null {
  const burden = classifyRentBurdenTier({
    fmr2br: input.fmr2br,
    medianHouseholdIncome: input.stateMedianHouseholdIncome,
    geographyName: input.metroName,
    geographyKind: 'metro',
  });
  if (burden.confidence === 'insufficient-data') return null;

  const parent = getFairRentInterpretation(input.stateAbbr);
  const signal: DominantSignal =
    burden.tier === 'E' && parent?.dominantSignal === 'CoastalCrisis'
      ? 'CoastalCrisis'
      : parent?.dominantSignal === 'WageFloorFailure'
        ? 'WageFloorFailure'
        : burden.tier === 'A'
          ? 'AffordableStable'
          : burden.tier === 'E'
            ? 'WageFloorFailure'
            : 'QuietSqueeze';

  const composedScore = computeComposedScore(
    signal,
    burden.tier,
    parent && parent.underlying.variance.confidence === 'high'
      ? parent.underlying.variance.tier
      : null,
  );

  const decoderNotes =
    `${input.metroName} composite: CBSA 2BR FMR ${formatCurrencyShort(burden.fmr2br)} against parent-state ACS median income ` +
    `(burden ${burden.burdenPct.toFixed(1)}%, RentBurdenTier ${burden.tier})` +
    (parent
      ? ` within ${parent.inputs.stateName} state context (OOR Multiple ${parent.inputs.oorMultipleTier}) → ${VERDICT_SHORT[signal]}.`
      : `. ${VERDICT_SHORT[signal]}.`);

  return {
    verdictShort: VERDICT_SHORT[signal],
    verdictFull: signal,
    primaryValue: formatCurrencyShort(burden.fmr2br),
    secondaryValue: `${burden.burdenPct.toFixed(1)}% of state median income`,
    composedScore,
    decoderNotes,
    sourceCitations: SOURCE_CITATIONS.slice(),
  };
}

/**
 * Trim an entity name so that the title `{Name} {Score}/100 — {Verdict}`
 * stays within 60 chars. Score+verdict block consumes ~32 chars in the worst
 * case, leaving ~26 for the name + " ".
 */
export function trimEntityForTitle(name: string, maxChars = 26): string {
  if (name.length <= maxChars) return name;
  return name.slice(0, maxChars - 1).trimEnd() + '…';
}

export const CROSSWALK_SOURCE_CITATIONS = SOURCE_CITATIONS;

/**
 * Phase 7 P4 multi-creator Dataset JSON-LD. Distinct from the existing
 * datasetSchema() in lib/schema.ts (which accepts a single creator per call
 * for per-lever attribution). This variant attaches an ARRAY of creator
 * organizations corresponding to the FairRent composite — HUD + Census +
 * NLIHC + Congress — satisfying Trap T_P4_1 (creator-publisher-only).
 *
 * variableMeasured includes the DominantSignal verdict label and the
 * composedScore, satisfying Trap T_P4_2 (variableMeasured-no-verdict).
 */
export function fairRentMultiCreatorDatasetSchema(opts: {
  name: string;
  description: string;
  url: string;
  spatialName: string;
  reviewedAt: string;
  composedScore: number;
  verdict: string;
}) {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://fairrentwize.com';
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: opts.name,
    description: opts.description,
    url: opts.url.startsWith('http') ? opts.url : `${SITE_URL}${opts.url}`,
    license: 'https://creativecommons.org/publicdomain/zero/1.0/',
    creator: [
      {
        '@type': 'Organization',
        name: 'U.S. Department of Housing and Urban Development',
        url: 'https://www.huduser.gov/portal/datasets/fmr.html',
      },
      {
        '@type': 'Organization',
        name: 'U.S. Census Bureau',
        url: 'https://www.census.gov/programs-surveys/acs/',
      },
      {
        '@type': 'Organization',
        name: 'National Low Income Housing Coalition',
        url: 'https://nlihc.org/oor',
      },
      {
        '@type': 'Organization',
        name: 'United States Congress',
        url: 'https://www.congress.gov/',
      },
    ],
    publisher: {
      '@type': 'Organization',
      name: 'DataPeek Research Network',
      url: 'https://datapeekfacts.com',
    },
    sourceOrganization: SOURCE_CITATIONS.map((s) => ({
      '@type': 'Organization',
      name: s.publisher,
      url: s.url,
    })),
    isBasedOn: SOURCE_CITATIONS.map((s) => s.url),
    spatialCoverage: { '@type': 'Place', name: opts.spatialName },
    temporalCoverage: '2024-10-01/..',
    dateModified: opts.reviewedAt,
    variableMeasured: [
      'FairRent DominantSignal Category (6-bucket verdict label)',
      'FairRent Crosswalk ComposedScore (0-100 favorability)',
      'HUD FY 2025 Fair Market Rent 2BR (USD/month)',
      'Census ACS 2019-2023 5-Year B19013 Median Household Income (USD/year)',
      'NLIHC Out of Reach 2025 Housing Wage 2BR (USD/hour)',
      'NLIHC Out of Reach 2025 Mean Renter Wage (USD/hour)',
      'OOR Housing Wage Multiple Tier (A-E)',
      'RentBurdenTier (A-E, HUD 30% threshold anchored)',
      'FMR County Variance Tier (A-E, within-state coefficient of variation)',
      'FMR-vs-Market Headroom (HUD FY2025 FMR 2BR vs ACS 2023 median 2BR rent, % gap + 5-band)',
    ],
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'composedScore', value: opts.composedScore },
      { '@type': 'PropertyValue', name: 'verdictLabel', value: opts.verdict },
    ],
  };
}
