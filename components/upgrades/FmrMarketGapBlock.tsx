import type { FmrMarketGapResult, HeadroomBand } from '@/lib/fmr-market-gap';

const BAND_TONE: Record<HeadroomBand, { border: string; bg: string; chip: string; bar: string }> = {
  below: { border: 'border-rose-200', bg: 'bg-rose-50', chip: 'bg-rose-100 text-rose-800', bar: 'bg-rose-500' },
  thin: { border: 'border-orange-200', bg: 'bg-orange-50', chip: 'bg-orange-100 text-orange-800', bar: 'bg-orange-500' },
  moderate: { border: 'border-amber-200', bg: 'bg-amber-50', chip: 'bg-amber-100 text-amber-800', bar: 'bg-amber-500' },
  comfortable: { border: 'border-sky-200', bg: 'bg-sky-50', chip: 'bg-sky-100 text-sky-800', bar: 'bg-sky-500' },
  wide: { border: 'border-emerald-200', bg: 'bg-emerald-50', chip: 'bg-emerald-100 text-emerald-800', bar: 'bg-emerald-500' },
};

interface Props {
  result: FmrMarketGapResult;
  areaName: string;
}

export function FmrMarketGapBlock({ result, areaName }: Props) {
  const tone = BAND_TONE[result.band];
  const meta = result; // alias for readability
  const max = Math.max(result.fmr2br, result.marketMedian2br, 1);

  return (
    <section className="my-8" data-upgrade="fmr-market-gap">
      <h2 className="text-xl font-bold mb-1 text-slate-900">Will a housing voucher cover the rent in {areaName}?</h2>
      <p className="text-sm text-slate-500 mb-3">
        How HUD&rsquo;s 2-bedroom Fair Market Rent (the Housing Choice Voucher payment standard) sits
        against the actual 2BR median rent renters pay.
      </p>

      {/* Answer-first verdict */}
      <div className={`border rounded-xl p-4 mb-4 ${tone.border} ${tone.bg}`}>
        <div className="text-[11px] font-medium uppercase tracking-wider text-slate-600 mb-1">Verdict</div>
        <p className="text-base font-semibold text-slate-900 leading-snug">{result.verdictShort}</p>
        <span className={`inline-block mt-2 text-[11px] font-medium px-2 py-0.5 rounded ${tone.chip}`}>
          {result.gapDollars >= 0 ? `+$${result.gapDollars}` : `−$${Math.abs(result.gapDollars)}`}/mo voucher headroom
        </span>
      </div>

      {/* FMR vs market bars */}
      <div className="space-y-2 mb-3">
        <div>
          <div className="flex justify-between text-xs text-slate-600 mb-0.5">
            <span>HUD FY2025 2BR FMR (voucher cap)</span>
            <span className="font-medium tabular-nums">${result.fmr2br.toLocaleString()}/mo</span>
          </div>
          <div className="h-3 bg-slate-100 rounded">
            <div className={`h-3 rounded ${tone.bar}`} style={{ width: `${(result.fmr2br / max) * 100}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-slate-600 mb-0.5">
            <span>Actual 2BR median rent (ACS 2023)</span>
            <span className="font-medium tabular-nums">${result.marketMedian2br.toLocaleString()}/mo</span>
          </div>
          <div className="h-3 bg-slate-100 rounded">
            <div className="h-3 rounded bg-slate-400" style={{ width: `${(result.marketMedian2br / max) * 100}%` }} />
          </div>
        </div>
      </div>
      <p className="text-sm text-slate-700 mb-3">
        {HEADROOM_BLURB(result.band)}
      </p>

      <ul className="text-xs text-slate-500 space-y-1 list-disc pl-4">
        {result.caveats.map((c, i) => (
          <li key={i}>{c}</li>
        ))}
      </ul>
      <p className="text-[11px] text-slate-400 mt-2">
        Source: HUD Fair Market Rents FY2025 (40th-percentile, 24 CFR 888) · U.S. Census ACS 2023 5-Year (B25031).
      </p>
    </section>
  );
}

function HEADROOM_BLURB(band: HeadroomBand): string {
  switch (band) {
    case 'below':
      return 'A voucher here caps out at or below what 2-bedroom units typically lease for, so holders must find a below-median unit or request a payment-standard exception — among the hardest markets to use a voucher in.';
    case 'thin':
      return 'Only a narrow band of 2-bedroom units falls under the voucher cap before exceeding it; expect a tight search.';
    case 'moderate':
      return 'The voucher cap clears the typical 2-bedroom rent by a moderate margin — roughly typical voucher conditions.';
    case 'comfortable':
      return 'The voucher cap runs comfortably above the typical 2-bedroom rent (around the national-typical cushion), reaching a broad slice of the market.';
    case 'wide':
      return 'The voucher cap sits well above the typical 2-bedroom rent, reaching into the upper market — the cushion is unusually wide.';
  }
}
