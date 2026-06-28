/**
 * Phase 7 audit script — verifies Traps #105, #110, #111, #112, #117 against
 * fairrentwize + Empirical-Outcomes layer (HUD FY 2025 FMR + Census ACS
 * 2019-2023 B19013/B25008/B25070 + NLIHC OOR 2025 housing wage / mean renter
 * wage). DB-backed across 51 states + 3,021 counties + 353 metros.
 *
 *   npx tsx scripts/audit-phase7.ts
 *
 * v7.2 (2026-05-25): Tier-1 19th, audit-only formalisation.
 * Phase 7 P0+P1+P3+P4+P5 already PROD-LIVE since 2026-05-19T12:44:00Z s1:3015
 * (gate JSON v7.0 atomic bundle: 51 /state/[slug]/ + 3,021 /county/[slug]/ +
 * 353 /metro/[slug]/, title.absolute pattern `{TrimmedEntity} {Score}/100 —
 * {VerdictShort}` bypasses 14c " | FairRentWize" suffix). The federal-data
 * underlay IS the empirical underlay — composedScore 0-100 favorability
 * composed from raw HUD FMR + ACS median household income + NLIHC housing-
 * wage gap → 3-axis RentBurdenTier × OorMultipleTier × FmrCountyVarianceTier
 * → 6-bucket DominantSignal. This audit formalises the 11-check contract
 * (5 Phase 7 standard + 6 Empirical-Outcomes).
 *
 * Why audit-only / no-redeploy: The federal-data underlay was deployed in
 * v7.0 (2026-05-19); this cycle adds the audit script + gate JSON +
 * MEMORY.md index per audit-only formalisation pattern. PROD-LIVE
 * verification via cold-probe substitutes for next-build (Mac OOM on
 * full tsx module graph; the 51-state distribution is computed by raw
 * SQL atop the same per-state inputs the decoder reads at runtime).
 *
 * 6-bucket DominantSignal distribution (51 jur): QuietSqueeze 23 (45.1%) /
 * AffordableStable 16 (31.4%) / WageFloorFailure 6 (11.8%) /
 * HighVarianceCountyLottery 3 (5.9%) / CoastalCrisis 2 (3.9%) /
 * BurdenedButEarningAboveWage 1 (2.0%). Max 45.1% PASS Trap #111 with
 * 24.9pp margin — natural distribution, no by-design annotation needed.
 *
 * Source-URL surveyability (Trap #105 — inlined for grep, 6 distinct hosts):
 *   https://www.huduser.gov/portal/datasets/fmr.html
 *   https://www.hud.gov/topics/housing_choice_voucher_program_section_8
 *   https://www.census.gov/programs-surveys/acs/
 *   https://nlihc.org/oor
 *   https://www.congress.gov/
 *   https://www.ecfr.gov/current/title-24/subtitle-A/part-5
 */
import { SOURCE_AUTHORITIES } from '../lib/authorship';
import { CROSSWALK_SOURCE_CITATIONS, trimEntityForTitle } from '../lib/crosswalk-rent';
import { decodeFmrMarketGap, type HeadroomBand } from '../lib/fmr-market-gap';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

console.log('=== Phase 7 audit — fairrentwize ===');

let failures = 0;
const DB_PATH = path.join(process.cwd(), 'data', 'rents.db');
const db = new Database(DB_PATH, { readonly: true });
db.pragma('cache_size = -64000');

// ─── Trap #110 — distinct publisher hosts ─────────────────
// CROSSWALK_SOURCE_CITATIONS in lib/crosswalk-rent.ts holds the 6 composing
// publishers (HUD HUD-User + HUD topic page + Census ACS + NLIHC OOR +
// Congress 42 USC 1437a + Federal Register 24 CFR 5.628). Each URL must
// parse to a distinct host (≥2 minimum, ≥4 expected).
const publisherHosts: string[] = [];
for (const c of CROSSWALK_SOURCE_CITATIONS) {
  try { publisherHosts.push(new URL(c.url).host); } catch { /* ignore */ }
}
const distinctHosts = new Set(publisherHosts);
console.log('\n[#110] CROSSWALK_SOURCE_CITATIONS hosts:', publisherHosts);
console.log('       distinct count:', distinctHosts.size, distinctHosts.size >= 2 ? 'PASS' : 'FAIL');
if (distinctHosts.size < 2) failures++;

// ─── Trap #117 — SOURCE_AUTHORITIES count + DB-backing honesty ─
// fairrentwize uses the honest 3-publisher split: SOURCE_AUTHORITIES = 3
// DB-backing publishers (HUD FMR fmr_2br backing / Census ACS B19013 income
// backing / NLIHC OOR housing-wage backing). The 6 CROSSWALK_SOURCE_CITATIONS
// add Congress 42 USC 1437a (statutory voucher basis) + 24 CFR 5.628 (HUD
// 30% threshold federal regulation) — these are body-cited / restated, not
// ingested as rows. This is the documented schema-honesty pattern per
// feedback-source-authorities-honest-20260506.
const dbBackingCount = SOURCE_AUTHORITIES.length;
const composingPublisherCount = CROSSWALK_SOURCE_CITATIONS.length;
console.log(
  '\n[#117] SOURCE_AUTHORITIES (DB-backing):',
  dbBackingCount,
  '+ CROSSWALK_SOURCE_CITATIONS (composing):',
  composingPublisherCount,
);
const hudBackingPresent = SOURCE_AUTHORITIES.some((s) => s.url.includes('huduser.gov'));
const censusBackingPresent = SOURCE_AUTHORITIES.some((s) => s.url.includes('census.gov'));
const nlihcBackingPresent = SOURCE_AUTHORITIES.some((s) => s.url.includes('nlihc.org'));
console.log('       includes HUD FMR (huduser.gov):     ', hudBackingPresent ? 'PASS' : 'FAIL');
console.log('       includes Census ACS (census.gov):   ', censusBackingPresent ? 'PASS' : 'FAIL');
console.log('       includes NLIHC OOR (nlihc.org):     ', nlihcBackingPresent ? 'PASS' : 'FAIL');
const trap117Ok =
  dbBackingCount >= 3 &&
  hudBackingPresent &&
  censusBackingPresent &&
  nlihcBackingPresent &&
  composingPublisherCount >= 5;
console.log('       Trap #117 status:', trap117Ok ? 'PASS' : 'FAIL');
if (!trap117Ok) failures++;

// ─── Coverage — raw-SQL 3-axis tier + DominantSignal derivation ─
// Replicates lib/crosswalk-rent.ts decodeStateCrosswalk + lib/fairrent-
// interpretation.ts classifyDominantSignal in pure SQL, so we don't have to
// import the heavy decoder module graph (Mac OOM-prone with tsx + better-
// sqlite3 + ESM transpile of 5+ deps). The math is identical:
//   - RentBurdenTier: FMR*12/income → A<18, B<22, C<26, D<30, E
//   - OorMultiple: housing_wage/mean_renter_wage → A<1.10, B<1.25, C<1.45,
//     D<1.65, E
//   - FmrCountyVariance: per-state CoV across counties (population stddev /
//     mean) → A<11%, B<15%, C<20%, D<28%, E. Insufficient if <3 counties
//     (DC only).
//   - composedScore: VERDICT_BASE + BURDEN_ADJUST + variance trim, clamped
//     to [0, 100].
type Decoded = {
  abbr: string;
  state: string;
  burden_tier: string;
  oor_tier: string;
  variance_tier: string | null;
  dominant_signal: string;
  composed_score: number;
  burden_pct: number;
  oor_multiple: number;
  cov_pct: number | null;
  county_n: number;
};
const decoded: Decoded[] = db.prepare(`
  WITH per_state_agg AS (
    SELECT state_abbr, COUNT(*) AS n, AVG(fmr_2br) AS mean_fmr
    FROM counties WHERE fmr_2br IS NOT NULL GROUP BY state_abbr
  ),
  per_state_sq AS (
    SELECT c.state_abbr, SUM((c.fmr_2br - v.mean_fmr) * (c.fmr_2br - v.mean_fmr)) AS sum_sq, v.n, v.mean_fmr
    FROM counties c JOIN per_state_agg v ON v.state_abbr = c.state_abbr
    WHERE c.fmr_2br IS NOT NULL GROUP BY c.state_abbr, v.n, v.mean_fmr
  ),
  per_state_cov AS (
    SELECT state_abbr, n,
      CASE WHEN n >= 3 AND mean_fmr > 0 THEN (SQRT(sum_sq * 1.0 / n) / mean_fmr) * 100.0 ELSE NULL END AS cov_pct
    FROM per_state_sq
  ),
  per_state_metrics AS (
    SELECT s.abbr, s.state,
      (s.fmr_2br * 12.0 / s.acs_median_household_income) * 100.0 AS burden_pct,
      s.nlihc_housing_wage_2br / s.nlihc_mean_renter_wage AS oor_multiple,
      c.cov_pct, COALESCE(c.n, 0) AS county_n
    FROM states s LEFT JOIN per_state_cov c ON c.state_abbr = s.abbr
  ),
  per_state_tiers AS (
    SELECT abbr, state, burden_pct, oor_multiple, cov_pct, county_n,
      CASE WHEN burden_pct < 18 THEN 'A' WHEN burden_pct < 22 THEN 'B'
           WHEN burden_pct < 26 THEN 'C' WHEN burden_pct < 30 THEN 'D' ELSE 'E' END AS burden_tier,
      CASE WHEN oor_multiple < 1.10 THEN 'A' WHEN oor_multiple < 1.25 THEN 'B'
           WHEN oor_multiple < 1.45 THEN 'C' WHEN oor_multiple < 1.65 THEN 'D' ELSE 'E' END AS oor_tier,
      CASE WHEN cov_pct IS NULL THEN NULL WHEN cov_pct < 11 THEN 'A' WHEN cov_pct < 15 THEN 'B'
           WHEN cov_pct < 20 THEN 'C' WHEN cov_pct < 28 THEN 'D' ELSE 'E' END AS variance_tier
    FROM per_state_metrics
  ),
  signal_layer AS (
    SELECT abbr, state, burden_pct, oor_multiple, cov_pct, county_n,
      burden_tier, oor_tier, variance_tier,
      CASE
        WHEN burden_tier='E' AND oor_tier IN ('D','E') AND COALESCE(variance_tier,'X') IN ('D','E') THEN 'CoastalCrisis'
        WHEN oor_tier='E' THEN 'WageFloorFailure'
        WHEN variance_tier='E' THEN 'HighVarianceCountyLottery'
        WHEN burden_tier IN ('D','E') AND oor_tier IN ('A','B') THEN 'BurdenedButEarningAboveWage'
        WHEN burden_tier IN ('A','B') AND oor_tier IN ('A','B') THEN 'AffordableStable'
        ELSE 'QuietSqueeze'
      END AS dominant_signal
    FROM per_state_tiers
  )
  SELECT abbr, state, burden_tier, oor_tier, variance_tier, dominant_signal,
    MAX(0, MIN(100,
      (CASE dominant_signal
        WHEN 'AffordableStable' THEN 85 WHEN 'BurdenedButEarningAboveWage' THEN 55
        WHEN 'QuietSqueeze' THEN 50 WHEN 'HighVarianceCountyLottery' THEN 45
        WHEN 'WageFloorFailure' THEN 25 WHEN 'CoastalCrisis' THEN 15
      END)
      + (CASE burden_tier WHEN 'A' THEN 10 WHEN 'B' THEN 6 WHEN 'C' THEN 0 WHEN 'D' THEN -4 WHEN 'E' THEN -8 END)
      + (CASE WHEN cov_pct IS NULL THEN 0 WHEN variance_tier='E' THEN -8
              WHEN variance_tier='D' THEN -4 WHEN variance_tier='A' THEN 4 ELSE 0 END)
    )) AS composed_score,
    burden_pct, oor_multiple, cov_pct, county_n
  FROM signal_layer ORDER BY abbr
`).all() as Decoded[];

console.log(`\n[coverage] states decoded: ${decoded.length}/51`);
if (decoded.length !== 51) { console.log('       coverage gap FAIL'); failures++; }

// ─── Trap #111 — composedScore + DominantSignal distribution ─
console.log('\n[#111 DominantSignal] 6-bucket distribution (51 jur, state-level composite)');
const signalDist: Record<string, number> = {};
decoded.forEach((d) => { signalDist[d.dominant_signal] = (signalDist[d.dominant_signal] ?? 0) + 1; });
Object.entries(signalDist).sort((a, b) => b[1] - a[1]).forEach(([k, n]) => {
  console.log(`       ${k.padEnd(28)} ${String(n).padStart(3)} (${(100*n/decoded.length).toFixed(1)}%)`);
});
const signalMaxPct = Math.max(...Object.values(signalDist).map((n) => 100*n/decoded.length));
console.log(`       max bucket pct: ${signalMaxPct.toFixed(1)}%`, signalMaxPct <= 70 ? 'PASS (natural distribution)' : 'FAIL');
if (signalMaxPct > 70) failures++;

// ─── Trap #111 — composedScore quartile distribution ─
const quartiles = { q1_0_25: 0, q2_26_50: 0, q3_51_75: 0, q4_76_100: 0 };
for (const d of decoded) {
  if (d.composed_score <= 25) quartiles.q1_0_25++;
  else if (d.composed_score <= 50) quartiles.q2_26_50++;
  else if (d.composed_score <= 75) quartiles.q3_51_75++;
  else quartiles.q4_76_100++;
}
console.log('\n[#111 composedScore] quartile distribution');
Object.entries(quartiles).forEach(([k, n]) => {
  console.log(`       ${k.padEnd(12)} ${String(n).padStart(3)} (${(100*n/decoded.length).toFixed(1)}%)`);
});
const quartileMax = Math.max(...Object.values(quartiles).map((n) => 100*n/decoded.length));
console.log(`       max quartile pct: ${quartileMax.toFixed(1)}%`, quartileMax <= 70 ? 'PASS' : 'FAIL');
if (quartileMax > 70) failures++;

// ─── Trap #111 — RentBurdenTier all-state distribution (raw input lever) ─
console.log('\n[#111 RentBurdenTier] raw input distribution (all 51 jur)');
const burdenDist: Record<string, number> = {};
decoded.forEach((d) => { burdenDist[d.burden_tier] = (burdenDist[d.burden_tier] ?? 0) + 1; });
Object.entries(burdenDist).sort((a, b) => a[0].localeCompare(b[0])).forEach(([k, n]) => {
  console.log(`       tier ${k} ${String(n).padStart(3)} (${(100*n/decoded.length).toFixed(1)}%)`);
});
const burdenMaxPct = Math.max(...Object.values(burdenDist).map((n) => 100*n/decoded.length));
console.log(`       max tier pct: ${burdenMaxPct.toFixed(1)}%`, burdenMaxPct <= 70 ? 'PASS' : 'FAIL');
if (burdenMaxPct > 70) failures++;

// ─── Trap #112 — title.absolute ≤60 chars ─
// Pattern: `${trimEntityForTitle(state)} ${composedScore}/100 — ${verdictShort}`
// Longest verdictShort = 'County lottery — read sub-state' (31c, em-dash counts 1).
// Longest entity name = 'District of Columbia' (20c, under trimEntityForTitle cap 26).
const VERDICT_SHORT: Record<string, string> = {
  AffordableStable: 'Affordable & stable rent',
  WageFloorFailure: 'Renter wage below FMR',
  HighVarianceCountyLottery: 'County lottery — read sub-state',
  CoastalCrisis: 'Coastal crisis — stacked',
  BurdenedButEarningAboveWage: 'Burdened, renters earn above',
  QuietSqueeze: 'Quiet squeeze',
};
console.log('\n[#112 title] title.absolute length audit (cap=60, layout suffix bypassed)');
let titleMax = 0;
let titleMaxStr = '';
let titleOver = 0;
for (const d of decoded) {
  const verdict = VERDICT_SHORT[d.dominant_signal] ?? d.dominant_signal;
  const title = `${trimEntityForTitle(d.state)} ${d.composed_score}/100 — ${verdict}`;
  if (title.length > titleMax) {
    titleMax = title.length;
    titleMaxStr = title;
  }
  if (title.length > 60) titleOver += 1;
}
console.log(`       /state/[slug]/  max=${titleMax}c  "${titleMaxStr}"  >60=${titleOver}/${decoded.length}  ${titleOver === 0 ? 'PASS' : 'FAIL'}`);
if (titleOver > 0) failures++;

// ─── 6-state sample with PROD title preview ───────────────
console.log('\n[sample state]');
const sampleStates = ['CA', 'TX', 'NY', 'FL', 'WV', 'HI'];
for (const code of sampleStates) {
  const d = decoded.find((x) => x.abbr === code);
  if (!d) { console.log(`  ${code}: MISSING`); continue; }
  const verdict = VERDICT_SHORT[d.dominant_signal] ?? d.dominant_signal;
  const title = `${trimEntityForTitle(d.state)} ${d.composed_score}/100 — ${verdict}`;
  console.log(
    `  ${code} ${d.state.padEnd(22)} → ${String(d.composed_score).padStart(3)}/100  ${d.dominant_signal.padEnd(28)} · burden ${d.burden_tier} ${d.burden_pct.toFixed(1)}% · oor ${d.oor_tier} ${d.oor_multiple.toFixed(2)}× · var ${d.variance_tier ?? '—'}`,
  );
  console.log(`    title (${title.length}c): "${title}"`);
}

// ============================================================
// Empirical-Outcomes block — HUD FMR + ACS + NLIHC cross-walk
// ============================================================
// Tier-1 19th, audit-only formalisation. The empirical underlay IS the
// federal-data layer: HUD FY 2025 Fair Market Rents at state + 3,021 county
// + 353 metro grain (data/rents.db) + Census ACS 2019-2023 5-Year median
// household income + per-bedroom gross rent + rent-burdened share + NLIHC
// Out of Reach 2025 state-level housing wage / mean renter wage.
//
// 6 checks: coverage / national / spread / distribution / source / wiring.
console.log('\n=== Empirical-Outcomes — HUD FMR + Census ACS + NLIHC OOR ===');

let empiricalFail = 0;

// #empirical-coverage — DB-row presence on states + counties + metros
const stateCount = (db.prepare('SELECT COUNT(*) AS n FROM states').get() as { n: number }).n;
const countyCount = (db.prepare('SELECT COUNT(*) AS n FROM counties').get() as { n: number }).n;
const metroCount = (db.prepare('SELECT COUNT(*) AS n FROM metros').get() as { n: number }).n;
const countiesWithFmr = (db.prepare('SELECT COUNT(*) AS n FROM counties WHERE fmr_2br IS NOT NULL').get() as { n: number }).n;
const countiesWithIncome = (db.prepare('SELECT COUNT(*) AS n FROM counties WHERE acs_median_household_income IS NOT NULL').get() as { n: number }).n;
const statesWithAllThree = (db.prepare(`
  SELECT COUNT(*) AS n FROM states
  WHERE fmr_2br IS NOT NULL
    AND acs_median_household_income IS NOT NULL
    AND nlihc_housing_wage_2br IS NOT NULL
    AND nlihc_mean_renter_wage IS NOT NULL
`).get() as { n: number }).n;

const coverageOk =
  stateCount === 51 &&
  countyCount >= 3000 &&
  metroCount >= 300 &&
  countiesWithFmr >= 3000 &&
  countiesWithIncome >= 3000 &&
  statesWithAllThree === 51;
console.log('\n[#empirical-coverage]');
console.log(`       states rows:                   ${stateCount}`);
console.log(`       counties rows:                 ${countyCount.toLocaleString()}`);
console.log(`       metros rows:                   ${metroCount}`);
console.log(`       counties with HUD FMR 2BR:     ${countiesWithFmr.toLocaleString()} (${(100*countiesWithFmr/countyCount).toFixed(1)}%)`);
console.log(`       counties with ACS income:      ${countiesWithIncome.toLocaleString()} (${(100*countiesWithIncome/countyCount).toFixed(1)}%)`);
console.log(`       states with FMR+ACS+OOR (all): ${statesWithAllThree}/51`);
console.log('       coverage OK:', coverageOk ? 'PASS' : 'FAIL');
if (!coverageOk) empiricalFail++;

// #empirical-national — state-aggregate national means
const sNat = db.prepare(`
  SELECT
    AVG(fmr_2br) AS avg_fmr_2br,
    AVG(acs_median_household_income) AS avg_income,
    AVG(nlihc_housing_wage_2br) AS avg_housing_wage,
    AVG(nlihc_mean_renter_wage) AS avg_renter_wage,
    AVG(acs_rent_burdened_pct) AS avg_rent_burdened
  FROM states
`).get() as {
  avg_fmr_2br: number;
  avg_income: number;
  avg_housing_wage: number;
  avg_renter_wage: number;
  avg_rent_burdened: number;
};

const nationalOk =
  sNat.avg_fmr_2br >= 1000 && sNat.avg_fmr_2br <= 2500 &&
  sNat.avg_income >= 50_000 && sNat.avg_income <= 120_000 &&
  sNat.avg_housing_wage >= 15 && sNat.avg_housing_wage <= 60 &&
  sNat.avg_renter_wage >= 10 && sNat.avg_renter_wage <= 40 &&
  sNat.avg_rent_burdened >= 30 && sNat.avg_rent_burdened <= 60;
console.log('\n[#empirical-national]');
console.log(`       state-avg HUD FMR 2BR:         $${Math.round(sNat.avg_fmr_2br).toLocaleString()}/mo`);
console.log(`       state-avg ACS median income:   $${Math.round(sNat.avg_income).toLocaleString()}/yr`);
console.log(`       state-avg NLIHC housing wage:  $${sNat.avg_housing_wage.toFixed(2)}/hr`);
console.log(`       state-avg NLIHC renter wage:   $${sNat.avg_renter_wage.toFixed(2)}/hr`);
console.log(`       state-avg ACS rent-burdened:   ${sNat.avg_rent_burdened.toFixed(2)}%`);
console.log('       national OK:', nationalOk ? 'PASS' : 'FAIL');
if (!nationalOk) empiricalFail++;

// #empirical-spread — state-level FMR + county-level FMR spread
const stateFmr = db.prepare(`SELECT MIN(fmr_2br) AS lo, MAX(fmr_2br) AS hi FROM states`).get() as { lo: number; hi: number };
const countyFmr = db.prepare(`SELECT MIN(fmr_2br) AS lo, MAX(fmr_2br) AS hi FROM counties WHERE fmr_2br IS NOT NULL`).get() as { lo: number; hi: number };
const stateSpread = stateFmr.hi - stateFmr.lo;
const countySpread = countyFmr.hi - countyFmr.lo;
const countyRatio = countyFmr.hi / countyFmr.lo;
const scoreSpread = Math.max(...decoded.map((d) => d.composed_score)) - Math.min(...decoded.map((d) => d.composed_score));

const spreadOk =
  stateSpread >= 500 &&
  countySpread >= 2000 &&
  countyRatio >= 3 &&
  scoreSpread >= 60;
console.log('\n[#empirical-spread]');
console.log(`       state-level FMR 2BR range:     $${stateFmr.lo}–$${stateFmr.hi} = $${stateSpread} spread`);
console.log(`       county-level FMR 2BR range:    $${countyFmr.lo}–$${countyFmr.hi} = $${countySpread} spread (${countyRatio.toFixed(2)}×)`);
console.log(`       composedScore spread (0-100):  ${Math.min(...decoded.map((d) => d.composed_score))}–${Math.max(...decoded.map((d) => d.composed_score))} = ${scoreSpread}pp`);
console.log('       spread OK:', spreadOk ? 'PASS' : 'FAIL');
if (!spreadOk) empiricalFail++;

// #empirical-distribution — 6-bucket DominantSignal + 4-quartile composedScore
const dominantBucketCount = Object.keys(signalDist).length;
const quartileBucketCount = Object.values(quartiles).filter((n) => n > 0).length;
const distinctScores = new Set(decoded.map((d) => d.composed_score)).size;

const distributionOk =
  dominantBucketCount >= 5 &&
  quartileBucketCount >= 3 &&
  distinctScores >= 15;
console.log('\n[#empirical-distribution]');
console.log(`       DominantSignal buckets:        ${dominantBucketCount}/6 populated`);
console.log(`       composedScore quartiles:       ${quartileBucketCount}/4 populated`);
console.log(`       distinct composedScore values: ${distinctScores}`);
console.log('       distribution OK:', distributionOk ? 'PASS' : 'FAIL');
if (!distributionOk) empiricalFail++;

// #empirical-source — 4+ distinct publisher hosts present in CROSSWALK_SOURCE_CITATIONS
// fairrentwize: 6 URLs / 6 distinct hosts (huduser.gov + hud.gov + census.gov +
// nlihc.org + congress.gov + ecfr.gov).
const expectedHosts = new Set([
  'www.huduser.gov',
  'www.hud.gov',
  'www.census.gov',
  'nlihc.org',
  'www.congress.gov',
  'www.ecfr.gov',
]);
const sourceMatches = [...expectedHosts].filter((h) => distinctHosts.has(h));
const sourceOk = sourceMatches.length === expectedHosts.size;
console.log('\n[#empirical-source]');
console.log(`       expected hosts (6 distinct):   ${[...expectedHosts].join(', ')}`);
console.log(`       observed hosts (citations):    ${[...distinctHosts].join(', ')}`);
console.log(`       overlap:                       ${sourceMatches.length}/${expectedHosts.size}`);
console.log('       source OK:', sourceOk ? 'PASS' : 'FAIL');
if (!sourceOk) empiricalFail++;

// #empirical-wiring — page.tsx surfaces fairRentMultiCreatorDatasetSchema + title.absolute
const statePagePath = path.join(process.cwd(), 'app', 'state', '[slug]', 'page.tsx');
const statePageSrc = fs.existsSync(statePagePath) ? fs.readFileSync(statePagePath, 'utf8') : '';
const wantedPageHooks = [
  'decodeStateCrosswalk',
  'fairRentMultiCreatorDatasetSchema',
  'CrosswalkBridge',
  'absolute:',
  'trimEntityForTitle',
  'composedScore',
  'verdictShort',
];
const missingPageHooks = wantedPageHooks.filter((h) => !statePageSrc.includes(h));

const crosswalkPath = path.join(process.cwd(), 'lib', 'crosswalk-rent.ts');
const crosswalkSrc = fs.existsSync(crosswalkPath) ? fs.readFileSync(crosswalkPath, 'utf8') : '';
const crosswalkHasMultiCreator =
  crosswalkSrc.includes('fairRentMultiCreatorDatasetSchema') &&
  crosswalkSrc.includes('SOURCE_CITATIONS') &&
  crosswalkSrc.includes('CROSSWALK_SOURCE_CITATIONS');

// fairrentwize uses top-level app/state/[slug]/, app/county/[slug]/, app/metro/[slug]/
// routes (not [entity]/[slug] dynamic). Verify all three exist and the state page
// has the title.absolute + multi-creator wiring.
const countyPagePath = path.join(process.cwd(), 'app', 'county', '[slug]', 'page.tsx');
const metroPagePath = path.join(process.cwd(), 'app', 'metro', '[slug]', 'page.tsx');
const stateRouteExists = fs.existsSync(statePagePath);
const countyRouteExists = fs.existsSync(countyPagePath);
const metroRouteExists = fs.existsSync(metroPagePath);

const wiringOk =
  missingPageHooks.length === 0 &&
  crosswalkHasMultiCreator &&
  stateRouteExists &&
  countyRouteExists &&
  metroRouteExists;
console.log('\n[#empirical-wiring]');
console.log(`       page.tsx hooks present:        ${wantedPageHooks.length - missingPageHooks.length}/${wantedPageHooks.length}`);
if (missingPageHooks.length > 0) console.log(`       missing page hooks:           ${missingPageHooks.join(', ')}`);
console.log(`       crosswalk-rent.ts hooks:       ${crosswalkHasMultiCreator ? 'PASS' : 'FAIL'}`);
console.log(`       3-entity routes present:       state=${stateRouteExists?'✓':'✗'} county=${countyRouteExists?'✓':'✗'} metro=${metroRouteExists?'✓':'✗'}`);
console.log('       wiring OK:', wiringOk ? 'PASS' : 'FAIL');
if (!wiringOk) empiricalFail++;

// ============================================================
// FMR-vs-Market gap audit (Vertical-Depth, added 2026-05-31)
// ============================================================
// Validates the voucher-vs-market headroom synthesis (HUD FY2025 2BR FMR vs ACS
// 2023 2BR median rent), the loaded-but-uninterpreted acs_median_rent_2br field.
console.log('\n=== FMR-vs-Market headroom (voucher reality check) ===');
let gapFail = 0;
const gapRows = db.prepare(
  'SELECT fmr_2br AS f, acs_median_rent_2br AS a FROM counties WHERE fmr_2br>0 AND acs_median_rent_2br>0',
).all() as { f: number; a: number }[];
const totalCounties = (db.prepare('SELECT COUNT(*) AS n FROM counties WHERE fmr_2br>0').get() as { n: number }).n;
const gapBandCounts: Record<HeadroomBand, number> = { below: 0, thin: 0, moderate: 0, comfortable: 0, wide: 0 };
const gapVals: number[] = [];
let gapDecoded = 0;
for (const r of gapRows) {
  const d = decodeFmrMarketGap(r.f, r.a);
  if (!d) continue;
  gapDecoded += 1;
  gapBandCounts[d.band] += 1;
  gapVals.push(d.gapPct);
}
// [V1] Coverage — most FMR counties also have an ACS 2BR median to compare.
const gapCovPct = totalCounties > 0 ? (gapDecoded / totalCounties) * 100 : 0;
const v1 = gapCovPct >= 90;
console.log(`       [V1] coverage ${gapDecoded}/${totalCounties} counties (${gapCovPct.toFixed(1)}%) ${v1 ? 'PASS' : 'FAIL'}`);
if (!v1) gapFail++;
// [V2] Trap #111 — band distribution max bucket < 60%.
const gapMaxPct = gapDecoded > 0 ? (Math.max(...Object.values(gapBandCounts)) / gapDecoded) * 100 : 0;
const v2 = gapMaxPct < 60;
console.log(`       [V2] bands below=${gapBandCounts.below}/thin=${gapBandCounts.thin}/mod=${gapBandCounts.moderate}/comf=${gapBandCounts.comfortable}/wide=${gapBandCounts.wide}, max ${gapMaxPct.toFixed(1)}% ${v2 ? 'PASS' : 'FAIL'}`);
if (!v2) gapFail++;
// [V3] Decision-relevant tail + spread — the 'below' (voucher-tight) band is populated
// and the gap is a genuine signal (real spread), not a constant.
const gapSpread = gapVals.length ? Math.max(...gapVals) - Math.min(...gapVals) : 0;
const v3 = gapBandCounts.below > 0 && gapSpread >= 20;
console.log(`       [V3] decision tail: ${gapBandCounts.below} voucher-below-market counties, ${gapSpread.toFixed(0)}pp spread ${v3 ? 'PASS' : 'FAIL'}`);
if (!v3) gapFail++;
// [V4] Page wiring — county + state pages import the decoder + block.
const gCountySrc = fs.readFileSync(path.join(process.cwd(), 'app', 'county', '[slug]', 'page.tsx'), 'utf8');
const gStateSrc = fs.readFileSync(path.join(process.cwd(), 'app', 'state', '[slug]', 'page.tsx'), 'utf8');
const v4 = ['decodeFmrMarketGap', 'FmrMarketGapBlock'].every((h) => gCountySrc.includes(h) && gStateSrc.includes(h));
console.log(`       [V4] county+state wiring decodeFmrMarketGap + FmrMarketGapBlock ${v4 ? 'PASS' : 'FAIL'}`);
if (!v4) gapFail++;
console.log(`       FMR-vs-Market gap failures: ${gapFail}`);

db.close();

// ─── Final summary ────────────────────────────────────────
const totalFailures = failures + empiricalFail + gapFail;
console.log('\n========================================');
console.log(`Phase 7 standard failures:    ${failures}`);
console.log(`Empirical-Outcomes failures:  ${empiricalFail}`);
console.log(`FMR-vs-Market gap failures:   ${gapFail}`);
console.log(`Total failures:               ${totalFailures}`);
console.log('========================================');
process.exit(totalFailures > 0 ? 1 : 0);
