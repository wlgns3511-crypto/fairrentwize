import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { AdSlot } from "@/components/AdSlot";
import { AuthorBox } from "@/components/AuthorBox";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/blog/${slug}/`,
    },
    openGraph: {
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
    },
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const allPosts = getAllPosts().filter((p) => p.slug !== slug);
  const related = allPosts
    .filter((p) => p.category === post.category)
    .slice(0, 3);
  const others = allPosts.filter((p) => p.category !== post.category).slice(0, 3 - related.length);
  const suggestions = [...related, ...others];

  return (
    <>
      {/* Schema.org Article */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.description,
            datePublished: post.publishedAt,
            dateModified: post.updatedAt ?? post.publishedAt,
            author: {
              "@type": "Person",
              name: "FairRentWize Research Team",
              description: "Rental market and housing data research",
              url: "https://fairrentwize.com/about/",
              worksFor: {
                "@type": "Organization",
                name: "FairRentWize",
                url: "https://fairrentwize.com",
              },
            },
            publisher: {
              "@type": "Organization",
              name: "FairRentWize",
              url: "https://fairrentwize.com",
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://fairrentwize.com/blog/${slug}/`,
            },
          }),
        }}
      />

      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 mb-6">
        <a href="/" className="hover:text-indigo-600">Home</a>
        <span className="mx-1">›</span>
        <a href="/blog/" className="hover:text-indigo-600">Guides</a>
        <span className="mx-1">›</span>
        <span className="text-slate-700">{post.category}</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-full">
            {post.category}
          </span>
          <span className="text-xs text-slate-400">{post.readingTime} min read</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 leading-tight mb-4">
          {post.title}
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed mb-4">
          {post.description}
        </p>
        <div className="text-xs text-slate-400 flex items-center gap-3">
          <span>Published {formatDate(post.publishedAt)}</span>
          {post.updatedAt && post.updatedAt !== post.publishedAt && (
            <span>· Updated {formatDate(post.updatedAt)}</span>
          )}
          <span>· FairRentWize Editorial Team</span>
        </div>
      </header>

      <AdSlot id="4567890123" />

      {/* Article body */}
      <article
        className="prose prose-slate max-w-none mt-8
          prose-h2:text-xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4
          prose-h3:text-base prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-2
          prose-p:leading-relaxed prose-p:text-slate-700
          prose-ul:my-3 prose-li:my-1
          prose-table:text-sm prose-th:bg-slate-50 prose-th:font-medium
          prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      <AuthorBox />


      <AdSlot id="5678901234" />

      {/* CTA: Data tools */}
      <div className="mt-12 p-6 bg-indigo-50 border border-indigo-200 rounded-xl">
        <h2 className="text-lg font-bold text-slate-900 mb-2">
          Explore Fair Rent Data
        </h2>
        <p className="text-slate-600 text-sm mb-4">
          Use our free tools to look up HUD Fair Market Rents for any county or metro area and check rental affordability in your location.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="/calculator/"
            className="text-sm px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
          >
            Rent Calculator
          </a>
          <a
            href="/compare/"
            className="text-sm px-4 py-2 bg-white border border-indigo-300 text-indigo-700 rounded-lg hover:bg-indigo-50 font-medium"
          >
            Compare Areas
          </a>
          <a
            href="/"
            className="text-sm px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
          >
            All Rent Data
          </a>
        </div>
      </div>

      {/* Related guides */}
      {suggestions.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Related Guides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {suggestions.map((p) => (
              <a
                key={p.slug}
                href={`/blog/${p.slug}/`}
                className="block border border-slate-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-sm transition-all group"
              >
                <span className="text-xs text-indigo-600">{p.category}</span>
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700 mt-1 leading-snug">
                  {p.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{p.readingTime} min read</p>
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
