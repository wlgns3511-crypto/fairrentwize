import type { StateRow } from './db';

export type BurdenBucket = 'extreme' | 'high' | 'moderate' | 'low' | 'unknown';
export type WageBucket = 'top5' | 'high' | 'mid' | 'low' | 'bottom5' | 'unknown';

export function bucketBurdenPct(pct: number | null): BurdenBucket {
  if (pct === null) return 'unknown';
  if (pct >= 50) return 'extreme';
  if (pct >= 45) return 'high';
  if (pct >= 40) return 'moderate';
  return 'low';
}

export function bucketHousingWageRank(rank: number | null, total: number): WageBucket {
  if (rank === null || total <= 0) return 'unknown';
  if (rank <= 5) return 'top5';
  if (rank > total - 5) return 'bottom5';
  if (rank <= Math.ceil(total / 3)) return 'high';
  if (rank <= Math.ceil((total * 2) / 3)) return 'mid';
  return 'low';
}

export interface StatePeerEntry {
  state: StateRow;
  fmrDelta: number;
}

export function getStatePeers(state: StateRow, allStates: StateRow[], n = 4): StatePeerEntry[] {
  if (state.fmr_2br === null) return [];
  const target = state.fmr_2br;
  return allStates
    .filter((s) => s.slug !== state.slug && s.fmr_2br !== null)
    .map((s) => ({ state: s, fmrDelta: Math.abs((s.fmr_2br ?? 0) - target) }))
    .sort((a, b) => a.fmrDelta - b.fmrDelta)
    .slice(0, n);
}

export interface StateAffordability {
  affordableMonthlyRent: number;
  rentBurdenAtFmr: number;
  isCostBurdened: boolean;
  monthlyGap: number;
}

export function getStateAffordability(state: StateRow): StateAffordability | null {
  if (state.fmr_2br === null || state.acs_median_household_income === null) return null;
  const affordableMonthly = (state.acs_median_household_income * 0.30) / 12;
  const rentBurden = (state.fmr_2br * 12) / state.acs_median_household_income * 100;
  return {
    affordableMonthlyRent: Math.round(affordableMonthly),
    rentBurdenAtFmr: Number(rentBurden.toFixed(1)),
    isCostBurdened: rentBurden >= 30,
    monthlyGap: Math.round(state.fmr_2br - affordableMonthly),
  };
}

export interface NationalContext {
  usAvgFmr: number;
  usAvgHousingWage: number;
  usAvgRentBurden: number;
  usAvgRenterPct: number;
  count: number;
}

export function getNationalContext(allStates: StateRow[]): NationalContext {
  const validFmr = allStates.filter((s) => s.fmr_2br !== null);
  const validWage = allStates.filter((s) => s.nlihc_housing_wage_2br !== null);
  const validBurden = allStates.filter((s) => s.acs_rent_burdened_pct !== null);
  const validRenter = allStates.filter((s) => s.acs_renter_pct !== null);
  return {
    usAvgFmr: validFmr.length > 0
      ? validFmr.reduce((s, st) => s + (st.fmr_2br ?? 0), 0) / validFmr.length
      : 0,
    usAvgHousingWage: validWage.length > 0
      ? validWage.reduce((s, st) => s + (st.nlihc_housing_wage_2br ?? 0), 0) / validWage.length
      : 0,
    usAvgRentBurden: validBurden.length > 0
      ? validBurden.reduce((s, st) => s + (st.acs_rent_burdened_pct ?? 0), 0) / validBurden.length
      : 0,
    usAvgRenterPct: validRenter.length > 0
      ? validRenter.reduce((s, st) => s + (st.acs_renter_pct ?? 0), 0) / validRenter.length
      : 0,
    count: allStates.length,
  };
}

export function getWageGap(state: StateRow): { need: number; earn: number; gap: number; weeklyHours: number } | null {
  if (state.nlihc_housing_wage_2br === null || state.nlihc_mean_renter_wage === null) return null;
  const need = state.nlihc_housing_wage_2br;
  const earn = state.nlihc_mean_renter_wage;
  const gap = need - earn;
  const weeklyHours = earn > 0 ? Math.round((need / earn) * 40) : 40;
  return { need, earn, gap, weeklyHours };
}
