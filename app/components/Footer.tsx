import { BRAND } from "@/app/data/brand";
import BrandLogo from "./BrandLogo";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-900 bg-black py-8 sm:py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:px-6 lg:flex-row lg:px-8">
        <BrandLogo size={42} showTagline />
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          <a href={`mailto:${BRAND.email}`} className="text-[9px] uppercase tracking-widest text-neutral-600 hover:text-amber-500 sm:text-xs">Email</a>
          <a href={`tel:${BRAND.phone.replace(/[^0-9+]/g, "")}`} className="text-[9px] uppercase tracking-widest text-neutral-600 hover:text-amber-500 sm:text-xs">Phone</a>
          <a href={`https://${BRAND.website}`} className="text-[9px] uppercase tracking-widest text-neutral-600 hover:text-amber-500 sm:text-xs">Website</a>
        </div>
        <p className="text-[9px] text-neutral-700 sm:text-xs">© 2026 {BRAND.name}</p>
      </div>
    </footer>
  );
}
