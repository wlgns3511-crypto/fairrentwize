import type { County, Metro, StateRow } from './db';
import { formatCurrency, formatPercent, getDataYear } from './format';
import { PUBLISHER, EDITORIAL_TEAM } from './authorship';

const SITE_NAME = 'FairRentWize';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://fairrentwize.com';

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  if (!faqs || faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function generateCountyFAQs(county: County): { question: string; answer: string }[] {
  const year = getDataYear();
  const faqs: { question: string; answer: string }[] = [];

  faqs.push({
    question: `What is the fair market rent in ${county.county_name}, ${county.state}?`,
    answer: `The ${year} HUD Fair Market Rent for a 2-bedroom in ${county.county_name} is ${formatCurrency(county.fmr_2br)}/month. Studio: ${formatCurrency(county.fmr_studio)}, 1BR: ${formatCurrency(county.fmr_1br)}, 3BR: ${formatCurrency(county.fmr_3br)}, 4BR: ${formatCurrency(county.fmr_4br)}.`,
  });

  faqs.push({
    question: `What is the rent burden in ${county.county_name}?`,
    answer: `Rent burden in ${county.county_name} is ${formatPercent(county.rent_burden_pct)} of median household income (${formatCurrency(county.median_income)}/year). The HUD considers 30% or more cost-burdened.`,
  });

  faqs.push({
    question: `How much income do you need to rent in ${county.county_name}?`,
    answer: `To afford a 2-bedroom at ${formatCurrency(county.fmr_2br)}/month using the 30% rule, you need an annual income of at least ${formatCurrency(Math.round(county.fmr_2br * 12 / 0.3))}.`,
  });

  return faqs;
}

export function generateMetroFAQs(metro: Metro): { question: string; answer: string }[] {
  const year = getDataYear();
  return [
    {
      question: `What is the average rent in ${metro.metro_name}?`,
      answer: `The ${year} HUD FMR for a 2-bedroom in the ${metro.metro_name} metro area is ${formatCurrency(metro.fmr_2br)}/month. 1BR: ${formatCurrency(metro.fmr_1br)}, 3BR: ${formatCurrency(metro.fmr_3br)}.`,
    },
    {
      question: `What is the vacancy rate in ${metro.metro_name}?`,
      answer: `The rental vacancy rate in ${metro.metro_name} is ${metro.vacancy_rate}%. A rate below 5% typically indicates a tight rental market.`,
    },
    {
      question: `Is ${metro.metro_name} affordable for renters?`,
      answer: `With a median income of ${formatCurrency(metro.median_income)} and 2BR rent at ${formatCurrency(metro.fmr_2br)}/mo, rent takes about ${((metro.fmr_2br * 12 / metro.median_income) * 100).toFixed(0)}% of income in ${metro.metro_name}.`,
    },
  ];
}

export function itemListSchema(name: string, url: string, items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    url: `${SITE_URL}${url}`,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: `${SITE_URL}${item.url}`,
    })),
  };
}

export function articleSchema(post: { title: string; description: string; slug: string; urlPath?: string; publishedAt: string; updatedAt?: string; category?: string }) {
  // slug is treated as a full path fragment (e.g. "guide/my-guide")
  const articlePath = post.urlPath ?? (post.slug.includes('/') ? `/${post.slug.replace(/^\/+|\/+$/g, '')}/` : `/blog/${post.slug}/`);
  const url = `${SITE_URL}${articlePath}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    url,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: { '@type': 'Organization', name: EDITORIAL_TEAM.name, url: EDITORIAL_TEAM.url },
    publisher: { '@type': 'Organization', name: PUBLISHER.name, url: PUBLISHER.url },
    mainEntityOfPage: url,
    ...(post.category && { articleSection: post.category }),
  };
}

export function generateStateFAQs(state: StateRow): { question: string; answer: string }[] {
  const year = getDataYear();
  return [
    {
      question: `What is the average rent in ${state.state}?`,
      answer: `The ${year} statewide average rent in ${state.state} is ${formatCurrency(state.avg_rent_1br)}/mo for a 1-bedroom and ${formatCurrency(state.avg_rent_2br)}/mo for a 2-bedroom.`,
    },
    {
      question: `What percentage of people rent in ${state.state}?`,
      answer: `Approximately ${formatPercent(state.renter_pct)} of households in ${state.state} are renters.`,
    },
    {
      question: `How strong are tenant rights in ${state.state}?`,
      answer: `${state.state} has a tenant rights score of ${state.tenant_rights_score}/10. ${state.tenant_rights_score >= 7 ? 'This indicates strong renter protections.' : state.tenant_rights_score >= 5 ? 'This indicates moderate renter protections.' : 'This indicates relatively limited renter protections.'}`,
    },
  ];
}
