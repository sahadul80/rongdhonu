import Image from "next/image";
import { BRAND } from "@/app/data/brand";

export default function BannerSection() {
  return (
    <section aria-label="Rong Dhonu promotional banner" className="w-full bg-surface">
      <div className="mx-auto w-full max-w-7xl">
        <Image
          src={BRAND.assets.banner}
          alt={`${BRAND.name} — ${BRAND.tagline}`}
          width={1600}
          height={595}
          sizes="100vw"
          className="h-auto w-full object-contain"
          priority={false}
        />
      </div>
    </section>
  );
}
