import type { Metadata } from "next";

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

      <h2>Three primary sources, no proprietary modeling</h2>
      <p>
        Every rent number, income figure, and housing-wage estimate on this
        site is drawn from one of three official, public sources. We do not
        run a proprietary statistical model on top of them, do not impute
        missing values, and do not blend them into a composite "FairRentWize
        rent index." The numbers are what HUD, the Census Bureau, and NLIHC
        publish, mapped to county and metro slugs and presented with consistent
        formatting.
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

      <p className="text-sm text-slate-500 border-t pt-4 mt-8">
        This methodology page was last reviewed in April 2026. Material
        changes to how we source or compute the data will be reflected here
        before they reach production pages.
      </p>
    </article>
  );
}
