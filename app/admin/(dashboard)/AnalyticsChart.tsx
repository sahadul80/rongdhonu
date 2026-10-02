"use client";

import type { AnalyticsPoint } from "@/lib/dashboard";

export default function AnalyticsChart({ title, subtitle, points, valueLabel, compact = false }: { title: string; subtitle: string; points: AnalyticsPoint[]; valueLabel: string; compact?: boolean }) {
  const width = 720;
  const height = compact ? 180 : 220;
  const padding = { top: 14, right: 16, bottom: 28, left: 28 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const max = Math.max(1, ...points.map((point) => point.visitors));
  const step = points.length > 1 ? innerWidth / (points.length - 1) : innerWidth;
  const coords = points.map((point, index) => ({
    ...point,
    x: padding.left + index * step,
    y: padding.top + innerHeight - (point.visitors / max) * innerHeight,
  }));
  const line = coords.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
  const area = coords.length ? `${line} L ${coords[coords.length - 1].x.toFixed(1)} ${(padding.top + innerHeight).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(padding.top + innerHeight).toFixed(1)} Z` : "";
  const labelIndexes = points.length <= 7 ? points.map((_, index) => index) : [0, Math.floor((points.length - 1) / 2), points.length - 1];

  return (
    <section className="admin-panel flex min-w-0 flex-col p-3 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><h2 className="text-sm font-black text-foreground">{title}</h2><p className="mt-1 text-[10px] leading-4 text-muted">{subtitle}</p></div>
        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-[9px] font-black text-primary">{valueLabel}</span>
      </div>
      <div className="mt-3 min-h-0 w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label={title} preserveAspectRatio="none">
          <path d={area} fill="currentColor" className="text-primary/8" />
          <path d={line} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary" />
          {coords.length > 0 && <circle cx={coords[coords.length - 1].x} cy={coords[coords.length - 1].y} r="4" fill="currentColor" className="text-primary" />}
          {labelIndexes.map((index) => {
            const point = coords[index];
            if (!point) return null;
            return <text key={point.date} x={point.x} y={height - 7} textAnchor={index === 0 ? "start" : index === coords.length - 1 ? "end" : "middle"} fontSize="9" fill="currentColor" className="text-muted">{point.date.slice(5)}</text>;
          })}
        </svg>
      </div>
      <div className="mt-1 flex items-center justify-between text-[9px] text-muted"><span>Peak {max}</span><span>Latest {points.at(-1)?.visitors ?? 0}</span></div>
    </section>
  );
}
