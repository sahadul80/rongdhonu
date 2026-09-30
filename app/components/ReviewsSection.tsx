"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { useLazyPublicData } from "./useLazyPublicData";
import type { CmsReview } from "@/app/types/public-cms";

export default function ReviewsSection() {
  const { t, language } = useLanguage();
  const { ref, data, loading, error } = useLazyPublicData<{ reviews: CmsReview[] }>("/api/public/reviews");
  const reviews = data?.reviews ?? [];
  const railRef = useRef<HTMLDivElement>(null);

  function move(direction: 1 | -1) {
    railRef.current?.scrollBy({ left: direction * Math.min(440, railRef.current.clientWidth * 0.82), behavior: "smooth" });
  }

  return (
    <section ref={ref} className="bg-background py-7 sm:py-10" aria-labelledby="reviews-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6">
        <div className="mb-5 flex items-end justify-between gap-3"><div className="max-w-2xl"><div className="mb-3 flex items-center gap-2"><div className="h-px w-8 bg-rainbow sm:w-12" /><span className="text-[10px] font-black uppercase tracking-[0.22em] text-primary sm:text-xs">{t("reviews")}</span></div><h2 id="reviews-title" className="h2-fluid font-black uppercase leading-tight text-foreground">{t("reviewTitle")}</h2><p className="mt-3 text-sm leading-relaxed text-muted">{t("reviewIntro")}</p></div>{!loading && reviews.length > 0 && <div className="hidden shrink-0 items-center gap-1.5 sm:flex"><button type="button" onClick={() => move(-1)} className="tap-target grid place-items-center rounded-full border border-border bg-surface text-muted-strong transition hover:border-primary hover:text-primary" aria-label="Previous review"><ChevronLeft className="h-4 w-4" aria-hidden="true" /></button><button type="button" onClick={() => move(1)} className="tap-target grid place-items-center rounded-full border border-border bg-surface text-muted-strong transition hover:border-primary hover:text-primary" aria-label="Next review"><ChevronRight className="h-4 w-4" aria-hidden="true" /></button></div>}</div>
        {loading || !data ? <div className="flex gap-3 overflow-hidden">{[1, 2, 3].map((item) => <div key={item} className="h-40 min-w-[calc(100vw-2rem)] max-w-130 flex-1 animate-pulse rounded-2xl border border-border bg-surface sm:min-w-97.5" />)}</div> : error ? <div className="rounded-2xl border border-border bg-surface p-5 text-sm text-muted">{error}</div> : reviews.length === 0 ? null : (
          <>
            <div ref={railRef} className="mobile-swipe-rail" aria-label={t("reviews")}>
              {reviews.map((review) => { const role = language === "bn" ? review.roleBn || review.role || t("clientRole") : review.role || t("clientRole"); const text = language === "bn" ? review.textBn || review.textEn : review.textEn; return <article key={review.id} className="glass-card swatch-card relative min-w-[calc(100vw-2rem)] max-w-130 flex-1 snap-start p-5 sm:min-w-97.5 sm:p-6"><Quote className="absolute right-4 top-4 h-7 w-7 text-primary/15" aria-hidden="true" /><div className="mb-4 flex gap-1" role="img" aria-label={t("fiveStars")}>{Array.from({ length: 5 }, (_, index) => <Star key={index} className="h-4 w-4 fill-current text-rd-amber" aria-hidden="true" />)}</div><p className="min-h-24 text-sm leading-relaxed text-muted-strong">&ldquo;{text}&rdquo;</p><div className="mt-5 border-t border-border pt-3"><p className="truncate text-sm font-black text-foreground">{review.name || t("clientRole")}</p><p className="mt-1 truncate text-[10px] uppercase tracking-widest text-muted">{role}</p></div></article>; })}
            </div>
            <div className="mt-2 flex justify-center gap-1.5 sm:hidden"><button type="button" onClick={() => move(-1)} className="tap-target grid place-items-center rounded-full border border-border bg-surface text-muted-strong" aria-label="Previous review"><ChevronLeft className="h-4 w-4" aria-hidden="true" /></button><button type="button" onClick={() => move(1)} className="tap-target grid place-items-center rounded-full border border-border bg-surface text-muted-strong" aria-label="Next review"><ChevronRight className="h-4 w-4" aria-hidden="true" /></button></div>
          </>
        )}
      </div>
    </section>
  );
}
