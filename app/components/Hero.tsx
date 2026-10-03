"use client";

import { ArrowDown, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { BRAND, localizedTagline } from "@/app/data/brand";
import type { BusinessPublicSummary, CmsHeroImage } from "@/app/types/public-cms";
import { useLanguage } from "./LanguageContext";
import { localizedProcessLabel } from "@/app/data/process-labels";

interface HeroProps {
  business: BusinessPublicSummary | null;
  initialHero: CmsHeroImage | null;
}

export default function Hero({ business, initialHero }: HeroProps) {
  const { t, language, n } = useLanguage();
  const initial = initialHero ? [initialHero] : [];
  const [slides, setSlides] = useState<CmsHeroImage[]>(initial);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function loadAdditionalSlides() {
      try {
        const response = await fetch("/api/public/hero-images");
        if (!response.ok) return;
        const json = (await response.json()) as { heroImages?: CmsHeroImage[] };
        if (cancelled || !Array.isArray(json.heroImages)) return;

        const usable = json.heroImages.filter((item) => item.imageUrl && item.slot !== "banner");
        if (!usable.length) return;
        setSlides((current) => {
          const first = current[0];
          const merged = first
            ? [first, ...usable.filter((item) => item.slot !== first.slot)]
            : usable;
          const seen = new Set<string>();
          return merged.filter((item) => {
            if (seen.has(item.slot)) return false;
            seen.add(item.slot);
            return true;
          });
        });
      } catch {
        // The server-rendered first slide remains usable when additional slides fail.
      }
    }

    void loadAdditionalSlides();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setActive((current) => Math.min(current, Math.max(slides.length - 1, 0)));
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => setActive((value) => (value + 1) % slides.length), 5000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const fallbackSlide = useMemo(() => ({
    slot: "fallback-banner",
    label: t("bannerLabel"),
    imageUrl: BRAND.assets.banner,
  }), [t]);
  const displaySlides = slides.length ? slides : [fallbackSlide];
  const slide = displaySlides[active] || displaySlides[0];
  const intro = localizedTagline(business?.tagline || BRAND.tagline, language);
  const slideTitle = slide ? localizedProcessLabel(slide.slot, slide.label, language, active) : t("process");

  return (
    <section id="home" className="hero-section relative isolate overflow-hidden bg-background">
      <div className="section-shell relative">
        <div className="hero-card relative overflow-hidden rounded-4xl border border-white/15 bg-black shadow-2xl">
          {displaySlides.map((item, index) => (
            <div key={item.slot} className={`absolute inset-0 transition-opacity duration-700 ease-out ${index === active ? "opacity-100" : "opacity-0"}`} aria-hidden={index !== active}>
              <Image src={item.imageUrl || BRAND.assets.banner} alt="" fill priority={index === 0} className="scale-105 object-cover" sizes="100vw" unoptimized={item.imageUrl?.startsWith("data:")} loading={index === 0 ? "eager" : "lazy"} />
            </div>
          ))}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,.52)_0%,rgba(0,0,0,.8)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,.14),transparent_40%),linear-gradient(90deg,rgba(255,50,50,.10),transparent_30%,transparent_70%,rgba(0,170,255,.12))]" />
          <div className="absolute inset-0 opacity-[.13] bg-[linear-gradient(rgba(255,255,255,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.35)_1px,transparent_1px)] bg-size-[42px_42px]" />

          <div className="content-layer relative flex min-h-[inherit] flex-col items-center justify-center gap-5 p-5 text-center sm:p-8 lg:p-10">
            <div className="mx-auto flex max-w-4xl flex-col items-center py-2">
              <h1 className="hero-enter text-[clamp(2.25rem,6vw,4.75rem)] font-black leading-[.92] tracking-[-.045em] text-white">
                {language === "bn" ? <><span className="block">আপনার স্পেস</span><span className="hero-transform-gradient">রূপান্তর।</span></> : <><span className="hero-transform-gradient">TRANSFORM</span><span className="block">Your Space</span></>}
              </h1>
              <p className="hero-enter hero-enter--2 mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-base sm:leading-8 lg:text-lg">{intro}</p>
              <div className="hero-enter hero-enter--3 mt-5 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
                <a href="#services" className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3.5 text-[10px] font-black uppercase tracking-widest sm:text-xs">{t("ourServices")} <ArrowDown className="h-4 w-4" /></a>
                <a href="#contact" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md transition hover:bg-white/20 sm:text-xs">{t("requestConsultation")} <ArrowRight className="h-4 w-4" /></a>
              </div>
            </div>

            <div className="hero-enter hero-enter--4 flex w-full flex-col items-center gap-3">
              <div className="w-full max-w-xl rounded-2xl border border-white/15 bg-black/30 p-4 text-left backdrop-blur-xl sm:p-5">
                <div className="flex items-center gap-3"><span className="text-2xl font-black text-white/90">{n(String(active + 1).padStart(2, "0"))}</span><div className="h-px flex-1 bg-white/20" /><span className="text-[9px] font-black uppercase tracking-[.2em] text-white/60">{t("process")}</span></div>
                <h2 className="mt-3 text-base font-black text-white sm:text-lg">{slideTitle}</h2>
              </div>
              {displaySlides.length > 1 && <div className="flex items-center justify-center gap-2 rounded-full border border-white/15 bg-black/30 p-2 backdrop-blur-xl">
                {displaySlides.map((item, index) => <button key={item.slot} type="button" onClick={() => setActive(index)} aria-label={`${t("stepOf")} ${n(index + 1)}`} aria-current={active === index ? "step" : undefined} className={`h-9 rounded-full px-3 text-[10px] font-black transition ${active === index ? "bg-white text-black" : "text-white/60 hover:bg-white/10 hover:text-white"}`}>{n(String(index + 1).padStart(2, "0"))}</button>)}
              </div>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
