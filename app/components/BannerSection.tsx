"use client";

import Image from "next/image";
import { BRAND, localizedTagline } from "@/app/data/brand";
import { useLanguage } from "./LanguageContext";

export default function BannerSection() {
  const { t, language, pick } = useLanguage();
  return <section aria-label={`${pick(BRAND.name, BRAND.nameBn)} — ${t("bannerLabel")}`} className="w-full bg-surface"><div className="mx-auto w-full max-w-7xl"><Image src={BRAND.assets.banner} alt={`${pick(BRAND.name, BRAND.nameBn)} — ${localizedTagline(BRAND.tagline, language)}`} width={1600} height={595} sizes="100vw" className="h-auto w-full object-contain" loading="lazy" /></div></section>;
}
