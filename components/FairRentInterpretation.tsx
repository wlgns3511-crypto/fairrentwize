/**
 * FairRentInterpretation — verdict box composing the three deterministic
 * fairrentwize levers (RentBurdenTier × OorHousingWageMultiple ×
 * FmrCountyVarianceTier) into a single 6-category DominantSignal panel.
 * Surfaced on /state/[slug]/ between the RentBurdenTier section and the
 * status-aware intro.
 *
 * Tailwind v4 has no JIT safelist mechanism — all class strings for each
 * tone branch must be inlined as literal strings, not built via template
 * interpolation. Per-tone variants are hardcoded below.
 */
import type { FairRentInterpretationResult } from '@/lib/fairrent-interpretation';

interface Props {
  interpretation: FairRentInterpretationResult;
}

export function FairRentInterpretation({ interpretation }: Props) {
  const { tone, dominantSignal, signalLabel, verdict, paragraphs, primaryGuide, secondaryGuides, inputs } =
    interpretation;

  // Inlined per-tone class strings (Tailwind v4 cannot safelist runtime template strings).
  let containerClass = 'mb-6 rounded-xl border p-5';
  let headerClass = 'text-lg font-bold mb-2';
  let badgeClass = 'inline-block rounded-full px-3 py-1 text-xs font-semibold mb-3';
  let bodyClass = 'text-sm leading-7 mb-3';
  let footerLinkClass = 'font-semibold hover:underline';

  switch (tone) {
    case 'emerald':
      containerClass += ' border-emerald-200 bg-emerald-50/60';
      headerClass += ' text-emerald-900';
      badgeClass += ' bg-emerald-100 text-emerald-800';
      bodyClass += ' text-slate-700';
      footerLinkClass += ' text-emerald-700';
      break;
    case 'sky':
      containerClass += ' border-sky-200 bg-sky-50/60';
      headerClass += ' text-sky-900';
      badgeClass += ' bg-sky-100 text-sky-800';
      bodyClass += ' text-slate-700';
      footerLinkClass += ' text-sky-700';
      break;
    case 'amber':
      containerClass += ' border-amber-200 bg-amber-50/60';
      headerClass += ' text-amber-900';
      badgeClass += ' bg-amber-100 text-amber-800';
      bodyClass += ' text-slate-700';
      footerLinkClass += ' text-amber-700';
      break;
    case 'rose':
      containerClass += ' border-rose-200 bg-rose-50/60';
      headerClass += ' text-rose-900';
      badgeClass += ' bg-rose-100 text-rose-800';
      bodyClass += ' text-slate-700';
      footerLinkClass += ' text-rose-700';
      break;
    case 'slate':
      containerClass += ' border-slate-200 bg-slate-50/60';
      headerClass += ' text-slate-900';
      badgeClass += ' bg-slate-100 text-slate-800';
      bodyClass += ' text-slate-700';
      footerLinkClass += ' text-slate-700';
      break;
  }

  return (
    <section className={containerClass} data-upgrade="fairrent-interpretation">
      <span className={badgeClass}>
        Composite verdict: {dominantSignal}
      </span>
      <h2 className={headerClass}>{signalLabel}</h2>
      <p className={bodyClass}>{verdict}</p>
      <div className="space-y-3 mb-4">
        {paragraphs.slice(1).map((para, i) => (
          <p key={i} className="text-sm leading-7 text-slate-700">
            {para}
          </p>
        ))}
      </div>
      <div className="rounded-md bg-white/60 p-3 text-xs text-slate-700">
        <p className="font-semibold mb-1">Lever stack:</p>
        <ul className="space-y-1">
          <li>
            <span className="font-mono">RentBurdenTier {inputs.rentBurdenTier}</span> &middot; HUD FY 2025 FMR-2BR runs{' '}
            {inputs.rentBurdenPct.toFixed(1)}% of Census ACS B19013 median household income (24 CFR 5.628 anchor)
          </li>
          <li>
            <span className="font-mono">OOR Multiple {inputs.oorMultipleTier}</span> &middot; NLIHC Out of Reach 2025
            housing wage / mean renter wage = {inputs.oorMultiple.toFixed(2)}×
          </li>
          <li>
            <span className="font-mono">FMR Variance {inputs.fmrVarianceTier}</span> &middot; HUD FY 2025 FMR-2BR
            within-state CoV = {inputs.fmrVariancePct.toFixed(1)}%
          </li>
        </ul>
      </div>
      <p className="mt-4 text-xs text-slate-600">
        <a href={primaryGuide.href} className={footerLinkClass}>
          {primaryGuide.title} &rarr;
        </a>
        {secondaryGuides.length > 0 && (
          <>
            {' '}&middot;{' '}
            {secondaryGuides.map((g, i) => (
              <span key={g.href}>
                <a href={g.href} className="text-slate-600 hover:underline">
                  {g.title}
                </a>
                {i < secondaryGuides.length - 1 ? ' · ' : ''}
              </span>
            ))}
          </>
        )}
      </p>
    </section>
  );
}
