import fs from "node:fs";
import path from "node:path";
import { generateDailyEntry, getTodayKst } from "../lib/daily-engine";

function hash(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) { h ^= input.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(16);
}

async function maybeRewriteWithClaude(entry: Awaited<ReturnType<typeof generateDailyEntry>>) {
  if (process.env.DAILY_USE_CLAUDE !== "1" || !process.env.ANTHROPIC_API_KEY) return entry;
  try {
  const model = process.env.ANTHROPIC_DAILY_MODEL || "claude-3-5-haiku-latest";
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model, max_tokens: 500,
      system: "You are a concise data editor. Return JSON only with title, intro, and description. Do not invent numbers, dates, sources, or claims. Keep the result specific to the supplied facts.",
      messages: [{ role: "user", content: JSON.stringify({ task: "Polish this daily data note in natural English.", facts: { title: entry.title, intro: entry.intro, items: entry.items, source: entry.source, dataDate: entry.dataDate } }) }],
    }),
  });
  if (!response.ok) throw new Error("Claude daily rewrite failed: " + response.status);
  const payload = await response.json() as { content?: { text?: string }[] };
  const raw = payload.content?.[0]?.text?.trim() || "";
  const json = raw.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
  const parsed = JSON.parse(json) as { title?: unknown; intro?: unknown; description?: unknown };
  const title = typeof parsed.title === "string" ? parsed.title.trim().slice(0, 160) : entry.title;
  const intro = typeof parsed.intro === "string" ? parsed.intro.trim().slice(0, 700) : entry.intro;
  const description = typeof parsed.description === "string" ? parsed.description.trim().slice(0, 320) : intro;
  const next = { ...entry, title, intro, description };
  return { ...next, fingerprint: hash(JSON.stringify({ ...next, fingerprint: undefined })) };
  } catch (error) {
    console.warn("Claude rewrite skipped; deterministic entry kept:", error instanceof Error ? error.message : String(error));
    return entry;
  }
}

async function main() {
const date = process.env.DAILY_DATE || getTodayKst();
const entry = await maybeRewriteWithClaude(await generateDailyEntry(date));
const dir = path.join(process.cwd(), "data", "daily");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, `${date}.json`), JSON.stringify(entry, null, 2) + "\n", "utf8");

const sitemap = path.join(process.cwd(), "public", "sitemap.xml");
if (fs.existsSync(sitemap)) {
  let xml = fs.readFileSync(sitemap, "utf8");
  const base = `https://${process.cwd().split(path.sep).pop()}.com`;
  // build:sitemap runs first and rewrites sitemap.xml from the database, dropping
  // whatever the previous daily run appended. So list the whole archive every time,
  // each day keeping its own write date — a column written on the 22nd did not
  // change today, and claiming it did is the thing we are trying not to do.
  const archive = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).sort();
  const urls: [string, string][] = [[`${base}/daily/`, date], ...archive.map((day): [string, string] => [`${base}/daily/${day}/`, day])];
  const urlTag = ([url, lastmod]: [string, string]) => `  <url><loc>${url}</loc><lastmod>${lastmod}</lastmod><changefreq>daily</changefreq><priority>0.7</priority></url>`;
  if (xml.includes("<sitemapindex")) {
    const dailySitemap = path.join(process.cwd(), "public", "sitemap-daily.xml");
    const dailyXml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...urls.map(urlTag), "</urlset>", ""].join("\n");
    fs.writeFileSync(dailySitemap, dailyXml, "utf8");
    const dailyIndexLoc = `<loc>${base}/sitemap-daily.xml</loc>`;
    if (!xml.includes(dailyIndexLoc)) {
      xml = xml.replace("</sitemapindex>", `  <sitemap>${dailyIndexLoc}<lastmod>${date}</lastmod></sitemap>\n</sitemapindex>`);
    } else {
      const locStart = xml.indexOf(dailyIndexLoc);
      const lastStart = xml.indexOf("<lastmod>", locStart);
      const lastEnd = xml.indexOf("</lastmod>", lastStart);
      if (lastStart > locStart && lastEnd > lastStart) xml = xml.slice(0, lastStart + 9) + date + xml.slice(lastEnd);
    }
    fs.writeFileSync(sitemap, xml, "utf8");
    return;
  }
  xml = xml.replace(/[ \t]*<url>\s*<loc>[^<]*\/daily\/[^<]*<\/loc>[\s\S]*?<\/url>\n?/g, "");
  xml = xml.replace("</urlset>", `${urls.map(urlTag).join("\n")}\n</urlset>`);
  const homeLoc = `<loc>${base}/</loc>`;
  const homeStart = xml.indexOf(homeLoc);
  if (homeStart >= 0) {
    const lastStart = xml.indexOf("<lastmod>", homeStart);
    const lastEnd = xml.indexOf("</lastmod>", lastStart);
    const urlEnd = xml.indexOf("</url>", homeStart);
    if (lastStart > homeStart && lastEnd > lastStart && lastEnd < urlEnd) {
      xml = xml.slice(0, lastStart + 9) + date + xml.slice(lastEnd);
    }
  }
  fs.writeFileSync(sitemap, xml, "utf8");
}
console.log(`daily generated: ${date} (${entry.kind}) ${entry.fingerprint}`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
