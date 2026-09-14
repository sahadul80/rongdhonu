"use client";

import { BRAND } from "@/app/data/brand";
import { useLanguage } from "./LanguageContext";

export default function ContactSection() {
  const { t, language } = useLanguage();
  const contactRows = [
    [t("address"), BRAND.address],
    [t("phone"), BRAND.phone],
    [t("email"), BRAND.email],
    [t("website"), BRAND.website],
  ];
  return (
    <section id="contact" className="bg-surface py-7 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6">
        <div className="grid items-stretch gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="h-px w-8 bg-rainbow sm:w-12" />
              <span className="text-[10px] font-black uppercase tracking-[0.22em] text-primary sm:text-xs">{t("contactUs")}</span>
            </div>
            <h2 className="h2-fluid font-black uppercase leading-tight text-foreground">{t("readyTransform")}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{t("contactIntro")}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href={`mailto:${BRAND.email}`} className="btn-primary px-5 py-3 text-[10px] font-black uppercase tracking-widest">{t("emailUs")}</a>
              <a href={`tel:${BRAND.phone.replace(/[^0-9+]/g, "")}`} className="btn-outline-primary px-5 py-3 text-[10px] font-black uppercase tracking-widest">{t("callUs")}</a>
            </div>
            <div className="mt-6 rounded-2xl border border-border bg-background/70 p-4 sm:p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{language === "bn" ? "আপনার পরবর্তী ধাপ" : "Your next step"}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-strong">
                {language === "bn"
                  ? "আপনার স্পেস ও কাজের ধরন জানালে আমরা উপযুক্ত ফিনিশিং ও পরবর্তী পদক্ষেপ নিয়ে আলোচনা করতে পারি।"
                  : "Tell us about your space and the work you need, and we can discuss the right finish and next steps."}
              </p>
            </div>
          </div>
          <div className="flex h-full flex-col gap-3">
            <div className="swatch-card bg-background p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-base font-black uppercase text-foreground sm:text-xl">{t("businessInfo")}</h3>
                <span className="text-[9px] font-black uppercase tracking-widest text-primary">Dhaka</span>
              </div>
              <div className="divide-y divide-border">
                {contactRows.map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[72px_1fr] gap-4 py-2.5 sm:grid-cols-[100px_1fr]">
                    <span className="text-[9px] font-black uppercase tracking-wider text-muted">{label}</span>
                    <span className="text-xs leading-relaxed text-muted-strong sm:text-sm">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 border-t border-border pt-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted">{t("coreOffering")}</span>
                <p className="mt-2 text-sm font-bold text-foreground">{language === "bn" ? "পেইন্টিং · কালার স্কিম · স্কিম কোট · মার্বেল · অ্যামব্রোস · টেক্সচার" : "Painting · Color Schemes · Skim Coat · Marble · Ambrose · Texture"}</p>
              </div>
            </div>
            <div className="swatch-card overflow-hidden bg-background p-2">
              <iframe title={`${BRAND.name} — location on Google Maps`} src={`https://www.google.com/maps?q=${encodeURIComponent(BRAND.mapQuery)}&output=embed`} width="100%" height="220" style={{ border: 0 }} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="rounded-lg" />
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BRAND.mapQuery)}`} target="_blank" rel="noopener noreferrer" className="mt-2 block px-2 pb-1 text-center text-[9px] font-black uppercase tracking-widest text-primary hover:underline sm:text-[10px]">{t("openMaps")}</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
