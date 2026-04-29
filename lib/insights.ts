import type { County } from './db';

interface Insight {
  text: string;
  sentiment?: "positive" | "negative" | "neutral";
}

const NATIONAL_AVG_2BR = 1727; // HUD national average FMR FY2025 (2-bedroom)

/**
 * Generate fair market rent insights for a county. Inputs are nullable
 * because ACS variables can be missing for very small counties; insights
 * gracefully degrade to a shorter list rather than crashing.
 */
export function getCountyInsights(county: County): Insight[] {
  const insights: Insight[] = [];

  // 1. Rent burden assessment
  const rb = county.acs_rent_burdened_pct;
  if (rb !== null && rb !== undefined) {
    if (rb >= 35) {
      insights.push({
        text: `${county.county_name} has a rent burden of ${rb.toFixed(1)}%, well above the 30% affordability threshold. More than a third of renter income goes to housing, leaving less for savings, healthcare, and transportation.`,
        sentiment: "negative",
      });
    } else if (rb >= 30) {
      insights.push({
        text: `At ${rb.toFixed(1)}%, ${county.county_name} is right at the 30% affordability line. Renters here are on the edge of being cost-burdened by HUD's definition.`,
        sentiment: "negative",
      });
    } else {
      insights.push({
        text: `${county.county_name}'s rent burden is ${rb.toFixed(1)}%, below the 30% threshold. By HUD standards, the typical renter here can afford housing without being cost-burdened.`,
        sentiment: "positive",
      });
    }
  }

  // 2. Income needed for 2BR (only if both fields available)
  if (county.fmr_2br && county.acs_median_household_income) {
    const incomeNeeded = Math.round((county.fmr_2br * 12) / 0.3);
    const incomeGap = incomeNeeded - county.acs_median_household_income;
    insights.push({
      text: `To afford a 2-bedroom at FMR ($${county.fmr_2br.toLocaleString()}/mo) under the 30% rule, a household needs $${incomeNeeded.toLocaleString()}/yr. ${incomeGap > 0 ? `That is $${incomeGap.toLocaleString()} more than the median income — a significant affordability gap.` : `The median income of $${county.acs_median_household_income.toLocaleString()} exceeds this by $${Math.abs(incomeGap).toLocaleString()}, suggesting 2BR units are generally within reach.`}`,
      sentiment: incomeGap > 0 ? "negative" : "positive",
    });
  }

  // 3. 2BR vs national average
  if (county.fmr_2br) {
    const diff = county.fmr_2br - NATIONAL_AVG_2BR;
    const pctDiff = Math.round((diff / NATIONAL_AVG_2BR) * 100);
    insights.push({
      text: `The 2-bedroom FMR of $${county.fmr_2br.toLocaleString()}/mo is ${Math.abs(pctDiff)}% ${diff >= 0 ? "above" : "below"} the national average of $${NATIONAL_AVG_2BR.toLocaleString()}/mo. ${Math.abs(pctDiff) < 10 ? "Rents here are close to the US norm." : diff > 0 ? "This county is pricier than most of the US rental market." : "Renters here get a relative bargain compared to the national average."}`,
      sentiment: diff > NATIONAL_AVG_2BR * 0.15 ? "negative" : diff < -NATIONAL_AVG_2BR * 0.15 ? "positive" : "neutral",
    });
  }

  // 4. Bedroom size premium
  if (county.fmr_studio && county.fmr_4br) {
    const studioTo4br = county.fmr_4br - county.fmr_studio;
    const premiumPct = Math.round((studioTo4br / county.fmr_studio) * 100);
    insights.push({
      text: `Rent ranges from $${county.fmr_studio.toLocaleString()}/mo (studio) to $${county.fmr_4br.toLocaleString()}/mo (4BR) — a ${premiumPct}% premium for the largest units. Families needing 3+ bedrooms should budget carefully, as larger units often exceed the affordable rent threshold.`,
      sentiment: "neutral",
    });
  }

  // 5. Affordable monthly rent
  if (county.acs_median_household_income) {
    const affordableRent = Math.round((county.acs_median_household_income * 0.3) / 12);
    const maxAffordableSize =
      county.fmr_4br && affordableRent >= county.fmr_4br
        ? "4-bedroom"
        : county.fmr_3br && affordableRent >= county.fmr_3br
          ? "3-bedroom"
          : county.fmr_2br && affordableRent >= county.fmr_2br
            ? "2-bedroom"
            : county.fmr_1br && affordableRent >= county.fmr_1br
              ? "1-bedroom"
              : county.fmr_studio && affordableRent >= county.fmr_studio
                ? "studio"
                : "none of the listed unit sizes";
    insights.push({
      text: `At the median income, the affordable monthly rent (30% rule) is $${affordableRent.toLocaleString()}/mo, which covers up to a ${maxAffordableSize} at fair market rates.`,
      sentiment: maxAffordableSize === "none of the listed unit sizes" ? "negative" : maxAffordableSize === "studio" || maxAffordableSize === "1-bedroom" ? "neutral" : "positive",
    });
  }

  return insights;
}
