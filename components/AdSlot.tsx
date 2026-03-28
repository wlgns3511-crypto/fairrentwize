export function AdSlot({ id, className = "" }: { id: string; className?: string }) {
  return (
    <div
      className={`ad-slot my-6 ${className}`}
      data-ad-slot={id}
      style={{ minHeight: "250px", contain: "layout" }}
    >
      <ins
        className="adsbygoogle block w-full"
        style={{ display: "block", minHeight: "250px" }}
        data-ad-client="ca-pub-5724806562146685"
        data-ad-slot={id}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
