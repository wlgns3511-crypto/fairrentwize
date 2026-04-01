import RentCalculator from '@/components/RentCalculator';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rent Affordability Calculator 2026 - Can You Afford the Rent?',
  description: 'Calculate whether rent is affordable based on your income using the 30% rule. Compare Fair Market Rents by state and bedroom size. Free rent affordability tool.',
  alternates: { canonical: '/calculator/' },
  openGraph: { url: "/calculator/" },
};

export default function CalculatorPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-center mb-2">Rent Affordability Calculator</h1>
      <p className="text-center text-slate-600 mb-8 max-w-2xl mx-auto">
        Use the 30% rule to determine if rent is affordable for your income.
        Enter your annual household income, select your state and desired bedroom size to see a detailed affordability analysis.
      </p>

      <RentCalculator />

      <section className="mt-12 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-4">How the Rent Affordability Calculator Works</h2>
        <div className="space-y-4 text-sm text-slate-600">
          <div>
            <h3 className="font-semibold text-slate-900">The 30% Rule</h3>
            <p>Financial experts recommend spending no more than 30% of your gross monthly income on housing costs. This is known as the 30% rule and is used by HUD to define &quot;cost-burdened&quot; households.</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Fair Market Rents (FMR)</h3>
            <p>FMRs are set annually by HUD and represent the 40th percentile of gross rents for standard quality units in a given area. They are used to determine Housing Choice Voucher payment amounts.</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Rent Burden</h3>
            <p>If rent exceeds 30% of income, a household is considered &quot;cost-burdened.&quot; Above 50% is &quot;severely cost-burdened.&quot; About 46% of US renters are currently cost-burdened.</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Utility Estimates</h3>
            <p>When utilities are included, we add estimated monthly costs: ~$80 for studios, scaling up to ~$190 for 4-bedroom units. Actual costs vary by location and usage.</p>
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
