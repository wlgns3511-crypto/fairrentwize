import type { StateRow } from './db';

function fmtCurrency(n: number): string {
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export function generateStateInsights(state: StateRow, allStates: StateRow[]): string[] {
  const insights: string[] = [];
  const total = allStates.length;

  // 1. Rent rank
  const sortedByRent = [...allStates].sort((a, b) => b.avg_rent_2br - a.avg_rent_2br);
  const rank = sortedByRent.findIndex(s => s.slug === state.slug) + 1;
  const avgRent2br = Math.round(allStates.reduce((s, st) => s + st.avg_rent_2br, 0) / total);
  const diffPct = ((state.avg_rent_2br - avgRent2br) / avgRent2br) * 100;

  if (rank <= 5) {
    insights.push(`${state.state} ranks #${rank} out of ${total} states for the highest average 2-bedroom fair market rent at ${fmtCurrency(state.avg_rent_2br)}/month — ${Math.abs(diffPct).toFixed(0)}% above the national average of ${fmtCurrency(avgRent2br)}.`);
  } else if (rank > total - 5) {
    insights.push(`With an average 2BR rent of ${fmtCurrency(state.avg_rent_2br)}/month, ${state.state} ranks #${rank} out of ${total} states — one of the most affordable rental markets at ${Math.abs(diffPct).toFixed(0)}% below the national average of ${fmtCurrency(avgRent2br)}.`);
  } else {
    insights.push(`${state.state}'s average 2-bedroom fair market rent of ${fmtCurrency(state.avg_rent_2br)}/month ranks #${rank} out of ${total} states, sitting ${Math.abs(diffPct).toFixed(0)}% ${diffPct > 0 ? 'above' : 'below'} the national average of ${fmtCurrency(avgRent2br)}.`);
  }

  // 2. Affordability / 30% rule
  const affordableRent = Math.round(state.median_income * 0.3 / 12);
  const isAffordable = affordableRent >= state.avg_rent_2br;
  const surplus = affordableRent - state.avg_rent_2br;
  if (isAffordable) {
    insights.push(`At the median household income of ${fmtCurrency(state.median_income)}, the 30% affordability rule allows up to ${fmtCurrency(affordableRent)}/month on rent — ${fmtCurrency(surplus)} above the average 2BR FMR, meaning rent is generally within reach for median earners.`);
  } else {
    insights.push(`At the median household income of ${fmtCurrency(state.median_income)}, the 30% affordability rule allows only ${fmtCurrency(affordableRent)}/month — ${fmtCurrency(Math.abs(surplus))} short of the average 2BR FMR of ${fmtCurrency(state.avg_rent_2br)}, indicating a rent burden for typical households.`);
  }

  // 3. 1BR vs 2BR spread
  const spread = state.avg_rent_2br - state.avg_rent_1br;
  const avgSpread = Math.round(allStates.reduce((s, st) => s + (st.avg_rent_2br - st.avg_rent_1br), 0) / total);
  insights.push(`The gap between 1-bedroom (${fmtCurrency(state.avg_rent_1br)}) and 2-bedroom (${fmtCurrency(state.avg_rent_2br)}) rents in ${state.state} is ${fmtCurrency(spread)}/month — ${spread > avgSpread ? 'wider' : 'narrower'} than the national average spread of ${fmtCurrency(avgSpread)}, reflecting local market dynamics for families needing extra space.`);

  // 4. Renter percentage context
  const avgRenterPct = allStates.reduce((s, st) => s + st.renter_pct, 0) / total;
  if (state.renter_pct > avgRenterPct + 5) {
    insights.push(`An unusually high ${state.renter_pct.toFixed(1)}% of households in ${state.state} are renters (national average: ${avgRenterPct.toFixed(1)}%), making rental market conditions particularly impactful for the state's population.`);
  } else if (state.renter_pct < avgRenterPct - 5) {
    insights.push(`Only ${state.renter_pct.toFixed(1)}% of households in ${state.state} are renters — well below the ${avgRenterPct.toFixed(1)}% national average, reflecting higher homeownership rates.`);
  } else {
    insights.push(`${state.renter_pct.toFixed(1)}% of households in ${state.state} are renters, close to the national average of ${avgRenterPct.toFixed(1)}%.`);
  }

  // 5. Tenant rights score
  if (state.tenant_rights_score >= 7) {
    insights.push(`${state.state} scores ${state.tenant_rights_score}/10 on tenant protections — among the strongest in the nation, with robust eviction protections, rent stabilization, or security deposit limits that benefit renters.`);
  } else if (state.tenant_rights_score <= 3) {
    insights.push(`${state.state}'s tenant rights score of ${state.tenant_rights_score}/10 is among the lowest nationally, offering minimal statutory protections for renters in areas like eviction notice periods and security deposit limits.`);
  } else {
    insights.push(`With a tenant rights score of ${state.tenant_rights_score}/10, ${state.state} offers moderate protections for renters — not the strongest, but better than many Sun Belt and rural states.`);
  }

  // 6. Annual rent burden in dollars
  const annualRent = state.avg_rent_2br * 12;
  const rentToIncome = (annualRent / state.median_income) * 100;
  insights.push(`A household renting a typical 2-bedroom in ${state.state} spends approximately ${fmtCurrency(annualRent)}/year on rent, consuming ${rentToIncome.toFixed(1)}% of the median household income — ${rentToIncome > 30 ? 'exceeding the widely recommended 30% threshold' : 'within the recommended 30% affordability guideline'}.`);

  return insights;
}
