/**
 * Network-wide publisher and per-site editorial team. No individual bylines;
 * data-aggregator sites publish as an Organization.
 */

export const DB_UPDATED = '2026-04-19';

export const PUBLISHER = {
  name: 'DataPeek Research Network',
  url: 'https://datapeekfacts.com',
  description: 'A public-data network aggregating government and public datasets across US housing, tax, healthcare, and other civic domains.',
};

export const EDITORIAL_TEAM = {
  name: 'FairRentWize Editorial Team',
  url: 'https://datapeekfacts.com/editorial-policy/',
  parentOrganization: PUBLISHER,
};
