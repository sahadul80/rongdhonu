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
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black" role="status" aria-label="Loading Rong Dhonu Renovation Limited">
      <div className="relative flex flex-col items-center">
        <div className="absolute -inset-8 rounded-full border border-red-600/20 animate-ping" />
        <div className="absolute -inset-5 rounded-full border border-amber-500/30 animate-[spin_3s_linear_infinite]" />
        <div className="relative h-32 w-32 sm:h-40 sm:w-40 overflow-hidden rounded-full bg-white shadow-2xl animate-[pulse_1.8s_ease-in-out_infinite]">
          <Image src={BRAND.assets.logo} alt={BRAND.name} fill priority className="object-contain p-2" />
        </div>
        <div className="mt-7 text-center">
          <div className="text-white font-black text-sm sm:text-base tracking-[0.25em] uppercase">{BRAND.shortName}</div>
          <div className="mt-2 text-amber-500 text-[9px] sm:text-[10px] font-bold tracking-[0.35em] uppercase">{BRAND.tagline}</div>
          <div className="mt-5 h-0.5 w-40 overflow-hidden bg-neutral-800">
            <div className="h-full w-full origin-left animate-[loader_1.8s_ease-out_forwards] bg-linear-to-r from-red-600 via-amber-500 to-green-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
