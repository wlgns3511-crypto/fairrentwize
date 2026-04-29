#!/usr/bin/env tsx
/**
 * build-sitemap.ts — fairrentwize sitemap (HCU Phase C, 2026-04-25).
 *
 * PRUNING HISTORY:
 *   2026-04-23 Tier F: dropped /es/ homepage + /es/state/ × 51 = 52 mirrors
 *     from sitemap (route stayed live → external backlink 404 still accumulating
 *     in GSC = `/es/rankings/all/` etc).
 *
 *   2026-04-25 Phase C (this rewrite):
 *     GSC after 3 months on fairrentwize.com (54 queries / 0 clicks):
 *       - 1,000+ /compare/{a-vs-b}/ 404 (state×state was 100 generated, but
 *         external backlinks expanded matrix shape — city-vs-city legacy)
 *       - 510 /compare/ "사용자 표준 없는 중복 페이지"
 *       - 822 /metro-compare/{a-vs-b}/ "canonical alternate" (www subdomain)
 *       - 39 /metro-compare/ + /county/ "발견됨-색인X"
 *       - top 10 GSC queries 100% English, all calculator-shaped
 *
 *     Killed (410 via middleware): /compare/, /metro-compare/, /embed/,
 *       /city/ (legacy 404), /es/ subtree (locale, English top searches).
 *       app/{compare,metro-compare,embed,es}/ dirs removed (5 page.tsx files).
 *
 *     Kept: /calculator/ (top GSC signal), /state/ × 51 + rent-by-bedroom × 51,
 *       /county/ × 2,943 (HUD county FMR, real data), /metro/ × 219,
 *       /rankings/ + /rankings/highest/lowest + /rankings/most-affordable-{state} × 51,
 *       /blog (~33), /guide (~6), /, /about, /contact, /privacy, /terms.
 *
 *     Sitemap: 3,560 → ~3,360 URLs (-5.6%, smaller ratio than visapeek -85%
 *       because compare/metro-compare were already capped at 100 each. Phase C
 *       value here = middleware 410 killing GSC zombie 1,500+ URLs that the
 *       4/22 cap didn't deindex).
 */
import * as fs from 'fs';
import * as path from 'path';
import { getAllStates, getAllCountySlugs, getAllMetroSlugs } from '../lib/db';
import { getAllPosts } from '../lib/blog';
import { getAllGuides } from '../lib/guides';

const SITE_URL = 'https://fairrentwize.com';
const NOW = new Date().toISOString().split('T')[0];
const SHARD_SIZE = 40000;
const OUT_DIR = path.resolve(__dirname, '..', 'public');

interface Entry { url: string; lastmod?: string; priority?: string; changefreq?: string; }

function urlTag(e: Entry): string {
  return `  <url><loc>${e.url}</loc><lastmod>${e.lastmod ?? NOW}</lastmod><changefreq>${e.changefreq ?? 'monthly'}</changefreq><priority>${e.priority ?? '0.6'}</priority></url>`;
}

function writeShard(id: number, es: Entry[]) {
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    es.map(urlTag).join('\n') + '\n</urlset>\n';
  fs.writeFileSync(path.join(OUT_DIR, `sitemap-${id}.xml`), xml);
}

const seen = new Set<string>();
const entries: Entry[] = [];
function add(e: Entry) { if (!seen.has(e.url)) { seen.add(e.url); entries.push(e); } }

// ── Static / hub pages (EN only) ─────────────────────────────────────────────
add({ url: `${SITE_URL}/`, priority: '1.0', changefreq: 'monthly' });
add({ url: `${SITE_URL}/calculator/`, priority: '0.9', changefreq: 'monthly' });
add({ url: `${SITE_URL}/about/`, priority: '0.3', changefreq: 'yearly' });
add({ url: `${SITE_URL}/privacy/`, priority: '0.3', changefreq: 'yearly' });
add({ url: `${SITE_URL}/terms/`, priority: '0.3', changefreq: 'yearly' });
add({ url: `${SITE_URL}/contact/`, priority: '0.3', changefreq: 'yearly' });
add({ url: `${SITE_URL}/methodology/`, priority: '0.4', changefreq: 'yearly' });
add({ url: `${SITE_URL}/disclaimer/`, priority: '0.3', changefreq: 'yearly' });

// ── Blog ─────────────────────────────────────────────────────────────────────
add({ url: `${SITE_URL}/blog/`, priority: '0.8', changefreq: 'weekly' });
for (const p of getAllPosts()) {
  add({ url: `${SITE_URL}/blog/${p.slug}/`, priority: '0.7', changefreq: 'monthly' });
}

// ── Guides ───────────────────────────────────────────────────────────────────
add({ url: `${SITE_URL}/guide/`, priority: '0.8', changefreq: 'weekly' });
for (const g of getAllGuides()) {
  add({ url: `${SITE_URL}/guide/${g.slug}/`, lastmod: g.updatedAt || NOW, priority: '0.7', changefreq: 'monthly' });
}

// ── Rankings: hub + per-state ────────────────────────────────────────────────
const allStatesList = getAllStates();
add({ url: `${SITE_URL}/rankings/`, priority: '0.8', changefreq: 'monthly' });
add({ url: `${SITE_URL}/rankings/highest-rent-by-state/`, priority: '0.6', changefreq: 'monthly' });
add({ url: `${SITE_URL}/rankings/lowest-rent-by-state/`, priority: '0.6', changefreq: 'monthly' });
for (const s of allStatesList) {
  add({ url: `${SITE_URL}/rankings/most-affordable-in-${s.slug}/`, priority: '0.6', changefreq: 'monthly' });
}

// ── States × 51 + rent-by-bedroom × 51 (Tier S 4/21 expansion) ──────────────
for (const s of allStatesList) {
  add({ url: `${SITE_URL}/state/${s.slug}/`, priority: '0.85', changefreq: 'monthly' });
  add({ url: `${SITE_URL}/state/${s.slug}/rent-by-bedroom/`, priority: '0.7', changefreq: 'monthly' });
}

// ── Counties × ~2,943 (real HUD county-level FMR data) ───────────────────────
for (const c of getAllCountySlugs()) {
  add({ url: `${SITE_URL}/county/${c.slug}/`, priority: '0.7', changefreq: 'monthly' });
}

// ── Metros × ~219 (real HUD metro-level FMR data) ────────────────────────────
for (const m of getAllMetroSlugs()) {
  add({ url: `${SITE_URL}/metro/${m.slug}/`, priority: '0.75', changefreq: 'monthly' });
}

// ── Cardinality guard ────────────────────────────────────────────────────────
// Phase C target ~3,360. Tripwire at 3,800 (county data could grow naturally).
if (entries.length > 3800 && !process.env.SITEMAP_LARGE_OK) {
  throw new Error(
    `fairrentwize sitemap has ${entries.length.toLocaleString()} URLs — Phase C budget is ~3,360.\n` +
      `Did /compare/ or /metro-compare/ get re-added? Those are the doorways HCU Phase C explicitly killed.\n` +
      `Or did /county/ data grow > 3,500? Review and bump guard if intentional.\n` +
      `Run with SITEMAP_LARGE_OK=1 if you genuinely meant to expand the tier.`,
  );
}

// ── Clean old sitemaps ───────────────────────────────────────────────────────
for (const f of fs.readdirSync(OUT_DIR)) {
  if (/^sitemap(-\d+)?\.xml$/.test(f)) fs.unlinkSync(path.join(OUT_DIR, f));
}
const oldDir = path.join(OUT_DIR, 'sitemap');
if (fs.existsSync(oldDir)) fs.rmSync(oldDir, { recursive: true, force: true });

const shardCount = Math.ceil(entries.length / SHARD_SIZE);
if (shardCount <= 1) {
  writeShard(0, entries);
  fs.renameSync(path.join(OUT_DIR, 'sitemap-0.xml'), path.join(OUT_DIR, 'sitemap.xml'));
} else {
  for (let i = 0; i < shardCount; i++) {
    writeShard(i, entries.slice(i * SHARD_SIZE, (i + 1) * SHARD_SIZE));
  }
  const indexXml =
    '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    Array.from({ length: shardCount }, (_, i) =>
      `  <sitemap><loc>${SITE_URL}/sitemap-${i}.xml</loc><lastmod>${NOW}</lastmod></sitemap>`
    ).join('\n') + '\n</sitemapindex>\n';
  fs.writeFileSync(path.join(OUT_DIR, 'sitemap.xml'), indexXml);
}

console.log(`✓ fairrentwize sitemap: ${entries.length} unique URLs, ${shardCount || 1} shard(s)`);
