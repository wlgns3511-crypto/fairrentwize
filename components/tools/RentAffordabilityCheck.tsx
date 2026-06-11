"use client";

import { useMemo, useState } from "react";

/**
 * RentAffordabilityCheck v2 (2026-06-11, tool-surface #2).
 *
 * v1 was the county-page income slider vs the county's REAL per-bedroom HUD
 * FY2025 FMRs. v2 keeps that intact and adds:
 *
 *  1. State mode — pass `counties` (+`stateName`) and the same tool gets a
 *     county selector, replacing the retired components/RentCalculator.tsx
 *     (which carried a hardcoded synthetic state-level FMR table — round
 *     numbers, identical vectors across states — contradicting the real
 *     county FMRs rendered on the same pages).
 *  2. Housing Choice Voucher math — the site's whole identity is the voucher
 *     reality check, so the tool now computes what the federal rules actually
 *     prescribe from the SAME real FMR row:
 *       · payment standard basic range = 90–110% of FMR (24 CFR 982.503)
 *       · tenant share ≈ 30% of monthly adjusted income (TTP, 24 CFR 982.515)
 *       · voucher covers ≈ payment standard − tenant share
 *       · initial lease-up cap: tenant payment may not exceed 40% of adjusted
 *         monthly income (24 CFR 982.508)
 *     Utility allowances are PHA-specific and deliberately NOT estimated
 *     (v1's hub page carried fabricated utility numbers — retired with it).
 *
 * Honesty: every dollar figure derives from the county's HUD FY2025 FMR
 * passed in as props + the user's own income input. Income is taken as GROSS;
 * TTP uses ADJUSTED income, so voucher figures are labelled estimates.
 * SSR: defaults (income $4,500, 2BR, first county) render full content.
 */

interface FmrData {
  studio: number;
  br1: number;
  br2: number;
  br3: number;
  br4: number;
}

interface CountyOption {
  name: string;
  slug: string;
  fmr: FmrData;
}

interface Props {
  /** County mode (county pages): fixed county. */
  countyName?: string;
  fmr?: FmrData;
  /** State mode (state pages): selector over the state's counties. */
  stateName?: string;
  counties?: CountyOption[];
}

const BEDROOM_LABELS = ["Studio", "1 BR", "2 BR", "3 BR", "4 BR"];

function fmt(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

export function RentAffordabilityCheck({ countyName, fmr, stateName, counties }: Props) {
  const [monthlyIncome, setMonthlyIncome] = useState(4500);
  const [countyIdx, setCountyIdx] = useState(0);
  const [bedroomIdx, setBedroomIdx] = useState(2);

  const stateMode = !!counties && counties.length > 0;
  const activeName = stateMode ? counties[countyIdx]?.name ?? "" : countyName ?? "";
  const activeFmr: FmrData | undefined = stateMode ? counties[countyIdx]?.fmr : fmr;

  const fmrValues = useMemo(
    () =>
      activeFmr
        ? [activeFmr.studio, activeFmr.br1, activeFmr.br2, activeFmr.br3, activeFmr.br4]
        : [0, 0, 0, 0, 0],
    [activeFmr],
  );

  if (!activeFmr) return null;

  const affordableRent = Math.round(monthlyIncome * 0.3);
  const maxBar = Math.max(...fmrValues, affordableRent);

  // Housing Choice Voucher math (federal basic range, estimates)
  const selectedFmr = fmrValues[bedroomIdx];
  const psLow = selectedFmr * 0.9;
  const psHigh = selectedFmr * 1.1;
  const tenantShare = monthlyIncome * 0.3;
  const coverLow = Math.max(0, psLow - tenantShare);
  const coverHigh = Math.max(0, psHigh - tenantShare);
  const initialCap = monthlyIncome * 0.4;

  return (
    <section className="bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-200 rounded-xl p-6 my-8">
      <h2 className="text-xl font-bold text-indigo-900 mb-1">
        Rent Affordability Check
      </h2>
      <p className="text-sm text-slate-600 mb-5">
        Slide to your monthly gross income and see which unit sizes in{" "}
        {activeName} fit the 30% affordability rule — then what a Housing
        Choice Voucher would actually cover there.
      </p>

      {/* County selector (state mode) */}
      {stateMode && (
        <div className="mb-5">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            County in {stateName}
          </label>
          <select
            value={countyIdx}
            onChange={(e) => setCountyIdx(Number(e.target.value))}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {counties.map((c, i) => (
              <option key={c.slug} value={i}>
                {c.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-1">
            HUD sets FMRs at the county/metro level — state averages hide the
            spread, so pick your county.{" "}
            <a href={`/county/${counties[countyIdx]?.slug}/`} className="text-indigo-600 hover:underline">
              Full {activeName} rent data →
            </a>
          </p>
        </div>
      )}

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
                <div
                  className={`${barColor} h-5 rounded-full transition-all duration-300`}
                  style={{ width: `${Math.min((rent / maxBar) * 100, 100).toFixed(1)}%` }}
                />
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
          const twobrRent = activeFmr.br2;
          const isOk = twobrRent <= affordableRent;
          return (
            <p>
              On <strong>{fmt(monthlyIncome)}/mo</strong>, you can afford up to{" "}
              <strong>{fmt(affordableRent)}</strong> in rent. A 2-bedroom in{" "}
              {activeName} at <strong>{fmt(twobrRent)}/mo</strong> is{" "}
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

      {/* Housing Choice Voucher math */}
      <div className="mt-6 bg-white rounded-xl border border-indigo-200 p-5">
        <h3 className="text-base font-bold text-indigo-900 mb-1">
          What would a Housing Choice Voucher cover in {activeName}?
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Federal math on the HUD FY2025 FMR for your unit size — your local
          PHA sets the exact payment standard inside the 90–110% basic range
          (24 CFR 982.503).
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {BEDROOM_LABELS.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => setBedroomIdx(i)}
              className={`px-3 py-1.5 rounded-lg border text-sm ${
                bedroomIdx === i
                  ? "bg-indigo-700 text-white border-indigo-700"
                  : "bg-white text-slate-700 border-slate-300 hover:border-indigo-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
            <div className="text-xs text-slate-500 uppercase tracking-wide">
              Payment standard range
            </div>
            <div className="text-lg font-bold text-indigo-800 mt-0.5">
              {fmt(psLow)}–{fmt(psHigh)}
            </div>
            <div className="text-[11px] text-slate-400">
              90–110% of the {fmt(selectedFmr)} FMR
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="text-xs text-slate-500 uppercase tracking-wide">
              Your share (≈30% of income)
            </div>
            <div className="text-lg font-bold text-slate-800 mt-0.5">
              {fmt(tenantShare)}/mo
            </div>
            <div className="text-[11px] text-slate-400">
              TTP uses adjusted income — estimate
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
            <div className="text-xs text-slate-500 uppercase tracking-wide">
              Voucher covers (est.)
            </div>
            <div className="text-lg font-bold text-emerald-700 mt-0.5">
              {coverHigh <= 0 ? "$0" : `${fmt(coverLow)}–${fmt(coverHigh)}`}/mo
            </div>
            <div className="text-[11px] text-slate-400">
              payment standard − your share
            </div>
          </div>
        </div>

        <ul className="mt-4 text-xs text-slate-500 space-y-1 list-disc pl-4">
          <li>
            At initial lease-up your total payment may not exceed{" "}
            <strong>{fmt(initialCap)}/mo</strong> (40% of adjusted monthly
            income, 24 CFR 982.508) — renting above the payment standard comes
            out of your pocket up to that cap.
          </li>
          <li>
            Utility allowances are set by each PHA and are <strong>not</strong>{" "}
            included here — ask your PHA for the allowance schedule.
          </li>
          <li>
            Figures are screening estimates from published HUD FY2025 FMRs, not
            an eligibility determination — your PHA&apos;s numbers control.
          </li>
        </ul>
      </div>

      <p className="text-xs text-slate-400 mt-4">
        Based on HUD FY2025 Fair Market Rents for {activeName}. The 30% rule is
        a widely used guideline — not a strict limit.
      </p>
    </section>
  );
}
