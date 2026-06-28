/**
 * OorHousingWageMultiple — composes the NLIHC Out of Reach 2025 "housing wage"
 * (hourly wage needed to afford a 2BR at HUD FMR without exceeding 30% of
 * income, 40 hours per week, 52 weeks per year) against the NLIHC-reported
 * MEAN RENTER WAGE for the same jurisdiction, producing a 5-tier label that
 * captures the labor-market gap between what renters actually earn and what
 * affording a 2BR at FMR demands.
 *
 * This is deliberately DIFFERENT from RentBurdenTier:
 *   - RentBurdenTier compares HUD FMR 2BR × 12 against Census ACS B19013
 *     median household income (ALL households, owners + renters mixed). It
 *     answers: "Is a median household in this area cost-burdened at FMR?"
 *   - OorHousingWageMultiple compares NLIHC's modeled housing wage against
 *     NLIHC's mean renter wage (RENTER sub-population only, NLIHC field
 *     survey baseline). It answers: "Is the typical renter in this area
 *     earning enough to afford a 2BR at FMR without cost-burden?"
 *
 * Both levers cite HUD FMR FY2025 on the rent side, but the income side
 * diverges (all-household ACS vs renter-only NLIHC), so the tier assignments
 * frequently disagree — a state can be RentBurdenTier C and OorMultiple E
 * (e.g. high-renter-share metros where the renter sub-population earns far
 * less than the all-household median). That gap is the editorial point.
 *
 * Math: multiple = nlihc_housing_wage_2br / nlihc_mean_renter_wage
 *   - nlihc_housing_wage_2br: NLIHC OOR 2025 modeled hourly housing wage
 *     for a 2BR at HUD FMR, 30% of income at 40h/wk × 52 weeks.
 *   - nlihc_mean_renter_wage: NLIHC OOR 2025 reported mean hourly wage of
 *     wage-and-salary renters in the jurisdiction (CPS-derived).
 *
 * Tier counts at these cutoffs (51 state-level jurisdictions, NLIHC OOR 2025):
 *   A < 1.10×   3 jurisdictions (ND, AR, SD — renter wage within slack of housing wage)
 *   B 1.10–1.25× 15 jurisdictions
 *   C 1.25–1.45× 15 jurisdictions (national-typical labor-market gap)
 *   D 1.45–1.65× 12 jurisdictions (persistent two-job gap)
 *   E ≥ 1.65×    6 jurisdictions (HI 2.24, MD 1.75, RI 1.74, NH 1.68, VT 1.68, NJ 1.67)
 *
 * Cutoffs calibrated against NLIHC OOR 2025 actual distribution, not arbitrary
 * round numbers. Tier E (≥1.65×) captures the top decile where a single
 * full-time renter at the mean renter wage cannot afford 2BR at FMR even at
 * 65+ hours/week — i.e. the labor market structurally fails the rental
 * market.
 *
 * Hours-per-week-at-40 companion: hoursPerWeekAt40 = multiple × 40. A renter
 * at the mean renter wage would need to work this many hours weekly to
 * afford a 2BR at FMR without exceeding the HUD 30% threshold. NLIHC OOR
 * publishes this figure prominently.
 *
 * Federal minimum wage anchor: hoursPerWeekAtFedMinWage = housing_wage / 7.25
 * × 40. DOL FLSA federal floor is $7.25/hr since 2009. NLIHC OOR's headline
 * statistic ("X hours/week at minimum wage") uses this denominator. Surfaced
 * as commentary but NOT used for tier classification (would collapse all
 * states into E at federal min wage; 23 states + DC have higher min wages,
 * so federal floor is not the binding constraint for most of the population).
 *
 * Confidence: 'high' when both NLIHC columns populated, 'insufficient-data'
 * when either is null or non-positive. The /states/ table has full coverage
 * (NLIHC publishes state-level OOR for all 50 states + DC). County-level
 * NLIHC OOR exists but is not currently ingested into the counties table;
 * county lookup returns null.
 *
 * Important framing: tier reflects the relationship between two NLIHC OOR
 * 2025 modeled quantities at the state level. It does not reflect (a) any
 * individual renter's wage, (b) the renter wage distribution (only the
 * mean), (c) within-state geographic variation in either housing wage or
 * mean renter wage (see /county/ and /metro/ pages and the FMR variance
 * lever for that), or (d) non-wage income (Social Security, transfer
 * programs) that NLIHC's wage-earner framing excludes.
 */

import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'rents.db');
const FEDERAL_MIN_WAGE_USD_PER_HOUR = 7.25; // DOL FLSA federal floor, unchanged since 2009-07-24.

let _db: Database.Database | null = null;
function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  }
  return _db;
}

export type OorMultipleTier = 'A' | 'B' | 'C' | 'D' | 'E';

export interface OorMultipleResult {
  tier: OorMultipleTier;
  label: string;
  multiple: number;
  housingWage2BR: number;
  meanRenterWage: number;
  hoursPerWeekAt40: number;
  hoursPerWeekAtFedMinWage: number;
  federalMinWageUsdPerHour: number;
  confidence: 'high' | 'insufficient-data';
  rationale: string;
  bandCutoffs: { A: '<1.10×'; B: '1.10–1.25×'; C: '1.25–1.45×'; D: '1.45–1.65×'; E: '≥1.65×' };
  nlihcAnchored: boolean;
}

export interface ClassifyOorMultipleInput {
  housingWage2BR: number | null;
  meanRenterWage: number | null;
  geographyName: string;
}

function tierForMultiple(multiple: number): { tier: OorMultipleTier; label: string } {
  if (multiple < 1.10) return { tier: 'A', label: 'Renter wage covers FMR' };
  if (multiple < 1.25) return { tier: 'B', label: 'Modest gap' };
  if (multiple < 1.45) return { tier: 'C', label: 'Typical gap' };
  if (multiple < 1.65) return { tier: 'D', label: 'Persistent gap' };
  return { tier: 'E', label: 'Structural labor-market failure' };
}

function buildRationale(
  input: ClassifyOorMultipleInput,
  tier: OorMultipleTier,
  multiple: number,
  housingWage: number,
  meanRenterWage: number,
  hoursAt40: number,
  hoursAtFedMin: number,
): string {
  const place = input.geographyName;
  const multStr = multiple.toFixed(2);
  const hwStr = housingWage.toFixed(2);
  const mrwStr = meanRenterWage.toFixed(2);
  const hoursAt40Str = hoursAt40.toFixed(0);
  const hoursAtFedMinStr = hoursAtFedMin.toFixed(0);
  switch (tier) {
    case 'A':
      return `${place} sits in tier A (renter wage covers FMR). NLIHC Out of Reach 2025 reports a 2BR housing wage of $${hwStr}/hr against a mean renter wage of $${mrwStr}/hr — a multiple of ${multStr}×, meaning the typical wage-earning renter works roughly ${hoursAt40Str} hours per week to afford a 2BR at HUD FY 2025 Fair Market Rent without exceeding the HUD 30% cost-burden threshold (24 CFR 5.628). At the DOL FLSA federal minimum wage of $7.25/hour, the same housing would require ${hoursAtFedMinStr} hours per week, but the area's mean renter wage exceeds the federal floor, so this is a pass-through comparison.`;
    case 'B':
      return `${place} is in tier B (modest gap). NLIHC OOR 2025 reports a 2BR housing wage of $${hwStr}/hr versus a mean renter wage of $${mrwStr}/hr, a ${multStr}× multiple. The typical wage-earning renter works about ${hoursAt40Str} hours per week to afford a 2BR at HUD FMR within the HUD 30% threshold; at the DOL FLSA federal $7.25/hour floor, ${hoursAtFedMinStr} hours per week. Most renters need a moderate income premium above the area mean to clear FMR without cost-burden.`;
    case 'C':
      return `${place} falls in tier C (national-typical gap). NLIHC Out of Reach 2025 reports a 2BR housing wage of $${hwStr}/hr versus a mean renter wage of $${mrwStr}/hr — a ${multStr}× multiple, meaning the typical renter would need to work approximately ${hoursAt40Str} hours per week at the area mean renter wage to afford a 2BR at HUD FY 2025 Fair Market Rent without exceeding the HUD federal 30% cost-burden threshold (24 CFR 5.628). The DOL FLSA federal $7.25/hour minimum-wage equivalent is ${hoursAtFedMinStr} hours per week. This is the most populated band — a structural gap exists but is bridgeable with a wage premium or smaller unit.`;
    case 'D':
      return `${place} sits in tier D (persistent gap). NLIHC OOR 2025 reports a 2BR housing wage of $${hwStr}/hr against a mean renter wage of $${mrwStr}/hr, a ${multStr}× multiple. The typical renter would need approximately ${hoursAt40Str} hours per week (versus a 40-hour standard week) at the area mean renter wage to afford a 2BR at HUD FMR within the 30% HUD threshold. At the DOL FLSA federal $7.25/hour minimum wage, ${hoursAtFedMinStr} hours per week. In practice, this band requires either two-earner households, second jobs, or unit downsizing to clear FMR; most renters at the mean cannot afford a 2BR alone.`;
    case 'E':
      return `${place} is in tier E (structural labor-market failure). NLIHC Out of Reach 2025 reports a 2BR housing wage of $${hwStr}/hr against a mean renter wage of $${mrwStr}/hr — a ${multStr}× multiple. A renter at the area mean renter wage would need to work roughly ${hoursAt40Str} hours per week to afford a 2BR at HUD FY 2025 Fair Market Rent without exceeding the HUD federal 30% cost-burden threshold (24 CFR 5.628 / 42 USC 1437a). At the DOL FLSA federal $7.25/hour minimum wage, ${hoursAtFedMinStr} hours per week. The area's labor market and rental market are structurally misaligned: even a renter earning the area's MEAN renter wage cannot afford the area's HUD FMR 2BR through wages alone. NLIHC OOR 2025 ranks this jurisdiction in the top decile of housing-wage-to-renter-wage gaps nationally.`;
  }
}

export function classifyOorMultiple(input: ClassifyOorMultipleInput): OorMultipleResult {
  const housingWage = input.housingWage2BR;
  const meanRenterWage = input.meanRenterWage;

  if (
    housingWage === null ||
    housingWage <= 0 ||
    meanRenterWage === null ||
    meanRenterWage <= 0
  ) {
    return {
      tier: 'C',
      label: 'Insufficient data',
      multiple: 0,
      housingWage2BR: housingWage ?? 0,
      meanRenterWage: meanRenterWage ?? 0,
      hoursPerWeekAt40: 0,
      hoursPerWeekAtFedMinWage: 0,
      federalMinWageUsdPerHour: FEDERAL_MIN_WAGE_USD_PER_HOUR,
      confidence: 'insufficient-data',
      rationale: `${input.geographyName} is missing either the NLIHC housing wage or the NLIHC mean renter wage, so an OOR multiple cannot be computed. NLIHC Out of Reach publishes state-level data for all 50 states + DC; county-level NLIHC OOR is not currently ingested into this site's counties table.`,
      bandCutoffs: { A: '<1.10×', B: '1.10–1.25×', C: '1.25–1.45×', D: '1.45–1.65×', E: '≥1.65×' },
      nlihcAnchored: true,
    };
  }

  const multiple = housingWage / meanRenterWage;
  const hoursAt40 = multiple * 40;
  const hoursAtFedMin = (housingWage / FEDERAL_MIN_WAGE_USD_PER_HOUR) * 40;
  const { tier, label } = tierForMultiple(multiple);
  const rationale = buildRationale(
    input,
    tier,
    multiple,
    housingWage,
    meanRenterWage,
    hoursAt40,
    hoursAtFedMin,
  );

  return {
    tier,
    label,
    multiple: Math.round(multiple * 100) / 100,
    housingWage2BR: Math.round(housingWage * 100) / 100,
    meanRenterWage: Math.round(meanRenterWage * 100) / 100,
    hoursPerWeekAt40: Math.round(hoursAt40),
    hoursPerWeekAtFedMinWage: Math.round(hoursAtFedMin),
    federalMinWageUsdPerHour: FEDERAL_MIN_WAGE_USD_PER_HOUR,
    confidence: 'high',
    rationale,
    bandCutoffs: { A: '<1.10×', B: '1.10–1.25×', C: '1.25–1.45×', D: '1.45–1.65×', E: '≥1.65×' },
    nlihcAnchored: true,
  };
}

export function classifyStateOorMultiple(stateAbbr: string): OorMultipleResult | null {
  const row = getDb()
    .prepare(
      `SELECT state, abbr, nlihc_housing_wage_2br, nlihc_mean_renter_wage
       FROM states WHERE abbr = ?`,
    )
    .get(stateAbbr) as
    | {
        state: string;
        abbr: string;
        nlihc_housing_wage_2br: number | null;
        nlihc_mean_renter_wage: number | null;
      }
    | undefined;
  if (!row) return null;
  return classifyOorMultiple({
    housingWage2BR: row.nlihc_housing_wage_2br,
    meanRenterWage: row.nlihc_mean_renter_wage,
    geographyName: row.state,
  });
}
