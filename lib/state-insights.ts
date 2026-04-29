import type { StateRow } from './db';

function fmtCurrency(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—';
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

/**
 * Generate state insights from real ACS + HUD + NLIHC data. Each insight
 * guards on the fields it needs; missing fields drop the insight rather
 * than producing zeros or fabricated context. Inputs are the new schema:
 *   - state.fmr_2br        → NLIHC's 2-BR FMR (HUD-derived)
 *   - state.acs_*          → ACS 2023 5-Year for income/rent burden/renter %
 *   - state.nlihc_*        → NLIHC OOR 2025 housing wage + rank
 */
export function generateStateInsights(state: StateRow, allStates: StateRow[]): string[] {
  const insights: string[] = [];
  const total = allStates.length;

  // 1. NLIHC housing-wage rank — the canonical "what would you need to earn" stat.
  if (
    state.nlihc_housing_wage_2br !== null &&
    state.nlihc_housing_wage_rank !== null
  ) {
    const wage = state.nlihc_housing_wage_2br.toFixed(2);
    const rank = state.nlihc_housing_wage_rank;
    const usAvg = (
      allStates.reduce((s, st) => s + (st.nlihc_housing_wage_2br ?? 0), 0) /
      Math.max(1, allStates.filter(s => s.nlihc_housing_wage_2br !== null).length)
    ).toFixed(2);
    if (rank <= 5) {
      insights.push(
        `${state.state} ranks #${rank} of ${total} for the highest 2-bedroom housing wage in the country: a renter would need to earn $${wage}/hour to afford the FY25 fair market rent without being cost-burdened, well above the national average of $${usAvg}/hour (NLIHC Out of Reach 2025).`,
      );
    } else if (rank > total - 5) {
      insights.push(
        `${state.state} ranks #${rank} of ${total} for housing wage — at $${wage}/hour to afford a 2-bedroom at FMR, it is one of the most affordable rental markets relative to the national average of $${usAvg}/hour (NLIHC Out of Reach 2025).`,
      );
    } else {
      insights.push(
        `A renter in ${state.state} needs to earn $${wage}/hour to afford a 2-bedroom at fair market rent, ranking #${rank} of ${total} states. The national average is $${usAvg}/hour (NLIHC Out of Reach 2025).`,
      );
    }
  }

  // 2. NLIHC mean renter wage vs. housing wage — the affordability gap.
  if (
    state.nlihc_housing_wage_2br !== null &&
    state.nlihc_mean_renter_wage !== null
  ) {
    const need = state.nlihc_housing_wage_2br;
    const earn = state.nlihc_mean_renter_wage;
    const gap = need - earn;
    if (gap > 0) {
      insights.push(
        `The mean renter in ${state.state} earns $${earn.toFixed(2)}/hour — $${gap.toFixed(2)}/hour short of the $${need.toFixed(2)} needed to afford a 2-bedroom at FMR. To close the gap, a typical renter would need to work about ${Math.round(((need / earn) * 40))} hours per week at the current wage.`,
      );
    } else {
      insights.push(
        `The mean renter wage in ${state.state} is $${earn.toFixed(2)}/hour, exceeding the $${need.toFixed(2)} housing wage needed for a 2-bedroom at FMR by $${Math.abs(gap).toFixed(2)}/hour — typical renters here have a small affordability cushion against fair market rent.`,
      );
    }
  }

  // 3. Rent burden — share of cost-burdened renters from ACS B25070.
  if (state.acs_rent_burdened_pct !== null) {
    const valid = allStates.filter((s) => s.acs_rent_burdened_pct !== null);
    const usAvg = valid.reduce((s, st) => s + (st.acs_rent_burdened_pct ?? 0), 0) / Math.max(1, valid.length);
    const pct = state.acs_rent_burdened_pct;
    if (pct >= usAvg + 3) {
      insights.push(
        `${pct.toFixed(1)}% of renter households in ${state.state} pay 30% or more of their income on housing — above the national average of ${usAvg.toFixed(1)}% (ACS 2023 5-Year, B25070). This places ${state.state}'s renters among the more cost-burdened populations.`,
      );
    } else if (pct <= usAvg - 3) {
      insights.push(
        `${pct.toFixed(1)}% of renter households in ${state.state} are cost-burdened, below the national average of ${usAvg.toFixed(1)}% (ACS 2023 5-Year, B25070). Renters here have somewhat more income flexibility than the typical state.`,
      );
    } else {
      insights.push(
        `${pct.toFixed(1)}% of ${state.state} renters are cost-burdened (paying 30%+ of income on rent), close to the national average of ${usAvg.toFixed(1)}% (ACS 2023 5-Year, B25070).`,
      );
    }
  }

  // 4. Renter-share of population context.
  if (state.acs_renter_pct !== null) {
    const valid = allStates.filter((s) => s.acs_renter_pct !== null);
    const usAvg = valid.reduce((s, st) => s + (st.acs_renter_pct ?? 0), 0) / Math.max(1, valid.length);
    const pct = state.acs_renter_pct;
    if (pct > usAvg + 5) {
      insights.push(
        `${pct.toFixed(1)}% of households in ${state.state} are renters (national average: ${usAvg.toFixed(1)}%). Rental conditions are unusually consequential here, affecting a larger share of the population than in most states.`,
      );
    } else if (pct < usAvg - 5) {
      insights.push(
        `Only ${pct.toFixed(1)}% of households in ${state.state} are renters — well below the ${usAvg.toFixed(1)}% national average — reflecting a homeownership-heavy housing market.`,
      );
    } else {
      insights.push(
        `${pct.toFixed(1)}% of ${state.state} households rent, close to the national average of ${usAvg.toFixed(1)}% (ACS 2023 5-Year).`,
      );
    }
  }

  // 5. Annual rent burden in dollars for a 2BR at FMR.
  if (state.fmr_2br !== null && state.acs_median_household_income !== null) {
    const annualRent = state.fmr_2br * 12;
    const rentToIncome = (annualRent / state.acs_median_household_income) * 100;
    insights.push(
      `A household paying the FY25 2-BR fair market rent of ${fmtCurrency(state.fmr_2br)}/month in ${state.state} spends about ${fmtCurrency(annualRent)}/year on rent — ${rentToIncome.toFixed(1)}% of the median household income, ${rentToIncome > 30 ? 'exceeding' : 'within'} the 30% affordability guideline.`,
    );
  }

  return insights;
}
