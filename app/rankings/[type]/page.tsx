import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Database from 'better-sqlite3';
import path from 'path';
import { type StateRow, type County } from '@/lib/db';
import { formatCurrency, formatPercent, getDataYear } from '@/lib/format';
import { breadcrumbSchema, itemListSchema } from '@/lib/schema';
import { AdSlot } from '@/components/AdSlot';
import { FreshnessTag } from '@/components/FreshnessTag';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';
import { DataSourceBadge } from '@/components/DataSourceBadge';

const DB_PATH = path.join(process.cwd(), 'data', 'rents.db');

interface RankingConfig {
  title: string;
  desc: string;
  type: 'state' | 'county';
  column: string;
  dir: 'ASC' | 'DESC';
  label: string;
  stateAbbr?: string;
  stateName?: string;
  stateSlug?: string;
}

function getAllRankings(): Record<string, RankingConfig> {
  const db = new Database(DB_PATH, { readonly: true });
  const states = db.prepare('SELECT slug, state, abbr FROM states ORDER BY state').all() as { slug: string; state: string; abbr: string }[];
  db.close();

  const all: Record<string, RankingConfig> = {
    'highest-rent-by-state': {
      title: 'Highest Rent States in America',
      desc: 'US states ranked by highest average 2-bedroom fair market rent.',
      type: 'state', column: 'avg_rent_2br', dir: 'DESC', label: 'Avg 2BR Rent',
    },
    'lowest-rent-by-state': {
      title: 'Lowest Rent States in America',
      desc: 'US states ranked by lowest average 2-bedroom fair market rent.',
      type: 'state', column: 'avg_rent_2br', dir: 'ASC', label: 'Avg 2BR Rent',
    },
  };

  for (const st of states) {
    all[`most-affordable-in-${st.slug}`] = {
      title: `Most Affordable Counties in ${st.state}`,
      desc: `Counties in ${st.state} ranked by lowest 2-bedroom fair market rent.`,
      type: 'county', column: 'fmr_2br', dir: 'ASC', label: '2BR FMR',
      stateAbbr: st.abbr, stateName: st.state, stateSlug: st.slug,
    };
  }

  return all;
}

const ALL_RANKINGS = getAllRankings();

interface Props { params: Promise<{ type: string }> }
export const dynamicParams = true;
export const revalidate = 86400;

export function generateStaticParams() {
  return Object.keys(ALL_RANKINGS).map(type => ({ type }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const r = ALL_RANKINGS[type];
  if (!r) return {};
  const year = getDataYear();
  return {
    title: `${r.title} (${year})`,
    description: r.desc,
    alternates: { canonical: `/rankings/${type}/` },
    openGraph: { title: `${r.title} (${year})`, description: r.desc, url: `/rankings/${type}/` },
  };
}

export default async function RankingPage({ params }: Props) {
  const { type } = await params;
  const r = ALL_RANKINGS[type];
  if (!r) notFound();

  const db = new Database(DB_PATH, { readonly: true });
  const year = getDataYear();

  if (r.type === 'state') {
    const states = db.prepare(
      `SELECT * FROM states ORDER BY ${r.column} ${r.dir}`
    ).all() as StateRow[];
    db.close();

    if (states.length === 0) notFound();

    const listItems = states.map(s => ({ name: s.state, url: `/state/${s.slug}/` }));

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema(r.title, `/rankings/${type}`, listItems)) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Rankings', url: `/rankings/${type}/` },
        ])) }} />

        <nav className="text-sm text-slate-500 mb-4">
          <a href="/" className="hover:text-indigo-600">Home</a> &raquo; <span>Rankings</span> &raquo; <span>{r.title}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-2">{r.title} ({year})</h1>
        <p className="text-slate-600 mb-4">{r.desc}</p>
        <FreshnessTag source="HUD Fair Market Rents" />

        <AdSlot id="ranking-top" />

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-slate-200 text-left">
                <th className="py-2.5 px-2">#</th>
                <th className="py-2.5 px-2">State</th>
                <th className="py-2.5 px-2 text-right">1BR Rent</th>
                <th className="py-2.5 px-2 text-right">2BR Rent</th>
                <th className="py-2.5 px-2 text-right">Median Income</th>
                <th className="py-2.5 px-2 text-right">Renter %</th>
              </tr>
            </thead>
            <tbody>
              {states.map((s, i) => (
                <tr key={s.slug} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2 px-2 text-slate-400">{i + 1}</td>
                  <td className="py-2 px-2">
                    <a href={`/state/${s.slug}/`} className="text-indigo-600 hover:underline font-medium">{s.state}</a>
                  </td>
                  <td className="py-2 px-2 text-right">{formatCurrency(s.avg_rent_1br)}/mo</td>
                  <td className="py-2 px-2 text-right font-medium">{formatCurrency(s.avg_rent_2br)}/mo</td>
                  <td className="py-2 px-2 text-right">{formatCurrency(s.median_income)}</td>
                  <td className="py-2 px-2 text-right">{formatPercent(s.renter_pct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Links to other rankings */}
        <section className="mt-8">
          <h2 className="text-lg font-bold mb-3">More Rankings</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            {Object.entries(ALL_RANKINGS)
              .filter(([key, val]) => val.type === 'state' && key !== type)
              .map(([key, val]) => (
                <a key={key} href={`/rankings/${key}`} className="px-3 py-1 bg-slate-100 rounded-full hover:bg-indigo-100 hover:text-indigo-700">
                  {val.title}
                </a>
              ))}
          </div>
        </section>

        <AdSlot id="ranking-bottom" />
        <DataSourceBadge sources={[{ name: 'HUD FMR', url: 'https://www.huduser.gov/portal/datasets/fmr.html' }]} />
        <CrossSiteLinks current="FairRentWize" />
      </>
    );
  }

  // County rankings (state-specific)
  const counties = db.prepare(
    `SELECT * FROM counties WHERE state = ? ORDER BY ${r.column} ${r.dir} LIMIT 50`
  ).all(r.stateAbbr!) as County[];
  db.close();

  if (counties.length === 0) notFound();

  const listItems = counties.map(c => ({ name: c.county_name, url: `/county/${c.slug}/` }));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema(r.title, `/rankings/${type}`, listItems)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: r.stateName!, url: `/state/${r.stateSlug}/` },
        { name: r.title, url: `/rankings/${type}/` },
      ])) }} />

      <nav className="text-sm text-slate-500 mb-4">
        <a href="/" className="hover:text-indigo-600">Home</a> &raquo;{' '}
        <a href={`/state/${r.stateSlug}/`} className="hover:text-indigo-600">{r.stateName}</a> &raquo;{' '}
        <span>{r.title}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">{r.title} ({year})</h1>
      <p className="text-slate-600 mb-4">{r.desc}</p>
      <FreshnessTag source="HUD Fair Market Rents" />

      <AdSlot id="ranking-top" />

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-slate-200 text-left">
              <th className="py-2.5 px-2">#</th>
              <th className="py-2.5 px-2">County</th>
              <th className="py-2.5 px-2 text-right">Studio</th>
              <th className="py-2.5 px-2 text-right">1BR</th>
              <th className="py-2.5 px-2 text-right">2BR</th>
              <th className="py-2.5 px-2 text-right">Income</th>
              <th className="py-2.5 px-2 text-right">Burden</th>
            </tr>
          </thead>
          <tbody>
            {counties.map((c, i) => (
              <tr key={c.slug} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-2 px-2 text-slate-400">{i + 1}</td>
                <td className="py-2 px-2">
                  <a href={`/county/${c.slug}/`} className="text-indigo-600 hover:underline font-medium">{c.county_name}</a>
                </td>
                <td className="py-2 px-2 text-right">{formatCurrency(c.fmr_studio)}</td>
                <td className="py-2 px-2 text-right">{formatCurrency(c.fmr_1br)}</td>
                <td className="py-2 px-2 text-right font-medium">{formatCurrency(c.fmr_2br)}</td>
                <td className="py-2 px-2 text-right">{formatCurrency(c.median_income)}</td>
                <td className="py-2 px-2 text-right">{formatPercent(c.rent_burden_pct)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Links to other state rankings */}
      <section className="mt-8">
        <h2 className="text-lg font-bold mb-3">National Rankings</h2>
        <div className="flex flex-wrap gap-2 text-sm">
          <a href="/rankings/highest-rent-by-state" className="px-3 py-1 bg-slate-100 rounded-full hover:bg-indigo-100 hover:text-indigo-700">
            Highest Rent States
          </a>
          <a href="/rankings/lowest-rent-by-state" className="px-3 py-1 bg-slate-100 rounded-full hover:bg-indigo-100 hover:text-indigo-700">
            Lowest Rent States
          </a>
        </div>
      </section>

      <AdSlot id="ranking-bottom" />
      <DataSourceBadge sources={[{ name: 'HUD FMR', url: 'https://www.huduser.gov/portal/datasets/fmr.html' }]} />
      <CrossSiteLinks current="FairRentWize" />
    </>
  );
}
