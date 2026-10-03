"use client";

import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { useRef } from "react";
import { useLanguage } from "./LanguageContext";
import SectionHeader from "./SectionHeader";
import { useLazyPublicData } from "./useLazyPublicData";
import type { CmsReview } from "@/app/types/public-cms";
import Avatar from "../admin/(dashboard)/Avatar";

export default function ReviewsSection() {
  const { ref, data, loading, error } = useLazyPublicData<{ reviews: CmsReview[] }>("/api/public/reviews");
  const { language, t } = useLanguage();
  const railRef = useRef<HTMLDivElement>(null);
  const reviews = data?.reviews ?? [];

  return <section ref={ref} className="section-surface section-y pattern-reviews bg-background" aria-labelledby="reviews-title"><div className="section-shell">
    <SectionHeader eyebrow={t("reviews")} title={t("reviewTitle")} intro={t("reviewIntro")} titleId="reviews-title" />
    {loading || !data ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-40 animate-pulse rounded-2xl border border-border bg-surface" />)}</div> : error ? <div className="rounded-2xl border border-border bg-surface p-5 text-sm text-muted">{error}</div> : reviews.length === 0 ? null : <>
      <div ref={railRef} className="review-rail" aria-label={t("reviews")}>{reviews.map((review) => {
        const role = language === "bn" ? review.roleBn || review.role || t("clientRole") : review.role || t("clientRole");
        const text = language === "bn" ? review.textBn || review.textEn : review.textEn;
        const rating = Math.min(5, Math.max(0, Number(review.rating) || 0));
        return <article key={`${review.source ?? "admin"}-${review.id}`} className="glass-card swatch-card review-card relative flex flex-col p-4"><Quote className="absolute right-[-2] top-[-2] h-4 w-4 text-primary/15" aria-hidden="true" /><div className="mb-2 flex items-center justify-between gap-2"><div className="flex items-center gap-2">{rating > 0 ? <><div className="flex gap-1" role="img" aria-label={`${rating.toFixed(1)} out of 5 stars`}>{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`h-4 w-4 ${n <= Math.round(rating) ? "fill-current text-rd-amber" : "text-muted/25"}`} aria-hidden="true" />)}</div><span className="text-[9px] font-bold text-muted">{rating.toFixed(1)}</span></> : <span className="text-[9px] font-bold uppercase tracking-wider text-muted">Not rated</span>}</div><span className="text-[8px] font-black uppercase tracking-wider text-muted">{review.source === "user" ? "Website review" : "Client review"}</span></div><p className="line-clamp-9 min-h-0 flex-1 overflow-hidden text-[0.8rem] leading-[1.6] text-muted-strong">&ldquo;{text}&rdquo;</p><div className="mt-3 border-t border-border pt-2.5"><div className="flex items-center gap-2"><Avatar name={review.name || t("clientRole")} photoUrl={null}></Avatar><span><p className="truncate text-sm font-black text-foreground">{review.name || t("clientRole")}</p><p className="mt-0.5 truncate text-[9px] uppercase tracking-[0.12em] text-muted">{role}</p></span></div></div></article>;
      })}</div>
    </>}</div></section>;
}
