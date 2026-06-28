import { JSX } from "react";

interface ProprietaryMetricsBlockProps {
  rentBurdenScore: number;
  wageAdequacyScore: number;
  marketAlignmentScore: number;
  overallGrade: string;
  commentary: string;
}

function getRentBurdenLevel(score: number): { label: string; color: string; ringColor: string; bg: string } {
  if (score >= 80) {
    return { label: "High Affordability", color: "text-emerald-700", ringColor: "stroke-emerald-500", bg: "bg-emerald-50" };
  }
  if (score >= 50) {
    return { label: "Moderate Costs", color: "text-amber-700", ringColor: "stroke-amber-500", bg: "bg-amber-50" };
  }
  return { label: "High Rent Burden", color: "text-rose-700", ringColor: "stroke-rose-500", bg: "bg-rose-50" };
}

function getWageAdequacyLevel(score: number): { label: string; color: string; ringColor: string; bg: string } {
  if (score >= 80) {
    return { label: "Adequate Wages", color: "text-emerald-700", ringColor: "stroke-emerald-500", bg: "bg-emerald-50" };
  }
  if (score >= 50) {
    return { label: "Wage Squeeze", color: "text-amber-700", ringColor: "stroke-amber-500", bg: "bg-amber-50" };
  }
  return { label: "Wage Shortfall", color: "text-rose-700", ringColor: "stroke-rose-500", bg: "bg-rose-50" };
}

function getMarketAlignmentLevel(score: number): { label: string; color: string; ringColor: string; bg: string } {
  if (score >= 80) {
    return { label: "Highly Aligned", color: "text-emerald-700", ringColor: "stroke-emerald-500", bg: "bg-emerald-50" };
  }
  if (score >= 50) {
    return { label: "Moderate Variance", color: "text-amber-700", ringColor: "stroke-amber-500", bg: "bg-amber-50" };
  }
  return { label: "High Variance Split", color: "text-rose-700", ringColor: "stroke-rose-500", bg: "bg-rose-50" };
}

function getGradeStyles(grade: string): { badge: string; border: string; bg: string } {
  const cleanGrade = grade.charAt(0);
  switch (cleanGrade) {
    case "A":
      return { badge: "text-emerald-800 bg-emerald-100", border: "border-emerald-200", bg: "bg-emerald-50/30" };
    case "B":
      return { badge: "text-indigo-800 bg-indigo-100", border: "border-indigo-200", bg: "bg-indigo-50/30" };
    case "C":
      return { badge: "text-amber-900 bg-amber-100/70", border: "border-amber-100", bg: "bg-amber-50/20" };
    case "D":
    case "F":
    default:
      return { badge: "text-rose-800 bg-rose-100", border: "border-rose-200", bg: "bg-rose-50/30" };
  }
}

export function ProprietaryMetricsBlock({
  rentBurdenScore,
  wageAdequacyScore,
  marketAlignmentScore,
  overallGrade,
  commentary,
}: ProprietaryMetricsBlockProps): JSX.Element {
  const burden = getRentBurdenLevel(rentBurdenScore);
  const wage = getWageAdequacyLevel(wageAdequacyScore);
  const alignment = getMarketAlignmentLevel(marketAlignmentScore);
  const gradeStyles = getGradeStyles(overallGrade);

  // SVG Circle parameters for progress gauge
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const burdenDashoffset = circumference - (rentBurdenScore / 100) * circumference;
  const wageDashoffset = circumference - (wageAdequacyScore / 100) * circumference;
  const alignmentDashoffset = circumference - (marketAlignmentScore / 100) * circumference;

  return (
    <section
      data-upgrade="proprietary-metrics"
      aria-label="FairRentWize Proprietary Rental and Affordability Ratings"
      className="not-prose my-8 rounded-xl border border-indigo-200 bg-white p-5 shadow-sm"
    >
      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">
        <svg
          aria-hidden="true"
          className="h-4.5 w-4.5 text-indigo-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.746 3.746 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
          />
        </svg>
        FairRentWize Relocation & Rental Affordability Index
      </h3>

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Metric Gauges Row */}
        <div className="flex flex-row items-center gap-6 flex-shrink-0">
          {/* Rent Burden Ring */}
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
                {/* Background Ring */}
                <circle
                  className="text-slate-100"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx="48"
                  cy="48"
                />
                {/* Active Ring */}
                <circle
                  className={`${burden.ringColor} transition-all duration-500`}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={burdenDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx="48"
                  cy="48"
                />
              </svg>
              {/* Score Text */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-800">{rentBurdenScore}</span>
                <span className="text-[8px] text-slate-400 font-semibold uppercase tracking-wider text-center max-w-[50px] leading-tight font-sans">Rent Burden</span>
              </div>
            </div>
            <span className={`text-xs font-bold mt-2 ${burden.color}`}>{burden.label}</span>
          </div>

          {/* Wage Adequacy Ring */}
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
                {/* Background Ring */}
                <circle
                  className="text-slate-100"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx="48"
                  cy="48"
                />
                {/* Active Ring */}
                <circle
                  className={`${wage.ringColor} transition-all duration-500`}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={wageDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx="48"
                  cy="48"
                />
              </svg>
              {/* Score Text */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-800">{wageAdequacyScore}</span>
                <span className="text-[8px] text-slate-400 font-semibold uppercase tracking-wider text-center max-w-[50px] leading-tight font-sans">Wage Fit</span>
              </div>
            </div>
            <span className={`text-xs font-bold mt-2 ${wage.color}`}>{wage.label}</span>
          </div>

          {/* Market Alignment Ring */}
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
                {/* Background Ring */}
                <circle
                  className="text-slate-100"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx="48"
                  cy="48"
                />
                {/* Active Ring */}
                <circle
                  className={`${alignment.ringColor} transition-all duration-500`}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={alignmentDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx="48"
                  cy="48"
                />
              </svg>
              {/* Score Text */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-800">{marketAlignmentScore}</span>
                <span className="text-[8px] text-slate-400 font-semibold uppercase tracking-wider text-center max-w-[50px] leading-tight font-sans">Alignment</span>
              </div>
            </div>
            <span className={`text-xs font-bold mt-2 ${alignment.color}`}>{alignment.label}</span>
          </div>

          {/* Affordability Grade Badge */}
          <div className="flex flex-col items-center">
            <div className={`w-24 h-24 rounded-full border-2 ${gradeStyles.border} ${gradeStyles.bg} flex items-center justify-center`}>
              <div className={`w-18 h-18 rounded-full flex items-center justify-center font-black text-3xl shadow-sm ${gradeStyles.badge}`}>
                {overallGrade}
              </div>
            </div>
            <span className="text-xs font-bold text-slate-700 mt-2 font-sans">Overall Grade</span>
          </div>
        </div>

        {/* Dynamic Commentary Text */}
        <div className="flex-1 bg-indigo-50/10 border border-indigo-100/50 rounded-xl p-4.5">
          <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1 font-sans">Affordability Expert Analysis</h4>
          <p className="text-sm text-slate-700 leading-relaxed font-normal">
            {commentary}
          </p>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400">
        <span>* Rent Burden evaluates the HUD FMR cost load against local median household income (Census ACS).</span>
        <span>* Wage Fit compares typical renter earnings (NLIHC OOR) against regional housing wage thresholds.</span>
        <span>* Alignment score evaluates within-state rent variance and geographical consistency of rental indices.</span>
      </div>
    </section>
  );
}
