"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, Briefcase, MapPin, Star } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { useLazyPublicData } from "./useLazyPublicData";
import type { CmsReview, CmsWork } from "@/app/types/public-cms";
import ContentDetailModal from "./ContentDetailModal";

export default function WorkSection({ workSlug }: { workSlug: string }) {
  const { data: workData, loading, error, ref } = useLazyPublicData<{ work: CmsWork[] }>("/api/public/work");
  const { language, pick, t } = useLanguage();
  const work = workData?.work ?? [];
  const [selectedWork, setSelectedWork] = useState<CmsWork | null>(null);
  const [relatedReviews, setRelatedReviews] = useState<CmsReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const closeModal = useCallback(() => setSelectedWork(null), []);

  useEffect(() => {
    if (!selectedWork) {
      setRelatedReviews([]);
      return;
    }
    let cancelled = false;
    setReviewsLoading(true);
    fetch(`/api/public/work/${selectedWork.id}/reviews`, {})
      .then(async (response) => ({ ok: response.ok, data: await response.json() as { reviews?: CmsReview[] } }))
      .then(({ ok, data }) => { if (!cancelled) setRelatedReviews(ok && Array.isArray(data.reviews) ? data.reviews : []); })
      .catch(() => { if (!cancelled) setRelatedReviews([]); })
      .finally(() => { if (!cancelled) setReviewsLoading(false); });
    return () => { cancelled = true; };
  }, [selectedWork]);

  return (
    <section ref={ref} className="bg-surface py-7 sm:py-10" aria-labelledby="work-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6">
        <div className="mb-6 flex items-end justify-between gap-3"><div><div className="mb-3 flex items-center gap-2"><div className="h-px w-8 bg-rainbow sm:w-12" /><span className="text-[10px] font-black uppercase tracking-[0.22em] text-primary sm:text-xs">{t("work")}</span></div><h2 id="work-title" className="h2-fluid font-black uppercase leading-tight text-foreground">{t("selectedWork")}</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{t("workIntro")}</p></div></div>
        {loading || !workData ? <div className="flex gap-3 overflow-hidden" aria-label={t("loadingSite")}>{[1, 2, 3].map((item) => <div key={item} className="h-64 min-w-62.5 flex-1 animate-pulse rounded-2xl border border-border bg-background" />)}</div> : error ? <div className="rounded-2xl border border-border bg-background p-5 text-sm text-muted">{error}</div> : work.length === 0 ? null : (
          <div className="mobile-swipe-rail">
            {work.map((item) => { const title = pick(item.title, item.titleBn); const category = pick(item.category, item.categoryBn); return <button type="button" key={item.id} onClick={() => setSelectedWork(item)} className="glass-card group min-w-62.5 max-w-[320px] flex-1 overflow-hidden text-left transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" aria-label={`${t("viewDetails")}: ${title}`}><div className="relative aspect-4/3 bg-primary/5">{item.imageUrl ? <img src={item.imageUrl} alt={title} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" /> : <div className="grid h-full place-items-center text-primary/50"><Briefcase className="h-10 w-10" aria-hidden="true" /></div>}<span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-primary">{category}</span></div><div className="p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="line-clamp-2 text-sm font-black text-foreground sm:text-base">{title}</h3><p className="mt-1 flex items-center gap-1 text-[10px] text-muted"><MapPin className="h-3 w-3" />{item.location || "Bangladesh"}</p></div><ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" /></div></div></button>; })}
          </div>
        )}
      </div>

      <ContentDetailModal open={Boolean(selectedWork)} title={selectedWork ? pick(selectedWork.title, selectedWork.titleBn) : ""} onClose={closeModal} labelledById="work-modal-title">
        {selectedWork && <article><div className="grid md:grid-cols-[1.05fr_.95fr]"><div className="min-h-72 bg-primary/5">{selectedWork.imageUrl ? <img src={selectedWork.imageUrl} alt={pick(selectedWork.title, selectedWork.titleBn)} className="h-full min-h-72 w-full object-cover" /> : <div className="grid h-full min-h-72 place-items-center"><Briefcase className="h-14 w-14 text-primary/40" /></div>}</div><div className="p-5 sm:p-7"><span className="text-[10px] font-black uppercase tracking-[.2em] text-primary">{pick(selectedWork.category, selectedWork.categoryBn)}</span><h3 id="work-modal-title" className="mt-2 text-2xl font-black text-foreground sm:text-3xl">{pick(selectedWork.title, selectedWork.titleBn)}</h3><p className="mt-4 text-sm leading-7 text-muted-strong">{pick(selectedWork.description, selectedWork.descriptionBn)}</p><div className="mt-5 grid gap-2 text-xs text-muted sm:grid-cols-2"><span>{selectedWork.clientName || t("clientRole")}</span><span>{selectedWork.location || "Bangladesh"}</span><span>{selectedWork.year || "—"}</span></div></div></div><section className="border-t border-border p-5 sm:p-7"><div className="mb-4 flex items-center gap-2"><Star className="h-4 w-4 fill-current text-rd-amber" /><h4 className="text-sm font-black uppercase text-foreground">{t("relatedReviews")}</h4></div>{reviewsLoading ? <div className="h-20 animate-pulse rounded-xl bg-surface" /> : relatedReviews.length ? <div className="flex gap-3 overflow-x-auto pb-2">{relatedReviews.map((review) => <article key={review.id} className="glass-card min-w-70 max-w-sm p-4 sm:p-5"><p className="text-sm leading-6 text-muted-strong">&ldquo;{language === "bn" ? review.textBn || review.textEn : review.textEn}&rdquo;</p><p className="mt-4 text-xs font-black text-foreground">{review.name}</p><p className="mt-1 text-[10px] uppercase tracking-widest text-muted">{language === "bn" ? review.roleBn || review.role || t("clientRole") : review.role || t("clientRole")}</p></article>)}</div> : <p className="text-sm text-muted">{t("noRelatedReviews")}</p>}</section></article>}
      </ContentDetailModal>
    </section>
  );
}
