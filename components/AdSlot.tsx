"use client";
import { useEffect, useRef } from "react";

export function AdSlot({ id, className = "" }: { id: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      if (ref.current) ref.current.style.display = "none";
    }
  }, []);

  return (
    <div
      ref={ref}
      className={`ad-slot my-6 ${className}`}
      data-ad-slot={id}
      style={{ minHeight: "90px", contain: "layout" }}
    >
      <ins
        className="adsbygoogle block w-full"
        style={{ display: "block" }}
        data-ad-client="ca-pub-5724806562146685"
        data-ad-slot={id}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
