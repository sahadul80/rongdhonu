import Image from "next/image";
import { BRAND } from "@/app/data/brand";
import SwiperCarousel from "./SwiperCarousel";
import { PROCESS_STEPS } from "../data/content";

const highlights = [
  "General painting",
  "Wall color schemes",
  "Skim coat work",
  "Decorative finishes",
  "Texture work",
];

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-black pt-16">
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="pointer-events-none absolute right-0 top-1/4 h-64 w-64 rounded-full bg-red-600/10 blur-[80px] sm:h-150 sm:w-150 sm:blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-48 w-48 rounded-full bg-amber-500/10 blur-[60px] sm:h-100 sm:w-100 sm:blur-[100px]" />
      <div className="absolute bottom-0 left-0 top-0 w-0.5 bg-linear-to-b from-transparent via-red-600 to-transparent opacity-60 sm:w-1" />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div>
            <div className="mb-5 flex items-center gap-2 sm:mb-7 sm:gap-3">
              <div className="h-px w-8 bg-amber-500 sm:w-12" />
              <span className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-500 sm:text-xs sm:tracking-[0.4em]">
                Renovation & Painting Services
              </span>
            </div>

            <h1 className="max-w-3xl text-4xl font-black uppercase leading-[0.95] text-white sm:text-6xl lg:text-7xl">
              COLOR.
              <br />
              DESIGN.
              <br />
              <span className="text-red-600">TRANSFORM.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-neutral-400 sm:mt-7 sm:text-base lg:text-lg">
              {BRAND.name} delivers painting, color, surface preparation and
              decorative finishing work for spaces that deserve a complete transformation.
            </p>

            <div className="mt-7 flex flex-wrap gap-2 sm:mt-9 sm:gap-3">
              {highlights.map((item) => (
                <span
                  key={item}
                  className="border border-neutral-800 bg-neutral-950/80 px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-neutral-300 sm:text-[10px]"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3 sm:mt-10 sm:gap-4">
              <a
                href="#services"
                className="rounded-sm bg-red-600 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-red-500 sm:px-7 sm:py-4 sm:text-xs"
              >
                Explore Services
              </a>
              <a
                href="#contact"
                className="rounded-sm border border-neutral-700 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:border-amber-500 hover:text-amber-500 sm:px-7 sm:py-4 sm:text-xs"
              >
                Request a Consultation
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <section className="relative mx-auto max-w-md">
            <SwiperCarousel slides={PROCESS_STEPS} className="relative" componentSize="lg" />
          </section>
          </div>
        </div>
      </div>
    </section>
  );
}
