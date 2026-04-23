/**
 * TableOfContents -- auto-detecting sticky TOC for data pages
 *
 * Source of truth: _shared/components/upgrades/TableOfContents.tsx
 * DO NOT edit the copy inside each site -- edit here and run sync-upgrades.sh.
 *
 * How it works:
 * 1. On mount, scans the nearest article/main ancestor for h2 elements
 * 2. Auto-assigns slug IDs to headings that lack them
 * 3. Renders a compact jump-link nav
 * 4. Tracks scroll position to highlight the active section
 *
 * Drop-in usage: just add <TableOfContents /> anywhere in your page.
 * No need to manually list sections or add IDs to headings.
 */

"use client";

import { useEffect, useState, useRef } from "react";

interface TocEntry {
  id: string;
  text: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export function TableOfContents() {
  const [entries, setEntries] = useState<TocEntry[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Find all h2 elements in the page content
    const container =
      document.querySelector("[data-toc-root]") ||
      document.querySelector("article") ||
      document.querySelector("main") ||
      document.body;

    const headings = Array.from(container.querySelectorAll("h2"));

    // Filter out headings inside nav, aside, footer, or upgrade blocks
    const filtered = headings.filter((h) => {
      const parent = h.closest("nav, aside, footer, [data-upgrade]");
      return !parent;
    });

    if (filtered.length < 3) {
      // Not enough sections to warrant a TOC
      setEntries([]);
      return;
    }

    const items: TocEntry[] = filtered.map((h, i) => {
      if (!h.id) {
        h.id = slugify(h.textContent || "") || `section-${i}`;
      }
      return { id: h.id, text: (h.textContent || "").trim() };
    });

    setEntries(items);

    // Scroll spy with IntersectionObserver
    const observer = new IntersectionObserver(
      (obs) => {
        for (const entry of obs) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    filtered.forEach((h) => observer.observe(h));

    return () => observer.disconnect();
  }, []);

  if (entries.length === 0) return null;

  return (
    <nav
      ref={navRef}
      data-upgrade="table-of-contents"
      aria-label="Table of contents"
      className="not-prose my-6 rounded-xl border border-slate-200 bg-white/80 p-4"
    >
      <p className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">
        <svg
          aria-hidden="true"
          className="h-3.5 w-3.5 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
          />
        </svg>
        On this page
      </p>
      <ol className="space-y-1">
        {entries.map((e) => (
          <li key={e.id}>
            <a
              href={`#${e.id}`}
              onClick={(ev) => {
                ev.preventDefault();
                document.getElementById(e.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={`block rounded-md px-2.5 py-1 text-sm transition-colors ${
                activeId === e.id
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {e.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
