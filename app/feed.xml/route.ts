import { getAllPosts } from "@/lib/blog";

const SITE_NAME = "FairRentWize";
const SITE_URL = "https://fairrentwize.com";

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function GET() {
  const posts = getAllPosts();
  const now = new Date().toUTCString();

  const items = posts.map(p => `
    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${SITE_URL}/blog/${p.slug}/</link>
      <description>${escapeXml(p.description)}</description>
      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
      <guid isPermaLink="true">${SITE_URL}/blog/${p.slug}/</guid>
      <category>${escapeXml(p.category)}</category>
    </item>`).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE_NAME} Blog</title>
    <link>${SITE_URL}/blog/</link>
    <description>Latest guides and articles from ${SITE_NAME}.</description>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
