/**
 * FmrMarketGapDecoder — "voucher reality check": how the HUD Fair Market Rent
 * (the Section 8 / Housing Choice Voucher payment standard) sits against the
 * ACTUAL local market rent for the same unit size.
 *
 * Why this is the genuine synthesis gap: the site already verdicts rent burden
 * (FMR ÷ income), FMR-county-variance (FMR spread across a state's counties), the
 * NLIHC wage-rent gap (housing wage vs renter wage), the bedroom ratio (4BR÷studio)
 * and FMR-vs-national-average. The per-bedroom ACS median rent (acs_median_rent_2br)
 * is LOADED but is never compared to the HUD FMR — yet "is the voucher FMR realistic
 * for what people actually pay here?" is the core voucher-holder / landlord question.
 *
 * Both inputs are real and same-unit-size (2BR):
 *   - fmr_2br: HUD FY2025 Fair Market Rent, the 40th-percentile gross rent for
 *     recent movers, used as the voucher payment standard (24 CFR 888).
 *   - acs_median_rent_2br: Census ACS 2023 5-Year median gross rent for 2-bedroom
 *     units (B25031), across all renters.
 *
 * Honest scope:
 *  - These measure different things: a forward-looking 40th-percentile recent-mover
 *    standard (FY2025) vs a lagging all-renter median (2023). A positive gap is the
 *    STRUCTURAL norm (recent-mover premium + 2 years of rent growth) — nationally
 *    the FMR runs ~24% above the ACS 2BR median. The decision signal is therefore
 *    the THIN / NEGATIVE tail: counties where the voucher cap sits at or below the
 *    actual median are where vouchers structurally struggle to clear a unit.
 *  - Descriptive positioning, not a claim that any FMR is "wrong"; honest-null when
 *    either figure is missing.
 */

export type HeadroomBand = 'below' | 'thin' | 'moderate' | 'comfortable' | 'wide';

export interface FmrMarketGapResult {
  fmr2br: number;
  marketMedian2br: number;
  /** fmr − market, dollars/month. */
  gapDollars: number;
  /** (fmr − market) / market × 100. */
  gapPct: number;
  band: HeadroomBand;
  bandLabel: string;
  /** Answer-first one-liner. */
  verdictShort: string;
  caveats: string[];
}

export const HEADROOM_BAND_META: Record<HeadroomBand, { label: string; blurb: string; tone: string }> = {
  below: {
    label: 'No headroom — voucher caps below the local median',
    blurb: 'The HUD FMR sits at or below the actual 2BR median rent, so a voucher caps out near or under what units typically lease for — the hardest markets to clear a voucher in.',
    tone: 'rose',
  },
  thin: {
    label: 'Thin headroom',
    blurb: 'The FMR is only modestly above the actual median — voucher holders have a narrow band of qualifying units before hitting the cap.',
    tone: 'orange',
  },
  moderate: {
    label: 'Moderate headroom',
    blurb: 'The FMR clears the actual median by a moderate margin — typical voucher conditions.',
    tone: 'amber',
  },
  comfortable: {
    label: 'Comfortable headroom',
    blurb: 'The FMR runs comfortably above the actual median (around the national-typical cushion) — vouchers reach a broad slice of the market.',
    tone: 'sky',
  },
  wide: {
    label: 'Wide headroom',
    blurb: 'The FMR sits far above the actual 2BR median — the voucher cap reaches well into the upper market here.',
    tone: 'emerald',
  },
};

function bandFor(gapPct: number): HeadroomBand {
  if (gapPct < 0) return 'below';
  if (gapPct < 10) return 'thin';
  if (gapPct < 20) return 'moderate';
  if (gapPct < 35) return 'comfortable';
  return 'wide';
}

function r1(v: number): number {
  return Math.round(v * 10) / 10;
}

export function decodeFmrMarketGap(
  fmr2br: number | null | undefined,
  marketMedian2br: number | null | undefined,
): FmrMarketGapResult | null {
  if (!fmr2br || fmr2br <= 0 || !marketMedian2br || marketMedian2br <= 0) return null;

  const gapDollars = Math.round(fmr2br - marketMedian2br);
  const gapPct = r1(((fmr2br - marketMedian2br) / marketMedian2br) * 100);
  const band = bandFor(gapPct);
  const meta = HEADROOM_BAND_META[band];

  const dir = gapPct >= 0 ? 'above' : 'below';
  const verdictShort =
    `HUD's FY2025 2BR voucher standard ($${fmr2br.toLocaleString()}/mo) sits ` +
    `${Math.abs(gapPct)}% ${dir} the actual 2BR median rent ($${marketMedian2br.toLocaleString()}/mo, ACS 2023) — ${meta.label.toLowerCase()}.`;

  return {
    fmr2br,
    marketMedian2br,
    gapDollars,
    gapPct,
    band,
    bandLabel: meta.label,
    verdictShort,
    caveats: [
      'HUD FMR is the FY2025 40th-percentile gross rent for recent movers (the voucher payment standard, 24 CFR 888); the ACS 2BR median is the 2023 5-Year median gross rent across all renters (Census B25031).',
      'Because the FMR is a newer, recent-mover, 40th-percentile figure, it sits above the older all-renter median in most counties (nationally ~24%) — that cushion is the structural norm, so the figure to watch is thin or negative headroom, where a voucher caps out near or below the typical unit.',
      'ACS medians carry sampling error (margin of error); treat small differences as indistinguishable.',
    ],
  };
}
