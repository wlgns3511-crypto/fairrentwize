// RelatedSites — cluster-aware deterministic cross-network footer.
//
// Source of truth: _shared/components/RelatedSites.tsx.
// Distribute to each site's components/RelatedSites.tsx via
// _shared/scripts/sync-related-sites.sh (do not hand-edit per-site copies).
//
// Behavior:
//   • Picks 2 same-cluster siblings  → rendered without rel (dofollow)
//   • Picks 2 cross-cluster siblings → rendered with rel="nofollow noopener"
//   • Picks are deterministic per `currentSite` (FNV-1a hash seed) — every
//     request renders identical anchors, so crawlers see a stable graph and
//     SEO doesn't flap.
//   • If currentSite is unknown to the NETWORK, the component renders nothing
//     (graceful degradation).
//
// Why dofollow same-cluster + nofollow cross-cluster:
//   Topical authority flows along sibling links (e.g. caloriewize ↔ ingredipeek
//   are real adjacencies) while cross-cluster anchors stay "reference tone"
//   to avoid link-farm risk. ~240 dofollow edges across 60 sites is well below
//   any practical farm threshold.
//
// Anchor text = site display name (e.g. "IngrediPeek"). Per-site short labels
// can be layered later via a SHORT_LABEL map if needed.

type Site = { name: string; url: string; cluster: string };

const NETWORK: readonly Site[] = [
  { name: "SalaryByCity", url: "https://salarybycity.com", cluster: "Finance / Career" },
  { name: "NetPayPeek", url: "https://netpaypeek.com", cluster: "Finance / Career" },
  { name: "WagePeek", url: "https://wagepeek.com", cluster: "Finance / Career" },
  { name: "CertifyWize", url: "https://certifywize.com", cluster: "Finance / Career" },
  { name: "TaxDeductionPeek", url: "https://taxdeductionpeek.com", cluster: "Finance / Career" },
  { name: "BizTaxWize", url: "https://biztaxwize.com", cluster: "Finance / Career" },
  { name: "RebatePeek", url: "https://rebatepeek.com", cluster: "Finance / Career" },
  { name: "GrantPeek", url: "https://grantpeek.com", cluster: "Finance / Career" },
  { name: "CostByCity", url: "https://costbycity.com", cluster: "Housing / Real Estate" },
  { name: "FairRentWize", url: "https://fairrentwize.com", cluster: "Housing / Real Estate" },
  { name: "PropertyTaxPeek", url: "https://propertytaxpeek.com", cluster: "Housing / Real Estate" },
  { name: "HomePricePeek", url: "https://homepricepeek.com", cluster: "Housing / Real Estate" },
  { name: "HomeLoanPeek", url: "https://homeloanpeek.com", cluster: "Housing / Real Estate" },
  { name: "EvictionLawPeek", url: "https://evictionlawpeek.com", cluster: "Housing / Real Estate" },
  { name: "FloodRiskPeek", url: "https://floodriskpeek.com", cluster: "Housing / Real Estate" },
  { name: "FarmlandWize", url: "https://farmlandwize.com", cluster: "Housing / Real Estate" },
  { name: "WellWaterPeek", url: "https://wellwaterpeek.com", cluster: "Housing / Real Estate" },
  { name: "CalorieWize", url: "https://caloriewize.com", cluster: "Health / Care" },
  { name: "IngrediPeek", url: "https://ingredipeek.com", cluster: "Health / Care" },
  { name: "MedCheckWize", url: "https://medcheckwize.com", cluster: "Health / Care" },
  { name: "MedCostPeek", url: "https://medcostpeek.com", cluster: "Health / Care" },
  { name: "ElderCarePeek", url: "https://eldercarepeek.com", cluster: "Health / Care" },
  { name: "CareFindPeek", url: "https://carefindpeek.com", cluster: "Health / Care" },
  { name: "DrugPricePeek", url: "https://drugpricepeek.com", cluster: "Health / Care" },
  { name: "FuneralCostPeek", url: "https://funeralcostpeek.com", cluster: "Health / Care" },
  { name: "BreathePeek", url: "https://breathepeek.com", cluster: "Health / Care" },
  { name: "DegreeWize", url: "https://degreewize.com", cluster: "Education / Language" },
  { name: "MySchoolPeek", url: "https://myschoolpeek.com", cluster: "Education / Language" },
  { name: "VocabWize", url: "https://vocabwize.com", cluster: "Education / Language" },
  { name: "VocabLibre", url: "https://vocablibre.com", cluster: "Education / Language" },
  { name: "WortWize", url: "https://wortwize.com", cluster: "Education / Language" },
  { name: "KalimaWize", url: "https://kalimawize.com", cluster: "Education / Language" },
  { name: "DicionarioWize", url: "https://dicionariowize.com", cluster: "Education / Language" },
  { name: "KotobaPeek", url: "https://kotobapeek.com", cluster: "Education / Language" },
  { name: "LicenseWize", url: "https://licensewize.com", cluster: "Legal" },
  { name: "DivorceLawPeek", url: "https://divorcelawpeek.com", cluster: "Legal" },
  { name: "LawyerCostPeek", url: "https://lawyercostpeek.com", cluster: "Legal" },
  { name: "CarInsurancePeek", url: "https://carinsurancepeek.com", cluster: "Legal" },
  { name: "OSHAPeek", url: "https://oshapeek.com", cluster: "Legal" },
  { name: "PowerBillPeek", url: "https://powerbillpeek.com", cluster: "Energy / Home" },
  { name: "SunPowerPeek", url: "https://sunpowerpeek.com", cluster: "Energy / Home" },
  { name: "ShipCalcWize", url: "https://shipcalcwize.com", cluster: "Business / Travel" },
  { name: "TariffPeek", url: "https://tariffpeek.com", cluster: "Business / Travel" },
  { name: "VisaPeek", url: "https://visapeek.com", cluster: "Business / Travel" },
  { name: "DMVPeek", url: "https://dmvpeek.com", cluster: "Business / Travel" },
  { name: "PetCostPeek", url: "https://petcostpeek.com", cluster: "Pets / Nature" },
  { name: "VetCostPeek", url: "https://vetcostpeek.com", cluster: "Pets / Nature" },
  { name: "DogBreedPeek", url: "https://dogbreedpeek.com", cluster: "Pets / Nature" },
  { name: "CatBreedPeek", url: "https://catbreedpeek.com", cluster: "Pets / Nature" },
  { name: "FishSpecPeek", url: "https://fishspecpeek.com", cluster: "Pets / Nature" },
  { name: "FloraWize", url: "https://florawize.com", cluster: "Pets / Nature" },
  { name: "NameBlooms", url: "https://nameblooms.com", cluster: "Parenting / Family" },
  { name: "ChildCarePeek", url: "https://childcarepeek.com", cluster: "Parenting / Family" },
  { name: "SafeCityPeek", url: "https://safecitypeek.com", cluster: "Safety / Lifestyle" },
  { name: "EarthquakePeek", url: "https://earthquakepeek.com", cluster: "Safety / Lifestyle" },
  { name: "HikeWize", url: "https://hikewize.com", cluster: "Safety / Lifestyle" },
  { name: "DreamWize", url: "https://dreamwize.com", cluster: "Safety / Lifestyle" },
  { name: "ZipPeek", url: "https://zippeek.com", cluster: "Geography / Reference" },
  { name: "GuideByCity", url: "https://guidebycity.com", cluster: "Geography / Reference" },
  { name: "CalcPeek", url: "https://calcpeek.com", cluster: "Geography / Reference" },
  { name: "DataPeekFacts", url: "https://datapeekfacts.com", cluster: "Geography / Reference" },
] as const;

// FNV-1a 32-bit — stable across builds, no Math.random.
function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

// Deterministic Fisher-Yates using a Mulberry32-style PRNG seeded from `seed`.
function pseudoShuffle<T>(arr: readonly T[], seed: number): T[] {
  const out = arr.slice();
  let s = seed >>> 0;
  for (let i = out.length - 1; i > 0; i--) {
    // mulberry32 step
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1) >>> 0;
    t = (t + Math.imul(t ^ (t >>> 7), t | 61)) >>> 0;
    const r = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    const j = Math.floor(r * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function normalizeKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findSelf(currentSite: string): Site | undefined {
  const key = normalizeKey(currentSite);
  return NETWORK.find((s) => normalizeKey(s.name) === key);
}

export type RelatedSitesProps = {
  /** Display name of the current site (e.g. "CalorieWize"). Must match a NETWORK entry. */
  currentSite: string;
  /** Tailwind hover class for accent color, e.g. "hover:text-orange-600". */
  accentClass: string;
  /** Optional section label. Default "Related Data Tools". */
  label?: string;
  /** Override anchor count per group (default 2 + 2). */
  sameCount?: number;
  crossCount?: number;
};

export function RelatedSites({
  currentSite,
  accentClass,
  label = "Related Data Tools",
  sameCount = 2,
  crossCount = 2,
}: RelatedSitesProps) {
  const self = findSelf(currentSite);
  if (!self) return null;

  const seed = hashString(self.name);

  const sameClusterPool = NETWORK.filter(
    (s) => s.cluster === self.cluster && s.name !== self.name,
  );
  const crossClusterPool = NETWORK.filter(
    (s) => s.cluster !== self.cluster && s.name !== self.name,
  );

  // Different seeds for the two groups so the same site's same-cluster pick
  // doesn't bias which cross-cluster picks appear.
  const sameP = pseudoShuffle(sameClusterPool, seed).slice(0, sameCount);
  const crossP = pseudoShuffle(crossClusterPool, seed ^ 0xdeadbeef).slice(0, crossCount);

  if (sameP.length === 0 && crossP.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-slate-100">
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">{label}</p>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
        {sameP.map((s) => (
          <a
            key={s.name}
            href={s.url}
            className={accentClass}
            target="_blank"
            rel="noopener"
          >
            {s.name}
          </a>
        ))}
        {crossP.map((s) => (
          <a
            key={s.name}
            href={s.url}
            className={accentClass}
            target="_blank"
            rel="nofollow noopener"
          >
            {s.name}
          </a>
        ))}
      </div>
    </div>
  );
}

export default RelatedSites;
