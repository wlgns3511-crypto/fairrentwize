/**
 * DataSuppressedNotice — shown when an ACS or HUD figure is missing or
 * unreliable for a specific county/metro/state. The page stays online so
 * existing GSC trust on the slug is not lost, but stat cards are replaced
 * with an honest "we are holding this number" notice.
 *
 * Renders nothing if `reasons` is empty (caller-side guard).
 */

interface DataSuppressedNoticeProps {
  /** Short list of missing fields, e.g. ["2BR FMR", "median household income"] */
  reasons: string[];
  /** Source the missing field would have come from (HUD / ACS / NLIHC) */
  source: 'HUD FMR' | 'Census ACS 2023 5-Year' | 'NLIHC Out of Reach 2025' | 'multiple';
  /** What the visitor can still do — links to peer/state/etc. */
  fallbackHref?: string;
  fallbackLabel?: string;
}

export function DataSuppressedNotice({
  reasons,
  source,
  fallbackHref,
  fallbackLabel,
}: DataSuppressedNoticeProps) {
  if (reasons.length === 0) return null;

  return (
    <section className="my-6 rounded-xl border border-amber-200 bg-amber-50/60 p-5">
      <div className="flex items-start gap-3">
        <div
          aria-hidden
          className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-amber-900"
        >
          !
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-amber-900">
            We&rsquo;re holding {reasons.length === 1 ? 'one figure' : `${reasons.length} figures`} on this page
          </h2>
          <p className="mt-1 text-sm leading-6 text-amber-900/80">
            {reasons.length === 1 ? 'This area' : 'This area'}{' '}
            {reasons.length === 1 ? 'has no current published value for ' : 'is missing current values for '}
            <span className="font-medium">{reasons.join(', ')}</span> in the latest{' '}
            {source === 'multiple' ? 'public datasets' : source} release. Rather
            than estimate or extrapolate, we display the figure only when the
            primary source publishes it.
          </p>
          {fallbackHref && fallbackLabel && (
            <p className="mt-2 text-sm">
              <a
                href={fallbackHref}
                className="text-amber-900 underline underline-offset-2 hover:text-amber-700"
              >
                {fallbackLabel} &rarr;
              </a>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
