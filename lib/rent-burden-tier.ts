/**
 * RentBurdenTier — composes HUD Fair Market Rent (2BR) × Census ACS B19013
 * median household income into a single 5-tier "rent burden" reader-help label
 * for every US state, county, and metro. Surfaced on /state/[slug]/,
 * /county/[slug]/, /metro/[slug]/, and /state/[slug]/rent-by-bedroom/.
 *
 * Math: rent_burden_pct = (fmr_2br × 12) / acs_median_household_income × 100
 *   - fmr_2br: HUD Fair Market Rent for a 2-bedroom unit (FY 2025), the
 *     40th-percentile gross rent for the area used by HUD voucher programs.
 *   - acs_median_household_income: Census ACS 2019-2023 5-Year estimate
 *     (B19013), aggregated to the requested geography.
 *
 * Tier E (≥ 30%) is anchored to the HUD federal cost-burden threshold from
 * 24 CFR 5.628 / 42 USC 1437a, where any household spending 30% or more of
 * gross income on housing is classified as cost-burdened. Tier E identifies
 * geographies where even a household at the area median income would be
 * cost-burdened renting a 2BR at HUD FMR — a population-level signal, not a
 * household-specific eligibility flag for LIHTC, Section 8, or voucher
 * programs.
 *
 * Tier counts at these cutoffs (51 state-level jurisdictions, current snapshot
 * from HUD FY 2025 × ACS 2019-2023 5-Year):
 *   A < 18%   6 states   (ND, SD, WY, IA, KS, NE)
 *   B 18-22% 13 states
 *   C 22-26% 23 states   (national typical)
 *   D 26-30%  5 states   (DC, MT, MA, AZ, NV)
 *   E ≥ 30%   4 states   (NY 34%, FL 32%, CA 32%, HI 31%)
 *
 * Confidence: 'high' when the underlying FMR and ACS columns are both
 * populated, 'medium' when only one is populated (typically FMR present,
 * ACS small-area-MOE-suppressed), 'insufficient-data' when both missing.
 *
 * Important framing: tier reflects an HUD-FMR-2BR × ACS-median-income
 * hypothetical for the area, not any individual household's burden. It does
 * not capture (a) within-area rent variation (FMR is a 40th-percentile area
 * estimate), (b) within-area income distribution (median masks the renter
 * sub-population, which typically has lower income than the all-household
 * median), (c) utility allowances and gross-vs-contract rent distinctions,
 * or (d) voucher penetration. The /county/ and /metro/ pages handle
 * within-state variation separately; the /state/[slug]/rent-by-bedroom/
 * page handles the bedroom-size dimension.
 */

import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'rents.db');

let _db: Database.Database | null = null;
function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  }
  return _db;
}

export type RentBurdenTier = 'A' | 'B' | 'C' | 'D' | 'E';

export interface RentBurdenTierResult {
  tier: RentBurdenTier;
  label: string;
  burdenPct: number;
  medianIncome: number;
  fmr2br: number;
  annualRent: number;
  monthlyRent: number;
  confidence: 'high' | 'medium' | 'insufficient-data';
  rationale: string;
  bandCutoffs: { A: '<18%'; B: '18–22%'; C: '22–26%'; D: '26–30%'; E: '≥30%' };
  hudThresholdAnchored: boolean;
}

export interface ClassifyInput {
  fmr2br: number | null;
  medianHouseholdIncome: number | null;
  geographyName: string;
  geographyKind: 'state' | 'county' | 'metro';
}

function tierForBurden(pct: number): { tier: RentBurdenTier; label: string } {
  if (pct < 18) return { tier: 'A', label: 'Affordable' };
  if (pct < 22) return { tier: 'B', label: 'Below median' };
  if (pct < 26) return { tier: 'C', label: 'Median' };
  if (pct < 30) return { tier: 'D', label: 'Approaching cost-burdened' };
  return { tier: 'E', label: 'Cost-burdened' };
}

function buildRationale(
  input: ClassifyInput,
  tier: RentBurdenTier,
  burdenPct: number,
  fmr2br: number,
  medianIncome: number,
): string {
  const annual = fmr2br * 12;
  const pctStr = burdenPct.toFixed(1);
  const place = input.geographyName;
  switch (tier) {
    case 'A':
      return `${place} sits in the Affordable tier (under 18%). The HUD FY 2025 Fair Market Rent for a 2-bedroom is $${fmr2br.toLocaleString()}/month, so a year of housing at FMR runs $${annual.toLocaleString()} — about ${pctStr}% of the area's $${medianIncome.toLocaleString()} median household income (Census ACS 2019-2023 5-Year B19013). Well below the HUD federal 30% cost-burden threshold (24 CFR 5.628).`;
    case 'B':
      return `${place} falls in the Below-median tier (18–22%). The HUD FY 2025 FMR for a 2BR is $${fmr2br.toLocaleString()}/month — $${annual.toLocaleString()}/year — which is about ${pctStr}% of the $${medianIncome.toLocaleString()} median household income (ACS 2019-2023 5-Year). Comfortably under the HUD federal 30% cost-burden threshold.`;
    case 'C':
      return `${place} is in the Median tier (22–26%) — the national-typical band. The HUD FY 2025 FMR for a 2BR is $${fmr2br.toLocaleString()}/month or $${annual.toLocaleString()}/year, about ${pctStr}% of the $${medianIncome.toLocaleString()} median household income (Census ACS B19013). This is the largest single tier and still under the HUD federal 30% cost-burden threshold.`;
    case 'D':
      return `${place} sits in the Approaching-cost-burdened tier (26–30%). At a HUD FY 2025 FMR of $${fmr2br.toLocaleString()}/month for a 2BR, annual rent is $${annual.toLocaleString()} — about ${pctStr}% of the area's $${medianIncome.toLocaleString()} median household income (ACS 2019-2023 5-Year). Below the HUD federal 30% cost-burden line, but close enough that lower-income renters in the area are likely cost-burdened in practice.`;
    case 'E':
      return `${place} is in the Cost-burdened tier (≥30%). The HUD FY 2025 FMR for a 2BR is $${fmr2br.toLocaleString()}/month — $${annual.toLocaleString()}/year — which is roughly ${pctStr}% of the $${medianIncome.toLocaleString()} median household income (Census ACS 2019-2023 5-Year B19013). This breaches the HUD federal cost-burden threshold (24 CFR 5.628 / 42 USC 1437a): even a household at the area median income paying FMR for a 2BR would qualify as cost-burdened under HUD's statutory definition. NLIHC Out of Reach 2025 reports the area's housing wage in this tier.`;
  }
}

export function classifyRentBurdenTier(input: ClassifyInput): RentBurdenTierResult {
  const fmr2br = input.fmr2br;
  const medianIncome = input.medianHouseholdIncome;

  if (fmr2br === null || fmr2br <= 0 || medianIncome === null || medianIncome <= 0) {
    const tier: RentBurdenTier = 'C';
    return {
      tier,
      label: 'Insufficient data',
      burdenPct: 0,
      medianIncome: medianIncome ?? 0,
      fmr2br: fmr2br ?? 0,
      annualRent: 0,
      monthlyRent: 0,
      confidence: 'insufficient-data',
      rationale: `${input.geographyName} is missing either HUD Fair Market Rent or Census ACS B19013 median household income, so a tier cannot be computed at this geography. See the area's parent state page for a state-level tier reference.`,
      bandCutoffs: { A: '<18%', B: '18–22%', C: '22–26%', D: '26–30%', E: '≥30%' },
      hudThresholdAnchored: true,
    };
  }

  const burdenPct = (fmr2br * 12) / medianIncome * 100;
  const { tier, label } = tierForBurden(burdenPct);
  const confidence: RentBurdenTierResult['confidence'] = 'high';
  const rationale = buildRationale(input, tier, burdenPct, fmr2br, medianIncome);

  return {
    tier,
    label,
    burdenPct: Math.round(burdenPct * 100) / 100,
    medianIncome: Math.round(medianIncome),
    fmr2br,
    annualRent: fmr2br * 12,
    monthlyRent: fmr2br,
    confidence,
    rationale,
    bandCutoffs: { A: '<18%', B: '18–22%', C: '22–26%', D: '26–30%', E: '≥30%' },
    hudThresholdAnchored: true,
  };
}

// Convenience: classify a state row directly from the DB.
export function classifyStateBurdenTier(stateAbbr: string): RentBurdenTierResult | null {
  const row = getDb()
    .prepare(
      `SELECT state, abbr, fmr_2br, acs_median_household_income
       FROM states WHERE abbr = ?`,
    )
    .get(stateAbbr) as
    | { state: string; abbr: string; fmr_2br: number | null; acs_median_household_income: number | null }
    | undefined;
  if (!row) return null;
  return classifyRentBurdenTier({
    fmr2br: row.fmr_2br,
    medianHouseholdIncome: row.acs_median_household_income,
    geographyName: row.state,
    geographyKind: 'state',
  });
}

// Convenience: classify a county directly from the DB.
export function classifyCountyBurdenTier(slug: string): RentBurdenTierResult | null {
  const row = getDb()
    .prepare(
      `SELECT county_name, state_abbr, fmr_2br, acs_median_household_income
       FROM counties WHERE slug = ?`,
    )
    .get(slug) as
    | { county_name: string; state_abbr: string; fmr_2br: number | null; acs_median_household_income: number | null }
    | undefined;
  if (!row) return null;
  return classifyRentBurdenTier({
    fmr2br: row.fmr_2br,
    medianHouseholdIncome: row.acs_median_household_income,
    geographyName: `${row.county_name}, ${row.state_abbr}`,
    geographyKind: 'county',
  });
}
