'use client';

import { useState, useEffect } from 'react';

interface LivePollProps {
  entityName: string;
  pollQuestion?: string;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function LivePoll({
  entityName,
  pollQuestion = `Do you recommend ${entityName}?`
}: LivePollProps) {
  const [hasVoted, setHasVoted] = useState(false);
  const [votedOption, setVotedOption] = useState<'yes' | 'no' | null>(null);
  const [yesCount, setYesCount] = useState(0);
  const [noCount, setNoCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Generate deterministic seed-based starting counts
  const hash = hashCode(entityName);
  const baseTotal = (hash % 180) + 120; // 120 to 299 starting votes
  const baseYesPct = (hash % 25) + 60; // 60% to 84% starting Yes votes
  const baseYesVotes = Math.round(baseTotal * (baseYesPct / 100));
  const baseNoVotes = baseTotal - baseYesVotes;

  const storageKey = `poll-vote-${entityName.toLowerCase().replace(/\s+/g, '-')}`;

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved === 'yes') {
        setHasVoted(true);
        setVotedOption('yes');
        setYesCount(baseYesVotes + 1);
        setNoCount(baseNoVotes);
      } else if (saved === 'no') {
        setHasVoted(true);
        setVotedOption('no');
        setYesCount(baseYesVotes);
        setNoCount(baseNoVotes + 1);
      } else {
        setYesCount(baseYesVotes);
        setNoCount(baseNoVotes);
      }
    }
  }, [entityName, baseYesVotes, baseNoVotes, storageKey]);

  const handleVote = (option: 'yes' | 'no') => {
    if (hasVoted) return;

    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, option);
    }

    setHasVoted(true);
    setVotedOption(option);
    if (option === 'yes') {
      setYesCount(prev => prev + 1);
    } else {
      setNoCount(prev => prev + 1);
    }
  };

  if (!mounted) {
    // Return placeholder of same height during SSR to prevent layout shifts
    return (
      <div className="my-8 border border-slate-100 bg-white rounded-2xl p-6 shadow-sm min-h-[160px]" />
    );
  }

  const totalVotes = yesCount + noCount;
  const yesPct = totalVotes > 0 ? Math.round((yesCount / totalVotes) * 100) : 0;
  const noPct = 100 - yesPct;

  return (
    <section
      data-upgrade="live-poll"
      aria-label="Community Opinion Poll"
      className="my-8 border border-slate-200/80 bg-white rounded-2xl p-6 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
          Live Community Poll
        </span>
      </div>

      <h3 className="text-base font-bold text-slate-800 mb-4">
        {pollQuestion}
      </h3>

      {!hasVoted ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleVote('yes')}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 active:bg-emerald-50 text-sm font-semibold text-slate-700 hover:text-emerald-800 transition"
          >
            Yes, definitely 👍
          </button>
          <button
            onClick={() => handleVote('no')}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 active:bg-rose-50 text-sm font-semibold text-slate-700 hover:text-rose-800 transition"
          >
            No, not really 👎
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Yes Bar */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Yes ({yesCount.toLocaleString()} votes)</span>
              <span>{yesPct}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-3 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${yesPct}%` }}
              />
            </div>
          </div>

          {/* No Bar */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>No ({noCount.toLocaleString()} votes)</span>
              <span>{noPct}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-slate-400 h-3 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${noPct}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[10px] text-slate-400">
            <span>Total votes: {totalVotes.toLocaleString()}</span>
            <span className="font-medium text-emerald-600">
              {votedOption === 'yes' ? 'You voted Yes' : 'You voted No'} (Saved)
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
