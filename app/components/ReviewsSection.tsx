"use client";

import { Star, Quote } from "lucide-react";
import { useLanguage } from "./LanguageContext";

const REVIEWS = [
  { name: "Ayesha Rahman", role: "Homeowner", text: "The team understood the color direction quickly and delivered a clean, polished finish." },
  { name: "Mahmud Hasan", role: "Property Manager", text: "Professional from preparation to final review. The space feels completely refreshed." },
  { name: "Nusrat Jahan", role: "Residential Client", text: "The decorative finish added exactly the character we wanted without making the room feel heavy." },
];

export default function ReviewsSection() {
  const { t, language } = useLanguage();
  return (
    <section id="reviews" className="bg-background py-7 sm:py-10" aria-labelledby="reviews-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6">
        <div className="mb-6 max-w-2xl">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-px w-8 bg-rainbow sm:w-12" />
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-primary sm:text-xs">{t("reviews")}</span>
          </div>
          <h2 id="reviews-title" className="h2-fluid font-black uppercase leading-tight text-foreground">{t("reviewTitle")}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">{t("reviewIntro")}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {REVIEWS.map((review) => (
            <article key={review.name} className="swatch-card relative p-5">
              <Quote className="absolute right-4 top-4 h-6 w-6 text-primary/20" aria-hidden="true" />
              <div className="mb-4 flex gap-1" aria-label="5 stars">
                {Array.from({ length: 5 }, (_, index) => <Star key={index} className="h-4 w-4 fill-current text-rd-amber" aria-hidden="true" />)}
              </div>
              <p className="text-sm leading-relaxed text-muted-strong">
                “{language === "bn" ? ({
                  "Ayesha Rahman": "দলটি দ্রুত আমাদের রঙের পছন্দ বুঝেছে এবং পরিচ্ছন্ন, পরিপাটি ফিনিশ দিয়েছে।",
                  "Mahmud Hasan": "প্রস্তুতি থেকে চূড়ান্ত পর্যালোচনা পর্যন্ত কাজ ছিল পেশাদার। স্পেসটি সম্পূর্ণ নতুন মনে হচ্ছে।",
                  "Nusrat Jahan": "ডেকোরেটিভ ফিনিশটি ঘরকে ভারী না করে আমাদের চাওয়া বৈশিষ্ট্য ঠিকভাবে যোগ করেছে।"
                } as Record<string, string>)[review.name] : review.text}”
              </p>
              <div className="mt-5 border-t border-border pt-3">
                <p className="text-sm font-black text-foreground">{review.name}</p>
                <p className="mt-1 text-[10px] uppercase tracking-widest text-muted">
                  {language === "bn" ? "ক্লায়েন্ট" : review.role}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
