const DEFAULT_COLORS = ["#3b82f6", "#6366f1", "#94a3b8", "#06b6d4", "#8b5cf6"];

function getBarColor(value: number, referenceValue: number | undefined, index: number, customColor?: string): string {
  if (customColor) return customColor;
  if (referenceValue === undefined) return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
  if (Math.abs(value - referenceValue) < 0.001) return "#94a3b8";
  return value > referenceValue ? "#f87171" : "#34d399";
}

export function ComparisonBar({
  bars,
  format,
  referenceValue,
}: {
  bars: { label: string; value: number; color?: string }[];
  format?: (v: number) => string;
  referenceValue?: number;
}) {
  const max = Math.max(...bars.map((b) => b.value), 0.01) * 1.2;
  const fmt = format ?? ((v: number) => v.toLocaleString());

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {bars.map((bar, i) => {
        const pct = Math.max((bar.value / max) * 100, 2);
        const color = getBarColor(bar.value, referenceValue, i, bar.color);
        return (
          <div key={bar.label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "#64748b", width: "96px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {bar.label}
            </span>
            <div style={{ flex: 1, backgroundColor: "#f1f5f9", borderRadius: "9999px", height: "20px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${pct}%`,
                  minWidth: "1.5rem",
                  height: "20px",
                  borderRadius: "9999px",
                  backgroundColor: color,
                }}
              />
            </div>
            <span style={{ fontSize: "12px", fontWeight: 500, width: "80px", textAlign: "right" }}>
              {fmt(bar.value)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
