import type { Metadata } from 'next';
import { EditorNote } from '@/components/EditorNote';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';

const desc = 'About FairRentWize — HUD Fair Market Rent data for 3,000+ US counties and 400+ metro areas. Free rental affordability analysis.';
export const metadata: Metadata = {
  title: 'About FairRentWize',
  description: desc,
  alternates: { canonical: '/about/' },
  openGraph: { title: 'About FairRentWize', description: desc, url: '/about/' },
};

export default function AboutPage() {
  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'WebPage', name: 'About FairRentWize',
        description: desc, url: 'https://fairrentwize.com/about/',
        isPartOf: { '@type': 'WebSite', name: 'FairRentWize', url: 'https://fairrentwize.com' },
      }) }} />
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">About FairRentWize</h1>

      <EditorNote note="FairRentWize is part of the DataPeek Facts network — 30+ free data tools powered by official government sources. All rent data comes from HUD Fair Market Rents (FY 2026)." />

      <p>
        FairRentWize provides comprehensive HUD Fair Market Rent (FMR) data for over 3,000 US counties and 400 metropolitan areas.
        We help renters, landlords, housing advocates, and researchers understand rental costs and affordability.
      </p>

      <h2>What is Fair Market Rent?</h2>
      <p>
        Fair Market Rent (FMR) is determined by HUD annually. FMRs are set at the 40th percentile of gross rents
        and are used for Housing Choice Voucher programs and other HUD programs.
      </p>

      <h2>The 30% Rule</h2>
      <p>
        Households spending more than 30% of gross income on housing are &quot;cost-burdened.&quot;
        More than 50% is &quot;severely cost-burdened.&quot;
      </p>

      <h2>The DataPeek Network</h2>
      <p>
        FairRentWize is part of <a href="https://datapeekfacts.com" className="text-indigo-600 hover:underline">DataPeek Facts</a>.
        Related tools:
        <a href="https://costbycity.com" className="text-indigo-600 hover:underline ml-1">cost of living</a>,
        <a href="https://homepricepeek.com" className="text-indigo-600 hover:underline ml-1">home prices</a>,
        <a href="https://propertytaxpeek.com" className="text-indigo-600 hover:underline ml-1">property tax</a>.
      </p>

      <h2>Contact</h2>
      <p>Visit our <a href="/contact/" className="text-indigo-600 hover:underline">contact page</a>.</p>

      <CrossSiteLinks current="FairRentWize" />
    </article>
  );
}
