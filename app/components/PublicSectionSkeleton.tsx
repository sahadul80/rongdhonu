const VARIANT_LAYOUTS = {
  services: "mobile-swipe-rail sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible lg:grid-cols-3",
  process: "mx-auto max-w-4xl grid gap-0 sm:grid-cols-2",
  about: "grid gap-8 lg:grid-cols-2",
  work: "mobile-swipe-rail sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible lg:grid-cols-3",
  reviews: "mobile-swipe-rail sm:overflow-visible",
  team: "mobile-swipe-rail sm:grid sm:grid-cols-2 sm:overflow-visible",
  contact: "grid gap-6 lg:grid-cols-[0.9fr_1.1fr]",
  generic: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
} as const;

type SkeletonVariant = keyof typeof VARIANT_LAYOUTS;

export default function PublicSectionSkeleton({ className = "", variant = "generic" }: { className?: string; variant?: SkeletonVariant }) {
  const layout = VARIANT_LAYOUTS[variant];
  return (
    <div className={`section-shell section-y ${className}`} aria-hidden="true">
      <div className="mb-6 max-w-2xl space-y-3">
        <div className="h-3 w-24 animate-pulse rounded bg-surface-2" />
        <div className="h-10 w-3/4 animate-pulse rounded bg-surface-2" />
        <div className="h-4 w-full animate-pulse rounded bg-surface-2" />
      </div>
      <div className={layout}>
        {[1, 2, 3].map((item) => (
          <div key={item} className={`${variant === "process" ? "min-h-40 sm:min-h-48" : variant === "reviews" ? "h-40 min-w-[calc(100vw-2rem)] sm:min-w-97.5" : variant === "contact" ? "min-h-56" : variant === "team" ? "h-72" : "h-36"} animate-pulse rounded-2xl border border-border bg-surface`} />
        ))}
      </div>
    </div>
  );
}
