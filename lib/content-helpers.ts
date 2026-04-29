/**
 * Deterministic djb2 hash of a slug. Used to pick a stable variant of rotating
 * content per page so the same slug always sees the same variant on every
 * build, but neighboring slugs see different ones (avoiding the "every county
 * has the same paragraph" HCU pattern).
 */
export function slugHash(slug: string): number {
  let hash = 5381;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 33) ^ slug.charCodeAt(i);
  }
  return hash >>> 0; // unsigned 32-bit
}

export function pickVariant<T>(slug: string, variants: T[]): T {
  if (variants.length === 0) throw new Error('pickVariant called with empty variants');
  return variants[slugHash(slug) % variants.length];
}

export function pickVariantWithSalt<T>(slug: string, salt: string, variants: T[]): T {
  if (variants.length === 0) throw new Error('pickVariantWithSalt called with empty variants');
  return variants[slugHash(`${slug}:${salt}`) % variants.length];
}

export function aOrAn(word: string): string {
  if (!word) return 'a';
  const first = word.trim()[0]?.toLowerCase();
  if (!first) return 'a';
  return 'aeiou'.includes(first) ? 'an' : 'a';
}

export function formatUsd(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—';
  return '$' + Math.round(n).toLocaleString('en-US');
}

export function formatPct(n: number | null | undefined, digits = 1): string {
  if (n === null || n === undefined) return '—';
  return `${n.toFixed(digits)}%`;
}

export function oneInEveryN(pct: number): string {
  if (pct <= 0 || pct >= 100) return '—';
  const n = Math.round(100 / pct);
  if (n <= 1) return 'almost every household';
  if (n === 2) return '1 in every 2 households';
  return `1 in every ${n} households`;
}
