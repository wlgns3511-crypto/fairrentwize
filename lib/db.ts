import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'rents.db');
let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) _db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  return _db;
}

export interface County {
  fips: string;
  state_fips: string;
  state_abbr: string;
  county_name: string;
  county_short_name: string;
  slug: string;
  fmr_studio: number | null;
  fmr_1br: number | null;
  fmr_2br: number | null;
  fmr_3br: number | null;
  fmr_4br: number | null;
  hud_source_kind: 'NCNTY' | 'METRO_N' | 'METRO_M_FANOUT' | null;
  hud_source_code: string | null;
  cbsa: string | null;
  acs_median_rent_overall: number | null;
  acs_median_rent_overall_moe: number | null;
  acs_median_rent_overall_relative_moe: number | null;
  acs_median_rent_studio: number | null;
  acs_median_rent_1br: number | null;
  acs_median_rent_2br: number | null;
  acs_median_rent_3br: number | null;
  acs_median_rent_4br: number | null;
  acs_median_household_income: number | null;
  acs_rent_burdened_pct: number | null;
  acs_renter_occupied_pct: number | null;
  acs_total_occupied_units: number | null;
}

export interface Metro {
  cbsa: string;
  metro_name: string;
  state_abbr: string;
  slug: string;
  fmr_studio: number | null;
  fmr_1br: number | null;
  fmr_2br: number | null;
  fmr_3br: number | null;
  fmr_4br: number | null;
  hud_source_code: string | null;
}

export interface StateRow {
  state: string;
  abbr: string;
  slug: string;
  fips: string;
  fmr_2br: number | null;
  acs_median_rent_overall: number | null;
  acs_median_rent_2br: number | null;
  acs_median_household_income: number | null;
  acs_renter_pct: number | null;
  acs_rent_burdened_pct: number | null;
  nlihc_housing_wage_2br: number | null;
  nlihc_housing_wage_rank: number | null;
  nlihc_annual_income_2br: number | null;
  nlihc_mean_renter_wage: number | null;
  nlihc_renter_households: number | null;
}

// --- State queries ---

export function getAllStates(): StateRow[] {
  return getDb().prepare('SELECT * FROM states ORDER BY state').all() as StateRow[];
}

export function getStateBySlug(slug: string): StateRow | undefined {
  return getDb().prepare('SELECT * FROM states WHERE slug = ?').get(slug) as StateRow | undefined;
}

export function getStateByAbbr(abbr: string): StateRow | undefined {
  return getDb().prepare('SELECT * FROM states WHERE abbr = ?').get(abbr) as StateRow | undefined;
}

export function getStatesRanked(orderBy: string, limit = 50): StateRow[] {
  const allowed = [
    'fmr_2br',
    'acs_median_rent_overall',
    'acs_median_rent_2br',
    'acs_median_household_income',
    'acs_renter_pct',
    'acs_rent_burdened_pct',
    'nlihc_housing_wage_2br',
    'nlihc_mean_renter_wage',
  ];
  const col = allowed.includes(orderBy) ? orderBy : 'fmr_2br';
  return getDb()
    .prepare(`SELECT * FROM states WHERE ${col} IS NOT NULL ORDER BY ${col} DESC LIMIT ?`)
    .all(limit) as StateRow[];
}

// --- County queries ---

export function getAllCountySlugs(): { slug: string }[] {
  // Order by ACS occupied-unit count as a proxy for population (real ACS data,
  // unlike the old synthetic `population` column).
  return getDb()
    .prepare(
      'SELECT slug FROM counties ORDER BY COALESCE(acs_total_occupied_units, 0) DESC'
    )
    .all() as { slug: string }[];
}

export function getCountyBySlug(slug: string): County | undefined {
  return getDb().prepare('SELECT * FROM counties WHERE slug = ?').get(slug) as County | undefined;
}

export function getCountiesByState(abbr: string): County[] {
  return getDb()
    .prepare(
      'SELECT * FROM counties WHERE state_abbr = ? ORDER BY COALESCE(acs_total_occupied_units, 0) DESC'
    )
    .all(abbr) as County[];
}

export function getTopCountiesByRent(limit = 20): County[] {
  return getDb()
    .prepare('SELECT * FROM counties WHERE fmr_2br IS NOT NULL ORDER BY fmr_2br DESC LIMIT ?')
    .all(limit) as County[];
}

export function getMostAffordableCounties(limit = 20): County[] {
  return getDb()
    .prepare('SELECT * FROM counties WHERE fmr_2br IS NOT NULL ORDER BY fmr_2br ASC LIMIT ?')
    .all(limit) as County[];
}

export function getHighBurdenCounties(limit = 20): County[] {
  return getDb()
    .prepare(
      'SELECT * FROM counties WHERE acs_rent_burdened_pct IS NOT NULL ORDER BY acs_rent_burdened_pct DESC LIMIT ?'
    )
    .all(limit) as County[];
}

export function getRelatedCounties(state_abbr: string, excludeSlug: string, limit = 8): County[] {
  return getDb()
    .prepare(
      'SELECT * FROM counties WHERE state_abbr = ? AND slug != ? ORDER BY COALESCE(acs_total_occupied_units, 0) DESC LIMIT ?'
    )
    .all(state_abbr, excludeSlug, limit) as County[];
}

export function countCounties(): number {
  return (getDb().prepare('SELECT COUNT(*) as c FROM counties').get() as { c: number }).c;
}

// --- Metro queries ---

export function getAllMetroSlugs(): { slug: string }[] {
  return getDb().prepare('SELECT slug FROM metros ORDER BY metro_name').all() as { slug: string }[];
}

export function getMetroBySlug(slug: string): Metro | undefined {
  return getDb().prepare('SELECT * FROM metros WHERE slug = ?').get(slug) as Metro | undefined;
}

export function getMetrosByState(abbr: string): Metro[] {
  return getDb()
    .prepare('SELECT * FROM metros WHERE state_abbr = ? ORDER BY metro_name')
    .all(abbr) as Metro[];
}

export function getTopMetrosByRent(limit = 20): Metro[] {
  return getDb()
    .prepare('SELECT * FROM metros WHERE fmr_2br IS NOT NULL ORDER BY fmr_2br DESC LIMIT ?')
    .all(limit) as Metro[];
}

export function getMostAffordableMetros(limit = 20): Metro[] {
  return getDb()
    .prepare('SELECT * FROM metros WHERE fmr_2br IS NOT NULL ORDER BY fmr_2br ASC LIMIT ?')
    .all(limit) as Metro[];
}

export function countMetros(): number {
  return (getDb().prepare('SELECT COUNT(*) as c FROM metros').get() as { c: number }).c;
}

// --- Search queries ---

export function searchMetros(query: string, limit = 20): Metro[] {
  const q = `%${query}%`;
  return getDb()
    .prepare(
      'SELECT * FROM metros WHERE metro_name LIKE ? OR state_abbr LIKE ? ORDER BY metro_name LIMIT ?'
    )
    .all(q, q, limit) as Metro[];
}

export function searchCounties(query: string, limit = 20): County[] {
  const q = `%${query}%`;
  return getDb()
    .prepare(
      'SELECT * FROM counties WHERE county_name LIKE ? OR state_abbr LIKE ? ORDER BY county_name LIMIT ?'
    )
    .all(q, q, limit) as County[];
}

// --- Compare queries ---

export function getCompareStates(slug: string): { a: StateRow; b: StateRow } | undefined {
  const parts = slug.split('-vs-');
  if (parts.length !== 2) return undefined;
  const a = getStateBySlug(parts[0]);
  const b = getStateBySlug(parts[1]);
  if (!a || !b) return undefined;
  return { a, b };
}

export function generateCompareSlugs(): string[] {
  const states = getAllStates();
  const slugs: string[] = [];
  const CAP = 100;
  const top = states.slice(0, 20);
  for (let i = 0; i < top.length && slugs.length < CAP; i++) {
    for (let j = i + 1; j < top.length && slugs.length < CAP; j++) {
      slugs.push(`${top[i].slug}-vs-${top[j].slug}`);
    }
  }
  return slugs;
}
