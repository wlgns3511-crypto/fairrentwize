"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-4xl font-bold text-slate-800 mb-4">Something Went Wrong</h1>
      <p className="text-slate-500 mb-8 max-w-md">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
