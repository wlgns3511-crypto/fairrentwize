export function DataSourceBadge({ sources }: { sources: { name: string; url: string }[] }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {sources.map((s) => (
        <a
          key={s.name}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-xs text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
          {s.name}
        </a>
      ))}
    </div>
  );
}
