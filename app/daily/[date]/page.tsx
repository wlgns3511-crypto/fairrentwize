import type { Metadata } from "next";
import Link from "next/link";
import { DailySections } from "@/components/DailySections";
import { notFound } from "next/navigation";
import { generateDailyEntry, getProfile } from "@/lib/daily-engine";

export const revalidate = 86400;

type Props = { params: Promise<{ date: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return {};
  const entry = await generateDailyEntry(date);
  return { title: entry.title, description: entry.description, alternates: { canonical: `/daily/${date}/` } };
}

export default async function DailyDatePage({ params }: Props) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();
  const entry = await generateDailyEntry(date);
  const profile = getProfile();
  const schema = { "@context": "https://schema.org", "@type": "Article", headline: entry.title, description: entry.description, datePublished: entry.date, dateModified: entry.date, author: { "@type": "Organization", name: `${profile.name} Editorial Team` }, mainEntityOfPage: `https://${profile.domain}/daily/${date}/` };
  return <article className="mx-auto max-w-3xl px-4 py-10"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><nav className="mb-8 text-sm text-slate-500"><Link href="/" className="hover:text-blue-700">Home</Link><span className="mx-2">›</span><Link href="/daily/" className="hover:text-blue-700">Daily</Link><span className="mx-2">›</span><span>{date}</span></nav><p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Daily analysis · {entry.date}</p><h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">{entry.title}</h1><p className="mt-5 text-lg leading-relaxed text-slate-700">{entry.intro}</p><DailySections entry={entry} /><section className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5"><h2 className="font-semibold text-slate-900">Source and data date</h2><p className="mt-2 text-sm leading-relaxed text-slate-700">Source: {entry.source}. Data date: {entry.dataDate}. This short page is an editorial comparison and navigation layer; the linked records remain the source of the detailed answer.</p></section></article>;
}
