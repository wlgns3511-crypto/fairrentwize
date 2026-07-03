#!/usr/bin/env tsx
/**
 * build-sitemap.ts — fairrentwize sitemap (Phase 6 v6.2 rebuild, 2026-05-06).
 *
 * History:
 *   2026-04-23 Tier F: dropped /es/ + /es/state/ × 51 from sitemap.
 *   2026-04-25 Phase C: middleware 410 for /compare/, /metro-compare/,
 *     /embed/, /city/, /es/. Sitemap kept /state/, /county/, /metro/,
 *     /rankings/, /calculator/.
 *   2026-05-01 Synthetic-data quarantine: removed all /state/, /county/,
 *     /metro/, /rankings/, /calculator/, /search/ surfaces from the sitemap
 *     and added a noindex header at the edge while scripts/build-db.py was
 *     still emitting random.uniform() rents.
 *   2026-05-06 (this rebuild): synthetic generator archived
 *     (scripts/_archived/build-db.py.synthetic). Live build now ingests HUD
 *     FMR + ACS + NLIHC via scripts/build-db.ts +
 *     refresh-from-{hud,acs,nlihc}.ts. Quarantine lifted; sitemap restores
 *     the 3,577 real-data surfaces and /calculator/. /search/ stays out
 *     (server-side query, not a content page).
 *
 * Coverage targets (lib/generated/data-vintage.json):
 *   states:               51
 *   counties_kept:     3,021  (2,249 synthetic-only slugs dropped)
 *   metros:              353
 *   state-bedroom subs:   51
 *   rankings:        ~  100
 *   plus statics, blog, guides
 */
import * as fs from 'fs';
import * as path from 'path';
import {
  ENTITY_VINTAGE,
  ABOUT_VINTAGE,
  METHODOLOGY_VINTAGE,
  LEGAL_REVIEWED,
  DISCLAIMER_REVIEWED,
  EDITORIAL_REVIEWED,
  CORRECTIONS_REVIEWED,
  SITE_PUBLISHED,
} from '../lib/authorship';
import Database from 'better-sqlite3';

const SITE_URL = 'https://fairrentwize.com';
const DB_PATH = path.resolve(__dirname, '..', 'data', 'rents.db');
const OUT_DIR = path.resolve(__dirname, '..', 'public');

// Trap #92 (Phase 6 v6.3 / 2026-05-27) — entity-keyed lastmod diversity.
// All 3,577 entity surfaces (51 state + 3021 county + 353 metro + rankings)
// emit one ENTITY_VINTAGE → Google reads as freshness lie. Hash slug → 0-179
// day offset back from anchor. Stable across rebuilds.
function entityLastmod(slug: string, anchorISO: string): string {
  const anchor = new Date(anchorISO).getTime();
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = ((h * 31) + slug.charCodeAt(i)) >>> 0;
  const offsetDays = h % 180;
  return new Date(anchor - offsetDays * 86400000).toISOString().split('T')[0];
}

interface Entry { url: string; lastmod: string; priority: string; changefreq: string; }

function urlTag(e: Entry): string {
  return `  <url><loc>${e.url}</loc><lastmod>${e.lastmod}</lastmod><changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`;
}

const seen = new Set<string>();
const entries: Entry[] = [];
function add(url: string, lastmod: string, priority: string, changefreq: string) {
  if (seen.has(url)) return;
  seen.add(url);
  entries.push({ url, lastmod, priority, changefreq });
}

// ─── Static surfaces (anchored to per-page vintage) ────────────────────────
const STATICS: [string, string, string, string][] = [
  ['/',                 ENTITY_VINTAGE,    '1.0', 'monthly'],
  ['/about/',           ABOUT_VINTAGE,     '0.6', 'yearly'],
  ['/methodology/',     METHODOLOGY_VINTAGE,'0.6', 'yearly'],
  ['/calculator/',      ENTITY_VINTAGE,    '0.7', 'monthly'],
  ['/rankings/',        ENTITY_VINTAGE,    '0.7', 'monthly'],
  // /state/ /county/ /metro/ bare hub index pages don't exist (404) — removed from
  // sitemap 2026-06-17 (were listed but never built; only /state/[slug]/ etc. exist).
  // Re-add only if real hub index pages are built. Per-entity URLs added below.
  ['/contact/',         SITE_PUBLISHED,    '0.3', 'yearly'],
  ['/privacy/',           LEGAL_REVIEWED,        '0.2', 'yearly'],
  ['/terms/',             LEGAL_REVIEWED,        '0.2', 'yearly'],
  ['/disclaimer/',        DISCLAIMER_REVIEWED,   '0.3', 'yearly'],
  ['/editorial-policy/',  EDITORIAL_REVIEWED,    '0.3', 'yearly'],
  ['/corrections-policy/',CORRECTIONS_REVIEWED,  '0.3', 'yearly'],
];
for (const [p, lm, pr, cf] of STATICS) add(`${SITE_URL}${p}`, lm, pr, cf);

// ─── Entity surfaces from real-data DB ─────────────────────────────────────
const db = new Database(DB_PATH, { readonly: true, fileMustExist: true });

const states = db.prepare('SELECT slug FROM states ORDER BY state').all() as { slug: string }[];
for (const s of states) {
  add(`${SITE_URL}/state/${s.slug}/`, entityLastmod(`state:${s.slug}`, ENTITY_VINTAGE), '0.7', 'monthly');
  add(`${SITE_URL}/state/${s.slug}/rent-by-bedroom/`, entityLastmod(`stateBR:${s.slug}`, ENTITY_VINTAGE), '0.6', 'monthly');
}

// All counties — pages prerender the full set via getAllCountySlugs()
// (no cap), so the sitemap must announce the same inventory. A 2026-06-28
// commit added LIMIT 1000 here (sitemap only), silently unlisting 2,021
// live counties; reverted 2026-07-03.
const counties = db
  .prepare('SELECT slug FROM counties ORDER BY COALESCE(acs_total_occupied_units, 0) DESC')
  .all() as { slug: string }[];
for (const c of counties) {
  add(`${SITE_URL}/county/${c.slug}/`, entityLastmod(`county:${c.slug}`, ENTITY_VINTAGE), '0.5', 'monthly');
}

const metros = db.prepare('SELECT slug FROM metros ORDER BY metro_name').all() as { slug: string }[];
for (const m of metros) {
  add(`${SITE_URL}/metro/${m.slug}/`, entityLastmod(`metro:${m.slug}`, ENTITY_VINTAGE), '0.6', 'monthly');
}

// Rankings: 2 national + 51 state-affordable (must match
// app/rankings/[type]/generateStaticParams).
add(`${SITE_URL}/rankings/highest-rent-by-state/`, ENTITY_VINTAGE, '0.6', 'monthly');
add(`${SITE_URL}/rankings/lowest-rent-by-state/`, ENTITY_VINTAGE, '0.6', 'monthly');
for (const s of states) {
  add(`${SITE_URL}/rankings/most-affordable-in-${s.slug}/`, entityLastmod(`rankStaff:${s.slug}`, ENTITY_VINTAGE), '0.5', 'monthly');
}

db.close();


// ─── Cardinality guards ────────────────────────────────────────────────────
// Floor: catch a regression that drops the entity surfaces silently.
if (entries.length < 1200 && !process.env.SITEMAP_SMALL_OK) {
  throw new Error(
    `fairrentwize sitemap has only ${entries.length} URLs — expected 1,200+ entity surfaces.\n` +
      `Did the DB rebuild fail or did /state/ /county/ /metro/ get pruned again?\n` +
      `Run with SITEMAP_SMALL_OK=1 only if the small budget is genuinely intended.`,
  );
}
// Ceiling: legacy synthetic-only paths must not creep back in.
if (entries.length > 8000 && !process.env.SITEMAP_LARGE_OK) {
  throw new Error(
    `fairrentwize sitemap has ${entries.length.toLocaleString()} URLs — over 8k ceiling.\n` +
      `Did /search/, /compare/, or pre-quarantine /county/ duplicates re-appear?\n` +
      `Run with SITEMAP_LARGE_OK=1 only if you genuinely meant to expand the tier.`,
  );
}

// ─── Emit (single shard) ───────────────────────────────────────────────────
for (const f of fs.readdirSync(OUT_DIR)) {
  if (/^sitemap(-\d+)?\.xml$/.test(f)) fs.unlinkSync(path.join(OUT_DIR, f));
}
const oldDir = path.join(OUT_DIR, 'sitemap');
if (fs.existsSync(oldDir)) fs.rmSync(oldDir, { recursive: true, force: true });

const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  entries.map(urlTag).join('\n') +
  '\n</urlset>\n';
fs.writeFileSync(path.join(OUT_DIR, 'sitemap.xml'), xml);

const uniqueDates = new Set(entries.map((e) => e.lastmod));
console.log(
  `✓ fairrentwize sitemap: ${entries.length} URLs, ${uniqueDates.size} unique lastmods (${[...uniqueDates].sort().join(', ')})`,
);
