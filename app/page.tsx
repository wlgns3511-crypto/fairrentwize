import { getAllStates, getTopCountiesByRent, getMostAffordableCounties, getTopMetrosByRent, countCounties, countMetros } from '@/lib/db';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/format';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FairRentWize - US Fair Market Rents & Rental Affordability Data 2026',
  description: 'Explore HUD Fair Market Rents for 3,000+ US counties and 400+ metro areas. Compare rental costs by bedroom size, calculate rent affordability, and analyze rent burden across America.',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  const states = getAllStates();
  const expensive = getTopCountiesByRent(10);
  const affordable = getMostAffordableCounties(10);
  const topMetros = getTopMetrosByRent(10);
  const totalCounties = countCounties();
  const totalMetros = countMetros();

  const sortedByRent = [...states].sort((a, b) => b.avg_rent_2br - a.avg_rent_2br);
  const mostExpensiveStates = sortedByRent.slice(0, 10);
  const leastExpensiveStates = sortedByRent.slice(-10).reverse();

  return (
    <>
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">US Fair Market Rents &amp; Rental Affordability</h1>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
          Explore HUD Fair Market Rent data for {formatNumber(totalCounties)} counties and {formatNumber(totalMetros)} metro areas across all 50 states.
          Compare rental costs, calculate affordability, and understand rent burden in your area.
        </p>
        <div className="mt-6 flex gap-4 justify-center">
          <a href="/calculator/" className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">
            Rent Affordability Calculator
          </a>
        </div>
      </section>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-indigo-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-indigo-700">{formatNumber(totalCounties)}</p>
          <p className="text-sm text-slate-600">Counties</p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-indigo-700">{formatNumber(totalMetros)}</p>
          <p className="text-sm text-slate-600">Metro Areas</p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-indigo-700">50</p>
          <p className="text-sm text-slate-600">States</p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-indigo-700">FY 2026</p>
          <p className="text-sm text-slate-600">Data Year</p>
        </div>
      </div>

      {/* Most Expensive States */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Most Expensive States for Rent</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="py-2 pr-4">#</th>
                <th className="py-2 pr-4">State</th>
                <th className="py-2 pr-4 text-right">Avg 1BR</th>
                <th className="py-2 pr-4 text-right">Avg 2BR</th>
                <th className="py-2 pr-4 text-right">Median Income</th>
                <th className="py-2 text-right">Renter %</th>
              </tr>
            </thead>
            <tbody>
              {mostExpensiveStates.map((s, i) => (
                <tr key={s.abbr} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2 pr-4 text-slate-400">{i + 1}</td>
                  <td className="py-2 pr-4"><a href={`/state/${s.slug}/`} className="text-indigo-600 hover:underline">{s.state}</a></td>
                  <td className="py-2 pr-4 text-right">{formatCurrency(s.avg_rent_1br)}/mo</td>
                  <td className="py-2 pr-4 text-right font-medium">{formatCurrency(s.avg_rent_2br)}/mo</td>
                  <td className="py-2 pr-4 text-right">{formatCurrency(s.median_income)}</td>
                  <td className="py-2 text-right">{formatPercent(s.renter_pct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Least Expensive States */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Most Affordable States for Rent</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="py-2 pr-4">#</th>
                <th className="py-2 pr-4">State</th>
                <th className="py-2 pr-4 text-right">Avg 1BR</th>
                <th className="py-2 pr-4 text-right">Avg 2BR</th>
                <th className="py-2 pr-4 text-right">Median Income</th>
                <th className="py-2 text-right">Tenant Rights</th>
              </tr>
            </thead>
            <tbody>
              {leastExpensiveStates.map((s, i) => (
                <tr key={s.abbr} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2 pr-4 text-slate-400">{i + 1}</td>
                  <td className="py-2 pr-4"><a href={`/state/${s.slug}/`} className="text-indigo-600 hover:underline">{s.state}</a></td>
                  <td className="py-2 pr-4 text-right">{formatCurrency(s.avg_rent_1br)}/mo</td>
                  <td className="py-2 pr-4 text-right font-medium">{formatCurrency(s.avg_rent_2br)}/mo</td>
                  <td className="py-2 pr-4 text-right">{formatCurrency(s.median_income)}</td>
                  <td className="py-2 text-right">{s.tenant_rights_score}/10</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Top Metro Areas */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Most Expensive Metro Areas</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {topMetros.map((m) => (
            <a key={m.slug} href={`/metro/${m.slug}/`} className="block border border-slate-200 rounded-lg p-4 hover:border-indigo-300 hover:bg-indigo-50/50">
              <h3 className="font-semibold text-slate-900">{m.metro_name}</h3>
              <div className="flex gap-4 mt-2 text-sm text-slate-600">
                <span>2BR: <strong className="text-indigo-700">{formatCurrency(m.fmr_2br)}/mo</strong></span>
                <span>Vacancy: {m.vacancy_rate}%</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Browse by State */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Browse Fair Market Rents by State</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 text-sm">
          {states.map((s) => (
            <a key={s.abbr} href={`/state/${s.slug}/`} className="py-1 px-2 hover:text-indigo-600 hover:bg-indigo-50 rounded">
              {s.state} <span className="text-slate-400">({s.abbr})</span>
            </a>
          ))}
        </div>
      </section>

      {/* Highest Rent Burden Counties */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Highest Rent Burden Counties</h2>
        <p className="text-sm text-slate-600 mb-4">Counties where rent takes the largest share of household income.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="py-2 pr-4">County</th>
                <th className="py-2 pr-4">State</th>
                <th className="py-2 pr-4 text-right">2BR FMR</th>
                <th className="py-2 pr-4 text-right">Income</th>
                <th className="py-2 text-right">Rent Burden</th>
              </tr>
            </thead>
            <tbody>
              {expensive.map((c) => (
                <tr key={c.slug} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2 pr-4"><a href={`/county/${c.slug}/`} className="text-indigo-600 hover:underline">{c.county_name}</a></td>
                  <td className="py-2 pr-4">{c.state}</td>
                  <td className="py-2 pr-4 text-right">{formatCurrency(c.fmr_2br)}/mo</td>
                  <td className="py-2 pr-4 text-right">{formatCurrency(c.median_income)}</td>
                  <td className="py-2 text-right font-medium text-red-600">{formatPercent(c.rent_burden_pct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SEO cross-reference links */}
      <section className="bg-slate-50 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold mb-3">Related Resources</h2>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <h3 className="font-medium mb-1">Cost of Living</h3>
            <p className="text-slate-600">Compare overall cost of living across US cities.</p>
            <a href="https://costbycity.com" className="text-indigo-600 hover:underline">CostByCity.com &rarr;</a>
          </div>
          <div>
            <h3 className="font-medium mb-1">ZIP Code Data</h3>
            <p className="text-slate-600">Detailed demographics for every US ZIP code.</p>
            <a href="https://zippeek.com" className="text-indigo-600 hover:underline">ZipPeek.com &rarr;</a>
          </div>
          <div>
            <h3 className="font-medium mb-1">Salary Data</h3>
            <p className="text-slate-600">Compare salaries across occupations and cities.</p>
            <a href="https://salarybycity.com" className="text-indigo-600 hover:underline">SalaryByCity.com &rarr;</a>
          </div>
        </div>
      </section>
    </>
  );
}
