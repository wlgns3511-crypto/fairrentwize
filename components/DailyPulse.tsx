import Link from "next/link";
import { generateDailyEntry, getTodayKst } from "@/lib/daily-engine";

export async function DailyPulse() {
  const entry = await generateDailyEntry(getTodayKst());
  return (
    <section className="mb-10 rounded-xl border border-blue-200 bg-blue-50 p-5" aria-labelledby="daily-pulse-title">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Today&apos;s analysis · {entry.date}</p>
        <Link href="/daily/" className="text-xs font-medium text-blue-700 hover:underline">Daily archive →</Link>
      </div>
      <h2 id="daily-pulse-title" className="text-xl font-bold text-slate-900">{entry.title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-700">{entry.intro}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {entry.links.slice(0, 3).map((link) => <Link key={link.href} href={link.href} className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-blue-700 shadow-sm ring-1 ring-blue-200 hover:bg-blue-100">{link.label} →</Link>)}
      </div>
    </section>
  );
}
