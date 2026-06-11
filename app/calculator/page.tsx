import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllStates } from '@/lib/db';

/**
 * /calculator hub (rewritten 2026-06-11, tool-surface #2).
 *
 * The previous version embedded components/RentCalculator.tsx — a hardcoded
 * synthetic state-level FMR table (round numbers, identical vectors across
 * states) plus fabricated utility estimates. Both retired. HUD publishes FMRs
 * at the county/metro level, so a state-level calculator was dishonest by
 * construction: this hub now routes to the real county-level tool that lives
 * on every state page (county selector) and county page (fixed county), fed
 * by HUD FY2025 per-bedroom FMRs.
 */

export const metadata: Metadata = {
  title: 'Rent Affordability & Voucher Calculator 2026 — County-Level FMR',
  description:
    'Check rent affordability with the 30% rule and estimate what a Housing Choice Voucher covers, using real HUD FY2025 Fair Market Rents at the county level. Pick your state to start.',
  alternates: { canonical: '/calculator/' },
  openGraph: { url: '/calculator/' },
};

export default function CalculatorPage() {
  const states = getAllStates();

  return (
    <>
      <h1 className="text-3xl font-bold text-center mb-2">
        Rent Affordability &amp; Voucher Calculator
      </h1>
      <p className="text-center text-slate-600 mb-8 max-w-2xl mx-auto">
        The 30% affordability rule and Housing Choice Voucher math, computed on
        real HUD FY2025 Fair Market Rents. HUD sets FMRs at the{' '}
        <strong>county / metro</strong> level — state averages hide the spread —
        so pick your state below and the calculator runs on your county&apos;s
        actual numbers.
      </p>

      <section className="max-w-3xl mx-auto mb-12">
        <h2 className="text-lg font-semibold mb-3 text-center">
          Pick your state to open its calculator
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
          {states.map((s) => (
            <Link
              key={s.slug}
              href={`/state/${s.slug}/`}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white hover:border-indigo-400 hover:text-indigo-700 text-slate-700 text-center"
            >
              {s.state}
            </Link>
          ))}
        </div>
        <p className="text-xs text-slate-400 text-center mt-3">
          Each state page includes the calculator with a county selector and
          the full county FMR table.
        </p>
      </section>

      <section className="mt-12 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-4">How the calculator works</h2>
        <div className="space-y-4 text-sm text-slate-600">
          <div>
            <h3 className="font-semibold text-slate-900">The 30% rule</h3>
            <p>
              Financial guidance and HUD&apos;s own cost-burden definition use
              30% of gross income as the affordability line. Above 30% is
              &quot;cost-burdened&quot;, above 50% &quot;severely
              cost-burdened&quot;.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">
              Fair Market Rents (HUD FY2025)
            </h3>
            <p>
              FMRs are set annually by HUD at the 40th percentile of gross
              rents for standard-quality units, per county or metro area and
              per bedroom count. They are the basis for Housing Choice Voucher
              payment standards.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Voucher math</h3>
            <p>
              Your public housing agency sets a payment standard between 90%
              and 110% of the FMR (24 CFR 982.503). A voucher household
              generally pays about 30% of adjusted monthly income; the voucher
              covers the gap up to the payment standard. At initial lease-up,
              your total payment may not exceed 40% of adjusted income (24 CFR
              982.508). Utility allowances vary by agency and are not estimated
              here.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 max-w-2xl mx-auto bg-slate-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-3">Related Resources</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <a href="https://costbycity.com" className="text-indigo-600 hover:underline font-medium">Cost of Living Calculator</a>
            <p className="text-slate-500">Compare overall living costs between cities</p>
          </div>
          <div>
            <a href="https://salarybycity.com" className="text-indigo-600 hover:underline font-medium">Salary Data</a>
            <p className="text-slate-500">Find out how much jobs pay in your area</p>
          </div>
          <div>
            <a href="https://calcpeek.com" className="text-indigo-600 hover:underline font-medium">More Calculators</a>
            <p className="text-slate-500">Financial, tax, and budgeting calculators</p>
          </div>
          <div>
            <a href="https://zippeek.com" className="text-indigo-600 hover:underline font-medium">ZIP Code Data</a>
            <p className="text-slate-500">Income and rent data by ZIP code</p>
          </div>
        </div>
      </section>
    </>
  );
}
