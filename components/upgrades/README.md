# Upgrade Components — Source of Truth

Shared UX components for the DataPeek network fleet (38 sites).
Components here are the **source of truth** and get synced into each site
via `_shared/scripts/sync-upgrades.sh`.

## Rules

1. **One-way sync only**: `_shared/` → site. Never edit the site copy; edit here.
2. **No site-specific imports**: these components must compile in every site's
   Next.js project with zero assumptions about `@/lib/*`.
3. **Loose duck-typed props**: use structural interfaces (not `Word`, etc.)
   so any site can map its own data shape.
4. **Measurement hooks**: every clickable element carries a
   `data-upgrade="{component}"` and `data-upgrade-action="{action}"` attribute
   so GA4 can attach events later with one selector.
5. **No client state unless essential**: prefer server components. The 3
   components in this pilot are all server-safe.

## Components

| File | Purpose |
|---|---|
| `AnswerHero.tsx` | 3-second answer at top — title, tagline, badges, near alternatives |
| `DecisionNext.tsx` | 3 follow-up cards — "what to check next" (solves 2nd-click gap) |
| `TrustBlock.tsx` | Sources + last updated + methodology in one credibility strip |

## Sync

```bash
_shared/scripts/sync-upgrades.sh <site-name>      # preview diff + sync
_shared/scripts/sync-upgrades.sh <site-name> -y   # sync without prompt
_shared/scripts/sync-upgrades.sh --all            # sync to every listed site
```

Target path in each site: `components/upgrades/{name}.tsx`

## Not in this pilot (intentional)

CompareTray, ScenarioPanel, SavedRecent — deferred until pilot metrics
prove the 3-component baseline lifts pages/session.
