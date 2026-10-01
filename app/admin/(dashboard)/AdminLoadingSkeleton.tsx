"use client";

import Link from "next/link";

interface AdminLoadingSkeletonProps {
  title?: string;
  variant?: "dashboard" | "table" | "editor" | "gallery";
  rows?: number;
}

function Bar({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`block animate-pulse rounded-lg bg-surface-2 ${className}`} />;
}

function TableRows({ rows = 6 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border rounded-xl border border-border bg-background">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="grid grid-cols-[1.4fr_1fr_.65fr_auto] items-center gap-3 px-3 py-3 sm:px-4">
          <div className="min-w-0 space-y-2">
            <Bar className="h-3.5 w-28 sm:w-40" />
            <Bar className="h-2.5 w-20 sm:w-28" />
          </div>
          <Bar className="h-8 w-full max-w-36" />
          <Bar className="h-7 w-16" />
          <Bar className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

export default function AdminLoadingSkeleton({
  title = "Loading",
  variant = "table",
  rows = 6,
}: AdminLoadingSkeletonProps) {
  return (
    <div className="admin-page" aria-busy="true" aria-live="polite">
      <div className="admin-page-header">
        <div className="min-w-0 space-y-2">
          <Bar className="h-2.5 w-28" />
          <div className="flex items-center gap-2">
            <Bar className="h-5 w-5 rounded-md" />
            <Bar className="h-7 w-36 sm:w-44" />
          </div>
          <Bar className="h-3 w-72 max-w-full" />
        </div>
        <Bar className="h-9 w-28" />
      </div>

      {variant === "dashboard" ? (
        <div className="admin-dashboard-grid">
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="rounded-xl border border-border bg-background p-3 sm:p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <Bar className="h-3 w-20" />
                  <Bar className="h-7 w-7 rounded-lg" />
                </div>
                <Bar className="mt-2 h-9 w-14" />
                <Bar className="mt-2 h-1.5 w-full" />
                <Bar className="mt-2 h-2.5 w-24" />
              </div>
            ))}
          </div>
          <div className="grid gap-3 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="admin-panel p-3 sm:p-4">
              <Bar className="h-4 w-32" />
              <Bar className="mt-2 h-3 w-44" />
              <div className="mt-4 space-y-2">
                {Array.from({ length: 4 }, (_, index) => (
                  <div key={index} className="flex items-center gap-2 rounded-xl border border-border p-2">
                    <Bar className="h-9 w-9 rounded-full" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Bar className="h-3 w-28" />
                      <Bar className="h-2.5 w-20" />
                    </div>
                    <Bar className="h-6 w-12" />
                  </div>
                ))}
              </div>
            </div>
            <div className="admin-panel p-3 sm:p-4">
              <Bar className="h-4 w-28" />
              <Bar className="mt-2 h-3 w-48" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }, (_, index) => (
                  <div key={index} className="rounded-xl border border-border p-3">
                    <Bar className="h-3 w-24" />
                    <Bar className="mt-3 h-3 w-full" />
                    <Bar className="mt-2 h-3 w-4/5" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : variant === "gallery" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: rows }, (_, index) => (
            <div key={index} className="rounded-xl border border-border bg-background p-3">
              <Bar className="aspect-video w-full rounded-lg" />
              <Bar className="mt-3 h-4 w-28" />
              <Bar className="mt-2 h-3 w-40" />
              <div className="mt-3 flex justify-between gap-2">
                <Bar className="h-8 w-20" />
                <Bar className="h-8 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : variant === "editor" ? (
        <div className="space-y-3">
          {Array.from({ length: Math.max(3, Math.ceil(rows / 2)) }, (_, index) => (
            <div key={index} className="admin-panel p-3 sm:p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2"><Bar className="h-3 w-20" /><Bar className="h-10 w-full" /></div>
                <div className="space-y-2"><Bar className="h-3 w-24" /><Bar className="h-10 w-full" /></div>
              </div>
              <div className="mt-3 space-y-2"><Bar className="h-3 w-28" /><Bar className="h-20 w-full" /></div>
              <div className="mt-3 flex justify-end gap-2"><Bar className="h-9 w-20" /><Bar className="h-9 w-28" /></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="admin-panel min-h-0 flex-1 p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="space-y-2"><Bar className="h-4 w-28" /><Bar className="h-2.5 w-40" /></div>
            <Bar className="h-8 w-24" />
          </div>
          <TableRows rows={rows} />
        </div>
      )}

      <span className="sr-only">{title}…</span>
    </div>
  );
}
