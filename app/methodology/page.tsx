import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Methodology — How FairRentWize Builds Its Rent Data",
  description:
    "How FairRentWize sources US rent data — anchored in HUD Fair Market Rents (FMR), the program used to set Section 8 voucher payment standards, plus Census ACS rent statistics.",
  alternates: { canonical: "/methodology/" },
  openGraph: { url: "/methodology/" },
};

export default function MethodologyPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1>Our Methodology</h1>
      <p className="lead text-lg text-slate-600">
        Rent is the largest single line item in most US household budgets.
        You deserve to know exactly where our rent figures come from, what
        they represent, and what they cannot tell you about a specific
        listing.
      </p>

      <h2>Primary source: HUD Fair Market Rents</h2>
      <p>
        Every metro and county rent figure on FairRentWize is anchored in
        the{" "}
        <a
          href="https://www.huduser.gov/portal/datasets/fmr.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          US Department of Housing and Urban Development (HUD) Fair
          Market Rents (FMR)
        </a>{" "}
        program. HUD publishes FMRs annually for every US metropolitan
        area and non-metro county, and they are the official figures
        used to set payment standards for the{" "}
        <a
          href="https://www.hud.gov/topics/housing_choice_voucher_program_section_8"
          target="_blank"
          rel="noopener noreferrer"
        >
          Section 8 Housing Choice Voucher
        </a>{" "}
        program.
      </p>

      <h2>What FMR actually measures</h2>
      <p>
        FMR is set at roughly the 40th percentile of recent gross rents
        (rent + utilities) for non-luxury, decent-quality units in the
        local rental market. The 40th percentile choice is deliberate:
        it&apos;s low enough to give voucher-holders a meaningful market,
        and high enough to ensure they can find units that meet HUD&apos;s
        habitability standards. For non-vouchered renters, FMR is one of
        the most useful neutral benchmarks available.
      </p>
      <p>For each metro we publish:</p>
      <ul>
        <li>
          <strong>FMR by bedroom size</strong> &mdash; studio, 1BR, 2BR,
          3BR, 4BR. The 2BR figure is the most commonly cited.
        </li>
        <li>
          <strong>Median household income</strong> &mdash; from the
          Census ACS, used to compute affordability.
        </li>
        <li>
          <strong>Vacancy rate</strong> &mdash; from Census ACS housing
          vacancy data, indicating how tight the local market is.
        </li>
        <li>
          <strong>Rent burden</strong> &mdash; the 2BR FMR as a
          percentage of median monthly income, with 30% as the standard
          affordability threshold.
        </li>
      </ul>

      <h2>How HUD calculates FMR</h2>
      <ol>
        <li>
          Start with the most recent five-year ACS median gross rent
          for the area.
        </li>
        <li>
          Apply a recent-mover factor (using one-year ACS data for
          areas large enough) to capture how recent leases differ from
          longer-term tenants.
        </li>
        <li>
          Adjust forward using BLS CPI rent index data to account for
          time between the ACS reference period and the FMR effective
          date.
        </li>
        <li>
          Set the 2BR FMR at the 40th percentile of the resulting
          distribution.
        </li>
        <li>
          Derive other bedroom sizes using HUD&apos;s standard
          multipliers (1BR is roughly 0.86 of 2BR, 3BR is roughly 1.25
          of 2BR, varying by area).
        </li>
      </ol>

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
          &mdash; the primary source.
        </li>
        <li>
          <a
            href="https://www.huduser.gov/portal/dataset/fmr-api.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            HUD FMR API documentation
          </a>{" "}
          &mdash; the official API.
        </li>
        <li>
          <a
            href="https://www.census.gov/topics/housing.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            US Census Bureau Housing
          </a>{" "}
          &mdash; the underlying ACS data.
        </li>
        <li>
          <a
            href="https://www.bls.gov/cpi/factsheets/owners-equivalent-rent-and-rent.htm"
            target="_blank"
            rel="noopener noreferrer"
          >
            BLS CPI Rent Index
          </a>{" "}
          &mdash; the BLS rent index used by HUD to update FMR forward
          in time.
        </li>
      </ul>

      <h2>Update frequency</h2>
      <p>
        HUD publishes new FMRs every October, effective for the federal
        fiscal year beginning October 1. We refresh our dataset within
        days of each release. Census ACS underlying data updates
        annually with a 12-18 month lag.
      </p>

      <h2>Limitations you should know about</h2>
      <ul>
        <li>
          <strong>Metro-level resolution.</strong> FMRs are published at
          the metropolitan area or non-metro county level. HUD does
          publish &ldquo;Small Area FMRs&rdquo; (SAFMRs) at the ZIP code
          level for selected metros where vouchers concentrate.
        </li>
        <li>
          <strong>40th percentile, not market median.</strong> FMR
          targets the affordable end of decent-quality stock. Median
          advertised rents on listing sites are usually higher.
        </li>
        <li>
          <strong>FMR includes utilities, listings often
          don&apos;t.</strong> HUD&apos;s gross rent includes utilities.
          A listing that says &ldquo;$1,800 + utilities&rdquo; should be
          compared to FMR after estimating utility cost.
        </li>
        <li>
          <strong>Lag.</strong> In a fast-moving rental market, FMR may
          understate or overstate current asking rents by 10-20%.
        </li>
        <li>
          <strong>Not legal or housing advice.</strong> For decisions
          involving contracts or disputes, work with a qualified
          attorney or housing counselor.
        </li>
      </ul>

      <h2>Corrections and feedback</h2>
      <p>
        If a published HUD figure disagrees with what you see here,
        please <a href="/contact">contact us</a> with the metro and the
        HUD User URL.
      </p>

      <p className="text-sm text-slate-500 border-t pt-4 mt-8">
        This methodology page was last reviewed in March 2026. Material
        changes to how we source or compute the data will be reflected
        here before they reach production pages.
      </p>
    </article>
  );
}
