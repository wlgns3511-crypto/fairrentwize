'use client';

import { useState, useEffect } from 'react';

/**
 * FeedbackButton v1 — "Was this helpful?" 👍👎
 *
 * - Sends GA4 event on click
 * - Stores vote in localStorage (no duplicate votes)
 * - Zero backend required
 *
 * Usage:
 *   <FeedbackButton pageId="/state/california" />
 *   <FeedbackButton pageId={slug} label="Was this data helpful?" />
 */

interface FeedbackButtonProps {
  /** Unique page identifier (e.g. slug or path) */
  pageId: string;
  /** Custom label — defaults to "Was this data helpful?" */
  label?: string;
}

function getStorageKey(pageId: string) {
  return `feedback_${pageId}`;
}

export function FeedbackButton({ pageId, label = 'Was this data helpful?' }: FeedbackButtonProps) {
  const [vote, setVote] = useState<'yes' | 'no' | null>(null);
  const [counts, setCounts] = useState({ yes: 0, no: 0 });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(getStorageKey(pageId));
      if (stored === 'yes' || stored === 'no') {
        setVote(stored);
      }
      // Load pseudo-counts from localStorage for social proof
      const yesCount = parseInt(localStorage.getItem(`fc_y_${pageId}`) || '0', 10);
      const noCount = parseInt(localStorage.getItem(`fc_n_${pageId}`) || '0', 10);
      setCounts({ yes: yesCount, no: noCount });
    } catch {}
  }, [pageId]);

  function handleVote(value: 'yes' | 'no') {
    if (vote) return; // already voted

    setVote(value);

    try {
      localStorage.setItem(getStorageKey(pageId), value);
      // Increment pseudo-count
      const key = value === 'yes' ? `fc_y_${pageId}` : `fc_n_${pageId}`;
      const current = parseInt(localStorage.getItem(key) || '0', 10);
      localStorage.setItem(key, String(current + 1));
      setCounts(prev => ({
        ...prev,
        [value]: prev[value] + 1,
      }));
    } catch {}

    // Send GA4 event
    try {
      const w = window as unknown as { gtag?: (...args: unknown[]) => void };
      if (w.gtag) {
        w.gtag('event', 'feedback', {
          event_category: 'engagement',
          event_label: value,
          page_id: pageId,
          value: value === 'yes' ? 1 : 0,
        });
      }
    } catch {}
  }

  if (vote) {
    return (
      <div className="my-6 flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
        <span className="text-lg">{vote === 'yes' ? '👍' : '👎'}</span>
        <span className="text-sm text-slate-600">
          {vote === 'yes' ? 'Thanks for your feedback!' : 'Thanks — we\'ll work to improve this.'}
        </span>
      </div>
    );
  }

  return (
    <div className="my-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
      <span className="text-sm text-slate-700 font-medium">{label}</span>
      <div className="flex gap-2">
        <button
          onClick={() => handleVote('yes')}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm bg-white border border-slate-300 rounded-full hover:bg-emerald-50 hover:border-emerald-300 transition-colors cursor-pointer"
          aria-label="Yes, helpful"
        >
          👍 Yes
        </button>
        <button
          onClick={() => handleVote('no')}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm bg-white border border-slate-300 rounded-full hover:bg-red-50 hover:border-red-300 transition-colors cursor-pointer"
          aria-label="No, not helpful"
        >
          👎 Not really
        </button>
      </div>
    </div>
  );
}
