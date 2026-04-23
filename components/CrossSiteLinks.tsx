const HUB_URL = "https://datapeekfacts.com/";
const HUB_GUIDE_PATH = "/guide/";

export function CrossSiteLinks({ current }: { current: string }) {
  const normalized = current.toLowerCase().replace(/\s+/g, '');
  const isHub = normalized.includes('datapeekfacts');
  const href = isHub ? HUB_GUIDE_PATH : HUB_URL;

  return (
    <div className="mt-10 border-t border-slate-100 pt-6">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">
        Explore More Data Tools
      </p>
      <p className="text-sm leading-6 text-slate-600">
        For adjacent public-data tools, methodology notes, and network updates, visit{' '}
        <a
          href={href}
          className="font-medium text-slate-700 hover:text-blue-600 hover:underline"
          target={isHub ? undefined : '_blank'}
          rel={isHub ? undefined : 'nofollow noopener noreferrer'}
        >
          DataPeek Facts
        </a>
        .
      </p>
    </div>
  );
}
