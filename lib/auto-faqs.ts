import type { County } from './db';
import { formatCurrency, formatPercent } from './format';

export interface FaqItem {
  question: string;
  answer: string;
}

export function generateAutoFaqs(county: County): FaqItem[] {
  return [];
}
