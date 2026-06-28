import { getFairRentInterpretation } from './fairrent-interpretation';

export interface RentalProprietaryMetrics {
  rentBurdenScore: number;
  wageAdequacyScore: number;
  marketAlignmentScore: number;
  overallGrade: string;
  commentary: string;
}

/**
 * Returns a deterministic commentary paragraph based on county name, overall score, and slug-based hash
 * to rotate content variation and prevent duplicate content.
 */
function getDeterministicCommentary(
  countyName: string,
  overallScore: number,
  slug: string
): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = slug.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % 3;

  let key = 'MODERATE_PRESSURE';
  if (overallScore >= 75) {
    key = 'AFFORDABLE_STABLE';
  } else if (overallScore < 50) {
    key = 'CRISIS_SEVERE';
  }

  const variations: Record<string, string[]> = {
    AFFORDABLE_STABLE: [
      `Renting a home in ${countyName} is exceptionally sustainable compared to national benchmarks. The local Fair Market Rent sits comfortably within the financial reach of typical households, and local wage rates align well with median housing costs.`,
      `With a highly favorable ratio between median household incomes and HUD Fair Market Rents, ${countyName} represents a stable and affordable rental market. Financial friction for typical working families remains low, offering excellent budget predictability.`,
      `${countyName} stands out as a high-affordability market where rental rates do not over-burden local household budgets. Strong alignment between the local labor market and housing costs supports stable tenancy conditions.`
    ],
    MODERATE_PRESSURE: [
      `Rental conditions in ${countyName} are moderately stretched, with HUD Fair Market Rents demanding a larger share of the local median household income. Tenants may need to utilize multi-earner income structures or explore outer sub-markets to avoid housing cost-burden flags.`,
      `The rental market in ${countyName} is experiencing transitional pressure. While not in a full-scale crisis, average rent levels are growing faster than local median wages, requiring careful budgeting and diligent shopping from prospective tenants.`,
      `Moderate rent burden in ${countyName} indicates that middle-income earners will feel a budget squeeze. Working renters should cross-reference local rates with housing subsidy guidelines and prepare for tighter housing inventory.`
    ],
    CRISIS_SEVERE: [
      `${countyName} faces a severe rental affordability crisis, where HUD Fair Market Rents heavily exceed sustainable levels for typical local earners. High housing wage multiples and structural imbalances mean renters need significant existing resources or housing assistance to secure stable housing.`,
      `Tenants in ${countyName} endure high cost-burden levels as Fair Market Rents drastically outpace median local household incomes. The local labor market is misaligned with rental housing costs, creating a high-risk environment for eviction and financial strain.`,
      `A combination of high rental rates and stagnant renter wages creates a critical affordability barrier in ${countyName}. Entering this rental market without a premium household income or structural housing vouchers is highly challenging for typical working families.`
    ]
  };

  const list = variations[key] || variations['MODERATE_PRESSURE'];
  return list[index];
}

/**
 * Calculates proprietary rental metrics.
 */
export function calculateProprietaryMetrics(
  burdenPct: number | null,
  stateAbbr: string,
  countyName: string,
  slug: string
): RentalProprietaryMetrics {
  const parent = getFairRentInterpretation(stateAbbr);
  const oorMultiple = parent?.inputs.oorMultiple ?? null;
  const fmrVariancePct = parent?.inputs.fmrVariancePct ?? null;
  // 1. Rent Burden Score (0-100) — lower burden = higher score
  let rentBurdenScore = 50;
  if (burdenPct !== null) {
    rentBurdenScore = Math.round(100 - (burdenPct - 10) * 2.25);
    rentBurdenScore = Math.max(12, Math.min(99, rentBurdenScore));
  }

  // 2. Wage Adequacy Score (0-100) — higher score = more adequate wages compared to rent
  let wageAdequacyScore = 50;
  if (oorMultiple !== null) {
    wageAdequacyScore = Math.round(100 - (oorMultiple - 0.75) * 40);
    wageAdequacyScore = Math.max(12, Math.min(99, wageAdequacyScore));
  }

  // 3. Market Alignment Score (0-100) — lower state-level variance = better alignment
  let marketAlignmentScore = 50;
  if (fmrVariancePct !== null) {
    marketAlignmentScore = Math.round(90 - fmrVariancePct * 1.5);
    marketAlignmentScore = Math.max(12, Math.min(99, marketAlignmentScore));
  }

  // 4. Overall Relocation Grade (composite score where higher is better)
  const composite = rentBurdenScore * 0.4 + wageAdequacyScore * 0.4 + marketAlignmentScore * 0.2;

  let overallGrade = 'C';
  if (composite >= 90) overallGrade = 'A+';
  else if (composite >= 85) overallGrade = 'A';
  else if (composite >= 80) overallGrade = 'A-';
  else if (composite >= 75) overallGrade = 'B+';
  else if (composite >= 70) overallGrade = 'B';
  else if (composite >= 65) overallGrade = 'B-';
  else if (composite >= 60) overallGrade = 'C+';
  else if (composite >= 55) overallGrade = 'C';
  else if (composite >= 50) overallGrade = 'C-';
  else if (composite >= 40) overallGrade = 'D';
  else overallGrade = 'F';

  // 5. Commentary
  const commentary = getDeterministicCommentary(countyName, composite, slug);

  return {
    rentBurdenScore,
    wageAdequacyScore,
    marketAlignmentScore,
    overallGrade,
    commentary,
  };
}
