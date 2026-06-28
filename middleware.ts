import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import dropped from '@/lib/generated/dropped-slugs.json';

/**
 * HCU Phase C + Phase 6 v6.2 (2026-05-06)
 *
 * Phase C (4/25 — kept as-is):
 *   GSC after 3 months on fairrentwize.com (54 queries / 0 clicks):
 *     - 1,000+ /compare/{city-vs-city}/ 404s
 *     - 510 /compare/ "사용자 표준 없는 중복 페이지"
 *     - 822 /metro-compare/{a-vs-b}/ "canonical alternate" (www subdomain)
 *     - 39 /metro-compare/ + /county/ "발견됨-색인X"
 *     - /es/rankings/all/ + /city/deltona-daytona-beach/ legacy 404 leftovers
 *   → KILL (410): /compare, /metro-compare, /embed, /city, /es
 *
 * Phase 6 v6.2 (5/06):
 *   Quarantine LIFTED: scripts/build-db.py was archived to
 *   scripts/_archived/build-db.py.synthetic. The live build pipeline now
 *   ingests HUD FMR + ACS + NLIHC via scripts/build-db.ts +
 *   refresh-from-{hud,acs,nlihc}.ts. State/county/metro/calculator surfaces
 *   serve real values, so blanket noindex is no longer correct.
 *
 *   Replacement: a 410 Gone for the 2,293 zombie slugs that existed in the
 *   prior synthetic DB but are absent from the real-data rebuild
 *   (lib/generated/dropped-slugs.json). Releases Google's index footprint
 *   for the synthetic-only URLs while letting the 3,577 real surfaces
 *   re-enter the index.
 *
 *   /search/ remains crawl-discouraged via robots.txt (it's a server-side
 *   query surface, not a content page) but no per-request 410.
 */
const KILLED_ROUTES = /^\/(?:metro-compare|compare|embed|city)(?:\/|$)|^\/es(?:\/|$)/;

type DroppedEntry = { type: string; slug: string };
const droppedSet = new Set<string>(
  (dropped as { slugs: DroppedEntry[] }).slugs.map(({ type, slug }) => `${type}/${slug}`),
);

const ZOMBIE_RE = /^\/(state|county|metro)\/([^\/]+)\/?$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (KILLED_ROUTES.test(pathname)) {
    return new NextResponse('Gone', {
      status: 410,
      headers: {
        'X-Robots-Tag': 'noindex',
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    });
  }

  const zombieMatch = ZOMBIE_RE.exec(pathname);
  if (zombieMatch) {
    const type = zombieMatch[1];
    const slug = zombieMatch[2];
    if (droppedSet.has(`${type}/${slug}`)) {
      return new NextResponse('Gone', {
        status: 410,
        headers: {
          'X-Robots-Tag': 'noindex',
          'Cache-Control': 'public, max-age=86400, immutable',
        },
      });
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png|robots.txt|sitemap.xml|api).*)'],
};
