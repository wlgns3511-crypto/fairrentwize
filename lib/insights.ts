interface Insight {
  text: string;
  sentiment?: "positive" | "negative" | "neutral";
}

interface CountyData {
  county_name: string;
  state: string;
  fmr_studio: number;
  fmr_1br: number;
  fmr_2br: number;
  fmr_3br: number;
  fmr_4br: number;
  median_income: number;
  rent_burden_pct: number;
  population: number;
}

const NATIONAL_AVG_2BR = 1372; // HUD national average FMR for 2BR (FY2026 approx)

/**
 * Generate fair market rent insights for a county.
 */
export function getCountyInsights(county: CountyData): Insight[] {
  const insights: Insight[] = [];

  // 1. Rent burden assessment
  if (county.rent_burden_pct >= 35) {
    insights.push({
      text: `${county.county_name} has a rent burden of ${county.rent_burden_pct.toFixed(1)}%, well above the 30% affordability threshold. More than a third of renter income goes to housing, leaving less for savings, healthcare, and transportation.`,
      sentiment: "negative",
    });
  } else if (county.rent_burden_pct >= 30) {
    insights.push({
      text: `At ${county.rent_burden_pct.toFixed(1)}%, ${county.county_name} is right at the 30% affordability line. Renters here are on the edge of being cost-burdened by HUD's definition.`,
      sentiment: "negative",
    });
  } else {
    insights.push({
      text: `${county.county_name}'s rent burden is ${county.rent_burden_pct.toFixed(1)}%, below the 30% threshold. By HUD standards, the typical renter here can afford housing without being cost-burdened.`,
      sentiment: "positive",
    });
  }

  // 2. Income needed for 2BR
  const incomeNeeded = Math.round((county.fmr_2br * 12) / 0.3);
  const incomeGap = incomeNeeded - county.median_income;
  insights.push({
    text: `To afford a 2-bedroom at FMR ($${county.fmr_2br.toLocaleString()}/mo) under the 30% rule, a household needs $${incomeNeeded.toLocaleString()}/yr. ${incomeGap > 0 ? `That is $${incomeGap.toLocaleString()} more than the median income — a significant affordability gap.` : `The median income of $${county.median_income.toLocaleString()} exceeds this by $${Math.abs(incomeGap).toLocaleString()}, suggesting 2BR units are generally within reach.`}`,
    sentiment: incomeGap > 0 ? "negative" : "positive",
  });

  // 3. 2BR vs national average
  const diff = county.fmr_2br - NATIONAL_AVG_2BR;
  const pctDiff = ((diff / NATIONAL_AVG_2BR) * 100).toFixed(0);
  insights.push({
    text: `The 2-bedroom FMR of $${county.fmr_2br.toLocaleString()}/mo is ${Math.abs(Number(pctDiff))}% ${diff >= 0 ? "above" : "below"} the national average of $${NATIONAL_AVG_2BR.toLocaleString()}/mo. ${Math.abs(Number(pctDiff)) < 10 ? "Rents here are close to the US norm." : diff > 0 ? "This county is pricier than most of the US rental market." : "Renters here get a relative bargain compared to the national average."}`,
    sentiment: diff > NATIONAL_AVG_2BR * 0.15 ? "negative" : diff < -NATIONAL_AVG_2BR * 0.15 ? "positive" : "neutral",
  });

  // 4. Bedroom size premium
  const studioTo4br = county.fmr_4br - county.fmr_studio;
  const premiumPct = ((studioTo4br / county.fmr_studio) * 100).toFixed(0);
  insights.push({
    text: `Rent ranges from $${county.fmr_studio.toLocaleString()}/mo (studio) to $${county.fmr_4br.toLocaleString()}/mo (4BR) — a ${premiumPct}% premium for the largest units. Families needing 3+ bedrooms should budget carefully, as larger units often exceed the affordable rent threshold.`,
    sentiment: "neutral",
  });

  // 5. Affordable monthly rent
  const affordableRent = Math.round((county.median_income * 0.3) / 12);
  const maxAffordableSize =
    affordableRent >= county.fmr_4br
      ? "4-bedroom"
      : affordableRent >= county.fmr_3br
        ? "3-bedroom"
        : affordableRent >= county.fmr_2br
          ? "2-bedroom"
          : affordableRent >= county.fmr_1br
            ? "1-bedroom"
            : affordableRent >= county.fmr_studio
              ? "studio"
              : "none of the listed unit sizes";
  insights.push({
    text: `At the median income, the affordable monthly rent (30% rule) is $${affordableRent.toLocaleString()}/mo, which covers up to a ${maxAffordableSize} at fair market rates.`,
    sentiment: maxAffordableSize === "none of the listed unit sizes" ? "negative" : maxAffordableSize === "studio" || maxAffordableSize === "1-bedroom" ? "neutral" : "positive",
  });

  return insights;
}
