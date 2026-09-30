"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { BRAND, localizedTagline } from "@/app/data/brand";
import { useLanguage } from "./LanguageContext";

interface BrandLogoProps {
  size?: number;
  showTagline?: boolean;
  className?: string;
  variant?: "auto" | "color" | "reversed";
  logoUrl?: string | null;
  logoReversedUrl?: string | null;
  businessName?: string | null;
  tagline?: string | null;
}

const LOGO_RATIO = 1600 / 1093;

export default function BrandLogo({
  size = 80,
  showTagline = false,
  className = "",
  variant = "auto",
  logoUrl,
  logoReversedUrl,
  businessName,
  tagline,
}: BrandLogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { language } = useLanguage();

  useEffect(() => setMounted(true), []);

  const isDark = variant === "reversed" || (variant === "auto" && mounted && resolvedTheme === "dark");
  const src = (isDark ? logoReversedUrl : logoUrl) || (isDark ? BRAND.assets.logoReversed : BRAND.assets.logo);
  const name = businessName || BRAND.name;
  const height = size;
  const width = Math.round(size * LOGO_RATIO);

  return (
    <div className={`flex min-w-0 flex-col items-start gap-0.5 ${className}`}>
      <Image
        key={src}
        src={src}
        alt={name}
        width={width}
        height={height}
        className="object-contain"
        priority
        unoptimized={src.startsWith("data:")}
      />
      {showTagline && (
        <span className="text-rainbow pl-0.5 text-[7px] font-bold uppercase tracking-[0.2em] sm:text-[8px] sm:tracking-[0.25em]">
          {localizedTagline(tagline || BRAND.tagline, language)}
        </span>
      )}
    </div>
  );
}
