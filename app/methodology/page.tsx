import type { Metadata } from "next";
import { AuthorBox } from "@/components/AuthorBox";
import {
  METHODOLOGY_VINTAGE,
  ENTITY_VINTAGE,
  ABOUT_VINTAGE,
  LEGAL_REVIEWED,
  SITE_PUBLISHED,
} from "@/lib/authorship";

export const metadata: Metadata = {
  title: "Our Methodology — How FairRentWize Builds Its Rent Data",
  description:
    "How FairRentWize sources US rent data — anchored in HUD Fair Market Rents (FMR), Census ACS 2023 5-Year housing variables, and NLIHC Out of Reach 2025 housing wage estimates.",
  alternates: { canonical: "/methodology/" },
  openGraph: { url: "/methodology/" },
};

export default function MethodologyPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1>Our Methodology</h1>
      <p className="lead text-lg text-slate-600">
        Rent is the largest single line item in most US household budgets. You
        deserve to know exactly where every figure on FairRentWize comes from,
        what it represents, and what it cannot tell you about a specific
        listing.
      </p>

      <h2>Three primary sources, rendered verbatim from the upstream release</h2>
      <p>
        Every rent number, income figure, and housing-wage estimate on this
        site is drawn from one of three official, public sources and rendered
        verbatim from the upstream agency&apos;s release. Each surface preserves
        HUD&apos;s, Census&apos;s, or NLIHC&apos;s own suppression decisions; where
        the agency withholds a value, the page reports insufficient-data and a
        notice anchored to the original release. The numbers are what HUD, the
        Census Bureau, and NLIHC publish, mapped to county and metro slugs and
        presented with consistent formatting.
      </p>

      <h3>1. HUD Fair Market Rents (FY 2025)</h3>
      <p>
        County and metro rent figures come from the{" "}
        <a
          href="https://www.huduser.gov/portal/datasets/fmr.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          HUD Fair Market Rents
        </a>{" "}
        program. HUD publishes FMRs annually for every metropolitan area and
        non-metro county. They are the official figures used to set payment
        standards for the{" "}
        <a
          href="https://www.hud.gov/topics/housing_choice_voucher_program_section_8"
          target="_blank"
          rel="noopener noreferrer"
        >
          Section 8 Housing Choice Voucher
        </a>{" "}
        program.
      </p>
      <p>
        FMR is set at roughly the 40th percentile of recent gross rents (rent
        + utilities) for non-luxury, decent-quality units in the local rental
        market. We publish FMRs by bedroom size: studio, 1BR, 2BR, 3BR, 4BR.
        The 2BR figure is the most commonly cited and the only one published
        as a state aggregate by NLIHC.
      </p>
      <p>
        We pull HUD FMRs from the public ArcGIS service that hosts the
        FY 2025 release. Each county-level value is tagged in our database
        with one of three source kinds:
      </p>
      <ul>
        <li>
          <strong><code>NCNTY</code></strong> — HUD publishes a direct non-metro
          county FMR for this county. Used as-is.
        </li>
        <li>
          <strong><code>METRO_N</code></strong> — HUD publishes a single metro
          FMR that covers exactly one county. The metro FMR is applied to that
          county.
        </li>
        <li>
          <strong><code>METRO_M_FANOUT</code></strong> — The county sits inside
          a multi-county HUD metro area. We use the OMB Census-defined CBSA
          delineation (July 2023) to identify the metro's constituent counties,
          then apply the metro-area FMR (or, where HUD publishes sub-area FMRs
          such as in Los Angeles, New York, Boston, and 19 other CBSAs, the
          relevant sub-area).
        </li>
      </ul>

      <h3>2. Census ACS 2023 5-Year Estimates</h3>
      <p>
        Demographic and affordability variables come from the{" "}
        <a
          href="https://www.census.gov/programs-surveys/acs/data.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          American Community Survey 2023 5-Year
        </a>{" "}
        public-use estimates, accessed via the Census Bureau's data API. We
        pull four ACS tables, all at county and state level:
      </p>
      <ul>
        <li>
          <strong>B25008</strong> — total occupied housing units, split by
          tenure (owner vs. renter). Used for the renter-share statistic.
        </li>
        <li>
          <strong>B25070</strong> — gross rent as a percentage of household
          income (the rent-burden distribution). We aggregate the categories at
          or above 30% of income to compute the cost-burdened rate.
        </li>
        <li>
          <strong>B19013</strong> — median household income (12-month
          inflation-adjusted dollars).
        </li>
        <li>
          <strong>B25031</strong> — median gross rent by bedroom size, at the
          county level only. Used as a cross-check against HUD FMR, since
          ACS rent and HUD FMR target different percentiles.
        </li>
      </ul>
      <p>
        ACS estimates carry margins of error (MOE). For ACS gross rent
        (B25031), we store the MOE alongside the estimate and publish a
        relative-MOE figure in the database. We do not currently suppress
        county pages on MOE alone; we display the estimate as published.
      </p>

      <h3>3. NLIHC Out of Reach 2025</h3>
      <p>
        State-level housing-wage and renter-affordability statistics come from
        the National Low Income Housing Coalition's{" "}
        <a
          href="https://nlihc.org/oor"
          target="_blank"
          rel="noopener noreferrer"
        >
          Out of Reach 2025
        </a>{" "}
        report. NLIHC compiles HUD FMRs into state aggregates, then computes
        the housing wage — the hourly wage a renter must earn working full-time
        to afford a 2-bedroom unit at FMR without spending more than 30% of
        income on housing.
      </p>
      <p>For each state we store:</p>
      <ul>
        <li>
          <strong>2BR housing wage</strong> — the dollar/hour figure plus the
          state's national rank.
        </li>
        <li>
          <strong>Annual income needed for 2BR</strong> — the housing wage
          times 2,080 hours.
        </li>
        <li>
          <strong>Mean renter wage</strong> — NLIHC's estimate of what an
          average renter actually earns per hour, used for the affordability
          gap calculation.
        </li>
        <li>
          <strong>Renter household count</strong> — the count of renter
          households in the state, from NLIHC's tabulation.
        </li>
      </ul>
      <p>
        We store these as raw $/hr and counts. We do not reduce them to a
        single composite "tier" or letter grade.
      </p>

      <h2>How affordability is computed</h2>
      <p>
        Where we publish a "rent burden" or "income needed" figure, the math
        is the standard{" "}
        <a
          href="https://www.hud.gov/topics/rental_assistance/rental_housing_overview"
          target="_blank"
          rel="noopener noreferrer"
        >
          HUD 30% rule
        </a>
        : a household is considered cost-burdened when more than 30% of gross
        income goes to rent (including utilities for FMR comparisons). For a
        county with 2BR FMR of <code>R</code> and median household income{" "}
        <code>I</code>:
      </p>
      <ul>
        <li>
          <strong>Affordable monthly rent</strong> = <code>(I × 0.30) / 12</code>
        </li>
        <li>
          <strong>Income needed for 2BR FMR</strong> ={" "}
          <code>(R × 12) / 0.30</code>
        </li>
        <li>
          <strong>Rent burden at FMR</strong> ={" "}
          <code>(R × 12) / I × 100%</code>
        </li>
      </ul>
      <p>
        The county-level "rent burdened %" we display is the share of renter
        households reporting 30%+ of income spent on housing in ACS B25070
        — it is a measured share, not a derived calculation.
      </p>

      <h2>RentBurdenTier: composing HUD FMR &times; Census ACS income into a reader-help label</h2>
      <p>
        Every state, county, and metro page surfaces a single 5-tier <strong>RentBurdenTier</strong> label that
        composes the HUD FMR for a 2-bedroom unit with the Census ACS B19013 median household income for the
        same geography. The math is identical to the "rent burden at FMR" formula above:
      </p>
      <pre>rent_burden_pct = (fmr_2br &times; 12) / acs_median_household_income &times; 100</pre>
      <p>The five tiers and their cutoffs:</p>
      <ul>
        <li><strong>Tier A &mdash; Affordable</strong>: rent_burden_pct &lt; 18%</li>
        <li><strong>Tier B &mdash; Below median</strong>: 18% &le; rent_burden_pct &lt; 22%</li>
        <li><strong>Tier C &mdash; Median</strong>: 22% &le; rent_burden_pct &lt; 26% (national-typical band)</li>
        <li><strong>Tier D &mdash; Approaching cost-burdened</strong>: 26% &le; rent_burden_pct &lt; 30%</li>
        <li>
          <strong>Tier E &mdash; Cost-burdened</strong>: rent_burden_pct &ge; 30%, anchored to the HUD federal
          statutory cost-burden threshold in 24 CFR 5.628 and 42 USC 1437a.
        </li>
      </ul>
      <p>
        At the current FY 2025 HUD FMR &times; ACS 2019-2023 5-Year snapshot, the 50-state distribution is 6 / 13 / 23 / 5
        (incl. DC) / 4 across Tiers A through E. The four Tier E states are New York (34%), Florida (32%),
        California (32%), and Hawaii (31%). See the{" "}
        RentBurdenTier methodology guide for the full breakdown and the
        four limitations (within-area variation, renter-sub-population income gap, voucher-eligibility
        separation, and utility-vs-contract rent distinction) that the framework deliberately does not capture.
      </p>
      <p>
        On metro pages, the tier is computed against the <em>parent state</em> ACS B19013 median household
        income rather than a single CBSA-level income figure, because CBSAs span multiple counties with
        different incomes. On state and county pages, the geography matches the income geography directly.
      </p>

      <h2>OOR Housing Wage Multiple: composing NLIHC housing wage &times; mean renter wage</h2>
      <p>
        State pages also surface a 5-tier <strong>OOR Housing Wage Multiple</strong> derived from NLIHC Out of Reach 2025.
        Where RentBurdenTier reads HUD FMR against the Census ACS B19013 all-household median income, the OOR Multiple
        reads HUD FMR against the renter sub-population's wage. The math:
      </p>
      <pre>multiple = nlihc_housing_wage_2br / nlihc_mean_renter_wage</pre>
      <ul>
        <li>
          <strong>nlihc_housing_wage_2br</strong> &mdash; NLIHC OOR 2025 modeled hourly wage required to afford a HUD FMR
          2-bedroom at 30% of income, 40 hours/week, 52 weeks/year. This is anchored to the HUD federal cost-burden
          definition (24 CFR 5.628 / 42 USC 1437a).
        </li>
        <li>
          <strong>nlihc_mean_renter_wage</strong> &mdash; NLIHC OOR 2025 mean hourly wage of wage-and-salary renters in
          the jurisdiction, derived from Current Population Survey (CPS) data.
        </li>
      </ul>
      <p>The five tiers and their cutoffs:</p>
      <ul>
        <li><strong>Tier A &mdash; Renter wage covers FMR</strong>: multiple &lt; 1.10&times;</li>
        <li><strong>Tier B &mdash; Modest gap</strong>: 1.10 &le; multiple &lt; 1.25&times;</li>
        <li><strong>Tier C &mdash; Typical gap</strong>: 1.25 &le; multiple &lt; 1.45&times; (national-typical band)</li>
        <li><strong>Tier D &mdash; Persistent gap</strong>: 1.45 &le; multiple &lt; 1.65&times;</li>
        <li><strong>Tier E &mdash; Structural labor-market failure</strong>: multiple &ge; 1.65&times;</li>
      </ul>
      <p>
        At the NLIHC OOR 2025 snapshot, the 51-jurisdiction distribution is 3 / 15 / 15 / 12 / 6 across Tiers A through E.
        Tier E captures the top decile of housing-wage-to-renter-wage gaps nationally (HI 2.24&times;, MD 1.75&times;,
        RI 1.74&times;, NH 1.68&times;, VT 1.68&times;, NJ 1.67&times;). The state page also surfaces the DOL FLSA
        federal $7.25/hour minimum-wage equivalent (hours per week needed at federal min wage to clear HUD FMR), as a
        constant cross-state floor reference. See the{" "}
        OOR Multiple methodology guide for the full breakdown.
      </p>

      <h2>FMR County Variance Tier: within-state HUD FMR 2BR coefficient of variation</h2>
      <p>
        State pages also surface a 5-tier <strong>FMR County Variance Tier</strong> that quantifies how much HUD FY 2025
        Fair Market Rent for a 2-bedroom varies across counties within a state. The math is the population coefficient
        of variation (CoV = standard deviation / mean) of fmr_2br across all counties in the state with HUD FMR coverage:
      </p>
      <pre>cov = sqrt(mean((fmr_2br_i - mean(fmr_2br))²)) / mean(fmr_2br)</pre>
      <p>Cutoffs and tier labels:</p>
      <ul>
        <li><strong>Tier A &mdash; Geographically homogeneous</strong>: CoV &lt; 11%</li>
        <li><strong>Tier B &mdash; Modest dispersion</strong>: 11% &le; CoV &lt; 15%</li>
        <li><strong>Tier C &mdash; Typical urban-rural spread</strong>: 15% &le; CoV &lt; 20%</li>
        <li><strong>Tier D &mdash; Significant metro premium</strong>: 20% &le; CoV &lt; 28%</li>
        <li>
          <strong>Tier E &mdash; Coastal / metro outlier</strong>: CoV &ge; 28% (top decile of US states, where state-level
          aggregates mask a coastal/metro vs. balance-of-state split &mdash; NY 39%, CA 37%, CO 31%, VA 31%)
        </li>
      </ul>
      <p>
        States with fewer than 3 counties of HUD FMR coverage in our counties table return insufficient-data and do not
        receive a tier label. Tier E is a strong signal that the state page's headline FMR aggregate is not representative
        of any specific county; readers should navigate to the /county/ or /metro/ page instead. See the{" "}
        FMR County Variance methodology guide for the full state-by-state
        breakdown.
      </p>

      <h2>FairRent Interpretation: 6-DominantSignal composite across the three levers</h2>
      <p>
        The state page surfaces a single composite verdict that classifies the state into one of six mutually exclusive
        <strong> DominantSignal</strong> categories by reading the three deterministic lever outputs (RentBurdenTier
        &times; OOR Multiple &times; FMR County Variance) in priority order:
      </p>
      <ol>
        <li>
          <strong>CoastalCrisis</strong> &mdash; RentBurdenTier E AND OOR Multiple D/E AND FMR Variance D/E. All three
          signals stacked high. 2 jurisdictions: CA, FL.
        </li>
        <li>
          <strong>WageFloorFailure</strong> &mdash; OOR Multiple E. The renter sub-population's mean wage structurally
          cannot clear HUD FMR within the HUD 30% threshold (24 CFR 5.628). 6 jurisdictions: HI, MD, NH, NJ, RI, VT.
        </li>
        <li>
          <strong>HighVarianceCountyLottery</strong> &mdash; FMR Variance E. The state-level aggregate hides a coastal/
          metro vs. balance-of-state split. 3 jurisdictions: CO, NY, VA.
        </li>
        <li>
          <strong>BurdenedButEarningAboveWage</strong> &mdash; RentBurdenTier D/E AND OOR Multiple A/B. The all-household
          Census ACS median masks a renter sub-population earning above the all-household mean. 1 jurisdiction: DC.
        </li>
        <li>
          <strong>AffordableStable</strong> &mdash; RentBurdenTier A/B AND OOR Multiple A/B AND FMR Variance not E. All
          three lever signals comfortably low. 16 jurisdictions concentrated in the Plains, Midwest, and Appalachia.
        </li>
        <li>
          <strong>QuietSqueeze</strong> &mdash; fallback. RentBurdenTier C/D AND OOR Multiple C/D AND FMR Variance C/D.
          National-typical middle band; no single lever hits an extreme but structural rent pressure exists. 23
          jurisdictions.
        </li>
      </ol>
      <p>
        The verdict is rendered as a 4-paragraph synthesis (verdict / lever stack / labor-market read / next-step
        planner) with a tone color reflecting the dominant signal severity (emerald / sky / amber / rose). See the{" "}
        FairRent Interpretation methodology guide for the priority logic.
      </p>

      <h2>Update frequency</h2>
      <ul>
        <li>
          <strong>HUD FMR</strong> — every October, effective the federal
          fiscal year beginning October 1. We refresh within days of each
          release.
        </li>
        <li>
          <strong>Census ACS 5-Year</strong> — annually in December, with a
          12-18 month lag.
        </li>
        <li>
          <strong>NLIHC Out of Reach</strong> — annually in summer, after
          HUD's FMR release.
        </li>
      </ul>

      <h2>Limitations you should know about</h2>
      <ul>
        <li>
          <strong>FMR is 40th-percentile, not market median.</strong> FMR
          targets the affordable end of decent-quality stock. Asking rents on
          listing sites are usually higher than FMR — sometimes substantially
          so in fast-moving metros.
        </li>
        <li>
          <strong>FMR includes utilities; many listings do not.</strong>{" "}
          HUD's gross rent includes utilities. A listing that says
          "$1,800 + utilities" should be compared to FMR after estimating
          utility cost (typically $100-$200/month).
        </li>
        <li>
          <strong>Sub-county splits are HUD-defined, not OMB-defined.</strong>{" "}
          In 22 large CBSAs, HUD splits the metro into multiple FMR sub-areas.
          We pick one sub-area per metro slug for display (the
          highest-population umbrella where ambiguous), so a single metro page
          may not match the exact FMR of a small portion of the metro.
        </li>
        <li>
          <strong>State aggregates are NLIHC's, not ours.</strong> The 2BR FMR
          and housing-wage figures shown on state pages come directly from
          NLIHC OOR 2025. They differ slightly from a population-weighted
          average of HUD's county-level FMRs because NLIHC's methodology
          accounts for renter-household counts.
        </li>
        <li>
          <strong>ACS estimates have margins of error.</strong> For small
          counties, ACS median rent and income estimates can have wide MOEs.
          We display the published estimate as-is.
        </li>
        <li>
          <strong>Not legal or housing advice.</strong> For decisions
          involving contracts or disputes, work with a qualified attorney or
          housing counselor.
        </li>
      </ul>

      <h2>Cross-reference and verification</h2>
      <ul>
        <li>
          <a
            href="https://www.huduser.gov/portal/datasets/fmr.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            HUD User FMR datasets
          </a>{" "}
          — the primary FMR source.
        </li>
        <li>
          <a
            href="https://www.huduser.gov/portal/dataset/fmr-api.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            HUD FMR API documentation
          </a>{" "}
          — the official API used by automated tools.
        </li>
        <li>
          <a
            href="https://www.census.gov/data/developers/data-sets/acs-5year.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Census ACS 5-Year API
          </a>{" "}
          — the source for B25008, B25070, B19013, and B25031.
        </li>
        <li>
          <a href="https://nlihc.org/oor" target="_blank" rel="noopener noreferrer">
            NLIHC Out of Reach 2025
          </a>{" "}
          — the source for state housing-wage and renter-wage figures.
        </li>
        <li>
          <a
            href="https://www.census.gov/geographies/reference-files/time-series/demo/metro-micro/delineation-files.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            OMB CBSA delineation files
          </a>{" "}
          — used to map counties to metro areas for the METRO_M_FANOUT path.
        </li>
      </ul>

      <h2>Corrections and feedback</h2>
      <p>
        If a published HUD, ACS, or NLIHC figure disagrees with what you see
        here, please <a href="/contact">contact us</a> with the source URL and
        the discrepancy. We re-run the full HUD + ACS + NLIHC pipeline on each
        release, so any correction we make is rebaselined rather than patched.
      </p>

      <h2>Page-level vintage</h2>
      <p>
        FairRentWize separates "when was this dataset refreshed?" from "when
        was this page last substantively re-written?" Each surface anchors its
        published / dateModified to one of the layers below; nothing on the
        site claims a "today" freshness that isn't real.
      </p>
      <table>
        <thead>
          <tr>
            <th>Vintage layer</th>
            <th>Last reviewed</th>
            <th>What it covers</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Entity</strong></td>
            <td><time dateTime={ENTITY_VINTAGE}>{ENTITY_VINTAGE}</time></td>
            <td>State, county, metro detail pages and the rent database (HUD FMR + ACS + NLIHC re-ingest).</td>
          </tr>
          <tr>
            <td><strong>Methodology</strong></td>
            <td><time dateTime={METHODOLOGY_VINTAGE}>{METHODOLOGY_VINTAGE}</time></td>
            <td>This page (data sources, formulas, limitations).</td>
          </tr>
          <tr>
            <td><strong>About</strong></td>
            <td><time dateTime={ABOUT_VINTAGE}>{ABOUT_VINTAGE}</time></td>
            <td>The /about/ page (who runs the site, scope, correction process).</td>
          </tr>
          <tr>
            <td><strong>Legal</strong></td>
            <td><time dateTime={LEGAL_REVIEWED}>{LEGAL_REVIEWED}</time></td>
            <td>Privacy policy, terms of service, disclaimer.</td>
          </tr>
          <tr>
            <td><strong>Site</strong></td>
            <td><time dateTime={SITE_PUBLISHED}>{SITE_PUBLISHED}</time></td>
            <td>Original publication date of FairRentWize.</td>
          </tr>
        </tbody>
      </table>

      <p className="text-sm text-slate-500 border-t pt-4 mt-8">
        This methodology page was last reviewed on{" "}
        <time dateTime={METHODOLOGY_VINTAGE}>{METHODOLOGY_VINTAGE}</time>.
        Material changes to how we source or compute the data will be
        reflected here before they reach production pages.
      </p>

      <AuthorBox vintage={METHODOLOGY_VINTAGE} source="Methodology page: HUD FY2025 FMR pipeline, ACS 2019-2023 5-Year tables (B25008, B25070, B19013, B25031), and NLIHC Out of Reach 2025 housing wage." />
    </article>
  );
}
