/**
 * AnswerHero — 3-second answer at top of any detail page
 *
 * Source of truth: _shared/components/upgrades/AnswerHero.tsx
 * DO NOT edit the copy inside each site — edit here and run sync-upgrades.sh.
 *
 * Goal: if user lands from SERP, they see the answer within 3 seconds:
 *   title, one-line tagline, badges (POS/level/unit), near alternatives.
 *
 * Generic by design — works for words, cities, ZIPs, ingredients, whatever.
 */

export interface AnswerHeroBadge {
  label: string;
  tone?: "indigo" | "slate" | "emerald" | "amber";
}

export interface AnswerHeroAlternative {
  label: string;
  href: string;
  sublabel?: string;
}

export interface AnswerHeroProps {
  /** Main entity title (e.g. word, city name, ingredient) */
  title: string;
  /** Optional subtitle rendered in monospace (phonetic, coordinates, ID) */
  subtitle?: string | null;
  /** One-line answer — the thing the user came here for */
  tagline: string;
  /** Small badges shown inline with the title (POS, level, unit, etc.) */
  badges?: AnswerHeroBadge[];
  /** Near-alternative entities for disambiguation — max 3 shown */
  alternatives?: AnswerHeroAlternative[];
  /** Heading for the alternatives group — defaults to "Did you mean?" */
  alternativesLabel?: string;
}

const badgeTones: Record<NonNullable<AnswerHeroBadge["tone"]>, string> = {
  indigo: "text-indigo-700 bg-indigo-100",
  slate: "text-slate-600 bg-slate-100",
  emerald: "text-emerald-700 bg-emerald-100",
  amber: "text-amber-700 bg-amber-100",
};

export function AnswerHero({
  title,
  subtitle,
  tagline,
  badges = [],
  alternatives = [],
  alternativesLabel = "Did you mean?",
}: AnswerHeroProps) {
  const shortTagline =
    tagline.length > 160 ? tagline.substring(0, 157) + "..." : tagline;
  const picks = alternatives.slice(0, 3);

  return (
    <section
      data-upgrade="answer-hero"
      aria-label="Quick answer"
      className="mb-6 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-slate-50 p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">{title}</h1>
        {subtitle && (
          <span className="text-base text-slate-500 font-mono">{subtitle}</span>
        )}
        {badges.map((b, i) => (
          <span
            key={`${b.label}-${i}`}
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              badgeTones[b.tone || "slate"]
            }`}
          >
            {b.label}
          </span>
        ))}
      </div>
      <p className="mt-2 text-base text-slate-700 leading-relaxed">{shortTagline}</p>

      {picks.length > 0 && (
        <div className="mt-4 pt-3 border-t border-indigo-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
            {alternativesLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {picks.map((alt) => (
              <a
                key={alt.href}
                href={alt.href}
                data-upgrade="answer-hero"
                data-upgrade-action="alternative-click"
                className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors"
              >
                <span className="font-medium">{alt.label}</span>
                {alt.sublabel && (
                  <span className="text-xs text-slate-400">· {alt.sublabel}</span>
                )}
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
