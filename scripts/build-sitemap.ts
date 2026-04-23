#!/usr/bin/env tsx
/**
 * build-sitemap.ts — fairrentwize static sitemap generator.
 * Generates public/sitemap.xml (index if sharded, else single file).
 *
 * PRUNING HISTORY (HCU March 2026 Tier F — 2026-04-23):
 *   Dropped /es/ homepage + /es/state/ × 51 = 52 thin translation mirrors.
 *   Minor drop (1.4%), but same HCU-defense playbook as Tier E/F peers —
 *   no live /es/ content, just a UI-chrome translation of states data.
 *   Route stays live via dynamicParams; just not announced to Google.
 *
 * Dynamic routes:
 *   state/[slug]         dynamicParams=true  → all states (getAllStates)
 *   county/[slug]        dynamicParams=true  → all counties (getAllCountySlugs)
 *   metro/[slug]         dynamicParams=true  → all metros (getAllMetroSlugs)
 *   compare/[slug]       dynamicParams=true  → all compare slugs (generateCompareSlugs)
 *   metro-compare/[slug] dynamicParams=true  → all valid metro comparisons
 */
import * as fs from 'fs';
import * as path from 'path';
import { getAllStates, getAllCountySlugs, getAllMetroSlugs, generateCompareSlugs, getAllMetroComparisonSlugs } from '../lib/db';
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

// ---- Collect entries with dedup ----
const seen = new Set<string>();
const entries: Entry[] = [];
function add(e: Entry) { if (!seen.has(e.url)) { seen.add(e.url); entries.push(e); } }

// Static pages (EN only — /es/ dropped 2026-04-23 Tier F)
add({ url: `${SITE_URL}/`, priority: '1.0', changefreq: 'monthly' });
add({ url: `${SITE_URL}/calculator/`, priority: '0.9', changefreq: 'monthly' });
add({ url: `${SITE_URL}/about/`, priority: '0.3', changefreq: 'yearly' });
add({ url: `${SITE_URL}/privacy/`, priority: '0.3', changefreq: 'yearly' });
add({ url: `${SITE_URL}/terms/`, priority: '0.3', changefreq: 'yearly' });
add({ url: `${SITE_URL}/contact/`, priority: '0.3', changefreq: 'yearly' });

// Blog
add({ url: `${SITE_URL}/blog/`, priority: '0.8', changefreq: 'weekly' });
for (const p of getAllPosts()) {
  add({ url: `${SITE_URL}/blog/${p.slug}/`, priority: '0.7', changefreq: 'monthly' });
}

// Guides
add({ url: `${SITE_URL}/guide/`, priority: '0.8', changefreq: 'weekly' });
for (const g of getAllGuides()) {
  add({ url: `${SITE_URL}/guide/${g.slug}/`, lastmod: g.updatedAt || NOW, priority: '0.7', changefreq: 'monthly' });
}

// Rankings: hub + per-state
const allStatesList = getAllStates();
add({ url: `${SITE_URL}/rankings/`, priority: '0.8', changefreq: 'monthly' });
add({ url: `${SITE_URL}/rankings/highest-rent-by-state/`, priority: '0.6', changefreq: 'monthly' });
add({ url: `${SITE_URL}/rankings/lowest-rent-by-state/`, priority: '0.6', changefreq: 'monthly' });
for (const s of allStatesList) {
  add({ url: `${SITE_URL}/rankings/most-affordable-in-${s.slug}/`, priority: '0.6', changefreq: 'monthly' });
}

// States: dynamicParams=true → all states (EN only).
// /es/state/ × 51 thin-translation mirror DROPPED 2026-04-23 Tier F.
for (const s of allStatesList) {
  add({ url: `${SITE_URL}/state/${s.slug}/`, priority: '0.8', changefreq: 'monthly' });
  // Tier S HCU expansion 2026-04-21 — rent-by-bedroom subpage
  add({ url: `${SITE_URL}/state/${s.slug}/rent-by-bedroom/`, priority: '0.7', changefreq: 'monthly' });
}

// Counties: dynamicParams=true → all counties
for (const c of getAllCountySlugs()) {
  add({ url: `${SITE_URL}/county/${c.slug}/`, priority: '0.7', changefreq: 'monthly' });
}

// Metros: dynamicParams=true → all metros
for (const m of getAllMetroSlugs()) {
  add({ url: `${SITE_URL}/metro/${m.slug}/`, priority: '0.7', changefreq: 'monthly' });
}

// State comparisons: CAPPED to match page.tsx generateStaticParams (2026-04-22 HCU-defense)
// generateCompareSlugs() already caps at 100; defensive .slice(0, 100) anyway.
for (const slug of generateCompareSlugs().slice(0, 100)) {
  add({ url: `${SITE_URL}/compare/${slug}/`, priority: '0.5', changefreq: 'monthly' });
}

// Metro comparisons: CAPPED at 100 to match page.tsx getAllMetroComparisonSlugs(100).
// Was: full valid set (23,871 URLs) → soft-404 risk under dynamicParams=false.
for (const c of getAllMetroComparisonSlugs(100)) {
  add({ url: `${SITE_URL}/metro-compare/${c.slug}/`, priority: '0.5', changefreq: 'yearly' });
}

// ---- Write sharded output ----
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
