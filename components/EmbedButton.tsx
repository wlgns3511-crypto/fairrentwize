"use client";
import { useState } from "react";

interface Props {
  url: string;
  title: string;
  site: string;
  siteUrl: string;
}

export function EmbedButton({ url, title, site, siteUrl }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const embedCode = `<iframe src="${url}" width="100%" height="400" style="border:1px solid #e2e8f0;border-radius:8px" title="${title}" loading="lazy"></iframe>
<p style="font-size:12px;color:#64748b;margin-top:4px">Data by <a href="${siteUrl}" target="_blank" rel="noopener">${site}</a></p>`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 border border-slate-200 rounded-md hover:bg-slate-50 hover:text-slate-700 transition-colors cursor-pointer"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        Embed this data
      </button>
    );
  }

  return (
    <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-700">Embed Code</span>
        <button onClick={() => setOpen(false)} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">Close</button>
      </div>
      <pre className="text-xs bg-white p-3 rounded border border-slate-200 overflow-x-auto whitespace-pre-wrap break-all text-slate-600">{embedCode}</pre>
      <button
        onClick={handleCopy}
        className="mt-2 px-3 py-1.5 text-xs font-medium bg-slate-900 text-white rounded-md hover:bg-slate-700 transition-colors cursor-pointer"
      >
        {copied ? "Copied!" : "Copy to clipboard"}
      </button>
    </div>
  );
}
