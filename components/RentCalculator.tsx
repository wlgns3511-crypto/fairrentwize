"use client";

import { useState } from "react";

const STATES_DATA: Record<string, { name: string; fmr: number[] }> = {
  AL: { name: "Alabama", fmr: [530, 630, 780, 1030, 1130] },
  AK: { name: "Alaska", fmr: [750, 870, 1050, 1370, 1550] },
  AZ: { name: "Arizona", fmr: [680, 800, 980, 1280, 1450] },
  AR: { name: "Arkansas", fmr: [470, 560, 700, 920, 1020] },
  CA: { name: "California", fmr: [1150, 1380, 1650, 2100, 2400] },
  CO: { name: "Colorado", fmr: [830, 980, 1180, 1530, 1730] },
  CT: { name: "Connecticut", fmr: [880, 1020, 1230, 1580, 1800] },
  DE: { name: "Delaware", fmr: [700, 820, 990, 1280, 1450] },
  FL: { name: "Florida", fmr: [780, 920, 1100, 1430, 1620] },
  GA: { name: "Georgia", fmr: [650, 770, 930, 1210, 1370] },
  HI: { name: "Hawaii", fmr: [1200, 1430, 1720, 2200, 2500] },
  ID: { name: "Idaho", fmr: [650, 770, 930, 1210, 1370] },
  IL: { name: "Illinois", fmr: [730, 860, 1040, 1350, 1530] },
  IN: { name: "Indiana", fmr: [560, 660, 800, 1040, 1180] },
  IA: { name: "Iowa", fmr: [510, 610, 740, 960, 1090] },
  KS: { name: "Kansas", fmr: [510, 610, 740, 960, 1090] },
  KY: { name: "Kentucky", fmr: [510, 610, 740, 960, 1090] },
  LA: { name: "Louisiana", fmr: [560, 660, 800, 1040, 1180] },
  ME: { name: "Maine", fmr: [680, 800, 970, 1260, 1430] },
  MD: { name: "Maryland", fmr: [870, 1020, 1230, 1600, 1810] },
  MA: { name: "Massachusetts", fmr: [1020, 1200, 1440, 1870, 2120] },
  MI: { name: "Michigan", fmr: [580, 690, 840, 1090, 1230] },
  MN: { name: "Minnesota", fmr: [680, 800, 970, 1260, 1430] },
  MS: { name: "Mississippi", fmr: [460, 540, 660, 860, 970] },
  MO: { name: "Missouri", fmr: [560, 660, 800, 1040, 1180] },
  MT: { name: "Montana", fmr: [650, 770, 930, 1210, 1370] },
  NE: { name: "Nebraska", fmr: [560, 660, 800, 1040, 1180] },
  NV: { name: "Nevada", fmr: [730, 860, 1040, 1350, 1530] },
  NH: { name: "New Hampshire", fmr: [800, 940, 1130, 1470, 1660] },
  NJ: { name: "New Jersey", fmr: [930, 1090, 1310, 1700, 1930] },
  NM: { name: "New Mexico", fmr: [580, 690, 840, 1090, 1230] },
  NY: { name: "New York", fmr: [1050, 1230, 1480, 1920, 2180] },
  NC: { name: "North Carolina", fmr: [620, 730, 890, 1150, 1310] },
  ND: { name: "North Dakota", fmr: [560, 660, 800, 1040, 1180] },
  OH: { name: "Ohio", fmr: [550, 650, 790, 1020, 1160] },
  OK: { name: "Oklahoma", fmr: [490, 580, 710, 920, 1040] },
  OR: { name: "Oregon", fmr: [800, 940, 1130, 1470, 1660] },
  PA: { name: "Pennsylvania", fmr: [650, 770, 930, 1210, 1370] },
  RI: { name: "Rhode Island", fmr: [800, 940, 1130, 1470, 1660] },
  SC: { name: "South Carolina", fmr: [590, 700, 850, 1100, 1250] },
  SD: { name: "South Dakota", fmr: [510, 610, 740, 960, 1090] },
  TN: { name: "Tennessee", fmr: [590, 700, 850, 1100, 1250] },
  TX: { name: "Texas", fmr: [620, 730, 890, 1150, 1310] },
  UT: { name: "Utah", fmr: [680, 800, 970, 1260, 1430] },
  VT: { name: "Vermont", fmr: [760, 890, 1080, 1400, 1590] },
  VA: { name: "Virginia", fmr: [760, 890, 1080, 1400, 1590] },
  WA: { name: "Washington", fmr: [900, 1060, 1280, 1660, 1880] },
  WV: { name: "West Virginia", fmr: [440, 520, 640, 830, 940] },
  WI: { name: "Wisconsin", fmr: [590, 700, 850, 1100, 1250] },
  WY: { name: "Wyoming", fmr: [580, 690, 840, 1090, 1230] },
};

const BEDROOM_LABELS = ["Studio", "1 Bedroom", "2 Bedroom", "3 Bedroom", "4 Bedroom"];
const UTILITY_COSTS = [80, 100, 130, 160, 190];

export default function RentCalculator() {
  const [income, setIncome] = useState("");
  const [state, setState] = useState("CA");
  const [bedroom, setBedroom] = useState(2);
  const [includeUtilities, setIncludeUtilities] = useState(false);
  const [result, setResult] = useState<{
    fmr: number;
    affordable: number;
    gap: number;
    burden: number;
    totalCost: number;
  } | null>(null);

  const calculate = () => {
    const annualIncome = parseFloat(income);
    if (!annualIncome || annualIncome <= 0) return;

    const stateData = STATES_DATA[state];
    const fmr = stateData.fmr[bedroom];
    const utilityCost = includeUtilities ? UTILITY_COSTS[bedroom] : 0;
    const totalCost = fmr + utilityCost;
    const affordable = Math.round(annualIncome * 0.3 / 12);
    const gap = totalCost - affordable;
    const burden = (totalCost * 12 / annualIncome) * 100;

    setResult({ fmr, affordable, gap, totalCost, burden });
  };

  const fmt = (n: number) => "$" + n.toLocaleString("en-US");

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-indigo-200 rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-indigo-900 mb-4">Rent Affordability Calculator</h2>

        <div className="space-y-4">
          {/* Income */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Annual Household Income ($)</label>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder="e.g. 55000"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {Object.entries(STATES_DATA)
                .sort(([, a], [, b]) => a.name.localeCompare(b.name))
                .map(([abbr, s]) => (
                  <option key={abbr} value={abbr}>{s.name}</option>
                ))}
            </select>
          </div>

          {/* Bedroom Size */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bedroom Size</label>
            <div className="flex flex-wrap gap-2">
              {BEDROOM_LABELS.map((label, i) => (
                <button
                  key={i}
                  onClick={() => setBedroom(i)}
                  className={`px-3 py-1.5 text-sm rounded-full border ${bedroom === i ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-300 hover:border-indigo-400'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Include Utilities */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIncludeUtilities(!includeUtilities)}
              className={`w-10 h-5 rounded-full transition-colors ${includeUtilities ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transform transition-transform mx-0.5 ${includeUtilities ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
            <span className="text-sm text-slate-700">Include estimated utilities (+{fmt(UTILITY_COSTS[bedroom])}/mo)</span>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculate}
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Calculate Affordability
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 uppercase">Fair Market Rent</p>
                <p className="text-2xl font-bold text-indigo-700">{fmt(result.fmr)}/mo</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 uppercase">Total Cost{includeUtilities ? ' (w/ utilities)' : ''}</p>
                <p className="text-2xl font-bold text-indigo-700">{fmt(result.totalCost)}/mo</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 uppercase">Affordable Rent (30% Rule)</p>
                <p className="text-2xl font-bold text-green-700">{fmt(result.affordable)}/mo</p>
              </div>
              <div className={`rounded-lg p-4 ${result.burden >= 30 ? 'bg-red-50' : 'bg-green-50'}`}>
                <p className="text-xs text-slate-500 uppercase">Rent Burden</p>
                <p className={`text-2xl font-bold ${result.burden >= 30 ? 'text-red-700' : 'text-green-700'}`}>{result.burden.toFixed(1)}%</p>
              </div>
            </div>

            {/* Gap Analysis */}
            <div className={`rounded-lg p-4 ${result.gap > 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
              <h3 className="font-semibold text-sm mb-1">
                {result.gap > 0 ? 'Over Budget' : 'Within Budget'}
              </h3>
              <p className="text-sm">
                {result.gap > 0
                  ? `You would need to spend ${fmt(result.gap)}/mo (${fmt(result.gap * 12)}/yr) more than the recommended 30% of income.`
                  : `You have ${fmt(Math.abs(result.gap))}/mo (${fmt(Math.abs(result.gap) * 12)}/yr) of breathing room within the 30% guideline.`}
              </p>
            </div>

            {/* Annual Summary */}
            <div className="bg-slate-50 rounded-lg p-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>Annual Income:</div><div className="text-right font-medium">{fmt(parseFloat(income))}</div>
                <div>Annual Rent Cost:</div><div className="text-right font-medium">{fmt(result.totalCost * 12)}</div>
                <div>Remaining After Rent:</div><div className="text-right font-medium">{fmt(parseFloat(income) - result.totalCost * 12)}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* High-CPC Footer */}
      <div className="mt-8 bg-blue-50 rounded-xl p-6 text-sm">
        <h3 className="font-semibold text-blue-900 mb-3">Find Your Next Home</h3>
        <div className="grid md:grid-cols-2 gap-3 text-blue-800">
          <p>Search apartment listings near me</p>
          <p>Compare renters insurance quotes</p>
          <p>Get moving company estimates</p>
          <p>Explore rent-to-own programs</p>
          <p>Find housing assistance programs</p>
          <p>Calculate <a href="https://calcpeek.com" className="underline">other financial metrics</a></p>
        </div>
      </div>
    </div>
  );
}
