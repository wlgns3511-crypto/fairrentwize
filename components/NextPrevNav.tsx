interface NavItem {
  name: string;
  slug: string;
}

interface Props {
  prev: NavItem | null;
  next: NavItem | null;
  entitySlug: string;
}

export function NextPrevNav({ prev, next, entitySlug }: Props) {
  if (!prev && !next) return null;

  return (
    <nav className="flex items-stretch border border-slate-200 rounded-lg overflow-hidden my-6" aria-label="Previous and next items">
      {prev ? (
        <a href={`/${entitySlug}/${prev.slug}/`}
          className="flex-1 flex items-center gap-2 p-3 hover:bg-slate-50 transition-colors text-sm group">
          <span className="text-slate-400 group-hover:text-blue-600 text-lg">&larr;</span>
          <div className="min-w-0">
            <div className="text-xs text-slate-400">Previous</div>
            <div className="font-medium text-slate-700 group-hover:text-blue-700 truncate">{prev.name}</div>
          </div>
        </a>
      ) : <div className="flex-1" />}

      <div className="w-px bg-slate-200" />

      {next ? (
        <a href={`/${entitySlug}/${next.slug}/`}
          className="flex-1 flex items-center justify-end gap-2 p-3 hover:bg-slate-50 transition-colors text-sm text-right group">
          <div className="min-w-0">
            <div className="text-xs text-slate-400">Next</div>
            <div className="font-medium text-slate-700 group-hover:text-blue-700 truncate">{next.name}</div>
          </div>
          <span className="text-slate-400 group-hover:text-blue-600 text-lg">&rarr;</span>
        </a>
      ) : <div className="flex-1" />}
    </nav>
  );
}
