/**
 * Tailwind v4 Color Safelist
 *
 * Dynamic classes from site.config.ts (e.g., `text-${primary}-600`) are
 * tree-shaken by Tailwind because they aren't found as string literals.
 * This file ensures all possible color classes are preserved in the build.
 *
 * DO NOT DELETE — this file is scanned by Tailwind at build time.
 */

export const SAFELIST = {
  // Primary colors used across DataPeek sites
  red: "text-red-600 text-red-700 text-red-800 text-red-900 bg-red-50 bg-red-100 border-red-100 border-red-200 hover:bg-red-50 hover:text-red-600 ring-red-500",
  blue: "text-blue-600 text-blue-700 text-blue-800 text-blue-900 bg-blue-50 bg-blue-100 border-blue-100 border-blue-200 hover:bg-blue-50 hover:text-blue-600 ring-blue-500",
  sky: "text-sky-600 text-sky-700 text-sky-800 text-sky-900 bg-sky-50 bg-sky-100 border-sky-100 border-sky-200 hover:bg-sky-50 hover:text-sky-600 ring-sky-500",
  indigo: "text-indigo-600 text-indigo-700 text-indigo-800 text-indigo-900 bg-indigo-50 bg-indigo-100 border-indigo-100 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 ring-indigo-500",
  rose: "text-rose-600 text-rose-700 text-rose-800 text-rose-900 bg-rose-50 bg-rose-100 border-rose-100 border-rose-200 hover:bg-rose-50 hover:text-rose-600 ring-rose-500",
  emerald: "text-emerald-600 text-emerald-700 text-emerald-800 text-emerald-900 bg-emerald-50 bg-emerald-100 border-emerald-100 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 ring-emerald-500",
  amber: "text-amber-600 text-amber-700 text-amber-800 text-amber-900 bg-amber-50 bg-amber-100 border-amber-100 border-amber-200 hover:bg-amber-50 hover:text-amber-600 ring-amber-500",
  violet: "text-violet-600 text-violet-700 text-violet-800 text-violet-900 bg-violet-50 bg-violet-100 border-violet-100 border-violet-200 hover:bg-violet-50 hover:text-violet-600 ring-violet-500",
  teal: "text-teal-600 text-teal-700 text-teal-800 text-teal-900 bg-teal-50 bg-teal-100 border-teal-100 border-teal-200 hover:bg-teal-50 hover:text-teal-600 ring-teal-500",
  orange: "text-orange-600 text-orange-700 text-orange-800 text-orange-900 bg-orange-50 bg-orange-100 border-orange-100 border-orange-200 hover:bg-orange-50 hover:text-orange-600 ring-orange-500",
  cyan: "text-cyan-600 text-cyan-700 text-cyan-800 text-cyan-900 bg-cyan-50 bg-cyan-100 border-cyan-100 border-cyan-200 hover:bg-cyan-50 hover:text-cyan-600 ring-cyan-500",
  green: "text-green-600 text-green-700 text-green-800 text-green-900 bg-green-50 bg-green-100 border-green-100 border-green-200 hover:bg-green-50 hover:text-green-600 ring-green-500",
  purple: "text-purple-600 text-purple-700 text-purple-800 text-purple-900 bg-purple-50 bg-purple-100 border-purple-100 border-purple-200 hover:bg-purple-50 hover:text-purple-600 ring-purple-500",
  slate: "text-slate-600 text-slate-700 text-slate-800 text-slate-900 bg-slate-50 bg-slate-100 border-slate-100 border-slate-200 hover:bg-slate-50 hover:text-slate-600 ring-slate-500",
};
