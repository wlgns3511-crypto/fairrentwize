/**
 * Site-wide authorship and source-authority registry. Anchors content vintage
 * to actual git mtime (no fabricated freshness) and exposes a small set of
 * named constants the rest of the app imports.
 *
 * Vintage layers separate the questions "when was this surface last
 * substantively re-written?" (page mtime) and "when was this dataset last
 * refreshed?" (DB ingest). Surfaces should pick the layer that matches what
 * a careful reader would expect the date to mean.
 */

// ── Vintage layers (ISO YYYY-MM-DD, anchored to real git mtime) ──────────
// Last substantive rewrite of state/county/metro detail pages + lib/db.ts.
// Commit b929d66ad: "HCU 5-chunk: real HUD+ACS+NLIHC sourcing + Layer 2 commentary".
export const ENTITY_VINTAGE = '2026-04-29';

// State/county/metro entity pages share the entity vintage. Aliased for clarity
// at the call site (rent-by-bedroom, county-main, etc).
export const STATE_VINTAGE = ENTITY_VINTAGE;

// Methodology page last reviewed; same commit as the entity rewrite, since the
// methodology was rewritten alongside the data layer to describe the new HUD
// FMR + ACS + NLIHC pipeline.
export const METHODOLOGY_VINTAGE = '2026-04-29';

// About page last substantive rewrite. Last touched in 38274a9 ("about page upgrade").
// Will move forward when the about page is rewritten in this rotation.
export const ABOUT_VINTAGE = '2026-04-29';

// Date this site first went live (initial commit 09b2c71).
export const SITE_PUBLISHED = '2026-03-27';

// Privacy/Terms/Disclaimer last reviewed. Verified single-value honest:
// commit 447c366 (2026-04-01 21:06) was the last edit to all three legal pages.
export const LEGAL_REVIEWED = '2026-04-01';

// Editorial-policy page last substantive rewrite. New page added in PSU 0차 cycle.
export const EDITORIAL_REVIEWED = '2026-05-11';

// Corrections-policy page last substantive rewrite. New page added in PSU 0차 cycle.
export const CORRECTIONS_REVIEWED = '2026-05-11';

// Disclaimer page last substantive rewrite (PSU 0차 cycle), now anchored separately
// from LEGAL_REVIEWED so callers that want the disclaimer-specific vintage do not
// inherit the older privacy/terms date.
export const DISCLAIMER_REVIEWED = '2026-05-11';

// Database refresh marker (HUD FY2025 + ACS 2019-2023 + NLIHC OOR 2025).
// Kept as a back-compat alias for callers that still import DB_UPDATED.
export const DB_UPDATED = ENTITY_VINTAGE;

// ── Publisher + editorial team ───────────────────────────────────────────
export const PUBLISHER = {
  name: 'DataPeek Research Network',
  url: 'https://datapeekfacts.com',
  description:
    'A public-data network aggregating government and public datasets across US housing, tax, healthcare, and other civic domains.',
};

export const EDITORIAL_TEAM = {
  name: 'FairRentWize Editorial Team',
  url: 'https://datapeekfacts.com/editorial-policy/',
  parentOrganization: PUBLISHER,
};

// ── Source authorities ───────────────────────────────────────────────────
// Only institutions whose data actually backs columns in lib/db.ts are listed
// here. Adding an authority that does not back a real column would make the
// schema reviewedBy / sourceOrganization claim unverifiable.
//
// Backing columns (verified against lib/db.ts):
//   HUD Fair Market Rents    → fmr_studio, fmr_1br, fmr_2br
//   US Census Bureau (ACS)   → acs_median_rent_overall + per-bedroom +
//                              acs_rent_burdened_pct
//   NLIHC Out of Reach       → nlihc_housing_wage_2br, _rank,
//                              _annual_income, _mean_renter_wage,
//                              _renter_households
export const SOURCE_AUTHORITIES = [
  {
    name: 'U.S. Department of Housing and Urban Development',
    shortName: 'HUD',
    program: 'Fair Market Rents',
    vintage: 'FY 2025',
    url: 'https://www.huduser.gov/portal/datasets/fmr.html',
    description:
      'Annual 40th-percentile gross rent estimates by metropolitan area and non-metropolitan county, used by HUD voucher programs.',
  },
  {
    name: 'U.S. Census Bureau',
    shortName: 'ACS',
    program: 'American Community Survey 5-Year Estimates',
    vintage: '2019-2023 (released 2024)',
    url: 'https://www.census.gov/programs-surveys/acs/',
    description:
      'Median gross rent, per-bedroom rent, and rent-burdened household share at state, county, and metro levels (MOE-filtered to ≤30%).',
  },
  {
    name: 'National Low Income Housing Coalition',
    shortName: 'NLIHC',
    program: 'Out of Reach 2025',
    vintage: '2025 edition',
    url: 'https://nlihc.org/oor',
    description:
      'State and metro housing wage (the hourly wage required to afford a 2BR at HUD FMR while spending no more than 30% of income on rent).',
  },
] as const;

// Bullet copy used by AuthorBox / TrustBlock / About callouts. One short line
// per authority, with the program name parenthesized.
export const SOURCE_AUTHORITY_LINES = SOURCE_AUTHORITIES.map(
  (s) => `${s.name} — ${s.program} (${s.vintage}).`,
);

// ── Reviewer / methodology disclaimer ────────────────────────────────────
// Rental-housing context isn't medical YMYL, but tenants act on these numbers
// when budgeting and negotiating. The disclaimer states what is and isn't
// promised, in plain language.
export const REVIEWER_DISCLAIMER =
  'Rent estimates on this site come from public datasets ' +
  '(HUD FMR, ACS, NLIHC) and have known limits: HUD FMRs are area-wide ' +
  '40th-percentile gross rents, not unit-specific quotes; ACS estimates ' +
  'lag the current market by 1–2 years and are filtered for margin of ' +
  'error. Reviewed by the FairRentWize Editorial Team against the ' +
  'cited primary sources before publication.';
