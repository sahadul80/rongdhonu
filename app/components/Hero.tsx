"use client";

import { ArrowDown, ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import { BRAND } from "@/app/data/brand";
import { PROCESS_STEPS } from "../data/content";
import { useLanguage } from "./LanguageContext";
import { useEffect, useState } from "react";

export default function Hero() {
  const { t, language } = useLanguage();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setActive((value) => (value + 1) % PROCESS_STEPS.length), 5000);
    return () => window.clearInterval(timer);
  }, []);

  const slide = PROCESS_STEPS[active];
  const title = language === "bn" ? "রং। ডিজাইন। রূপান্তর।" : "COLOR. DESIGN. TRANSFORM.";
  const eyebrow = language === "bn" ? "স্পেস রূপান্তরের কারিগর" : "CRAFTING BETTER SPACES";
  const intro = language === "bn"
    ? `${BRAND.name} পেইন্টিং, রং, সারফেস প্রস্তুতি ও ডেকোরেটিভ ফিনিশিংয়ের মাধ্যমে আপনার স্পেসকে নতুন রূপ দেয়।`
    : `${BRAND.name} transforms spaces through painting, color, surface preparation and distinctive decorative finishes.`;
  const slideTitle = language === "bn"
    ? ["পরামর্শ", "রং ও ফিনিশ পরিকল্পনা", "সারফেস প্রস্তুতি", "কাজ সম্পাদন", "চূড়ান্ত পর্যালোচনা"][active]
    : slide.title;
  const slideDescription = language === "bn"
    ? [
        "আপনার স্পেস, প্রয়োজন ও পছন্দের ফিনিশ বুঝে নেওয়া।",
        "উপযুক্ত রং, সারফেস ট্রিটমেন্ট ও ফিনিশের পরিকল্পনা।",
        "ফিনিশিংয়ের আগে কাজের সারফেস সঠিকভাবে প্রস্তুত করা।",
        "পেইন্টিং ও ডেকোরেটিভ কাজ নির্ভুলভাবে সম্পন্ন করা।",
        "চূড়ান্ত কাজ পরিদর্শন করে ফলাফল নিশ্চিত করা।",
      ][active]
    : slide.description;

  return (
    <section id="home" className="relative isolate overflow-hidden bg-background">
      <div className="relative mx-auto max-w-400 px-3 py-3 sm:px-5 lg:px-7 lg:py-5">
        <div className="relative min-h-135 sm:min-h-142.5 overflow-hidden rounded-4xl border border-white/15 bg-black shadow-2xl lg:min-h-150">
          {PROCESS_STEPS.map((item, index) => (
            <div key={item.number} className={`absolute inset-0 transition-opacity duration-1000 ${index === active ? "opacity-100" : "opacity-0"}`} aria-hidden={index !== active}>
              <Image src={item.image || "/images/placeholder.jpg"} alt="" fill priority={index === 0} className="object-cover scale-105" sizes="100vw" />
            </div>
          ))}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.82)_0%,rgba(0,0,0,.62)_42%,rgba(0,0,0,.18)_78%,rgba(0,0,0,.42)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(255,255,255,.14),transparent_28%),linear-gradient(135deg,rgba(255,50,50,.10),transparent_30%,rgba(0,170,255,.12))]" />
          <div className="absolute inset-0 opacity-[.13] bg-[linear-gradient(rgba(255,255,255,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.35)_1px,transparent_1px)] bg-size-[42px_42px]" />

          <div className="relative z-10 flex min-h-[inherit] flex-col justify-between p-6 sm:p-9 lg:p-12 xl:p-16">
            

            <div className="max-w-5xl py-10 lg:py-16">
              <h1 className="max-w-5xl text-[clamp(3rem,7.5vw,7.4rem)] font-black leading-[.86] tracking-[-.055em] text-white">
                {language === "bn" ? (<><p>আপনার বাড়ি</p><span className="hero-transform-gradient">রূপান্তর।</span></>) : (<><span className="hero-transform-gradient">TRANSFORM</span><p>Your Home</p></>)}
              </h1>
              <p className="mt-7 max-w-2xl text-sm leading-7 text-white/80 sm:text-base sm:leading-8 lg:text-lg">
                {intro}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#services" className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3.5 text-[10px] font-black uppercase tracking-widest sm:text-xs">
                  {t("ourServices")} <ArrowDown className="h-4 w-4" />
                </a>
                <a href="#contact" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md transition hover:bg-white/20 sm:text-xs">
                  {t("requestConsultation")} <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-xl rounded-2xl border border-white/15 bg-black/30 p-4 backdrop-blur-xl sm:p-5">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-white/90">{language === "bn" ? `০${active + 1}` : `0${active + 1}`}</span>
                  <div className="h-px flex-1 bg-white/20" />
                  <span className="text-[9px] font-black uppercase tracking-[.2em] text-white/60">{language === "bn" ? "কাজের ধাপ" : "PROCESS"}</span>
                </div>
                <h2 className="mt-3 text-base font-black text-white sm:text-lg">{slideTitle}</h2>
                <p className="mt-1 text-xs leading-5 text-white/65 sm:text-sm">{slideDescription}</p>
              </div>

              <div className="flex items-center justify-around gap-2 rounded-full border border-white/15 bg-black/30 p-2 backdrop-blur-xl">
                {PROCESS_STEPS.map((item, index) => (
                  <button key={item.number} type="button" onClick={() => setActive(index)} aria-label={language === "bn" ? `ধাপ ${index + 1}` : `Step ${index + 1}`} aria-current={active === index ? "step" : undefined} className={`h-9 rounded-full px-3 text-[10px] font-black transition ${active === index ? "bg-white text-black" : "text-white/60 hover:bg-white/10 hover:text-white"}`}>
                    {language === "bn" ? `০${index + 1}` : `0${index + 1}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
