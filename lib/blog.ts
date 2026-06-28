// lib/blog.ts — stub after /blog/* HCU kill (2026-05-27).
// Real blog content + routes removed; this stub keeps external imports
// (homepage sections, sitemap, etc.) type-safe and returns empty data.
export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  date?: string;
  category: string;
  readingTime: number;
  content: string;
  image?: string;
  coverImage?: string;
  tags?: string[];
  author?: string;
  excerpt?: string;
}

export const blogPosts: BlogPost[] = [];

export function getAllPosts(): BlogPost[] {
  return [];
}

export function getPostBySlug(_slug: string): BlogPost | undefined {
  return undefined;
}

export function getRecentPosts(_limit = 3): BlogPost[] {
  return [];
}

export function getAllCategories(): string[] {
  return [];
}

// Non-standard aliases used by a few site sitemaps (e.g. catbreedpeek).
export const getAllBlogPosts = getAllPosts;
export const getRecentBlogPosts = getRecentPosts;
