"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { BRAND } from "@/app/data/brand";

interface BrandLogoProps {
  size?: number;
  showTagline?: boolean;
  className?: string;
  variant?: "auto" | "color" | "reversed";
}

// Both supplied lockups use the same visual aspect ratio.
const LOGO_RATIO = 1600 / 1093;

export default function BrandLogo({
  size = 80,
  showTagline = false,
  className = "",
  variant = "auto",
}: BrandLogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark =
    variant === "reversed" ||
    (variant === "auto" && mounted && resolvedTheme === "dark");
  const src = isDark ? BRAND.assets.logoReversed : BRAND.assets.logo;
  const height = size;
  const width = Math.round(size * LOGO_RATIO);

  return (
    <div className={`flex min-w-0 flex-col items-start gap-0.5 ${className}`}>
      <Image
        key={src}
        src={src}
        alt={BRAND.name}
        width={width}
        height={height}
        className="object-contain"
        priority
      />
      {showTagline && (
        <span className="text-rainbow pl-0.5 text-[7px] font-bold uppercase tracking-[0.2em] sm:text-[8px] sm:tracking-[0.25em]">
          {BRAND.tagline}
        </span>
      )}
    </div>
  );
}
