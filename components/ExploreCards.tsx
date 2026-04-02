interface ExploreItem {
  name: string;
  slug: string;
  subtitle?: string;
  stat?: string;
  statLabel?: string;
}

interface Props {
  items: ExploreItem[];
  entitySlug: string;
  title?: string;
}

export function ExploreCards({ items, entitySlug, title = "Explore Similar" }: Props) {
  if (items.length === 0) return null;

  return (
    <section className="my-6">
      <h2 className="text-lg font-bold text-slate-800 mb-3">{title}</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory -mx-1 px-1">
        {items.slice(0, 5).map((item) => (
          <a
            key={item.slug}
            href={`/${entitySlug}/${item.slug}/`}
            className="snap-start shrink-0 w-48 p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all bg-white group"
          >
            <p className="font-semibold text-slate-800 group-hover:text-blue-700 truncate">
              {item.name}
            </p>
            {item.subtitle && (
              <p className="text-xs text-slate-400 mt-0.5 truncate">{item.subtitle}</p>
            )}
            {item.stat && (
              <div className="mt-3">
                <div className="text-xl font-bold text-blue-700">{item.stat}</div>
                {item.statLabel && (
                  <div className="text-xs text-slate-500">{item.statLabel}</div>
                )}
              </div>
            )}
            <div className="mt-2 text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              View details &rarr;
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
