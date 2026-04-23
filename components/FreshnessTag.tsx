import { DB_UPDATED } from "@/lib/authorship";

export function FreshnessTag({
  source,
  updated,
  reviewedBy,
  dataVintage,
  methodologyUrl = "/methodology/",
}: {
  source?: string;
  updated?: string;
  reviewedBy?: string;
  dataVintage?: string;
  methodologyUrl?: string;
}) {
  const iso = updated ?? DB_UPDATED;
  const d = new Date(iso);
  const month = d.toLocaleString("en-US", { month: "long" });
  const day = d.getDate();
  const year = d.getFullYear();

  return (
    <div className="flex items-center gap-2 text-xs text-slate-500 mt-2 mb-4 flex-wrap">
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full font-medium">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>Verified data</span>
      <span>Last updated: <time dateTime={iso}>{month} {day}, {year}</time></span>
      {reviewedBy && <>
        <span className="text-slate-300">·</span>
        <span>Data verified by: {reviewedBy}</span>
      </>}
      {dataVintage && <>
        <span className="text-slate-300">·</span>
        <span>Data vintage: {dataVintage}</span>
      </>}
      {source && <>
        <span className="text-slate-300">·</span>
        <span>Source: {source}</span>
      </>}
      <span className="text-slate-300">·</span>
      <a href={methodologyUrl} className="underline underline-offset-2 hover:text-slate-700">
        Methodology
      </a>
    </div>
  );
}
