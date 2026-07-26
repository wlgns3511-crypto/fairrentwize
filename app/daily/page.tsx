import type { Metadata } from "next";
import Link from "next/link";
import { DailySections } from "@/components/DailySections";
import { generateDailyEntry, getProfile, getTodayKst, listDailyDates } from "@/lib/daily-engine";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const entry = await generateDailyEntry(getTodayKst());
  return { title: entry.title, description: entry.description, alternates: { canonical: "/daily/" } };
}

export default async function DailyIndexPage() {
  const entry = await generateDailyEntry(getTodayKst());
  const profile = getProfile();
  const dates = listDailyDates().filter((date) => date !== entry.date).slice(0, 12);
  const schema = { "@context": "https://schema.org", "@type": "Article", headline: entry.title, description: entry.description, datePublished: entry.date, dateModified: entry.date, author: { "@type": "Organization", name: `${profile.name} Editorial Team` }, mainEntityOfPage: `https://${profile.domain}/daily/` };
  return <article className="mx-auto max-w-3xl px-4 py-10"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><nav className="mb-8 text-sm text-slate-500"><Link href="/" className="hover:text-blue-700">Home</Link><span className="mx-2">›</span><span>Daily</span></nav><p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Daily analysis · {entry.date}</p><h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">{entry.title}</h1><p className="mt-5 text-lg leading-relaxed text-slate-700">{entry.intro}</p><DailySections entry={entry} /><section className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5"><h2 className="font-semibold text-slate-900">Source and data date</h2><p className="mt-2 text-sm leading-relaxed text-slate-700">Source: {entry.source}. The daily page is a short editorial path into the underlying records; check each linked page for its complete methodology and data vintage.</p></section>{dates.length > 0 && <section className="mt-8"><h2 className="font-semibold text-slate-900">Previous daily notes</h2><div className="mt-3 flex flex-wrap gap-2">{dates.map((date) => <Link key={date} href={`/daily/${date}/`} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:border-blue-300">{date}</Link>)}</div></section>}</article>;
}
