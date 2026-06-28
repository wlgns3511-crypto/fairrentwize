import type { Metadata } from "next";
import { CORRECTIONS_REVIEWED } from "@/lib/authorship";

export const metadata: Metadata = {
  title: "Corrections Policy — FairRentWize",
  description:
    "How FairRentWize triages, fixes, and discloses errors — data errors at the HUD / Census ACS / NLIHC upstream, interpretation errors in our RentBurdenTier lever, and editorial errors in legal or methodology pages. Reporting channel, response time targets, and HUD / Census / NLIHC reference points.",
  alternates: { canonical: "/corrections-policy/" },
  openGraph: { url: "/corrections-policy/" },
};

export default function CorrectionsPolicyPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-700 mb-6">Corrections Policy</h1>
      <p className="text-sm text-slate-500 mb-8">
        Last reviewed:{" "}
        <time dateTime={CORRECTIONS_REVIEWED}>{CORRECTIONS_REVIEWED}</time>
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Why we publish a corrections policy</h2>
      <p>
        FairRentWize covers Fair Market Rents at the state, county, and metro level; median
        gross rent and median household income; the share of households spending 30% or more
        of income on rent (HUD&apos;s statutory cost-burden line); and the NLIHC housing wage
        required to afford a two-bedroom rental at HUD FMR. These are domains where an error
        can lead a reader to misjudge their county&apos;s rent affordability, choose to move
        to a state or metro with a different RentBurdenTier than the data actually supports,
        miscalculate whether their household is cost-burdened under HUD&apos;s 30% rule, or
        miscarry a Section 8 Housing Choice Voucher payment-standard intuition. We treat
        correction intake, triage, and remediation as a core editorial function and document
        it publicly so readers can verify how we handle reported errors.
      </p>
      <p>
        This policy applies to errors at FairRentWize itself. Errors in the underlying source
        authorities (HUD FY 2025 Fair Market Rents, US Census Bureau ACS 2019-2023 5-Year
        Estimates, NLIHC Out of Reach 2025) are governed by the correction processes of those
        agencies; we forward upstream-level errors to the appropriate source rather than
        maintaining a fork.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Three error categories we recognize</h2>
      <p>
        We triage every reported error into one of three buckets:
      </p>
      <ol>
        <li>
          <strong>Data error at the HUD / Census ACS / NLIHC upstream.</strong> Example: a HUD
          FY 2025 FMR entry lists a 2BR rent that disagrees with the official HUD Federal
          Register notice; a Census ACS B19013 median household income figure is mis-
          aggregated for a specific county; an NLIHC Out of Reach housing-wage figure for a
          state does not match the published 2025 edition. Because we ingest HUD, Census, and
          NLIHC catalogs verbatim and do not maintain a fork, the most effective fix is at the
          upstream source. We forward these reports to the appropriate HUD User, Census ACS,
          or NLIHC correction channel and refresh on our next ingest cycle.
        </li>
        <li>
          <strong>Interpretation error in our lever output.</strong> Example: RentBurdenTier
          incorrectly tiers a state because the cutoff logic misreads the rent-to-income
          ratio; the cost-burden percentage calculation against the underlying HUD 2BR FMR and
          Census ACS B19013 inputs is wrong; a metro&apos;s tier label uses the wrong parent-
          state income table. These are bugs in our code (lib/rent-burden-tier.ts and related
          modules) and we fix them in source.
        </li>
        <li>
          <strong>Editorial error in static content.</strong> Example: a methodology page
          misstates when a HUD FMR revision took effect; a guide entry confuses HUD Fair Market
          Rent with HUD Area Median Income limits; an authority citation links to a retired
          ACS vintage or a withdrawn HUD form; the disclaimer page misquotes 24 CFR 5.628 or
          42 USC 1437a. These are fixed by editing the static content and re-deploying.
        </li>
      </ol>

      <h2 className="text-xl font-semibold mt-8 mb-3">How we triage</h2>
      <p>
        On receiving a reported error, we apply the following triage:
      </p>
      <ul>
        <li>
          <strong>Severity assessment.</strong> A high-severity error is one that could
          materially mislead a reader about their county or metro&apos;s 2BR Fair Market Rent,
          their state&apos;s median household income, their cost-burden share, or whether
          their state crosses the 30% statutory cost-burden line — for example, a state page
          showing a 2BR FMR that is double the HUD-published figure, or a county labeled as
          Tier A when the underlying ACS B19013 income and HUD FMR data place it in Tier D.
          High-severity errors take priority over other editorial work and are addressed
          within five business days.
        </li>
        <li>
          <strong>Reproducibility check.</strong> We verify the reported error by reading the
          relevant source: the HUD Fair Market Rents lookup at huduser.gov for a state, county,
          or metro FMR claim; the Census ACS table viewer (data.census.gov) for a B19013 /
          B25008 / B25031 / B25070 claim; the NLIHC Out of Reach 2025 PDF or interactive map
          for a housing-wage claim; the Code of Federal Regulations (ecfr.gov) for any 24 CFR
          5.628 or 24 CFR 888 claim; the US Code (law.cornell.edu) for any 42 USC 1437a or
          42 USC 1437f claim. We do not fix unreproducible reports without first confirming
          the underlying issue.
        </li>
        <li>
          <strong>Root-cause classification.</strong> We classify the error into one of the
          three buckets above (upstream data, interpretation, editorial). The fix path differs
          by bucket; correctly classifying upfront avoids fixing the wrong layer.
        </li>
        <li>
          <strong>Disclosure decision.</strong> For corrections that materially change a 2BR
          FMR figure, a tier label, a cost-burden percentage, a state housing-wage
          attribution, or a regulatory citation, we note the change inline on the affected
          page and update the vintage date. Minor typographical fixes do not warrant a
          separate disclosure; substantive factual corrections always do.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">Response time targets</h2>
      <p>
        We commit to the following response timelines from receipt of a clear, reproducible
        error report:
      </p>
      <ul>
        <li>
          <strong>High-severity FMR, income, or tier errors:</strong> initial response within
          two business days, fix or upstream forward within five business days. This covers
          cases like a 2BR Fair Market Rent that is substantially off the HUD-published
          figure, a Census ACS B19013 median household income that is mis-aggregated, or a
          state mis-classified relative to HUD&apos;s 30% statutory cost-burden line.
        </li>
        <li>
          <strong>Interpretation-layer bugs (RentBurdenTier, cost-burden math):</strong> fix
          deployed within fourteen days. The fix typically requires a code change, audit
          re-run, and production verification across state, county, metro, and rent-by-bedroom
          surfaces.
        </li>
        <li>
          <strong>Editorial errors in static content (methodology, guide, about, disclaimer,
          legal):</strong> fix deployed within seven days, faster if the error involves a
          regulatory or statistical-framework citation (HUD, Fair Market Rents, 24 CFR 888,
          24 CFR 5.628, 42 USC 1437a, US Census ACS, NLIHC Out of Reach).
        </li>
        <li>
          <strong>Upstream HUD / Census ACS / NLIHC data errors:</strong> forwarded to the
          appropriate agency correction channel within seven days of report. The actual
          correction timing depends on the agency&apos;s release cycle (HUD publishes Fair
          Market Rents annually each October; Census publishes ACS 5-Year Estimates annually
          each December; NLIHC publishes Out of Reach annually) and is outside our direct
          control. The next FairRentWize ingest cycle picks up the corrected upstream data
          automatically.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">How to report an error</h2>
      <p>
        The fastest way to reach us is via the{" "}
        <a href="/contact/" className="text-slate-700 hover:underline">Contact page</a>. When
        reporting, please include:
      </p>
      <ul>
        <li>
          The URL of the affected page (e.g., /state/california/, /county/los-angeles-county-ca/,
          /metro/los-angeles-long-beach-anaheim-ca/, /guide/rent-burden-tier/).
        </li>
        <li>The specific claim or output you believe is wrong, with a quote or screenshot.</li>
        <li>
          The basis for the correction — a link to a HUD FMR lookup, a Census ACS table, an
          NLIHC Out of Reach 2025 reference, the relevant Code of Federal Regulations section
          (e.g., 24 CFR 5.628), the relevant US Code section (e.g., 42 USC 1437a), or your
          local Public Housing Authority&apos;s most recent payment-standard notice where
          applicable.
        </li>
        <li>
          Whether the error is at the HUD / Census ACS / NLIHC upstream (we forward), in our
          interpretation (we fix in code), or in editorial content (we edit and re-deploy).
        </li>
      </ul>
      <p>
        For HUD Fair Market Rents data corrections, the most effective fix is filed directly
        with HUD User at{" "}
        <a
          href="https://www.huduser.gov/portal/about/contact.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          huduser.gov/portal/about/contact.html
        </a>{" "}
        — HUD reviews reported FMR issues with each fiscal-year cycle and our next ingest
        picks up upstream changes automatically. For Census ACS disagreements, the appropriate
        channel is{" "}
        <a
          href="https://www.census.gov/about/contact-us.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          census.gov/about/contact-us.html
        </a>
        . For NLIHC Out of Reach issues, see{" "}
        <a href="https://nlihc.org/contact" target="_blank" rel="noopener noreferrer">
          nlihc.org/contact
        </a>
        . If you report an upstream-level issue to us, we forward it to the appropriate agency
        channel.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">What we do not correct on request</h2>
      <p>
        Some reported &quot;errors&quot; are not factual errors and we do not change them on
        request:
      </p>
      <ul>
        <li>
          <strong>RentBurdenTier disagreements.</strong> If a state agency, landlord, or
          reader disagrees with our RentBurdenTier cutoff (e.g., believes their state should
          be Tier B rather than Tier C), we will not move individual states outside the
          published cutoff logic. The cutoffs are documented at{" "}
           and on the{" "}
          <a href="/methodology/">/methodology/</a> page; tier reassignments would undermine
          the consistency of the lever. The Tier E threshold at 30% specifically will not
          move while the statutory HUD cost-burden definition at 24 CFR 5.628 stands. We will
          consider revising the lower cutoff logic itself if a published HUD or Census ACS
          methodology change supports a different threshold, or if the empirical state
          distribution shifts substantially.
        </li>
        <li>
          <strong>HUD FMR area-aggregate disagreements.</strong> HUD-published Fair Market
          Rents are area aggregates at the 40th-percentile gross rent (rent plus tenant-paid
          utilities) for non-luxury, decent-quality units in the defined HUD FMR area. We do
          not override HUD FMR figures with neighborhood-specific listing data, individual-
          unit asking rents, or mid-year payment-standard adjustments by a local Public
          Housing Authority, because doing so would mix two different reporting frameworks.
          The disclaimer and methodology pages note that HUD FMR is an area aggregate, not a
          quote on any specific unit.
        </li>
        <li>
          <strong>Census ACS margin-of-error disagreements.</strong> Where the relative margin
          of error for a county-level ACS estimate exceeds 30%, we suppress the figure rather
          than display an unreliable number. We do not fill suppressed values on request with
          interpolated estimates from neighboring counties or with state-level proxies, because
          doing so would imply a precision the underlying Census ACS sample does not support.
        </li>
        <li>
          <strong>Voucher-eligibility or payment-standard requests.</strong> We do not
          determine eligibility for HUD&apos;s Section 8 Housing Choice Voucher, Public
          Housing, LIHTC, or any state or local rental-assistance program. Voucher eligibility
          is determined by the local Public Housing Authority based on a household&apos;s
          income relative to HUD Area Median Income limits, not by any number on
          FairRentWize. Eligibility-determination requests should be addressed to the
          appropriate PHA via the HUD rental-assistance directory.
        </li>
        <li>
          <strong>Removal of a state, county, or metro entry.</strong> We do not remove
          jurisdictions from the catalog on operator request. The catalog reflects what HUD
          and Census publish for each jurisdiction; removal requests should be addressed to
          HUD User (for FMR areas) or the Census Bureau (for ACS geographies) directly.
        </li>
        <li>
          <strong>Endorsement or de-endorsement of a regulatory framework.</strong> We will
          not remove or soften citations of HUD, Fair Market Rents, the US Census Bureau,
          NLIHC, 24 CFR 5.628, or 42 USC 1437a because a particular reader, landlord, or
          advocacy organization disagrees with the underlying regulation or program design.
          Our role is to compile and decode the framework as it stands; advocacy for or
          against any specific federal housing regulation is outside our editorial scope.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">When we issue a public correction</h2>
      <p>
        We publish a visible correction note on the affected page (with a vintage date
        update) when:
      </p>
      <ul>
        <li>
          A RentBurdenTier label changes for one or more states, counties, or metros as a
          result of the correction (for example, a fix to the cutoff logic that moves several
          jurisdictions between tiers).
        </li>
        <li>
          A regulatory or statistical citation is updated to reflect a current HUD Fair Market
          Rent fiscal-year release, a current Census ACS 5-Year vintage, a current NLIHC Out
          of Reach edition, or a revised 24 CFR or 42 USC section.
        </li>
        <li>
          A 2BR Fair Market Rent, median household income, cost-burden share, NLIHC housing
          wage, or renter-share figure changes for a specific state, county, or metro as a
          result of an upstream HUD / Census ACS / NLIHC correction.
        </li>
        <li>
          A methodology page section is revised to reflect a change in source authorities,
          tier-cutoff logic, or the parent-state income substitution used for metro pages.
        </li>
      </ul>
      <p>
        Minor typographical and styling fixes do not warrant a separate disclosure.
        Substantive factual corrections, regulatory citation updates, and tier reassignments
        always do. The editorial team retains discretion about the form of the disclosure
        (inline note vs. separate changelog) based on how prominent and persistent the
        affected claim was.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Severe-error escalation</h2>
      <p>
        If you believe FairRentWize has presented information that could lead a reader toward
        a materially wrong decision about a voucher application, a relocation choice (moving
        across state or metro lines because of a mis-tiered rent-burden label), a
        landlord-tenant negotiation, or an affordable-housing eligibility question, please
        escalate via the{" "}
        <a href="/contact/" className="text-slate-700 hover:underline">Contact page</a> with
        the subject line beginning &quot;PRIORITY:&quot;. We monitor this channel daily and
        aim to respond within one business day. For any voucher-eligibility, Public Housing,
        or LIHTC eligibility question, do not wait for our response — contact your local
        Public Housing Authority through the HUD rental-assistance directory at hud.gov/
        topics/rental_assistance, which has direct authority to determine eligibility. For
        tenant-law disputes or fair-housing complaints, contact a HUD-approved housing
        counselor or your state attorney general&apos;s consumer-protection office directly.
      </p>
    </article>
  );
}
