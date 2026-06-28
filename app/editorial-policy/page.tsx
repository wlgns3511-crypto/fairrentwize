import type { Metadata } from "next";
import { EDITORIAL_REVIEWED, SOURCE_AUTHORITIES } from "@/lib/authorship";

export const metadata: Metadata = {
  title: "Editorial Policy — FairRentWize",
  description:
    "How FairRentWize selects HUD FMR, Census ACS, and NLIHC Out of Reach sources, decides RentBurdenTier cutoffs, separates ingest from interpretation, handles HUD FMR FY release and ACS 5-Year vintage cycles, and discloses conflicts of interest.",
  alternates: { canonical: "/editorial-policy/" },
  openGraph: { url: "/editorial-policy/" },
};

export default function EditorialPolicyPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-700 mb-6">Editorial Policy</h1>
      <p className="text-sm text-slate-500 mb-8">
        Last reviewed:{" "}
        <time dateTime={EDITORIAL_REVIEWED}>{EDITORIAL_REVIEWED}</time>
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Editorial scope</h2>
      <p>
        FairRentWize publishes US-focused reference content on Fair Market Rents at the state,
        metropolitan, and county level; median gross rent and median household income; the
        share of households spending 30% or more of income on rent (cost-burdened); and the
        hourly wage required to afford a two-bedroom rental at HUD Fair Market Rent. The
        catalog is anchored in three federal-grade datasets: HUD Fair Market Rents (FY 2025
        release), the US Census Bureau American Community Survey 5-Year Estimates (2019-2023
        vintage; tables B19013, B25008, B25031, B25070), and the National Low Income Housing
        Coalition Out of Reach 2025 report. Every figure on the site is rendered verbatim
        from one of those three federal-grade datasets, with each agency&apos;s suppression
        rules preserved on every surface where a value is missing.
      </p>
      <p>
        Editorial control of every page surface (state, county, metro, rent-by-bedroom, guide,
        methodology, about, disclaimer, legal) rests with the FairRentWize Editorial Team, a
        member of the DataPeek Research Network. No advertiser, real-estate broker, property
        manager, listing portal, tenant-services company, or housing-advocacy organization has
        influence over RentBurdenTier cutoffs, lever outputs, HUD-derived figures, Census
        ACS-derived figures, NLIHC housing-wage figures, or source-authority attribution.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Source selection criteria</h2>
      <p>
        Sources used in FairRentWize must meet at least two of the following criteria:
      </p>
      <ul>
        <li>
          <strong>Government regulatory or statistical standing.</strong> The source is
          published or recognized by a US federal agency (HUD for Fair Market Rents and voucher
          regulations; US Census Bureau for the American Community Survey) or by an
          established nonprofit research organization with national policy standing (NLIHC for
          the Out of Reach housing-wage methodology, which itself composes HUD FMR with
          NLIHC&apos;s 30%-of-income affordability anchor).
        </li>
        <li>
          <strong>Public, auditable methodology.</strong> The source publishes its methodology
          openly. HUD documents the FMR estimation methodology in its annual Federal Register
          notice and at huduser.gov. Census ACS publishes its sampling design, replicate
          weights, and margin-of-error methodology at census.gov. NLIHC documents the housing-
          wage formula and state-aggregate weighting in each annual Out of Reach edition.
          Every figure on FairRentWize can be traced back to a published methodology page at
          one of these three authorities.
        </li>
        <li>
          <strong>Currently maintained on a documented cadence.</strong> Sources that have not
          been updated in the past three years are flagged on the methodology page rather
          than relied upon. HUD publishes Fair Market Rents annually each fiscal year (FY 2025
          released October 2024). Census ACS releases new 5-Year Estimates each December (the
          2019-2023 5-Year was released December 2024). NLIHC publishes Out of Reach annually
          after the HUD FMR release (Out of Reach 2025 published mid-2025). All three meet the
          freshness bar.
        </li>
        <li>
          <strong>Statutory authority or industry consensus.</strong> The source operates
          under a legal mandate or industry-recognized convention. HUD calculates Fair Market
          Rents under 24 CFR 888 and uses them to set Section 8 Housing Choice Voucher
          payment standards under 42 USC 1437f. Census ACS is mandated under 13 USC 141 and
          serves as the official statistical replacement for the long-form decennial census.
          NLIHC&apos;s 30%-of-income affordability anchor mirrors the statutory HUD definition
          of cost burden at 24 CFR 5.628.
        </li>
      </ul>
      <p>
        The three regulatory and statistical bodies we cite as standing source authorities
        are:
      </p>
      <ul>
        {SOURCE_AUTHORITIES.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              {s.name}
            </a>
          </li>
        ))}
      </ul>
      <p>
        Where a state, county, or metro page warrants reference to an additional federal or
        legal source — a HUD Office of Policy Development and Research dataset, a HUD Income
        Limits area table for voucher eligibility, the Code of Federal Regulations citation
        for the cost-burden threshold (24 CFR 5.628), or a US Code reference (42 USC 1437a) —
        we cite it inline on the page where it applies, separate from the standing
        source-authority list above. The disclaimer page links directly to the relevant CFR
        and USC anchors for the 30%-of-income rule.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Separation of ingest and interpretation</h2>
      <p>
        FairRentWize maintains a deliberate separation between two layers:
      </p>
      <ol>
        <li>
          <strong>Ingest layer (verbatim).</strong> The 2BR Fair Market Rent in dollars per
          month, the studio / 1BR / 2BR / 3BR / 4BR FMRs, the ACS median household income, the
          ACS median gross rent, the ACS per-bedroom rent estimates (B25031), the cost-
          burdened share (B25070), the renter share (derived from B25008), and the NLIHC
          state housing wage in dollars per hour come directly from HUD, Census, and NLIHC.
          We do not edit, override, or supplement these values. When HUD publishes the next
          fiscal-year FMR release, when Census publishes the next ACS 5-Year vintage, or when
          NLIHC publishes the next Out of Reach edition, our next data refresh reflects the
          change.
        </li>
        <li>
          <strong>Interpretation layer (our heuristic).</strong> RentBurdenTier
          (lib/rent-burden-tier.ts) composes the HUD FY 2025 2BR FMR with the Census ACS
          B19013 median household income, producing a five-tier reader-help label (A through
          E) keyed to the rent-to-income ratio. Tier E is anchored at exactly 30% — the same
          threshold HUD itself uses to define cost burden under 24 CFR 5.628. The intermediate
          cutoffs (A under 18%; B 18-22%; C 22-26%; D 26-30%) are documented at{" "}
           and on the{" "}
          <a href="/methodology/">/methodology/</a> page. The module is open to inspection by
          any reader who wants to see exactly how a tier was assigned.
        </li>
      </ol>
      <p>
        This separation matters because the ingest layer represents authoritative upstream
        data, while the interpretation layer represents our editorial judgment about how to
        surface that data. Confusing the two would falsely imply that HUD, the US Census
        Bureau, or NLIHC have endorsed our tier labels. They have not. The tiers are ours; the
        underlying Fair Market Rents, ACS estimates, and NLIHC housing wages are theirs.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Tier-cutoff decisions</h2>
      <p>
        RentBurdenTier cutoffs (Tier A under 18% of median household income; Tier B 18-22%;
        Tier C 22-26%; Tier D 26-30%; Tier E at or above 30%) reflect editorial judgment about
        what differentiates the tiers meaningfully for a reader scanning a state, county, or
        metro page. The Tier E cutoff at 30% is <strong>not</strong> editorial — it is the
        statutory HUD definition of cost burden under 24 CFR 5.628 and 42 USC 1437a. The
        intermediate cutoffs (18 / 22 / 26%) are derived empirically from the distribution of
        US states between an extremely affordable tier and the statutory cost-burden line, and
        are documented at {" "}
        alongside the four tiers below 30%.
      </p>
      <p>
        For metros, the same five-tier framework is applied with one explicit methodological
        substitution: because metros (Core-Based Statistical Areas) typically span multiple
        counties and do not have a single ACS B19013 figure, the metro tier uses the parent-
        state ACS median household income for cross-metro consistency. This is documented
        inline on each metro page and on the methodology page. For per-bedroom pages, the tier
        label is anchored to the 2-bedroom reference unit; studio and 1BR rents typically drop
        the burden one to two tiers, and 3BR / 4BR rents push it one to two tiers higher, as
        explained at the rent-by-bedroom surface.
      </p>
      <p>
        We change tier cutoffs only when (1) the upstream source authority changes its
        framework (for example, HUD revises 24 CFR 5.628 or HUD migrates from the FY 2025 FMR
        methodology to a substantially revised approach, or Census revises the ACS B19013 or
        B25031 table methodology), (2) the empirical distribution of state-level rent-burden
        percentages shifts substantially enough that the current cutoffs no longer separate
        the tiers meaningfully (e.g., if &gt;70% of states fall into a single tier), or (3) we
        identify a reader-help failure case that warrants a small editorial adjustment. The
        Tier E cutoff at 30% will not move while the statutory definition stands. All cutoff
        changes are documented on the methodology page with a vintage date and a rationale.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Handling upstream updates</h2>
      <p>
        Because FairRentWize depends on HUD, Census ACS, and NLIHC as upstream catalogs, we
        follow these rules for upstream-driven changes:
      </p>
      <ul>
        <li>
          <strong>HUD Fair Market Rents annual release.</strong> HUD publishes Fair Market
          Rents once per fiscal year, typically each October for the upcoming federal fiscal
          year. We re-ingest the full FMR table (studio through 4BR, all FMR areas) within
          days of release, and each state, county, and metro page displays the current ENTITY
          vintage on its authorship strip so readers can see when the underlying FMR snapshot
          was last refreshed.
        </li>
        <li>
          <strong>Census ACS 5-Year vintage release.</strong> Census publishes a new ACS 5-Year
          vintage each December, replacing the oldest year in the rolling 5-year window. We
          re-ingest the relevant tables (B19013 median household income, B25008 renter share,
          B25031 per-bedroom rent, B25070 cost-burden share) when Census publishes a new
          vintage. The site notes the current ACS vintage alongside the FMR vintage on the
          methodology page.
        </li>
        <li>
          <strong>NLIHC Out of Reach annual update.</strong> NLIHC publishes Out of Reach
          annually, typically a few months after the HUD FMR release. We re-ingest the state-
          level 2BR housing wage, the renter-household count, the annual income needed at 2BR
          FMR, and the mean renter wage figures within days of the Out of Reach release.
        </li>
        <li>
          <strong>Regulatory or statutory change.</strong> If HUD revises 24 CFR 888 (FMR
          calculation), 24 CFR 5.628 (cost-burden definition), or 24 CFR 982 (voucher
          payment-standard band, currently 90-110% of FMR with HUD-approved exceptions to
          120%), we update the methodology page and the disclaimer to reflect the new rule
          and review the affected lever and guide pages within thirty days. If Congress amends
          42 USC 1437a or related US Code provisions, the same review applies.
        </li>
        <li>
          <strong>Local rent-control or rent-stabilization ordinances.</strong> Mid-year local
          ordinance changes (NYC rent stabilization adjustments, California AB 1482 rent caps,
          state-level just-cause eviction statutes) can change actual tenant costs before they
          show in the next HUD or Census release. We do not currently ingest local
          rent-control microdata as a primary source; the disclaimer and methodology pages
          note this as a known limitation of HUD-FMR-anchored data.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">Editorial review process</h2>
      <p>
        Each new page surface (state template change, county template change, metro template
        change, new guide entry, new lever) passes through three checkpoints before being
        deployed:
      </p>
      <ol>
        <li>
          <strong>Source-authority verification.</strong> Every claim that names HUD, Fair
          Market Rents, the Census ACS, NLIHC, Out of Reach, 24 CFR 5.628, 24 CFR 888, 42 USC
          1437a, the Section 8 Housing Choice Voucher program, or any specific federal
          regulation is checked against the cited primary source. Where the source has been
          superseded (an older FY FMR retired, an older ACS 5-Year vintage withdrawn), the
          page is corrected before deploy.
        </li>
        <li>
          <strong>Audit suite.</strong> A standing 7-check audit verifies trigger-phrase
          compliance, orphan schema absence, authorship-layer integrity, sitemap consistency,
          dataset creator-attribution correctness (HUD / Census Bureau / NLIHC as the
          Dataset.creator on the appropriate surfaces, not the FairRentWize Editorial Team or
          publisher), and source-mention counts on legal pages. Pages cannot ship while any
          audit check is red.
        </li>
        <li>
          <strong>Production verification.</strong> After deploy, cold-probe URLs verify that
          each new page is returning HTTP 200 with the expected lever markers, HUD / ACS /
          NLIHC source attribution, and the RentBurdenTier strip. If any probe fails, the
          deploy rolls back to the previous build.
        </li>
      </ol>

      <h2 className="text-xl font-semibold mt-8 mb-3">Conflict of interest disclosure</h2>
      <p>
        Revenue is from Google AdSense advertising and (where disclosed) affiliate links to
        related housing services. We have no commercial relationship with any landlord,
        property manager, real-estate brokerage, listing portal, or tenant-services company
        whose market appears on FairRentWize. The RentBurdenTier cutoffs are fixed in source
        code (lib/rent-burden-tier.ts) and do not vary by advertiser.
      </p>
      <p>
        Specific disclosures:
      </p>
      <ul>
        <li>
          We do not accept payment to elevate a state&apos;s ranking on /best-states-to-rent/,
          to shift a county or metro&apos;s RentBurdenTier label, or to suppress an
          unfavorable HUD FMR or ACS figure.
        </li>
        <li>
          We do not accept payment from landlords, property managers, or listing portals to be
          included in or excluded from any state, county, or metro page. The catalog
          reflects what HUD and Census publish for each jurisdiction.
        </li>
        <li>
          We do not receive commissions on apartment rentals, lease signings, security-deposit
          financing, renter-insurance sign-ups, or moving-service referrals. Affiliate
          disclosures (where present) apply to adjacent services like renters-insurance
          comparison or moving estimates; the existence of an affiliate link does not
          influence the editorial treatment of any state, county, metro, or bedroom-size in
          the catalog.
        </li>
        <li>
          We do not have a financial relationship with HUD, the US Department of Housing and
          Urban Development, the US Census Bureau, NLIHC (the National Low Income Housing
          Coalition), or any state or local Public Housing Authority. We are an independent
          operator that cites their published work.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">Author identification and accountability</h2>
      <p>
        Pages on FairRentWize are reviewed by the FairRentWize Editorial Team, drawing on the
        published catalogs of HUD (Fair Market Rents FY 2025), the US Census Bureau (American
        Community Survey 2019-2023 5-Year Estimates), and NLIHC (Out of Reach 2025). The
        AuthorBox on each surface attributes review to the editorial team with the parent
        organization DataPeek Research Network, and credits the relevant source authorities as
        the data creators. This structure is documented in our schema.org markup on every page
        (Dataset.creator = the HUD, Census Bureau, or NLIHC organization that produced the
        underlying figures; reviewedBy = the FairRentWize Editorial Team; publisher =
        DataPeek Research Network).
      </p>
      <p>
        Readers who want to contact the editorial team for any reason — to report an error, to
        request a correction, to ask about methodology, or to inquire about a specific tier
        assignment — should use the{" "}
        <a href="/contact/" className="text-slate-700 hover:underline">Contact</a> page. The{" "}
        <a href="/corrections-policy/" className="text-slate-700 hover:underline">
          Corrections Policy
        </a>{" "}
        documents how we handle reported errors.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Limits of editorial coverage</h2>
      <p>
        We do not cover:
      </p>
      <ul>
        <li>
          Rental data for countries outside the United States. HUD Fair Market Rents, US
          Census ACS, and NLIHC Out of Reach are US-only catalogs; international rent
          comparisons would require an entirely different upstream source (Eurostat, OECD
          Affordable Housing Database, national-statistics offices) that we do not currently
          ingest.
        </li>
        <li>
          Individual listings, real-time asking rents, or unit-level rent quotes. HUD FMR is
          an area aggregate at the 40th percentile of gross rent in the FMR area; Census ACS
          median gross rent is a sample-based 5-year average; neither is a quote on a specific
          unit. Renters who want listing-level data should use a licensed real-estate brokerage
          or a primary listing portal.
        </li>
        <li>
          Voucher eligibility determinations, voucher subsidy calculations, Public Housing
          eligibility, or LIHTC (Low-Income Housing Tax Credit) eligibility. Voucher
          eligibility is determined by the local Public Housing Authority based on HUD area
          median income limits and household composition, not by any number on FairRentWize.
          Readers should contact their local PHA via the HUD rental-assistance directory.
        </li>
        <li>
          Mortgage rates, home-buying decisions, or property-purchase comparisons. Those are
          covered by our sister site HomeLoanPeek (Freddie Mac PMMS / FHFA HPI / HMDA /
          FHA-VA-USDA-loan-limit-anchored) and remain outside the FairRentWize scope.
        </li>
        <li>
          Tenant-law advice, security-deposit dispute resolution, eviction-defense guidance,
          or fair-housing complaint handling. These are covered by our sister site
          EvictionLawPeek and by the appropriate HUD-approved housing counselor or licensed
          attorney; they remain outside the FairRentWize scope.
        </li>
      </ul>
      <p>
        For these out-of-scope domains, readers should consult the relevant authority
        directly: HUD Multifamily Inventory and Income Limits for voucher and LIHTC questions,
        the local Public Housing Authority for any voucher application or rental-assistance
        eligibility decision, a HUD-approved housing counselor or fair-housing legal-aid
        organization for tenant-law questions, and a licensed real-estate brokerage or
        primary listing portal for individual-unit asking-rent data.
      </p>
    </article>
  );
}
