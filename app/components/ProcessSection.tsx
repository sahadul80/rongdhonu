"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { PROCESS_STEPS } from "@/app/data/content";
import { useLanguage } from "./LanguageContext";

const ACCENT_TEXT = ["text-rd-red", "text-rd-amber", "text-rd-green", "text-rd-blue", "text-rd-purple"] as const;
const ACCENT_BG = ["bg-rd-red", "bg-rd-amber", "bg-rd-green", "bg-rd-blue", "bg-rd-purple"] as const;

const STEP_DURATION_MS = 4000;

const BENGALI_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"] as const;
const toBengaliNumber = (value: number) => String(value).replace(/[0-9]/g, (digit) => BENGALI_DIGITS[Number(digit)]);

export default function ProcessSection() {
  const steps = PROCESS_STEPS;
  const { t, language } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Respect "reduce motion": start paused, but still let the person opt in
  // via the play button below — that's an explicit, informed choice.
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (query.matches) setAutoPlay(false);
  }, []);

  // Only run the auto-advance timer while the section is actually on screen,
  // so it doesn't burn cycles (or surprise-jump steps) while scrolled away.
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.4,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const isPlaying = autoPlay && inView && !hovered;

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(() => {
      setActiveIndex((current) => (current + 1) % steps.length);
    }, STEP_DURATION_MS);
    return () => clearTimeout(timer);
    // Restart the 4s countdown fresh every time the step changes, whether
    // that change was automatic or the person clicked a step themselves.
  }, [activeIndex, isPlaying, steps.length]);

  const goTo = useCallback((index: number) => setActiveIndex(index), []);

  const active = steps[activeIndex];

  return (
    <section id="process" ref={sectionRef} className="bg-surface py-7 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6">
        <div className="mb-7 text-center sm:mb-10">
          <div className="mb-3 flex items-center justify-center gap-2 sm:mb-4 sm:gap-3">
            <div className="h-px w-8 bg-rainbow sm:w-12" />
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-primary sm:text-xs sm:tracking-[0.4em]">
              {t("howWork")}
            </span>
            <div className="h-px w-8 bg-rainbow sm:w-12" />
          </div>
          <h2 className="h2-fluid title-scroll-fx font-black uppercase leading-tight text-foreground">
            {language === "bn" ? "আইডিয়া থেকে ফিনিশিং" : "FROM IDEA TO FINISH"}
          </h2>
        </div>

        {/* Step indicator: every step number is always visible; the current
            one is filled in and completed ones are checked off. */}
        <div
          role="tablist"
          aria-label={language === "bn" ? "কাজের ধাপসমূহ" : "Process steps"}
          className="mx-auto mb-6 flex max-w-3xl items-center sm:mb-8"
        >
          {steps.map((step, index) => {
            const isActive = index === activeIndex;
            const isComplete = index < activeIndex;
            return (
              <div key={step.number} className="flex flex-1 items-center last:flex-none">
                <button
                  type="button"
                  role="tab"
                  id={`process-step-tab-${index}`}
                  aria-selected={isActive}
                  aria-controls="process-step-panel"
                  onClick={() => goTo(index)}
                  className={`tap-target flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 text-sm font-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:h-12 sm:w-12 sm:text-base ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : isComplete
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-border bg-background text-muted"
                  }`}
                >
                  <span aria-hidden="true">{language === "bn" ? toBengaliNumber(index + 1).padStart(2, "০") : String(index + 1).padStart(2, "0")}</span>
                </button>
                {index < steps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={`mx-1 h-0.5 flex-1 rounded-full transition-colors duration-300 sm:mx-2 ${
                      index < activeIndex ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Active step: image + description, with a fade-in transition and
            a progress bar that shows exactly when the next step arrives. */}
        <div
          id="process-step-panel"
          role="tabpanel"
          aria-labelledby={`process-step-tab-${activeIndex}`}
          aria-live="polite"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setHovered(true)}
          onBlur={() => setHovered(false)}
          className="relative mx-auto grid max-w-4xl overflow-hidden rounded-[1.25rem] border border-border bg-background sm:grid-cols-2"
        >
          <div key={`image-${activeIndex}`} className="step-fade-in relative h-56 w-full sm:h-72 lg:h-80">
            <Image
              src={active.image || "/images/placeholder.jpg"}
              alt={language === "bn" ? `প্রক্রিয়ার ধাপ ${toBengaliNumber(activeIndex + 1)}` : active.title || `Process step ${activeIndex + 1}`}
              fill
              priority={activeIndex === 0}
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          </div>

          <div key={`text-${activeIndex}`} className="step-fade-in flex flex-col justify-center p-5 sm:p-7">
            <span className={`text-[10px] font-black uppercase tracking-[0.22em] sm:text-xs sm:tracking-[0.3em] ${ACCENT_TEXT[activeIndex % ACCENT_TEXT.length]}`}>
              {t("process")}
            </span>
            <h3 className="mt-2 text-xl font-black uppercase leading-tight text-foreground sm:text-2xl">
              {language === "bn" ? ["পরামর্শ", "রং ও ফিনিশ পরিকল্পনা", "সারফেস প্রস্তুতি", "কাজ সম্পাদন", "চূড়ান্ত পর্যালোচনা"][activeIndex] : active.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              {language === "bn" ? ["আপনার স্পেস, প্রয়োজন, পছন্দের ফিনিশ ও প্রত্যাশিত ফলাফল বুঝে নেওয়া।", "উপযুক্ত কালার স্কিম, সারফেস ট্রিটমেন্ট ও ডেকোরেটিভ ফিনিশের পরামর্শ।", "প্রয়োজনে স্কিম কোটসহ কাজের সারফেস প্রস্তুত করা।", "পেইন্টিং, মার্বেল, অ্যামব্রোস বা টেক্সচার কাজ নির্ভুলভাবে সম্পন্ন করা।", "সম্পন্ন কাজ পরিদর্শন করে ক্লায়েন্টের সঙ্গে চূড়ান্ত ফলাফল পর্যালোচনা করা।"][activeIndex] : active.description}
            </p>
          </div>

          <div className="absolute inset-x-0 bottom-0 h-1 bg-border/70" aria-hidden="true">
            {isPlaying && <div key={activeIndex} className="step-progress-bar h-full origin-left bg-primary" />}
          </div>
        </div>

        {/* WCAG 2.2.2: auto-advancing content that repeats needs a visible
            pause control the person can reach without losing their place. */}
        <div className="mt-4 flex items-center justify-center">
          <button
            type="button"
            onClick={() => setAutoPlay((current) => !current)}
            aria-pressed={autoPlay}
            className="tap-target flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[10px] font-black uppercase tracking-widest text-muted transition-colors hover:border-primary hover:text-primary"
          >
            {autoPlay ? <Pause className="h-3.5 w-3.5" aria-hidden="true" /> : <Play className="h-3.5 w-3.5" aria-hidden="true" />}
            {autoPlay ? t("pause") : t("play")}
          </button>
        </div>
      </div>
    </section>
  );
}
