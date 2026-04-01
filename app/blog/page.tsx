import type { Metadata } from "next";
import { getAllPosts, getAllCategories } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Rent Guides & Renter Resources",
  description:
    "Expert guides on fair market rent, renter rights, rent increases, Section 8 vouchers, and the rent vs. buy decision — backed by HUD data.",
  alternates: { canonical: "/blog/" },
  openGraph: { url: "/blog/" },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogIndex() {
  const posts = getAllPosts();
  const categories = getAllCategories();

  return (
    <>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">
        Rent Guides &amp; Renter Resources
      </h1>
      <p className="text-slate-600 mb-8">
        Expert articles on understanding fair market rents, knowing your rights
        as a renter, and making smarter housing decisions.
      </p>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <span
            key={cat}
            className="text-xs px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full"
          >
            {cat}
          </span>
        ))}
      </div>

      {/* Post list */}
      <div className="space-y-6">
        {posts.map((post) => (
          <a
            key={post.slug}
            href={`/blog/${post.slug}/`}
            className="block group"
          >
            <article className="border border-slate-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-sm transition-all">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full">
                  {post.category}
                </span>
                <span className="text-xs text-slate-400">
                  {post.readingTime} min read
                </span>
              </div>
              <h2 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-700 mb-2 leading-snug">
                {post.title}
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                {post.description}
              </p>
              <p className="text-xs text-slate-400 mt-3">
                {formatDate(post.publishedAt)}
                {post.updatedAt && post.updatedAt !== post.publishedAt && (
                  <span className="ml-2">
                    · Updated {formatDate(post.updatedAt)}
                  </span>
                )}
              </p>
            </article>
          </a>
        ))}
      </div>
    </>
  );
}
