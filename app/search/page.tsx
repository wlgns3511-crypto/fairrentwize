import type { Metadata } from 'next';
import { searchMetros, searchCounties, getTopMetrosByRent } from '@/lib/db';
import { formatCurrency } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Search Fair Market Rents - Metro Areas & Counties',
  description: 'Search HUD Fair Market Rents for 3,000+ US counties and metro areas. Compare rental costs, affordability, and rent burden by location.',
  alternates: { canonical: '/search/' },
};

const POPULAR_SEARCHES = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
  'San Francisco', 'Seattle', 'Miami', 'Boston', 'Denver',
];

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = '' } = await searchParams;
  const query = q.trim();

  const metroResults = query.length >= 2 ? searchMetros(query, 15) : [];
  const countyResults = query.length >= 2 ? searchCounties(query, 15) : [];
  const totalResults = metroResults.length + countyResults.length;

  const featuredMetros = !query ? getTopMetrosByRent(12) : [];

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Search Fair Market Rents</h1>
      <p className="text-slate-600 mb-6">Find HUD Fair Market Rent data for metro areas and counties across the US.</p>

      {/* Search form */}
      <form method="GET" action="/search/" className="mb-8">
        <div className="flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search by metro area, county, or state..."
            className="flex-1 border border-slate-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            autoFocus={!query}
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* Popular searches */}
      {!query && (
        <div className="mb-8">
          <p className="text-sm font-semibold text-slate-500 mb-3">Popular Metro Areas</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SEARCHES.map(term => (
              <a
                key={term}
                href={`/search/?q=${encodeURIComponent(term)}`}
                className="text-sm px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full hover:bg-indigo-100 transition-colors"
              >
                {term}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {query.length >= 2 && (
        <div>
          <p className="text-sm text-slate-500 mb-4">
            {totalResults > 0
              ? `Found ${totalResults} result${totalResults !== 1 ? 's' : ''} for "${query}"`
              : `No results found for "${query}"`}
          </p>

          {metroResults.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3">Metro Areas</h2>
              <div className="space-y-3">
                {metroResults.map(metro => (
                  <a
                    key={metro.slug}
                    href={`/metro/${metro.slug}/`}
                    className="block border border-slate-200 rounded-xl p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                  >
                    <div className="font-semibold text-slate-900 mb-2">{metro.metro_name}</div>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                      <span>Studio: <strong>{formatCurrency(metro.fmr_studio)}/mo</strong></span>
                      <span>1BR: <strong>{formatCurrency(metro.fmr_1br)}/mo</strong></span>
                      <span>2BR: <strong>{formatCurrency(metro.fmr_2br)}/mo</strong></span>
                      <span>Vacancy: <strong>{metro.vacancy_rate}%</strong></span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {countyResults.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3">Counties</h2>
              <div className="space-y-3">
                {countyResults.map(county => (
                  <a
                    key={county.slug}
                    href={`/county/${county.slug}/`}
                    className="block border border-slate-200 rounded-xl p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                  >
                    <div className="font-semibold text-slate-900 mb-2">{county.county_name}, {county.state}</div>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                      <span>Studio: <strong>{formatCurrency(county.fmr_studio)}/mo</strong></span>
                      <span>1BR: <strong>{formatCurrency(county.fmr_1br)}/mo</strong></span>
                      <span>2BR: <strong>{formatCurrency(county.fmr_2br)}/mo</strong></span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {totalResults === 0 && (
            <div className="text-center py-12 text-slate-500">
              <p className="text-lg mb-2">No results found</p>
              <p className="text-sm">Try a city name like "New York" or a state abbreviation like "CA"</p>
            </div>
          )}
        </div>
      )}

      {query.length === 1 && (
        <p className="text-sm text-slate-500">Please enter at least 2 characters to search.</p>
      )}

      {/* Top metros when no query */}
      {!query && featuredMetros.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Highest Rent Metro Areas</h2>
          <div className="space-y-3">
            {featuredMetros.map(metro => (
              <a
                key={metro.slug}
                href={`/metro/${metro.slug}/`}
                className="block border border-slate-200 rounded-xl p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-slate-900">{metro.metro_name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Vacancy: {metro.vacancy_rate}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-indigo-700 font-bold">{formatCurrency(metro.fmr_2br)}/mo</div>
                    <div className="text-xs text-slate-500">2BR FMR</div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
