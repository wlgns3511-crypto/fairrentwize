export function DidYouKnow({ fact }: { fact: string }) {
  return (
    <div className="my-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-sm font-semibold text-blue-800 mb-1">Did You Know?</p>
      <p className="text-sm text-blue-700">{fact}</p>
    </div>
  );
}
