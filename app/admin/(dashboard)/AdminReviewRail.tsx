"use client";

import { Quote, Star } from "lucide-react";

export interface DashboardReview {
  id: number;
  name: string;
  role: string | null;
  text: string;
  active: boolean;
}

export default function AdminReviewRail({ reviews }: { reviews: DashboardReview[] }) {
  return (
    <section className="admin-panel flex min-h-0 min-w-0 flex-col p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-foreground">Reviews</h2>
            <span className="admin-status bg-primary/10 text-primary">Latest</span>
          </div>
          <p className="mt-1 text-[11px] text-muted">Latest feedback without page-level horizontal scrolling.</p>
        </div>
      </div>

      {reviews.length ? (
        <div className="admin-review-rail mt-3">
          {reviews.map((review) => (
            <article key={review.id} className="admin-review-card min-w-0 rounded-xl border border-border bg-surface p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Quote className="h-4 w-4" aria-hidden="true" />
                </div>
                <span className={`admin-status shrink-0 ${review.active ? "bg-rd-green/10 text-rd-green" : "bg-surface-2 text-muted"}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${review.active ? "bg-rd-green" : "bg-muted"}`} />
                  {review.active ? "Live" : "Hidden"}
                </span>
              </div>
              <div className="mt-3 flex gap-0.5" aria-label="5 star review">
                {Array.from({ length: 5 }, (_, index) => <Star key={index} className="h-3.5 w-3.5 fill-current text-rd-amber" aria-hidden="true" />)}
              </div>
              <p className="mt-2 line-clamp-4 wrap-break-word text-sm leading-5 text-muted-strong">“{review.text}”</p>
              <div className="mt-3 border-t border-border pt-2">
                <p className="truncate text-xs font-bold text-foreground">{review.name || "Unnamed reviewer"}</p>
                <p className="truncate text-[10px] text-muted">{review.role || "Role not provided"}</p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-3 rounded-xl border border-dashed border-border bg-surface p-4 text-center text-xs text-muted">
          No reviews yet.
        </div>
      )}
    </section>
  );
}
