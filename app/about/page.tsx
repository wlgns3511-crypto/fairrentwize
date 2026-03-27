import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About FairRentWize',
  description: 'About FairRentWize - US fair market rent data, rental affordability analysis, and rent burden statistics for every county and metro area.',
  alternates: { canonical: '/about/' },
};

export default function AboutPage() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-4">About FairRentWize</h1>
      <div className="prose prose-slate max-w-none">
        <p>
          FairRentWize provides comprehensive HUD Fair Market Rent (FMR) data for over 3,000 US counties and 400 metropolitan areas. Our goal is to help renters, landlords, housing advocates, and researchers understand rental costs and affordability across the United States.
        </p>
        <h2>Our Data</h2>
        <p>
          Our data is based on HUD Fair Market Rents, which are estimates of the amount of money needed to pay for a moderately-priced rental unit in a given area. FMRs are set at the 40th percentile of gross rents for standard quality rental units.
        </p>
        <h2>What is Fair Market Rent?</h2>
        <p>
          Fair Market Rent (FMR) is determined by the U.S. Department of Housing and Urban Development (HUD) annually. FMRs are used to determine payment standard amounts for Housing Choice Voucher programs, initial renewal rents for some expiring project-based Section 8 contracts, and other HUD programs.
        </p>
        <h2>The 30% Rule</h2>
        <p>
          A widely used guideline suggests that households should spend no more than 30% of their gross income on housing costs. Households paying more than 30% are considered &quot;cost-burdened,&quot; while those paying more than 50% are &quot;severely cost-burdened.&quot;
        </p>
        <h2>Contact</h2>
        <p>
          Have questions or feedback? Visit our <a href="/contact/" className="text-indigo-600 hover:underline">contact page</a>.
        </p>
      </div>
    </>
  );
}
