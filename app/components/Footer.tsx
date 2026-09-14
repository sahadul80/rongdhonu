"use client";

import { BRAND } from "@/app/data/brand";
import BrandLogo from "./BrandLogo";
import { useLanguage } from "./LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="relative border-t border-border bg-background py-6 sm:py-8">
      <div className="absolute inset-x-0 top-0 h-px bg-rainbow opacity-60" />
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:px-5 lg:flex-row lg:px-6">
        <BrandLogo size={42} showTagline />
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          <a href={`mailto:${BRAND.email}`} className="text-[9px] uppercase tracking-widest text-muted hover:text-primary sm:text-xs">{t("email")}</a>
          <a href={`tel:${BRAND.phone.replace(/[^0-9+]/g, "")}`} className="text-[9px] uppercase tracking-widest text-muted hover:text-primary sm:text-xs">{t("phone")}</a>
          <a href={`https://${BRAND.website}`} className="text-[9px] uppercase tracking-widest text-muted hover:text-primary sm:text-xs">{t("website")}</a>
        </div>
        <p className="text-[9px] text-muted sm:text-xs">© 2026 {BRAND.name}</p>
      </div>
    </footer>
  );
}
