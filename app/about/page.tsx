import type { Metadata } from 'next';
import { EditorNote } from '@/components/EditorNote';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';
import { AuthorBox } from '@/components/AuthorBox';
import {
  ABOUT_VINTAGE,
  ENTITY_VINTAGE,
  EDITORIAL_TEAM,
  PUBLISHER,
  SOURCE_AUTHORITIES,
} from '@/lib/authorship';

const desc =
  'About FairRentWize — HUD Fair Market Rent + Census ACS + NLIHC Out of Reach data for 3,000+ US counties and 350+ metro areas. Free, transparent rental affordability research.';
export const metadata: Metadata = {
  title: 'About FairRentWize',
  description: desc,
  alternates: { canonical: '/about/' },
  openGraph: { title: 'About FairRentWize', description: desc, url: '/about/' },
};

export default function AboutPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            name: 'About FairRentWize',
            description: desc,
            url: 'https://fairrentwize.com/about/',
            datePublished: '2026-03-27',
            dateModified: ABOUT_VINTAGE,
            isPartOf: { '@type': 'WebSite', name: 'FairRentWize', url: 'https://fairrentwize.com' },
            publisher: { '@type': 'Organization', name: PUBLISHER.name, url: PUBLISHER.url },
          }),
        }}
      />
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">About FairRentWize</h1>

      <EditorNote note={`FairRentWize publishes US rental affordability data sourced from HUD Fair Market Rents (FY 2025), the Census Bureau's American Community Survey (2019-2023 5-Year), and the National Low Income Housing Coalition's Out of Reach 2025 report. Last reviewed ${ABOUT_VINTAGE}.`} />

      <p className="lead text-lg text-slate-600">
        FairRentWize is a research site for renters, landlords, housing
        counselors, and journalists who need to look up area rent figures
        without wading through HUD ArcGIS layers, Census API codes, or NLIHC
        PDFs. Every dollar amount on the site links back to one of three
        official public datasets — never a proprietary "rent index" or a
        web-scraped listing average.
      </p>

      <h2>Who runs the site</h2>
      <p>
        FairRentWize is built and maintained by an independent operator based
        in South Korea, working as a small one-person research shop. The site
        has no investors, no paid placement, no affiliate relationships with
        property managers, and no commission on rental decisions. The only
        revenue source is contextual advertising (Google AdSense), explicitly
        disclosed on the privacy and disclaimer pages.
      </p>
      <p>
        FairRentWize is one site in the broader{' '}
        <a href={PUBLISHER.url} target="_blank" rel="noopener noreferrer">
          {PUBLISHER.name}
        </a>{' '}
        — a small portfolio of public-data tools covering rent, property tax,
        cost of living, and other civic datasets. The portfolio shares an{' '}
        <a href="https://datapeekfacts.com/editorial-policy/" target="_blank" rel="noopener noreferrer">
          editorial policy
        </a>{' '}
        and a single corrections workflow. FairRentWize publishes under the
        {' '}{EDITORIAL_TEAM.name}, anchored to four primary authorities — the
        US Department of Housing and Urban Development (HUD) for Fair Market
        Rents and 24 CFR 5.628 / 24 CFR 982 / 24 CFR 888 statutory anchors;
        the US Census Bureau for the American Community Survey (ACS) 5-Year
        median gross rent (B25031, B25064, B25070) and household income
        (B19013); the National Low Income Housing Coalition (NLIHC) for the{' '}
        <em>Out of Reach 2025</em> housing wage and renter-wage tables; and
        the US Department of Labor (DOL) for the Fair Labor Standards Act
        (FLSA) federal minimum wage of $7.25/hr (unchanged since 2009). Every
        figure on the site traces directly to one of these four authorities.
      </p>
      <p>
        Three additional federal reference points appear in the methodology
        layer and the legal pages, even though FairRentWize does not ingest
        them as primary tables: the Internal Revenue Code section that creates
        the Low-Income Housing Tax Credit (26 USC 42 / LIHTC) for affordable
        units; HUD&apos;s payment-standard rule under 24 CFR 982.503 for the
        Section 8 Housing Choice Voucher program; and HUD&apos;s formal
        cost-burden statutory definition at 24 CFR 5.628 anchoring the 30%
        rent-to-income threshold. These references are documented on the
        methodology page rather than rendered into entity pages, because the
        derived math is the 30% rule and the upstream HUD Fair Market Rent
        figure, not the LIHTC or voucher program directly.
      </p>

      <h2>What we publish — and what we deliberately do not</h2>
      <p>
        <strong>In scope:</strong>
      </p>
      <ul>
        <li>
          HUD Fair Market Rents (studio through 4BR) for every US county and
          CBSA-defined metro area, refreshed within days of each annual HUD
          release.
        </li>
        <li>
          ACS 5-Year median gross rent, median household income, renter share,
          and rent-burden share at county and state level.
        </li>
        <li>
          NLIHC <em>Out of Reach</em> housing wage, annual income needed for
          a 2BR FMR, mean renter wage, and renter household count, by state.
        </li>
        <li>
          Derived affordability math (the standard 30%-of-income rule, applied
          transparently with the formula shown on each page and on the{' '}
          <a href="/methodology/">methodology page</a>).
        </li>
      </ul>
      <p>
        <strong>Out of scope:</strong>
      </p>
      <ul>
        <li>
          Specific apartment listings, asking rents from third-party portals,
          or any kind of "live market" feed. FMR is a 40th-percentile area
          aggregate, not a substitute for a real listing.
        </li>
        <li>
          Voucher eligibility decisions, rent-control determinations, or any
          legal advice on landlord-tenant disputes. We point readers to HUD
          and to qualified counsel.
        </li>
        <li>
          Synthetic or model-imputed rents. The previous build of this site
          shipped a fallback generator that produced random-uniform values
          where real data was missing; that generator was archived in May
          2026 and the live site now serves only ingested HUD/ACS/NLIHC
          values.
        </li>
      </ul>

      <h2>The three primary sources we cite on every page</h2>
      <p>
        Every county, metro, state, and ranking page on FairRentWize is built
        from these three datasets. We add formatting, internal cross-links,
        and the standard 30% affordability calculation on top, but we do not
        impute, smooth, or model the underlying numbers.
      </p>
      <ul>
        {SOURCE_AUTHORITIES.map((s) => (
          <li key={s.shortName}>
            <strong>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.name}
              </a>{' '}
              — {s.program} ({s.vintage}).
            </strong>{' '}
            {s.description}
          </li>
        ))}
      </ul>

      <h2>Why this site exists</h2>
      <p>
        Rent is the largest single expense for most US households. The
        underlying data is free and public, but it is not easy to use: HUD
        publishes FMRs as a fixed-width text dump and an ArcGIS feature
        service; Census ACS variables live behind cryptic table codes
        (B25070, B25031, B19013, B25008); NLIHC publishes Out of Reach as a
        PDF report. Putting all three on one page, by county and by state,
        with the 30% rule pre-applied, is the entire purpose of the site.
      </p>
      <p>
        The audience this is built for is the person about to sign a lease, a
        relocation researcher building a budget, a housing counselor walking
        a client through what is and isn't realistic at their income, and the
        small subset of journalists and policy staff who need a fast cite for
        a state-level housing wage. None of these readers should have to take
        our word for a number — every page links to the primary source, and
        the methodology page documents which ACS table backs which column.
      </p>

      <h2>How we handle changes and corrections</h2>
      <p>
        We re-run the full HUD + ACS + NLIHC pipeline on each annual release
        rather than patching individual rows. That means corrections from
        upstream agencies (e.g. an FMR revision in a sub-area) flow through
        on the next rebuild. If you find a published HUD, ACS, or NLIHC
        figure that disagrees with what we display, please{' '}
        <a href="/contact/">send us the source URL</a> and the
        discrepancy. We log the request, identify whether the divergence is in
        ingestion or rendering, and ship a fix on the next pipeline run. There
        is no editorial approval step that can quietly hold up a correction.
      </p>
      <p>
        For methodology changes — for example, switching the CBSA delineation
        version, changing the rent-burden cutoff, or tightening the ACS MOE
        filter — we update the{' '}
        <a href="/methodology/">methodology page</a> before the new behavior
        reaches production. The vintage table on that page lists the last
        review date for entity, methodology, about, and legal layers.
      </p>

      <h2>What freshness dates on this site mean</h2>
      <p>
        Each page on FairRentWize shows two distinct dates. The "data
        vintage" is when the underlying dataset was published by HUD, Census,
        or NLIHC — the most recent FMR release is FY 2025; the most recent
        ACS 5-Year is the 2019-2023 release. The "last reviewed" date on
        each surface is when the page itself was last substantively
        re-written, anchored to the underlying git commit timestamp. We do
        not stamp pages with "today's date" to look fresh; if a page was
        last re-written on{' '}
        <time dateTime={ENTITY_VINTAGE}>{ENTITY_VINTAGE}</time>, that is what
        it says.
      </p>

      <h2>Data accuracy and limitations</h2>
      <p>
        FMR is a 40th-percentile area-wide aggregate, not a unit-level rent
        quote. ACS estimates have margins of error that can be large in small
        counties; we publish the estimate as released and surface a
        suppression notice where the relative MOE makes the figure
        unreliable. NLIHC's state aggregates use a different weighting than a
        simple county-FMR average, so state and county pages can show
        slightly different numbers — both are correct for the level they
        describe. The{' '}
        <a href="/methodology/">methodology page</a> spells out the full set
        of caveats, including the sub-area handling for the 22 large CBSAs
        where HUD splits a metro into multiple FMR areas.
      </p>

      <h2>Editorial team and oversight</h2>
      <p>
        FairRentWize publishes as the {EDITORIAL_TEAM.name}, operating under
        the {PUBLISHER.name} editorial policy. The team reviews every
        substantive change against the cited primary sources — HUD Fair
        Market Rent tables, the Census ACS 2019-2023 5-Year release, NLIHC{' '}
        <em>Out of Reach 2025</em>, and the DOL FLSA federal minimum-wage
        reference — before publication and ships corrections promptly when a
        divergence is flagged. The shared{' '}
        <a href="https://datapeekfacts.com/editorial-policy/" target="_blank" rel="noopener noreferrer">
          editorial policy
        </a>{' '}
        documents conflict-of-interest handling, ad disclosure, and
        editorial standards for commentary attached to entity pages: every
        per-county and per-metro paragraph is reviewed against the HUD FMR
        line, the Census ACS 5-Year estimate, or the NLIHC OOR state row it
        cites before deploy. The 30% rent-to-income threshold rendered on
        each entity page is anchored to HUD&apos;s formal cost-burden
        definition at 24 CFR 5.628 and the underlying 42 USC 1437a public
        housing definitions, both surfaced in the methodology page rather
        than inferred from a private market index.
      </p>
      <h2>Lever methodology and statutory anchors</h2>
      <p>
        On top of the four primary datasets, FairRentWize renders three
        deterministic classifiers on every state page. The{' '}
        <strong>RentBurdenTier</strong> bands the Census ACS B25070 share of
        renters spending 30% or more of income on rent against HUD&apos;s
        statutory 30% cost-burden line. The{' '}
        <strong>OOR Housing Wage Multiple</strong> divides NLIHC OOR
        2025&apos;s 2BR housing wage by the same report&apos;s mean renter
        wage, anchored at the bottom by the DOL FLSA $7.25 federal minimum
        wage. The{' '}
        <strong>FMR County Variance Tier</strong> computes the within-state
        population coefficient of variation of HUD FY 2025 2BR FMR across
        counties (states with under 3 counties return insufficient-data
        rather than a misleading variance). A fourth surface, the{' '}
        <strong>FairRent Interpretation</strong> composite, classifies each
        state into one of six DominantSignal categories based on the tuple
        of these three levers — never an opinion, always a priority-ordered
        rule. The full lever specification, with band cutoffs and the
        DominantSignal classifier table, lives on the{' '}
        <a href="/methodology/">methodology page</a>.
      </p>

      <h2>Statutory anchors and federal citations</h2>
      <p>
        The figures FairRentWize renders are not interpreted from a private
        market index; every threshold and rate ties to a specific federal
        statute, regulation, or HUD / Census / DOL publication. The HUD 30%
        cost-burden definition the site uses to label a household
        cost-burdened is set by 24 CFR 5.628, anchored to 42 USC 1437a. HUD&apos;s
        Fair Market Rent itself is published annually by HUD&apos;s Office of
        Policy Development and Research, with the FY 2025 release used across
        every state, county, and metro page. The Section 8 Housing Choice
        Voucher payment-standard math that some readers compare FMR against is
        set under 24 CFR 982.503, and the broader voucher administrative rule
        under 24 CFR 982 and 24 CFR 888. The Low-Income Housing Tax Credit
        (LIHTC) program HUD references when discussing affordable units is
        codified at 26 USC 42. The DOL FLSA federal minimum wage of $7.25/hr,
        used as the OOR Housing Wage Multiple lower-anchor, has been in effect
        since 24 July 2009 under 29 USC 206. Census Bureau ACS variables on
        every entity page are B19013 (median household income), B25008
        (occupied housing units by tenure), B25031 (median gross rent by
        bedrooms), B25064 (median gross rent), and B25070 (gross rent as a
        percentage of household income). NLIHC&apos;s <em>Out of Reach 2025</em>
        report, published by the National Low Income Housing Coalition in
        Washington, DC, supplies the housing wage and renter-wage tables on
        every state page.
      </p>

      <h2>Contact and corrections</h2>
      <p>
        For data corrections, methodology questions, or partnership inquiries,
        please use the <a href="/contact/">contact page</a>. We read every
        message and respond to data-correction requests within seven days.
        Non-data inquiries (advertising, syndication, press) route through the{' '}
        {PUBLISHER.name} general inbox.
      </p>

      <CrossSiteLinks current="FairRentWize" />

      <AuthorBox
        vintage={ABOUT_VINTAGE}
        source="About page: FairRentWize editorial policy + DataPeek Research Network governance + corrections workflow."
      />
    </article>
  );
}
