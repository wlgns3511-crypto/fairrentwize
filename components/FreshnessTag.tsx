export function FreshnessTag({ source }: { source?: string }) {
  return (
    <div className="text-xs text-slate-400 mt-4 mb-2">
      <span>Data updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
      {source && <span> · Source: {source}</span>}
    </div>
  );
}
