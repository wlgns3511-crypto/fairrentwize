/**
 * Long-form evergreen guides — US rental market and tenant law.
 * Hub pages that link deep into the state/county/metro matrix.
 * Each guide targets a high-intent renter or housing voucher question.
 */

export interface Guide {
  slug: string;
  title: string;
  description: string;
  intro: string; // HTML
  sections: Array<{ heading: string; html: string }>;
  faqs: Array<{ question: string; answer: string }>;
  category: string;
  updatedAt: string;
}

const u = '2026-04-10';

export const guides: Guide[] = [
  {
    slug: 'hud-fair-market-rent-explained',
    title: 'HUD Fair Market Rent Explained: What That 40th Percentile Actually Means',
    description: 'How HUD calculates Fair Market Rent, why it matters for Section 8 vouchers, the difference between 40th and 50th percentile areas, and the limitations renters and landlords need to know.',
    category: 'Methodology',
    updatedAt: u,
    intro: `<p>Fair Market Rent (FMR) is the single most important number in US rental housing policy. It is the amount the federal government uses to set Section 8 voucher limits, calculate how much rent a Housing Choice Voucher will cover, and determine eligibility for hundreds of HUD programs. Yet it is one of the most misunderstood numbers in real estate. This guide explains exactly how HUD calculates FMR, why some areas use the 50th percentile instead of the 40th, the methodology limitations, and what FMR actually means for renters, landlords, and voucher holders.</p>`,
    sections: [
      {
        heading: 'What Fair Market Rent actually measures',
        html: `<p>Fair Market Rent is HUD's estimate of <strong>the rent that would be paid for a moderate-quality, recently leased rental unit in a given area</strong>. It is calculated separately for each unit size (studio through 4-bedroom) and for each FMR area (typically a metropolitan area or a non-metro county).</p><p>The standard FMR is set at the <strong>40th percentile</strong> of gross rent for standard-quality units. That means 40 percent of recently rented units in the area cost less than the FMR, and 60 percent cost more. The intent is that voucher holders should be able to find adequate housing without competing for the cheapest 40 percent of the market — they get an extra 60 percent of the market range to choose from.</p>`,
      },
      {
        heading: 'How HUD calculates FMR',
        html: `<p>The formula combines several data sources, weighted and updated annually:</p><ol><li><strong>American Community Survey (ACS) base data:</strong> 5-year ACS gross rent (rent + utilities) for recent movers, used as the starting point for each metropolitan area or non-metro county.</li><li><strong>Recent Mover Factor:</strong> ACS data is rent for all units, but FMR targets <em>recently rented</em> units, which are typically 5 to 15 percent higher than long-term tenancies. HUD adjusts upward.</li><li><strong>CPI rent inflation factor:</strong> applied to bring the older ACS data forward to the current year.</li><li><strong>Local rent change adjustments:</strong> for areas with rapidly changing markets, HUD applies additional adjustments based on private data sources (Zillow, Apartment List, etc.).</li><li><strong>State minimum:</strong> FMR cannot fall below the state non-metro minimum.</li></ol><p>The result is published each October for the upcoming federal fiscal year. The 2026 FMRs were published in October 2025.</p>`,
      },
      {
        heading: '40th percentile vs 50th percentile areas',
        html: `<p>HUD designates some areas as <strong>50th percentile FMR areas</strong>. These areas have:</p><ul><li>Concentrated voucher use in poverty census tracts (more than 25 percent of vouchers in the bottom-quintile census tracts)</li><li>Difficulty placing voucher holders in opportunity neighborhoods</li></ul><p>In these areas, raising FMR to the 50th percentile gives voucher holders enough purchasing power to compete for housing in middle-income neighborhoods, not just the cheapest areas. As of recent program updates, about 50 metropolitan areas use the 50th percentile FMR including parts of Atlanta, Baltimore, Chicago, Hartford, and several other historically segregated cities.</p><p>The 50th percentile typically results in 5 to 15 percent higher voucher payment standards compared to the 40th percentile in the same area.</p>`,
      },
      {
        heading: 'Why FMR is not the same as "average rent"',
        html: `<p>Three key differences from typical "average rent" reports:</p><ol><li><strong>FMR includes utilities.</strong> "Gross rent" means rent plus tenant-paid utilities. If your area's FMR is $1,800 for a 2-bedroom, that includes the cost of electricity, gas, and water that the tenant would normally pay separately. Listed apartment rents are usually "rent only" and exclude utilities, so FMR will look lower than typical advertised rents.</li><li><strong>FMR is for the FMR area as a whole, not a specific neighborhood.</strong> A metro area FMR averages expensive central neighborhoods with cheaper outer suburbs. The FMR will be lower than central-city rent and higher than far-suburb rent.</li><li><strong>FMR uses standard-quality units, not luxury.</strong> Newer construction, amenity-heavy buildings, and renovated units in desirable neighborhoods will be well above FMR. Older units in less-desirable areas will be at or below FMR.</li></ol><p>This is why renters often see FMR and conclude "no apartment costs that little in my area" — they are looking at high-end advertised rentals, not the standard-quality stock that FMR targets.</p>`,
      },
      {
        heading: 'How vouchers actually use FMR',
        html: `<p>Public Housing Authorities (PHAs) administer Housing Choice Vouchers using FMR as the foundation, but with important adjustments:</p><ul><li><strong>Payment Standard:</strong> the maximum voucher subsidy. PHAs set this between 90% and 110% of FMR, with HUD approval for higher (up to 120%) in tight markets.</li><li><strong>Tenant payment:</strong> 30 percent of adjusted income, or the minimum rent set by the PHA, whichever is higher.</li><li><strong>Voucher subsidy:</strong> Payment Standard minus tenant payment, capped at the actual rent if the unit is below the Payment Standard.</li></ul><p>Example: A family with $20,000 annual income (and $18,000 adjusted income) gets a voucher in an area with $1,800 2-bedroom FMR and a 100% Payment Standard.</p><ul><li>Payment Standard: $1,800/month</li><li>Tenant pays: $18,000 × 30% ÷ 12 = $450/month</li><li>Maximum subsidy: $1,800 - $450 = $1,350/month</li></ul><p>If they find an apartment for $1,600/month, the voucher pays $1,150 and the family pays $450 (their 30% obligation, plus $0 supplement). If they find one for $2,000/month, the voucher still pays the maximum $1,350 and the family pays $650 (the regular $450 plus $200 supplement, which must not exceed 40 percent of income at lease-up).</p>`,
      },
      {
        heading: 'Limitations of FMR data',
        html: `<p>Three known weaknesses to be aware of:</p><ol><li><strong>Lag.</strong> FMR uses 5-year ACS data with adjustment factors. In rapidly changing markets, FMR can be 10 to 20 percent below current asking rents. HUD has expanded "Small Area FMR" programs to address this in some metros.</li><li><strong>Geography too coarse.</strong> A single metro FMR averages expensive and cheap neighborhoods together. Voucher holders trying to access expensive neighborhoods cannot do so on FMR. Small Area FMR (SAFMR) sets ZIP-code-level FMRs in selected metros (Baltimore, Chicago, Hartford, Philadelphia, and others) to address this.</li><li><strong>Quality blind spot.</strong> FMR targets "standard quality" but does not differentiate between an old unit and a renovated one at the same nominal rent. Voucher holders sometimes get pushed into substandard housing because the truly comparable units are above FMR.</li></ol><p>Use our <a href="/state/">state pages</a> for current FMR data by state and bedroom count, and the <a href="/calculator/">rent calculator</a> to estimate voucher math for your situation.</p>`,
      },
    ],
    faqs: [
      { question: 'What is HUD Fair Market Rent?', answer: 'HUD Fair Market Rent (FMR) is the federal government\'s estimate of the rent that would be paid for a moderate-quality rental unit in a given area, set at the 40th percentile of recently rented units. It is the basis for Section 8 voucher payment standards and many other HUD programs.' },
      { question: 'Why is FMR lower than the rents I see online?', answer: 'Three reasons. First, FMR includes utilities; advertised rents typically do not. Second, FMR targets standard-quality units; advertised rents skew toward newer, higher-end buildings. Third, FMR uses 5-year averaged data with adjustment factors, so it lags hot markets by 6 to 18 months.' },
      { question: 'What is the difference between 40th and 50th percentile FMR?', answer: 'Most areas use 40th percentile (40% of units cost less than the FMR). About 50 metropolitan areas use 50th percentile FMR to give voucher holders enough purchasing power to access middle-income neighborhoods, not just the cheapest areas.' },
      { question: 'Can a Section 8 voucher pay more than FMR?', answer: 'Yes, indirectly. Public Housing Authorities can set the Payment Standard between 90% and 110% of FMR (up to 120% with approval). Tenants can also pay above the Payment Standard out of pocket, up to 40% of their income at initial lease-up.' },
      { question: 'How often is FMR updated?', answer: 'Annually. HUD publishes new FMRs each October for the upcoming federal fiscal year (October 1 to September 30). Small Area FMRs in selected metros are also updated annually with the same schedule.' },
      { question: 'Where can I look up the FMR for my area?', answer: 'Our state pages list FMR by state with breakdowns to county and metro level. HUD\'s official FMR lookup tool is available on huduser.gov. For Section 8 voucher specifics, contact your local Public Housing Authority.' },
    ],
  },
  {
    slug: '30-percent-rent-rule-is-broken',
    title: 'The 30% Rent Rule Is Broken: A Better Affordability Framework',
    description: 'Why "spend no more than 30% of income on rent" fails for low-income households, the residual income model that replaces it, and how to actually budget for rent at any income level.',
    category: 'Affordability',
    updatedAt: u,
    intro: `<p>The "30 percent of income on rent" rule is the most quoted benchmark in housing affordability — and the most misleading. It originated in 1969 as a federal limit on what voucher holders could be required to pay, not as a budgeting recommendation for everyone. Applied universally, it dramatically overstates affordable rent for high earners and dramatically understates the financial pain it causes low earners. This guide explains why the 30 percent rule fails, the residual income framework that replaced it among housing economists, and how to actually budget for rent at your income level.</p>`,
    sections: [
      {
        heading: 'Where the 30 percent rule came from',
        html: `<p>The "rent should be no more than 30 percent of income" rule has a specific origin: the 1969 Brooke Amendment to the Housing and Urban Development Act. Senator Edward Brooke pushed through a federal limit that public housing tenants could not be charged more than 25 percent of their income in rent. In 1981, the limit was raised to 30 percent, and that number became the standard for all federal housing programs.</p><p>The rule was designed as a <strong>cap</strong> on what the government could charge, not as a recommendation for what private renters should spend. Over time, the 30 percent number escaped its original context and became the de facto rule for "rent affordability" generally — including by realtors, mortgage lenders, and personal finance writers.</p>`,
      },
      {
        heading: 'Why the 30 percent rule fails low-income renters',
        html: `<p>The mathematical problem: 30 percent of a $20,000 income leaves $14,000 for everything else. 30 percent of a $200,000 income leaves $140,000. The rule treats both as equally "affordable," even though one household has 10 times more residual income to spend on food, transportation, healthcare, and savings.</p><p>Empirical research consistently shows that low-income households spending exactly 30 percent on rent are <strong>severely cost-burdened</strong> in practice — they cannot afford basic non-housing needs. Housing economists have proposed the <strong>residual income model</strong> as a replacement: instead of a fixed percentage, calculate how much money a household needs for non-housing essentials, then allow rent up to whatever is left over.</p><p>For a household earning $20,000 with $14,000 in non-housing essential needs (food, transport, healthcare, etc.), affordable rent is at most $6,000/year — 30 percent of income would have allowed $6,000 too. But for a household with $30,000 in non-housing needs, the same 30 percent rule allows the same $6,000, even though the actual residual after essentials is negative. The 30 percent rule punishes households whose costs are higher.</p>`,
      },
      {
        heading: 'The residual income model',
        html: `<p>The residual income approach asks one question: <strong>what does a household need to live on, after paying rent?</strong> The model uses BLS Consumer Expenditure Survey data to set minimum non-housing costs by household size and region. The framework:</p><ol><li>Find the <strong>minimum non-housing budget</strong> for the household size and region (e.g., a family of 4 in a metropolitan area might need $35,000/year for food, transport, healthcare, clothing, child care, and minimal savings).</li><li>Subtract from gross income to find <strong>residual after essentials</strong>.</li><li>That residual is the maximum affordable rent.</li></ol><p>Example: A family of 4 with $50,000 income in a metro area with $35,000 minimum essentials has $15,000 residual = $1,250/month max affordable rent. The 30 percent rule would have allowed $1,250 (coincidentally the same), but the residual model is far stricter at lower incomes — a $30,000 family would have $0 affordable rent under residual income, but $750/month under the 30 percent rule.</p><p>This is why low-income households spending "only" 30 percent of income on rent are still financially squeezed — the rule allows for rent that leaves them with insufficient money for everything else.</p>`,
      },
      {
        heading: 'Why the rule fails high-income renters too',
        html: `<p>At the other end of the income spectrum, the 30 percent rule allows much more rent than is financially smart. A household earning $200,000 could spend $60,000/year ($5,000/month) on rent under the 30 percent rule. But spending that much eliminates the savings rate needed for retirement, an emergency fund, or eventual home purchase.</p><p>For high earners, the practical limit is set by competing priorities — savings (15–20% of income), retirement contributions, debt payoff, and discretionary spending. Spending the full 30 percent on rent forces other essential financial activities to be skipped.</p><p>A more accurate framework for high earners: calculate fixed obligations (savings, debts, retirement), subtract from income, allocate 70 percent of the remainder to housing, leaving 30 percent for variable spending. This typically caps rent at 20 to 25 percent of gross income for households making over $150,000.</p>`,
      },
      {
        heading: 'A practical framework by income bracket',
        html: `<p>Use these as honest affordability targets, replacing the 30 percent rule:</p><ul><li><strong>Under $25,000/year:</strong> No more than 25 percent on rent. Even this often forces difficult tradeoffs. Section 8 voucher eligibility is critical for households at this level.</li><li><strong>$25,000–$50,000:</strong> No more than 28 percent on rent. Build at least a $1,000 emergency fund before any non-essential spending.</li><li><strong>$50,000–$80,000:</strong> 28–32 percent acceptable in moderate-cost metros. Reduce target if other debts (student loans, car) push total fixed costs above 40 percent of income.</li><li><strong>$80,000–$150,000:</strong> 25–30 percent. Save aggressively (15 percent+ of income) before spending more on rent.</li><li><strong>Over $150,000:</strong> 20–25 percent. Beyond this, the marginal value of nicer housing rarely exceeds the value of higher savings or other priorities.</li></ul>`,
      },
      {
        heading: 'How to apply this to a rental decision',
        html: `<p>Three-step process:</p><ol><li><strong>Estimate your minimum non-housing budget</strong> for your household size and area. Add up food, transport, healthcare, debt payments, child care, and a baseline savings rate of 10 percent.</li><li><strong>Subtract from gross income.</strong> The remainder is your absolute maximum affordable rent. This is often well below what the 30 percent rule allows.</li><li><strong>Cross-check against the income-bracket framework.</strong> If your max from step 2 is higher than the income-bracket recommendation, use the lower number.</li></ol><p>Use our <a href="/calculator/">rent calculator</a> with your actual income and known expenses to find the realistic ceiling, not a one-size-fits-all percentage.</p>`,
      },
    ],
    faqs: [
      { question: 'Where did the 30 percent rule come from?', answer: 'The 1969 Brooke Amendment set 25 percent as the maximum rent that could be charged to public housing tenants. It was raised to 30 percent in 1981. The number was a cap on what the government could charge poor renters, not a recommendation for what anyone should spend.' },
      { question: 'Is spending more than 30 percent of income on rent always bad?', answer: 'Not necessarily. Housing economists call households spending more than 30 percent "cost-burdened" and over 50 percent "severely cost-burdened," but these labels apply best to lower-middle-income households. High earners can comfortably spend more than 30 percent because residual income is large; low earners are often crushed even at 25 percent.' },
      { question: 'What is the residual income model?', answer: 'A housing affordability framework that calculates the minimum non-housing budget a household needs (food, transport, healthcare, etc.), then allows rent up to whatever is left over. It is more accurate than fixed percentages because it accounts for household size, regional cost of living, and competing essential expenses.' },
      { question: 'How much rent should I pay if I make $50,000?', answer: 'Roughly $1,150 to $1,400 per month, depending on debt obligations and household size. The 30 percent rule would allow $1,250, but if you have student loans, a car payment, or dependents, the realistic maximum is lower.' },
      { question: 'Is rent included in the 30 percent calculation, or rent + utilities?', answer: 'Conventionally rent + utilities (gross rent) is the right measure. HUD\'s 30 percent threshold is based on gross rent, not just the rent line on the lease. Always include average utility costs when judging affordability.' },
      { question: 'Why do banks use 28/36 instead of 30 percent?', answer: 'Because 28/36 is the mortgage qualification standard that includes total housing cost (PITI) + total debt. The 30 percent rule is a renter-specific shortcut. Both are imperfect simplifications of the same idea: housing should not crowd out other essential spending.' },
    ],
  },
  {
    slug: 'rent-control-by-state',
    title: 'Rent Control by State: A Renter\'s Map of What\'s Actually Protected',
    description: 'Which states allow rent control, which prohibit it, the just-cause eviction states, annual increase caps, and what protections renters actually have where you live.',
    category: 'Tenant Law',
    updatedAt: u,
    intro: `<p>If you ask 10 renters what rent control means in their state, you will get 10 different answers — most of them wrong. The reality is that the United States has a patchwork of rent control, just-cause eviction, annual increase caps, and state preemption laws that vary dramatically by state and even by city. This guide cuts through the confusion: which states allow rent control, which prohibit it, the actual annual cap rules in states that have them, and what protections you have if you rent.</p>`,
    sections: [
      {
        heading: 'The state preemption map',
        html: `<p>Most US states <strong>prohibit local rent control</strong> through state preemption laws. Even if a city like Austin or Denver wanted to pass rent control, state law forbids it. These preemption states cover roughly 32 of 50 states, including most of the South, Mountain West, and Midwest:</p><ul><li><strong>Hard preemption (no rent control allowed under any circumstances):</strong> Texas, Florida, Georgia, North Carolina, South Carolina, Tennessee, Arizona, Nevada, Colorado (limited recent reform), Indiana, Iowa, Kansas, Louisiana, Michigan, Mississippi, Missouri, Oklahoma, Utah, Virginia, Wisconsin, and others.</li><li><strong>Soft preemption (rent control allowed only with state approval or under narrow conditions):</strong> a small number of states.</li></ul><p>If you live in a preemption state, your landlord can raise the rent any amount at lease renewal — there is no statutory ceiling. Your only protection is the lease terms themselves and federal anti-discrimination law.</p>`,
      },
      {
        heading: 'States with statewide rent control',
        html: `<p>Only a handful of states have statewide rent control laws:</p><ul><li><strong>California (Tenant Protection Act of 2019, AB 1482):</strong> rent increases capped at 5 percent + local CPI, with a hard ceiling of 10 percent per year. Applies to most rentals statewide except single-family homes (unless owned by a corporation), buildings less than 15 years old, and a few other exemptions. Local cities can pass stricter rent control on top of the state law.</li><li><strong>Oregon (SB 608 of 2019):</strong> rent increases capped at 7 percent + CPI, with a hard ceiling of 10 percent. Applies to buildings 15+ years old. The first state to pass statewide rent control.</li><li><strong>Minnesota (St. Paul, Minneapolis):</strong> St. Paul passed a 3 percent annual cap in 2021 (later modified to allow higher increases for new construction). Minneapolis voted in favor of rent control authority in 2021 but has not yet implemented a specific ordinance. State law allows local rent control by referendum.</li><li><strong>Maine (Portland):</strong> Portland passed a citywide rent control ordinance with a 10 percent annual cap, tied to CPI.</li><li><strong>New Jersey:</strong> some New Jersey cities have local rent control ordinances under home-rule authority.</li><li><strong>New York:</strong> rent stabilization in NYC and parts of Westchester, Nassau, and Rockland counties, with annual increases set by local Rent Guidelines Boards (typically 1–4 percent per year).</li></ul>`,
      },
      {
        heading: 'Just-cause eviction protections',
        html: `<p>"Just cause" laws prohibit landlords from evicting tenants without specified reasons (non-payment, lease violation, owner move-in, etc.). Even where rent is uncapped, just-cause protection is meaningful because it prevents retaliatory or arbitrary eviction. States with statewide just-cause laws include:</p><ul><li><strong>California:</strong> after 12 months of tenancy, eviction requires just cause (paired with the rent cap above).</li><li><strong>New Jersey:</strong> robust just-cause protections under the Anti-Eviction Act (16 specified reasons required for eviction).</li><li><strong>Oregon:</strong> after the first year of tenancy, only listed for-cause reasons or qualifying landlord no-fault reasons (with relocation assistance) allow eviction.</li><li><strong>Washington (statewide as of 2021):</strong> just-cause required for non-renewal of leases longer than 6 months.</li><li><strong>New Hampshire:</strong> only the listed just causes apply.</li></ul><p>In states without just cause, landlords can decline to renew a lease without giving any reason, even after years of on-time tenancy. This effectively allows "renewal-time" rent increases of any size — refuse to pay, and they decline renewal.</p>`,
      },
      {
        heading: 'Local rent control beyond statewide rules',
        html: `<p>In states without preemption, individual cities have their own rent control laws. The most significant local programs:</p><ul><li><strong>New York City:</strong> rent stabilization covers about 1 million units (most pre-1974 buildings with 6+ units). Annual increases set by the Rent Guidelines Board, typically 1.5 to 3 percent for 1-year leases. Older "rent controlled" units (pre-1971 continuous tenancy) are a separate, much smaller category.</li><li><strong>San Francisco:</strong> city ordinance covers most pre-1979 buildings; annual increases set at 60% of CPI.</li><li><strong>Los Angeles:</strong> Rent Stabilization Ordinance covers most pre-1978 buildings; annual increases capped at 3 to 8 percent depending on building.</li><li><strong>Washington DC:</strong> covers most pre-1976 buildings (5+ units); annual increases tied to CPI.</li><li><strong>Berkeley, Oakland, West Hollywood, Santa Monica:</strong> longstanding local rent control on covered units.</li><li><strong>Other:</strong> Newark, Jersey City, Hoboken (NJ), Boston (limited), Chicago (limited), Maplewood (NJ).</li></ul>`,
      },
      {
        heading: 'What "rent control" usually does NOT cover',
        html: `<p>Even in cities with strong rent control, common exemptions include:</p><ul><li><strong>New construction:</strong> usually anything built within the last 15–30 years</li><li><strong>Single-family homes:</strong> often exempt unless owned by a corporation (CA exception)</li><li><strong>Owner-occupied small buildings:</strong> typically duplexes/triplexes where the owner lives</li><li><strong>Vacancy decontrol:</strong> some jurisdictions allow a market reset when a tenant leaves voluntarily (vacated rent goes back to market, then re-stabilizes)</li><li><strong>Luxury units:</strong> very high-rent units may be exempt</li></ul><p>The rules differ city by city. Always verify with your local rent board before assuming a unit is or is not covered.</p>`,
      },
      {
        heading: 'What to do if you have no rent control',
        html: `<p>For renters in preemption states without local rent control, the only real protections are contractual:</p><ol><li><strong>Negotiate longer leases.</strong> A 24-month lease locks in rent for two years. Many landlords offer modest discounts for long-term commitments.</li><li><strong>Negotiate cap clauses at renewal.</strong> Some landlords will write a "no more than X percent at renewal" clause into the original lease.</li><li><strong>Time your move strategically.</strong> Vacancy rates rise in winter. Landlords are more flexible on rent and lease terms in November–February than in May–August.</li><li><strong>Document everything.</strong> Even without rent control, tenants have rights against retaliation, discrimination, and uninhabitable conditions. Keep all communication in writing.</li></ol>`,
      },
    ],
    faqs: [
      { question: 'Which states have statewide rent control?', answer: 'California (5%+CPI cap, max 10%), Oregon (7%+CPI cap, max 10%), and a few others with city-level programs (NY, NJ, Maine). Most states have state preemption laws that prohibit rent control entirely.' },
      { question: 'Can my landlord raise the rent any amount in Texas?', answer: 'Yes. Texas state law preempts local rent control. Your landlord can raise the rent any amount at lease renewal. Your only protection is the terms of your existing lease and federal anti-discrimination laws.' },
      { question: 'What is just-cause eviction?', answer: 'A legal protection requiring landlords to have a specific allowed reason (non-payment, lease violation, owner move-in, etc.) before evicting a tenant. Without just-cause protection, a landlord can simply decline to renew the lease without explanation.' },
      { question: 'Does rent control apply to single-family homes?', answer: 'Usually no. Most rent control programs (including California AB 1482) exempt single-family homes unless they are owned by corporations. New construction is also typically exempt for the first 15 to 30 years.' },
      { question: 'What is the difference between rent control and rent stabilization?', answer: '"Rent control" historically referred to strict freezes on rent (NYC pre-1971 units, very few left). "Rent stabilization" caps annual increases but allows increases tied to inflation. Most modern programs are technically stabilization, even though they are colloquially called rent control.' },
      { question: 'Can I be evicted from a rent-controlled unit?', answer: 'Yes, for cause: non-payment, lease violation, illegal activity, or qualifying landlord move-in or substantial rehabilitation. Most rent control programs include just-cause eviction protection, so arbitrary eviction is not allowed, but for-cause eviction remains possible.' },
    ],
  },
  {
    slug: 'spot-overpriced-rental',
    title: 'How to Spot an Overpriced Rental in 5 Minutes',
    description: 'A practical method for quickly judging whether a rental listing is fairly priced or 25% above market, using comp methodology, days-on-market signals, and amenity adjustments.',
    category: 'Renter Strategy',
    updatedAt: u,
    intro: `<p>Most renters look at one or two listings, see a number, and have no idea whether it is fair or 25 percent above market. Landlords know this, especially in fast-moving markets, and price aggressively to test what the market will bear. This guide gives you a 5-minute method for evaluating any rental listing — comparing it to actual recent leases, reading days-on-market signals, adjusting for amenities, and identifying when a "good deal" is actually a trap.</p>`,
    sections: [
      {
        heading: 'Step 1: Find 5 honest comps',
        html: `<p>The fastest way to evaluate a rental is to find 5 comparable units that have <em>actually rented</em> in the last 60 days. "Listed" rents are aspirational; "rented" rents are real. Tools:</p><ul><li><strong>Zillow rent estimates:</strong> uses recent leases to project a fair rent. Cross-check with at least one other source.</li><li><strong>Apartment List, Rentometer:</strong> aggregate listings into a percentile distribution.</li><li><strong>Craigslist filtered to recent listings:</strong> a unit relisted multiple times within 60 days is likely overpriced.</li><li><strong>Local Facebook rental groups:</strong> private deals often reflect honest market rates better than corporate listings.</li><li><strong>Our <a href="/state/">state and metro pages</a>:</strong> for HUD Fair Market Rent baseline by area.</li></ul><p>Comparable means: same number of bedrooms, similar square footage (within 15 percent), same neighborhood (not just same ZIP code), and similar age and quality. Ignore comps with fundamentally different features (parking, in-unit laundry, view).</p>`,
      },
      {
        heading: 'Step 2: Calculate the median per square foot',
        html: `<p>Take your 5 comps and calculate price per square foot for each. The median is your fair-market reference.</p><p>Example: 5 comparable 1-bedroom units in your target area:</p><ul><li>Unit A: 750 sqft, $1,800 = $2.40/sqft</li><li>Unit B: 700 sqft, $1,650 = $2.36/sqft</li><li>Unit C: 800 sqft, $1,950 = $2.44/sqft</li><li>Unit D: 720 sqft, $1,750 = $2.43/sqft</li><li>Unit E: 780 sqft, $1,850 = $2.37/sqft</li></ul><p>Median: $2.40/sqft. The unit you are looking at is 750 sqft, asking $2,100 = $2.80/sqft. That's 17 percent above median — overpriced. The fair-market rent for this unit is closer to $1,800.</p><p>If your target unit is within 5 percent of the median per-square-foot, it is fairly priced. 5 to 10 percent above median: slightly overpriced but possibly negotiable. 10 to 20 percent above median: significantly overpriced. Above 20 percent: walk away or negotiate hard.</p>`,
      },
      {
        heading: 'Step 3: Check days on market',
        html: `<p>Days on market (DOM) is the single best signal of whether a unit is overpriced. In normal markets, fairly-priced rentals lease within 14 to 21 days. A unit sitting at 30+ days has been rejected by the market — and the only reason is price (or condition you have not seen yet).</p><ul><li><strong>0–14 days on market:</strong> standard. Tells you nothing one way or the other.</li><li><strong>15–30 days:</strong> mildly overpriced or has a hidden negative (location, layout, condition).</li><li><strong>30–60 days:</strong> significantly overpriced. Landlord is testing the market. You have leverage to negotiate down 5 to 10 percent.</li><li><strong>60+ days:</strong> deeply overpriced. The landlord is anchored to a wishful number. You can often negotiate down 10 to 20 percent.</li></ul><p>How to find DOM: Zillow, Apartments.com, and most rental sites show "listed X days ago." For a private listing, ask the landlord directly: "How long has the unit been available?" Their answer (and reluctance to answer) is informative.</p>`,
      },
      {
        heading: 'Step 4: Adjust for amenities',
        html: `<p>Same unit, same neighborhood, but different amenities can justify $100 to $300/month difference. Add or subtract from your fair-rent estimate:</p><ul><li><strong>In-unit laundry:</strong> +$75 to $150/month</li><li><strong>Off-street parking:</strong> +$100 to $300/month (more in dense urban areas)</li><li><strong>Dishwasher:</strong> +$25 to $50/month</li><li><strong>Outdoor space (balcony, yard):</strong> +$50 to $200/month</li><li><strong>Central A/C (vs window units):</strong> +$50 to $100/month</li><li><strong>Modern kitchen/bathroom:</strong> +$100 to $200/month</li><li><strong>Top-floor / corner unit:</strong> +$25 to $75/month</li><li><strong>Pet-allowed:</strong> +$50/month equivalent value</li></ul><p>If the unit is asking $300 above your sqft-based estimate but has $400 worth of legitimate amenity premium, it is fairly priced. If it has $0 amenity premium, you are paying $300/month for nothing.</p>`,
      },
      {
        heading: 'Step 5: Red flags that signal a bad deal',
        html: `<p>Beyond price, watch for these hidden costs that turn a "fair deal" into an overpayment:</p><ul><li><strong>"Plus utilities" with no estimate:</strong> the landlord may know utilities run $300/month and is hiding it. Always ask for the average utility cost from the previous tenant.</li><li><strong>Mandatory amenity fees:</strong> some buildings charge $50 to $200/month for "package room," "amenity access," or "tech fees" that are not in the rent number.</li><li><strong>Required renters insurance through specific provider:</strong> sometimes 2 to 3x more expensive than shopping for it yourself.</li><li><strong>Pet rent + pet fee:</strong> $35–$75/month pet rent plus $300 non-refundable fee is common, often not in the headline price.</li><li><strong>"First and last + security deposit":</strong> can double the upfront cost. Many states cap security deposits at 1 month, but landlords still ask.</li><li><strong>"Application fee" charged per applicant:</strong> $50 to $100 per person, non-refundable, and sometimes used as a cash grab.</li></ul><p>Always calculate the <strong>total first-year cost</strong>, not just the monthly rent. A $2,000/month unit with $2,500 in fees and $200/month in extras costs $26,900 in year one — equivalent to a $2,242/month rent.</p>`,
      },
    ],
    faqs: [
      { question: 'How do I know if a rental is overpriced?', answer: 'Calculate the median price per square foot of 5 comparable recently-rented units in the same neighborhood. If your target unit is more than 10 percent above median per square foot (after adjusting for amenities), it is overpriced. Days on market over 30 confirms this.' },
      { question: 'What are realistic comp adjustments?', answer: 'In-unit laundry: $75–150/month. Parking: $100–300/month (urban). Dishwasher: $25–50/month. Outdoor space: $50–200/month. Central AC: $50–100/month. Modernized kitchen/bath: $100–200/month. Pet-allowed: $50/month equivalent.' },
      { question: 'Is days on market a reliable signal?', answer: 'Yes, especially over 30 days. Fairly-priced rentals lease in 14 to 21 days in most markets. A unit sitting 30+ days has been rejected by the market, almost always because of price (or a hidden problem you have not yet seen).' },
      { question: 'Should I lowball a landlord?', answer: 'For a unit that is overpriced and has been on market for 30+ days, offering 10 to 15 percent below asking is reasonable. For a fairly-priced unit in normal market conditions, lowballing usually loses you the unit to the next applicant.' },
      { question: 'What is the difference between listed and rented rent?', answer: 'Listed rent is what the landlord is asking. Rented rent is what tenants actually agreed to pay. The two can differ by 5 to 15 percent in slow markets. When evaluating fair price, use rented rent (Zillow rent estimates, Rentometer, recent lease comps) not listed rent.' },
      { question: 'Are large apartment complexes more or less negotiable than private landlords?', answer: 'Private landlords are generally more negotiable on rent itself but less flexible on lease terms. Large complexes are less negotiable on rent but offer concessions (1 month free, waived application fees, free parking) that effectively reduce the cost.' },
    ],
  },
  {
    slug: 'negotiating-rent-when-landlords-budge',
    title: 'Negotiating Rent: When Landlords Actually Budge',
    description: 'The vacancy timing, lease length tradeoffs, and concession types that actually save renters money — and the math behind whether free month or base rent reduction is the better deal.',
    category: 'Renter Strategy',
    updatedAt: u,
    intro: `<p>Most renters never negotiate. They see the asking price, accept it, and sign. This is a mistake. Landlords have meaningful flexibility on rent, lease terms, and concessions, but only at specific moments and for specific kinds of tenants. Knowing when landlords actually budge — and what to ask for — can save you $1,000 to $5,000 over a typical 12-month lease. This guide explains the negotiating windows that work, the math behind concessions versus rent reductions, and the tactics that get results without alienating the landlord.</p>`,
    sections: [
      {
        heading: 'When landlords actually budge: the timing windows',
        html: `<p>Landlord flexibility is not constant — it changes dramatically across the year. Three windows where negotiation is realistic:</p><ol><li><strong>October to February.</strong> The vacancy "winter" — fewer renters are moving, demand is lowest, and units sitting vacant cost the landlord directly. Listings posted in November typically rent for 5 to 10 percent less than identical units in May. Always negotiate hardest in this window.</li><li><strong>The week before the listed start date.</strong> If the landlord listed for "available November 1" and it is October 25, they are losing money for every day the unit stays empty. Showing up willing to sign immediately is worth 3 to 8 percent in rent reduction.</li><li><strong>At lease renewal.</strong> Landlords hate vacancy and turnover (cleaning, painting, listing fees, application processing). A reliable existing tenant who threatens to leave is worth a 3 to 5 percent rent reduction, especially in soft markets. Always ask before signing the renewal.</li></ol>`,
      },
      {
        heading: 'When landlords will not budge',
        html: `<p>Three situations where negotiation is wasted effort:</p><ul><li><strong>May to August in hot markets.</strong> Peak moving season, multiple applicants per unit. Landlords have no reason to negotiate when 5 other people want the same place.</li><li><strong>Just-listed units in good condition.</strong> A unit that hit the market 3 days ago has too much optionality. Wait 2 to 3 weeks for the landlord's anxiety about vacancy to grow.</li><li><strong>Large institutional landlords with rigid pricing systems.</strong> Real-estate-tech firms (Equity Residential, AvalonBay, Greystar) use revenue management software that prices each unit dynamically. Site staff have very limited authority to negotiate. Concessions (1 month free) are more achievable than headline rent reductions.</li></ul>`,
      },
      {
        heading: 'What to negotiate for',
        html: `<p>Five things you can ask for, ranked by what most landlords will actually agree to:</p><ol><li><strong>A free month or partial month at signing.</strong> Easy to give because it does not affect the headline rent for next year's renewal. Landlords use this as the standard concession.</li><li><strong>Waived application fees, security deposit reductions, or no last-month-rent.</strong> Reduces upfront cash for the renter at almost no cost to the landlord (especially if the renter has a strong credit history).</li><li><strong>Free or reduced parking.</strong> $100 to $300/month value. Common in dense urban areas where the landlord has unsold parking inventory.</li><li><strong>Lower rent, in exchange for a longer lease.</strong> Locking in 18 or 24 months gives the landlord guaranteed income; in return, ask for 3 to 5 percent off the headline rent.</li><li><strong>Smaller annual increase locked in writing.</strong> "I'll sign at this rate, but the renewal increase is capped at X percent." Landlords without rent control will sometimes agree.</li></ol>`,
      },
      {
        heading: 'The free-month vs base-rent reduction math',
        html: `<p>If a landlord offers a choice between "1 month free" and "lower base rent," do the math:</p><p><strong>Option A:</strong> $2,000/month with 1 month free on a 12-month lease. Total: $22,000 for 12 months = effective $1,833/month.</p><p><strong>Option B:</strong> $1,900/month with no concession. Total: $22,800 for 12 months.</p><p>Option A saves $800 over the year, but the headline rent in your lease is $2,000. Why does this matter? At renewal, the landlord raises from the headline rent ($2,000 + 5 percent = $2,100), not the effective rent ($1,833 + 5 percent = $1,925). Over 3 years, this difference compounds.</p><p>If you plan to stay multiple years, <strong>always prefer the lower base rent</strong> over a free month. If you plan to move after one year, free months can be slightly better depending on the math. In some markets the "lower base rent" option doesn't exist — landlords prefer concessions because they preserve the headline rent for marketing.</p>`,
      },
      {
        heading: 'How to actually have the conversation',
        html: `<p>Three rules for negotiating successfully:</p><ol><li><strong>Be ready to sign immediately.</strong> Negotiation power comes from offering certainty. "I'll take it tomorrow at $X" is far stronger than "I might consider it at $X."</li><li><strong>Anchor your offer in data, not feelings.</strong> "I notice this unit has been listed for 35 days, and similar 1-bedrooms in this area are renting for $1,750." This is hard to argue with. "It's too expensive" is easy to dismiss.</li><li><strong>Ask for one thing, not everything.</strong> "I'd love to sign at $1,800 instead of $1,900" is more likely to succeed than a list of 5 demands. After they agree to one, you can sometimes ask for one more.</li></ol><p>Be polite. Landlords have memories. The tone of the negotiation affects whether they treat you well during the lease term, respond to maintenance requests quickly, and renew you on favorable terms.</p>`,
      },
      {
        heading: 'A template script',
        html: `<p>Use this verbatim if you are not sure how to start:</p><blockquote><p>"Hi, I'm really interested in the unit at [address]. I've looked at a few comparable places in the neighborhood and I notice this one is asking $X, which is somewhat above the recent comps I've seen at $Y. I have strong references and a stable income, and I'm ready to sign and move in [date]. Would you be open to $Y? If that doesn't work, would you consider [alternative ask: free month / waived fees / parking included]?"</p></blockquote><p>This frames you as serious, informed, and reasonable. Most landlords respond better to this than to either silence ("just take what they ask") or aggressive haggling.</p>`,
      },
    ],
    faqs: [
      { question: 'Is it normal to negotiate rent?', answer: 'In private and small-landlord rentals, yes — landlords expect some negotiation, especially in slow seasons. In large institutional buildings (corporate-owned), headline rent negotiation is harder, but concessions (free month, waived fees) are still achievable.' },
      { question: 'When is the best month to rent?', answer: 'October to February for the lowest prices. Demand is lowest, vacancy rates are highest, and landlords are most willing to discount. May to August is the worst time — peak demand, no negotiation room.' },
      { question: 'Should I take a free month or a lower base rent?', answer: 'Lower base rent if you plan to stay 2+ years, because annual increases compound off the headline rent. Free month if you only plan to stay 1 year and the discount is meaningful. Always do the math for your specific numbers.' },
      { question: 'How much can I negotiate down?', answer: 'In normal markets: 3 to 8 percent below asking is realistic. In slow markets or for units sitting 30+ days: 10 to 15 percent. In hot markets with multiple applicants: 0 to 2 percent. Never expect more than 15 percent off without a structural reason.' },
      { question: 'Will negotiating make the landlord less likely to rent to me?', answer: 'Done politely with data, no. Landlords prefer informed tenants who will pay rent reliably over uninformed tenants who pay full price but cause problems. Aggressive or rude negotiation hurts your chances; polite, data-backed negotiation usually does not.' },
      { question: 'Can I negotiate at lease renewal?', answer: 'Yes, and many tenants do not realize this. Landlords value stable, on-time-paying tenants and would rather give a 3 percent discount than face the cost of vacancy and turnover. Always ask before signing the renewal — the worst answer is "no."' },
    ],
  },
];

export function getAllGuides(): Guide[] {
  return guides;
}

export function getGuideBySlug(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}
