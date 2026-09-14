"use client";

import { useMemo, useState } from "react";
import { SERVICES } from "@/app/data/services";
import type { ServiceAccent } from "@/app/types/rong-dhonu";
import { useLanguage } from "./LanguageContext";

const CATEGORIES = ["All", "Painting", "Color & Design", "Surface Preparation", "Decorative Finish", "Texture & Feature Walls"] as const;

const CATEGORY_LABELS: Record<(typeof CATEGORIES)[number], { en: string; bn: string }> = {
  "All": { en: "All", bn: "সব" },
  "Painting": { en: "Painting", bn: "পেইন্টিং" },
  "Color & Design": { en: "Color & Design", bn: "রং ও ডিজাইন" },
  "Surface Preparation": { en: "Surface Preparation", bn: "সারফেস প্রস্তুতি" },
  "Decorative Finish": { en: "Decorative Finish", bn: "ডেকোরেটিভ ফিনিশ" },
  "Texture & Feature Walls": { en: "Texture & Feature Walls", bn: "টেক্সচার ও ফিচার ওয়াল" },
};

// Static (non-interpolated) class names so Tailwind can pick them up at build time.
const ACCENT_STYLES: Record<ServiceAccent, { border: string; bar: string; text: string }> = {
  red: { border: "border-rd-red/30 hover:border-rd-red", bar: "bg-rd-red", text: "text-rd-red" },
  orange: { border: "border-rd-orange/30 hover:border-rd-orange", bar: "bg-rd-orange", text: "text-rd-orange" },
  amber: { border: "border-rd-amber/30 hover:border-rd-amber", bar: "bg-rd-amber", text: "text-rd-amber" },
  green: { border: "border-rd-green/30 hover:border-rd-green", bar: "bg-rd-green", text: "text-rd-green" },
  teal: { border: "border-rd-teal/30 hover:border-rd-teal", bar: "bg-rd-teal", text: "text-rd-teal" },
  blue: { border: "border-rd-blue/30 hover:border-rd-blue", bar: "bg-rd-blue", text: "text-rd-blue" },
  purple: { border: "border-rd-purple/30 hover:border-rd-purple", bar: "bg-rd-purple", text: "text-rd-purple" },
  pink: { border: "border-rd-pink/30 hover:border-rd-pink", bar: "bg-rd-pink", text: "text-rd-pink" },
};

export default function ServicesSection() {
  const [category, setCategory] = useState("All");
  const { t, language } = useLanguage();

  const services = useMemo(
    () => SERVICES.filter((service) => category === "All" || service.category === category),
    [category],
  );

  return (
    <section id="services" className="bg-background py-7 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6">
        <div className="mb-7 max-w-3xl sm:mb-7">
          <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
            <div className="h-px w-8 bg-rainbow sm:w-12" />
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-primary sm:text-xs sm:tracking-[0.4em]">
              {t("ourServices")}
            </span>
          </div>
          <h2 className="h2-fluid title-scroll-fx font-black uppercase leading-[1.05] text-foreground">
            {t("finishesTransform")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:mt-4 sm:text-base">
            {t("servicesIntro")}
          </p>
        </div>

        <div className="mb-5 flex gap-2 overflow-x-auto pb-2 sm:mb-7 sm:flex-wrap sm:overflow-visible">
          {CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`chip flex min-h-11 shrink-0 items-center border px-3.5 py-2 text-[9px] font-black uppercase tracking-wider transition-colors sm:px-4 sm:text-xs ${
                category === item
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted hover:border-primary hover:text-primary"
              }`}
            >
              {CATEGORY_LABELS[item][language]}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {services.map((service) => {
            const accent = ACCENT_STYLES[service.accent];

            return (
              <article
                key={service.id}
                className={`swatch-card group relative overflow-hidden p-4 sm:p-5 ${accent.border}`}
              >
                <div className={`absolute left-0 top-0 h-1 w-full rounded-t-[1.25rem] ${accent.bar}`} />
                <div className="mb-4 flex items-start justify-between gap-3">
                  <span className="rounded-sm border border-border px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-muted">
                    {service.category === "Painting" ? t("painting") : service.category === "Color & Design" ? t("colorDesign") : service.category === "Surface Preparation" ? t("surfacePreparation") : service.category === "Decorative Finish" ? t("decorativeFinish") : t("textureWalls")}
                  </span>
                </div>
                <h3 className="text-lg font-black leading-tight text-foreground sm:text-xl">
                  {language === "bn" ? ({ "general-painting": "সাধারণ পেইন্টিং কাজ", "wall-paint-color": "বিভিন্ন দেয়াল রং ও কালার স্কিম", "skim-coat": "স্কিম কোট কাজ", "marble-painting": "মার্বেল পেইন্টিং", "ambrose-painting": "অ্যামব্রোস পেইন্টিং", "texture-work": "টেক্সচার কাজ" } as Record<string, string>)[service.id] : service.name}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted sm:text-sm">
                  {language === "bn" ? ({ "general-painting": "আবাসিক, বাণিজ্যিক ও রেনোভেশন প্রজেক্টের জন্য পেশাদার পেইন্টিং।", "wall-paint-color": "স্পেসের বৈশিষ্ট্য অনুযায়ী দেয়ালের রং ও সমন্বিত কালার স্কিম।", "skim-coat": "চূড়ান্ত ডেকোরেটিভ ফিনিশের আগে মসৃণ সারফেস প্রস্তুতি।", "marble-painting": "স্বতন্ত্র প্রিমিয়াম ফিনিশের জন্য ডেকোরেটিভ মার্বেল-ইফেক্ট পেইন্টিং।", "ambrose-painting": "ডেকোরেটিভ সারফেস ও কাস্টমাইজড ইন্টেরিয়র ট্রিটমেন্টের জন্য অ্যামব্রোস পেইন্টিং।", "texture-work": "দেয়াল ও নির্বাচিত সারফেসে গভীরতা ও ভিজ্যুয়াল বৈচিত্র্য যোগ করার টেক্সচার ফিনিশ।" } as Record<string, string>)[service.id] : service.description}
                </p>
                <div className="mt-4 border-t border-border pt-3">
                  <span className="text-[8px] font-black uppercase tracking-widest text-muted sm:text-[9px]">
                    {language === "bn" ? "যাদের জন্য উপযুক্ত" : "Best for"}
                  </span>
                  <p className="mt-1 text-xs font-bold text-muted-strong">
                    {language === "bn" ? ({ "general-painting": "সম্পূর্ণ স্পেস ও প্রপার্টি রিফ্রেশ", "wall-paint-color": "বাড়ি, অফিস ও ফিচার স্পেস", "skim-coat": "অসমান বা ত্রুটিপূর্ণ দেয়াল", "marble-painting": "ফিচার ওয়াল ও স্টেটমেন্ট ইন্টেরিয়র", "ambrose-painting": "ডেকোরেটিভ ও প্রিমিয়াম সারফেস", "texture-work": "ফিচার ওয়াল ও অ্যাকসেন্ট এরিয়া" } as Record<string, string>)[service.id] : service.bestFor}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
