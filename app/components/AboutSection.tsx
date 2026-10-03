"use client";

import { BRAND } from "@/app/data/brand";
import { useLanguage } from "./LanguageContext";
import SectionHeader from "./SectionHeader";
import AutoSlideRail from "./AutoSlideRail";
import { ABOUT_ILLUSTRATIONS } from "./AboutIllustrations";

const strengths = [
  ["Color Planning", "Choose coordinated wall colors and finish combinations for the character of your space.", "colorPlanningDesc", "রং পরিকল্পনা"],
  ["Surface Preparation", "Prepare walls properly, including skim coat work where required before finishing.", "prepDesc", "সারফেস প্রস্তুতি"],
  ["Decorative Finishes", "Create distinctive surfaces through marble painting, Ambrose painting and texture work.", "decorativeDesc", "ডেকোরেটিভ ফিনিশ"],
  ["Transformation", "Bring the selected finish together into a consistent, polished renovation result.", "transformationDesc", "রূপান্তর"],
] as const;

export default function AboutSection() {
  const { t, language, pick } = useLanguage();
  return (
    <section className="section-surface section-y pattern-about bg-background">
      <div className="section-shell">
        <SectionHeader eyebrow={t("aboutCompany")} title={t("partnerSpace")} />
        <div className="grid items-stretch gap-3 lg:grid-cols-2 lg:gap-4">
          <div className="glass-card reveal flex flex-col justify-around gap-3 p-4 sm:p-5">
            <p className="text-sm leading-relaxed text-muted sm:text-base">
              {pick(BRAND.name, BRAND.nameBn)} {t("aboutText")}
            </p>
            <div className="border-l-2 border-primary pl-4 sm:pl-5">
              <p className="text-sm font-bold leading-relaxed text-muted-strong sm:text-base">{t("aboutGoal")}</p>
            </div>
          </div>
          <div className="min-w-0">
            <AutoSlideRail label={t("aboutCompany")}>
              {strengths.map(([title, description, descKey, titleBn]) => {
                const Illustration = ABOUT_ILLUSTRATIONS[title];
                return (
                  <article key={title} className="glass-card swatch-card auto-rail__item flex flex-col overflow-hidden">
                    <div className="aspect-7/5 w-full h-full bg-surface-2/70" aria-hidden="true"><Illustration /></div>
                    <div className="flex flex-1 flex-col p-2">
                      <h3 className="text-sm font-black uppercase text-foreground sm:text-base">{language === "bn" ? titleBn : title}</h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted sm:text-sm">{language === "bn" ? t(descKey) : description}</p>
                    </div>
                  </article>
                );
              })}
            </AutoSlideRail>
          </div>
        </div>
      </div>
    </section>
  );
}
