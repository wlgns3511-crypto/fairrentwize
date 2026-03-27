export function formatCurrency(amount: number | null): string {
  if (amount === null || amount === undefined) return 'N/A';
  return '$' + amount.toLocaleString('en-US');
}

export function formatCurrencyCompact(amount: number | null): string {
  if (amount === null || amount === undefined) return 'N/A';
  if (amount >= 1000000) return '$' + (amount / 1000000).toFixed(1) + 'M';
  if (amount >= 1000) return '$' + (amount / 1000).toFixed(0) + 'K';
  return '$' + amount.toLocaleString('en-US');
}

export function formatPercent(rate: number | null): string {
  if (rate === null || rate === undefined) return 'N/A';
  return rate.toFixed(1) + '%';
}

export function formatNumber(num: number | null): string {
  if (num === null || num === undefined) return 'N/A';
  return num.toLocaleString('en-US');
}

export function getDataYear(): number {
  return 2026;
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
