"use client";
import { useState } from "react";

interface CiteProps {
  title: string;
  url: string;
  source: string;
  accessDate?: string;
}

export function CiteButton({ title, url, source, accessDate }: CiteProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState("");
  const date = accessDate || new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const year = new Date().getFullYear();

  const apa = `${source}. (${year}). ${title}. Retrieved ${date}, from ${url}`;
  const mla = `"${title}." ${source}, ${year}, ${url}. Accessed ${date}.`;

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
      >
        <span>📋</span> Cite this data
      </button>
      {open && (
        <div className="absolute bottom-8 left-0 z-50 w-80 bg-white border border-slate-200 rounded-lg shadow-lg p-4 text-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-slate-700">Citation</span>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-slate-600">APA</span>
              <button onClick={() => copy(apa, "apa")} className="text-blue-600 hover:underline">
                {copied === "apa" ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-slate-500 bg-slate-50 p-2 rounded text-[11px] leading-relaxed break-all">{apa}</p>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-slate-600">MLA</span>
              <button onClick={() => copy(mla, "mla")} className="text-blue-600 hover:underline">
                {copied === "mla" ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-slate-500 bg-slate-50 p-2 rounded text-[11px] leading-relaxed break-all">{mla}</p>
          </div>
        </div>
      )}
    </div>
  );
}
