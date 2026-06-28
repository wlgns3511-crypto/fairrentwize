import type { Metadata } from 'next';
import Link from 'next/link';
import Database from 'better-sqlite3';
import path from 'path';
import { getDataYear } from '@/lib/format';
import { breadcrumbSchema, itemListSchema } from '@/lib/schema';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';

const DB_PATH = path.join(process.cwd(), 'data', 'rents.db');

export const metadata: Metadata = {
  title: 'Rent Rankings — Highest, Lowest & Most Affordable by State',
  description:
    'Explore US rental cost rankings: highest and lowest rent states, plus most affordable counties in every state. Updated with HUD Fair Market Rent data.',
  alternates: { canonical: '/rankings/' },
  openGraph: {
    title: 'Rent Rankings — Highest, Lowest & Most Affordable by State',
    description: 'US rental cost rankings by state and county, based on HUD FMR data.',
    url: '/rankings/',
  },
};

interface StateRow {
  slug: string;
  state: string;
}

export default function RankingsIndex() {
  const db = new Database(DB_PATH, { readonly: true });
  const states = db
    .prepare('SELECT slug, state FROM states ORDER BY state')
    .all() as StateRow[];
  db.close();

  const year = getDataYear();

  const nationalRankings = [
    { slug: 'highest-rent-by-state', label: 'Highest Rent States' },
    { slug: 'lowest-rent-by-state', label: 'Lowest Rent States' },
  ];

  const stateRankings = states.map((s) => ({
    slug: `most-affordable-in-${s.slug}`,
    label: `Most Affordable in ${s.state}`,
  }));

  const allItems = [...nationalRankings, ...stateRankings].map((r) => ({
    name: r.label,
    url: `/rankings/${r.slug}/`,
  }));

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: 'Home', url: '/' },
              { name: 'Rankings', url: '/rankings/' },
            ]),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            itemListSchema('Rent Rankings', '/rankings/', allItems),
          ),
        }}
      />

      <nav className="text-sm text-slate-500 mb-4">
        <a href="/" className="hover:text-indigo-600">Home</a> &raquo;{' '}
        <span>Rankings</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Rent Rankings ({year})
        </h1>
        <p className="text-slate-600 max-w-3xl">
          Compare rental costs across America. See which states have the highest
          and lowest rents, or drill into any state to find the most affordable
          counties — all based on HUD Fair Market Rent data.
        </p>
      </header>

      {/* National rankings */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          National Rankings
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {nationalRankings.map((r) => (
            <Link
              key={r.slug}
              href={`/rankings/${r.slug}/`}
              className="block rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 p-5 transition-colors"
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
                50 States
              </div>
              <h3 className="text-lg font-bold text-slate-900">{r.label}</h3>
              <p className="text-sm text-slate-500 mt-1">
                All 50 states ranked by average 2-bedroom fair market rent.
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* State-specific rankings */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          Most Affordable Counties by State
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
          {states.map((s) => (
            <Link
              key={s.slug}
              href={`/rankings/most-affordable-in-${s.slug}/`}
              className="px-3 py-2 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-slate-700 hover:text-indigo-700"
            >
              {s.state}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10 p-6 rounded-xl bg-slate-50 border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-3">
          Explore more data
        </h2>
        <ul className="space-y-2 text-sm">
          <li>
            <Link href="/calculator/" className="text-indigo-700 hover:underline font-medium">
              Rent calculator →
            </Link>
            <span className="text-slate-500"> affordability based on your income</span>
          </li>
          {/* /compare/ killed 2026-04-25 HCU Phase C — pointed at state hub */}
          <li>
            <Link href="/state/california/" className="text-indigo-700 hover:underline font-medium">
              State pages →
            </Link>
            <span className="text-slate-500"> per-state FMR, tenant rights, rent burden</span>
          </li>
          <li>
            Rental guides →
            <span className="text-slate-500"> HUD FMR explained, tenant law, negotiation tips</span>
          </li>
        </ul>
      </section>

      <CrossSiteLinks current="FairRentWize" />
    </div>
  );
}
