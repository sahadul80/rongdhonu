"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Briefcase, Check, Loader2, Mail, MapPin, Pencil, Send, ShieldCheck, Star, Trash2, UserRound } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { useLazyPublicData } from "./useLazyPublicData";
import type { CmsReview, CmsWork } from "@/app/types/public-cms";
import ContentDetailModal from "./ContentDetailModal";
import PublicFormConsent from "./PublicFormConsent";

type WorkReview = CmsReview & { source?: "admin" | "user"; canManage?: boolean; isPublic?: boolean; ownerEmail?: string };
type ReviewFormState = { name: string; email: string; rating: number; text: string };
const EMPTY_FORM: ReviewFormState = { name: "", email: "", rating: 0, text: "" };


function RatingStars({ rating, interactive = false, onChange }: { rating: number; interactive?: boolean; onChange?: (rating: number) => void }) {
  if (!interactive && rating <= 0) return <span className="text-[9px] font-bold uppercase tracking-wider text-muted">Not rated</span>;
  return <div className="flex items-center gap-0.5" role={interactive ? "radiogroup" : "img"} aria-label={interactive ? `Select ${rating || 0} out of 5 stars` : `${rating || 0} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((n) => interactive ? <button key={n} type="button" role="radio" aria-checked={rating === n} onClick={() => onChange?.(n)} className="rounded-sm p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={`${n} star${n === 1 ? "" : "s"}`}><Star className={`h-5 w-5 ${n <= rating ? "fill-current text-rd-amber" : "text-muted/25"}`} /></button> : <Star key={n} className={`h-3.5 w-3.5 ${n <= Math.round(rating) ? "fill-current text-rd-amber" : "text-muted/25"}`} aria-hidden="true" />)}
  </div>;
}

function ReviewSummary({ reviews }: { reviews: WorkReview[] }) {
  const published = reviews.filter((r) => r.source === "admin" || r.isPublic);
  const rated = published.filter((r) => Number(r.rating) > 0);
  if (!published.length) return <div className="rounded-xl border border-dashed border-border bg-surface p-3 text-xs text-muted">No published reviews yet. Be the first to share your experience.</div>;
  const average = rated.length ? rated.reduce((sum, item) => sum + Number(item.rating), 0) / rated.length : 0;
  return <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border border-border bg-background p-3">
    <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10"><strong className="text-lg font-black text-primary">{average.toFixed(1)}</strong></div>
    <div className="min-w-0"><RatingStars rating={average} /><p className="mt-1 text-[10px] text-muted">{rated.length ? `Based on ${rated.length} rated published review${rated.length === 1 ? "" : "s"}` : `${published.length} published review${published.length === 1 ? "" : "s"}; no ratings yet`}</p></div>
    <div className="text-right text-[9px] font-black uppercase tracking-wider text-muted">Published<br />feedback</div>
  </div>;
}

export default function WorkSection() {
  const { data: workData, loading, error, ref } = useLazyPublicData<{ work: CmsWork[] }>("/api/public/work");
  const { language, pick, t } = useLanguage();
  const work = workData?.work ?? [];
  const [selectedWork, setSelectedWork] = useState<CmsWork | null>(null);
  const [relatedReviews, setRelatedReviews] = useState<WorkReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [reviewForm, setReviewForm] = useState<ReviewFormState>(EMPTY_FORM);
  const [reviewHoneypot, setReviewHoneypot] = useState("");
  const [reviewAction, setReviewAction] = useState<string | null>(null);
  const [reviewMessage, setReviewMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [reviewConsent, setReviewConsent] = useState(false);
  const [savedProfile, setSavedProfile] = useState<{ name?: string; email?: string; phone?: string } | null>(null);
  const [autoReviewWorkId, setAutoReviewWorkId] = useState<number | null>(null);
  const reviewFormRef = useRef<HTMLFormElement | null>(null);
  const reviewNameRef = useRef<HTMLInputElement | null>(null);
  const REVIEW_DRAFT_PREFIX = "rd_work_review_draft_";

  const loadRelatedReviews = useCallback(async (workId: number) => {
    setReviewsLoading(true);
    try {
      const response = await fetch(`/api/public/work/${workId}/reviews`, { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      setRelatedReviews(response.ok && Array.isArray(data.reviews) ? data.reviews : []);
    } catch { setRelatedReviews([]); }
    finally { setReviewsLoading(false); }
  }, []);

  useEffect(() => {
    let active = true;
    void fetch("/api/public/profile", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => { if (active) setSavedProfile(data.profile ?? null); })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selectedWork) { setRelatedReviews([]); setReviewOpen(false); setEditingReviewId(null); setReviewForm(EMPTY_FORM); setReviewHoneypot(""); return; }
    void loadRelatedReviews(selectedWork.id);
  }, [selectedWork, loadRelatedReviews]);

  useEffect(() => {
    if (!work.length || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const requestedWorkId = Number(params.get("reviewWork"));
    if (Number.isInteger(requestedWorkId) && requestedWorkId > 0) {
      const target = work.find((item) => item.id === requestedWorkId);
      if (target) {
        setAutoReviewWorkId(target.id);
        setSelectedWork(target);
      }
      params.delete("reviewWork");
      params.delete("identity");
      params.delete("identityError");
      const nextQuery = params.toString();
      window.history.replaceState({}, "", `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash}`);
    }
  }, [work]);

  const managedReview = useMemo(() => relatedReviews.find((review) => review.source === "user" && review.canManage), [relatedReviews]);

  useEffect(() => {
    if (!managedReview || editingReviewId !== null) return;
    setReviewForm({ name: managedReview.name, email: managedReview.ownerEmail ?? "", rating: Number(managedReview.rating) || 0, text: managedReview.textEn });
  }, [managedReview, editingReviewId]);

  function startNewReview() {
    if (managedReview) {
      startEdit(managedReview);
      return;
    }
    let draft: ReviewFormState | null = null;
    try {
      if (selectedWork) {
        const raw = window.sessionStorage.getItem(`${REVIEW_DRAFT_PREFIX}${selectedWork.id}`);
        if (raw) {
          draft = JSON.parse(raw) as ReviewFormState;
          window.sessionStorage.removeItem(`${REVIEW_DRAFT_PREFIX}${selectedWork.id}`);
        }
      }
    } catch {
      draft = null;
    }
    setEditingReviewId(null);
    setReviewForm(draft ? { ...EMPTY_FORM, ...draft } : { ...EMPTY_FORM, name: savedProfile?.name ?? "", email: savedProfile?.email ?? "" });
    setReviewHoneypot("");
    setReviewMessage(null);
    setDeleteId(null);
    setReviewConsent(false);
    setReviewOpen(true);
  }
  function startEdit(review: WorkReview) {
    setEditingReviewId(review.id);
    setReviewForm({ name: review.name, email: review.ownerEmail ?? "", rating: Number(review.rating) || 0, text: review.textEn });
    setReviewHoneypot("");
    setReviewMessage(null);
    setDeleteId(null);
    setReviewConsent(false);
    setReviewOpen(true);
  }

  useEffect(() => {
    if (autoReviewWorkId === null || !selectedWork || selectedWork.id !== autoReviewWorkId) return;
    setAutoReviewWorkId(null);
    window.setTimeout(() => startNewReview(), 80);
  }, [autoReviewWorkId, selectedWork]);

  useEffect(() => {
    if (!reviewOpen) return;
    const frame = window.requestAnimationFrame(() => {
      reviewFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      window.setTimeout(() => reviewNameRef.current?.focus({ preventScroll: true }), 220);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [reviewOpen, editingReviewId]);

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedWork) return;
    setReviewAction(editingReviewId ? "update" : "create"); setReviewMessage(null);
    if (!reviewConsent) { setReviewMessage({ ok: false, text: "Please accept the review consent before submitting." }); setReviewAction(null); return; }
    if (!reviewForm.name.trim() || !/^\S+@\S+\.\S+$/.test(reviewForm.email.trim()) || !reviewForm.rating || reviewForm.text.trim().length < 10) {
      setReviewMessage({ ok: false, text: "Enter your name, a valid email, a 1–5 star rating, and at least 10 characters of review text." }); setReviewAction(null); return;
    }
    try {
      const endpoint = editingReviewId ? `/api/public/reviews/user/${editingReviewId}` : "/api/public/reviews/submit";
      const response = await fetch(endpoint, { method: editingReviewId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editingReviewId ? { ...reviewForm, consentAccepted: true } : { ...reviewForm, workId: selectedWork.id, consentAccepted: true, website: reviewHoneypot }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not save your review.");
      setReviewMessage({ ok: true, text: `${data.message || (editingReviewId ? "Your review was updated." : "Your review was submitted for moderation.")}` });
      setReviewOpen(false); setEditingReviewId(null); setReviewForm(EMPTY_FORM); setReviewHoneypot(""); setReviewConsent(false); await loadRelatedReviews(selectedWork.id);
    } catch (cause) { setReviewMessage({ ok: false, text: cause instanceof Error ? cause.message : "Could not save your review." }); }
    finally { setReviewAction(null); }
  }

  async function deleteReview(id: number) {
    setReviewAction(`delete:${id}`);
    try {
      const response = await fetch(`/api/public/reviews/user/${id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not delete your review.");
      setDeleteId(null); setReviewMessage({ ok: true, text: data.message || "Your review was deleted." }); setReviewOpen(false); setEditingReviewId(null); setReviewForm(EMPTY_FORM); setReviewHoneypot(""); setReviewConsent(false);
      if (selectedWork) await loadRelatedReviews(selectedWork.id);
    } catch (cause) { setReviewMessage({ ok: false, text: cause instanceof Error ? cause.message : "Could not delete your review." }); }
    finally { setReviewAction(null); }
  }

  const closeModal = useCallback(() => setSelectedWork(null), []);

  return <section ref={ref} className="bg-surface p-2 sm:p-4" aria-labelledby="work-title">
    <div className="mx-auto max-w-dvw p-2">
      <div className="flex items-end justify-between"><div><div className="flex items-center gap-2"><div className="h-px w-8 bg-rainbow sm:w-12" /><span className="text-[10px] font-black uppercase tracking-[0.22em] text-primary sm:text-xs">{t("work")}</span></div><h2 id="work-title" className="h2-fluid font-black uppercase leading-tight text-foreground">{t("selectedWork")}</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{t("workIntro")}</p></div></div>
      {loading || !workData ? <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-70 animate-pulse rounded-2xl border border-border bg-background" />)}</div> : error ? <div className="mt-4 rounded-2xl border border-border bg-background p-5 text-sm text-muted">{error}</div> : work.length === 0 ? null : <div className="mobile-swipe-rail mt-4 items-stretch sm:grid sm:grid-cols-3 sm:gap-2 sm:overflow-visible sm:pb-0 lg:grid lg:grid-cols-4 lg:gap-3 lg:overflow-visible lg:pb-0">
        {work.map((item) => { const title = pick(item.title, item.titleBn); const category = pick(item.category, item.categoryBn); return <button type="button" key={item.id} onClick={() => setSelectedWork(item)} className="glass-card group flex h-70 w-65 shrink-0 flex-col overflow-hidden text-left transition duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:w-70 lg:h-70 lg:w-auto lg:min-w-0" aria-label={`${t("viewDetails")}: ${title}`}>
          <div className="relative h-45 w-full shrink-0 overflow-hidden bg-primary/5">{item.imageUrl ? <Image src={item.imageUrl} alt={title} fill sizes="(max-width: 639px) 260px, (max-width: 1023px) 280px, 25vw" loading="lazy" className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]" /> : <div className="grid h-full w-full place-items-center text-primary/50"><Briefcase className="h-10 w-10" aria-hidden="true" /></div>}<span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-primary backdrop-blur-sm">{category}</span></div>
          <div className="flex min-h-0 flex-1 flex-col justify-center overflow-hidden p-3 sm:p-4"><div className="flex min-w-0 items-start justify-between gap-3"><div className="min-w-0 flex-1"><h3 className="line-clamp-2 min-h-10 text-sm font-black leading-5 text-foreground sm:text-base">{title}</h3><p className="mt-1 flex items-center gap-1 truncate text-[10px] text-muted"><MapPin className="h-3 w-3 shrink-0" aria-hidden="true" /><span className="truncate">{item.location || "Bangladesh"}</span></p></div><ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" /></div></div>
        </button>; })}
      </div>}
    </div>

    <ContentDetailModal open={Boolean(selectedWork)} title={selectedWork ? pick(selectedWork.title, selectedWork.titleBn) : ""} onClose={closeModal} labelledById="work-modal-title">
      {selectedWork && <article className="min-w-0">
        <div className="grid min-w-0 md:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)]">
          <div className="relative h-55 w-full overflow-hidden bg-primary/5 sm:h-70 md:h-95">{selectedWork.imageUrl ? <Image src={selectedWork.imageUrl} alt={pick(selectedWork.title, selectedWork.titleBn)} fill sizes="(max-width: 767px) 100vw, 55vw" className="object-cover object-center" priority /> : <div className="grid h-full w-full place-items-center text-primary/40"><Briefcase className="h-14 w-14" aria-hidden="true" /></div>}</div>
          <div className="flex min-w-0 flex-col justify-center p-5 sm:p-6 md:p-8"><span className="text-[10px] font-black uppercase tracking-[.2em] text-primary">{pick(selectedWork.category, selectedWork.categoryBn)}</span><h3 id="work-modal-title" className="mt-2 text-2xl font-black leading-tight text-foreground sm:text-3xl">{pick(selectedWork.title, selectedWork.titleBn)}</h3><p className="mt-4 text-sm leading-7 text-muted-strong">{pick(selectedWork.description, selectedWork.descriptionBn)}</p><div className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-5 text-xs text-muted"><div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-widest text-muted">{t("clientRole")}</p><p className="mt-1 truncate text-foreground">{selectedWork.clientName || t("clientRole")}</p></div><div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-widest text-muted">Location</p><p className="mt-1 truncate text-foreground">{selectedWork.location || "Bangladesh"}</p></div><div><p className="text-[9px] font-bold uppercase tracking-widest text-muted">Year</p><p className="mt-1 text-foreground">{selectedWork.year || "—"}</p></div></div></div>
        </div>

        <section className="border-t border-border bg-surface/40 p-4 sm:p-5 md:p-6" aria-labelledby="related-reviews-title">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><div className="flex items-center gap-2"><Star className="h-4 w-4 fill-current text-rd-amber" aria-hidden="true" /><h4 id="related-reviews-title" className="text-sm font-black uppercase text-foreground">{t("relatedReviews")}</h4></div><p className="mt-1 text-[10px] text-muted">One review per work per email. Your submitted review can be edited from this device.</p></div><button type="button" onClick={startNewReview} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-[10px] font-black text-primary-foreground transition hover:bg-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">{managedReview ? <Pencil className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}{managedReview ? "Edit your review" : "Write a review"}</button></div>
          <div className="mt-3"><ReviewSummary reviews={relatedReviews} /></div>
          {reviewMessage && <div role={reviewMessage.ok ? "status" : "alert"} className={`mt-3 rounded-lg px-3 py-2 text-xs font-semibold ${reviewMessage.ok ? "bg-rd-green/10 text-rd-green" : "bg-rd-red/10 text-rd-red"}`}>{reviewMessage.text}</div>}

          {reviewsLoading ? <div className="mt-3 flex gap-3 overflow-hidden">{[1, 2, 3].map((item) => <div key={item} className="h-35 min-w-65 animate-pulse rounded-2xl border border-border bg-background/70" />)}</div> : relatedReviews.length ? <div className="mt-3 flex gap-3 overflow-x-auto overscroll-contain pb-2 [scrollbar-width:thin]">
            {relatedReviews.map((review) => {
              const reviewText = language === "bn" ? review.textBn || review.textEn : review.textEn;
              const role = language === "bn" ? review.roleBn || review.role || t("clientRole") : review.role || t("clientRole");
              const pending = review.source === "user" && !review.isPublic;
              return <article key={`${review.source ?? "admin"}-${review.id}`} className={`glass-card flex min-h-37.5 w-72.5 min-w-72.5 shrink-0 flex-col justify-between overflow-hidden p-4 sm:p-5 ${pending ? "border-dashed border-primary/40" : ""}`}>
                <div><div className="mb-2 flex items-center justify-between gap-2"><RatingStars rating={Number(review.rating) || 0} /><span className={`text-[8px] font-black uppercase tracking-widest ${pending ? "text-primary" : "text-muted"}`}>{pending ? "Awaiting moderation" : review.source === "user" ? "Website review" : "Client review"}</span></div><p className="line-clamp-4 text-sm leading-6 text-muted-strong">&ldquo;{reviewText}&rdquo;</p></div>
                <div className="mt-4 flex items-end justify-between gap-2 border-t border-border pt-3"><div className="min-w-0"><p className="truncate text-xs font-black text-foreground">{review.name}</p><p className="mt-1 truncate text-[10px] uppercase tracking-widest text-muted">{role}</p></div>{review.canManage && <div className="flex gap-1"><button type="button" onClick={() => startEdit(review)} className="grid h-7 w-7 place-items-center rounded-md border border-border text-muted-strong hover:border-primary hover:text-primary" aria-label="Edit your review"><Pencil className="h-3.5 w-3.5" /></button><button type="button" onClick={() => setDeleteId(review.id)} className="grid h-7 w-7 place-items-center rounded-md border border-border text-muted-strong hover:border-rd-red/40 hover:text-rd-red" aria-label="Delete your review"><Trash2 className="h-3.5 w-3.5" /></button></div>}</div>
                {deleteId === review.id && <div className="mt-2 flex items-center gap-2 rounded-lg bg-rd-red/10 p-2 text-[9px] font-bold text-rd-red">Delete this review? <button type="button" onClick={() => void deleteReview(review.id)} className="rounded-md bg-rd-red px-2 py-1 text-white" disabled={reviewAction === `delete:${review.id}`}>{reviewAction === `delete:${review.id}` ? "Deleting…" : "Delete"}</button><button type="button" onClick={() => setDeleteId(null)} className="rounded-md border border-border bg-background px-2 py-1 text-muted-strong">Cancel</button></div>}
              </article>;
            })}
          </div> : null}

          {reviewOpen && <form id="review-form" ref={reviewFormRef} onSubmit={submitReview} className="relative mt-4 scroll-mt-6 rounded-2xl border border-primary/35 bg-primary/[0.03] p-4 shadow-sm ring-2 ring-primary/10 sm:p-5"><input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" value={reviewHoneypot} onChange={(e) => setReviewHoneypot(e.target.value)} className="absolute left-[-10000px] h-px w-px overflow-hidden opacity-0" /><div className="flex items-start justify-between gap-3"><div><h5 className="text-sm font-black text-foreground">{editingReviewId ? "Update your review" : "Share your experience"}</h5><p className="mt-1 text-[10px] leading-4 text-muted">Your email stays private. New or edited reviews are reviewed before they become public.</p></div><button type="button" onClick={() => { setReviewOpen(false); setEditingReviewId(null); }} className="grid h-8 w-8 place-items-center rounded-full border border-border text-muted-strong hover:text-foreground" aria-label="Close review form">×</button></div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2"><label className="admin-label"><span>Name</span><input ref={reviewNameRef} className="admin-input" value={reviewForm.name} onChange={(e) => setReviewForm((v) => ({ ...v, name: e.target.value }))} autoComplete="name" /></label><label className="admin-label"><span>Email (private){editingReviewId ? " · fixed for this review" : ""}</span><input type="email" className="admin-input" value={reviewForm.email} onChange={(e) => setReviewForm((v) => ({ ...v, email: e.target.value }))} autoComplete="email" disabled={Boolean(editingReviewId)} aria-describedby={editingReviewId ? "review-email-note" : undefined} /></label></div>
            {editingReviewId && <p id="review-email-note" className="mt-1 text-[9px] text-muted">This email identifies your review for this work and cannot be changed.</p>}
            <div className="mt-3"><span className="admin-label"><span>Rating</span></span><RatingStars rating={reviewForm.rating} interactive onChange={(rating) => setReviewForm((v) => ({ ...v, rating }))} /></div>
            <label className="admin-label mt-3"><span>Your review</span><textarea className="admin-textarea min-h-28" value={reviewForm.text} onChange={(e) => setReviewForm((v) => ({ ...v, text: e.target.value }))} maxLength={1500} placeholder="Tell future clients what you thought about the work…" /><span className="text-[9px] text-muted">{reviewForm.text.length}/1500</span></label>
            <PublicFormConsent consent={reviewConsent} onConsentChange={(value) => { setReviewConsent(value); if (value) setReviewMessage(null); }} draft={reviewForm} draftKey={`${REVIEW_DRAFT_PREFIX}${selectedWork.id}`} returnTo={() => `${window.location.pathname}?reviewWork=${selectedWork.id}`} disabled={Boolean(reviewAction)} compact />
            <div className="mt-3 flex flex-wrap items-center justify-end gap-2"><span className="mr-auto inline-flex items-center gap-1 text-[9px] text-muted"><ShieldCheck className="h-3.5 w-3.5" />Secure owner access on this device</span><button type="button" onClick={() => { setReviewOpen(false); setEditingReviewId(null); }} className="rounded-lg border border-border px-3 py-2 text-[10px] font-bold text-muted-strong">Cancel</button><button type="submit" disabled={Boolean(reviewAction)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-[10px] font-black text-primary-foreground disabled:opacity-60">{reviewAction ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}{reviewAction === "update" ? "Update review" : "Submit review"}</button></div>
          </form>}
          {!reviewOpen && managedReview && <div className="mt-3 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-[10px] text-muted"><UserRound className="h-4 w-4 text-primary" />You already reviewed this work. You can edit your existing review; another review for the same work is not permitted.</div>}
        </section>
      </article>}
    </ContentDetailModal>
  </section>;
}
