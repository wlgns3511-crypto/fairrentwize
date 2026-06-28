// /guide/* killed per HCU cleanup (2026-05-27). All guide routes return 410-Gone.
// AI-paraphrased long-form content removed; /about/ + /methodology/ retain the
// "what the site is" / "where the data came from" surfaces.
export function GET() {
  return new Response('Gone', { status: 410 });
}
export function HEAD() {
  return new Response(null, { status: 410 });
}
