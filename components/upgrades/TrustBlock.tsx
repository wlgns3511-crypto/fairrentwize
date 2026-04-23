/**
 * TrustBlock — consolidated credibility strip
 *
 * Source of truth: _shared/components/upgrades/TrustBlock.tsx
 * DO NOT edit the copy inside each site — edit here and run sync-upgrades.sh.
 *
 * Goal: answer "can I trust this?" in one compact unit. Sources + last
 * updated + methodology link. For YMYL sites (money, health, safety, legal)
 * this block is load-bearing for E-E-A-T.
 *
 * NO fake "reviewed by" badges. If a site adds a reviewer in future, it
 * should come as structured data backed by a real person.
 */

export interface TrustBlockSource {
  name: string;
  url: string;
}

export interface TrustBlockProps {
  sources: TrustBlockSource[];
  /** Human-readable update string — e.g. "March 2026" or "Updated 2 days ago" */
  updated: string;
  /** Visible reviewer label for honest trust messaging */
  reviewedBy?: string;
  /** Methodology page URL — defaults to /methodology (standard across fleet) */
  methodologyUrl?: string;
  /** Optional label override — e.g. "Freshness" / "Data provenance" */
  label?: string;
}

export function TrustBlock({
  sources,
  updated,
  reviewedBy,
  methodologyUrl = "/methodology",
  label = "Verified",
}: TrustBlockProps) {
  return (
    <section
      data-upgrade="trust-block"
      aria-label="Data sources and freshness"
      className="mb-8 rounded-xl border border-emerald-100 bg-emerald-50/40 p-4"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"
          />
          <span className="font-semibold text-emerald-800 uppercase tracking-wide">
            {label}
          </span>
        </div>
        <span className="text-slate-600">
          <span className="font-medium text-slate-700">Sources:</span>{" "}
          {sources.map((s, i) => (
            <span key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                data-upgrade="trust-block"
                data-upgrade-action="source-click"
                className="text-emerald-700 hover:underline"
              >
                {s.name}
              </a>
              {i < sources.length - 1 && ", "}
            </span>
          ))}
        </span>
        <span className="text-slate-600">
          <span className="font-medium text-slate-700">Updated:</span> {updated}
        </span>
        {reviewedBy && (
          <span className="text-slate-600">
            <span className="font-medium text-slate-700">Reviewed by:</span> {reviewedBy}
          </span>
        )}
        <a
          href={methodologyUrl}
          data-upgrade="trust-block"
          data-upgrade-action="methodology-click"
          className="text-emerald-700 hover:underline font-medium"
        >
          How we compile &rarr;
        </a>
      </div>
    </section>
  );
}
