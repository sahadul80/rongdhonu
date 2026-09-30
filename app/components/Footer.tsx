"use client";

import { BRAND } from "@/app/data/brand";
import BrandLogo from "./BrandLogo";
import { useLanguage } from "./LanguageContext";

export default function Footer() {
  const { t, pick, n } = useLanguage();
  return (
    <footer className="relative border-t border-border bg-background p-2">
      <div className="mx-auto flex max-w-xl flex-row items-center justify-between gap-2 p-2">
        <p className="text-[9px] text-muted sm:text-xs">© {n(2026)} {pick(BRAND.name, BRAND.nameBn)} {t("builtBy")} <a href="https://thebizaid.com" target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold hover:text-primary sm:text-xs">Business Aid</a></p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          <a href={`mailto:${BRAND.email}`} className="text-[9px] uppercase tracking-widest text-muted hover:text-primary sm:text-xs">{t("email")}</a>
          <a href={`tel:${BRAND.phone.replace(/[^0-9+]/g, "")}`} className="text-[9px] uppercase tracking-widest text-muted hover:text-primary sm:text-xs">{t("phone")}</a>
          <a href={`https://${BRAND.website}`} className="text-[9px] uppercase tracking-widest text-muted hover:text-primary sm:text-xs">{t("website")}</a>
        </div>
        <BrandLogo size={48} showTagline />
      </div>
    </footer>
  );
}
