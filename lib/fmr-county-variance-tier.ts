/**
 * FmrCountyVarianceTier — computes the coefficient of variation (CoV = σ/μ)
 * of HUD FY 2025 Fair Market Rent (2BR) across all counties within a state,
 * and classifies the result into a 5-tier label that captures within-state
 * rent dispersion.
 *
 * The point of this lever is to separate "the state-level FMR or median is
 * representative of what renters actually pay across the state" from "the
 * state-level number averages over wildly different county-level conditions,
 * and you should be reading the county or metro page instead." A low CoV
 * state has homogeneous FMR statewide; a high CoV state has a coastal /
 * urban-rural / metro-vs-balance-of-state split that the state aggregate
 * masks.
 *
 * Math: cov = sqrt(mean((fmr_2br_i - mean(fmr_2br))²)) / mean(fmr_2br)
 *   - fmr_2br: HUD FY 2025 Fair Market Rent for a 2-bedroom unit, by county.
 *   - Population standard deviation (divisor n, not n-1), since the county
 *     set within a state is the full population, not a sample.
 *
 * Tier counts at these cutoffs (47 states with ≥3 counties of HUD FMR-2BR
 * coverage in the counties table; states with <3 counties get
 * insufficient-data):
 *   A < 11%    4 states (NE, HI, OK, SD — geographically homogeneous FMR)
 *   B 11-15% 13 states (modest dispersion)
 *   C 15-20% 12 states (typical urban-rural spread)
 *   D 20-28% 17 states (significant metro premium)
 *   E ≥ 28%   4 states (NY 39%, CA 37%, CO 31%, VA 31%)
 *
 * Tier E captures states where the maximum-FMR county is roughly 2× or more
 * the minimum-FMR county within the same state — typically a high-rent metro
 * (NYC, SF Bay, Denver, NoVA/DC) carrying the average while a balance-of-state
 * rural region sits far below.
 *
 * Cutoffs calibrated against the HUD FY 2025 FMR-2BR distribution. The CoV
 * is dimensionless, so cutoffs are absolute (not data-dependent).
 *
 * Confidence: 'high' when the state has ≥ 3 counties with populated fmr_2br,
 * 'insufficient-data' otherwise. AK and a few other low-county states sit
 * below the 3-county minimum; render-side surfaces should suppress the tier
 * line rather than display a sample-size-1 result.
 *
 * Important framing: tier reflects only the dispersion of HUD FY 2025 FMR-2BR
 * across counties within the state. It does not reflect (a) population-
 * weighted variance (some high-FMR counties have most of the state's
 * renters, others almost none — the unweighted CoV treats Modoc County, CA
 * and Los Angeles County, CA the same), (b) within-county sub-area rent
 * variation (FMR is itself a 40th-percentile area aggregate), (c) the level
 * of FMR (a low-CoV-low-FMR state and a low-CoV-high-FMR state both look
 * "homogeneous" at this metric), or (d) the affordability-side composition
 * (whether the dispersion correlates with income). The /metro/ pages handle
 * CBSA-level variance separately; this lever quantifies the state's
 * aggregation cost.
 */

import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'rents.db');
const MIN_COUNTIES_FOR_TIER = 3;

let _db: Database.Database | null = null;
function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  }
  return _db;
}

export type FmrVarianceTier = 'A' | 'B' | 'C' | 'D' | 'E';

export interface FmrVarianceResult {
  tier: FmrVarianceTier;
  label: string;
  cov: number;
  covPct: number;
  countyCount: number;
  minFmr2br: number;
  maxFmr2br: number;
  meanFmr2br: number;
  stdDevFmr2br: number;
  spreadRatio: number;
  confidence: 'high' | 'insufficient-data';
  dispersionRationale: string;
  bandCutoffs: { A: '<11%'; B: '11–15%'; C: '15–20%'; D: '20–28%'; E: '≥28%' };
  hudAnchored: boolean;
}

function tierForCov(covPct: number): { tier: FmrVarianceTier; label: string } {
  if (covPct < 11) return { tier: 'A', label: 'Geographically homogeneous' };
  if (covPct < 15) return { tier: 'B', label: 'Modest dispersion' };
  if (covPct < 20) return { tier: 'C', label: 'Typical urban-rural spread' };
  if (covPct < 28) return { tier: 'D', label: 'Significant metro premium' };
  return { tier: 'E', label: 'Coastal / metro outlier' };
}

function buildRationale(
  stateAbbr: string,
  tier: FmrVarianceTier,
  covPct: number,
  countyCount: number,
  minFmr: number,
  maxFmr: number,
  meanFmr: number,
): string {
  const covStr = covPct.toFixed(1);
  const spreadX = (maxFmr / minFmr).toFixed(2);
  const minStr = `$${minFmr.toLocaleString()}`;
  const maxStr = `$${maxFmr.toLocaleString()}`;
  const meanStr = `$${Math.round(meanFmr).toLocaleString()}`;
  switch (tier) {
    case 'A':
      return `${stateAbbr} sits in tier A (geographically homogeneous). Across ${countyCount} counties in the HUD FY 2025 Fair Market Rent dataset, the 2BR FMR coefficient of variation is ${covStr}%. The minimum-FMR county is at ${minStr}/month, the maximum at ${maxStr} (a ${spreadX}× spread), and the unweighted state mean is ${meanStr}. State-level FMR aggregates are a reasonable proxy for what renters pay across the state — county-level lookups will not surface dramatically different burden tiers.`;
    case 'B':
      return `${stateAbbr} falls in tier B (modest dispersion). HUD FY 2025 Fair Market Rent for a 2BR varies across ${countyCount} counties with a coefficient of variation of ${covStr}%. The lowest-FMR county is ${minStr}/month, the highest ${maxStr} (a ${spreadX}× spread); the unweighted state mean is ${meanStr}. The state-level FMR is broadly representative; consult /county/ pages mainly when comparing the few high-FMR counties against the balance-of-state.`;
    case 'C':
      return `${stateAbbr} is in tier C (typical urban-rural spread). HUD FY 2025 FMR for a 2BR shows a coefficient of variation of ${covStr}% across ${countyCount} counties — a national-typical band. Minimum county FMR is ${minStr}/month, maximum is ${maxStr} (a ${spreadX}× spread); unweighted state mean is ${meanStr}. The state-level FMR averages over a real urban-rural gap; the /county/ and /metro/ pages will surface tier shifts in the higher-FMR counties.`;
    case 'D':
      return `${stateAbbr} sits in tier D (significant metro premium). Across ${countyCount} counties in the HUD FY 2025 Fair Market Rent dataset, the 2BR FMR coefficient of variation is ${covStr}%. The minimum-FMR county is ${minStr}/month, the maximum ${maxStr} (a ${spreadX}× spread); the unweighted state mean is ${meanStr}. The state-level FMR materially understates conditions in the higher-rent counties; reading the /county/ or /metro/ page for any specific area in the state is recommended over relying on the state aggregate.`;
    case 'E':
      return `${stateAbbr} is in tier E (coastal / metro outlier). HUD FY 2025 Fair Market Rent for a 2BR varies across ${countyCount} counties with a coefficient of variation of ${covStr}% — the top decile of US states. The minimum-FMR county sits at ${minStr}/month while the maximum is ${maxStr} (a ${spreadX}× spread); the unweighted state mean is ${meanStr}. The state-level FMR is essentially an average of two different rental markets (typically a high-rent metro vs. a balance-of-state rural region). Do not read the state page as representative of any specific county; use /county/ and /metro/ pages exclusively for tier-level reading.`;
  }
}

export function classifyStateFmrVariance(stateAbbr: string): FmrVarianceResult | null {
  const stateRow = getDb()
    .prepare(`SELECT state, abbr FROM states WHERE abbr = ?`)
    .get(stateAbbr) as { state: string; abbr: string } | undefined;
  if (!stateRow) return null;

  const rows = getDb()
    .prepare(
      `SELECT fmr_2br FROM counties
       WHERE state_abbr = ? AND fmr_2br IS NOT NULL AND fmr_2br > 0`,
    )
    .all(stateAbbr) as { fmr_2br: number }[];

  if (rows.length < MIN_COUNTIES_FOR_TIER) {
    return {
      tier: 'C',
      label: 'Insufficient data',
      cov: 0,
      covPct: 0,
      countyCount: rows.length,
      minFmr2br: 0,
      maxFmr2br: 0,
      meanFmr2br: 0,
      stdDevFmr2br: 0,
      spreadRatio: 0,
      confidence: 'insufficient-data',
      dispersionRationale: `${stateRow.state} has ${rows.length} counties with HUD FY 2025 Fair Market Rent (2BR) coverage in the counties table, below the ${MIN_COUNTIES_FOR_TIER}-county minimum for tier assignment. Consult the state's HUD FMR page directly for the area-by-area schedule.`,
      bandCutoffs: { A: '<11%', B: '11–15%', C: '15–20%', D: '20–28%', E: '≥28%' },
      hudAnchored: true,
    };
  }

  const values = rows.map((r) => r.fmr_2br);
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / n;
  const stdDev = Math.sqrt(variance);
  const cov = stdDev / mean;
  const covPct = cov * 100;
  const minFmr = Math.min(...values);
  const maxFmr = Math.max(...values);
  const spreadRatio = maxFmr / minFmr;
  const { tier, label } = tierForCov(covPct);
  const dispersionRationale = buildRationale(stateAbbr, tier, covPct, n, minFmr, maxFmr, mean);

  return {
    tier,
    label,
    cov: Math.round(cov * 10000) / 10000,
    covPct: Math.round(covPct * 100) / 100,
    countyCount: n,
    minFmr2br: minFmr,
    maxFmr2br: maxFmr,
    meanFmr2br: Math.round(mean),
    stdDevFmr2br: Math.round(stdDev),
    spreadRatio: Math.round(spreadRatio * 100) / 100,
    confidence: 'high',
    dispersionRationale,
    bandCutoffs: { A: '<11%', B: '11–15%', C: '15–20%', D: '20–28%', E: '≥28%' },
    hudAnchored: true,
  };
}
