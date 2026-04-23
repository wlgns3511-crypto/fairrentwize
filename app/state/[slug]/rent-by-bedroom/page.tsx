import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllStates, getStateBySlug, getCountiesByState, type County, type StateRow } from '@/lib/db';
import { buildDbPageRobots, getDbPageGate, getReviewedAt, getReviewedBy, getDataVintageLabel, METHODOLOGY_URL, buildTrustUpdatedLabel } from '@/lib/db-page';
import { formatCurrency, getDataYear } from '@/lib/format';
import { breadcrumbSchema, faqSchema } from '@/lib/schema';
import { AdSlot } from '@/components/AdSlot';
import { AuthorBox } from '@/components/AuthorBox';
import { FreshnessTag } from '@/components/FreshnessTag';
import { EditorNote } from '@/components/EditorNote';
import { DataSourceBadge } from '@/components/DataSourceBadge';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';
import { FeedbackButton } from '@/components/FeedbackButton';

interface Props { params: Promise<{ slug: string }> }
export const dynamicParams = false;
export const revalidate = 86400;

type BedKey = 'fmr_studio' | 'fmr_1br' | 'fmr_2br' | 'fmr_3br' | 'fmr_4br';
interface BedDef { key: BedKey; label: string; note: string }

const BEDROOMS: BedDef[] = [
  { key: 'fmr_studio', label: 'Studio', note: 'Single-room unit with kitchen + bath, no separate bedroom.' },
  { key: 'fmr_1br', label: '1-bedroom', note: 'One separate bedroom. Common for singles and couples.' },
  { key: 'fmr_2br', label: '2-bedroom', note: 'HUD\u2019s reference unit — used for most voucher calculations.' },
  { key: 'fmr_3br', label: '3-bedroom', note: 'Typical family unit — 2 adults + 2 children, or 3 roommates.' },
  { key: 'fmr_4br', label: '4-bedroom', note: 'Larger family or shared housing. Smallest sample per area.' },
];

export function generateStaticParams() {
  return getAllStates().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const state = getStateBySlug(slug);
  if (!state) return {};
  const counties = getCountiesByState(state.abbr);
  const year = getDataYear();
  const topAnswer = buildTopAnswer(state, counties);
  const gate = getDbPageGate({
    alternativeLinkCount: 4,
    topAnswer,
  });
  return {
    title: `${state.state} Rent by Bedroom ${year} — Studio / 1BR / 2BR / 3BR / 4BR across ${counties.length} counties`,
    description: topAnswer,
    alternates: { canonical: `/state/${slug}/rent-by-bedroom/` },
    openGraph: { url: `/state/${slug}/rent-by-bedroom/` },
    robots: buildDbPageRobots(gate.pass),
  };
}

function buildTopAnswer(state: StateRow, counties: County[]): string {
  const cntWithStudio = counties.filter((c) => (c.fmr_studio ?? 0) > 0).length;
  const studioAvg = cntWithStudio > 0 ? Math.round(counties.reduce((s, c) => s + (c.fmr_studio ?? 0), 0) / cntWithStudio) : 0;
  const br4Avg = Math.round(counties.reduce((s, c) => s + (c.fmr_4br ?? 0), 0) / counties.length);
  return `${state.state} Fair Market Rents by bedroom size across ${counties.length} counties: studio averages ${formatCurrency(studioAvg)}/mo, 4-bedroom averages ${formatCurrency(br4Avg)}/mo. See county-level studio / 1BR / 2BR / 3BR / 4BR percentile bands and the 4-to-studio ratio that reveals the true family-size premium.`;
}

function median(vals: number[]): number {
  if (vals.length === 0) return 0;
  const sorted = [...vals].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}
function percentile(vals: number[], p: number): number {
  if (vals.length === 0) return 0;
  const sorted = [...vals].sort((a, b) => a - b);
  const idx = Math.max(0, Math.min(sorted.length - 1, Math.round(p * (sorted.length - 1))));
  return sorted[idx];
}

interface BedStats {
  bed: BedDef;
  min: number;
  p25: number;
  p50: number;
  p75: number;
  max: number;
  mean: number;
  minCounty: County | null;
  maxCounty: County | null;
  nValid: number;
}

function buildBedStats(counties: County[]): BedStats[] {
  return BEDROOMS.map((bed) => {
    const valid = counties.filter((c) => (Number(c[bed.key]) || 0) > 0);
    const vals = valid.map((c) => Number(c[bed.key]));
    const mean = valid.length ? Math.round(vals.reduce((s, v) => s + v, 0) / valid.length) : 0;
    let minCounty: County | null = null;
    let maxCounty: County | null = null;
    if (valid.length) {
      minCounty = valid[0];
      maxCounty = valid[0];
      for (const c of valid) {
        if (Number(c[bed.key]) < Number(minCounty[bed.key])) minCounty = c;
        if (Number(c[bed.key]) > Number(maxCounty[bed.key])) maxCounty = c;
      }
    }
    return {
      bed,
      min: vals.length ? Math.min(...vals) : 0,
      p25: percentile(vals, 0.25),
      p50: median(vals),
      p75: percentile(vals, 0.75),
      max: vals.length ? Math.max(...vals) : 0,
      mean,
      minCounty,
      maxCounty,
      nValid: valid.length,
    };
  });
}

export default async function RentByBedroomPage({ params }: Props) {
  const { slug } = await params;
  const state = getStateBySlug(slug);
  if (!state) notFound();
  const counties = getCountiesByState(state.abbr);
  if (counties.length === 0) notFound();
  const year = getDataYear();
  const topAnswer = buildTopAnswer(state, counties);

  const stats = buildBedStats(counties);
  const studioStats = stats.find((s) => s.bed.key === 'fmr_studio');
  const br2Stats = stats.find((s) => s.bed.key === 'fmr_2br');
  const br4Stats = stats.find((s) => s.bed.key === 'fmr_4br');

  // 4BR-to-studio ratio per county — "family premium"
  const premiumRows = counties
    .filter((c) => (c.fmr_studio ?? 0) > 0 && (c.fmr_4br ?? 0) > 0)
    .map((c) => ({
      county: c,
      ratio: (c.fmr_4br ?? 0) / (c.fmr_studio ?? 1),
      spread: (c.fmr_4br ?? 0) - (c.fmr_studio ?? 0),
    }))
    .sort((a, b) => b.ratio - a.ratio);

  const highestPremium = premiumRows.slice(0, 5);
  const lowestPremium = [...premiumRows].slice(-5).reverse();

  const affordable1br = Math.round((state.median_income * 0.3) / 12);
  const affordableVsBr2 = br2Stats ? affordable1br - br2Stats.p50 : 0;

  // Peer states by average 2BR rent
  const allStates = getAllStates();
  const peers = allStates
    .filter((s) => s.slug !== slug)
    .sort((a, b) => Math.abs(a.avg_rent_2br - state.avg_rent_2br) - Math.abs(b.avg_rent_2br - state.avg_rent_2br))
    .slice(0, 4);

  const crumbs = [
    { name: 'Home', url: '/' },
    { name: state.state, url: `/state/${slug}/` },
    { name: 'Rent by bedroom', url: `/state/${slug}/rent-by-bedroom/` },
  ];

  const faqs: { question: string; answer: string }[] = [
    {
      question: `What is a Fair Market Rent (FMR) in ${state.state}?`,
      answer: `HUD sets Fair Market Rents annually at roughly the 40th percentile of gross rents (rent + utilities) for recent movers in each metro or nonmetro area. FMRs drive Housing Choice Voucher (Section 8) payment standards and a handful of other federal housing programs. They are not an average rent across all tenants — long-term renters with stable leases often pay less than FMR.`,
    },
    {
      question: `Which bedroom size does HUD actually use for voucher math in ${state.state}?`,
      answer: `HUD bases household size calculations on the number of people + their relationships, but for headline FMR tables the 2-bedroom figure is usually treated as the reference unit. That\u2019s why most news coverage quotes "fair market rent" as the 2BR number. This page keeps all 5 bedroom sizes (studio through 4BR) so you can see where the family premium sits.`,
    },
    {
      question: `Why is the studio FMR sometimes missing for some ${state.state} counties?`,
      answer: `In very small or heavily owner-occupied counties, HUD may not publish a studio FMR because the underlying ACS sample is too thin to estimate reliably. This page only uses non-zero values when computing percentiles, so a county with a missing studio is excluded from the studio row but counted in the 1BR/2BR rows it does have.`,
    },
    {
      question: `What does the "4BR-to-studio ratio" tell me about ${state.state}?`,
      answer: `It measures how much more a family-sized unit costs relative to a single-occupant unit in the same county. A ratio near 2.0 means a 4-bedroom apartment costs about twice as much as a studio. A ratio above 2.5 usually signals a family-unit squeeze — the market is priced for singles and couples, with a steep premium for anyone needing 3+ bedrooms. The top and bottom 5 ${state.state} counties by this ratio are listed below.`,
    },
    {
      question: `Can I use this page to predict my actual rent in ${state.state}?`,
      answer: `It\u2019s a benchmark, not a quote. Actual rent depends on the specific submarket, unit age and condition, amenities (in-unit laundry, parking, pool), and how recently the lease was signed. FMRs are set once a year using data from 12\u201324 months prior, so today\u2019s listings in fast-moving metros often run higher than the published FMR.`,
    },
    {
      question: `Why does ${state.state} have such wide spread between the lowest and highest-rent county?`,
      answer: `Rural nonmetro counties sit at the lower end, while the most expensive metros sit at the high end. The spread tells you how internally variable the state is — a state like California has a huge gap between central-valley counties and the Bay Area, while a state with flatter geography (smaller population centers and homogeneous housing stock) will show a narrower p25\u2013p75 band on this page.`,
    },
    {
      question: `How does median income interact with these rents?`,
      answer: `At ${state.state}\u2019s median household income of ${formatCurrency(state.median_income)}, the 30% affordability threshold puts rent at ${formatCurrency(affordable1br)}/mo or less. Comparing this against the statewide p50 2BR rent of ${formatCurrency(br2Stats?.p50 ?? 0)} shows whether a median earner in the state is broadly on the right side of the 30% rule, or already pushed into rent burden.`,
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />

      <nav className="text-sm text-slate-500 mb-4">
        <Link href="/" className="hover:text-indigo-600">Home</Link> &raquo;{' '}
        <Link href={`/state/${slug}/`} className="hover:text-indigo-600">{state.state}</Link> &raquo;{' '}
        <span>Rent by bedroom</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
        {state.state} Rent by Bedroom {year}
      </h1>
      <p className="text-slate-700 leading-relaxed mb-4 max-w-3xl">{topAnswer}</p>

      <FreshnessTag
        source="HUD Fair Market Rents"
        updated={getReviewedAt()}
        reviewedBy={getReviewedBy()}
        dataVintage={getDataVintageLabel()}
        methodologyUrl={METHODOLOGY_URL}
      />

      <EditorNote
        note={`Percentiles below are computed across the ${counties.length} ${state.state} counties in HUD's FY ${year} FMR release. Each county counts equally — this gives small rural counties the same weight as Los Angeles or Santa Clara, which is deliberate because HUD publishes one FMR per area regardless of population.`}
      />

      {/* Spotlight cards */}
      <div className="grid sm:grid-cols-3 gap-3 my-6">
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
          <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-1">Counties analyzed</div>
          <div className="text-2xl font-bold text-indigo-900">{counties.length}</div>
          <div className="text-xs text-indigo-700 mt-1">
            {studioStats?.nValid ?? 0} with studio FMR · {br4Stats?.nValid ?? 0} with 4BR FMR
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Statewide 2BR band</div>
          <div className="text-2xl font-bold text-slate-900">
            {formatCurrency(br2Stats?.p25 ?? 0)} &ndash; {formatCurrency(br2Stats?.p75 ?? 0)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            p25&ndash;p75 county range · median {formatCurrency(br2Stats?.p50 ?? 0)}
          </div>
        </div>
        <div className={`rounded-xl border p-4 ${affordableVsBr2 >= 0 ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
          <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${affordableVsBr2 >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            30% rule headroom
          </div>
          <div className={`text-2xl font-bold ${affordableVsBr2 >= 0 ? 'text-emerald-900' : 'text-rose-900'}`}>
            {affordableVsBr2 >= 0 ? '+' : ''}{formatCurrency(Math.abs(affordableVsBr2))}
          </div>
          <div className={`text-xs mt-1 ${affordableVsBr2 >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            Median income allows {formatCurrency(affordable1br)}/mo; median 2BR is {formatCurrency(br2Stats?.p50 ?? 0)}.
          </div>
        </div>
      </div>

      <AdSlot id="top" />

      {/* Main bedroom-tier table */}
      <section className="mt-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Bedroom-tier FMR across {state.state} counties</h2>
        <p className="text-sm text-slate-600 mb-4 max-w-3xl">
          Each row shows the statewide distribution for that bedroom size. Min / p25 / median / p75 / max
          are computed across the {counties.length} {state.state} counties with a published FMR for that size.
        </p>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-600">
              <tr>
                <th className="text-left p-3">Bedroom size</th>
                <th className="text-right p-3">Min</th>
                <th className="text-right p-3">p25</th>
                <th className="text-right p-3">Median (p50)</th>
                <th className="text-right p-3">p75</th>
                <th className="text-right p-3">Max</th>
                <th className="text-left p-3">Cheapest county</th>
                <th className="text-left p-3">Priciest county</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.map((s) => (
                <tr key={s.bed.key} className="hover:bg-slate-50">
                  <td className="p-3">
                    <div className="font-medium text-slate-900">{s.bed.label}</div>
                    <div className="text-xs text-slate-500">{s.bed.note}</div>
                  </td>
                  <td className="p-3 text-right text-slate-600">{formatCurrency(s.min)}</td>
                  <td className="p-3 text-right text-slate-600">{formatCurrency(s.p25)}</td>
                  <td className="p-3 text-right font-semibold text-slate-900">{formatCurrency(s.p50)}</td>
                  <td className="p-3 text-right text-slate-600">{formatCurrency(s.p75)}</td>
                  <td className="p-3 text-right text-slate-600">{formatCurrency(s.max)}</td>
                  <td className="p-3">
                    {s.minCounty ? (
                      <Link href={`/county/${s.minCounty.slug}/`} className="text-emerald-700 hover:underline text-sm font-medium">
                        {s.minCounty.county_name}
                      </Link>
                    ) : (
                      <span className="text-slate-400">&mdash;</span>
                    )}
                    {s.minCounty && <div className="text-xs text-slate-500">{formatCurrency(Number(s.minCounty[s.bed.key]))}</div>}
                  </td>
                  <td className="p-3">
                    {s.maxCounty ? (
                      <Link href={`/county/${s.maxCounty.slug}/`} className="text-rose-700 hover:underline text-sm font-medium">
                        {s.maxCounty.county_name}
                      </Link>
                    ) : (
                      <span className="text-slate-400">&mdash;</span>
                    )}
                    {s.maxCounty && <div className="text-xs text-slate-500">{formatCurrency(Number(s.maxCounty[s.bed.key]))}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Family premium section */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">4BR-to-studio family premium in {state.state}</h2>
        <p className="text-sm text-slate-600 mb-4 max-w-3xl">
          The ratio of 4-bedroom FMR to studio FMR shows how steep the family-size jump is in each county. A
          ratio near 2.0 means a 4BR costs about twice a studio; values above 2.5 mean the market is priced
          for singles and couples with a disproportionate premium for larger households.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4">
            <h3 className="font-bold text-rose-900 mb-2">Steepest family premium (top 5)</h3>
            <ol className="space-y-2 text-sm">
              {highestPremium.map((r, i) => (
                <li key={r.county.slug} className="flex items-start justify-between gap-3">
                  <span>
                    <span className="text-slate-400 text-xs mr-1">{i + 1}.</span>
                    <Link href={`/county/${r.county.slug}/`} className="font-medium text-slate-900 hover:underline">
                      {r.county.county_name}
                    </Link>
                  </span>
                  <span className="text-right shrink-0">
                    <span className="font-semibold text-rose-800">{r.ratio.toFixed(2)}&times;</span>
                    <div className="text-xs text-slate-500">
                      {formatCurrency(r.county.fmr_studio)} &rarr; {formatCurrency(r.county.fmr_4br)}
                    </div>
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
            <h3 className="font-bold text-emerald-900 mb-2">Flattest family premium (bottom 5)</h3>
            <ol className="space-y-2 text-sm">
              {lowestPremium.map((r, i) => (
                <li key={r.county.slug} className="flex items-start justify-between gap-3">
                  <span>
                    <span className="text-slate-400 text-xs mr-1">{i + 1}.</span>
                    <Link href={`/county/${r.county.slug}/`} className="font-medium text-slate-900 hover:underline">
                      {r.county.county_name}
                    </Link>
                  </span>
                  <span className="text-right shrink-0">
                    <span className="font-semibold text-emerald-800">{r.ratio.toFixed(2)}&times;</span>
                    <div className="text-xs text-slate-500">
                      {formatCurrency(r.county.fmr_studio)} &rarr; {formatCurrency(r.county.fmr_4br)}
                    </div>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <AdSlot id="mid" />

      {/* How to use */}
      <section className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-lg font-bold text-slate-900 mb-2">How to use the bedroom breakdown</h2>
        <ul className="space-y-2 text-sm text-slate-700 list-disc pl-5">
          <li>
            If you need a <strong>1&ndash;2 bedroom</strong> unit, the p25&ndash;p75 band in the main table is the
            realistic affordability window across {state.state} counties &mdash; prices below p25 are rural, prices
            above p75 are metro.
          </li>
          <li>
            If you need a <strong>3&ndash;4 bedroom</strong> unit, the family-premium ranking above matters more
            than the headline 2BR FMR. A county with a 2.8&times; ratio will feel dramatically tighter for families
            than a 1.8&times; county.
          </li>
          <li>
            For <strong>Section 8 / Housing Choice Voucher</strong> searches, the payment standard is usually
            set between 90%&ndash;110% of the FMR for the relevant bedroom size. The median column is a reasonable
            anchor, but your PHA may set a higher or lower standard.
          </li>
          <li>
            FMRs reflect <strong>gross rent</strong> (rent + tenant-paid utilities). If you&rsquo;re comparing
            listings that quote "rent only," add estimated utilities before benchmarking.
          </li>
        </ul>
      </section>

      {/* Peer states */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-3">
          States with similar average 2BR rent to {state.state}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {peers.map((p) => (
            <Link
              key={p.slug}
              href={`/state/${p.slug}/rent-by-bedroom/`}
              className="rounded-xl border border-slate-200 p-4 hover:border-indigo-400 hover:shadow-sm transition-all"
            >
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Peer state</div>
              <div className="text-lg font-bold text-slate-900">{p.state}</div>
              <div className="text-xs text-slate-500 mt-1">2BR avg {formatCurrency(p.avg_rent_2br)}/mo</div>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Frequently asked &mdash; {state.state} rent by bedroom</h2>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <details key={faq.question} className="rounded-lg border border-slate-200 bg-white">
              <summary className="p-4 font-semibold cursor-pointer hover:bg-slate-50 text-slate-900">
                {faq.question}
              </summary>
              <p className="px-4 pb-4 text-sm text-slate-700 leading-relaxed">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-10 flex flex-wrap gap-2 text-sm">
        <Link
          href={`/state/${slug}/`}
          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-indigo-400 transition-colors"
        >
          &larr; Back to {state.state} overview
        </Link>
        <Link href="/compare/" className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-700 hover:bg-indigo-100 transition-colors">
          State-vs-state compare &rarr;
        </Link>
      </section>

      <FeedbackButton pageId={`${slug}-rent-by-bedroom`} />

      <DataSourceBadge
        sources={[
          { name: 'HUD Fair Market Rents', url: 'https://www.huduser.gov/portal/datasets/fmr.html' },
          { name: 'Census ACS Housing', url: 'https://www.census.gov/topics/housing.html' },
        ]}
      />

      <AdSlot id="bottom" />
      <AuthorBox />
      <CrossSiteLinks current="fairrentwize" />
    </>
  );
}
