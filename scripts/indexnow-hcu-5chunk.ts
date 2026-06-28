#!/usr/bin/env tsx
/**
 * indexnow-hcu-5chunk.ts — fairrentwize HCU 5-chunk ping.
 *
 * Submits the Phase D depth-injected URLs to IndexNow (Bing/Yandex) after
 * the 2026-04-29 HUD+ACS+NLIHC tri-source rewrite + Layer 2 commentary
 * landing on /county/[slug]/, /state/[slug]/.
 *
 * Scope (~250 URLs, not all 3,021 counties — Phase D submits only the
 * highest-signal subset to avoid IndexNow rate-limit penalties):
 *   - Home + methodology + about + blog index + rankings index
 *   - 51 state pages
 *   - 51 state rent-by-bedroom pages
 *   - Top 100 counties (by ACS occupied housing units)
 *   - Top 50 metros (alphabetical fallback if no population in metros table)
 *
 * USAGE:
 *   npx tsx scripts/indexnow-hcu-5chunk.ts
 */
import Database from "better-sqlite3";

const HOST = "fairrentwize.com";
const KEY = "a1b2c3d4e5f6g7h8";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const db = new Database("data/rents.db", { readonly: true });

const stateRows = db
  .prepare("SELECT slug FROM states ORDER BY slug")
  .all() as { slug: string }[];

const topCountyRows = db
  .prepare(
    `SELECT slug FROM counties
     WHERE fmr_2br IS NOT NULL AND acs_total_occupied_units IS NOT NULL
     ORDER BY acs_total_occupied_units DESC
     LIMIT 100`
  )
  .all() as { slug: string }[];

const topMetroRows = db
  .prepare(
    `SELECT slug FROM metros
     WHERE fmr_2br IS NOT NULL
     ORDER BY fmr_2br DESC
     LIMIT 50`
  )
  .all() as { slug: string }[];

db.close();

const URLS: string[] = [
  `https://${HOST}/`,
  `https://${HOST}/methodology/`,
  `https://${HOST}/about/`,
  `https://${HOST}/blog/`,
  `https://${HOST}/rankings/`,
  `https://${HOST}/guide/`,
  ...stateRows.map((r) => `https://${HOST}/state/${r.slug}/`),
  ...stateRows.map((r) => `https://${HOST}/state/${r.slug}/rent-by-bedroom/`),
  ...topCountyRows.map((r) => `https://${HOST}/county/${r.slug}/`),
  ...topMetroRows.map((r) => `https://${HOST}/metro/${r.slug}/`),
];

async function main() {
  const body = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: URLS,
  };
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  console.log(`IndexNow status: ${res.status}`);
  console.log(`URLs submitted: ${URLS.length}`);
  if (!res.ok) {
    console.error(await res.text());
    process.exit(1);
  }
}

main();
