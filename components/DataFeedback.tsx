"use client";
import { useState } from "react";

export function DataFeedback() {
  const [state, setState] = useState<"idle" | "yes" | "no">("idle");

  if (state !== "idle") {
    return (
      <div className="mt-6 text-center text-sm text-slate-500 py-3">
        {state === "yes" ? "Thanks for confirming! We appreciate your feedback." : "Thanks for letting us know. We'll review this data."}
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col items-center gap-2 py-3">
      <p className="text-sm text-slate-500">Was this data helpful?</p>
      <div className="flex gap-3">
        <button
          onClick={() => setState("yes")}
          className="px-4 py-1.5 text-sm rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
        >
          Yes, helpful
        </button>
        <button
          onClick={() => setState("no")}
          className="px-4 py-1.5 text-sm rounded-full border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          Not really
        </button>
      </div>
    </div>
  );
}
