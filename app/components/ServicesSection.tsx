"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ArrowUpRight, Briefcase } from "lucide-react";
import { localizeService } from "@/app/data/services";
import type { ServiceAccent } from "@/app/types/rong-dhonu";
import { useLanguage } from "./LanguageContext";
import { useLazyPublicData } from "./useLazyPublicData";
import type { CmsService } from "@/app/types/public-cms";
import ContentDetailModal from "./ContentDetailModal";

const ACCENT_STYLES: Record<
  ServiceAccent,
  {
    border: string;
    bar: string;
    text: string;
  }
> = {
  red: {
    border: "border-rd-red/30 hover:border-rd-red",
    bar: "bg-rd-red",
    text: "text-rd-red",
  },
  orange: {
    border: "border-rd-orange/30 hover:border-rd-orange",
    bar: "bg-rd-orange",
    text: "text-rd-orange",
  },
  amber: {
    border: "border-rd-amber/30 hover:border-rd-amber",
    bar: "bg-rd-amber",
    text: "text-rd-amber",
  },
  green: {
    border: "border-rd-green/30 hover:border-rd-green",
    bar: "bg-rd-green",
    text: "text-rd-green",
  },
  teal: {
    border: "border-rd-teal/30 hover:border-rd-teal",
    bar: "bg-rd-teal",
    text: "text-rd-teal",
  },
  blue: {
    border: "border-rd-blue/30 hover:border-rd-blue",
    bar: "bg-rd-blue",
    text: "text-rd-blue",
  },
  purple: {
    border: "border-rd-purple/30 hover:border-rd-purple",
    bar: "bg-rd-purple",
    text: "text-rd-purple",
  },
  pink: {
    border: "border-rd-pink/30 hover:border-rd-pink",
    bar: "bg-rd-pink",
    text: "text-rd-pink",
  },
};

const KNOWN_ACCENTS = new Set<ServiceAccent>([
  "red",
  "orange",
  "amber",
  "green",
  "teal",
  "blue",
  "purple",
  "pink",
]);

const ALL = "__all__";

export default function ServicesSection() {
  const [category, setCategory] = useState(ALL);
  const [selectedService, setSelectedService] =
    useState<CmsService | null>(null);

  const { t, language, pick } = useLanguage();

  const {
    ref,
    data,
    loading,
    error,
  } = useLazyPublicData<{ services: CmsService[] }>(
    "/api/public/services",
  );

  const rawServices = data?.services ?? [];

  const allServices = useMemo(
    () =>
      rawServices.map((service) => ({
        ...service,
        accent: (
          KNOWN_ACCENTS.has(
            service.accent as ServiceAccent,
          )
            ? service.accent
            : "red"
        ) as ServiceAccent,
      })),
    [rawServices],
  );

  const categories = useMemo(() => {
    const seen = new Map<string, string>();

    for (const service of allServices) {
      if (!seen.has(service.category)) {
        seen.set(
          service.category,
          localizeService(service, language).category,
        );
      }
    }

    return Array.from(
      seen,
      ([value, label]) => ({
        value,
        label,
      }),
    );
  }, [allServices, language]);

  const services = useMemo(
    () =>
      allServices.filter(
        (service) =>
          category === ALL ||
          service.category === category,
      ),
    [category, allServices],
  );

  const closeModal = () => {
    setSelectedService(null);
  };

  return (
    <section
      ref={ref}
      className="bg-background py-7 sm:py-10"
      aria-labelledby="services-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6">
        {/* Section heading */}
        <div className="mb-7 max-w-3xl">
          <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
            <div className="h-px w-8 bg-rainbow sm:w-12" />

            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-primary sm:text-xs sm:tracking-[0.4em]">
              {t("ourServices")}
            </span>
          </div>

          <h2
            id="services-title"
            className="h2-fluid title-scroll-fx font-black uppercase leading-[1.05] text-foreground"
          >
            {t("finishesTransform")}
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-muted sm:mt-4 sm:text-base">
            {t("servicesIntro")}
          </p>
        </div>

        {/* Loading */}
        {loading || !data ? (
          <div
            className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
            aria-label={t("loadingSite")}
          >
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-82.5 animate-pulse rounded-2xl border border-border bg-surface"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-border bg-surface p-5 text-sm text-muted">
            {error}
          </div>
        ) : (
          <>
            {/* Category filters */}
            <div className="mb-5 flex gap-2 overflow-x-auto pb-2 sm:mb-7 sm:flex-wrap sm:overflow-visible">
              {[
                {
                  value: ALL,
                  label: t("all"),
                },
                ...categories,
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() =>
                    setCategory(item.value)
                  }
                  className={`
                    chip
                    flex
                    min-h-11
                    shrink-0
                    items-center
                    border
                    px-3.5
                    py-2
                    text-[9px]
                    font-black
                    uppercase
                    tracking-wider
                    transition-colors
                    sm:px-4
                    sm:text-xs
                    ${
                      category === item.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted hover:border-primary hover:text-primary"
                    }
                  `}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Services */}
            <div
              className="
                flex
                gap-3
                overflow-x-auto
                pb-2
                snap-x
                snap-mandatory
                sm:grid
                sm:grid-cols-2
                sm:gap-4
                sm:overflow-visible
                sm:pb-0
                lg:grid-cols-3
              "
            >
              {services.map((service) => {
                const accent =
                  ACCENT_STYLES[service.accent];

                const text = localizeService(
                  service,
                  language,
                );

                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() =>
                      setSelectedService(service)
                    }
                    className={`
                      swatch-card
                      group
                      relative
                      flex
                      min-w-[84vw]
                      snap-start
                      flex-col
                      overflow-hidden
                      p-0
                      text-left
                      transition
                      duration-200
                      hover:-translate-y-0.5
                      focus:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-primary
                      focus-visible:ring-offset-2
                      sm:min-w-0
                      ${accent.border}
                    `}
                    aria-label={`${t(
                      "viewDetails",
                    )}: ${text.name}`}
                  >
                    {/* Fixed image area */}
                    <div
                      className="
                        relative
                        h-43.75
                        w-full
                        shrink-0
                        overflow-hidden
                        bg-primary/5
                      "
                    >
                      {service.imageUrl ? (
                        <Image
                          src={service.imageUrl}
                          alt={text.name}
                          fill
                          sizes="
                            (max-width: 639px) 84vw,
                            (max-width: 1023px) 50vw,
                            33vw
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
                        <div className="grid h-full w-full place-items-center text-primary/30">
                          <Briefcase
                            className="h-10 w-10"
                            aria-hidden="true"
                          />
                        </div>
                      )}

                      {/* Accent bar */}
                      <div
                        className={`
                          absolute
                          left-0
                          top-0
                          z-10
                          h-1
                          w-full
                          rounded-t-[1.25rem]
                          ${accent.bar}
                        `}
                      />

                      {/* Category */}
                      <span
                        className="
                          absolute
                          bottom-3
                          left-3
                          z-10
                          rounded-sm
                          border
                          border-white/20
                          bg-background/90
                          px-2
                          py-1
                          text-[8px]
                          font-bold
                          uppercase
                          tracking-wider
                          text-muted
                          backdrop-blur-sm
                        "
                      >
                        {text.category}
                      </span>
                    </div>

                    {/* Card content */}
                    <div className="flex min-h-42.5 flex-1 flex-col p-4 sm:p-5">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <h3 className="min-w-0 flex-1 text-lg font-black leading-tight text-foreground sm:text-xl">
                          {text.name}
                        </h3>

                        <ArrowUpRight
                          className={`
                            mt-0.5
                            h-4
                            w-4
                            shrink-0
                            transition-transform
                            duration-200
                            group-hover:translate-x-0.5
                            group-hover:-translate-y-0.5
                            ${accent.text}
                          `}
                          aria-hidden="true"
                        />
                      </div>

                      <p className="line-clamp-4 text-xs leading-relaxed text-muted sm:text-sm">
                        {text.description}
                      </p>

                      <div className="mt-auto border-t border-border pt-3">
                        <span className="text-[8px] font-black uppercase tracking-widest text-muted sm:text-[9px]">
                          {t("bestFor")}
                        </span>

                        <p className="mt-1 line-clamp-2 text-xs font-bold text-muted-strong">
                          {text.bestFor}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Service detail modal */}
      <ContentDetailModal
        open={Boolean(selectedService)}
        title={
          selectedService
            ? localizeService(
                selectedService,
                language,
              ).name
            : ""
        }
        onClose={closeModal}
        labelledById="service-modal-title"
      >
        {selectedService && (
          <ServiceDetail
            service={selectedService}
            language={language}
            t={t} pick={function (en: string | null | undefined, bn: string | null | undefined): string {
              throw new Error("Function not implemented.");
            } }          />
        )}
      </ContentDetailModal>
    </section>
  );
}

function ServiceDetail({
  service,
  language,
  pick,
  t,
}: {
  service: CmsService;
  language: "en" | "bn";
  pick: (
    en: string | null | undefined,
    bn: string | null | undefined,
  ) => string;
  t: (key: string) => string;
}) {
  const accent =
    ACCENT_STYLES[
      KNOWN_ACCENTS.has(
        service.accent as ServiceAccent,
      )
        ? (service.accent as ServiceAccent)
        : "red"
    ];

  const text = localizeService(
    service,
    language,
  );

  return (
    <article className="min-w-0">
      {/* Hero image */}
      <div
        className="
          relative
          h-55
          w-full
          overflow-hidden
          bg-primary/5
          sm:h-75
          md:h-95
        "
      >
        {service.imageUrl ? (
          <Image
            src={service.imageUrl}
            alt={text.name}
            fill
            sizes="(max-width: 767px) 100vw, 900px"
            priority
            className="object-cover object-center"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-primary/30">
            <Briefcase
              className="h-14 w-14"
              aria-hidden="true"
            />
          </div>
        )}

        <div
          className={`absolute inset-x-0 bottom-0 h-1 ${accent.bar}`}
        />
      </div>

      {/* Details */}
      <div className="p-5 sm:p-7 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span
              className={`
                inline-flex
                rounded-sm
                border
                border-border
                px-2
                py-1
                text-[8px]
                font-black
                uppercase
                tracking-wider
                ${accent.text}
              `}
            >
              {text.category}
            </span>

            <h3
              id="service-modal-title"
              className="
                mt-3
                text-2xl
                font-black
                leading-tight
                text-foreground
                sm:text-3xl
              "
            >
              {text.name}
            </h3>
          </div>

          <ArrowUpRight
            className={`
              mt-1
              h-5
              w-5
              shrink-0
              ${accent.text}
            `}
            aria-hidden="true"
          />
        </div>

        <p className="mt-5 text-sm leading-7 text-muted-strong sm:text-base">
          {text.description}
        </p>

        {/* Best for */}
        <div className="mt-6 border-t border-border pt-5">
          <span className="text-[9px] font-black uppercase tracking-[0.18em] text-muted">
            {t("bestFor")}
          </span>

          <p className="mt-2 text-sm font-bold leading-6 text-foreground">
            {text.bestFor}
          </p>
        </div>

        {/* Additional service information */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface/60 p-4">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted">
              {text.category}
            </span>

            <p className="mt-1 text-sm font-bold text-foreground">
              {text.name}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface/60 p-4">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted">
              {t("bestFor")}
            </span>

            <p className="mt-1 text-sm font-bold text-foreground">
              {text.bestFor}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
