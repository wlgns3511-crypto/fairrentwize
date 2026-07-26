import fs from "node:fs";
import path from "node:path";
import { ENTITY_VINTAGE as DATA_VINTAGE } from "./authorship";

export type DailyKind = "comparison" | "spotlight" | "ranking" | "route";
export type DailyItem = { label: string; value: string; href: string; metric?: number; metricLabel?: string; verdict?: string };
export type DailySection = { kind: DailyKind; heading: string; body: string; items: DailyItem[]; takeaway?: string };
export type DailyEntry = {
  date: string;
  kind: DailyKind;
  title: string;
  description: string;
  intro: string;
  items: DailyItem[];
  links: { label: string; href: string }[];
  sections: DailySection[];
  source: string;
  dataDate: string;
  fingerprint: string;
};

const PROFILE = {
  "id": "fairrentwize",
  "name": "FairRentWize",
  "domain": "fairrentwize.com",
  "entityLabel": "rent profile",
  "detailSegment": "blog",
  "source": "HUD Fair Market Rents and Census ACS",
  "dataModule": "db",
  "dataFn": "getTopCountiesByRent"
} as {
  id: string; name: string; domain: string; entityLabel: string;
  detailSegment?: string; metricFields?: string[]; dataModule?: string; dataFn?: string; source: string;
};

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function todayKst(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}

function clean(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "number") return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
  return String(value).replace(/\s+/g, " ").trim();
}

function titleCase(value: string): string {
  return value.replace(/[-_]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

// Column names arrive as stateMinWage / infant_center_annual. Both have to read
// as English in a sentence, so split camelCase before the separators go.
function humanize(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
}

// The sitemap is the only trustworthy record of which pages exist. Resolving
// links through it means a slug the data layer invented can never ship as a
// dead link, on any site in the fleet.
let SITEMAP_INDEX: Map<string, string> | null = null;
let SITEMAP_SEEN = false;

function readSitemapXml(): string[] {
  const dir = path.join(process.cwd(), "public");
  const root = path.join(dir, "sitemap.xml");
  let xml: string;
  try { xml = fs.readFileSync(root, "utf8"); } catch { return []; }
  SITEMAP_SEEN = true;
  if (!xml.includes("<sitemapindex")) return [xml];
  // An index lists child sitemaps; the URLs live in those files, not this one.
  const parts = [xml];
  for (const match of xml.matchAll(/<loc>https?:\/\/[^/]+\/([^<]+\.xml)<\/loc>/g)) {
    try { parts.push(fs.readFileSync(path.join(dir, path.basename(match[1])), "utf8")); } catch { /* child missing */ }
  }
  return parts;
}

function sitemapIndex(): Map<string, string> {
  if (SITEMAP_INDEX) return SITEMAP_INDEX;
  const index = new Map<string, string>();
  const depth = new Map<string, number>();
  for (const xml of readSitemapXml()) {
    for (const match of xml.matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)) {
      const route = match[1];
      if (route.startsWith("/daily/") || route.startsWith("/api/") || route.endsWith(".xml")) continue;
      const parts = route.split("/").filter(Boolean);
      if (!parts.length) continue; // home page
      const slug = parts[parts.length - 1].toLowerCase();
      // A detail page beats a hub of the same name; sites with everything but
      // their hubs quarantined still get a pool to link into.
      if ((depth.get(slug) ?? 0) >= parts.length) continue;
      depth.set(slug, parts.length);
      index.set(slug, route);
    }
  }
  SITEMAP_INDEX = index;
  return index;
}

function slugOf(href: string): string {
  const parts = href.split("?")[0].split("/").filter(Boolean);
  return (parts[parts.length - 1] || "").toLowerCase();
}

function hrefFor(slug: string): string | null {
  if (!slug) return null;
  if (PROFILE.id === "datapeekfacts") return `https://${slug}.com/`;
  const index = sitemapIndex();
  const hit = index.get(slug.toLowerCase());
  if (hit) return hit;
  // A sitemap exists and the slug is not in it: the page is missing or was
  // deliberately quarantined. Either way, guessing a URL is how dead links ship.
  if (SITEMAP_SEEN) return null;
  if (PROFILE.detailSegment) return `/${PROFILE.detailSegment}/${encodeURIComponent(slug)}/`;
  return `/search/?q=${encodeURIComponent(slug)}`;
}

// Identifiers are numbers too. Ranking counties by FIPS code or schools by
// scorecard id produces a confident, meaningless ordering, so they are excluded
// before the generic "first numeric column" fallback runs.
const ID_LIKE = /(^|_)(id|ids|fips|ccn|zip|zipcode|code|nr|no|num|number|year|rank|lat|lng|lon|latitude|longitude|seq|index|key|uid|guid|version)$/i;

function numericField(row: Record<string, unknown>): [string, number] | null {
  const preferred = PROFILE.metricFields ?? ["value", "score", "rate", "price", "cost", "amount", "count", "frequency", "calories", "salary", "wage", "income", "population"];
  for (const key of preferred) {
    const value = Number(row[key]);
    if (Number.isFinite(value)) return [key, value];
  }
  for (const [key, raw] of Object.entries(row)) {
    if (ID_LIKE.test(key)) continue;
    if (typeof raw !== "number" && typeof raw !== "string") continue;
    const value = Number(raw);
    if (Number.isFinite(value)) return [key, value];
  }
  return null;
}

function rowName(row: Record<string, unknown>, fallback: string): string {
  for (const key of ["name", "title", "label", "city", "state", "country", "symbol", "slug"]) {
    if (row[key] != null && String(row[key]).trim()) return String(row[key]);
  }
  return fallback;
}

function rowSlug(row: Record<string, unknown>, fallback: string): string {
  for (const key of ["slug", "id", "age", "zip_code", "code", "abbr", "state_slug", "city_slug", "breed_slug", "occ_slug", "area_slug", "word_slug"]) {
    if (row[key] != null && String(row[key]).trim()) return String(row[key]);
  }
  return fallback;
}

function itemFromRow(row: Record<string, unknown>, index: number): DailyItem | null {
  const slug = rowSlug(row, "");
  const href = hrefFor(slug);
  if (!href) return null;
  const metric = numericField(row);
  return {
    // Slug-only rows are common. "89147" is a label; "ZIP code 650" is a row number
    // dressed up as data, which is worse than no label at all.
    label: rowName(row, slug ? titleCase(slug) : `${PROFILE.entityLabel} ${index + 1}`),
    value: metric ? `${titleCase(humanize(metric[0]))}: ${clean(metric[1])}` : "Reference entry",
    href,
    ...(metric ? { metric: metric[1], metricLabel: metric[0] } : {}),
  };
}

// Fallback pool for sites whose data adapter returns rows that have no page.
// Every entry here is a URL taken straight from the sitemap, so it always resolves.
function sitemapItems(seed: number, limit: number): DailyItem[] {
  const routes = Array.from(new Set(sitemapIndex().values())).sort();
  if (!routes.length) return [];
  const offset = seed % routes.length;
  return routes.slice(offset).concat(routes.slice(0, offset)).slice(0, limit).map((route) => ({
    label: titleCase(slugOf(route)),
    value: "Reference page",
    href: route,
  }));
}

function pairKeys(pair: Record<string, unknown>): [string, string] | null {
  const left = ["slugA", "slug_a", "leftSlug", "left_slug", "state1", "city1", "name_a", "nameA", "a"].find((key) => pair[key] != null);
  const right = ["slugB", "slug_b", "rightSlug", "right_slug", "state2", "city2", "name_b", "nameB", "b"].find((key) => pair[key] != null);
  if (!left || !right) return null;
  const a = pair[left];
  const b = pair[right];
  if (a && typeof a === "object") return null;
  if (b && typeof b === "object") return null;
  return [String(a), String(b)];
}

// PROFILE.dataModule/dataFn are not guesses: scripts/probe-adapter measured every
// getAll*/getTop* export on this site and recorded the one whose rows actually
// resolve to pages in the sitemap. Trying it first is what stops the engine from
// describing one dataset while linking into another.
async function importLib(name: string): Promise<Record<string, unknown> | null> {
  const spec: string = `./${name}`;
  try { return await import(spec) as Record<string, unknown>; } catch { return null; }
}

async function callAdapter(mod: Record<string, unknown>, name: string): Promise<Record<string, unknown>[]> {
  const fn = mod[name];
  if (typeof fn !== "function") return [];
  for (const args of [[200], []]) {
    try {
      const result = await (fn as (...a: unknown[]) => unknown)(...args);
      if (Array.isArray(result) && result.length) return result as Record<string, unknown>[];
    } catch { /* try the next call shape */ }
  }
  return [];
}

// A row is only useful if its page exists AND it carries a number worth ranking.
// Several sites have a getAllXSlugs() that resolves perfectly and says nothing,
// so scoring beats taking the first adapter that returns something.
function scoreRows(rows: Record<string, unknown>[]): { resolvable: number; withMetric: number } {
  let resolvable = 0, withMetric = 0;
  for (const row of rows.slice(0, 200)) {
    if (!row || typeof row !== "object") continue;
    if (!hrefFor(rowSlug(row, ""))) continue;
    resolvable++;
    if (numericField(row)) withMetric++;
  }
  return { resolvable, withMetric };
}

async function loadData(): Promise<{ rows: Record<string, unknown>[]; pairs: Record<string, unknown>[] }> {
  const db = await importLib("db");
  const candidates: [Record<string, unknown>, string][] = [];
  if (PROFILE.dataModule && PROFILE.dataFn) {
    const mod = await importLib(PROFILE.dataModule);
    if (mod) candidates.push([mod, PROFILE.dataFn]);
  }
  if (db) {
    for (const name of ["getTopItems", "getAll", "getAllBreeds", "getAllFoods", "getAllWords", "getAllCities", "getAllStates", "getAllZipCodes", "getAllOccupations", "getAllPlants", "getAllTrails", "getAllNames"]) {
      candidates.push([db, name]);
    }
  }
  let rows: Record<string, unknown>[] = [];
  let best = { resolvable: 0, withMetric: 0 };
  for (const [mod, name] of candidates) {
    const candidate = await callAdapter(mod, name);
    if (!candidate.length) continue;
    const score = scoreRows(candidate);
    if (score.withMetric > best.withMetric || (score.withMetric === best.withMetric && score.resolvable > best.resolvable)) {
      best = score;
      rows = candidate;
    }
    if (best.withMetric >= 20) break;
  }
  let pairs: Record<string, unknown>[] = [];
  if (db) {
    for (const name of ["getTopComparisonPairs", "getTopComparisons", "getRotatingComparisons", "getComparePairs", "getComparisonPairs", "getAllComparisons", "getAllComparisonSlugs", "getTopComparisonSlugs"]) {
      const result = await callAdapter(db, name);
      if (result.some((item) => item && typeof item === "object" && pairKeys(item))) { pairs = result; break; }
    }
  }
  return { rows, pairs };
}

function readSnapshot(date: string): DailyEntry | null {
  const file = path.join(process.cwd(), "data", "daily", `${date}.json`);
  try { return JSON.parse(fs.readFileSync(file, "utf8")) as DailyEntry; } catch { return null; }
}

function writeFingerprint(entry: Omit<DailyEntry, "fingerprint">): DailyEntry {
  const base = JSON.stringify(entry);
  return { ...entry, fingerprint: hash(base).toString(16) };
}

// Every claim below is arithmetic over the site's own rows. Nothing is asserted
// that is not computed here, which is what keeps the editorial layer honest.
function verdictFor(item: DailyItem, ranked: DailyItem[], median: number | null): string | undefined {
  if (item.metric == null || ranked.length < 5) return undefined;
  const idx = ranked.findIndex((entry) => entry.href === item.href);
  if (idx < 0) return undefined;
  const rank = idx + 1;
  const total = ranked.length;
  const label = humanize(item.metricLabel || "value");
  const parts = [`Ranks #${rank} of ${total} by ${label}`];
  const pct = (rank / total) * 100;
  if (pct <= 10) parts.push(`top ${Math.max(Math.round(pct), 1)}%`);
  else if (pct >= 90) parts.push(`bottom ${Math.max(Math.round(101 - pct), 1)}%`);
  if (median != null && median !== 0 && item.metric !== median) {
    const ratio = item.metric / median;
    const delta = ratio >= 1 ? `${((ratio - 1) * 100).toFixed(0)}% above` : `${((1 - ratio) * 100).toFixed(0)}% below`;
    parts.push(`${delta} the median (${clean(median)})`);
  }
  return `${parts.join(" · ")}.`;
}

export async function generateDailyEntry(date = todayKst()): Promise<DailyEntry> {
  const saved = process.env.DAILY_REGENERATE === "1" ? null : readSnapshot(date);
  if (saved) return saved;
  const { rows, pairs } = await loadData();
  const seed = hash(`${PROFILE.id}:${date}`);

  const resolved = rows
    .map((row, index) => itemFromRow(row, index))
    .filter((item): item is DailyItem => item !== null);
  const pool = resolved.length >= 2 ? resolved : sitemapItems(seed, 24);

  const ranked = pool
    .filter((item) => item.metric != null)
    .sort((a, b) => (b.metric ?? 0) - (a.metric ?? 0));
  const metricValues = ranked.map((item) => item.metric!).slice().sort((a, b) => a - b);
  const median = metricValues.length ? metricValues[Math.floor(metricValues.length / 2)] : null;
  const withVerdict = (item: DailyItem): DailyItem => {
    const verdict = verdictFor(item, ranked, median);
    return verdict ? { ...item, verdict } : item;
  };

  const rotate = <T,>(list: T[], count: number): T[] => {
    if (!list.length) return [];
    const offset = seed % list.length;
    return list.slice(offset).concat(list.slice(0, offset)).slice(0, count);
  };

  const findItem = (key: string): DailyItem | undefined => {
    const needle = key.toLowerCase();
    return pool.find((item) => slugOf(item.href) === needle || item.label.toLowerCase() === needle);
  };

  const sections: DailySection[] = [];

  // 01 — comparison
  const pairKey = pairs.length ? pairKeys(pairs[seed % pairs.length]) : null;
  let comparison = pairKey ? [findItem(pairKey[0]), findItem(pairKey[1])].filter(Boolean) as DailyItem[] : [];
  if (comparison.length !== 2 && ranked.length >= 2) {
    // Rotating off a sorted list hands back neighbours, which are often identical.
    // Stepping a third of the way down guarantees the pair has something to compare.
    const i = seed % ranked.length;
    const j = (i + Math.max(1, Math.floor(ranked.length / 3))) % ranked.length;
    if (i !== j) comparison = [ranked[i], ranked[j]];
  }
  // Two records with no number in common have nothing to compare. Pairing them
  // anyway produces exactly the filler this page exists to avoid.
  const sameMetric = comparison.length === 2 && comparison[0].metric != null
    && comparison[1].metric != null && comparison[0].metricLabel === comparison[1].metricLabel;
  if (sameMetric) {
    const [first, second] = comparison;
    let body: string;
    {
      const delta = first.metric! - second.metric!;
      const pct = second.metric !== 0 ? Math.abs((delta / second.metric!) * 100) : null;
      const direction = delta === 0
        ? `${first.label} and ${second.label} record the same value`
        : `${first.label} is ${Math.abs(delta).toLocaleString("en-US", { maximumFractionDigits: 2 })} ${humanize(first.metricLabel!)} ${delta > 0 ? "higher" : "lower"}`;
      body = `${first.label} (${first.value}) against ${second.label} (${second.value}). ${direction}${pct == null || delta === 0 ? "." : `, a ${pct.toFixed(1)}% gap.`}`;
    }
    sections.push({
      kind: "comparison",
      heading: `${first.label} vs ${second.label}`,
      body,
      items: comparison.map(withVerdict),
      takeaway: median != null
        ? `Both sit against a dataset median of ${clean(median)} ${humanize(first.metricLabel!)}.`
        : undefined,
    });
  }

  // 02 — ranking
  if (ranked.length >= 3) {
    const rankOffset = seed % Math.max(1, Math.min(ranked.length - 3, 20));
    const slice = ranked.slice(rankOffset, rankOffset + 5);
    const metricLabel = slice[0]?.metricLabel ? humanize(slice[0].metricLabel) : "value";
    sections.push({
      kind: "ranking",
      heading: `Ranked by ${metricLabel}`,
      body: `Positions ${rankOffset + 1}–${rankOffset + slice.length} of ${ranked.length} records carrying a ${metricLabel} figure. Ordering is computed from the stored values, not editorial preference.`,
      items: slice.map(withVerdict),
      takeaway: median != null ? `Dataset median: ${clean(median)}. Highest on file: ${clean(ranked[0].metric)} (${ranked[0].label}).` : undefined,
    });
  }

  // 03 — spotlight
  const spotlight = rotate(pool, 1);
  if (spotlight.length) {
    const item = withVerdict(spotlight[0]);
    sections.push({
      kind: "spotlight",
      heading: `Record in focus: ${item.label}`,
      body: `${item.label} records ${humanize(item.metricLabel || "a reference value")}${item.metric != null ? ` of ${clean(item.metric)}` : ""} in the current ${PROFILE.name} data. The linked record holds the full field list and the source note behind the figure.`,
      items: [item],
      takeaway: item.verdict,
    });
  }

  // 04 — route
  const route = rotate(pool.slice().reverse(), ranked.length >= 3 ? 4 : 8);
  if (route.length) {
    sections.push({
      kind: "route",
      heading: "Where to go next",
      body: `A short path through ${PROFILE.name} for anyone starting today. These are entry points into the detailed pages, not a substitute for them.`,
      items: route,
    });
  }

  const lead = sections[0];
  const leadItems = lead ? lead.items : [];
  const first = leadItems[0] || { label: PROFILE.name, value: "Explore the current data", href: "/" };
  const title = lead && lead.kind === "comparison" && leadItems[1]
    ? `${first.label} vs ${leadItems[1].label}: a quick ${PROFILE.name} comparison`
    : `Today’s ${PROFILE.entityLabel} data: ${first.label}`;
  const intro = `${sections.length} readings from the ${PROFILE.name} dataset for ${date}: ${sections.map((section) => section.heading.toLowerCase()).join("; ")}. Every figure below is computed from the stored records, and each link opens the record it came from.`;

  return writeFingerprint({
    date,
    kind: lead ? lead.kind : "route",
    title,
    description: intro.slice(0, 300),
    intro,
    items: sections.flatMap((section) => section.items).slice(0, 12),
    links: leadItems.slice(0, 3).map((item) => ({ label: `View ${item.label}`, href: item.href })),
    sections,
    source: PROFILE.source,
    // 2026-07-26 — `dataDate: date` 였다. 페이지는 이 값을 "Source: <출처>. Data date: X."
    // 로 렌더하므로 발행일을 넣으면 오래된 스냅샷을 오늘 자 데이터라고 공지한다. 사이트가
    // 이미 lib/authorship.ts 에 갖고 있는 빈티지 상수를 쓴다(stamp-vintage.py 가 갱신).
    dataDate: DATA_VINTAGE ?? date,
  });
}

export function getTodayKst(): string { return todayKst(); }
export function getProfile() { return PROFILE; }
export function listDailyDates(): string[] {
  const dir = path.join(process.cwd(), "data", "daily");
  try {
    return fs.readdirSync(dir).filter((name) => /^\d{4}-\d{2}-\d{2}\.json$/.test(name)).map((name) => name.slice(0, 10)).sort().reverse();
  } catch { return []; }
}
