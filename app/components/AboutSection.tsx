"use client";

import { BRAND } from "@/app/data/brand";
import { useLanguage } from "./LanguageContext";

const strengths = [
  ["Color Planning", "Choose coordinated wall colors and finish combinations for the character of your space.", "text-rd-red"],
  ["Surface Preparation", "Prepare walls properly, including skim coat work where required before finishing.", "text-rd-amber"],
  ["Decorative Finishes", "Create distinctive surfaces through marble painting, Ambrose painting and texture work.", "text-rd-green"],
  ["Transformation", "Bring the selected finish together into a consistent, polished renovation result.", "text-rd-blue"],
] as const;

export default function AboutSection() {
  const { t, language } = useLanguage();
  return (
    <section id="about" className="bg-background py-7 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6">
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
              <div className="h-px w-8 bg-rainbow sm:w-12" />
              <span className="text-[10px] font-black uppercase tracking-[0.22em] text-primary sm:text-xs sm:tracking-[0.4em]">
                {t("aboutCompany")}
              </span>
            </div>
            <h2 className="h2-fluid title-scroll-fx font-black uppercase leading-[1.05] text-foreground">
              {t("partnerSpace")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              {BRAND.name} {t("aboutText")}
            </p>
            <div className="mt-5 border-l-2 border-primary pl-4 sm:mt-7 sm:pl-5">
              <p className="text-sm font-bold leading-relaxed text-muted-strong sm:text-base">
                {t("aboutGoal")}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            {strengths.map(([title, description, accent]) => (
              <article key={title} className="swatch-card p-4 sm:p-5">
                <h3 className="mt-3 text-sm font-black uppercase text-foreground sm:text-base">{language === "bn" ? (title === "Color Planning" ? "রং পরিকল্পনা" : title === "Surface Preparation" ? "সারফেস প্রস্তুতি" : title === "Decorative Finishes" ? "ডেকোরেটিভ ফিনিশ" : "রূপান্তর") : title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted sm:text-sm">{language === "bn" ? (title === "Color Planning" ? t("colorPlanningDesc") : title === "Surface Preparation" ? t("prepDesc") : title === "Decorative Finishes" ? t("decorativeDesc") : t("transformationDesc")) : description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
