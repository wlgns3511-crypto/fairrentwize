import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'rents.db');
let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) _db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  return _db;
}

export interface County {
  id: number;
  county_name: string;
  state: string;
  slug: string;
  fmr_studio: number;
  fmr_1br: number;
  fmr_2br: number;
  fmr_3br: number;
  fmr_4br: number;
  median_income: number;
  rent_burden_pct: number;
  population: number;
}

export interface Metro {
  id: number;
  metro_name: string;
  state: string;
  slug: string;
  fmr_studio: number;
  fmr_1br: number;
  fmr_2br: number;
  fmr_3br: number;
  fmr_4br: number;
  median_income: number;
  vacancy_rate: number;
}

export interface StateRow {
  state: string;
  abbr: string;
  slug: string;
  avg_rent_1br: number;
  avg_rent_2br: number;
  median_income: number;
  renter_pct: number;
  tenant_rights_score: number;
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
  const allowed = ['avg_rent_1br', 'avg_rent_2br', 'median_income', 'renter_pct', 'tenant_rights_score'];
  if (!allowed.includes(orderBy)) orderBy = 'avg_rent_2br';
  return getDb().prepare(`SELECT * FROM states ORDER BY ${orderBy} DESC LIMIT ?`).all(limit) as StateRow[];
}

// --- County queries ---

export function getAllCountySlugs(): { slug: string }[] {
  return getDb().prepare('SELECT slug FROM counties ORDER BY population DESC').all() as { slug: string }[];
}

export function getCountyBySlug(slug: string): County | undefined {
  return getDb().prepare('SELECT * FROM counties WHERE slug = ?').get(slug) as County | undefined;
}

export function getCountiesByState(abbr: string): County[] {
  return getDb().prepare('SELECT * FROM counties WHERE state = ? ORDER BY population DESC').all(abbr) as County[];
}

export function getTopCountiesByRent(limit = 20): County[] {
  return getDb().prepare('SELECT * FROM counties ORDER BY fmr_2br DESC LIMIT ?').all(limit) as County[];
}

export function getMostAffordableCounties(limit = 20): County[] {
  return getDb().prepare('SELECT * FROM counties ORDER BY fmr_2br ASC LIMIT ?').all(limit) as County[];
}

export function getHighBurdenCounties(limit = 20): County[] {
  return getDb().prepare('SELECT * FROM counties ORDER BY rent_burden_pct DESC LIMIT ?').all(limit) as County[];
}

export function getRelatedCounties(state: string, excludeSlug: string, limit = 8): County[] {
  return getDb().prepare(
    'SELECT * FROM counties WHERE state = ? AND slug != ? ORDER BY population DESC LIMIT ?'
  ).all(state, excludeSlug, limit) as County[];
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
  return getDb().prepare('SELECT * FROM metros WHERE state = ? ORDER BY metro_name').all(abbr) as Metro[];
}

export function getTopMetrosByRent(limit = 20): Metro[] {
  return getDb().prepare('SELECT * FROM metros ORDER BY fmr_2br DESC LIMIT ?').all(limit) as Metro[];
}

export function getMostAffordableMetros(limit = 20): Metro[] {
  return getDb().prepare('SELECT * FROM metros ORDER BY fmr_2br ASC LIMIT ?').all(limit) as Metro[];
}

export function countMetros(): number {
  return (getDb().prepare('SELECT COUNT(*) as c FROM metros').get() as { c: number }).c;
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
  // Generate top 200 state-vs-state comparisons
  const top = states.slice(0, 20);
  for (let i = 0; i < top.length; i++) {
    for (let j = i + 1; j < top.length; j++) {
      slugs.push(`${top[i].slug}-vs-${top[j].slug}`);
    }
  }
  return slugs.slice(0, 200);
}

// --- Metro Comparison queries ---

export interface MetroComparison {
  id: number;
  slug: string;
  metro_a_slug: string;
  metro_b_slug: string;
}

export function getAllMetroComparisonSlugs(limit = 50000): MetroComparison[] {
  return getDb().prepare('SELECT * FROM metro_comparisons ORDER BY id LIMIT ?').all(limit) as MetroComparison[];
}

export function getMetroComparisonBySlug(slug: string): { a: Metro; b: Metro } | undefined {
  const row = getDb().prepare('SELECT metro_a_slug, metro_b_slug FROM metro_comparisons WHERE slug = ?').get(slug) as { metro_a_slug: string; metro_b_slug: string } | undefined;
  if (!row) return undefined;
  const a = getMetroBySlug(row.metro_a_slug);
  const b = getMetroBySlug(row.metro_b_slug);
  if (!a || !b) return undefined;
  return { a, b };
}

export function countMetroComparisons(): number {
  try {
    return (getDb().prepare('SELECT COUNT(*) as c FROM metro_comparisons').get() as { c: number }).c;
  } catch { return 0; }
}
