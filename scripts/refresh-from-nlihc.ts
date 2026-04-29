#!/usr/bin/env tsx
/**
 * scripts/refresh-from-nlihc.ts — fairrentwize Layer 0 (NLIHC OOR 2025).
 *
 * Hardcodes the NLIHC Out of Reach 2025 state summary table (50 states + DC).
 * Source PDF: nlihc.org/oor (FY2025 release). The PDF publishes the
 * 2-bedroom Housing Wage as the central figure: the hourly wage a full-time
 * worker must earn so that the FY25 HUD 2BR FMR consumes ≤ 30% of their
 * gross income.
 *
 * Per the 2026-04-29 19-B doctrine decision: we store **only** raw values
 * and rank, no categorical tier. The 3-band cutoff (<$22.50 / $22.50-30 / >$30)
 * appears in the PDF as a state-map visualization legend, not as a methodology
 * definition — claiming it as a categorical boundary would be post-hoc
 * justification.
 *
 * Output: data/raw/nlihc-oor-2025.json
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

interface OorRow {
  abbr: string;
  name: string;
  housing_wage_2br: number; // hourly wage to afford 2BR FMR, USD
  annual_income_2br: number; // annual income needed
  fmr_2br: number; // FY25 HUD 2BR FMR (state-level, NLIHC roll-up)
  ami_annual: number; // FY25 Area Median Income
  ami_monthly_30pct: number; // monthly rent affordable at 100% AMI
  ami_30_monthly: number; // monthly rent affordable at 30% AMI
  renter_households: number;
  renter_pct_of_total: number; // renter households as % of all households
  mean_renter_wage: number; // hourly mean renter wage 2025
}

// Verbatim from NLIHC OOR 2025 state summary table (PDF p.37-38).
const ROWS: OorRow[] = [
  { abbr: "AL", name: "Alabama",       housing_wage_2br: 20.61, annual_income_2br: 42869,  fmr_2br: 1072, ami_annual: 87543,  ami_monthly_30pct: 2189, ami_30_monthly: 657,  renter_households: 592043,  renter_pct_of_total: 30, mean_renter_wage: 17.19 },
  { abbr: "AK", name: "Alaska",        housing_wage_2br: 29.73, annual_income_2br: 61835,  fmr_2br: 1546, ami_annual: 118942, ami_monthly_30pct: 2974, ami_30_monthly: 892,  renter_households: 89496,   renter_pct_of_total: 33, mean_renter_wage: 24.13 },
  { abbr: "AZ", name: "Arizona",       housing_wage_2br: 34.18, annual_income_2br: 71101,  fmr_2br: 1778, ami_annual: 101832, ami_monthly_30pct: 2546, ami_30_monthly: 764,  renter_households: 923559,  renter_pct_of_total: 33, mean_renter_wage: 23.31 },
  { abbr: "AR", name: "Arkansas",      housing_wage_2br: 18.98, annual_income_2br: 39472,  fmr_2br: 987,  ami_annual: 82540,  ami_monthly_30pct: 2063, ami_30_monthly: 619,  renter_households: 402626,  renter_pct_of_total: 34, mean_renter_wage: 17.78 },
  { abbr: "CA", name: "California",    housing_wage_2br: 49.61, annual_income_2br: 103184, fmr_2br: 2580, ami_annual: 123754, ami_monthly_30pct: 3094, ami_30_monthly: 928,  renter_households: 5940036, renter_pct_of_total: 44, mean_renter_wage: 31.47 },
  { abbr: "CO", name: "Colorado",      housing_wage_2br: 36.79, annual_income_2br: 76518,  fmr_2br: 1913, ami_annual: 127322, ami_monthly_30pct: 3183, ami_30_monthly: 955,  renter_households: 783361,  renter_pct_of_total: 34, mean_renter_wage: 26.31 },
  { abbr: "CT", name: "Connecticut",   housing_wage_2br: 35.42, annual_income_2br: 73664,  fmr_2br: 1842, ami_annual: 125828, ami_monthly_30pct: 3146, ami_30_monthly: 944,  renter_households: 480258,  renter_pct_of_total: 34, mean_renter_wage: 22.69 },
  { abbr: "DE", name: "Delaware",      housing_wage_2br: 32.18, annual_income_2br: 66941,  fmr_2br: 1674, ami_annual: 110159, ami_monthly_30pct: 2754, ami_30_monthly: 826,  renter_households: 109869,  renter_pct_of_total: 28, mean_renter_wage: 22.11 },
  { abbr: "DC", name: "District of Columbia", housing_wage_2br: 44.50, annual_income_2br: 92560, fmr_2br: 2314, ami_annual: 163900, ami_monthly_30pct: 4098, ami_30_monthly: 1229, renter_households: 189268, renter_pct_of_total: 59, mean_renter_wage: 39.60 },
  { abbr: "FL", name: "Florida",       housing_wage_2br: 37.27, annual_income_2br: 77522,  fmr_2br: 1938, ami_annual: 95911,  ami_monthly_30pct: 2398, ami_30_monthly: 719,  renter_households: 2794102, renter_pct_of_total: 33, mean_renter_wage: 23.23 },
  { abbr: "GA", name: "Georgia",       housing_wage_2br: 29.46, annual_income_2br: 61273,  fmr_2br: 1532, ami_annual: 100669, ami_monthly_30pct: 2517, ami_30_monthly: 755,  renter_households: 1388484, renter_pct_of_total: 35, mean_renter_wage: 22.08 },
  { abbr: "HI", name: "Hawaii",        housing_wage_2br: 49.19, annual_income_2br: 102323, fmr_2br: 2558, ami_annual: 122833, ami_monthly_30pct: 3071, ami_30_monthly: 921,  renter_households: 183122,  renter_pct_of_total: 37, mean_renter_wage: 21.98 },
  { abbr: "ID", name: "Idaho",         housing_wage_2br: 27.83, annual_income_2br: 57876,  fmr_2br: 1447, ami_annual: 98136,  ami_monthly_30pct: 2453, ami_30_monthly: 736,  renter_households: 191681,  renter_pct_of_total: 28, mean_renter_wage: 18.81 },
  { abbr: "IL", name: "Illinois",      housing_wage_2br: 29.81, annual_income_2br: 61997,  fmr_2br: 1550, ami_annual: 112042, ami_monthly_30pct: 2801, ami_30_monthly: 840,  renter_households: 1658870, renter_pct_of_total: 33, mean_renter_wage: 23.01 },
  { abbr: "IN", name: "Indiana",       housing_wage_2br: 22.18, annual_income_2br: 46125,  fmr_2br: 1153, ami_annual: 96318,  ami_monthly_30pct: 2408, ami_30_monthly: 722,  renter_households: 795052,  renter_pct_of_total: 30, mean_renter_wage: 18.05 },
  { abbr: "IA", name: "Iowa",          housing_wage_2br: 19.99, annual_income_2br: 41582,  fmr_2br: 1040, ami_annual: 101882, ami_monthly_30pct: 2547, ami_30_monthly: 764,  renter_households: 371145,  renter_pct_of_total: 28, mean_renter_wage: 17.32 },
  { abbr: "KS", name: "Kansas",        housing_wage_2br: 20.87, annual_income_2br: 43402,  fmr_2br: 1085, ami_annual: 97227,  ami_monthly_30pct: 2431, ami_30_monthly: 729,  renter_households: 384404,  renter_pct_of_total: 33, mean_renter_wage: 18.66 },
  { abbr: "KY", name: "Kentucky",      housing_wage_2br: 21.47, annual_income_2br: 44647,  fmr_2br: 1116, ami_annual: 87050,  ami_monthly_30pct: 2176, ami_30_monthly: 653,  renter_households: 568417,  renter_pct_of_total: 32, mean_renter_wage: 17.89 },
  { abbr: "LA", name: "Louisiana",     housing_wage_2br: 22.88, annual_income_2br: 47581,  fmr_2br: 1190, ami_annual: 83285,  ami_monthly_30pct: 2082, ami_30_monthly: 625,  renter_households: 582761,  renter_pct_of_total: 33, mean_renter_wage: 17.28 },
  { abbr: "ME", name: "Maine",         housing_wage_2br: 28.42, annual_income_2br: 59120,  fmr_2br: 1478, ami_annual: 102090, ami_monthly_30pct: 2552, ami_30_monthly: 766,  renter_households: 152957,  renter_pct_of_total: 26, mean_renter_wage: 17.53 },
  { abbr: "MD", name: "Maryland",      housing_wage_2br: 39.15, annual_income_2br: 81434,  fmr_2br: 2036, ami_annual: 139884, ami_monthly_30pct: 3497, ami_30_monthly: 1049, renter_households: 760808,  renter_pct_of_total: 33, mean_renter_wage: 22.31 },
  { abbr: "MA", name: "Massachusetts", housing_wage_2br: 45.90, annual_income_2br: 95476,  fmr_2br: 2387, ami_annual: 141275, ami_monthly_30pct: 3532, ami_30_monthly: 1060, renter_households: 1033084, renter_pct_of_total: 37, mean_renter_wage: 28.66 },
  { abbr: "MI", name: "Michigan",      housing_wage_2br: 24.46, annual_income_2br: 50869,  fmr_2br: 1272, ami_annual: 97246,  ami_monthly_30pct: 2431, ami_30_monthly: 729,  renter_households: 1094011, renter_pct_of_total: 27, mean_renter_wage: 18.98 },
  { abbr: "MN", name: "Minnesota",     housing_wage_2br: 28.23, annual_income_2br: 58711,  fmr_2br: 1468, ami_annual: 120661, ami_monthly_30pct: 3017, ami_30_monthly: 905,  renter_households: 630433,  renter_pct_of_total: 28, mean_renter_wage: 20.57 },
  { abbr: "MS", name: "Mississippi",   housing_wage_2br: 20.79, annual_income_2br: 43244,  fmr_2br: 1081, ami_annual: 77396,  ami_monthly_30pct: 1935, ami_30_monthly: 580,  renter_households: 345471,  renter_pct_of_total: 31, mean_renter_wage: 14.54 },
  { abbr: "MO", name: "Missouri",      housing_wage_2br: 21.61, annual_income_2br: 44951,  fmr_2br: 1124, ami_annual: 99295,  ami_monthly_30pct: 2482, ami_30_monthly: 745,  renter_households: 796762,  renter_pct_of_total: 32, mean_renter_wage: 19.13 },
  { abbr: "MT", name: "Montana",       housing_wage_2br: 28.99, annual_income_2br: 60307,  fmr_2br: 1508, ami_annual: 97153,  ami_monthly_30pct: 2429, ami_30_monthly: 729,  renter_households: 138417,  renter_pct_of_total: 31, mean_renter_wage: 18.35 },
  { abbr: "NE", name: "Nebraska",      housing_wage_2br: 21.57, annual_income_2br: 44870,  fmr_2br: 1122, ami_annual: 104322, ami_monthly_30pct: 2608, ami_30_monthly: 782,  renter_households: 263282,  renter_pct_of_total: 33, mean_renter_wage: 17.71 },
  { abbr: "NV", name: "Nevada",        housing_wage_2br: 32.94, annual_income_2br: 68507,  fmr_2br: 1713, ami_annual: 97857,  ami_monthly_30pct: 2446, ami_30_monthly: 734,  renter_households: 481479,  renter_pct_of_total: 41, mean_renter_wage: 22.12 },
  { abbr: "NH", name: "New Hampshire", housing_wage_2br: 35.08, annual_income_2br: 72971,  fmr_2br: 1824, ami_annual: 129301, ami_monthly_30pct: 3233, ami_30_monthly: 970,  renter_households: 151523,  renter_pct_of_total: 27, mean_renter_wage: 20.92 },
  { abbr: "NJ", name: "New Jersey",    housing_wage_2br: 39.99, annual_income_2br: 83173,  fmr_2br: 2079, ami_annual: 131201, ami_monthly_30pct: 3280, ami_30_monthly: 984,  renter_households: 1262873, renter_pct_of_total: 36, mean_renter_wage: 23.97 },
  { abbr: "NM", name: "New Mexico",    housing_wage_2br: 23.18, annual_income_2br: 48205,  fmr_2br: 1205, ami_annual: 84106,  ami_monthly_30pct: 2103, ami_30_monthly: 631,  renter_households: 252957,  renter_pct_of_total: 31, mean_renter_wage: 18.06 },
  { abbr: "NY", name: "New York",      housing_wage_2br: 46.03, annual_income_2br: 95749,  fmr_2br: 2394, ami_annual: 114419, ami_monthly_30pct: 2860, ami_30_monthly: 858,  renter_households: 3504163, renter_pct_of_total: 46, mean_renter_wage: 33.09 },
  { abbr: "NC", name: "North Carolina",housing_wage_2br: 27.14, annual_income_2br: 56442,  fmr_2br: 1411, ami_annual: 97896,  ami_monthly_30pct: 2447, ami_30_monthly: 734,  renter_households: 1408252, renter_pct_of_total: 34, mean_renter_wage: 21.09 },
  { abbr: "ND", name: "North Dakota",  housing_wage_2br: 19.47, annual_income_2br: 40501,  fmr_2br: 1013, ami_annual: 112820, ami_monthly_30pct: 2820, ami_30_monthly: 846,  renter_households: 118956,  renter_pct_of_total: 37, mean_renter_wage: 20.17 },
  { abbr: "OH", name: "Ohio",          housing_wage_2br: 22.51, annual_income_2br: 46825,  fmr_2br: 1171, ami_annual: 97502,  ami_monthly_30pct: 2438, ami_30_monthly: 731,  renter_households: 1594003, renter_pct_of_total: 33, mean_renter_wage: 18.62 },
  { abbr: "OK", name: "Oklahoma",      housing_wage_2br: 20.98, annual_income_2br: 43640,  fmr_2br: 1091, ami_annual: 88024,  ami_monthly_30pct: 2201, ami_30_monthly: 660,  renter_households: 527573,  renter_pct_of_total: 34, mean_renter_wage: 18.36 },
  { abbr: "OR", name: "Oregon",        housing_wage_2br: 33.02, annual_income_2br: 68673,  fmr_2br: 1717, ami_annual: 107889, ami_monthly_30pct: 2697, ami_30_monthly: 809,  renter_households: 623205,  renter_pct_of_total: 37, mean_renter_wage: 22.16 },
  { abbr: "PA", name: "Pennsylvania",  housing_wage_2br: 27.83, annual_income_2br: 57886,  fmr_2br: 1447, ami_annual: 104672, ami_monthly_30pct: 2617, ami_30_monthly: 785,  renter_households: 1605715, renter_pct_of_total: 31, mean_renter_wage: 20.42 },
  { abbr: "RI", name: "Rhode Island",  housing_wage_2br: 31.71, annual_income_2br: 65954,  fmr_2br: 1649, ami_annual: 116064, ami_monthly_30pct: 2902, ami_30_monthly: 870,  renter_households: 160558,  renter_pct_of_total: 37, mean_renter_wage: 18.22 },
  { abbr: "SC", name: "South Carolina",housing_wage_2br: 25.91, annual_income_2br: 53896,  fmr_2br: 1347, ami_annual: 91682,  ami_monthly_30pct: 2292, ami_30_monthly: 688,  renter_households: 591532,  renter_pct_of_total: 29, mean_renter_wage: 17.76 },
  { abbr: "SD", name: "South Dakota",  housing_wage_2br: 18.96, annual_income_2br: 39444,  fmr_2br: 986,  ami_annual: 101905, ami_monthly_30pct: 2548, ami_30_monthly: 764,  renter_households: 112447,  renter_pct_of_total: 31, mean_renter_wage: 17.36 },
  { abbr: "TN", name: "Tennessee",     housing_wage_2br: 27.01, annual_income_2br: 56172,  fmr_2br: 1404, ami_annual: 93993,  ami_monthly_30pct: 2350, ami_30_monthly: 705,  renter_households: 912950,  renter_pct_of_total: 33, mean_renter_wage: 21.27 },
  { abbr: "TX", name: "Texas",         housing_wage_2br: 29.64, annual_income_2br: 61661,  fmr_2br: 1542, ami_annual: 101215, ami_monthly_30pct: 2530, ami_30_monthly: 759,  renter_households: 4023511, renter_pct_of_total: 37, mean_renter_wage: 25.01 },
  { abbr: "UT", name: "Utah",          housing_wage_2br: 29.29, annual_income_2br: 60930,  fmr_2br: 1523, ami_annual: 117135, ami_monthly_30pct: 2928, ami_30_monthly: 879,  renter_households: 321551,  renter_pct_of_total: 29, mean_renter_wage: 20.52 },
  { abbr: "VT", name: "Vermont",       housing_wage_2br: 29.73, annual_income_2br: 61833,  fmr_2br: 1546, ami_annual: 112203, ami_monthly_30pct: 2805, ami_30_monthly: 842,  renter_households: 71479,   renter_pct_of_total: 27, mean_renter_wage: 17.67 },
  { abbr: "VA", name: "Virginia",      housing_wage_2br: 33.64, annual_income_2br: 69967,  fmr_2br: 1749, ami_annual: 121930, ami_monthly_30pct: 3048, ami_30_monthly: 914,  renter_households: 1091768, renter_pct_of_total: 33, mean_renter_wage: 23.66 },
  { abbr: "WA", name: "Washington",    housing_wage_2br: 41.11, annual_income_2br: 85501,  fmr_2br: 2138, ami_annual: 128304, ami_monthly_30pct: 3208, ami_30_monthly: 962,  renter_households: 1090864, renter_pct_of_total: 36, mean_renter_wage: 29.95 },
  { abbr: "WV", name: "West Virginia", housing_wage_2br: 18.94, annual_income_2br: 39392,  fmr_2br: 985,  ami_annual: 81804,  ami_monthly_30pct: 2045, ami_30_monthly: 614,  renter_households: 185366,  renter_pct_of_total: 26, mean_renter_wage: 15.20 },
  { abbr: "WI", name: "Wisconsin",     housing_wage_2br: 23.15, annual_income_2br: 48149,  fmr_2br: 1204, ami_annual: 106769, ami_monthly_30pct: 2669, ami_30_monthly: 801,  renter_households: 785523,  renter_pct_of_total: 32, mean_renter_wage: 18.86 },
  { abbr: "WY", name: "Wyoming",       housing_wage_2br: 20.25, annual_income_2br: 42119,  fmr_2br: 1053, ami_annual: 101401, ami_monthly_30pct: 2535, ami_30_monthly: 761,  renter_households: 66877,   renter_pct_of_total: 28, mean_renter_wage: 18.20 },
];

function main() {
  // Standard tied rank: equal values share rank, next rank skips.
  const sorted = [...ROWS].sort((a, b) => b.housing_wage_2br - a.housing_wage_2br);
  const ranked = sorted.map((row, i) => {
    let rank = i + 1;
    for (let j = 0; j < i; j++) {
      if (sorted[j].housing_wage_2br === row.housing_wage_2br) {
        rank = j + 1;
        break;
      }
    }
    return { ...row, rank, total_jurisdictions: sorted.length };
  });

  const us_avg_housing_wage = 33.63; // verbatim from PDF text "least $33.63 per hour"

  const out = {
    fetched_at: new Date().toISOString(),
    source:
      "NLIHC Out of Reach 2025 (https://nlihc.org/oor) — state summary table (FY25)",
    methodology_excerpt:
      "Housing Wage = the hourly wage a full-time worker (40 hr/week × 52 weeks) must earn so that the FY25 HUD 2BR FMR consumes ≤ 30% of gross income.",
    us_avg_housing_wage_2br: us_avg_housing_wage,
    total_renter_households_us: 44983919,
    us_mean_renter_wage_2025: 23.60,
    counts: { jurisdictions: ranked.length },
    states: ranked.sort((a, b) => a.abbr.localeCompare(b.abbr)),
  };

  const outPath = "data/raw/nlihc-oor-2025.json";
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`wrote ${outPath}`);
  console.log(`  jurisdictions: ${ranked.length}`);
  console.log(`  US avg housing wage: $${us_avg_housing_wage}/hr`);
  console.log(`  highest: ${ranked.find((r) => r.rank === 1)?.name} ($${ranked.find((r) => r.rank === 1)?.housing_wage_2br}/hr)`);
  const last = ranked[ranked.length - 1];
  console.log(`  lowest:  ${last.name} ($${last.housing_wage_2br}/hr)`);
}

main();
