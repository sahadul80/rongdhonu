"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { localizedProcessLabel } from "@/app/data/process-labels";
import { useLazyPublicData } from "./useLazyPublicData";
import type { CmsHeroImage } from "@/app/types/public-cms";

const ACCENT_TEXT = ["text-rd-red", "text-rd-amber", "text-rd-green", "text-rd-blue", "text-rd-purple"] as const;
const STEP_DURATION_MS = 4000;


export default function ProcessSection() {
  const { t, language, n } = useLanguage();
  const { ref, data, loading, error } = useLazyPublicData<{ process: CmsHeroImage[] }>("/api/public/process");
  const steps = (data?.process ?? []).filter((item) => item.slot !== "banner" && item.imageUrl);
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [hovered, setHovered] = useState(false);
  const setSectionRef = useCallback((node: HTMLElement | null) => {
    ref(node);
  }, [ref]);

  useEffect(() => {
    if (!steps.length) return;
    setActiveIndex((current) => Math.min(current, steps.length - 1));
  }, [steps.length]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (query.matches) setAutoPlay(false);
  }, []);

  const isPlaying = autoPlay && Boolean(data) && !hovered;
  useEffect(() => {
    if (!isPlaying || steps.length < 2) return;
    const timer = setTimeout(() => setActiveIndex((current) => (current + 1) % steps.length), STEP_DURATION_MS);
    return () => clearTimeout(timer);
  }, [activeIndex, isPlaying, steps.length]);

  const goTo = useCallback((index: number) => setActiveIndex(index), []);
  if (!loading && error) return <section ref={setSectionRef} className="bg-surface py-7 sm:py-10"><div className="mx-auto max-w-7xl px-4 text-sm text-muted sm:px-5 lg:px-6">{error}</div></section>;

  return (
    <section ref={setSectionRef} className="bg-surface py-7 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6">
        <div className="mb-7 text-center sm:mb-10"><div className="mb-3 flex items-center justify-center gap-2 sm:mb-4 sm:gap-3"><div className="h-px w-8 bg-rainbow sm:w-12" /><span className="text-[10px] font-black uppercase tracking-[0.22em] text-primary sm:text-xs sm:tracking-[0.4em]">{t("howWork")}</span><div className="h-px w-8 bg-rainbow sm:w-12" /></div><h2 className="h2-fluid title-scroll-fx font-black uppercase leading-tight text-foreground">{t("ideaFinish")}</h2></div>
        {loading || !data ? (
          <div className="mx-auto max-w-4xl overflow-hidden rounded-[1.25rem] border border-border bg-background" aria-label={t("loadingSite")}>
            <div className="grid gap-0 sm:grid-cols-2">
              <div className="h-56 animate-pulse bg-surface-2 sm:h-72 lg:h-80" />
              <div className="space-y-4 p-5 sm:p-7"><div className="h-3 w-24 animate-pulse rounded bg-surface-2" /><div className="h-8 w-3/4 animate-pulse rounded bg-surface-2" /><div className="h-4 w-full animate-pulse rounded bg-surface-2" /><div className="h-4 w-2/3 animate-pulse rounded bg-surface-2" /></div>
            </div>
          </div>
        ) : !steps.length ? null : (
          <>
            <div role="tablist" aria-label={t("processSteps")} className="mx-auto mb-6 flex max-w-3xl items-center gap-1 overflow-x-auto pb-1 sm:mb-8 sm:overflow-visible">
              {steps.map((step, index) => { const isActive = index === activeIndex; const isComplete = index < activeIndex; return <div key={step.slot} className="flex flex-1 items-center last:flex-none"><button type="button" role="tab" id={`process-step-tab-${index}`} aria-selected={isActive} aria-controls="process-step-panel" onClick={() => goTo(index)} className={`tap-target flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 text-sm font-black transition-colors sm:h-12 sm:w-12 sm:text-base ${isActive ? "border-primary bg-primary text-primary-foreground" : isComplete ? "border-primary/50 bg-primary/10 text-primary" : "border-border bg-background text-muted"}`}>{n(String(index + 1).padStart(2, "0"))}</button>{index < steps.length - 1 && <span aria-hidden="true" className={`mx-1 h-0.5 flex-1 rounded-full transition-colors duration-300 sm:mx-2 ${index < activeIndex ? "bg-primary" : "bg-border"}`} />}</div>; })}
            </div>
            {(() => { const active = steps[activeIndex] || steps[0]; const activeLabel = localizedProcessLabel(active.slot, active.label, language, activeIndex); return <div id="process-step-panel" role="tabpanel" aria-labelledby={`process-step-tab-${activeIndex}`} aria-live="polite" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocus={() => setHovered(true)} onBlur={() => setHovered(false)} className="relative mx-auto grid max-w-4xl overflow-hidden rounded-[1.25rem] border border-border bg-background sm:grid-cols-2"><div className="step-fade-in relative h-56 w-full sm:h-72 lg:h-80"><Image src={active.imageUrl!} alt={activeLabel} fill priority={false} className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" unoptimized={active.imageUrl?.startsWith("data:")} /></div><div className="step-fade-in flex flex-col justify-center p-5 sm:p-7"><span className={`text-[10px] font-black uppercase tracking-[0.22em] sm:text-xs sm:tracking-[0.3em] ${ACCENT_TEXT[activeIndex % ACCENT_TEXT.length]}`}>{t("process")}</span><h3 className="mt-2 text-xl font-black uppercase leading-tight text-foreground sm:text-2xl">{activeLabel}</h3></div><div className="absolute inset-x-0 bottom-0 h-1 bg-border/70" aria-hidden="true">{isPlaying && <div key={activeIndex} className="step-progress-bar h-full origin-left bg-primary" />}</div></div>; })()}
            {steps.length > 1 && <div className="mt-4 flex items-center justify-center"><button type="button" onClick={() => setAutoPlay((current) => !current)} aria-pressed={autoPlay} className="tap-target flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[10px] font-black uppercase tracking-widest text-muted transition-colors hover:border-primary hover:text-primary">{autoPlay ? <Pause className="h-3.5 w-3.5" aria-hidden="true" /> : <Play className="h-3.5 w-3.5" aria-hidden="true" />}{autoPlay ? t("pause") : t("play")}</button></div>}
          </>
        )}
      </div>
    </section>
  );
}
