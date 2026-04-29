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

  if (county.fmr_2br !== null) {
    faqs.push({
      question: `What is the fair market rent in ${county.county_name}, ${county.state_abbr}?`,
      answer: `The ${year} HUD Fair Market Rent for a 2-bedroom in ${county.county_name} is ${formatCurrency(county.fmr_2br)}/month. Studio: ${formatCurrency(county.fmr_studio)}, 1BR: ${formatCurrency(county.fmr_1br)}, 3BR: ${formatCurrency(county.fmr_3br)}, 4BR: ${formatCurrency(county.fmr_4br)}.`,
    });
  }

  if (
    county.acs_rent_burdened_pct !== null &&
    county.acs_median_household_income !== null
  ) {
    faqs.push({
      question: `What is the rent burden in ${county.county_name}?`,
      answer: `${formatPercent(county.acs_rent_burdened_pct)} of renter households in ${county.county_name} pay 30%+ of income on housing (ACS 2023 5-Year B25070). The median household income is ${formatCurrency(county.acs_median_household_income)}/year. HUD considers 30% or more cost-burdened.`,
    });
  }

  if (county.fmr_2br !== null) {
    faqs.push({
      question: `How much income do you need to rent in ${county.county_name}?`,
      answer: `To afford a 2-bedroom at ${formatCurrency(county.fmr_2br)}/month using the 30% rule, you need an annual income of at least ${formatCurrency(Math.round((county.fmr_2br * 12) / 0.3))}.`,
    });
  }

  return faqs;
}

export function generateMetroFAQs(metro: Metro): { question: string; answer: string }[] {
  const year = getDataYear();
  const faqs: { question: string; answer: string }[] = [];

  if (metro.fmr_2br !== null) {
    faqs.push({
      question: `What is the average rent in ${metro.metro_name}?`,
      answer: `The ${year} HUD FMR for a 2-bedroom in the ${metro.metro_name} metro area is ${formatCurrency(metro.fmr_2br)}/month. 1BR: ${formatCurrency(metro.fmr_1br)}, 3BR: ${formatCurrency(metro.fmr_3br)}.`,
    });
    faqs.push({
      question: `What income is needed to afford a 2-bedroom in ${metro.metro_name}?`,
      answer: `Using the 30% affordability rule, a household needs an annual income of at least ${formatCurrency(Math.round((metro.fmr_2br * 12) / 0.3))} to afford a 2-bedroom at FMR (${formatCurrency(metro.fmr_2br)}/month).`,
    });
  }

  return faqs;
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
  const faqs: { question: string; answer: string }[] = [];

  if (state.fmr_2br !== null) {
    faqs.push({
      question: `What is the fair market rent in ${state.state}?`,
      answer: `The ${year} HUD Fair Market Rent for a 2-bedroom unit in ${state.state} averages ${formatCurrency(state.fmr_2br)}/month (NLIHC OOR 2025 state aggregate). Actual FMR varies by county and metro area.`,
    });
  }

  if (state.nlihc_housing_wage_2br !== null) {
    faqs.push({
      question: `What hourly wage do you need to afford a 2-bedroom in ${state.state}?`,
      answer: `The 2025 housing wage for ${state.state} — what a renter must earn per hour, working full-time, to afford a 2-bedroom at FMR without being cost-burdened — is $${state.nlihc_housing_wage_2br.toFixed(2)}/hour (NLIHC Out of Reach 2025).`,
    });
  }

  if (state.acs_renter_pct !== null) {
    faqs.push({
      question: `What percentage of people rent in ${state.state}?`,
      answer: `Approximately ${formatPercent(state.acs_renter_pct)} of households in ${state.state} are renters (ACS 2023 5-Year, B25008).`,
    });
  }

  if (state.acs_rent_burdened_pct !== null) {
    faqs.push({
      question: `How many renters in ${state.state} are cost-burdened?`,
      answer: `${formatPercent(state.acs_rent_burdened_pct)} of renter households in ${state.state} pay 30% or more of their income on housing (ACS 2023 5-Year, B25070), the HUD threshold for cost burden.`,
    });
  }

  return faqs;
}
