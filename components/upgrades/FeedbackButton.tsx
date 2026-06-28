'use client';

import { useState, useEffect } from 'react';

export function FeedbackButton() {
  const [pageUrl, setPageUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPageUrl(window.location.href);
    }
  }, []);

  // Pre-fill Tally form with current page URL
  const feedbackUrl = `https://tally.so/r/w8dMvx?url=${encodeURIComponent(pageUrl || 'https://petcostpeek.com')}`;

  return (
    <div className="mt-8 flex justify-center">
      <a
        href={feedbackUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-300 rounded-lg bg-slate-50/50 hover:bg-slate-50 transition shadow-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4 text-slate-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
          />
        </svg>
        Is this information incorrect? Suggest a correction
      </a>
    </div>
  );
}
