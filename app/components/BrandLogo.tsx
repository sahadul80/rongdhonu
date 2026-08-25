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
      <div className="rainbow-ring rounded-xl">
        <Image
          src={BRAND.assets.logo}
          alt={BRAND.name}
          width={size}
          height={size}
          className="rounded-xl bg-white object-contain"
        />
      </div>
      <div className="flex flex-col items-baseline gap-0.5">
        <span className="text-sm font-bold tracking-wide text-foreground">{BRAND.shortName}</span>
        {showTagline && (
          <span className="text-rainbow animate-rainbow text-[8px] font-bold uppercase tracking-[0.25em]">
            {BRAND.tagline}
          </span>
        )}
      </div>
    </div>
  );
}
