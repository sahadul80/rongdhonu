"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowUpRight,
  Briefcase,
  MapPin,
  Star,
} from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { useLazyPublicData } from "./useLazyPublicData";
import type {
  CmsReview,
  CmsWork,
} from "@/app/types/public-cms";
import ContentDetailModal from "./ContentDetailModal";
import Image from "next/image";

type ReviewWithRating = CmsReview & {
  rating?: number | null;
};

function getReviewRating(review: CmsReview): number | null {
  const value = (review as ReviewWithRating).rating;

  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return Math.min(5, Math.max(0, value));
}

function ReviewRating({
  rating,
}: {
  rating: number | null;
}) {
  if (rating === null) return null;

  const roundedRating = Math.round(rating);

  return (
    <div
      className="flex items-center gap-1"
      aria-label={`${rating} out of 5 stars`}
    >
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3.5 w-3.5 ${
              star <= roundedRating
                ? "fill-current text-rd-amber"
                : "text-muted/30"
            }`}
            aria-hidden="true"
          />
        ))}
      </div>

      <span className="text-[10px] font-bold text-muted">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export default function WorkSection() {
  const {
    data: workData,
    loading,
    error,
    ref,
  } = useLazyPublicData<{ work: CmsWork[] }>(
    "/api/public/work",
  );

  const { language, pick, t } = useLanguage();

  const work = workData?.work ?? [];

  const [selectedWork, setSelectedWork] =
    useState<CmsWork | null>(null);

  const [relatedReviews, setRelatedReviews] =
    useState<CmsReview[]>([]);

  const [reviewsLoading, setReviewsLoading] =
    useState(false);

  const closeModal = useCallback(() => {
    setSelectedWork(null);
  }, []);

  useEffect(() => {
    if (!selectedWork) {
      setRelatedReviews([]);
      setReviewsLoading(false);
      return;
    }

    let cancelled = false;

    setReviewsLoading(true);

    fetch(
      `/api/public/work/${selectedWork.id}/reviews`,
      {},
    )
      .then(async (response) => ({
        ok: response.ok,
        data: (await response.json()) as {
          reviews?: CmsReview[];
        },
      }))
      .then(({ ok, data }) => {
        if (cancelled) return;

        setRelatedReviews(
          ok && Array.isArray(data.reviews)
            ? data.reviews
            : [],
        );
      })
      .catch(() => {
        if (cancelled) return;

        setRelatedReviews([]);
      })
      .finally(() => {
        if (cancelled) return;

        setReviewsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedWork]);

  return (
    <section
      ref={ref}
      className="bg-surface p-2 sm:p-4"
      aria-labelledby="work-title"
    >
      <div className="mx-auto max-w-dvw p-2">
        {/* Section heading */}
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-px w-8 bg-rainbow sm:w-12" />

              <span
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.22em]
                  text-primary
                  sm:text-xs
                "
              >
                {t("work")}
              </span>
            </div>

            <h2
              id="work-title"
              className="
                h2-fluid
                font-black
                uppercase
                leading-tight
                text-foreground
              "
            >
              {t("selectedWork")}
            </h2>

            <p
              className="
                mt-3
                max-w-2xl
                text-sm
                leading-relaxed
                text-muted
              "
            >
              {t("workIntro")}
            </p>
          </div>
        </div>

        {/* Work content */}
        {loading || !workData ? (
          <div
            className="
              mt-4
              grid
              grid-cols-1
              gap-3
              sm:grid-cols-2
              lg:grid-cols-4
            "
            aria-label={t("loadingSite")}
          >
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="
                  h-70
                  w-full
                  animate-pulse
                  rounded-2xl
                  border
                  border-border
                  bg-background
                "
              />
            ))}
          </div>
        ) : error ? (
          <div
            className="
              mt-4
              rounded-2xl
              border
              border-border
              bg-background
              p-5
              text-sm
              text-muted
            "
          >
            {error}
          </div>
        ) : work.length === 0 ? null : (
          <div
            className="
              mobile-swipe-rail
              mt-4
              items-stretch
              sm:grid
              sm:grid-cols-3
              sm:gap-2
              sm:overflow-visible
              sm:pb-0
              lg:grid
              lg:grid-cols-4
              lg:gap-3
              lg:overflow-visible
              lg:pb-0
            "
          >
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
                  className="
                    glass-card
                    group
                    flex
                    h-70
                    w-65
                    shrink-0
                    flex-col
                    overflow-hidden
                    text-left
                    transition
                    duration-200
                    hover:-translate-y-0.5
                    focus:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-primary
                    focus-visible:ring-offset-2
                    sm:w-70
                    lg:h-70
                    lg:w-auto
                    lg:min-w-0
                  "
                  aria-label={`${t(
                    "viewDetails",
                  )}: ${title}`}
                >
                  {/* Card image */}
                  <div
                    className="
                      relative
                      h-45
                      w-full
                      shrink-0
                      overflow-hidden
                      bg-primary/5
                    "
                  >
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={title}
                        fill
                        sizes="
                          (max-width: 639px) 260px,
                          (max-width: 1023px) 280px,
                          25vw
                        "
                        loading="lazy"
                        className="
                          object-cover
                          object-center
                          transition-transform
                          duration-300
                          group-hover:scale-[1.02]
                        "
                      />
                    ) : (
                      <div
                        className="
                          grid
                          h-full
                          w-full
                          place-items-center
                          text-primary/50
                        "
                      >
                        <Briefcase
                          className="h-10 w-10"
                          aria-hidden="true"
                        />
                      </div>
                    )}

                    <span
                      className="
                        absolute
                        left-3
                        top-3
                        z-10
                        rounded-full
                        bg-background/90
                        px-2.5
                        py-1
                        text-[9px]
                        font-black
                        uppercase
                        tracking-widest
                        text-primary
                        backdrop-blur-sm
                      "
                    >
                      {category}
                    </span>
                  </div>

                  {/* Card information */}
                  <div
                    className="
                      flex
                      min-h-0
                      flex-1
                      flex-col
                      justify-center
                      overflow-hidden
                      p-3
                      sm:p-4
                    "
                  >
                    <div
                      className="
                        flex
                        min-w-0
                        items-start
                        justify-between
                        gap-3
                      "
                    >
                      <div className="min-w-0 flex-1">
                        <h3
                          className="
                            line-clamp-2
                            min-h-10
                            text-sm
                            font-black
                            leading-5
                            text-foreground
                            sm:text-base
                          "
                        >
                          {title}
                        </h3>

                        <p
                          className="
                            mt-1
                            flex
                            items-center
                            gap-1
                            truncate
                            text-[10px]
                            text-muted
                          "
                        >
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
                        className="
                          mt-0.5
                          h-4
                          w-4
                          shrink-0
                          text-primary
                        "
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

      {/* Work detail modal */}
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
            {/* Work overview */}
            <div
              className="
                grid
                min-w-0
                md:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)]
              "
            >
              {/* Modal image */}
              <div
                className="
                  relative
                  h-55
                  w-full
                  overflow-hidden
                  bg-primary/5
                  sm:h-70
                  md:h-95
                "
              >
                {selectedWork.imageUrl ? (
                  <Image
                    src={selectedWork.imageUrl}
                    alt={pick(
                      selectedWork.title,
                      selectedWork.titleBn,
                    )}
                    fill
                    sizes="
                      (max-width: 767px) 100vw,
                      55vw
                    "
                    className="
                      object-cover
                      object-center
                    "
                    priority
                  />
                ) : (
                  <div
                    className="
                      grid
                      h-full
                      w-full
                      place-items-center
                      text-primary/40
                    "
                  >
                    <Briefcase
                      className="h-14 w-14"
                      aria-hidden="true"
                    />
                  </div>
                )}
              </div>

              {/* Work details */}
              <div
                className="
                  flex
                  min-w-0
                  flex-col
                  justify-center
                  p-5
                  sm:p-6
                  md:p-8
                "
              >
                <span
                  className="
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[.2em]
                    text-primary
                  "
                >
                  {pick(
                    selectedWork.category,
                    selectedWork.categoryBn,
                  )}
                </span>

                <h3
                  id="work-modal-title"
                  className="
                    mt-2
                    text-2xl
                    font-black
                    leading-tight
                    text-foreground
                    sm:text-3xl
                  "
                >
                  {pick(
                    selectedWork.title,
                    selectedWork.titleBn,
                  )}
                </h3>

                <p
                  className="
                    mt-4
                    text-sm
                    leading-7
                    text-muted-strong
                  "
                >
                  {pick(
                    selectedWork.description,
                    selectedWork.descriptionBn,
                  )}
                </p>

                <div
                  className="
                    mt-6
                    grid
                    grid-cols-2
                    gap-3
                    border-t
                    border-border
                    pt-5
                    text-xs
                    text-muted
                  "
                >
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted">
                      {t("clientRole")}
                    </p>
                    <p className="mt-1 truncate text-foreground">
                      {selectedWork.clientName ||
                        t("clientRole")}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted">
                      Location
                    </p>
                    <p className="mt-1 truncate text-foreground">
                      {selectedWork.location ||
                        "Bangladesh"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted">
                      Year
                    </p>
                    <p className="mt-1 text-foreground">
                      {selectedWork.year || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Related reviews */}
            <section
              className="
                border-t
                border-border
                bg-surface/40
                p-5
                sm:p-6
                md:p-7
              "
              aria-labelledby="related-reviews-title"
            >
              <div
                className="
                  mb-4
                  flex
                  items-center
                  justify-between
                  gap-3
                "
              >
                <div className="flex items-center gap-2">
                  <Star
                    className="
                      h-4
                      w-4
                      fill-current
                      text-rd-amber
                    "
                    aria-hidden="true"
                  />

                  <h4
                    id="related-reviews-title"
                    className="
                      text-sm
                      font-black
                      uppercase
                      text-foreground
                    "
                  >
                    {t("relatedReviews")}
                  </h4>
                </div>

                {relatedReviews.length > 0 && (
                  <span className="text-[10px] text-muted">
                    {relatedReviews.length} review
                    {relatedReviews.length === 1
                      ? ""
                      : "s"}
                  </span>
                )}
              </div>

              {reviewsLoading ? (
                <div className="flex gap-3 overflow-hidden">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="
                        h-32
                        min-w-65
                        animate-pulse
                        rounded-2xl
                        border
                        border-border
                        bg-background/70
                      "
                    />
                  ))}
                </div>
              ) : relatedReviews.length ? (
                <div
                  className="
                    flex
                    gap-3
                    overflow-x-auto
                    overscroll-contain
                    pb-2
                    [scrollbar-width:thin]
                  "
                >
                  {relatedReviews.map((review) => {
                    const reviewRating =
                      getReviewRating(review);

                    const reviewText =
                      language === "bn"
                        ? review.textBn ||
                          review.textEn
                        : review.textEn;

                    const reviewRole =
                      language === "bn"
                        ? review.roleBn ||
                          review.role ||
                          t("clientRole")
                        : review.role ||
                          t("clientRole");

                    return (
                      <article
                        key={review.id}
                        className="
                          glass-card
                          flex
                          min-h-37.5
                          w-72.5
                          min-w-72.5
                          shrink-0
                          flex-col
                          justify-between
                          overflow-hidden
                          p-4
                          sm:w-[320px]
                          sm:min-w-[320px]
                          sm:p-5
                        "
                      >
                        <div>
                          <div
                            className="
                              mb-3
                              flex
                              items-center
                              justify-between
                              gap-3
                            "
                          >
                            <ReviewRating
                              rating={reviewRating}
                            />

                            {reviewRating === null && (
                              <div
                                className="
                                  text-[9px]
                                  font-bold
                                  uppercase
                                  tracking-wider
                                  text-muted
                                "
                              >
                                Client review
                              </div>
                            )}
                          </div>

                          <p
                            className="
                              line-clamp-4
                              text-sm
                              leading-6
                              text-muted-strong
                            "
                          >
                            &ldquo;{reviewText}&rdquo;
                          </p>
                        </div>

                        <div className="mt-4 border-t border-border pt-3">
                          <p className="truncate text-xs font-black text-foreground">
                            {review.name}
                          </p>

                          <p
                            className="
                              mt-1
                              truncate
                              text-[10px]
                              uppercase
                              tracking-widest
                              text-muted
                            "
                          >
                            {reviewRole}
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted">
                  {t("noRelatedReviews")}
                </p>
              )}
            </section>
          </article>
        )}
      </ContentDetailModal>
    </section>
  );
}