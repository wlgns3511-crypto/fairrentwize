// lib/guides.ts — stub after /guide/* HCU kill (2026-05-27).
// Real guide content + routes removed; this stub keeps external imports
// (sitemap loops, orphan components, etc.) type-safe by returning an empty
// array. All Guide fields are optional so any orphaned consumer that reads
// guide.readingTime / .lastModified / .content compiles. At runtime the
// array is empty so those accesses never execute.
export interface Guide {
  slug: string;
  title: string;
  description: string;
  intro?: string;
  sections?: Array<{ heading: string; html: string }>;
  faqs?: Array<{ question: string; answer: string }>;
  category?: string;
  updatedAt?: string;
  // Optional fields observed in portfolio orphan-component consumers:
  date?: string;
  publishedAt?: string;
  lastModified?: string;
  content?: string;
  readingTime?: number;
  tags?: string[];
  level?: string;
  excerpt?: string;
  image?: string;
  author?: string;
  metaDesc?: string;
  oneLine?: string;
  screener?: string;
  name?: string;
  categoryLabel?: string;
  titleLabel?: string;
}

export const guides: Guide[] = [];

export function getAllGuides(): Guide[] {
  return [];
}

export function getGuideBySlug(_slug: string): Guide | undefined {
  return undefined;
}

// Some sites use these alias function names — keep all surfaces stub-compatible.
export const getAllStaticGuides = getAllGuides;
export const getGuide = getGuideBySlug;
