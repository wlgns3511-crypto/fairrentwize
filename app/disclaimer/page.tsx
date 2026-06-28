import type { Metadata } from "next";
import { DISCLAIMER_REVIEWED } from "@/lib/authorship";

export const metadata: Metadata = {
  title: "Disclaimer — FairRentWize",
  description:
    "Disclaimer for FairRentWize. Rent figures come from HUD Fair Market Rents (FY 2025), Census ACS 2019-2023 5-Year (B19013/B25070), and NLIHC Out of Reach 2025. Read what these numbers do and do not tell you about your own rental decision.",
  alternates: { canonical: "/disclaimer/" },
  openGraph: { url: "/disclaimer/" },
};

export default function DisclaimerPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-700 mb-6">Disclaimer</h1>
      <p className="text-sm text-slate-500 mb-8">
        Last reviewed:{" "}
        <time dateTime={DISCLAIMER_REVIEWED}>{DISCLAIMER_REVIEWED}</time>
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">What FairRentWize is and is not</h2>
      <p>
        FairRentWize publishes a county-level, metro-level, and state-level view
        of three official US rental-housing datasets: the{" "}
        <a
          href="https://www.huduser.gov/portal/datasets/fmr.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          HUD Fair Market Rents
        </a>{" "}
        program (FY 2025 release), the{" "}
        <a
          href="https://www.census.gov/programs-surveys/acs/"
          target="_blank"
          rel="noopener noreferrer"
        >
          US Census Bureau American Community Survey
        </a>{" "}
        2019-2023 5-Year Estimates (tables B19013, B25008, B25031, B25070), and
        the{" "}
        <a href="https://nlihc.org/oor" target="_blank" rel="noopener noreferrer">
          National Low Income Housing Coalition Out of Reach
        </a>{" "}
        2025 housing wage report. Everything on the site is sourced from one of
        these three datasets and rendered verbatim, with the upstream agency&apos;s
        suppression rules preserved on every surface where a figure is missing.
        Where HUD or Census suppresses a value, the site reports insufficient-data
        and a notice anchored to that upstream release. The site is for research,
        education, and budgeting; it is not a real-estate listing platform, a
        voucher-eligibility tool, or legal advice.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">HUD Fair Market Rent is an area aggregate, not a quote</h2>
      <p>
        HUD Fair Market Rent is the 40th-percentile gross rent (rent plus tenant-paid
        utilities) for non-luxury, decent-quality units in a defined HUD FMR area.
        It is used by HUD to set Section 8 Housing Choice Voucher payment standards
        under 24 CFR 888, and it is the basis for hundreds of HUD subsidy formulas.
        It is <strong>not</strong> the asking rent on any specific listing, the
        median across all units in your neighborhood, or a guarantee of what you
        will be quoted by a landlord. Renters routinely encounter listings well
        above HUD FMR in expensive neighborhoods, and well below FMR in older
        buildings in moderate areas. The FMR number describes the area, not the
        unit.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Census ACS estimates have margins of error</h2>
      <p>
        The American Community Survey is a sample survey, not a full count.
        Every ACS estimate we display (median household income B19013, median
        gross rent B25031, cost-burden share B25070, renter share derived from
        B25008) carries a margin of error that can be large in small counties.
        Where the relative margin of error for a county exceeds 30%, we suppress
        the figure rather than display an unreliable estimate. Census ACS
        5-Year data lags the current market by approximately 12 to 18 months;
        in fast-moving rental markets the median rent on this site can run
        meaningfully below current asking rents. Always treat ACS estimates as
        a 5-year average, not a current snapshot.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">NLIHC Out of Reach is a state aggregate</h2>
      <p>
        The NLIHC Out of Reach 2025 housing wage we display for each state is
        NLIHC's published aggregate, computed from HUD FY 2025 FMR areas with
        NLIHC's own weighting methodology. NLIHC publishes its state aggregates
        annually in the Out of Reach report. The NLIHC state-level 2BR FMR
        figure can differ slightly from a simple area-weighted average of HUD
        county FMRs because NLIHC uses a different weighting; both numbers are
        correct for the level they describe. NLIHC's hourly housing wage
        assumes a full-time 40-hour-per-week worker spending no more than 30%
        of gross income on rent.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">The 30% cost-burden line is statutory</h2>
      <p>
        Throughout the site we reference the "30% of income" rule as the
        threshold for being cost-burdened. This number is not an editorial
        choice. It is the statutory HUD definition of cost burden under{" "}
        <a
          href="https://www.ecfr.gov/current/title-24/subtitle-A/part-5/subpart-F/section-5.628"
          target="_blank"
          rel="noopener noreferrer"
        >
          24 CFR 5.628
        </a>{" "}
        and{" "}
        <a
          href="https://www.law.cornell.edu/uscode/text/42/1437a"
          target="_blank"
          rel="noopener noreferrer"
        >
          42 USC 1437a
        </a>
        : a household paying 30% or more of gross income on housing is
        classified as cost-burdened by HUD. Our RentBurdenTier classifier and
        every "affordable rent" calculation on this site inherit this anchor
        directly from federal law rather than from our own opinion.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Not legal, financial, or tax advice</h2>
      <p>
        Rental decisions involve tenant law, landlord-tenant disputes, voucher
        eligibility, fair-housing law, security-deposit limits, and rent-control
        ordinances that vary by state, county, and city. The information on
        FairRentWize is informational only and is not legal advice. We do not
        determine eligibility for HUD's Section 8 Housing Choice Voucher,
        Low-Income Housing Tax Credit (LIHTC) units, Public Housing, or any
        state or local rental assistance program. Voucher eligibility is
        determined by the local Public Housing Authority based on a specific
        household's income relative to HUD area median income limits, not by
        any number on this site. For binding eligibility decisions, contact
        your local PHA via the{" "}
        <a
          href="https://www.hud.gov/topics/rental_assistance"
          target="_blank"
          rel="noopener noreferrer"
        >
          HUD rental assistance directory
        </a>
        . For tenant-law questions, consult a qualified attorney or a HUD-approved
        housing counselor.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Voucher math examples are illustrative</h2>
      <p>
        Where this site shows voucher math (Payment Standard percent of FMR,
        tenant rent at 30% of adjusted income, voucher subsidy = Payment
        Standard minus tenant rent), the numbers are illustrative. Each Public
        Housing Authority sets its Payment Standard between 90% and 110% of HUD
        FMR (up to 120% with HUD approval). Tenant payment is 30% of adjusted
        (not gross) income, with deductions and minimum-rent provisions that
        vary by PHA. The "income needed for 2BR FMR" calculation we display is
        a HUD 30%-rule benchmark, not a quote of any specific voucher subsidy.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Operator location and outside-US scope</h2>
      <p>
        FairRentWize is operated from South Korea as an independent research
        site. The operator is not a US-licensed real-estate broker, attorney,
        housing counselor, or tax professional. Site content is restricted to
        publicly published US datasets (HUD FMR, Census ACS, NLIHC Out of
        Reach) and the deterministic 30%-rule math that HUD itself uses. We do
        not handle individual tenant or landlord cases, do not represent
        parties in disputes, and do not facilitate rental transactions.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Data accuracy and refresh cadence</h2>
      <p>
        HUD FMR is refreshed annually each October for the upcoming federal
        fiscal year; we re-ingest the full FMR table within days of each
        release. Census ACS 5-Year vintages are released each December with a
        12-18 month lag; we re-ingest the relevant tables (B19013, B25008,
        B25031, B25070) when Census publishes a new 5-Year vintage. NLIHC
        publishes Out of Reach annually after the HUD FMR release; we re-ingest
        the state-level housing wage and renter wage figures within days.
        Between refreshes, the site reflects the most recently released
        upstream vintage, which may lag current market conditions in fast-moving
        rental markets. We do not back-fill or smooth missing rows.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Advertising and conflicts of interest</h2>
      <p>
        FairRentWize displays contextual advertising via Google AdSense. We do
        not have affiliate relationships with property managers, real-estate
        brokerages, listing portals, or any tenant or landlord service. Ad
        placements are clearly labeled and do not influence the underlying HUD
        FMR, Census ACS, or NLIHC Out of Reach data displayed on entity pages.
        Ranking on /best-states-to-rent/, /county/, and /metro/ pages is
        determined solely by HUD FMR, Census ACS, and NLIHC figures &mdash;
        not by any sponsorship.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">External links</h2>
      <p>
        We link out to primary sources at HUD (huduser.gov, hud.gov), the
        Census Bureau (census.gov), NLIHC (nlihc.org), and other public-data
        providers. We do not control the content of external sites and are not
        responsible for changes to their data, URLs, or terms of use after we
        link to them. If you find a broken external link or a citation that
        no longer resolves, please use the contact page to report it.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Limitation of liability</h2>
      <p>
        FairRentWize and its operator are not liable for any decision a reader
        makes based on figures displayed on this site, including but not
        limited to lease signings, voucher applications, relocation choices,
        budget plans, or landlord-tenant negotiations. The site is provided on
        an "as is" basis without warranties of any kind, express or implied,
        regarding accuracy, completeness, fitness for a particular purpose, or
        non-infringement. Readers are responsible for verifying any figure
        against the underlying HUD, Census ACS, or NLIHC source before acting
        on it.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Corrections and contact</h2>
      <p>
        If you find a HUD FMR, Census ACS, or NLIHC figure on this site that
        disagrees with the upstream agency's published value, please use the{" "}
        <a href="/contact/" className="text-slate-700 hover:underline">
          contact page
        </a>{" "}
        with the source URL and the discrepancy. We document our editorial and
        correction workflow on the{" "}
        <a href="/editorial-policy/" className="text-slate-700 hover:underline">
          editorial policy
        </a>{" "}
        and{" "}
        <a href="/corrections-policy/" className="text-slate-700 hover:underline">
          corrections policy
        </a>{" "}
        pages.
      </p>
    </article>
  );
}
