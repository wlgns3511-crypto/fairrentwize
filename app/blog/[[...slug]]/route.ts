// /blog/* killed per HCU cleanup (2026-05-27). All blog routes return 410-Gone.
export function GET() {
  return new Response('Gone', { status: 410 });
}
export function HEAD() {
  return new Response(null, { status: 410 });
}
