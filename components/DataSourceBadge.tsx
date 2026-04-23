/**
 * DataSourceBadge v2 — with "Last Updated" freshness signal
 *
 * Usage:
 *   <DataSourceBadge sources={[{ name: "US Census", url: "..." }]} />
 *   <DataSourceBadge sources={[...]} updatedAt="2026-04" />
 *   <DataSourceBadge sources={[...]} updatedAt="2026-04" verifiedLabel="Data verified" />
 */

const CheckIcon = () => (
  <svg className="w-3 h-3 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LinkIcon = () => (
  <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

function getBuildDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

interface DataSourceBadgeProps {
  sources: { name: string; url: string }[];
  /** e.g. "2026-04" or "April 2026" — defaults to build month */
  updatedAt?: string;
  /** Label before date — defaults to "Data verified" */
  verifiedLabel?: string;
}

export function DataSourceBadge({ sources, updatedAt, verifiedLabel = 'Data verified' }: DataSourceBadgeProps) {
  const dateStr = updatedAt || getBuildDate();

  return (
    <div className="mt-4 space-y-2">
      {/* Freshness badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-full">
        <CheckIcon />
        <span>{verifiedLabel}: <strong>{dateStr}</strong></span>
      </div>

      {/* Source links */}
      <div className="flex flex-wrap gap-2">
        {sources.map((s) => (
          <a
            key={s.name}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-xs text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
          >
            <LinkIcon />
            {s.name}
          </a>
        ))}
      </div>
    </div>
  );
}
