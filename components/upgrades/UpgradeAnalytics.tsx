"use client";

/**
 * UpgradeAnalytics — fleet-wide GA4 measurement layer for upgrade components.
 *
 * Source of truth: _shared/components/upgrades/UpgradeAnalytics.tsx
 * DO NOT edit the copy inside each site — edit here and run sync-upgrades.sh.
 *
 * What it does
 * ------------
 * Listens (once, at the document root) for clicks on any element carrying a
 * `data-upgrade` attribute and forwards a structured event to GA4 via the
 * global `gtag` function. Also fires a one-time `upgrade_view` event for each
 * upgrade section the user actually scrolls into view, using a single
 * IntersectionObserver.
 *
 * Why it lives in _shared
 * -----------------------
 * Each site already loads its own GA4 measurement ID at the RootLayout level
 * (see app/layout.tsx — there's already a `gtag('config', 'G-…')` call).
 * This component piggybacks on that global `gtag` so we don't have to thread
 * a per-site GA4 ID through props.
 *
 * Events sent
 * -----------
 *   upgrade_click   — fired on any click that bubbles through a `data-upgrade`
 *                     element. Parameters:
 *                       upgrade        — answer-hero | trust-block | decision-next | why-it-matters
 *                       upgrade_action — alternative-click | source-click | methodology-click | card-click | …
 *                       upgrade_tone   — indigo | emerald | amber | slate (when present, e.g. DecisionNext)
 *                       link_url       — for <a> targets, the resolved href
 *   upgrade_view    — fired once per upgrade section, when ≥50% of it enters
 *                     the viewport. Parameter: `upgrade`.
 *
 * Resilience
 * ----------
 * - If `window.gtag` is missing (GA4 blocked, dev mode without GA, etc.) the
 *   component is a silent no-op. Nothing throws, nothing is logged.
 * - All listeners are passive and removed on unmount.
 * - SSR-safe: returns `null`, all DOM access guarded by `useEffect`.
 *
 * Usage
 * -----
 * Mount once near the root of every site (typically in `app/layout.tsx`):
 *
 *   import { UpgradeAnalytics } from "@/components/upgrades/UpgradeAnalytics";
 *   …
 *   <body>
 *     <UpgradeAnalytics />
 *     {children}
 *   </body>
 */

import { useEffect } from "react";

type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
  }
}

function safeGtag(eventName: string, params: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const gtag = window.gtag;
  if (typeof gtag !== "function") return;
  try {
    gtag("event", eventName, params);
  } catch {
    // Never let analytics break the UI.
  }
}

export function UpgradeAnalytics() {
  useEffect(() => {
    if (typeof document === "undefined") return;

    // ── Click listener (delegation, single root handler) ────────────────
    const onClick = (ev: MouseEvent) => {
      const target = ev.target;
      if (!(target instanceof Element)) return;
      // Find the closest ancestor with data-upgrade-action OR data-upgrade.
      // We prefer the action node (more specific) and fall back to the
      // section-level node.
      const actionEl = target.closest<HTMLElement>("[data-upgrade-action]");
      const upgradeEl =
        actionEl ||
        target.closest<HTMLElement>("[data-upgrade]");
      if (!upgradeEl) return;

      const upgrade =
        upgradeEl.getAttribute("data-upgrade") ||
        upgradeEl.closest<HTMLElement>("[data-upgrade]")?.getAttribute("data-upgrade") ||
        "unknown";
      const upgradeAction =
        upgradeEl.getAttribute("data-upgrade-action") || "click";
      const upgradeTone =
        upgradeEl.getAttribute("data-upgrade-tone") || undefined;

      // For anchor targets, capture the destination URL.
      let linkUrl: string | undefined;
      const anchor = upgradeEl.closest<HTMLAnchorElement>("a[href]");
      if (anchor) linkUrl = anchor.href;

      const params: Record<string, unknown> = {
        upgrade,
        upgrade_action: upgradeAction,
      };
      if (upgradeTone) params.upgrade_tone = upgradeTone;
      if (linkUrl) params.link_url = linkUrl;

      safeGtag("upgrade_click", params);
    };

    document.addEventListener("click", onClick, { passive: true });

    // ── View tracking (IntersectionObserver, fires once per section) ────
    let observer: IntersectionObserver | undefined;
    const seen = new Set<string>();

    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const el = entry.target as HTMLElement;
            const upgrade = el.getAttribute("data-upgrade") || "unknown";
            // We use upgrade name as a session-local dedup key. The same name
            // can appear once per page, and pages are full reloads in this
            // app, so a Set per mount is enough.
            if (seen.has(upgrade)) continue;
            seen.add(upgrade);
            safeGtag("upgrade_view", { upgrade });
            observer?.unobserve(el);
          }
        },
        { threshold: 0.5 }
      );

      // Observe all current upgrade sections. We don't bother watching the
      // DOM for new sections — these components are server-rendered and
      // present at first paint.
      const sections = document.querySelectorAll<HTMLElement>(
        "[data-upgrade=\"answer-hero\"], [data-upgrade=\"trust-block\"], [data-upgrade=\"decision-next\"], [data-upgrade=\"why-it-matters\"]"
      );
      sections.forEach((el) => observer?.observe(el));
    }

    return () => {
      document.removeEventListener("click", onClick);
      observer?.disconnect();
    };
  }, []);

  return null;
}
