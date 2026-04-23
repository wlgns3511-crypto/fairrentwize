"use client";

import { useState } from "react";

interface FmrData {
  studio: number;
  br1: number;
  br2: number;
  br3: number;
  br4: number;
}

interface Props {
  countyName: string;
  fmr: FmrData;
}

const BEDROOM_LABELS = ["Studio", "1 BR", "2 BR", "3 BR", "4 BR"];

function fmt(n: number) {
  return "$" + n.toLocaleString("en-US");
}

export function RentAffordabilityCheck({ countyName, fmr }: Props) {
  const [monthlyIncome, setMonthlyIncome] = useState(4500);

  const fmrValues = [fmr.studio, fmr.br1, fmr.br2, fmr.br3, fmr.br4];
  const affordableRent = Math.round(monthlyIncome * 0.3);
  const maxBar = Math.max(...fmrValues, affordableRent);

  return (
    <section className="bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-200 rounded-xl p-6 my-8">
      <h2 className="text-xl font-bold text-indigo-900 mb-1">
        Rent Affordability Check
      </h2>
      <p className="text-sm text-slate-600 mb-5">
        Slide to your monthly gross income and see which unit sizes in{" "}
        {countyName} fit the 30% affordability rule.
      </p>

      {/* Slider */}
      <div className="mb-6">
        <label className="flex justify-between text-sm font-medium text-slate-700 mb-2">
          <span>Monthly Gross Income</span>
          <span className="text-indigo-700 font-bold text-base">
            {fmt(monthlyIncome)}
          </span>
        </label>
        <input
          type="range"
          min={1000}
          max={15000}
          step={100}
          value={monthlyIncome}
          onChange={(e) => setMonthlyIncome(Number(e.target.value))}
          className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>$1,000</span>
          <span>$15,000</span>
        </div>
      </div>

      {/* Affordable limit callout */}
      <div className="bg-white border border-indigo-100 rounded-lg p-4 mb-6 text-center">
        <p className="text-sm text-slate-600">
          On <strong className="text-indigo-800">{fmt(monthlyIncome)}/mo</strong>{" "}
          income, the 30% rule says you can afford up to
        </p>
        <p className="text-3xl font-bold text-indigo-700 mt-1">
          {fmt(affordableRent)}/mo
        </p>
      </div>

      {/* Bedroom bars */}
      <div className="space-y-4">
        {fmrValues.map((rent, i) => {
          const burdenPct = monthlyIncome > 0 ? (rent / monthlyIncome) * 100 : 0;
          const isAffordable = rent <= affordableRent;
          const barColor = isAffordable ? "bg-emerald-500" : "bg-red-400";
          const labelColor = isAffordable ? "text-emerald-700" : "text-red-600";
          const bgColor = isAffordable ? "bg-emerald-50" : "bg-red-50";

          return (
            <div key={i}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">
                  {BEDROOM_LABELS[i]}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-600">{fmt(rent)}/mo</span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${bgColor} ${labelColor}`}
                  >
                    {isAffordable ? "Affordable" : `${burdenPct.toFixed(0)}% of income`}
                  </span>
                </div>
              </div>
              <div className="relative w-full bg-slate-100 rounded-full h-5">
                {/* FMR bar */}
                <div
                  className={`${barColor} h-5 rounded-full transition-all duration-300`}
                  style={{ width: `${Math.min((rent / maxBar) * 100, 100).toFixed(1)}%` }}
                />
                {/* Affordable limit line */}
                <div
                  className="absolute top-0 h-5 border-r-2 border-dashed border-indigo-600"
                  style={{ left: `${Math.min((affordableRent / maxBar) * 100, 100).toFixed(1)}%` }}
                  title={`Affordable limit: ${fmt(affordableRent)}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Dashed line legend */}
      <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
        <span className="inline-block w-4 border-t-2 border-dashed border-indigo-600" />
        <span>= Your affordable limit ({fmt(affordableRent)}/mo)</span>
      </div>

      {/* Summary sentence */}
      <div className="mt-5 bg-white rounded-lg border border-slate-200 p-4 text-sm text-slate-700 leading-relaxed">
        {(() => {
          const twobrRent = fmr.br2;
          const isOk = twobrRent <= affordableRent;
          return (
            <p>
              On <strong>{fmt(monthlyIncome)}/mo</strong>, you can afford up to{" "}
              <strong>{fmt(affordableRent)}</strong> in rent. A 2-bedroom in{" "}
              {countyName} at <strong>{fmt(twobrRent)}/mo</strong> is{" "}
              <span className={isOk ? "text-emerald-700 font-semibold" : "text-red-600 font-semibold"}>
                {isOk ? "affordable" : "unaffordable"}
              </span>
              {!isOk && (
                <> — you would spend {((twobrRent / monthlyIncome) * 100).toFixed(0)}% of
                  income on rent, exceeding the 30% guideline by{" "}
                  {fmt(twobrRent - affordableRent)}/mo</>
              )}
              .
            </p>
          );
        })()}
      </div>

      <p className="text-xs text-slate-400 mt-4">
        Based on HUD FY2026 Fair Market Rents for {countyName}. The 30% rule is
        a widely used guideline — not a strict limit.
      </p>
    </section>
  );
}
