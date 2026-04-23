import { getAllMetroSlugs, getMetroBySlug, getStateByAbbr, getTopMetrosByRent } from '@/lib/db';
import { buildDbPageRobots, buildTrustUpdatedLabel, getDataVintageLabel, getDbPageGate, getReviewedAt, getReviewedBy, METHODOLOGY_URL } from '@/lib/db-page';
import { formatCurrency, formatPercent, getDataYear } from '@/lib/format';
import { breadcrumbSchema, faqSchema, generateMetroFAQs } from '@/lib/schema';
import { AdSlot } from '@/components/AdSlot';
import { AuthorBox } from '@/components/AuthorBox';
import { FreshnessTag } from '@/components/FreshnessTag';
import { AnswerHero } from '@/components/upgrades/AnswerHero';
import { TrustBlock } from '@/components/upgrades/TrustBlock';
import { DecisionNext } from '@/components/upgrades/DecisionNext';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Props { params: Promise<{ slug: string }> }

export const dynamicParams = false;

function buildMetroTopAnswer(metro: NonNullable<ReturnType<typeof getMetroBySlug>>, affordableRent: number, rentBurden: string) {
  return `${metro.metro_name} has a 2-bedroom fair market rent of ${formatCurrency(metro.fmr_2br)}/month against a median household income of ${formatCurrency(metro.median_income)}/year. That puts the metro at roughly ${rentBurden} rent burden on the HUD 2-bedroom benchmark, which is the quickest way to tell whether this market is within the 30% affordability rule or already above it.`;
}

export async function generateStaticParams() {
  return getAllMetroSlugs().map(m => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const metro = getMetroBySlug(slug);
  if (!metro) return {};
  const year = getDataYear();
  const affordableRent = Math.round(metro.median_income * 0.3 / 12);
  const rentBurden = ((metro.fmr_2br * 12) / metro.median_income * 100).toFixed(1);
  const description = buildMetroTopAnswer(metro, affordableRent, rentBurden);
  const gate = getDbPageGate({
    alternativeLinkCount: 4,
    topAnswer: description,
  });
  return {
    title: `${metro.metro_name} Fair Market Rent ${year} - Rental Costs & Affordability`,
    description,
    alternates: { canonical: `/metro/${slug}/` },
    openGraph: { url: `/metro/${slug}/` },
    robots: buildDbPageRobots(gate.pass),
  };
}

export default async function MetroPage({ params }: Props) {
  const { slug } = await params;
  const metro = getMetroBySlug(slug);
  if (!metro) notFound();
  const year = getDataYear();

  const state = getStateByAbbr(metro.state);
  const faqs = generateMetroFAQs(metro);
  const allMetros = getTopMetrosByRent(20);

  const affordableRent = Math.round(metro.median_income * 0.3 / 12);
  const rentBurden = ((metro.fmr_2br * 12) / metro.median_income * 100).toFixed(1);
  const isBurdened = parseFloat(rentBurden) >= 30;
  const topAnswer = buildMetroTopAnswer(metro, affordableRent, rentBurden);

  const bedroomData = [
    { label: 'Studio', value: metro.fmr_studio },
    { label: '1 Bedroom', value: metro.fmr_1br },
    { label: '2 Bedroom', value: metro.fmr_2br },
    { label: '3 Bedroom', value: metro.fmr_3br },
    { label: '4 Bedroom', value: metro.fmr_4br },
  ];
  const maxRent = Math.max(...bedroomData.map(d => d.value));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: state?.state || metro.state, url: `/state/${state?.slug || ''}/` },
        { name: metro.metro_name, url: `/metro/${slug}/` },
      ])) }} />
      {faqs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />}

      <nav className="text-sm text-slate-500 mb-4">
        <a href="/" className="hover:text-indigo-600">Home</a> &raquo;{' '}
        {state && <><a href={`/state/${state.slug}/`} className="hover:text-indigo-600">{state.state}</a> &raquo; </>}
        <span>{metro.metro_name}</span>
      </nav>

      <AnswerHero
        title={`${metro.metro_name} fair market rent`}
        subtitle={`HUD FMR ${year}`}
        tagline={topAnswer}
        badges={[
          { label: `${rentBurden}% rent burden`, tone: isBurdened ? "amber" as const : "emerald" as const },
          { label: `${metro.vacancy_rate}% vacancy`, tone: "indigo" as const },
        ]}
        alternatives={allMetros.filter(m => m.slug !== slug).slice(0, 3).map(m => ({
          label: m.metro_name,
          href: `/metro/${m.slug}/`,
          sublabel: `${formatCurrency(m.fmr_2br)} 2BR`,
        }))}
        alternativesLabel="Compare with metros"
      />

      <FreshnessTag
        source="HUD Fair Market Rents"
        updated={getReviewedAt()}
        reviewedBy={getReviewedBy()}
        dataVintage={getDataVintageLabel()}
        methodologyUrl={METHODOLOGY_URL}
      />

      <TrustBlock
        sources={[
          { name: "HUD Fair Market Rents", url: `https://www.huduser.gov/portal/datasets/fmr.html` },
          { name: "HUD User FMR API", url: "https://www.huduser.gov/portal/dataset/fmr-api.html" },
          { name: "Census ACS Rent", url: "https://www.census.gov/topics/housing.html" },
          { name: "Section 8 Voucher Program", url: "https://www.hud.gov/topics/housing_choice_voucher_program_section_8" },
          { name: "BLS CPI Rent Index", url: "https://www.bls.gov/cpi/factsheets/owners-equivalent-rent-and-rent.htm" },
        ]}
        updated={buildTrustUpdatedLabel()}
        reviewedBy={getReviewedBy()}
        methodologyUrl={METHODOLOGY_URL}
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-slate-600">2BR FMR</p>
          <p className="text-xl font-bold text-indigo-700">{formatCurrency(metro.fmr_2br)}/mo</p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-slate-600">Median Income</p>
          <p className="text-xl font-bold text-indigo-700">{formatCurrency(metro.median_income)}</p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4">
          <p className="text-sm text-slate-600">Vacancy Rate</p>
          <p className="text-xl font-bold text-indigo-700">{metro.vacancy_rate}%</p>
        </div>
        <div className={`rounded-lg p-4 ${isBurdened ? 'bg-red-50' : 'bg-green-50'}`}>
          <p className="text-sm text-slate-600">Rent Burden</p>
          <p className={`text-xl font-bold ${isBurdened ? 'text-red-700' : 'text-green-700'}`}>{rentBurden}%</p>
        </div>
      </div>

      {/* Rent by Bedroom */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Fair Market Rent by Bedroom Size</h2>
        <div className="space-y-3">
          {bedroomData.map(d => (
            <div key={d.label}>
              <div className="flex justify-between text-sm mb-1">
                <span>{d.label}</span>
                <span className="font-semibold">{formatCurrency(d.value)}/mo</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-6">
                <div className="bg-indigo-500 h-6 rounded-full" style={{ width: `${(d.value / maxRent * 100).toFixed(0)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Affordability */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Affordability Analysis</h2>
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-sm text-slate-700 mb-2">
            Based on the 30% rule, a household earning the median income of {formatCurrency(metro.median_income)}/year
            can afford up to <strong>{formatCurrency(affordableRent)}/mo</strong> in rent.
          </p>
          <p className="text-sm text-slate-700">
            The 2BR FMR of {formatCurrency(metro.fmr_2br)}/mo represents <strong>{rentBurden}%</strong> of median income,
            {isBurdened ? ' which exceeds the 30% affordability threshold.' : ' which is within the 30% affordability threshold.'}
          </p>
        </div>
      </section>

      <AdSlot id="metro-mid" />

      {/* Vacancy Rate Context */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Rental Market Conditions</h2>
        <p className="text-sm text-slate-600">
          The vacancy rate of {metro.vacancy_rate}% in {metro.metro_name} indicates a
          {metro.vacancy_rate < 5 ? ' tight' : metro.vacancy_rate < 7 ? ' moderate' : ' loose'} rental market.
          {metro.vacancy_rate < 5 ? ' Low vacancy means more competition for available units and potential upward pressure on rents.' :
           metro.vacancy_rate < 7 ? ' A balanced market with reasonable availability for renters.' :
           ' Higher vacancy gives renters more options and potential leverage on pricing.'}
        </p>
      </section>

      {/* FAQs */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
        {faqs.map((faq, i) => (
          <div key={i} className="mb-4">
            <h3 className="font-semibold text-slate-900">{faq.question}</h3>
            <p className="text-sm text-slate-600 mt-1">{faq.answer}</p>
          </div>
        ))}
      </section>

      {/* Other Metros */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Compare with Other Metro Areas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {allMetros.filter(m => m.slug !== slug).slice(0, 8).map(m => (
            <a key={m.slug} href={`/metro/${m.slug}/`} className="p-3 border border-slate-200 rounded-lg hover:border-indigo-300">
              <p className="font-medium truncate">{m.metro_name}</p>
              <p className="text-slate-500">2BR: {formatCurrency(m.fmr_2br)}/mo</p>
            </a>
          ))}
        </div>
      </section>

      {/* Why this matters — US renter context */}
      <section className="mb-8 mt-6" data-upgrade="why-it-matters">
        <h2 className="text-xl font-bold mb-3">
          Why fair market rent in {metro.metro_name} matters
        </h2>
        <div className="rounded-lg border border-slate-200 bg-white p-5 text-slate-700 leading-relaxed space-y-3">
          <p>
            Fair Market Rent (FMR) is published annually by HUD and used to
            set payment standards for the Section 8 Housing Choice Voucher
            program. FMR represents roughly the 40th percentile of recent
            asking rents in the metro &mdash; not the cheapest, not the
            most expensive, but the price point at which a vouchered
            tenant should be able to find a unit in a non-luxury,
            non-distressed building.
          </p>
          <p>
            For non-vouchered renters, FMR is one of the most useful
            benchmarks available. It&apos;s independent of any listing
            platform&apos;s incentives and is the same number every
            housing nonprofit and government agency uses. If asking rents
            you see online are far above FMR, you&apos;re looking at the
            top of the market &mdash; widen the search.
          </p>
          <p>
            The standard US rule of thumb: housing should not exceed 30%
            of gross household income. At {formatCurrency(metro.median_income)}
            /year median income in {metro.metro_name}, that ceiling is
            {" "}{formatCurrency(affordableRent)}/month. The 2BR FMR of
            {" "}{formatCurrency(metro.fmr_2br)} is {rentBurden}% of
            median &mdash; {isBurdened ? "above" : "within"} the 30% rule.
          </p>
          <p className="text-sm text-slate-500">
            HUD updates FMRs every October for the federal fiscal year
            beginning October 1. Source: HUD User FMR documentation.
          </p>
        </div>
      </section>

      <DecisionNext
        cards={[
          {
            title: `Salary needed in ${metro.metro_name}`,
            blurb: `What gross income do you need to clear the 30% rent burden threshold here?`,
            href: `https://salarybycity.com`,
            cta: `Open SalaryByCity`,
            tone: "indigo" as const,
          },
          {
            title: `Cost of living in this metro`,
            blurb: `Rent is the biggest line, but not the only one. See total cost of living.`,
            href: `https://costbycity.com`,
            cta: `Open CostByCity`,
            tone: "emerald" as const,
          },
          {
            title: `Property tax if you buy`,
            blurb: `Comparing rent to buy? Property tax is often the deciding cost line.`,
            href: `https://propertytaxpeek.com`,
            cta: `Open PropertyTaxPeek`,
            tone: "amber" as const,
          },
        ]}
      />

      <AuthorBox />

      {/* High-CPC footer */}
      <div className="bg-blue-50 rounded-lg p-6 text-sm">
        <h2 className="font-semibold mb-3 text-blue-900">Renting in {metro.metro_name}?</h2>
        <div className="grid md:grid-cols-2 gap-3 text-blue-800">
          <p>Search apartment listings in the {metro.metro_name} area</p>
          <p>Compare renters insurance quotes</p>
          <p>Get moving company estimates</p>
          <p>Explore rent-to-own programs</p>
          <p>Find housing assistance programs</p>
          <p>Check <a href="https://salarybycity.com" className="underline">salary data for this area</a></p>
        </div>
      </div>
    </>
  );
}
