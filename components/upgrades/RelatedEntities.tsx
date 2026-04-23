/**
 * RelatedEntities — internal link boost strip
 *
 * Source of truth: _shared/components/upgrades/RelatedEntities.tsx
 * DO NOT edit the copy inside each site — edit here and run sync-upgrades.sh.
 *
 * Purpose: Surface direct entity→entity links on every data page.
 * Currently most sites only link entities through rankings/index pages;
 * this component adds "Similar to X" links at the bottom of each page,
 * improving crawl depth, PageRank distribution, and user discovery.
 *
 * Each site passes its own related items via its lib/db.ts similar or related functions.
 */

export interface RelatedEntity {
  /** Display name — city, word, school, etc. */
  name: string;
  /** URL path — e.g. "/zip/77494" or "/word/ephemeral" */
  href: string;
  /** Optional one-line stat for context, e.g. "Median $85K" or "Pop. 42,300" */
  stat?: string;
}

export interface RelatedEntitiesProps {
  /** Current entity name, shown in heading */
  entityName: string;
  /** Array of related entities to link */
  items: RelatedEntity[];
  /** Optional heading override — defaults to "Similar to {entityName}" */
  heading?: string;
  /** Optional label for the stat column */
  statLabel?: string;
}

export function RelatedEntities({
  entityName,
  items,
  heading,
  statLabel,
}: RelatedEntitiesProps) {
  if (!items || items.length === 0) return null;

  const displayHeading = heading || `Similar to ${entityName}`;

  return (
    <nav
      data-upgrade="related-entities"
      aria-label={displayHeading}
      className="not-prose my-8 rounded-xl border border-slate-200 bg-slate-50/60 p-5"
    >
      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3">
        <svg
          aria-hidden="true"
          className="h-4 w-4 text-slate-500"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.86-2.04a4.5 4.5 0 0 0-1.242-7.244l4.5-4.5a4.5 4.5 0 1 1 6.364 6.364l-1.757 1.757"
          />
        </svg>
        {displayHeading}
      </h3>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((item, i) => (
          <li key={i}>
            <a
              href={item.href}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200"
            >
              <span className="font-medium text-blue-700 hover:text-blue-900">
                {item.name}
              </span>
              {item.stat && (
                <span className="text-xs text-slate-500 ml-2 flex-shrink-0">
                  {statLabel && <span className="sr-only">{statLabel}: </span>}
                  {item.stat}
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
