import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * HCU Phase C kill regex (2026-04-25).
 *
 * GSC after 3 months on fairrentwize.com (54 queries / 0 clicks):
 *   - 1,000+ /compare/{city-vs-city}/ 404s (state×state was 100 generated, but
 *     external backlinks expanded the matrix shape; legacy code generated
 *     city-vs-city earlier).
 *   - 510 /compare/ "사용자 표준 없는 중복 페이지".
 *   - 822 /metro-compare/{a-vs-b}/ "canonical alternate" (www subdomain).
 *   - 39 /metro-compare/ + /county/ "발견됨-색인X".
 *   - /es/rankings/all/ + /city/deltona-daytona-beach/ legacy 404 leftovers.
 *
 * Top 10 GSC queries 100% English, all calculator-shaped:
 *   "fair market rent calculator", "hud fair market rent calculator",
 *   "average rent in tallahassee", "average rent pennsylvania statewide 2026"
 *   → real signal: /calculator/, /state/{slug}/, /metro/{slug}/, /county/{slug}/
 *
 * KILL prefixes:
 *   /compare       state×state doorway (visapeek `/check/` twin)
 *   /metro-compare metro×metro doorway
 *   /embed         widget (0 click signal)
 *   /city          legacy route (not in app/, only external backlinks hit it)
 *   /es            entire locale subtree (English-only top searches)
 *
 * KEEP (intentional):
 *   /, /calculator/, /state/, /county/, /metro/, /rankings/, /blog/, /guide/,
 *   /about, /contact, /methodology, /privacy, /terms, /disclaimer, /search
 *
 * Tested 24/24 (12 KILL + 12 KEEP) before deploy.
 * Critical: `/metro-compare(?:\/|$)` is explicit, doesn't catch /metro/...
 */
const KILLED_ROUTES = /^\/(?:metro-compare|compare|embed|city)(?:\/|$)|^\/es(?:\/|$)/;

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
