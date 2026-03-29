export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  category: string;
  readingTime: number;
  content: string;
}

const posts: BlogPost[] = [
  {
    slug: "what-is-fair-market-rent",
    title: "What Is Fair Market Rent? HUD's Definition Explained",
    description:
      "HUD publishes Fair Market Rents every year that determine housing assistance for millions of Americans. Here's exactly what FMR means, how it's calculated, and why it matters for renters.",
    publishedAt: "2024-10-25",
    updatedAt: "2025-02-15",
    category: "Rent Basics",
    readingTime: 6,
    content: `
<h2>The Official Definition</h2>
<p>Fair Market Rent (FMR) is a dollar amount set annually by the U.S. Department of Housing and Urban Development (HUD) that represents the cost to rent a moderately-priced dwelling unit in a given area. FMRs are established for different bedroom sizes — from efficiency apartments to 4-bedroom units — for every metropolitan area and non-metropolitan county in the United States.</p>
<p>The statutory definition: FMR is the <strong>40th percentile of gross rents</strong> (including utilities) for standard quality rental housing units recently occupied by movers in a local housing market. This means 60% of comparable rentals cost more than the FMR, and 40% cost less.</p>

<h2>Why the 40th Percentile?</h2>
<p>HUD uses the 40th percentile — not the median (50th percentile) — deliberately. The goal is to give housing voucher holders access to a reasonable range of housing, not just the cheapest units on the market. A 40th percentile FMR means voucher holders can afford more than the cheapest 40% of rentals, giving them meaningful choice.</p>
<p>In some high-cost areas, HUD publishes <strong>Small Area Fair Market Rents (SAFMRs)</strong>, which set FMRs at the ZIP code level instead of the metro area level. This provides more precise payment standards in cities where rents vary dramatically by neighborhood.</p>

<h2>How FMR Is Calculated</h2>
<p>HUD calculates FMRs using two main data sources:</p>
<ol>
  <li><strong>American Community Survey (ACS)</strong> — the Census Bureau's annual survey of housing costs, used as the base estimate</li>
  <li><strong>CPI rent index</strong> — used to update the ACS figures to reflect current market conditions</li>
</ol>
<p>The calculation process:</p>
<ol>
  <li>HUD identifies recent movers (households that moved in the past 15 months) to capture current market rents rather than long-term tenant rents</li>
  <li>Gross rents (contract rent + utilities) are collected and ranked</li>
  <li>The 40th percentile value is selected as the FMR</li>
  <li>Values are adjusted annually using local CPI data</li>
</ol>

<h2>FMR by Bedroom Size</h2>
<p>HUD publishes FMRs for five unit sizes. The 2-bedroom FMR is the base unit; others are calculated from it using fixed bedroom ratios:</p>
<table>
  <thead><tr><th>Unit Size</th><th>Typical FMR Multiple of 2BR</th></tr></thead>
  <tbody>
    <tr><td>Efficiency (studio)</td><td>~0.77×</td></tr>
    <tr><td>1 Bedroom</td><td>~0.90×</td></tr>
    <tr><td>2 Bedroom (base)</td><td>1.00×</td></tr>
    <tr><td>3 Bedroom</td><td>~1.24×</td></tr>
    <tr><td>4 Bedroom</td><td>~1.47×</td></tr>
  </tbody>
</table>

<h2>Why FMR Matters for Section 8 Vouchers</h2>
<p>FMRs directly determine housing voucher payment standards under the Housing Choice Voucher (HCV) program (commonly called Section 8). Public Housing Authorities (PHAs) set their payment standards at 90–110% of the local FMR. When a voucher holder finds housing, the PHA pays the difference between 30% of the household's income and the actual rent, up to the payment standard.</p>
<p>If a unit's rent exceeds the payment standard, the tenant can still choose to rent it — but they must pay the difference out of pocket in addition to their 30% contribution.</p>

<h2>FY2024 Changes and Updates</h2>
<p>HUD updates FMRs annually, typically releasing new values in August for the following fiscal year (which runs October 1 – September 30). FY2024 FMRs reflected continued rent increases in most markets, with particularly large increases in Sun Belt metros like Phoenix, Austin, and Nashville. Some coastal markets saw modest decreases as rent growth moderated.</p>
<p>You can look up your area's current FMR using our database, which is updated with each new HUD release.</p>
`,
  },
  {
    slug: "is-my-rent-too-high",
    title: "How to Tell If You're Paying Too Much Rent",
    description:
      "Renters often overpay without knowing it. Here's how to use HUD data, local market comparisons, and income benchmarks to determine if your rent is fair — and what to do if it isn't.",
    publishedAt: "2024-09-10",
    category: "Renter Guides",
    readingTime: 5,
    content: `
<h2>The Benchmarks That Matter</h2>
<p>Determining whether your rent is "too high" requires comparing it against three different benchmarks: the HUD Fair Market Rent for your area, comparable units currently available in your market, and your own income-to-rent ratio. Each tells you something different.</p>

<h2>Benchmark 1: HUD Fair Market Rent</h2>
<p>HUD FMRs represent the 40th percentile of gross rents in your area. If your rent is significantly above the FMR for your unit size and location, you're paying more than 60% of renters in comparable units pay.</p>
<p>To find your area's FMR:</p>
<ol>
  <li>Use our calculator to find the current FMR for your county or metro area</li>
  <li>Select your bedroom size</li>
  <li>Remember: FMR is gross rent (includes utilities). If your landlord pays utilities, your contract rent should be lower than the FMR</li>
</ol>
<p>If your rent is more than 20% above FMR, investigate whether comparable units are available at lower prices in your area.</p>

<h2>Benchmark 2: Current Market Comparables</h2>
<p>FMR data can lag the market by 12–18 months. For the most current picture, check active listings directly:</p>
<ul>
  <li>Search Zillow, Apartments.com, and Craigslist for units comparable to yours (same bedroom count, similar neighborhood, similar condition)</li>
  <li>If similar units are listing for 10%+ less than what you pay, you're likely overpaying</li>
  <li>Check listings both in your exact neighborhood and in comparable nearby neighborhoods</li>
</ul>

<h2>Benchmark 3: Your Income-to-Rent Ratio</h2>
<p>The traditional guideline is to spend no more than 30% of gross income on housing. A more practical version for today's market: no more than 35% of gross income, or 45% if you have very low other fixed expenses.</p>
<table>
  <thead><tr><th>Annual Income</th><th>Max Monthly Rent (30%)</th><th>Stretch Rent (35%)</th></tr></thead>
  <tbody>
    <tr><td>$40,000</td><td>$1,000</td><td>$1,167</td></tr>
    <tr><td>$60,000</td><td>$1,500</td><td>$1,750</td></tr>
    <tr><td>$80,000</td><td>$2,000</td><td>$2,333</td></tr>
    <tr><td>$100,000</td><td>$2,500</td><td>$2,917</td></tr>
    <tr><td>$150,000</td><td>$3,750</td><td>$4,375</td></tr>
  </tbody>
</table>

<h2>Hidden Costs to Include</h2>
<p>When calculating your true rent burden, include all housing-related costs:</p>
<ul>
  <li>Monthly rent (obviously)</li>
  <li>Utilities not covered by landlord (electricity, gas, water)</li>
  <li>Parking fees (can be $100–$400/month in urban areas)</li>
  <li>Pet fees (monthly pet rent, not just deposits)</li>
  <li>Renters insurance ($15–$30/month — you should have this regardless)</li>
  <li>Common area fees or required storage fees</li>
</ul>

<h2>How to Negotiate Lower Rent</h2>
<p>If the data shows you're overpaying, here's how to approach the conversation with your landlord:</p>
<ol>
  <li>Gather 3–5 comparable listings at lower prices (print them out or screenshot them)</li>
  <li>Reference the HUD FMR for your unit size</li>
  <li>Frame the conversation around market data, not personal financial hardship</li>
  <li>Offer to sign a longer lease in exchange for a rent reduction</li>
  <li>Time the conversation: the best time is 60–90 days before your lease renewal, when the landlord still has time to find a new tenant but faces a real decision</li>
</ol>
<p>Landlords prefer keeping a good tenant at a slight discount over vacancy costs (1–2 months of lost rent) plus turnover costs. A reasonable request based on market data has a real chance of success.</p>
`,
  },
  {
    slug: "renter-rights-rent-increases",
    title: "Renter's Rights: When Can Your Landlord Raise Your Rent?",
    description:
      "Rent increases feel arbitrary, but they're governed by specific rules that vary by state and city. Here's what landlords can and can't do — and how to respond when they push the limits.",
    publishedAt: "2024-08-20",
    category: "Renter Guides",
    readingTime: 7,
    content: `
<h2>The Basic Framework</h2>
<p>Rent increase rules in the US operate at three levels: federal, state, and local. There is no federal limit on how much a landlord can raise rent. Instead, rules are set by individual states and — in cities with rent control — by local ordinances. This creates a patchwork of protections that vary dramatically by location.</p>

<h2>Rent Control: Which Cities Have It</h2>
<p>Rent control (also called rent stabilization) limits how much landlords can raise rent annually. It exists in only a handful of jurisdictions:</p>
<table>
  <thead><tr><th>City</th><th>Annual Increase Limit</th><th>Coverage</th></tr></thead>
  <tbody>
    <tr><td>New York City</td><td>CPI-based (typically 2–4%)</td><td>Rent-stabilized units (pre-1974 buildings, 6+ units)</td></tr>
    <tr><td>Los Angeles</td><td>3% or CPI, whichever is lower</td><td>Buildings built before 1978</td></tr>
    <tr><td>San Francisco</td><td>CPI-based (~60% of CPI)</td><td>Buildings built before 1979</td></tr>
    <tr><td>Washington, DC</td><td>CPI + 2%</td><td>Most rental units built before 1976</td></tr>
    <tr><td>Portland, OR</td><td>7% (state law)</td><td>Buildings 15+ years old, 4+ units</td></tr>
    <tr><td>Minneapolis, MN</td><td>3%</td><td>All residential rental units</td></tr>
  </tbody>
</table>
<p>Most US cities have no rent control. In those cities, landlords can raise rent to any amount, subject only to notice requirements.</p>

<h2>Notice Requirements by State</h2>
<p>Even without rent control, landlords must give advance notice before raising rent. The minimum notice period depends on your state and the size of the increase:</p>
<ul>
  <li><strong>California:</strong> 30 days for increases under 10%; 90 days for increases over 10%</li>
  <li><strong>New York:</strong> 30 days (non-rent-stabilized); stabilized units follow specific legal processes</li>
  <li><strong>Texas:</strong> No state law requirement — governed by your lease agreement</li>
  <li><strong>Florida:</strong> 30 days minimum written notice</li>
  <li><strong>Illinois:</strong> 30 days for month-to-month; 60 days for annual leases</li>
  <li><strong>Most other states:</strong> 30 days written notice</li>
</ul>

<h2>Fixed-Term Lease vs. Month-to-Month</h2>
<p>This is the most important distinction for rent increase rights:</p>
<ul>
  <li><strong>Fixed-term lease (12 months):</strong> Your landlord CANNOT raise rent during the lease term unless the lease specifically allows it. Period. If you signed a lease for $1,500/month through December 31, your rent is $1,500 through December 31.</li>
  <li><strong>Month-to-month:</strong> Your landlord can raise rent with proper notice (typically 30 days) before any new monthly period begins. Month-to-month tenants have much weaker protection against increases.</li>
</ul>

<h2>What Constitutes an Illegal Rent Increase</h2>
<p>A rent increase is illegal if:</p>
<ul>
  <li>It occurs during a fixed-term lease without lease authorization</li>
  <li>It exceeds the local rent stabilization cap (in controlled cities)</li>
  <li>Proper written notice wasn't provided</li>
  <li>It appears to be in retaliation for a tenant's protected action (filing a complaint, organizing with other tenants, requesting repairs)</li>
  <li>It targets protected characteristics (race, religion, national origin, family status, disability)</li>
</ul>

<h2>How to Respond to an Excessive Rent Increase</h2>
<ol>
  <li><strong>Verify your local rules</strong> — search "[your city/county] rent control" and "[your state] rent increase laws"</li>
  <li><strong>Check the notice validity</strong> — was it in writing, and was the notice period sufficient?</li>
  <li><strong>Document everything</strong> — save all written communications from your landlord</li>
  <li><strong>Contact your local tenant rights organization</strong> — most cities with rent control have tenant unions or housing advocacy groups that provide free advice</li>
  <li><strong>File a complaint</strong> — in rent-controlled cities, you can file with the local Rent Board or Housing Department if your landlord exceeds the legal cap</li>
</ol>
<p>In cities without rent control, your main recourse is to negotiate, move, or organize with other tenants to push for local ordinances.</p>
`,
  },
  {
    slug: "section-8-fair-market-rent-explained",
    title: "Section 8 Vouchers and Fair Market Rent: How They Work Together",
    description:
      "The Housing Choice Voucher program (Section 8) is built entirely around Fair Market Rents. Here's exactly how vouchers work, what landlords must accept, and the reality of finding housing with a voucher.",
    publishedAt: "2024-07-15",
    category: "Rent Basics",
    readingTime: 6,
    content: `
<h2>How the Housing Choice Voucher Program Works</h2>
<p>The Housing Choice Voucher (HCV) program, commonly known as Section 8, is the largest federal rental assistance program in the US, serving approximately 2.3 million households. Unlike public housing (where you live in a government-owned building), vouchers allow recipients to rent on the private market — theoretically any unit that meets program standards and whose owner agrees to participate.</p>

<h2>The FMR-Voucher Connection</h2>
<p>Fair Market Rents are the financial foundation of the voucher program. Every local Public Housing Authority (PHA) sets its <strong>payment standard</strong> — the maximum rent subsidy it will pay — at between 90% and 110% of the local FMR. HUD allows PHAs to go up to 120% with HUD approval.</p>
<p>The voucher math works like this:</p>
<ol>
  <li>The family pays 30% of their adjusted monthly income toward rent</li>
  <li>The PHA pays the difference between that 30% and the actual rent, up to the payment standard</li>
  <li>If rent exceeds the payment standard, the family can pay the difference — but they can't pay more than 40% of income on a new unit</li>
</ol>

<h2>Example Calculation</h2>
<table>
  <thead><tr><th>Factor</th><th>Amount</th></tr></thead>
  <tbody>
    <tr><td>Family's monthly income</td><td>$2,500</td></tr>
    <tr><td>Family's 30% contribution</td><td>$750</td></tr>
    <tr><td>Local FMR (2BR)</td><td>$1,400</td></tr>
    <tr><td>Payment standard (100% of FMR)</td><td>$1,400</td></tr>
    <tr><td>PHA subsidy</td><td>$650 ($1,400 - $750)</td></tr>
    <tr><td>If family rents at $1,600 (above payment standard)</td><td>Family pays $750 + $200 overage = $950</td></tr>
  </tbody>
</table>

<h2>What Landlords Must (and Don't Have to) Accept</h2>
<p>Here's a common misconception: landlords are <strong>not federally required</strong> to accept Section 8 vouchers. Federal fair housing law prohibits discrimination based on race, color, national origin, religion, sex, familial status, and disability — but "source of income" is not a protected class under federal law.</p>
<p>However, many states and cities have passed local laws requiring landlord participation:</p>
<ul>
  <li><strong>States requiring acceptance:</strong> California, New York, New Jersey, Illinois, Washington, Massachusetts, Minnesota, Connecticut, and others</li>
  <li><strong>Cities requiring acceptance:</strong> Many cities in states without statewide laws, including Chicago, Seattle, Denver, and others</li>
</ul>
<p>Where acceptance is required, landlords cannot refuse to rent to someone solely because they have a voucher. They can still apply standard screening criteria (credit, income verification, rental history).</p>

<h2>Tenant vs. Landlord Obligations</h2>
<p><strong>Tenant obligations:</strong></p>
<ul>
  <li>Pay their portion of rent on time</li>
  <li>Maintain the unit and comply with lease terms</li>
  <li>Report changes in income or family composition to the PHA</li>
  <li>Only use the unit as their primary residence</li>
</ul>
<p><strong>Landlord obligations (once they participate):</strong></p>
<ul>
  <li>Maintain the unit in habitable condition and pass annual HQS inspections</li>
  <li>Charge the same rent as they would to an unassisted tenant</li>
  <li>Give proper notice before eviction</li>
  <li>Cannot charge any fees prohibited under the lease</li>
</ul>

<h2>Voucher Portability</h2>
<p>One of the most valuable features of the HCV program is portability: after one year, voucher holders can move their voucher to another jurisdiction and use it in a different PHA's area. This theoretically allows families to move to higher-opportunity neighborhoods, better school districts, or where jobs are located — even across state lines.</p>
<p>In practice, portability is administratively complex, and many voucher holders don't use it because they face challenges finding willing landlords in higher-cost or higher-opportunity areas.</p>

<h2>The Waitlist Reality</h2>
<p>The demand for housing vouchers vastly exceeds supply. Most PHAs have waitlists that are years long; many have closed their waitlists entirely because demand is so high. A 2021 HUD report found that only about 1 in 4 eligible households receives any federal rental assistance. When a PHA opens its waitlist, it typically receives tens of thousands of applications for a few hundred slots.</p>
`,
  },
  {
    slug: "rent-vs-buy-decision-guide",
    title: "Rent vs. Buy: How to Make the Right Decision in Any Market",
    description:
      "Buying is not always better than renting. The rent vs. buy decision depends on your timeline, local price-to-rent ratios, and opportunity costs — here's the framework to get it right.",
    publishedAt: "2024-06-01",
    category: "Personal Finance",
    readingTime: 8,
    content: `
<h2>The False Premise: Renting Is Throwing Money Away</h2>
<p>The cultural narrative that renting is wasteful and buying builds wealth is deeply embedded — and often wrong. Renting gives you a service (housing) for a payment. Buying a home gives you an asset that may or may not appreciate, bundled with a very large, illiquid commitment. Both can be rational choices depending on your specific circumstances.</p>

<h2>The Price-to-Rent Ratio</h2>
<p>The single most useful metric for the rent-vs-buy decision is the <strong>price-to-rent ratio (P/R ratio)</strong>:</p>
<p><strong>P/R Ratio = Median Home Price ÷ Annual Rent for Equivalent Home</strong></p>
<p>As a rule of thumb:</p>
<ul>
  <li><strong>Below 15:</strong> Buying is clearly favored — you're purchasing for a low multiple of what you'd pay in rent</li>
  <li><strong>15–20:</strong> Either can make sense; depends on your timeline and expectations for appreciation</li>
  <li><strong>Above 20:</strong> Renting is likely better financially unless you expect strong appreciation</li>
  <li><strong>Above 25:</strong> Renting is almost certainly the better financial choice; you're paying a very high premium to own</li>
</ul>

<h2>P/R Ratios Across Major US Markets</h2>
<table>
  <thead><tr><th>City</th><th>Median Home Price</th><th>Annual Rent (3BR)</th><th>P/R Ratio</th><th>Verdict</th></tr></thead>
  <tbody>
    <tr><td>Detroit, MI</td><td>$110,000</td><td>$15,600</td><td>7.1</td><td>Buy</td></tr>
    <tr><td>Memphis, TN</td><td>$175,000</td><td>$16,800</td><td>10.4</td><td>Buy</td></tr>
    <tr><td>Columbus, OH</td><td>$290,000</td><td>$21,600</td><td>13.4</td><td>Buy or rent</td></tr>
    <tr><td>Austin, TX</td><td>$520,000</td><td>$28,800</td><td>18.1</td><td>Borderline</td></tr>
    <tr><td>Denver, CO</td><td>$580,000</td><td>$27,600</td><td>21.0</td><td>Lean rent</td></tr>
    <tr><td>San Francisco, CA</td><td>$1,300,000</td><td>$42,000</td><td>31.0</td><td>Rent</td></tr>
    <tr><td>Los Angeles, CA</td><td>$950,000</td><td>$36,000</td><td>26.4</td><td>Rent</td></tr>
  </tbody>
</table>

<h2>The Break-Even Timeline</h2>
<p>The P/R ratio doesn't capture transaction costs. Buying a home incurs 3–5% in closing costs upfront; selling incurs 5–6% in agent commissions. You need to stay in the home long enough for appreciation and equity buildup to overcome these frictional costs.</p>
<p>General break-even timeline estimates by market:</p>
<ul>
  <li>Low P/R markets (below 15): 2–4 years</li>
  <li>Moderate P/R markets (15–20): 4–7 years</li>
  <li>High P/R markets (above 20): 7–12+ years</li>
</ul>
<p>If you expect to move in fewer years than the break-even timeline, renting is almost certainly better financially.</p>

<h2>Hidden Costs of Owning</h2>
<p>First-time buyers often underestimate the true cost of homeownership:</p>
<ul>
  <li><strong>Property taxes:</strong> 0.5–2.5% of assessed value annually, forever</li>
  <li><strong>Homeowners insurance:</strong> $1,000–$4,000/year depending on location and home value</li>
  <li><strong>Maintenance and repairs:</strong> Budgeting 1–2% of home value annually is the standard recommendation</li>
  <li><strong>HOA fees:</strong> $200–$800+/month in many condo and planned communities</li>
  <li><strong>PMI:</strong> 0.5–1.5% of loan amount annually if you put down less than 20%</li>
</ul>
<p>For a $400,000 home, these additional costs can easily run $800–$1,200/month on top of the mortgage.</p>

<h2>The Opportunity Cost of the Down Payment</h2>
<p>A 20% down payment on a $500,000 home is $100,000. If instead you invested that $100,000 in a diversified index fund and rented, what would happen over 10 years? Historically, the S&P 500 has returned roughly 10% annually. $100,000 compounding at 10% for 10 years = $259,374.</p>
<p>The comparison isn't perfectly clean (home equity builds too; rental prices may rise), but this exercise illustrates that down payments have a real opportunity cost that homeownership enthusiasts rarely mention.</p>

<h2>When Renting Is Clearly Smarter</h2>
<ul>
  <li>You'll move within 3–5 years</li>
  <li>Local P/R ratio is above 20</li>
  <li>Your income is variable or uncertain</li>
  <li>You value flexibility over stability</li>
  <li>Current mortgage payments would significantly exceed comparable rent</li>
</ul>

<h2>When Buying Makes Sense</h2>
<ul>
  <li>You plan to stay 7+ years</li>
  <li>Local P/R ratio is below 15</li>
  <li>You have a stable income and an emergency fund beyond the down payment</li>
  <li>You want the forced savings mechanism of a mortgage</li>
  <li>You want to customize your living space without landlord approval</li>
</ul>
`,
  },
];

export function getAllPosts(): BlogPost[] {
  return posts.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getAllCategories(): string[] {
  return Array.from(new Set(posts.map((p) => p.category)));
}
