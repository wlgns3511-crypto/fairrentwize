import type { County } from './db';

export const NATIONAL_AVG_2BR = 1727; // FY2025 HUD national average 2-bedroom FMR

export type BurdenBucket = 'extreme' | 'high' | 'moderate' | 'low' | 'unknown';
export type FmrBucket = 'extreme-high' | 'high' | 'above-avg' | 'avg' | 'below-avg' | 'low' | 'unknown';
export type SourceBucket = 'direct' | 'metro_single' | 'metro_fanout' | 'unknown';

export function bucketBurdenPct(pct: number | null): BurdenBucket {
  if (pct === null) return 'unknown';
  if (pct >= 50) return 'extreme';
  if (pct >= 40) return 'high';
  if (pct >= 30) return 'moderate';
  return 'low';
}

export function bucketFmrVsNational(fmr2br: number | null): FmrBucket {
  if (fmr2br === null) return 'unknown';
  const ratio = fmr2br / NATIONAL_AVG_2BR;
  if (ratio >= 1.5) return 'extreme-high';
  if (ratio >= 1.25) return 'high';
  if (ratio >= 1.10) return 'above-avg';
  if (ratio >= 0.90) return 'avg';
  if (ratio >= 0.75) return 'below-avg';
  return 'low';
}

export function bucketSourceKind(kind: County['hud_source_kind']): SourceBucket {
  if (kind === 'NCNTY') return 'direct';
  if (kind === 'METRO_N') return 'metro_single';
  if (kind === 'METRO_M_FANOUT') return 'metro_fanout';
  return 'unknown';
}

export interface VsNationalContext {
  diff: number;
  pctDiff: number;
  bucket: FmrBucket;
}

export function getCountyVsNational(county: County): VsNationalContext | null {
  if (county.fmr_2br === null) return null;
  const diff = county.fmr_2br - NATIONAL_AVG_2BR;
  const pctDiff = Math.round((diff / NATIONAL_AVG_2BR) * 100);
  return { diff, pctDiff, bucket: bucketFmrVsNational(county.fmr_2br) };
}

export type AffordableMaxSize = 'studio' | '1BR' | '2BR' | '3BR' | '4BR' | 'none' | 'unknown';

export function getCountyAffordableMaxSize(county: County): AffordableMaxSize {
  if (county.acs_median_household_income === null) return 'unknown';
  const monthly = (county.acs_median_household_income * 0.30) / 12;
  if (county.fmr_4br !== null && monthly >= county.fmr_4br) return '4BR';
  if (county.fmr_3br !== null && monthly >= county.fmr_3br) return '3BR';
  if (county.fmr_2br !== null && monthly >= county.fmr_2br) return '2BR';
  if (county.fmr_1br !== null && monthly >= county.fmr_1br) return '1BR';
  if (county.fmr_studio !== null && monthly >= county.fmr_studio) return 'studio';
  return 'none';
}

export interface CountyAffordability {
  affordableMonthlyRent: number;
  rentBurdenAtFmr: number;
  isCostBurdened: boolean;
  monthlyGap: number;
  incomeNeededFor2br: number;
}

export function getCountyAffordability(county: County): CountyAffordability | null {
  if (county.fmr_2br === null || county.acs_median_household_income === null) return null;
  const affordableMonthly = (county.acs_median_household_income * 0.30) / 12;
  const rentBurden = (county.fmr_2br * 12) / county.acs_median_household_income * 100;
  return {
    affordableMonthlyRent: Math.round(affordableMonthly),
    rentBurdenAtFmr: Number(rentBurden.toFixed(1)),
    isCostBurdened: rentBurden >= 30,
    monthlyGap: Math.round(county.fmr_2br - affordableMonthly),
    incomeNeededFor2br: Math.round((county.fmr_2br * 12) / 0.30),
  };
}

export function getBedroomPremium(county: County): { studio: number; br4: number; ratio: number } | null {
  if (county.fmr_studio === null || county.fmr_4br === null) return null;
  return {
    studio: county.fmr_studio,
    br4: county.fmr_4br,
    ratio: county.fmr_4br / county.fmr_studio,
  };
}

export interface MoeFlag {
  hasOverallEstimate: boolean;
  relativeMoe: number | null;
  isWideMoe: boolean;
}

export function getMoeFlag(county: County): MoeFlag {
  return {
    hasOverallEstimate: county.acs_median_rent_overall !== null,
    relativeMoe: county.acs_median_rent_overall_relative_moe,
    isWideMoe: county.acs_median_rent_overall_relative_moe !== null && county.acs_median_rent_overall_relative_moe > 30,
  };
}
