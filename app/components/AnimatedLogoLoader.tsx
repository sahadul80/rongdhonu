"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { BRAND } from "@/app/data/brand";

interface AnimatedLogoLoaderProps {
  duration?: number;
  onComplete?: () => void;
}

export default function AnimatedLogoLoader({ duration = 1800, onComplete }: AnimatedLogoLoaderProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, duration);
    return () => window.clearTimeout(timer);
  }, [duration, onComplete]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-background"
      role="status"
      aria-label="Loading Rong Dhonu Renovation Limited"
    >
      <div className="relative flex flex-col items-center">
        <div className="absolute -inset-8 rounded-full border border-rd-red/20 animate-pulse" />
        <div className="absolute -inset-5 rounded-full border border-rd-amber/30 animate-[spin_3s_linear_infinite]" />
        <div className="relative h-32 w-32 sm:h-40 sm:w-40 overflow-hidden rounded-full bg-white/50 shadow-lg">
          <Image
            src={BRAND.assets.logo}
            alt={BRAND.name}
            fill
            priority
            sizes="(min-width: 640px) 160px, 128px"
            className="object-contain p-2"
          />
        </div>
        <div className="mt-7 text-center">
          <div className="text-foreground font-black text-sm sm:text-base tracking-[0.25em] uppercase">
            {BRAND.shortName}
          </div>
          <div className="mt-2 text-rainbow animate-rainbow text-[9px] sm:text-[10px] font-bold tracking-[0.35em] uppercase">
            {BRAND.tagline}
          </div>
          <div className="mt-5 h-0.5 w-40 overflow-hidden bg-surface-2">
            <div className="h-full w-full origin-left animate-[loader_1.8s_ease-out_forwards] bg-rainbow" />
          </div>
        </div>
      </div>
    </div>
  );
}
