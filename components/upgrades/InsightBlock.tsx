/**
 * InsightBlock — contextual data interpretation strip
 *
 * Source of truth: _shared/components/upgrades/InsightBlock.tsx
 * DO NOT edit the copy inside each site — edit here and run sync-upgrades.sh.
 *
 * Purpose: Transform raw numbers into human-readable conclusions.
 * Each site provides its own insight strings via lib/insights.ts;
 * this component only handles presentation.
 *
 * Google loves this pattern — structured interpretive text improves
 * dwell time, featured snippet eligibility, and E-E-A-T perception.
 */

export interface Insight {
  /** The interpretive sentence, e.g. "Austin's median income is 12% above the national average." */
  text: string;
  /** Sentiment hint for visual styling */
  sentiment?: "positive" | "negative" | "neutral";
}

export interface InsightBlockProps {
  /** Entity being described — city, ZIP, word, breed, etc. */
  entityName: string;
  /** Array of insight sentences to display */
  insights: Insight[];
  /** Optional heading override — defaults to "Key Takeaways" */
  heading?: string;
}

export function InsightBlock({
  entityName,
  insights,
  heading = "Key Takeaways",
}: InsightBlockProps) {
  if (!insights || insights.length === 0) return null;

  return (
    <section
      data-upgrade="insight-block"
      aria-label={`${heading} for ${entityName}`}
      className="not-prose my-8 rounded-xl border border-blue-100 bg-blue-50/40 p-5"
    >
      <h3 className="flex items-center gap-2 text-sm font-bold text-blue-900 mb-3">
        <svg
          aria-hidden="true"
          className="h-4 w-4 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
          />
        </svg>
        {heading}
      </h3>
      <ul className="space-y-2">
        {insights.map((insight, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
            <span
              aria-hidden="true"
              className={`mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                insight.sentiment === "positive"
                  ? "bg-emerald-500"
                  : insight.sentiment === "negative"
                  ? "bg-amber-500"
                  : "bg-blue-400"
              }`}
            />
            <span>{insight.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
