"use client";

import Image from "next/image";
import { BRAND, localizedTagline } from "@/app/data/brand";
import { useLanguage } from "./LanguageContext";

const OUTER_POLYGON = "100,12 130,20 156,15 181,35 190,67 185,96 191,126 176,151 166,180 136,186 108,194 82,184 54,188 31,170 22,143 10,117 16,88 11,59 28,36 58,25";
const MIDDLE_POLYGON = "100,27 124,31 146,27 166,45 174,69 168,91 176,114 161,135 156,160 130,166 104,172 78,163 55,167 37,149 31,126 24,104 31,81 27,59 48,43 70,35";
const INNER_POLYGON = "100,40 119,44 136,42 151,56 157,75 151,94 158,111 146,127 138,145 116,149 97,156 78,147 60,151 47,137 42,117 36,100 43,80 40,63 59,52 79,45";

export default function AnimatedLogoLoader() {
  const { t, language, pick } = useLanguage();

  return (
    <div
      className="fixed inset-0 z-1200 grid place-items-center bg-background"
      role="status"
      aria-label={`${t("loadingSite")} ${pick(BRAND.name, BRAND.nameBn)}`}
    >
      <div className="relative grid place-items-center">
        <svg
          aria-hidden="true"
          viewBox="0 0 200 200"
          className="pointer-events-none absolute h-64 w-[16rem] sm:h-86 sm:w-86 z-10"
        >
          <defs>
            <linearGradient id="rd-loader-rainbow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--rd-red)" />
              <stop offset="12%" stopColor="var(--rd-orange)" />
              <stop offset="24%" stopColor="var(--rd-yellow)" />
              <stop offset="36%" stopColor="var(--rd-green)" />
              <stop offset="48%" stopColor="var(--rd-teal)" />
              <stop offset="60%" stopColor="var(--rd-blue)" />
              <stop offset="72%" stopColor="var(--rd-indigo)" />
              <stop offset="84%" stopColor="var(--rd-purple)" />
              <stop offset="94%" stopColor="var(--rd-pink)" />
              <stop offset="100%" stopColor="var(--rd-red)" />
            </linearGradient>
          </defs>
          <g className="loader-polygon loader-polygon-outer" transform="rotate(-8 100 100)">
            <polygon points={OUTER_POLYGON} fill="none" stroke="url(#rd-loader-rainbow)" strokeWidth="2.2" strokeLinejoin="round" />
          </g>
          <g className="loader-polygon loader-polygon-middle" transform="rotate(11 100 100)">
            <polygon points={MIDDLE_POLYGON} fill="none" stroke="url(#rd-loader-rainbow)" strokeWidth="2" strokeLinejoin="round" />
          </g>
          <g className="loader-polygon loader-polygon-inner" transform="rotate(-14 100 100)">
            <polygon points={INNER_POLYGON} fill="none" stroke="url(#rd-loader-rainbow)" strokeWidth="1.8" strokeLinejoin="round" />
          </g>
        </svg>

        <div className="relative z-10 grid h-32 w-32 place-items-center sm:h-40 sm:w-40">
          <Image
            src={BRAND.assets.logo}
            alt={BRAND.name}
            fill
            priority
            sizes="(min-width: 640px) 160px, 128px"
            className="object-contain p-5"
          />
        </div>

        <div className="mt-9 text-center">
          <div className="text-sm font-black uppercase tracking-[0.25em] text-foreground sm:text-base">
            {pick(BRAND.shortName, BRAND.nameBn)}
          </div>
          <div className="text-rainbow animate-rainbow mt-2 text-[9px] font-bold uppercase tracking-[0.35em] sm:text-[10px]">
            {localizedTagline(BRAND.tagline, language)}
          </div>
        </div>
      </div>
    </div>
  );
}
