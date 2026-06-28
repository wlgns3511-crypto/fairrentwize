/**
 * components/upgrades/CrosswalkBridge.tsx — Phase 7 P5 internal cross-walk
 * linking for fairrentwize entity pages (county-FIPS / state / metro join
 * cohort per playbook §8.3).
 *
 * Renders a fold-1 aside on state/county/metro pages with contextual links to
 * sibling sites that share the same county-FIPS or state join key. Distinct
 * from the deterministic footer CrossSiteLinks (cluster-aware random pick) —
 * this block is editorially-ordered, dimension-specific, and references each
 * site's analytical angle on the same federal entity.
 *
 * Footprint controls (Trap #118):
 *   • Anchor text is full site name + dimension noun, not keyword-stuffed.
 *   • rel="external" — natural outbound, no nofollow / sponsored.
 *   • Order is deterministic per entity slug (FNV-1a seed) so cross-site
 *     footprint does not duplicate exact ordering across hosts.
 *   • Cap at 4 links per page (playbook §8.2).
 */

interface CrosswalkBridgeProps {
  entityName: string;
  entitySlug: string;
  entityKind: 'state' | 'county' | 'metro';
}

interface JoinSite {
  name: string;
  baseUrl: string;
  dimension: string;
  blurb: string;
  /** path template using {slug} placeholder; entity slug substitutes in. */
  pathTemplate: Record<'state' | 'county' | 'metro', string | null>;
}

/**
 * County-FIPS join cohort per playbook §8.3. Each site is reachable by
 * county slug; some also accept state or metro slugs (see pathTemplate).
 */
const RENT_JOIN_SITES: ReadonlyArray<JoinSite> = [
  {
    name: 'PropertyTaxPeek',
    baseUrl: 'https://propertytaxpeek.com',
    dimension: 'property tax burden',
    blurb: 'Census ACS B25103 effective property tax rate on the same county',
    pathTemplate: {
      state: '/state/{slug}/',
      county: '/county/{slug}/',
      metro: null,
    },
  },
  {
    name: 'HomePricePeek',
    baseUrl: 'https://homepricepeek.com',
    dimension: 'home price',
    blurb: 'Zillow ZHVI + Census ACS B25077 median home value, same county',
    pathTemplate: {
      state: '/state/{slug}/',
      county: '/county/{slug}/',
      metro: '/metro/{slug}/',
    },
  },
  {
    name: 'SafeCityPeek',
    baseUrl: 'https://safecitypeek.com',
    dimension: 'crime rate',
    blurb: 'FBI UCR + NIBRS index crime rate on the same county',
    pathTemplate: {
      state: '/state/{slug}/',
      county: '/county/{slug}/',
      metro: null,
    },
  },
  {
    name: 'MySchoolPeek',
    baseUrl: 'https://myschoolpeek.com',
    dimension: 'school district quality',
    blurb: 'NCES + state DOE district performance, same county footprint',
    pathTemplate: {
      state: '/state/{slug}/',
      county: '/county/{slug}/',
      metro: null,
    },
  },
  {
    name: 'FloodRiskPeek',
    baseUrl: 'https://floodriskpeek.com',
    dimension: 'flood risk',
    blurb: 'FEMA NFHL + NFIP policy density on the same county',
    pathTemplate: {
      state: '/state/{slug}/',
      county: '/county/{slug}/',
      metro: null,
    },
  },
];

function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function deterministicPick(entitySlug: string, kind: 'state' | 'county' | 'metro', count: number): JoinSite[] {
  const eligible = RENT_JOIN_SITES.filter((s) => s.pathTemplate[kind] !== null);
  const seed = fnv1a(entitySlug);
  const pool = eligible.slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const s = (seed + i * 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1) >>> 0;
    t = (t + Math.imul(t ^ (t >>> 7), t | 61)) >>> 0;
    const r = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    const j = Math.floor(r * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

export function CrosswalkBridge({ entityName, entitySlug, entityKind }: CrosswalkBridgeProps) {
  const picks = deterministicPick(entitySlug, entityKind, 4);
  if (picks.length === 0) return null;

  const cohortLabel =
    entityKind === 'metro'
      ? 'the same metro footprint'
      : entityKind === 'state'
        ? 'the same state'
        : 'the same county-FIPS footprint';

  return (
    <aside className="my-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-2">
        {entityName} on other public-data dimensions
      </p>
      <ul className="space-y-1 text-sm">
        {picks.map((s) => {
          const template = s.pathTemplate[entityKind];
          if (!template) return null;
          const href = `${s.baseUrl}${template.replace('{slug}', entitySlug)}`;
          return (
            <li key={s.name}>
              <a
                href={href}
                rel="external"
                className="text-indigo-700 hover:underline font-medium"
              >
                {s.name}: {s.dimension} →
              </a>
              <span className="text-slate-500 text-xs ml-2">{s.blurb}</span>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-xs text-slate-500">
        Sibling public-data tools share {cohortLabel} as the join key — each
        answers a different dimension question on the same federal entity.
      </p>
    </aside>
  );
}
