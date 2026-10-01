"use client";

import { BRAND } from "@/app/data/brand";
import BrandLogo from "./BrandLogo";
import { useLanguage } from "./LanguageContext";

export default function Footer() {
  const { t, pick, n } = useLanguage();
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <BrandLogo size={58} showTagline />
          <p className="site-footer__tagline">{pick(BRAND.tagline, BRAND.taglineBn)}</p>
          <p className="site-footer__address">{pick(BRAND.address, BRAND.addressBn)}</p>
        </div>

        <div className="site-footer__links" aria-label={t("contactUs")}>
          <span className="site-footer__label">{t("contactUs")}</span>
          <a href={`mailto:${BRAND.email}`} className="site-footer__link">{BRAND.email}</a>
          <a href={`tel:${BRAND.phone.replace(/[^0-9+]/g, "")}`} className="site-footer__link">{BRAND.phone}</a>
          <a href={`https://${BRAND.website}`} className="site-footer__link">{BRAND.website}</a>
        </div>

        <div className="site-footer__meta">
          <p>© {n(2026)} {pick(BRAND.name, BRAND.nameBn)}</p>
          <p>{t("builtBy")} <a href="https://thebizaid.com" target="_blank" rel="noopener noreferrer">Business Aid</a></p>
        </div>
      </div>
    </footer>
  );
}
