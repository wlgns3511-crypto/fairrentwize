/**
 * PopularEntities -- homepage internal link boost section
 *
 * Source of truth: _shared/components/upgrades/PopularEntities.tsx
 * DO NOT edit the copy inside each site -- edit here and run sync-upgrades.sh.
 *
 * Purpose: Surface top entities directly on the homepage to:
 * 1. Give visitors immediate click targets (lower bounce rate)
 * 2. Create homepage -> entity page internal links (crawl depth)
 * 3. Add substantive content to homepages (avoid thin-content signals)
 * 4. Boost PageRank flow to highest-value data pages
 *
 * Each site provides its popular items from existing DB queries
 * (population-sorted, rank-sorted, or frequency-sorted).
 */

export interface PopularEntity {
  /** Display name */
  name: string;
  /** URL path, e.g. "/zip/77494" */
  href: string;
  /** Brief stat for context, e.g. "Pop. 42K" or "Score 85/100" */
  stat?: string;
}

export interface PopularEntitiesProps {
  /** Section heading, e.g. "Most Searched ZIP Codes" */
  heading: string;
  /** Optional subtext, e.g. "Based on population & search interest" */
  subheading?: string;
  /** Array of 6-12 popular entities */
  items: PopularEntity[];
  /** Grid columns on desktop (default 3) */
  columns?: 2 | 3 | 4;
  /** "View all" link target */
  viewAllHref?: string;
  /** "View all" link label (default "View all →") */
  viewAllLabel?: string;
}

export function PopularEntities({
  heading,
  subheading,
  items,
  columns = 3,
  viewAllHref,
  viewAllLabel = "View all \u2192",
}: PopularEntitiesProps) {
  if (!items || items.length === 0) return null;

  const colClass =
    columns === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : columns === 4
      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
      : "grid-cols-2 sm:grid-cols-3";

  return (
    <section
      data-upgrade="popular-entities"
      aria-label={heading}
      className="my-10"
    >
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <svg
            aria-hidden="true"
            className="h-5 w-5 text-amber-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z"
            />
          </svg>
          {heading}
        </h2>
        {subheading && (
          <p className="text-sm text-slate-500 mt-1">{subheading}</p>
        )}
      </div>

      <div className={`grid ${colClass} gap-2`}>
        {items.map((item, i) => (
          <a
            key={i}
            href={item.href}
            className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 transition-all hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-sm"
          >
            <span className="text-sm font-medium text-blue-700 group-hover:text-blue-900 truncate">
              {item.name}
            </span>
            {item.stat && (
              <span className="text-xs text-slate-400 ml-2 flex-shrink-0">
                {item.stat}
              </span>
            )}
          </a>
        ))}
      </div>

      {viewAllHref && (
        <div className="mt-3 text-right">
          <a
            href={viewAllHref}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            {viewAllLabel}
          </a>
        </div>
      )}
    </section>
  );
}
