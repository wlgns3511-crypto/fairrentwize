const SITES = [
  { name: "VocabWize", url: "https://vocabwize.com", cat: "Language" },
  { name: "VocabLibre", url: "https://vocablibre.com", cat: "Language" },
  { name: "DicionarioWize", url: "https://dicionariowize.com", cat: "Language" },
  { name: "WortWize", url: "https://wortwize.com", cat: "Language" },
  { name: "KalimaWize", url: "https://kalimawize.com", cat: "Language" },
  { name: "KotobaPeek", url: "https://kotobapeek.com", cat: "Language" },
  { name: "BabyNamely", url: "https://babynamely.com", cat: "Language" },
  { name: "WagePeak", url: "https://wagepeak.com", cat: "Finance" },
  { name: "NetPayPeek", url: "https://netpaypeek.com", cat: "Finance" },
  { name: "CostOfLiving", url: "https://costoflivingpeek.com", cat: "Finance" },
  { name: "FairRentWize", url: "https://fairrentwize.com", cat: "Finance" },
  { name: "PropertyTaxPeek", url: "https://propertytaxpeek.com", cat: "Finance" },
  { name: "CollegeData", url: "https://collegedatapeek.com", cat: "Education" },
  { name: "MySchoolPeek", url: "https://myschoolpeek.com", cat: "Education" },
  { name: "MedCheckWize", url: "https://medcheckwize.com", cat: "Health" },
  { name: "MedCostPeek", url: "https://medcostpeek.com", cat: "Health" },
  { name: "ElderCarePeek", url: "https://eldercarepeek.com", cat: "Health" },
  { name: "IngredIPeek", url: "https://ingredipeek.com", cat: "Health" },
  { name: "FoodData", url: "https://fooddatapeek.com", cat: "Health" },
  { name: "PowerBillPeek", url: "https://powerbillpeek.com", cat: "Utilities" },
  { name: "SunPowerPeek", url: "https://sunpowerpeek.com", cat: "Utilities" },
  { name: "ShipCalcWize", url: "https://shipcalcwize.com", cat: "Tools" },
  { name: "TariffPeek", url: "https://tariffpeek.com", cat: "Tools" },
  { name: "VisaPeek", url: "https://visapeek.com", cat: "Travel" },
  { name: "CityGuide", url: "https://cityguidefacts.com", cat: "Travel" },
  { name: "ZipPeek", url: "https://zippeek.com", cat: "Travel" },
  { name: "SalaryData", url: "https://salarydatapeek.com", cat: "Finance" },
  { name: "DataPeekFacts", url: "https://datapeekfacts.com", cat: "Hub" },
];

export function CrossSiteLinks({ current }: { current: string }) {
  const others = SITES.filter((s) => s.name !== current);
  const sameCat = others.filter((s) => s.cat === SITES.find((x) => x.name === current)?.cat);
  const display = [...sameCat, ...others.filter((s) => !sameCat.includes(s))].slice(0, 10);

  return (
    <div className="mt-10 pt-6 border-t border-slate-100">
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Explore the DataPeek Network</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {display.map((s) => (
          <a key={s.name} href={s.url} className="text-xs text-slate-500 hover:text-blue-600 transition-colors">
            {s.name}
          </a>
        ))}
      </div>
    </div>
  );
}
