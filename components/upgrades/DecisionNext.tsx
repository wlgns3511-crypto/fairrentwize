/**
 * DecisionNext — "What should I check next?" — 3 opinionated follow-up cards
 *
 * Source of truth: _shared/components/upgrades/DecisionNext.tsx
 * DO NOT edit the copy inside each site — edit here and run sync-upgrades.sh.
 *
 * Goal: solve the 2nd-click problem. Current fleet has pages/session around
 * 1.0-1.3 — we want opinionated next destinations (not random related links)
 * so users take a deliberate second action.
 *
 * Caller supplies up to 3 cards with href/tone. Keep copy tight and outcome-
 * oriented (don't say "Learn more", say "See comparison" or "View rhymes").
 */

export type DecisionNextTone = "indigo" | "emerald" | "amber";

export interface DecisionNextCard {
  title: string;
  blurb: string;
  href: string;
  cta: string;
  tone?: DecisionNextTone;
}

export interface DecisionNextProps {
  cards: DecisionNextCard[];
  /** Section heading — override per site for voice consistency */
  heading?: string;
}

const toneClasses: Record<DecisionNextTone, string> = {
  indigo: "border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/60",
  emerald: "border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/60",
  amber: "border-amber-200 hover:border-amber-400 hover:bg-amber-50/60",
};

const ctaTone: Record<DecisionNextTone, string> = {
  indigo: "text-indigo-700",
  emerald: "text-emerald-700",
  amber: "text-amber-700",
};

export function DecisionNext({ cards, heading = "Next, check\u2026" }: DecisionNextProps) {
  if (!cards.length) return null;
  const picks = cards.slice(0, 3);
  return (
    <section
      data-upgrade="decision-next"
      aria-label="What to check next"
      className="mb-8"
    >
      <h2 className="text-xl font-bold mb-3">{heading}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {picks.map((c) => {
          const tone = c.tone || "indigo";
          return (
            <a
              key={c.href}
              href={c.href}
              data-upgrade="decision-next"
              data-upgrade-action="card-click"
              data-upgrade-tone={tone}
              className={`block rounded-xl border bg-white p-4 transition-colors ${toneClasses[tone]}`}
            >
              <h3 className="text-sm font-semibold text-slate-900 mb-1">{c.title}</h3>
              <p className="text-xs text-slate-600 leading-snug">{c.blurb}</p>
              <p className={`mt-3 text-xs font-medium ${ctaTone[tone]}`}>
                {c.cta} &rarr;
              </p>
            </a>
          );
        })}
      </div>
    </section>
  );
}
