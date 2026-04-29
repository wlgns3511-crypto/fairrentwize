#!/usr/bin/env tsx
/**
 * scripts/build-db.ts — fairrentwize Layer 0 merge.
 *
 * Replaces the prior synthetic build-db.py (random.seed(42) + word-bank
 * county names). All county/state/metro data now comes from three real
 * sources, merged here:
 *
 *   data/raw/hud-fmr.json         — HUD FMR FY2025 via ArcGIS REST
 *   data/raw/acs.json             — Census ACS 2023 5-Year (B25031, B19013, B25070, B25008)
 *   data/raw/nlihc-oor-2025.json  — NLIHC Out of Reach 2025 state housing wage
 *
 * Keep set: counties present in HUD direct (NCNTY or METRO_N) AND ACS
 * data_quality === "high" (B25031 relative MOE ≤ 30%). Anything else is
 * either dropped (no real data) or rendered with a DataSuppressedNotice
 * via the dropped-slugs map consumed by middleware.
 *
 * Outputs:
 *   data/rents.db                       (overwrites; .bak.synthetic kept once)
 *   lib/generated/data-vintage.json     (trust strip + methodology page)
 *   lib/generated/dropped-slugs.json    (middleware 410 source)
 */
import { readFileSync, writeFileSync, mkdirSync, unlinkSync, existsSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";

const DB_PATH = "data/rents.db";
const BACKUP_PATH = "data/rents.db.bak.synthetic";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function countyName(raw: string): { full: string; short: string } {
  // raw = "Los Angeles County, California" — strip ", State"
  const idx = raw.lastIndexOf(",");
  const full = idx > 0 ? raw.slice(0, idx).trim() : raw.trim();
  const short = full
    .replace(/\s+(County|Parish|Borough|Census Area|Municipality|city)$/i, "")
    .trim();
  return { full, short };
}

function metroDisplayName(raw: string): string {
  return raw
    .replace(/\s+HUD\s+(Metro|Nonmetro)\s+FMR\s+Area$/i, "")
    .replace(/\s+MSA$/i, "")
    .trim();
}

function metroSlugFromName(displayName: string): string {
  // displayName = "Los Angeles-Long Beach-Anaheim, CA" → "los-angeles-long-beach-anaheim"
  const beforeComma = displayName.split(",")[0].trim();
  return slugify(beforeComma);
}

interface HudCounty {
  fips: string;
  state_fips: string;
  county_fips: string;
  name: string;
  fmr_studio: number;
  fmr_1br: number;
  fmr_2br: number;
  fmr_3br: number;
  fmr_4br: number;
  cbsa?: string;
  source_code: string;
  source_kind: "NCNTY" | "METRO_N";
}
interface HudMetro {
  cbsa: string;
  name: string;
  fmr_studio: number;
  fmr_1br: number;
  fmr_2br: number;
  fmr_3br: number;
  fmr_4br: number;
  source_code: string;
}
interface HudRaw {
  fetched_at: string;
  source_url: string;
  counties: HudCounty[];
  metros: HudMetro[];
}

interface AcsCounty {
  fips: string;
  state_fips: string;
  county_fips: string;
  name: string;
  median_rent_overall: number | null;
  median_rent_overall_moe: number | null;
  median_rent_overall_relative_moe: number | null;
  median_rent_studio: number | null;
  median_rent_1br: number | null;
  median_rent_2br: number | null;
  median_rent_3br: number | null;
  median_rent_4br: number | null;
  median_household_income: number | null;
  median_household_income_moe: number | null;
  rent_burdened_pct: number | null;
  renter_occupied_pct: number | null;
  total_occupied_units: number | null;
  data_quality: "high" | "low" | "missing";
}
interface AcsState {
  fips: string;
  abbr: string;
  name: string;
  median_rent_overall: number | null;
  median_rent_2br: number | null;
  median_household_income: number | null;
  rent_burdened_pct: number | null;
  renter_occupied_pct: number | null;
}
interface AcsRaw {
  fetched_at: string;
  source: string;
  counties: AcsCounty[];
  states: AcsState[];
}

interface NlihcState {
  abbr: string;
  name: string;
  housing_wage_2br: number;
  annual_income_2br: number;
  fmr_2br: number;
  ami_annual: number;
  mean_renter_wage: number;
  renter_households: number;
  renter_pct_of_total: number;
  rank: number;
  total_jurisdictions: number;
}
interface NlihcRaw {
  fetched_at: string;
  source: string;
  us_avg_housing_wage_2br: number;
  states: NlihcState[];
}

interface CbsaCounty {
  fips: string;
  name: string;
  state_name: string;
  central_or_outlying: string;
}
interface CbsaEntry {
  cbsa: string;
  title: string;
  type: string;
  counties: CbsaCounty[];
}
interface CbsaRaw {
  generated_at: string;
  source: string;
  cbsas: CbsaEntry[];
}

interface SubareaOverrides {
  overrides: Record<string, string>; // fips -> source_code
}

function main() {
  console.log("=== fairrentwize build-db ===");
  const hud = JSON.parse(readFileSync("data/raw/hud-fmr.json", "utf8")) as HudRaw;
  const acs = JSON.parse(readFileSync("data/raw/acs.json", "utf8")) as AcsRaw;
  const nlihc = JSON.parse(readFileSync("data/raw/nlihc-oor-2025.json", "utf8")) as NlihcRaw;
  const cbsaDelin = JSON.parse(readFileSync("data/raw/cbsa-counties.json", "utf8")) as CbsaRaw;
  const subareaOv = JSON.parse(
    readFileSync("data/raw/hud-subarea-county-overrides.json", "utf8"),
  ) as SubareaOverrides;
  console.log(
    `inputs: HUD ${hud.counties.length} counties / ${hud.metros.length} metros, ACS ${acs.counties.length} counties / ${acs.states.length} states, NLIHC ${nlihc.states.length} states, OMB ${cbsaDelin.cbsas.length} CBSAs, overrides ${Object.keys(subareaOv.overrides).length} counties`,
  );

  // --- snapshot old slugs ---
  // Snapshot from the synthetic baseline backup (frozen on first run). Reading
  // from the current DB would drift the dropped-slugs set with each rebuild,
  // hiding the original synthetic slugs that need 410 responses.
  const oldSlugs = {
    state: new Set<string>(),
    county: new Set<string>(),
    metro: new Set<string>(),
  };
  if (!existsSync(BACKUP_PATH) && existsSync(DB_PATH)) {
    writeFileSync(BACKUP_PATH, readFileSync(DB_PATH));
    console.log(`backed up old DB → ${BACKUP_PATH}`);
  }
  if (existsSync(BACKUP_PATH)) {
    const oldDb = new Database(BACKUP_PATH, { readonly: true });
    try {
      for (const r of oldDb.prepare("SELECT slug FROM states").all() as { slug: string }[]) {
        oldSlugs.state.add(r.slug);
      }
      for (const r of oldDb.prepare("SELECT slug FROM counties").all() as { slug: string }[]) {
        oldSlugs.county.add(r.slug);
      }
      for (const r of oldDb.prepare("SELECT slug FROM metros").all() as { slug: string }[]) {
        oldSlugs.metro.add(r.slug);
      }
    } catch {}
    oldDb.close();
    console.log(
      `synthetic-baseline slugs: states=${oldSlugs.state.size}, counties=${oldSlugs.county.size}, metros=${oldSlugs.metro.size}`,
    );
  }

  // --- index inputs ---
  const acsCountyByFips = new Map(acs.counties.map((c) => [c.fips, c]));
  const stateByFips = new Map(acs.states.map((s) => [s.fips, s]));
  const nlihcByAbbr = new Map(nlihc.states.map((s) => [s.abbr, s]));

  // --- build counties (HUD direct ∩ ACS high quality) ---
  const newCounties: Array<Record<string, unknown>> = [];
  const dropReasons = { noAcs: 0, acsLow: 0, acsMissing: 0, slugCollision: 0, noStateMeta: 0 };
  const seenSlugs = new Set<string>();

  for (const h of hud.counties) {
    const a = acsCountyByFips.get(h.fips);
    if (!a) {
      dropReasons.noAcs++;
      continue;
    }
    if (a.data_quality === "low") {
      dropReasons.acsLow++;
      continue;
    }
    if (a.data_quality === "missing") {
      dropReasons.acsMissing++;
      continue;
    }
    const stateMeta = stateByFips.get(h.state_fips);
    if (!stateMeta) {
      dropReasons.noStateMeta++;
      continue;
    }
    const { full, short } = countyName(a.name);
    const slug = `${slugify(short)}-county-${stateMeta.abbr.toLowerCase()}`;
    if (seenSlugs.has(slug)) {
      dropReasons.slugCollision++;
      continue;
    }
    seenSlugs.add(slug);
    newCounties.push({
      fips: h.fips,
      state_fips: h.state_fips,
      state_abbr: stateMeta.abbr,
      county_name: full,
      county_short_name: short,
      slug,
      fmr_studio: h.fmr_studio || null,
      fmr_1br: h.fmr_1br || null,
      fmr_2br: h.fmr_2br || null,
      fmr_3br: h.fmr_3br || null,
      fmr_4br: h.fmr_4br || null,
      hud_source_kind: h.source_kind,
      hud_source_code: h.source_code,
      cbsa: h.cbsa ?? null,
      acs_median_rent_overall: a.median_rent_overall,
      acs_median_rent_overall_moe: a.median_rent_overall_moe,
      acs_median_rent_overall_relative_moe: a.median_rent_overall_relative_moe,
      acs_median_rent_studio: a.median_rent_studio,
      acs_median_rent_1br: a.median_rent_1br,
      acs_median_rent_2br: a.median_rent_2br,
      acs_median_rent_3br: a.median_rent_3br,
      acs_median_rent_4br: a.median_rent_4br,
      acs_median_household_income: a.median_household_income,
      acs_rent_burdened_pct: a.rent_burdened_pct,
      acs_renter_occupied_pct: a.renter_occupied_pct,
      acs_total_occupied_units: a.total_occupied_units,
    });
  }

  console.log(`counties built (HUD direct): ${newCounties.length}`);
  console.log(`  drop reasons: ${JSON.stringify(dropReasons)}`);

  // --- CBSA fanout: counties in OMB CBSAs covered only by METRO_M umbrellas ---
  // HUD's direct dataset (NCNTY + METRO_N) is incomplete: counties in a CBSA
  // that inherit the umbrella FMR (e.g. LA County → CBSA 31080, Cook County
  // → 16980, Harris County → 26420) are absent. The OMB July 2023 delineation
  // tells us which counties belong to each CBSA. For each CBSA, we look up the
  // appropriate HUD METRO_M record (subarea override map for split CBSAs;
  // single METRO_M for the rest) and synthesize a county row using umbrella
  // FMRs + ACS data, subject to the same MOE filter.
  const hudMetroBySource = new Map(hud.metros.map((m) => [m.source_code, m]));
  const fanoutCountiesAdded = { ok: 0, alreadyHud: 0, splitNoOverride: 0, noHudMetro: 0, noAcs: 0, acsLow: 0, acsMissing: 0, slugCollision: 0, noStateMeta: 0, territory: 0 };
  const seenFips = new Set(newCounties.map((c) => String(c.fips)));

  // Index HUD metros by CBSA — list per CBSA (because HUD splits some CBSAs
  // into multiple FMR sub-areas).
  const hudMetrosByCbsa = new Map<string, HudMetro[]>();
  for (const m of hud.metros) {
    if (!hudMetrosByCbsa.has(m.cbsa)) hudMetrosByCbsa.set(m.cbsa, []);
    hudMetrosByCbsa.get(m.cbsa)!.push(m);
  }

  // For each CBSA, identify the primary umbrella (fallback for fanout): a
  // sub-area whose name is NOT a per-county exception ("{County} County, ST")
  // and NOT a sub-county exception ("{Town} town, ST"). When exactly one
  // umbrella exists, fanout falls back to it for any constituent county not
  // explicitly overridden. CBSAs with multiple non-exception umbrellas (LA,
  // NYC, Boston, Chicago, SF, Seattle, etc.) require explicit county→sub-area
  // entries in hud-subarea-county-overrides.json.
  const exceptionRe = /^[A-Za-z.\s\-]+ (County|Parish|Borough), [A-Z]{2}\b/;
  const subCountyRe = /town, [A-Z]{2}/;
  const cbsaPrimaryUmbrella = new Map<string, string>(); // cbsa -> source_code
  for (const [cbsa, mlist] of hudMetrosByCbsa) {
    const umbrellas = mlist.filter((m) => !exceptionRe.test(m.name) && !subCountyRe.test(m.name));
    if (umbrellas.length === 1) cbsaPrimaryUmbrella.set(cbsa, umbrellas[0].source_code);
  }

  for (const cbsa of cbsaDelin.cbsas) {
    for (const cty of cbsa.counties) {
      if (seenFips.has(cty.fips)) {
        fanoutCountiesAdded.alreadyHud++;
        continue;
      }
      // skip territories (no NLIHC, no state meta)
      const stateFips = cty.fips.slice(0, 2);
      if (stateFips === "60" || stateFips === "66" || stateFips === "69" || stateFips === "72" || stateFips === "78") {
        fanoutCountiesAdded.territory++;
        continue;
      }
      const stateMeta = stateByFips.get(stateFips);
      if (!stateMeta) {
        fanoutCountiesAdded.noStateMeta++;
        continue;
      }
      const a = acsCountyByFips.get(cty.fips);
      if (!a) {
        fanoutCountiesAdded.noAcs++;
        continue;
      }
      if (a.data_quality === "low") {
        fanoutCountiesAdded.acsLow++;
        continue;
      }
      if (a.data_quality === "missing") {
        fanoutCountiesAdded.acsMissing++;
        continue;
      }
      // Pick HUD metro source: explicit override → CBSA single sub-area →
      // CBSA primary umbrella (when only one non-exception umbrella exists).
      // Counties in true metro-split CBSAs without an explicit override are
      // skipped; the page would otherwise present a misleadingly averaged FMR.
      let sourceCode: string | null = null;
      if (subareaOv.overrides[cty.fips]) {
        sourceCode = subareaOv.overrides[cty.fips];
      } else {
        const subareas = hudMetrosByCbsa.get(cbsa.cbsa) ?? [];
        if (subareas.length === 1) {
          sourceCode = subareas[0].source_code;
        } else if (subareas.length > 1) {
          const primary = cbsaPrimaryUmbrella.get(cbsa.cbsa);
          if (primary) {
            sourceCode = primary;
          } else {
            fanoutCountiesAdded.splitNoOverride++;
            continue;
          }
        } else {
          fanoutCountiesAdded.noHudMetro++;
          continue;
        }
      }
      const hudMetro = sourceCode ? hudMetroBySource.get(sourceCode) : null;
      if (!hudMetro) {
        fanoutCountiesAdded.noHudMetro++;
        continue;
      }
      const { full, short } = countyName(a.name);
      const slug = `${slugify(short)}-county-${stateMeta.abbr.toLowerCase()}`;
      if (seenSlugs.has(slug)) {
        fanoutCountiesAdded.slugCollision++;
        continue;
      }
      seenSlugs.add(slug);
      seenFips.add(cty.fips);
      newCounties.push({
        fips: cty.fips,
        state_fips: stateFips,
        state_abbr: stateMeta.abbr,
        county_name: full,
        county_short_name: short,
        slug,
        fmr_studio: hudMetro.fmr_studio || null,
        fmr_1br: hudMetro.fmr_1br || null,
        fmr_2br: hudMetro.fmr_2br || null,
        fmr_3br: hudMetro.fmr_3br || null,
        fmr_4br: hudMetro.fmr_4br || null,
        hud_source_kind: "METRO_M_FANOUT",
        hud_source_code: hudMetro.source_code,
        cbsa: cbsa.cbsa,
        acs_median_rent_overall: a.median_rent_overall,
        acs_median_rent_overall_moe: a.median_rent_overall_moe,
        acs_median_rent_overall_relative_moe: a.median_rent_overall_relative_moe,
        acs_median_rent_studio: a.median_rent_studio,
        acs_median_rent_1br: a.median_rent_1br,
        acs_median_rent_2br: a.median_rent_2br,
        acs_median_rent_3br: a.median_rent_3br,
        acs_median_rent_4br: a.median_rent_4br,
        acs_median_household_income: a.median_household_income,
        acs_rent_burdened_pct: a.rent_burdened_pct,
        acs_renter_occupied_pct: a.renter_occupied_pct,
        acs_total_occupied_units: a.total_occupied_units,
      });
      fanoutCountiesAdded.ok++;
    }
  }
  console.log(`CBSA fanout added: ${fanoutCountiesAdded.ok}`);
  console.log(`  fanout reasons: ${JSON.stringify(fanoutCountiesAdded)}`);
  console.log(`counties total: ${newCounties.length}`);

  // --- build states (NLIHC ∩ ACS) ---
  const newStates: Array<Record<string, unknown>> = [];
  for (const acsSt of acs.states) {
    const nl = nlihcByAbbr.get(acsSt.abbr);
    if (!nl) continue;
    newStates.push({
      state: acsSt.name,
      abbr: acsSt.abbr,
      slug: slugify(acsSt.name),
      fips: acsSt.fips,
      fmr_2br: nl.fmr_2br,
      acs_median_rent_overall: acsSt.median_rent_overall,
      acs_median_rent_2br: acsSt.median_rent_2br,
      acs_median_household_income: acsSt.median_household_income,
      acs_renter_pct: acsSt.renter_occupied_pct,
      acs_rent_burdened_pct: acsSt.rent_burdened_pct,
      nlihc_housing_wage_2br: nl.housing_wage_2br,
      nlihc_housing_wage_rank: nl.rank,
      nlihc_annual_income_2br: nl.annual_income_2br,
      nlihc_mean_renter_wage: nl.mean_renter_wage,
      nlihc_renter_households: nl.renter_households,
    });
  }
  console.log(`states built: ${newStates.length}`);

  // --- build metros (one per CBSA, named via OMB title when available) ---
  // hud.metros now contains all 472 HUD FMR sub-areas. The /metro/ route
  // dedups to one row per CBSA. We use the OMB delineation CBSA *title* for
  // display (e.g. "Los Angeles-Long Beach-Anaheim, CA") rather than HUD's
  // sub-area name ("Los Angeles-Long Beach-Glendale, CA HUD Metro FMR Area")
  // — the OMB title matches the user-facing metro identity and preserves
  // existing slug indexing. FMR fields come from the CBSA's primary umbrella
  // (single non-exception sub-area), or the largest sub-area when split.
  // Per-county exception sub-areas ("{County} County, ST") and CT town areas
  // are filtered — those are not metro-level entities.
  const newMetros: Array<Record<string, unknown>> = [];
  const seenMetroSlugs = new Set<string>();
  const cbsaByCode = new Map(cbsaDelin.cbsas.map((c) => [c.cbsa, c]));
  const metroFmrByCbsa = new Map<string, HudMetro>();
  for (const m of hud.metros) {
    if (exceptionRe.test(m.name) || subCountyRe.test(m.name)) continue;
    const prev = metroFmrByCbsa.get(m.cbsa);
    if (!prev || (m.fmr_2br ?? 0) > (prev.fmr_2br ?? 0)) metroFmrByCbsa.set(m.cbsa, m);
  }
  for (const [cbsa, m] of metroFmrByCbsa) {
    const ombEntry = cbsaByCode.get(cbsa);
    const display = ombEntry ? ombEntry.title : metroDisplayName(m.name);
    const stateMatch = display.match(/,\s*([A-Z]{2})(?:-[A-Z]{2})*\b/);
    const abbr = stateMatch ? stateMatch[1] : "";
    if (!abbr) continue; // PR or unparseable
    if (!nlihcByAbbr.has(abbr)) continue; // strip territories not in our state list
    const slug = metroSlugFromName(display);
    if (!slug || seenMetroSlugs.has(slug)) continue;
    seenMetroSlugs.add(slug);
    newMetros.push({
      cbsa: m.cbsa,
      metro_name: display,
      state_abbr: abbr,
      slug,
      fmr_studio: m.fmr_studio || null,
      fmr_1br: m.fmr_1br || null,
      fmr_2br: m.fmr_2br || null,
      fmr_3br: m.fmr_3br || null,
      fmr_4br: m.fmr_4br || null,
      hud_source_code: m.source_code,
    });
  }
  console.log(`metros built: ${newMetros.length}`);

  // --- write fresh DB ---
  if (existsSync(DB_PATH)) unlinkSync(DB_PATH);
  if (existsSync(`${DB_PATH}-wal`)) unlinkSync(`${DB_PATH}-wal`);
  if (existsSync(`${DB_PATH}-shm`)) unlinkSync(`${DB_PATH}-shm`);
  mkdirSync(dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE states (
      state TEXT NOT NULL,
      abbr TEXT NOT NULL,
      slug TEXT PRIMARY KEY,
      fips TEXT NOT NULL,
      fmr_2br INTEGER,
      acs_median_rent_overall INTEGER,
      acs_median_rent_2br INTEGER,
      acs_median_household_income INTEGER,
      acs_renter_pct REAL,
      acs_rent_burdened_pct REAL,
      nlihc_housing_wage_2br REAL,
      nlihc_housing_wage_rank INTEGER,
      nlihc_annual_income_2br INTEGER,
      nlihc_mean_renter_wage REAL,
      nlihc_renter_households INTEGER
    );
    CREATE INDEX idx_states_abbr ON states(abbr);

    CREATE TABLE counties (
      fips TEXT PRIMARY KEY,
      state_fips TEXT NOT NULL,
      state_abbr TEXT NOT NULL,
      county_name TEXT NOT NULL,
      county_short_name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      fmr_studio INTEGER,
      fmr_1br INTEGER,
      fmr_2br INTEGER,
      fmr_3br INTEGER,
      fmr_4br INTEGER,
      hud_source_kind TEXT,
      hud_source_code TEXT,
      cbsa TEXT,
      acs_median_rent_overall INTEGER,
      acs_median_rent_overall_moe INTEGER,
      acs_median_rent_overall_relative_moe REAL,
      acs_median_rent_studio INTEGER,
      acs_median_rent_1br INTEGER,
      acs_median_rent_2br INTEGER,
      acs_median_rent_3br INTEGER,
      acs_median_rent_4br INTEGER,
      acs_median_household_income INTEGER,
      acs_rent_burdened_pct REAL,
      acs_renter_occupied_pct REAL,
      acs_total_occupied_units INTEGER
    );
    CREATE INDEX idx_counties_state ON counties(state_abbr);

    CREATE TABLE metros (
      cbsa TEXT PRIMARY KEY,
      metro_name TEXT NOT NULL,
      state_abbr TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      fmr_studio INTEGER,
      fmr_1br INTEGER,
      fmr_2br INTEGER,
      fmr_3br INTEGER,
      fmr_4br INTEGER,
      hud_source_code TEXT
    );
    CREATE INDEX idx_metros_state ON metros(state_abbr);
  `);

  const insState = db.prepare(`
    INSERT INTO states (state, abbr, slug, fips, fmr_2br, acs_median_rent_overall, acs_median_rent_2br,
      acs_median_household_income, acs_renter_pct, acs_rent_burdened_pct,
      nlihc_housing_wage_2br, nlihc_housing_wage_rank, nlihc_annual_income_2br,
      nlihc_mean_renter_wage, nlihc_renter_households)
    VALUES (@state, @abbr, @slug, @fips, @fmr_2br, @acs_median_rent_overall, @acs_median_rent_2br,
      @acs_median_household_income, @acs_renter_pct, @acs_rent_burdened_pct,
      @nlihc_housing_wage_2br, @nlihc_housing_wage_rank, @nlihc_annual_income_2br,
      @nlihc_mean_renter_wage, @nlihc_renter_households)
  `);
  const insCounty = db.prepare(`
    INSERT INTO counties (fips, state_fips, state_abbr, county_name, county_short_name, slug,
      fmr_studio, fmr_1br, fmr_2br, fmr_3br, fmr_4br, hud_source_kind, hud_source_code, cbsa,
      acs_median_rent_overall, acs_median_rent_overall_moe, acs_median_rent_overall_relative_moe,
      acs_median_rent_studio, acs_median_rent_1br, acs_median_rent_2br, acs_median_rent_3br, acs_median_rent_4br,
      acs_median_household_income, acs_rent_burdened_pct, acs_renter_occupied_pct, acs_total_occupied_units)
    VALUES (@fips, @state_fips, @state_abbr, @county_name, @county_short_name, @slug,
      @fmr_studio, @fmr_1br, @fmr_2br, @fmr_3br, @fmr_4br, @hud_source_kind, @hud_source_code, @cbsa,
      @acs_median_rent_overall, @acs_median_rent_overall_moe, @acs_median_rent_overall_relative_moe,
      @acs_median_rent_studio, @acs_median_rent_1br, @acs_median_rent_2br, @acs_median_rent_3br, @acs_median_rent_4br,
      @acs_median_household_income, @acs_rent_burdened_pct, @acs_renter_occupied_pct, @acs_total_occupied_units)
  `);
  const insMetro = db.prepare(`
    INSERT INTO metros (cbsa, metro_name, state_abbr, slug,
      fmr_studio, fmr_1br, fmr_2br, fmr_3br, fmr_4br, hud_source_code)
    VALUES (@cbsa, @metro_name, @state_abbr, @slug,
      @fmr_studio, @fmr_1br, @fmr_2br, @fmr_3br, @fmr_4br, @hud_source_code)
  `);

  db.transaction(() => {
    for (const s of newStates) insState.run(s);
    for (const c of newCounties) insCounty.run(c);
    for (const m of newMetros) insMetro.run(m);
  })();
  db.close();
  console.log(`\nwrote ${DB_PATH}: ${newStates.length} states, ${newCounties.length} counties, ${newMetros.length} metros`);

  // --- compute drop list ---
  const newSlugs = {
    state: new Set(newStates.map((s) => String(s.slug))),
    county: new Set(newCounties.map((c) => String(c.slug))),
    metro: new Set(newMetros.map((m) => String(m.slug))),
  };
  const dropped: { type: "state" | "county" | "metro"; slug: string }[] = [];
  for (const slug of oldSlugs.state) if (!newSlugs.state.has(slug)) dropped.push({ type: "state", slug });
  for (const slug of oldSlugs.county) if (!newSlugs.county.has(slug)) dropped.push({ type: "county", slug });
  for (const slug of oldSlugs.metro) if (!newSlugs.metro.has(slug)) dropped.push({ type: "metro", slug });
  dropped.sort((a, b) => a.type.localeCompare(b.type) || a.slug.localeCompare(b.slug));

  const droppedPath = "lib/generated/dropped-slugs.json";
  mkdirSync(dirname(droppedPath), { recursive: true });
  writeFileSync(
    droppedPath,
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        notes:
          "Slugs present in the previous synthetic DB but absent from the real-data rebuild. Middleware should respond 410 for these to release Google's index footprint.",
        counts: {
          total: dropped.length,
          state: dropped.filter((s) => s.type === "state").length,
          county: dropped.filter((s) => s.type === "county").length,
          metro: dropped.filter((s) => s.type === "metro").length,
        },
        slugs: dropped,
      },
      null,
      2,
    ),
  );
  console.log(`dropped-slugs.json: ${dropped.length} entries`);

  // --- vintage manifest ---
  writeFileSync(
    "lib/generated/data-vintage.json",
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        sources: {
          hud_fmr: {
            vintage: "FY2025",
            description: "HUD Fair Market Rents Fiscal Year 2025",
            url: "https://www.huduser.gov/portal/datasets/fmr.html",
            via: "ArcGIS REST (services.arcgis.com/.../Fair_Market_Rents)",
            fetched_at: hud.fetched_at,
          },
          acs: {
            vintage: "2023 5-Year (2019-2023 ACS)",
            description: "Census ACS B25031 (Median Gross Rent), B19013 (Income), B25070 (Rent Burden), B25008 (Tenure)",
            url: "https://www.census.gov/programs-surveys/acs/",
            fetched_at: acs.fetched_at,
            quality_filter: "MOE / estimate ≤ 30% on B25031_001E; counties failing the filter are dropped from the keep set",
          },
          nlihc: {
            vintage: "Out of Reach 2025",
            description: "NLIHC Housing Wage 2-bedroom (FY25 FMR / 30% income rule)",
            url: "https://nlihc.org/oor",
            fetched_at: nlihc.fetched_at,
          },
        },
        coverage: {
          states: newStates.length,
          counties_kept: newCounties.length,
          metros: newMetros.length,
          counties_dropped_from_synthetic_baseline: dropped.filter((d) => d.type === "county").length,
        },
      },
      null,
      2,
    ),
  );
  console.log(`data-vintage.json written`);
}

main();
