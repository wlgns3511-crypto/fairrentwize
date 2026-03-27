import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'FairRentWize terms of service and conditions of use.',
  alternates: { canonical: '/terms/' },
};

export default function TermsPage() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
      <div className="prose prose-slate max-w-none text-sm">
        <p>Last updated: January 2026</p>
        <h2>Use of Data</h2>
        <p>FairRentWize provides Fair Market Rent data for informational purposes only. This data should not be the sole basis for rental pricing, housing, or financial decisions.</p>
        <h2>Accuracy</h2>
        <p>While we make reasonable efforts to ensure accuracy, we do not guarantee that all data is current or error-free. HUD FMR data is updated annually and actual rents may vary significantly.</p>
        <h2>Calculator Disclaimer</h2>
        <p>The Rent Affordability Calculator provides estimates based on the 30% rule guideline. Results are for educational purposes and do not constitute financial advice. Individual circumstances vary.</p>
        <h2>Not Financial Advice</h2>
        <p>Nothing on this site constitutes financial, legal, or housing advice. Consult qualified professionals for decisions regarding housing, insurance, or relocation.</p>
        <h2>Intellectual Property</h2>
        <p>All original content, design, and code on FairRentWize is protected by copyright. Government data (HUD FMR, Census) is in the public domain.</p>
        <h2>Third-Party Links</h2>
        <p>This site may contain links to third-party websites. We are not responsible for their content or privacy practices.</p>
      </div>
    </>
  );
}
