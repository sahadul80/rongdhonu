import Image from "next/image";
import { BRAND } from "@/app/data/brand";

interface BrandLogoProps {
  size?: number;
  showTagline?: boolean;
  className?: string;
}

export default function BrandLogo({ size = 80, showTagline = false, className = "" }: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image src={BRAND.assets.logo} alt={BRAND.name} width={size} height={size} className="object-contain rounded-xl bg-white/50" />
      <div className="flex flex-col items-baseline gap-0.5">
        <span className="text-white text-sm font-bold tracking-wide">{BRAND.shortName}</span>
        {showTagline && <span className="text-amber-500 text-[8px] tracking-[0.25em] uppercase font-bold">{BRAND.tagline}</span>}
      </div>
    </div>
  );
}
