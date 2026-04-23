/**
 * getClusterLinks — fleet-wide cross-link source
 *
 * Source of truth: _shared/components/upgrades/getClusterLinks.ts
 * DO NOT edit per-site copies — edit here and run sync-upgrades.sh.
 *
 * Purpose: every site's DecisionNext historically hard-coded sibling links.
 * That made cluster reshuffles a 38-file edit and let bad/dead links rot.
 * This module centralises the cluster graph (which sites are siblings) and
 * generates ready-to-render DecisionNextCard objects from one current-site
 * slug, so callers can do:
 *
 *     <DecisionNext cards={[
 *       ...localCards,
 *       ...getClusterLinks("propertytaxpeek", { limit: 2 }),
 *     ]} />
 *
 * The helper is server-safe (pure JS, no React imports) so it can be called
 * inside RSC page components without bumping the client bundle.
 */
import type { DecisionNextCard, DecisionNextTone } from "./DecisionNext";

export interface FleetSite {
  /** Bare domain, no protocol. */
  domain: string;
  /** Display label used in card titles. */
  label: string;
  /** One-sentence topic blurb used as the card body. */
  topic: string;
  /** Membership in topical clusters; index 0 is the primary cluster. */
  clusters: ClusterId[];
}

export type ClusterId =
  | "lexicon"
  | "affordability"
  | "housing"
  | "moveLocation"
  | "risk"
  | "household"
  | "education"
  | "tools";

export const clusterLabels: Record<ClusterId, string> = {
  lexicon: "Language & dictionaries",
  affordability: "Cost of living & income",
  housing: "Housing & property",
  moveLocation: "Where to live",
  risk: "Risk, law & safety",
  household: "Food, health & household",
  education: "Schools & education",
  tools: "Calculators & utilities",
};

/**
 * The fleet graph. Add new sites here so every other site can link to them.
 * Each site lists its clusters in priority order — the first cluster is the
 * one used for default sibling lookups.
 */
export const fleetSites: Record<string, FleetSite> = {
  // Lexicon
  vocabwize: {
    domain: "vocabwize.com",
    label: "VocabWize",
    topic: "English vocabulary, definitions, examples and rhymes.",
    clusters: ["lexicon"],
  },
  kalimawize: {
    domain: "kalimawize.com",
    label: "KalimaWize",
    topic: "Arabic vocabulary with translations and example sentences.",
    clusters: ["lexicon"],
  },
  kotobapeek: {
    domain: "kotobapeek.com",
    label: "KotobaPeek",
    topic: "Japanese vocabulary with kanji, kana and example usage.",
    clusters: ["lexicon"],
  },
  vocablibre: {
    domain: "vocablibre.com",
    label: "VocabLibre",
    topic: "French vocabulary with translations, gender and conjugation hints.",
    clusters: ["lexicon"],
  },
  dicionariowize: {
    domain: "dicionariowize.com",
    label: "DicionarioWize",
    topic: "Portuguese vocabulary with translations and usage examples.",
    clusters: ["lexicon"],
  },
  wortwize: {
    domain: "wortwize.com",
    label: "WortWize",
    topic: "German vocabulary with articles, plurals and example sentences.",
    clusters: ["lexicon"],
  },

  // Affordability / income
  salarybycity: {
    domain: "salarybycity.com",
    label: "SalaryByCity",
    topic: "Median pay by US city across hundreds of occupations.",
    clusters: ["affordability", "moveLocation"],
  },
  costbycity: {
    domain: "costbycity.com",
    label: "CostByCity",
    topic: "Cost-of-living index for US cities — housing, food, transport.",
    clusters: ["affordability", "moveLocation"],
  },
  netpaypeek: {
    domain: "netpaypeek.com",
    label: "NetPayPeek",
    topic: "Federal + state take-home pay calculator for US salaries.",
    clusters: ["affordability", "tools"],
  },
  wagepeek: {
    domain: "wagepeek.com",
    label: "WagePeek",
    topic: "Hourly wage and minimum wage data by US state and occupation.",
    clusters: ["affordability"],
  },
  fairrentwize: {
    domain: "fairrentwize.com",
    label: "FairRentWize",
    topic: "Fair rent estimates and rent-to-income ratios by US city.",
    clusters: ["affordability", "housing"],
  },
  tariffpeek: {
    domain: "tariffpeek.com",
    label: "TariffPeek",
    topic: "US import tariff and HS code lookup with duty estimates.",
    clusters: ["affordability"],
  },
  biztaxwize: {
    domain: "biztaxwize.com",
    label: "BizTaxWize",
    topic: "US small business tax obligations by state and entity type.",
    clusters: ["affordability"],
  },
  powerbillpeek: {
    domain: "powerbillpeek.com",
    label: "PowerBillPeek",
    topic: "US average electricity rates and monthly bills by ZIP code.",
    clusters: ["affordability", "household"],
  },

  // Housing
  homepricepeek: {
    domain: "homepricepeek.com",
    label: "HomePricePeek",
    topic: "US home prices by city — median, year-over-year, price per sq ft.",
    clusters: ["housing", "moveLocation"],
  },
  homeloanpeek: {
    domain: "homeloanpeek.com",
    label: "HomeLoanPeek",
    topic: "Mortgage payment calculator and US loan rates by state.",
    clusters: ["housing", "tools"],
  },
  propertytaxpeek: {
    domain: "propertytaxpeek.com",
    label: "PropertyTaxPeek",
    topic: "US property tax rates and median bills by county.",
    clusters: ["housing", "affordability"],
  },

  // Move / location decisions
  zippeek: {
    domain: "zippeek.com",
    label: "ZipPeek",
    topic: "US ZIP code profiles — demographics, income, housing, schools.",
    clusters: ["moveLocation"],
  },
  safecitypeek: {
    domain: "safecitypeek.com",
    label: "SafeCityPeek",
    topic: "Crime rates and safety scores for US cities.",
    clusters: ["moveLocation", "risk"],
  },
  guidebycity: {
    domain: "guidebycity.com",
    label: "GuideByCity",
    topic: "City overviews — what to know before moving or visiting.",
    clusters: ["moveLocation"],
  },
  eldercarepeek: {
    domain: "eldercarepeek.com",
    label: "ElderCarePeek",
    topic: "Senior living and elder-care costs by US state.",
    clusters: ["moveLocation", "household"],
  },

  // Education
  myschoolpeek: {
    domain: "myschoolpeek.com",
    label: "MySchoolPeek",
    topic: "US K-12 schools — ratings, demographics, test scores by district.",
    clusters: ["education", "moveLocation"],
  },
  degreewize: {
    domain: "degreewize.com",
    label: "DegreeWize",
    topic: "US college and degree program data — cost, outcomes, ROI.",
    clusters: ["education"],
  },

  // Risk / law / regulation
  floodriskpeek: {
    domain: "floodriskpeek.com",
    label: "FloodRiskPeek",
    topic: "FEMA flood zone and flood-insurance estimates by US ZIP.",
    clusters: ["risk", "housing"],
  },
  evictionlawpeek: {
    domain: "evictionlawpeek.com",
    label: "EvictionLawPeek",
    topic: "US eviction law summaries by state — notice, timeline, tenant rights.",
    clusters: ["risk", "housing"],
  },
  visapeek: {
    domain: "visapeek.com",
    label: "VisaPeek",
    topic: "US visa categories — eligibility, fees, processing times.",
    clusters: ["risk"],
  },
  medcheckwize: {
    domain: "medcheckwize.com",
    label: "MedCheckWize",
    topic: "Medication interaction and dosage references — informational.",
    clusters: ["risk", "household"],
  },

  // Food / health / household
  ingredipeek: {
    domain: "ingredipeek.com",
    label: "IngrediPeek",
    topic: "Food ingredient and additive profiles — what's in packaged food.",
    clusters: ["household"],
  },
  caloriewize: {
    domain: "caloriewize.com",
    label: "CalorieWize",
    topic: "Calorie and macro data for everyday foods.",
    clusters: ["household"],
  },
  shipcalcwize: {
    domain: "shipcalcwize.com",
    label: "ShipCalcWize",
    topic: "US shipping rate estimates by carrier, weight and zone.",
    clusters: ["tools", "household"],
  },
  petcostpeek: {
    domain: "petcostpeek.com",
    label: "PetCostPeek",
    topic: "Pet ownership cost estimates by breed and US state.",
    clusters: ["household", "affordability"],
  },
  medcostpeek: {
    domain: "medcostpeek.com",
    label: "MedCostPeek",
    topic: "US healthcare procedure costs by state — informational only.",
    clusters: ["household", "affordability"],
  },
  sunpowerpeek: {
    domain: "sunpowerpeek.com",
    label: "SunPowerPeek",
    topic: "Solar panel cost and payback estimates by US ZIP code.",
    clusters: ["household"],
  },
  wellwaterpeek: {
    domain: "wellwaterpeek.com",
    label: "WellWaterPeek",
    topic: "Private well water testing standards and risks by US county.",
    clusters: ["household", "risk"],
  },
  farmlandwize: {
    domain: "farmlandwize.com",
    label: "FarmlandWize",
    topic: "US farmland values and rental rates by county.",
    clusters: ["housing", "affordability"],
  },
  nameblooms: {
    domain: "nameblooms.com",
    label: "NameBlooms",
    topic: "US baby name meanings, trends and historical popularity.",
    clusters: ["household"],
  },

  // Tools
  calcpeek: {
    domain: "calcpeek.com",
    label: "CalcPeek",
    topic: "Everyday calculators — math, finance, conversion.",
    clusters: ["tools"],
  },
  datapeekfacts: {
    domain: "datapeekfacts.com",
    label: "DataPeekFacts",
    topic: "Data-driven facts and explainers across the DataPeek network.",
    clusters: ["tools"],
  },
  dmvpeek: {
    domain: "dmvpeek.com",
    label: "DMVPeek",
    topic: "DMV fees, wait times, REAL ID, and offices for every US state.",
    clusters: ["risk", "moveLocation", "tools"],
  },
  catbreedpeek: {
    domain: "catbreedpeek.com",
    label: "CatBreedPeek",
    topic: "77 cat breed profiles with health, temperament and care ratings.",
    clusters: ["household"],
  },
  vetcostpeek: {
    domain: "vetcostpeek.com",
    label: "VetCostPeek",
    topic: "Veterinary procedure costs by state — 98 procedures compared.",
    clusters: ["household", "affordability"],
  },
  funeralcostpeek: {
    domain: "funeralcostpeek.com",
    label: "FuneralCostPeek",
    topic: "Funeral and cremation costs by state — burial, casket, services.",
    clusters: ["household", "affordability"],
  },
  childcarepeek: {
    domain: "childcarepeek.com",
    label: "ChildCarePeek",
    topic: "Childcare costs by state and city — daycare, nanny, preschool.",
    clusters: ["household", "affordability"],
  },
  divorcelawpeek: {
    domain: "divorcelawpeek.com",
    label: "DivorceLawPeek",
    topic: "Divorce law guide by state — fees, custody, property division.",
    clusters: ["risk"],
  },
  lawyercostpeek: {
    domain: "lawyercostpeek.com",
    label: "LawyerCostPeek",
    topic: "Attorney fees and legal costs by state and specialty.",
    clusters: ["affordability", "risk"],
  },
  carinsurancepeek: {
    domain: "carinsurancepeek.com",
    label: "CarInsurancePeek",
    topic: "Car insurance rates by state, age, vehicle and coverage type.",
    clusters: ["affordability", "risk"],
  },
};

const defaultTones: DecisionNextTone[] = ["indigo", "emerald", "amber"];

export interface ClusterLinksOptions {
  /** Max number of cards to return (default 3). */
  limit?: number;
  /**
   * Override the cluster used for sibling lookup. Defaults to the current
   * site's primary cluster (clusters[0]).
   */
  cluster?: ClusterId;
  /**
   * Pin specific sibling slugs to the front of the result, in order. Useful
   * when a page wants its top relationship to be deterministic.
   */
  pin?: string[];
  /** Tones to cycle through. Defaults to indigo / emerald / amber. */
  tones?: DecisionNextTone[];
  /** CTA template. {label} is replaced with the sibling's label. */
  ctaTemplate?: string;
}

/**
 * Build DecisionNextCard[] for the current site's cluster siblings.
 * Returns [] if the slug is unknown so callers can spread safely.
 */
export function getClusterLinks(
  currentSite: string,
  opts: ClusterLinksOptions = {},
): DecisionNextCard[] {
  const me = fleetSites[currentSite];
  if (!me) return [];

  const cluster = opts.cluster ?? me.clusters[0];
  const tones = opts.tones ?? defaultTones;
  const limit = opts.limit ?? 3;
  const ctaTemplate = opts.ctaTemplate ?? "Open {label}";

  const ordered: string[] = [];
  const seen = new Set<string>([currentSite]);

  for (const slug of opts.pin ?? []) {
    if (seen.has(slug)) continue;
    if (!fleetSites[slug]) continue;
    ordered.push(slug);
    seen.add(slug);
  }

  for (const [slug, site] of Object.entries(fleetSites)) {
    if (seen.has(slug)) continue;
    if (!site.clusters.includes(cluster)) continue;
    ordered.push(slug);
    seen.add(slug);
  }

  return ordered.slice(0, limit).map((slug, i) => {
    const sibling = fleetSites[slug];
    return {
      title: sibling.label,
      blurb: sibling.topic,
      href: `https://${sibling.domain}/`,
      cta: ctaTemplate.replace("{label}", sibling.label),
      tone: tones[i % tones.length],
    };
  });
}

/** Lookup helper for ad-hoc rendering. */
export function getFleetSite(slug: string): FleetSite | undefined {
  return fleetSites[slug];
}
