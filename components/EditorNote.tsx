export function EditorNote({ note }: { note: string }) {
  return (
    <div className="my-4 p-3 bg-amber-50 border-l-4 border-amber-400 rounded-r text-sm text-amber-900">
      <span className="font-semibold">Editor&apos;s Note: </span>{note}
    </div>
  );
}
