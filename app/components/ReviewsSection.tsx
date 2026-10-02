"use client";

import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { useRef } from "react";
import { useLanguage } from "./LanguageContext";
import { useLazyPublicData } from "./useLazyPublicData";
import type { CmsReview } from "@/app/types/public-cms";

export default function ReviewsSection() {
  const { ref, data, loading, error } = useLazyPublicData<{ reviews: CmsReview[] }>("/api/public/reviews");
  const { language, t } = useLanguage();
  const railRef = useRef<HTMLDivElement>(null);
  const reviews = data?.reviews ?? [];
  const move = (direction: number) => railRef.current?.scrollBy({ left: direction * Math.max(280, railRef.current.clientWidth * 0.8), behavior: "smooth" });

  return <section ref={ref} className="bg-background py-7 sm:py-10" aria-labelledby="reviews-title"><div className="mx-auto max-w-dvw px-3 sm:px-5">
    <div className="mb-5 flex items-end justify-between gap-3"><div className="max-w-2xl"><div className="mb-3 flex items-center gap-2"><div className="h-px w-8 bg-rainbow sm:w-12" /><span className="text-[10px] font-black uppercase tracking-[0.22em] text-primary sm:text-xs">{t("reviews")}</span></div><h2 id="reviews-title" className="h2-fluid font-black uppercase leading-tight text-foreground">{t("reviewTitle")}</h2><p className="mt-3 text-sm leading-relaxed text-muted">{t("reviewIntro")}</p></div>{!loading && reviews.length > 0 && <div className="hidden shrink-0 gap-1.5 sm:flex lg:hidden"><button type="button" onClick={() => move(-1)} className="tap-target grid place-items-center rounded-full border border-border bg-surface text-muted-strong hover:border-primary hover:text-primary" aria-label="Previous review"><ChevronLeft className="h-4 w-4" /></button><button type="button" onClick={() => move(1)} className="tap-target grid place-items-center rounded-full border border-border bg-surface text-muted-strong hover:border-primary hover:text-primary" aria-label="Next review"><ChevronRight className="h-4 w-4" /></button></div>}</div>
    {loading || !data ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-40 animate-pulse rounded-2xl border border-border bg-surface" />)}</div> : error ? <div className="rounded-2xl border border-border bg-surface p-5 text-sm text-muted">{error}</div> : reviews.length === 0 ? null : <>
      <div ref={railRef} className="mobile-swipe-rail lg:grid lg:grid-cols-3 lg:justify-items-center lg:gap-4 lg:overflow-visible lg:pb-0" aria-label={t("reviews")}>{reviews.map((review) => {
        const role = language === "bn" ? review.roleBn || review.role || t("clientRole") : review.role || t("clientRole");
        const text = language === "bn" ? review.textBn || review.textEn : review.textEn;
        const rating = Math.min(5, Math.max(0, Number(review.rating) || 0));
        return <article key={`${review.source ?? "admin"}-${review.id}`} className="glass-card swatch-card relative min-w-[78vw] max-w-88 flex-1 snap-start p-3.5 sm:min-w-[18rem] sm:max-w-76 sm:p-4 lg:min-w-0 lg:max-w-76"><Quote className="absolute right-4 top-4 h-7 w-7 text-primary/15" aria-hidden="true" /><div className="mb-2 flex items-center justify-between gap-2"><div className="flex items-center gap-2">{rating > 0 ? <><div className="flex gap-1" role="img" aria-label={`${rating.toFixed(1)} out of 5 stars`}>{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`h-4 w-4 ${n <= Math.round(rating) ? "fill-current text-rd-amber" : "text-muted/25"}`} aria-hidden="true" />)}</div><span className="text-[9px] font-bold text-muted">{rating.toFixed(1)}</span></> : <span className="text-[9px] font-bold uppercase tracking-wider text-muted">Not rated</span>}</div><span className="text-[8px] font-black uppercase tracking-wider text-muted">{review.source === "user" ? "Website review" : "Client review"}</span></div><p className="min-h-16 text-[0.78rem] leading-[1.6] text-muted-strong">&ldquo;{text}&rdquo;</p><div className="mt-3 border-t border-border pt-2.5"><p className="truncate text-sm font-black text-foreground">{review.name || t("clientRole")}</p><p className="mt-0.5 truncate text-[9px] uppercase tracking-[0.12em] text-muted">{role}</p></div></article>;
      })}</div><div className="mt-2 flex justify-center gap-1.5 lg:hidden"><button type="button" onClick={() => move(-1)} className="tap-target grid place-items-center rounded-full border border-border bg-surface text-muted-strong" aria-label="Previous review"><ChevronLeft className="h-4 w-4" /></button><button type="button" onClick={() => move(1)} className="tap-target grid place-items-center rounded-full border border-border bg-surface text-muted-strong" aria-label="Next review"><ChevronRight className="h-4 w-4" /></button></div>
    </>}</div></section>;
}
