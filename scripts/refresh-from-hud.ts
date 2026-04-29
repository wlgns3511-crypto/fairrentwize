#!/usr/bin/env tsx
/**
 * scripts/refresh-from-hud.ts — fairrentwize Layer 0 ingest.
 *
 * Pulls HUD Fair Market Rents from the public ArcGIS REST endpoint
 * (services.arcgis.com/VTyQ9soqVukalItT/.../Fair_Market_Rents) and emits
 * data/raw/hud-fmr.json. The HUD User API token endpoint is gated by an
 * AWS WAF that blocks Korean residential IPs (verified 2026-04-29); the
 * ArcGIS Hub feed exposes identical figures without a token.
 *
 * FMR_CODE prefix encoding (HUD convention):
 *   NCNTY{ssccc}N{ssccc}   — county outside any FMR Area
 *   METRO{cbsa}M{cbsa}     — metro umbrella
 *   METRO{cbsa}N{ssccc}    — county-in-metro fanout
 *   ssccc = 5-digit state(2)+county(3) FIPS; cbsa = 5-digit CBSA code.
 *
 * USAGE: npx tsx scripts/refresh-from-hud.ts
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const SERVICE =
  "https://services.arcgis.com/VTyQ9soqVukalItT/arcgis/rest/services/Fair_Market_Rents/FeatureServer/0/query";
const PAGE_SIZE = 1000;

interface Feature {
  attributes: {
    OBJECTID: number;
    FMR_CODE: string;
    FMR_AREANAME: string;
    FMR_0BDR: number;
    FMR_1BDR: number;
    FMR_2BDR: number;
    FMR_3BDR: number;
    FMR_4BDR: number;
  };
}

interface QueryResp {
  features: Feature[];
  exceededTransferLimit?: boolean;
  error?: { code: number; message: string };
}

async function fetchPage(offset: number): Promise<QueryResp> {
  const params = new URLSearchParams({
    where: "1=1",
    outFields: "FMR_CODE,FMR_AREANAME,FMR_0BDR,FMR_1BDR,FMR_2BDR,FMR_3BDR,FMR_4BDR",
    orderByFields: "OBJECTID ASC",
    resultOffset: String(offset),
    resultRecordCount: String(PAGE_SIZE),
    returnGeometry: "false",
    f: "json",
  });
  const res = await fetch(`${SERVICE}?${params}`);
  if (!res.ok) throw new Error(`HUD ArcGIS HTTP ${res.status}`);
  const j = (await res.json()) as QueryResp;
  if (j.error) throw new Error(`HUD ArcGIS error: ${j.error.code} ${j.error.message}`);
  return j;
}

type CountySource = "NCNTY" | "METRO_N";

interface CountyRow {
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
  source_kind: CountySource;
}

interface MetroRow {
  cbsa: string;
  name: string;
  fmr_studio: number;
  fmr_1br: number;
  fmr_2br: number;
  fmr_3br: number;
  fmr_4br: number;
  source_code: string;
}

interface Parsed {
  kind: "NCNTY" | "METRO_M" | "METRO_N";
  fips?: string;
  cbsa?: string;
}

function parseFmrCode(code: string): Parsed | null {
  if (code.startsWith("NCNTY") && code.length >= 10) {
    return { kind: "NCNTY", fips: code.slice(5, 10) };
  }
  if (code.startsWith("METRO") && code.length >= 11) {
    const cbsa = code.slice(5, 10);
    const sep = code.charAt(10);
    if (sep === "M") return { kind: "METRO_M", cbsa };
    if (sep === "N" && code.length >= 16) {
      return { kind: "METRO_N", cbsa, fips: code.slice(11, 16) };
    }
  }
  return null;
}

async function main() {
  console.log("HUD ArcGIS fetch starting...");
  const counties: CountyRow[] = [];
  const metros: MetroRow[] = [];
  const skipped: { code: string; name: string }[] = [];

  let offset = 0;
  let page = 0;
  while (true) {
    page += 1;
    const { features, exceededTransferLimit } = await fetchPage(offset);
    console.log(`  page ${page}: offset=${offset} features=${features.length}`);
    if (features.length === 0) break;
    for (const f of features) {
      const a = f.attributes;
      const parsed = parseFmrCode(a.FMR_CODE);
      if (!parsed) {
        skipped.push({ code: a.FMR_CODE, name: a.FMR_AREANAME });
        continue;
      }
      if (parsed.kind === "METRO_M" && parsed.cbsa) {
        metros.push({
          cbsa: parsed.cbsa,
          name: a.FMR_AREANAME,
          fmr_studio: a.FMR_0BDR,
          fmr_1br: a.FMR_1BDR,
          fmr_2br: a.FMR_2BDR,
          fmr_3br: a.FMR_3BDR,
          fmr_4br: a.FMR_4BDR,
          source_code: a.FMR_CODE,
        });
        continue;
      }
      if ((parsed.kind === "NCNTY" || parsed.kind === "METRO_N") && parsed.fips) {
        counties.push({
          fips: parsed.fips,
          state_fips: parsed.fips.slice(0, 2),
          county_fips: parsed.fips.slice(2, 5),
          name: a.FMR_AREANAME,
          fmr_studio: a.FMR_0BDR,
          fmr_1br: a.FMR_1BDR,
          fmr_2br: a.FMR_2BDR,
          fmr_3br: a.FMR_3BDR,
          fmr_4br: a.FMR_4BDR,
          cbsa: parsed.cbsa,
          source_code: a.FMR_CODE,
          source_kind: parsed.kind,
        });
      }
    }
    if (!exceededTransferLimit || features.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  // METRO_N takes priority over NCNTY when both exist for the same FIPS
  // (METRO_N reflects the county-specific FMR within an FMR Area, which is
  // what HUD treats as authoritative for HCV / Section 8 calculation).
  const countyByFips = new Map<string, CountyRow>();
  for (const c of counties) {
    const prev = countyByFips.get(c.fips);
    if (!prev || (c.source_kind === "METRO_N" && prev.source_kind === "NCNTY")) {
      countyByFips.set(c.fips, c);
    }
  }
  const uniqueCounties = [...countyByFips.values()].sort((a, b) =>
    a.fips.localeCompare(b.fips),
  );
  // Key by full source_code (not CBSA) — HUD splits some CBSAs into multiple
  // FMR sub-areas (e.g. CBSA 31080 has Santa Ana METRO31080MM5945 and
  // Los Angeles-Long Beach METRO31080MM4480 with different FMRs). The CBSA
  // dedup we used previously hid LA County entirely because its sub-area
  // record was overwritten by Santa Ana's.
  const uniqueMetros = [...new Map(metros.map((m) => [m.source_code, m])).values()].sort((a, b) =>
    a.source_code.localeCompare(b.source_code),
  );

  const ncntyN = counties.filter((c) => c.source_kind === "NCNTY").length;
  const metroN = counties.filter((c) => c.source_kind === "METRO_N").length;

  const out = {
    fetched_at: new Date().toISOString(),
    source_url: SERVICE,
    notes:
      "HUD FMR via ArcGIS REST. NCNTY = standalone county; METRO_M = metro umbrella; METRO_N = county-in-metro (preferred over NCNTY for same FIPS).",
    counts: {
      raw_features: counties.length + metros.length + skipped.length,
      counties_raw: counties.length,
      counties_ncnty: ncntyN,
      counties_metro_n: metroN,
      counties_unique_fips: uniqueCounties.length,
      metros_raw: metros.length,
      metros_unique_cbsa: uniqueMetros.length,
      skipped: skipped.length,
    },
    skipped_codes: skipped,
    counties: uniqueCounties,
    metros: uniqueMetros,
  };

  const outPath = "data/raw/hud-fmr.json";
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`\nwrote ${outPath}`);
  console.log(`  counties (unique FIPS): ${uniqueCounties.length}`);
  console.log(`    NCNTY: ${ncntyN}`);
  console.log(`    METRO_N: ${metroN}`);
  console.log(`  metros (unique CBSA): ${uniqueMetros.length}`);
  console.log(`  skipped: ${skipped.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
