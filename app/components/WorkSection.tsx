"use client";

import Image from "next/image";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

import {
  ArrowUpRight,
  Briefcase,
  Check,
  Loader2,
  MapPin,
  Pencil,
  Send,
  ShieldCheck,
  Star,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import { useLanguage } from "./LanguageContext";
import SectionHeader from "./SectionHeader";
import { useLazyPublicData } from "./useLazyPublicData";
import type { CmsReview, CmsWork } from "@/app/types/public-cms";
import ContentDetailModal from "./ContentDetailModal";
import PublicFormConsent from "./PublicFormConsent";

type WorkReview = CmsReview & {
  source?: "admin" | "user";
  canManage?: boolean;
  isPublic?: boolean;
  ownerEmail?: string;
};

type ReviewFormState = {
  name: string;
  email: string;
  rating: number;
  text: string;
};

type ReviewFieldKey = keyof ReviewFormState | "consent";

type ReviewErrors = Partial<Record<ReviewFieldKey, string>>;

const EMPTY_FORM: ReviewFormState = {
  name: "",
  email: "",
  rating: 0,
  text: "",
};

function RatingStars({
  rating,
  interactive = false,
  onChange,
  hasError = false,
}: {
  rating: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  hasError?: boolean;
}) {
  if (!interactive && rating <= 0) {
    return (
      <span className="text-[9px] font-bold uppercase tracking-wider text-muted">
        Not rated
      </span>
    );
  }

  return (
    <div
      className={[
        "flex items-center gap-0.5",
        interactive && hasError
          ? "rounded-lg border border-rd-red/40 bg-rd-red/5 px-1.5 py-1"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role={interactive ? "radiogroup" : "img"}
      aria-label={
        interactive
          ? `Select ${rating || 0} out of 5 stars`
          : `${rating || 0} out of 5 stars`
      }
    >
      {[1, 2, 3, 4, 5].map((n) =>
        interactive ? (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            onClick={() => onChange?.(n)}
            className="rounded-sm p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
          >
            <Star
              className={`h-5 w-5 ${
                n <= rating
                  ? "fill-current text-rd-amber"
                  : "text-muted/25"
              }`}
            />
          </button>
        ) : (
          <Star
            key={n}
            className={`h-3.5 w-3.5 ${
              n <= Math.round(rating)
                ? "fill-current text-rd-amber"
                : "text-muted/25"
            }`}
            aria-hidden="true"
          />
        ),
      )}
    </div>
  );
}

function FieldError({
  id,
  children,
}: {
  id?: string;
  children?: string;
}) {
  if (!children) return null;

  return (
    <p
      id={id}
      role="alert"
      className="mt-1 text-[10px] font-semibold leading-4 text-rd-red"
    >
      {children}
    </p>
  );
}

function ReviewSummary({
  reviews,
}: {
  reviews: WorkReview[];
}) {
  const published = reviews.filter(
    (review) => review.source === "admin" || review.isPublic,
  );

  const rated = published.filter(
    (review) => Number(review.rating) > 0,
  );

  const average = rated.length
    ? rated.reduce(
        (sum, item) => sum + Number(item.rating),
        0,
      ) / rated.length
    : 0;

  return (
    <div className="grid grid-cols-[auto_1fr] items-center gap-3">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10">
        <strong className="text-lg font-black text-primary">
          {rated.length ? average.toFixed(1) : "—"}
        </strong>
      </div>

      <div className="min-w-0">
        <RatingStars rating={average} />

        <p className="mt-1 text-[10px] text-muted">
          {rated.length
            ? `Based on ${rated.length} rated published review${
                rated.length === 1 ? "" : "s"
              }`
            : published.length
              ? `${published.length} published review${
                  published.length === 1 ? "" : "s"
                }; no ratings yet`
              : "No published reviews yet"}
        </p>
      </div>
    </div>
  );
}

export default function WorkSection() {
  const {
    data: workData,
    loading,
    error,
    ref,
  } = useLazyPublicData<{ work: CmsWork[] }>("/api/public/work");

  const { language, pick, t } = useLanguage();

  const work = workData?.work ?? [];

  const [selectedWork, setSelectedWork] =
    useState<CmsWork | null>(null);

  const [relatedReviews, setRelatedReviews] = useState<
    WorkReview[]
  >([]);

  const [reviewsLoading, setReviewsLoading] =
    useState(false);

  /**
   * true = show the review form
   * false = show the review list
   */
  const [reviewOpen, setReviewOpen] = useState(false);

  const [editingReviewId, setEditingReviewId] =
    useState<number | null>(null);

  const [reviewForm, setReviewForm] =
    useState<ReviewFormState>(EMPTY_FORM);

  const [reviewHoneypot, setReviewHoneypot] =
    useState("");

  const [reviewAction, setReviewAction] =
    useState<string | null>(null);

  /**
   * Submission feedback only.
   * Validation feedback lives beside each field.
   */
  const [reviewMessage, setReviewMessage] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  const [reviewErrors, setReviewErrors] =
    useState<ReviewErrors>({});

  const [deleteId, setDeleteId] =
    useState<number | null>(null);

  const [reviewConsent, setReviewConsent] =
    useState(false);

  const [savedProfile, setSavedProfile] =
    useState<{
      name?: string;
      email?: string;
      phone?: string;
    } | null>(null);

  const [autoReviewWorkId, setAutoReviewWorkId] =
    useState<number | null>(null);

  const reviewFormRef =
    useRef<HTMLFormElement | null>(null);

  const reviewNameRef =
    useRef<HTMLInputElement | null>(null);

  const reviewEmailRef =
    useRef<HTMLInputElement | null>(null);

  const reviewTextRef =
    useRef<HTMLTextAreaElement | null>(null);

  const reviewContentRef =
    useRef<HTMLDivElement | null>(null);

  const REVIEW_DRAFT_PREFIX =
    "rd_work_review_draft_";

  const loadRelatedReviews = useCallback(
    async (workId: number) => {
      setReviewsLoading(true);

      try {
        const response = await fetch(
          `/api/public/work/${workId}/reviews`,
          { cache: "no-store" },
        );

        const data = await response
          .json()
          .catch(() => ({}));

        setRelatedReviews(
          response.ok && Array.isArray(data.reviews)
            ? data.reviews
            : [],
        );
      } catch {
        setRelatedReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    let active = true;

    void fetch("/api/public/profile", {
      cache: "no-store",
    })
      .then((response) => response.json())
      .then((data) => {
        if (active) {
          setSavedProfile(data.profile ?? null);
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedWork) {
      setRelatedReviews([]);
      setReviewOpen(false);
      setEditingReviewId(null);
      setReviewForm(EMPTY_FORM);
      setReviewHoneypot("");
      setReviewErrors({});
      setReviewMessage(null);
      return;
    }

    void loadRelatedReviews(selectedWork.id);
  }, [selectedWork, loadRelatedReviews]);

  useEffect(() => {
    if (!work.length || typeof window === "undefined")
      return;

    const params = new URLSearchParams(
      window.location.search,
    );

    const requestedWorkId = Number(
      params.get("reviewWork"),
    );

    if (
      Number.isInteger(requestedWorkId) &&
      requestedWorkId > 0
    ) {
      const target = work.find(
        (item) => item.id === requestedWorkId,
      );

      if (target) {
        setAutoReviewWorkId(target.id);
        setSelectedWork(target);
      }

      params.delete("reviewWork");
      params.delete("identity");
      params.delete("identityError");

      const nextQuery = params.toString();

      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}${
          nextQuery ? `?${nextQuery}` : ""
        }${window.location.hash}`,
      );
    }
  }, [work]);

  const managedReview = useMemo(
    () =>
      relatedReviews.find(
        (review) =>
          review.source === "user" &&
          review.canManage,
      ),
    [relatedReviews],
  );

  const reviewStats = useMemo(() => {
    const published = relatedReviews.filter(
      (review) =>
        review.source === "admin" || review.isPublic,
    );

    const rated = published.filter(
      (review) => Number(review.rating) > 0,
    );

    const average = rated.length
      ? rated.reduce(
          (sum, review) =>
            sum + Number(review.rating),
          0,
        ) / rated.length
      : 0;

    return {
      published,
      rated,
      average,
    };
  }, [relatedReviews]);

  useEffect(() => {
    if (!managedReview || editingReviewId !== null)
      return;

    setReviewForm({
      name: managedReview.name,
      email: managedReview.ownerEmail ?? "",
      rating: Number(managedReview.rating) || 0,
      text: managedReview.textEn,
    });
  }, [managedReview, editingReviewId]);

  function clearReviewFeedback() {
    setReviewErrors({});
    setReviewMessage(null);
  }

  function clearFieldError(field: ReviewFieldKey) {
    setReviewErrors((current) => {
      if (!current[field]) return current;

      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function setFormField<K extends keyof ReviewFormState>(
    field: K,
    value: ReviewFormState[K],
  ) {
    setReviewForm((current) => ({
      ...current,
      [field]: value,
    }));

    clearFieldError(field);
    setReviewMessage(null);
  }

  function startNewReview() {
    if (managedReview) {
      startEdit(managedReview);
      return;
    }

    let draft: ReviewFormState | null = null;

    try {
      if (selectedWork) {
        const raw = window.sessionStorage.getItem(
          `${REVIEW_DRAFT_PREFIX}${selectedWork.id}`,
        );

        if (raw) {
          draft = JSON.parse(
            raw,
          ) as ReviewFormState;

          window.sessionStorage.removeItem(
            `${REVIEW_DRAFT_PREFIX}${selectedWork.id}`,
          );
        }
      }
    } catch {
      draft = null;
    }

    setEditingReviewId(null);

    setReviewForm(
      draft
        ? { ...EMPTY_FORM, ...draft }
        : {
            ...EMPTY_FORM,
            name: savedProfile?.name ?? "",
            email: savedProfile?.email ?? "",
          },
    );

    setReviewHoneypot("");
    setDeleteId(null);
    setReviewConsent(false);
    clearReviewFeedback();
    setReviewOpen(true);
  }

  function startEdit(review: WorkReview) {
    setEditingReviewId(review.id);

    setReviewForm({
      name: review.name,
      email: review.ownerEmail ?? "",
      rating: Number(review.rating) || 0,
      text: review.textEn,
    });

    setReviewHoneypot("");
    setDeleteId(null);
    setReviewConsent(false);
    clearReviewFeedback();
    setReviewOpen(true);
  }

  function closeReviewForm() {
    setReviewOpen(false);
    setEditingReviewId(null);
    setReviewErrors({});
    setReviewMessage(null);
  }

  useEffect(() => {
    if (
      autoReviewWorkId === null ||
      !selectedWork ||
      selectedWork.id !== autoReviewWorkId
    ) {
      return;
    }

    setAutoReviewWorkId(null);

    window.setTimeout(() => {
      startNewReview();
    }, 80);
  }, [autoReviewWorkId, selectedWork]);

  useEffect(() => {
    if (!reviewOpen) return;

    const frame = window.requestAnimationFrame(() => {
      reviewContentRef.current?.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      window.setTimeout(() => {
        reviewNameRef.current?.focus({
          preventScroll: true,
        });
      }, 220);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [reviewOpen, editingReviewId]);

  function validateReview(): ReviewErrors {
    const errors: ReviewErrors = {};

    const name = reviewForm.name.trim();
    const email = reviewForm.email.trim();
    const text = reviewForm.text.trim();

    if (!name) {
      errors.name = "Please enter your name.";
    } else if (name.length < 2) {
      errors.name =
        "Name must be at least 2 characters.";
    }

    if (!email) {
      errors.email = "Please enter your email.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      errors.email =
        "Please enter a valid email address.";
    }

    if (!reviewForm.rating) {
      errors.rating = "Please select a rating.";
    } else if (
      reviewForm.rating < 1 ||
      reviewForm.rating > 5
    ) {
      errors.rating = "Rating must be between 1 and 5.";
    }

    if (!text) {
      errors.text = "Please write your review.";
    } else if (text.length < 10) {
      errors.text =
        "Your review must be at least 10 characters.";
    }

    if (!reviewConsent) {
      errors.consent =
        "Please accept the review consent before submitting.";
    }

    return errors;
  }

  function focusFirstError(errors: ReviewErrors) {
    if (errors.name) {
      reviewNameRef.current?.focus();
      return;
    }

    if (errors.email) {
      reviewEmailRef.current?.focus();
      return;
    }

    if (errors.rating) {
      document
        .querySelector<HTMLButtonElement>(
          '[role="radiogroup"] button',
        )
        ?.focus();
      return;
    }

    if (errors.text) {
      reviewTextRef.current?.focus();
    }
  }

  async function submitReview(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedWork) return;

    setReviewMessage(null);

    const validationErrors = validateReview();

    if (Object.keys(validationErrors).length) {
      setReviewErrors(validationErrors);
      setReviewAction(null);
      focusFirstError(validationErrors);
      return;
    }

    setReviewErrors({});
    setReviewAction(
      editingReviewId ? "update" : "create",
    );

    try {
      const endpoint = editingReviewId
        ? `/api/public/reviews/user/${editingReviewId}`
        : "/api/public/reviews/submit";

      const response = await fetch(endpoint, {
        method: editingReviewId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          editingReviewId
            ? {
                ...reviewForm,
                consentAccepted: true,
              }
            : {
                ...reviewForm,
                workId: selectedWork.id,
                consentAccepted: true,
                website: reviewHoneypot,
              },
        ),
      });

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        const serverErrors =
          data &&
          typeof data.errors === "object" &&
          data.errors
            ? (data.errors as Record<
                string,
                string
              >)
            : null;

        if (serverErrors) {
          setReviewErrors({
            name: serverErrors.name,
            email: serverErrors.email,
            rating: serverErrors.rating,
            text:
              serverErrors.text ??
              serverErrors.review_text,
            consent: serverErrors.consent,
          });

          focusFirstError({
            name: serverErrors.name,
            email: serverErrors.email,
            rating: serverErrors.rating,
            text:
              serverErrors.text ??
              serverErrors.review_text,
            consent: serverErrors.consent,
          });
        }

        throw new Error(
          data.error ||
            "Could not save your review.",
        );
      }

      setReviewMessage({
        ok: true,
        text:
          data.message ||
          (editingReviewId
            ? "Your review was updated successfully."
            : "Your review was submitted successfully and is awaiting moderation."),
      });

      setReviewErrors({});
      setReviewHoneypot("");

      await loadRelatedReviews(selectedWork.id);

      /*
       * Keep the form visible so the success result
       * is shown beside the submit button.
       */
      setReviewOpen(true);
    } catch (cause) {
      setReviewMessage({
        ok: false,
        text:
          cause instanceof Error
            ? cause.message
            : "Could not save your review.",
      });
    } finally {
      setReviewAction(null);
    }
  }

  async function deleteReview(id: number) {
    setReviewAction(`delete:${id}`);

    try {
      const response = await fetch(
        `/api/public/reviews/user/${id}`,
        {
          method: "DELETE",
        },
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Could not delete your review.",
        );
      }

      setDeleteId(null);
      setReviewMessage({
        ok: true,
        text:
          data.message ||
          "Your review was deleted.",
      });

      if (selectedWork) {
        await loadRelatedReviews(
          selectedWork.id,
        );
      }
    } catch (cause) {
      setReviewMessage({
        ok: false,
        text:
          cause instanceof Error
            ? cause.message
            : "Could not delete your review.",
      });
    } finally {
      setReviewAction(null);
    }
  }

  const closeModal = useCallback(
    () => setSelectedWork(null),
    [],
  );

  return (
    <section
      ref={ref}
      className="section-surface section-y pattern-work bg-surface"
      aria-labelledby="work-title"
    >
      <div className="section-shell">
        <SectionHeader eyebrow={t("work")} title={t("selectedWork")} intro={t("workIntro")} titleId="work-title" />

        {loading || !workData ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-70 animate-pulse rounded-2xl border border-border bg-background"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-border bg-background p-5 text-sm text-muted">
            {error}
          </div>
        ) : work.length === 0 ? null : (
          <div className="mobile-swipe-rail items-stretch sm:grid sm:grid-cols-4 sm:gap-2 sm:overflow-visible sm:pb-0 lg:gap-3 lg:overflow-visible lg:pb-0">
            {work.map((item) => {
              const title = pick(
                item.title,
                item.titleBn,
              );
              const category = pick(
                item.category,
                item.categoryBn,
              );

              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() =>
                    setSelectedWork(item)
                  }
                  className="glass-card group flex h-70 w-65 shrink-0 flex-col overflow-hidden text-left transition duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:w-auto lg:h-70 lg:w-auto lg:min-w-0"
                  aria-label={`${t("viewDetails")}: ${title}`}
                >
                  <div className="relative h-45 w-full shrink-0 overflow-hidden bg-primary/5">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={title}
                        fill
                        sizes="(max-width: 639px) 260px, (max-width: 1023px) 280px, 25vw"
                        loading="lazy"
                        className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-primary/50">
                        <Briefcase
                          className="h-10 w-10"
                          aria-hidden="true"
                        />
                      </div>
                    )}

                    <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-primary backdrop-blur-sm">
                      {category}
                    </span>
                  </div>

                  <div className="flex min-h-0 flex-1 flex-col justify-center overflow-hidden p-3 sm:p-4">
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-2 min-h-10 text-sm font-black leading-5 text-foreground sm:text-base">
                          {title}
                        </h3>

                        <p className="mt-1 flex items-center gap-1 truncate text-[10px] text-muted">
                          <MapPin
                            className="h-3 w-3 shrink-0"
                            aria-hidden="true"
                          />
                          <span className="truncate">
                            {item.location ||
                              "Bangladesh"}
                          </span>
                        </p>
                      </div>

                      <ArrowUpRight
                        className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <ContentDetailModal
        open={Boolean(selectedWork)}
        title={
          selectedWork
            ? pick(
                selectedWork.title,
                selectedWork.titleBn,
              )
            : ""
        }
        onClose={closeModal}
        labelledById="work-modal-title"
      >
        {selectedWork && (
          <article className="min-w-0">
            <div className="h-[min(90dvh,860px)] min-h-0 overflow-hidden bg-background">
              <div className="grid h-full min-h-0 grid-cols-1 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] md:grid-cols-2 md:grid-rows-1">
                {/* Work area: fixed left half on desktop, fixed top half on mobile. */}
                <section
                  className="min-h-0 min-w-0 overflow-hidden border-b border-border md:border-b-0 md:border-r"
                  aria-labelledby="work-modal-title"
                >
                  <div className="grid h-full min-h-0 grid-rows-[minmax(0,2.5fr)_minmax(0,2.5fr)]">
                    <div className="relative min-h-0 w-full overflow-hidden bg-primary/5">
                      {selectedWork.imageUrl ? (
                        <Image
                          src={selectedWork.imageUrl}
                          alt={pick(selectedWork.title, selectedWork.titleBn)}
                          fill
                          sizes="(max-width: 767px) 100vw, 50vw"
                          className="object-cover object-center"
                          priority
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-primary/40">
                          <Briefcase className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24" aria-hidden="true" />
                        </div>
                      )}

                      <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1.5 text-[8px] font-black uppercase tracking-[.18em] text-primary shadow-sm backdrop-blur-sm sm:left-4 sm:top-4">
                        {pick(selectedWork.category, selectedWork.categoryBn)}
                      </span>
                    </div>

                    <div className="flex flex-col justify-around min-h-0 overflow-hidden bg-background p-2 sm:p-4">
                      <h3 className="hidden sm:inline text-lg font-bold text-foreground sm:text-xl md:text-2xl">
                        {pick(selectedWork.title, selectedWork.titleBn)}
                      </h3>
                      <p className="line-clamp-3 text-[13px] leading-5 text-muted-strong sm:leading-5 md:line-clamp-4">
                        {pick(selectedWork.description, selectedWork.descriptionBn)}
                      </p>

                      <div className="grid min-w-0 grid-cols-2 gap-4 text-[11px]">
                        <div className="min-w-0">
                          <p className="font-bold uppercase tracking-widest text-muted">{t("clientRole")}</p>
                          <p className="mt-0.5 truncate font-semibold text-foreground">{selectedWork.clientName || "—"}</p>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold uppercase tracking-widest text-muted">Location</p>
                          <p className="mt-0.5 truncate font-semibold text-foreground">{selectedWork.location || "Bangladesh"}</p>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold uppercase tracking-widest text-muted">Year</p>
                          <p className="mt-0.5 font-semibold text-foreground">{selectedWork.year || "—"}</p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[8px] font-black uppercase tracking-[.18em] text-muted">Current work rating</p>
                          <div className="mt-1 flex min-w-0 items-center gap-2">
                            <span className="text-xl font-black leading-none text-foreground sm:text-2xl">
                              {reviewStats.rated.length ? reviewStats.average.toFixed(1) : "—"}
                            </span>
                            <div className="min-w-0">
                              <RatingStars rating={reviewStats.average} />
                              <p className="mt-0.5 truncate text-[9px] text-muted">
                                {reviewStats.rated.length
                                  ? `${reviewStats.rated.length} review${reviewStats.rated.length === 1 ? "" : "s"}`
                                  : "No ratings yet"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section
                  className="grid min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-surface/35"
                  aria-labelledby="related-reviews-title"
                >
                  <div className="z-10 shrink-0 border-b border-border bg-background/95 p-3 backdrop-blur-xl sm:p-4 md:p-5">
                    <section
                      aria-labelledby="related-reviews-title"
                    >
                      <div className="flex w-full min-w-0 items-center justify-between mx-auto">
                        <div className="flex items-center gap-2">
                          <Star
                            className="h-4 w-4 fill-current text-rd-amber"
                            aria-hidden="true"
                          />

                          <h4
                            id="related-reviews-title"
                            className="text-sm font-black uppercase text-foreground"
                          >
                            {t("relatedReviews")}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={startNewReview}
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary p-2 text-[10px] font-black text-primary-foreground transition hover:bg-primary/10 hover:cursor-pointer hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        >
                          {managedReview ? <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> : <Send className="h-3.5 w-3.5" aria-hidden="true" />}
                          <span className="hidden sm:inline">
                            {managedReview ? "Edit your review" : "Write a review"}
                          </span>
                          <span className="sm:hidden">
                            {managedReview ? "Edit" : "Review"}
                          </span>
                        </button>
                      </div>
                    </section>
                  </div>

                  {/* Scrollable form/review area */}
                  <div
                    ref={reviewContentRef}
                  className="min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-4 md:p-5"
                >
                  {reviewOpen ? (
                    <form
                      id="review-form"
                      ref={reviewFormRef}
                      onSubmit={submitReview}
                      noValidate
                      className="rounded-2xl border border-primary/30 bg-primary/[0.03] p-4 shadow-sm ring-2 ring-primary/10 sm:p-5"
                    >
                      <input
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                        value={reviewHoneypot}
                        onChange={(event) =>
                          setReviewHoneypot(
                            event.target.value,
                          )
                        }
                        className="absolute left-[-10000px] h-px w-px overflow-hidden opacity-0"
                      />

                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="text-sm font-black text-foreground">
                            {editingReviewId
                              ? "Update your review"
                              : "Share your experience"}
                          </h4>

                          <p className="mt-1 text-[10px] leading-4 text-muted">
                            Your email stays private.
                            New or edited reviews are
                            reviewed before they become
                            public.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={closeReviewForm}
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border text-muted-strong hover:text-foreground"
                          aria-label="Close review form"
                        >
                          <X
                            className="h-4 w-4"
                            aria-hidden="true"
                          />
                        </button>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <label className="admin-label">
                          <span>Name</span>

                          <input
                            ref={reviewNameRef}
                            className={`admin-input ${
                              reviewErrors.name
                                ? "border-rd-red focus:border-rd-red focus:ring-rd-red/10"
                                : ""
                            }`}
                            value={reviewForm.name}
                            onChange={(event) =>
                              setFormField(
                                "name",
                                event.target.value,
                              )
                            }
                            autoComplete="name"
                            aria-invalid={Boolean(
                              reviewErrors.name,
                            )}
                            aria-describedby={
                              reviewErrors.name
                                ? "review-name-error"
                                : undefined
                            }
                          />

                          <FieldError id="review-name-error">
                            {reviewErrors.name}
                          </FieldError>
                        </label>

                        <label className="admin-label">
                          <span>
                            Email (private)
                            {editingReviewId
                              ? " · fixed for this review"
                              : ""}
                          </span>

                          <input
                            ref={reviewEmailRef}
                            type="email"
                            className={`admin-input ${
                              reviewErrors.email
                                ? "border-rd-red focus:border-rd-red focus:ring-rd-red/10"
                                : ""
                            }`}
                            value={reviewForm.email}
                            onChange={(event) =>
                              setFormField(
                                "email",
                                event.target.value,
                              )
                            }
                            autoComplete="email"
                            disabled={Boolean(
                              editingReviewId,
                            )}
                            aria-invalid={Boolean(
                              reviewErrors.email,
                            )}
                            aria-describedby={
                              editingReviewId
                                ? "review-email-note"
                                : reviewErrors.email
                                  ? "review-email-error"
                                  : undefined
                            }
                          />

                          {editingReviewId ? (
                            <p
                              id="review-email-note"
                              className="mt-1 text-[9px] leading-4 text-muted"
                            >
                              This email identifies your
                              review for this work and
                              cannot be changed.
                            </p>
                          ) : null}

                          <FieldError id="review-email-error">
                            {reviewErrors.email}
                          </FieldError>
                        </label>
                      </div>

                      <div className="mt-4">
                        <span className="admin-label">
                          <span>Rating</span>
                        </span>

                        <div
                          className="mt-1"
                          aria-invalid={Boolean(
                            reviewErrors.rating,
                          )}
                          aria-describedby={
                            reviewErrors.rating
                              ? "review-rating-error"
                              : undefined
                          }
                        >
                          <RatingStars
                            rating={reviewForm.rating}
                            interactive
                            hasError={Boolean(
                              reviewErrors.rating,
                            )}
                            onChange={(rating) =>
                              setFormField(
                                "rating",
                                rating,
                              )
                            }
                          />
                        </div>

                        <FieldError id="review-rating-error">
                          {reviewErrors.rating}
                        </FieldError>
                      </div>

                      <label className="admin-label mt-4">
                        <span>Your review</span>

                        <textarea
                          ref={reviewTextRef}
                          className={`admin-textarea min-h-28 ${
                            reviewErrors.text
                              ? "border-rd-red focus:border-rd-red focus:ring-rd-red/10"
                              : ""
                          }`}
                          value={reviewForm.text}
                          onChange={(event) =>
                            setFormField(
                              "text",
                              event.target.value,
                            )
                          }
                          maxLength={1500}
                          placeholder="Tell future clients what you thought about the work…"
                          aria-invalid={Boolean(
                            reviewErrors.text,
                          )}
                          aria-describedby={
                            reviewErrors.text
                              ? "review-text-error"
                              : undefined
                          }
                        />

                        <div className="mt-1 flex items-start justify-between gap-2">
                          <FieldError id="review-text-error">
                            {reviewErrors.text}
                          </FieldError>

                          <span className="ml-auto shrink-0 text-[9px] text-muted">
                            {reviewForm.text.length}/1500
                          </span>
                        </div>
                      </label>

                      <div className="mt-4">
                        <PublicFormConsent
                          consent={reviewConsent}
                          onConsentChange={(value) => {
                            setReviewConsent(value);
                            if (value) {
                              clearFieldError(
                                "consent",
                              );
                              setReviewMessage(null);
                            }
                          }}
                          draft={reviewForm}
                          draftKey={`${REVIEW_DRAFT_PREFIX}${selectedWork.id}`}
                          returnTo={() =>
                            `${window.location.pathname}?reviewWork=${selectedWork.id}`
                          }
                          disabled={Boolean(
                            reviewAction,
                          )}
                          compact
                        />

                        <FieldError>
                          {reviewErrors.consent}
                        </FieldError>
                      </div>

                      <div className="mt-4 flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-1 text-[9px] text-muted">
                          <ShieldCheck
                            className="h-3.5 w-3.5 shrink-0"
                            aria-hidden="true"
                          />
                          <span>
                            Secure owner access on this
                            device
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={closeReviewForm}
                            className="rounded-lg border border-border px-3 py-2 text-[10px] font-bold text-muted-strong"
                          >
                            Cancel
                          </button>

                          {reviewMessage && (
                            <p
                              role={
                                reviewMessage.ok
                                  ? "status"
                                  : "alert"
                              }
                              className={`max-w-[18rem] rounded-lg px-2.5 py-2 text-[9px] font-semibold leading-4 ${
                                reviewMessage.ok
                                  ? "bg-rd-green/10 text-rd-green"
                                  : "bg-rd-red/10 text-rd-red"
                              }`}
                            >
                              {reviewMessage.text}
                            </p>
                          )}

                          <button
                            type="submit"
                            disabled={Boolean(
                              reviewAction,
                            )}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-[10px] font-black text-primary-foreground disabled:opacity-60 hover:bg-primary/90 hover:cursor-pointer"
                          >
                            {reviewAction ===
                            "create" ||
                            reviewAction ===
                            "update" ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}

                            {reviewAction === "update"
                              ? "Updating…"
                              : reviewAction ===
                                  "create"
                                ? "Submitting…"
                                : editingReviewId
                                  ? "Update review"
                                  : "Submit review"}
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <>
                      {reviewMessage && (
                        <div
                          role={
                            reviewMessage.ok
                              ? "status"
                              : "alert"
                          }
                          className={`mt-3 rounded-lg px-3 py-2 text-[10px] font-semibold ${
                            reviewMessage.ok
                              ? "bg-rd-green/10 text-rd-green"
                              : "bg-rd-red/10 text-rd-red"
                          }`}
                        >
                          {reviewMessage.text}
                        </div>
                      )}

                      {reviewsLoading ? (
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {[1, 2, 3, 4].map(
                            (item) => (
                              <div
                                key={item}
                                className="h-35 animate-pulse rounded-2xl border border-border bg-background/70"
                              />
                            ),
                          )}
                        </div>
                      ) : reviewStats.published.length ? (
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {reviewStats.published.map(
                            (review) => {
                              const reviewText =
                                language === "bn"
                                  ? review.textBn ||
                                    review.textEn
                                  : review.textEn;

                              const role =
                                language === "bn"
                                  ? review.roleBn ||
                                    review.role ||
                                    t("clientRole")
                                  : review.role ||
                                    t("clientRole");

                              const pending =
                                review.source ===
                                  "user" &&
                                !review.isPublic;

                              return (
                                <article
                                  key={`${review.source ?? "admin"}-${review.id}`}
                                  className={`glass-card flex min-h-38 flex-col justify-between overflow-hidden p-4 sm:p-5 ${
                                    pending
                                      ? "border-dashed border-primary/40"
                                      : ""
                                  }`}
                                >
                                  <div>
                                    <div className="mb-2 flex items-center justify-between gap-2">
                                      <RatingStars
                                        rating={
                                          Number(
                                            review.rating,
                                          ) || 0
                                        }
                                      />

                                      <span
                                        className={`text-[8px] font-black uppercase tracking-widest ${
                                          pending
                                            ? "text-primary"
                                            : "text-muted"
                                        }`}
                                      >
                                        {pending
                                          ? "Awaiting moderation"
                                          : review.source ===
                                              "user"
                                            ? "Website review"
                                            : "Client review"}
                                      </span>
                                    </div>

                                    <p className="line-clamp-5 text-sm leading-6 text-muted-strong">
                                      &ldquo;
                                      {reviewText}
                                      &rdquo;
                                    </p>
                                  </div>

                                  <div className="mt-4 flex items-end justify-between gap-2 border-t border-border pt-3">
                                    <div className="min-w-0">
                                      <p className="truncate text-xs font-black text-foreground">
                                        {review.name}
                                      </p>

                                      <p className="mt-1 truncate text-[10px] uppercase tracking-widest text-muted">
                                        {role}
                                      </p>
                                    </div>

                                    {review.canManage ? (
                                      <div className="flex gap-1">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            startEdit(
                                              review,
                                            )
                                          }
                                          className="grid h-7 w-7 place-items-center rounded-md border border-border text-muted-strong hover:border-primary hover:text-primary"
                                          aria-label="Edit your review"
                                        >
                                          <Pencil
                                            className="h-3.5 w-3.5"
                                            aria-hidden="true"
                                          />
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            setDeleteId(
                                              review.id,
                                            )
                                          }
                                          className="grid h-7 w-7 place-items-center rounded-md border border-border text-muted-strong hover:border-rd-red/40 hover:text-rd-red"
                                          aria-label="Delete your review"
                                        >
                                          <Trash2
                                            className="h-3.5 w-3.5"
                                            aria-hidden="true"
                                          />
                                        </button>
                                      </div>
                                    ) : null}
                                  </div>

                                  {deleteId ===
                                  review.id ? (
                                    <div className="mt-2 flex items-center gap-2 rounded-lg bg-rd-red/10 p-2 text-[9px] font-bold text-rd-red">
                                      <span className="min-w-0 flex-1">
                                        Delete this review?
                                      </span>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          void deleteReview(
                                            review.id,
                                          )
                                        }
                                        className="rounded-md bg-rd-red px-2 py-1 text-white"
                                        disabled={
                                          reviewAction ===
                                          `delete:${review.id}`
                                        }
                                      >
                                        {reviewAction ===
                                        `delete:${review.id}`
                                          ? "Deleting…"
                                          : "Delete"}
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          setDeleteId(
                                            null,
                                          )
                                        }
                                        className="rounded-md border border-border bg-background px-2 py-1 text-muted-strong"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : null}
                                </article>
                              );
                            },
                          )}
                        </div>
                      ) : (
                        <div className="mt-4 rounded-xl border border-dashed border-border bg-surface p-4 text-xs text-muted">
                          No published reviews yet. Be the
                          first to share your experience.
                        </div>
                      )}

                      {!reviewOpen && managedReview ? (
                        <div className="mt-4 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-[10px] text-muted">
                          <UserRound
                            className="h-4 w-4 shrink-0 text-primary"
                            aria-hidden="true"
                          />
                          <span>
                            You already reviewed this work.
                            You can edit your existing review;
                            another review for the same work
                            is not permitted.
                          </span>
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
                </section>
              </div>
            </div>
          </article>
        )}
      </ContentDetailModal>
    </section>
  );
}
