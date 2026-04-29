#!/usr/bin/env tsx
/**
 * scripts/refresh-from-acs.ts — fairrentwize Layer 0 ingest (Census ACS).
 *
 * Pulls Census ACS 2023 5-Year (latest published as of 2026-04-29) for every
 * county in the 50 states + DC. We need:
 *   B25031_001E/M  Median Gross Rent (overall)               + MOE
 *   B25031_002..6  Median Gross Rent by bedrooms 0..4
 *   B19013_001E/M  Median household income                   + MOE
 *   B25070_001..7  Gross Rent As Pct of Income (universe + buckets) — used
 *                  to compute "rent-burdened renter household %" (≥30% of income).
 *   B25008_001..3  Tenure (total / owner-occupied / renter-occupied) — used
 *                  to compute renter %.
 *
 * Quality control: drop the county if MOE / estimate > 30% on B25031_001E
 * (overall median rent). The dropped slug list feeds the suppress-or-410
 * decision in build-db.py.
 *
 * USAGE: CENSUS_API_KEY=... npx tsx scripts/refresh-from-acs.ts
 *        (key auto-loads from /Users/jihoon/projects/_shared/.env)
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { dirname } from "node:path";

const ACS_YEAR = "2023";
const SHARED_ENV = "/Users/jihoon/projects/_shared/.env";

function loadCensusKey(): string {
  if (process.env.CENSUS_API_KEY) return process.env.CENSUS_API_KEY;
  if (!existsSync(SHARED_ENV)) {
    throw new Error(`CENSUS_API_KEY not set and ${SHARED_ENV} missing`);
  }
  for (const line of readFileSync(SHARED_ENV, "utf8").split("\n")) {
    const m = line.match(/^CENSUS_API_KEY=(.*)$/);
    if (m) return m[1].trim();
  }
  throw new Error(`CENSUS_API_KEY not found in ${SHARED_ENV}`);
}

const CENSUS_KEY = loadCensusKey();

// 50 states + DC. Excludes territories (PR=72, GU=66, VI=78, AS=60, MP=69)
// since the current site footprint is US states only. HUD coverage of PR
// is acknowledged separately on the methodology page.
const STATE_FIPS: { fips: string; abbr: string; name: string }[] = [
  { fips: "01", abbr: "AL", name: "Alabama" },
  { fips: "02", abbr: "AK", name: "Alaska" },
  { fips: "04", abbr: "AZ", name: "Arizona" },
  { fips: "05", abbr: "AR", name: "Arkansas" },
  { fips: "06", abbr: "CA", name: "California" },
  { fips: "08", abbr: "CO", name: "Colorado" },
  { fips: "09", abbr: "CT", name: "Connecticut" },
  { fips: "10", abbr: "DE", name: "Delaware" },
  { fips: "11", abbr: "DC", name: "District of Columbia" },
  { fips: "12", abbr: "FL", name: "Florida" },
  { fips: "13", abbr: "GA", name: "Georgia" },
  { fips: "15", abbr: "HI", name: "Hawaii" },
  { fips: "16", abbr: "ID", name: "Idaho" },
  { fips: "17", abbr: "IL", name: "Illinois" },
  { fips: "18", abbr: "IN", name: "Indiana" },
  { fips: "19", abbr: "IA", name: "Iowa" },
  { fips: "20", abbr: "KS", name: "Kansas" },
  { fips: "21", abbr: "KY", name: "Kentucky" },
  { fips: "22", abbr: "LA", name: "Louisiana" },
  { fips: "23", abbr: "ME", name: "Maine" },
  { fips: "24", abbr: "MD", name: "Maryland" },
  { fips: "25", abbr: "MA", name: "Massachusetts" },
  { fips: "26", abbr: "MI", name: "Michigan" },
  { fips: "27", abbr: "MN", name: "Minnesota" },
  { fips: "28", abbr: "MS", name: "Mississippi" },
  { fips: "29", abbr: "MO", name: "Missouri" },
  { fips: "30", abbr: "MT", name: "Montana" },
  { fips: "31", abbr: "NE", name: "Nebraska" },
  { fips: "32", abbr: "NV", name: "Nevada" },
  { fips: "33", abbr: "NH", name: "New Hampshire" },
  { fips: "34", abbr: "NJ", name: "New Jersey" },
  { fips: "35", abbr: "NM", name: "New Mexico" },
  { fips: "36", abbr: "NY", name: "New York" },
  { fips: "37", abbr: "NC", name: "North Carolina" },
  { fips: "38", abbr: "ND", name: "North Dakota" },
  { fips: "39", abbr: "OH", name: "Ohio" },
  { fips: "40", abbr: "OK", name: "Oklahoma" },
  { fips: "41", abbr: "OR", name: "Oregon" },
  { fips: "42", abbr: "PA", name: "Pennsylvania" },
  { fips: "44", abbr: "RI", name: "Rhode Island" },
  { fips: "45", abbr: "SC", name: "South Carolina" },
  { fips: "46", abbr: "SD", name: "South Dakota" },
  { fips: "47", abbr: "TN", name: "Tennessee" },
  { fips: "48", abbr: "TX", name: "Texas" },
  { fips: "49", abbr: "UT", name: "Utah" },
  { fips: "50", abbr: "VT", name: "Vermont" },
  { fips: "51", abbr: "VA", name: "Virginia" },
  { fips: "53", abbr: "WA", name: "Washington" },
  { fips: "54", abbr: "WV", name: "West Virginia" },
  { fips: "55", abbr: "WI", name: "Wisconsin" },
  { fips: "56", abbr: "WY", name: "Wyoming" },
];

// Census ACS variables. Order matters for index lookup below.
const VARS = [
  "NAME",
  "B25031_001E", // median gross rent overall
  "B25031_001M",
  "B25031_002E", // 0BR (studio)
  "B25031_003E", // 1BR
  "B25031_004E", // 2BR
  "B25031_005E", // 3BR
  "B25031_006E", // 4BR
  "B19013_001E", // median household income
  "B19013_001M",
  "B25070_001E", // total renter-occupied (rent-burden denominator)
  "B25070_007E", // 30.0 to 34.9 percent
  "B25070_008E", // 35.0 to 39.9 percent
  "B25070_009E", // 40.0 to 49.9 percent
  "B25070_010E", // 50.0 percent or more
  "B25008_001E", // total occupied housing units
  "B25008_003E", // renter-occupied housing units
];

interface CountyAcs {
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

interface StateAcs {
  fips: string;
  abbr: string;
  name: string;
  median_rent_overall: number | null;
  median_rent_2br: number | null;
  median_household_income: number | null;
  rent_burdened_pct: number | null;
  renter_occupied_pct: number | null;
}

function num(v: string | null | undefined): number | null {
  if (v == null) return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  // Census uses negative sentinels (-666666666 etc.) for "estimate cannot be displayed"
  if (n < -1e8) return null;
  if (n < 0) return null;
  return n;
}

async function fetchState(fips: string): Promise<string[][]> {
  const get = VARS.join(",");
  const url = `https://api.census.gov/data/${ACS_YEAR}/acs/acs5?get=${encodeURIComponent(
    get,
  )}&for=county:*&in=state:${fips}&key=${CENSUS_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`ACS HTTP ${res.status} for state ${fips}: ${txt.slice(0, 200)}`);
  }
  return res.json() as Promise<string[][]>;
}

async function fetchStateLevel(): Promise<Map<string, StateAcs>> {
  // single call returns all 50 states + DC at the state level
  const get = [
    "NAME",
    "B25031_001E",
    "B25031_004E",
    "B19013_001E",
    "B25070_001E",
    "B25070_007E",
    "B25070_008E",
    "B25070_009E",
    "B25070_010E",
    "B25008_001E",
    "B25008_003E",
  ].join(",");
  const url = `https://api.census.gov/data/${ACS_YEAR}/acs/acs5?get=${encodeURIComponent(
    get,
  )}&for=state:*&key=${CENSUS_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ACS state-level HTTP ${res.status}`);
  const rows = (await res.json()) as string[][];
  const header = rows[0];
  const idx = (n: string) => header.indexOf(n);
  const out = new Map<string, StateAcs>();
  for (const row of rows.slice(1)) {
    const stateFips = row[idx("state")];
    const meta = STATE_FIPS.find((s) => s.fips === stateFips);
    if (!meta) continue;
    const rentBurden =
      [row[idx("B25070_007E")], row[idx("B25070_008E")], row[idx("B25070_009E")], row[idx("B25070_010E")]]
        .map(num)
        .reduce<number | null>((a, b) => (a == null && b == null ? null : (a ?? 0) + (b ?? 0)), null);
    const denom = num(row[idx("B25070_001E")]);
    const rentBurdenPct =
      rentBurden != null && denom != null && denom > 0 ? Math.round((rentBurden / denom) * 1000) / 10 : null;
    const totalOcc = num(row[idx("B25008_001E")]);
    const renterOcc = num(row[idx("B25008_003E")]);
    const renterPct =
      renterOcc != null && totalOcc != null && totalOcc > 0
        ? Math.round((renterOcc / totalOcc) * 1000) / 10
        : null;
    out.set(stateFips, {
      fips: stateFips,
      abbr: meta.abbr,
      name: meta.name,
      median_rent_overall: num(row[idx("B25031_001E")]),
      median_rent_2br: num(row[idx("B25031_004E")]),
      median_household_income: num(row[idx("B19013_001E")]),
      rent_burdened_pct: rentBurdenPct,
      renter_occupied_pct: renterPct,
    });
  }
  return out;
}

async function main() {
  console.log(`Census ACS ${ACS_YEAR} 5-Year fetch starting (51 states)...`);
  const allCounties: CountyAcs[] = [];
  let lowCount = 0;
  let missingCount = 0;
  let highCount = 0;

  for (const st of STATE_FIPS) {
    const rows = await fetchState(st.fips);
    const header = rows[0];
    const idx = (n: string) => header.indexOf(n);
    let stateHigh = 0;
    let stateLow = 0;
    let stateMissing = 0;

    for (const row of rows.slice(1)) {
      const stateFips = row[idx("state")];
      const countyFips = row[idx("county")];
      const fips = `${stateFips}${countyFips}`;
      const rent = num(row[idx("B25031_001E")]);
      const rentMoe = num(row[idx("B25031_001M")]);
      let relMoe: number | null = null;
      let quality: "high" | "low" | "missing" = "missing";
      if (rent != null && rent > 0) {
        if (rentMoe != null && rentMoe >= 0) {
          relMoe = Math.round((rentMoe / rent) * 1000) / 10;
          quality = relMoe > 30 ? "low" : "high";
        } else {
          quality = "high"; // no MOE supplied — Census suppression already applied
        }
      }

      const denom = num(row[idx("B25070_001E")]);
      const burdened =
        [row[idx("B25070_007E")], row[idx("B25070_008E")], row[idx("B25070_009E")], row[idx("B25070_010E")]]
          .map(num)
          .reduce<number | null>(
            (a, b) => (a == null && b == null ? null : (a ?? 0) + (b ?? 0)),
            null,
          );
      const burdenPct =
        burdened != null && denom != null && denom > 0
          ? Math.round((burdened / denom) * 1000) / 10
          : null;
      const totalOcc = num(row[idx("B25008_001E")]);
      const renterOcc = num(row[idx("B25008_003E")]);
      const renterPct =
        renterOcc != null && totalOcc != null && totalOcc > 0
          ? Math.round((renterOcc / totalOcc) * 1000) / 10
          : null;

      allCounties.push({
        fips,
        state_fips: stateFips,
        county_fips: countyFips,
        name: row[idx("NAME")],
        median_rent_overall: rent,
        median_rent_overall_moe: rentMoe,
        median_rent_overall_relative_moe: relMoe,
        median_rent_studio: num(row[idx("B25031_002E")]),
        median_rent_1br: num(row[idx("B25031_003E")]),
        median_rent_2br: num(row[idx("B25031_004E")]),
        median_rent_3br: num(row[idx("B25031_005E")]),
        median_rent_4br: num(row[idx("B25031_006E")]),
        median_household_income: num(row[idx("B19013_001E")]),
        median_household_income_moe: num(row[idx("B19013_001M")]),
        rent_burdened_pct: burdenPct,
        renter_occupied_pct: renterPct,
        total_occupied_units: totalOcc,
        data_quality: quality,
      });
      if (quality === "high") stateHigh++;
      else if (quality === "low") stateLow++;
      else stateMissing++;
    }
    highCount += stateHigh;
    lowCount += stateLow;
    missingCount += stateMissing;
    console.log(
      `  ${st.abbr} ${rows.length - 1} counties: high=${stateHigh} low=${stateLow} missing=${stateMissing}`,
    );
  }

  console.log("\nState-level fetch...");
  const states = await fetchStateLevel();

  const out = {
    fetched_at: new Date().toISOString(),
    source: `Census ACS ${ACS_YEAR} 5-Year (api.census.gov)`,
    variables: VARS,
    moe_threshold_relative_pct: 30,
    counts: {
      counties_total: allCounties.length,
      counties_high_quality: highCount,
      counties_low_quality_moe_gt30: lowCount,
      counties_missing_rent: missingCount,
    },
    counties: allCounties,
    states: [...states.values()].sort((a, b) => a.fips.localeCompare(b.fips)),
  };

  const outPath = "data/raw/acs.json";
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`\nwrote ${outPath}`);
  console.log(`  counties total: ${allCounties.length}`);
  console.log(`    high quality: ${highCount}`);
  console.log(`    low quality (MOE > 30%): ${lowCount}`);
  console.log(`    missing rent estimate: ${missingCount}`);
  console.log(`  states: ${states.size}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
