import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllGuides, getGuideBySlug } from '@/lib/guides';
import { breadcrumbSchema, faqSchema, articleSchema } from '@/lib/schema';
import { AuthorBox } from '@/components/AuthorBox';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';
import { TrustBlock } from '@/components/upgrades/TrustBlock';

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;
export const revalidate = 86400;

export function generateStaticParams() {
  return getAllGuides().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guide/${slug}/` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `/guide/${slug}/`,
      type: 'article',
      modifiedTime: guide.updatedAt,
    },
    other: { 'article:modified_time': guide.updatedAt },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const crumbs = [
    { name: 'Home', url: '/' },
    { name: 'Guides', url: '/guide/' },
    { name: guide.title, url: `/guide/${slug}/` },
  ];

  const others = getAllGuides().filter((g) => g.slug !== slug).slice(0, 4);

  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />
      {guide.faqs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(guide.faqs)) }} />}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleSchema({
              title: guide.title,
              description: guide.description,
              slug: `guide/${slug}`,
              publishedAt: guide.updatedAt,
              updatedAt: guide.updatedAt,
              category: guide.category,
            })
          ),
        }}
      />

      <nav className="not-prose text-sm text-slate-500 mb-4">
        <Link href="/" className="hover:text-indigo-700">Home</Link>
        <span className="mx-2">›</span>
        <Link href="/guide/" className="hover:text-indigo-700">Guides</Link>
        <span className="mx-2">›</span>
        <span className="text-slate-700">{guide.title}</span>
      </nav>

      <h1>{guide.title}</h1>
      <p className="not-prose text-xs text-slate-500 mb-6">
        <span className="inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          Last updated <time dateTime={guide.updatedAt}>{guide.updatedAt}</time>
        </span>
        {' · '}
        <span>{guide.category}</span>
      </p>

      <div dangerouslySetInnerHTML={{ __html: guide.intro }} />

      <TrustBlock sources={[{name:"HUD Fair Market Rents",url:"https://www.huduser.gov/portal/datasets/fmr.html"},{name:"Census ACS Housing",url:"https://www.census.gov/topics/housing.html"}]} updated="HUD FMR FY2026" />

      <nav aria-label="Table of contents" className="not-prose my-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">On this page</p>
        <ol className="space-y-1.5 text-sm">
          {guide.sections.map((s, i) => (
            <li key={i}>
              <a href={`#section-${i}`} className="text-indigo-700 hover:underline">{s.heading}</a>
            </li>
          ))}
          <li><a href="#faq" className="text-indigo-700 hover:underline">Frequently Asked Questions</a></li>
        </ol>
      </nav>

      {guide.sections.map((s, i) => (
        <section key={i} id={`section-${i}`}>
          <h2>{s.heading}</h2>
          <div dangerouslySetInnerHTML={{ __html: s.html }} />
        </section>
      ))}

      <section id="faq">
        <h2>Frequently Asked Questions</h2>
        <div className="not-prose space-y-3">
          {guide.faqs.map((f, i) => (
            <details key={i} className="rounded-lg border border-slate-200 bg-white p-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="cursor-pointer font-semibold text-slate-900 flex items-center justify-between gap-2">
                <span>{f.question}</span>
                <span className="text-indigo-600 text-sm">+</span>
              </summary>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {others.length > 0 && (
        <section className="not-prose mt-12">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Continue reading</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {others.map((g) => (
              <Link
                key={g.slug}
                href={`/guide/${g.slug}/`}
                className="block rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 p-4 transition-colors"
              >
                <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">{g.category}</div>
                <div className="text-sm font-bold text-slate-900">{g.title}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <AuthorBox />
      <CrossSiteLinks current="FairRentWize" />
    </article>
  );
}
