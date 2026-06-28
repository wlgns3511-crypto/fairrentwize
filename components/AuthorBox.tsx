import { getDataVintageLabel } from "@/lib/db-page";
import {
  EDITORIAL_TEAM,
  PUBLISHER,
  ENTITY_VINTAGE,
  SOURCE_AUTHORITY_LINES,
  REVIEWER_DISCLAIMER,
} from "@/lib/authorship";

interface AuthorBoxProps {
  /** ISO date string the page is anchored to (entity, methodology, about, blog updatedAt, etc.). Defaults to ENTITY_VINTAGE. */
  vintage?: string;
  /** Short, page-specific source line shown beneath the citation list. Optional. */
  source?: string;
}

export function AuthorBox({ vintage = ENTITY_VINTAGE, source }: AuthorBoxProps = {}) {
  const dataVintage = getDataVintageLabel();

  return (
    <div className="mt-10 p-5 bg-slate-50 border border-slate-200 rounded-xl">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <polyline points="9 12 11 14 15 10"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-slate-900 text-sm">
            Reviewed by {EDITORIAL_TEAM.name}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            Part of the <a href={PUBLISHER.url} className="text-slate-700 hover:underline" rel="noopener">{PUBLISHER.name}</a>
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-600 leading-relaxed mb-3">
        Rent estimates on this page draw on three primary public datasets, audited by the editorial team against the cited primary sources before publication:
      </p>
      <ul className="text-xs text-slate-600 leading-relaxed mb-3 list-disc pl-5 space-y-1">
        {SOURCE_AUTHORITY_LINES.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      {source ? (
        <p className="text-xs text-slate-600 leading-relaxed mb-3">
          <span className="font-medium text-slate-700">This page:</span> {source}
        </p>
      ) : null}
      <p className="text-[11px] text-slate-500 leading-relaxed mb-3 italic">
        {REVIEWER_DISCLAIMER}
      </p>
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span>Last reviewed: <time dateTime={vintage}>{vintage}</time></span>
        <span className="text-slate-300">·</span>
        <span>Data vintage: {dataVintage}</span>
        <span className="text-slate-300">·</span>
        <a href="https://datapeekfacts.com/editorial-policy/" className="underline underline-offset-2 hover:text-slate-900" rel="noopener">Editorial policy</a>
        <span className="text-slate-300">·</span>
        <a href="/methodology/" className="underline underline-offset-2 hover:text-slate-900">Methodology</a>
        <span className="text-slate-300">·</span>
        <a href="/contact/" className="underline underline-offset-2 hover:text-slate-900">Send a correction</a>
      </div>
    </div>
  );
}
