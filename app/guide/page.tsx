import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllGuides } from '@/lib/guides';
import { itemListSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Rental Guides — HUD FMR, Affordability, Tenant Law & Negotiation',
  description: 'In-depth guides on US rentals — HUD Fair Market Rent explained, why the 30% rent rule is broken, rent control by state, how to spot overpriced rentals, and when landlords actually negotiate.',
  alternates: { canonical: '/guide/' },
  openGraph: { title: 'Rental Guides', description: 'Authoritative guides on US rentals, FMR, tenant law, and negotiation.', url: '/guide/' },
};

export default function GuidesIndex() {
  const guides = getAllGuides();
  const listItems = guides.map((g) => ({ name: g.title, url: `/guide/${g.slug}/` }));

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema('FairRentWize Guides', '/guide/', listItems)) }}
      />

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Rental Guides</h1>
        <p className="text-slate-600 max-w-3xl">
          Long-form, evidence-based guides on US rentals. How HUD Fair Market Rent really works,
          why the famous "30 percent rule" misleads renters at every income level, the actual
          state-by-state map of rent control and tenant protections, how to spot an overpriced
          listing in five minutes, and when landlords actually negotiate.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-4">
        {guides.map((g) => (
          <Link
            key={g.slug}
            href={`/guide/${g.slug}/`}
            className="block rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 p-5 transition-colors"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">{g.category}</div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">{g.title}</h2>
            <p className="text-sm text-slate-600">{g.description}</p>
          </Link>
        ))}
      </div>

      <section className="mt-12 p-6 rounded-xl bg-slate-50 border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Run real numbers</h2>
        <ul className="space-y-2 text-sm">
          <li>
            <Link href="/calculator/" className="text-indigo-700 hover:underline font-medium">Rent calculator →</Link>
            <span className="text-slate-500"> affordability based on your income</span>
          </li>
          <li>
            <Link href="/state/california/" className="text-indigo-700 hover:underline font-medium">Browse states →</Link>
            <span className="text-slate-500"> HUD FMR + tenant rights by state</span>
          </li>
          <li>
            <Link href="/compare/california-vs-texas/" className="text-indigo-700 hover:underline font-medium">Compare states →</Link>
            <span className="text-slate-500"> rent and protections side by side</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
