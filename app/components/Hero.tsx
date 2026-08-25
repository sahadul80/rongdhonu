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
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-background pt-16 lg:min-h-[calc(100svh-4rem)] lg:h-[calc(100svh-4rem)]">
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          color: "var(--foreground)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-50 [background:radial-gradient(circle_at_90%_30%,color-mix(in_srgb,var(--rd-red)_10%,transparent),transparent_32%),radial-gradient(circle_at_15%_85%,color-mix(in_srgb,var(--rd-blue)_9%,transparent),transparent_28%),radial-gradient(circle_at_55%_0%,color-mix(in_srgb,var(--rd-green)_7%,transparent),transparent_25%)]" />
      <div className="absolute bottom-0 left-0 top-0 w-0.5 bg-rainbow opacity-70 sm:w-1" />

      <div className="relative mx-auto flex w-full max-w-7xl items-center px-4 py-10 sm:px-6 sm:py-16 lg:h-full lg:px-8 lg:py-8">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8 xl:gap-12">
          <div>
            <div className="mb-5 flex items-center gap-2 sm:mb-7 sm:gap-3">
              <div className="h-px w-8 bg-rainbow sm:w-12" />
              <span className="text-[10px] font-black uppercase tracking-[0.22em] text-rd-amber sm:text-xs sm:tracking-[0.4em]">
                Renovation & Painting Services
              </span>
            </div>

            <h1 className="max-w-3xl text-[clamp(2.5rem,12vw,4rem)] font-black uppercase leading-[0.95] text-foreground sm:text-6xl lg:text-7xl">
              COLOR.
              <br />
              DESIGN.
              <br />
              <span className="text-rainbow animate-rainbow">TRANSFORM.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted sm:mt-7 sm:text-base lg:text-lg">
              {BRAND.name} delivers painting, color, surface preparation and
              decorative finishing work for spaces that deserve a complete transformation.
            </p>

            <div className="mt-7 flex flex-wrap gap-2 sm:mt-9 sm:gap-3">
              {highlights.map((item) => (
                <span
                  key={item}
                  className="border border-border bg-surface/80 px-3 py-2 text-[9px] font-bold uppercase tracking-wider text-muted-strong sm:text-[10px]"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4">
              <a
                href="#services"
                className="w-full text-center rounded-sm bg-rd-red px-5 py-3 sm:w-auto text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-rd-pink sm:px-7 sm:py-4 sm:text-xs"
              >
                Explore Services
              </a>
              <a
                href="#contact"
                className="w-full text-center rounded-sm border border-border px-5 py-3 sm:w-auto text-[10px] font-black uppercase tracking-widest text-foreground transition-colors hover:border-rd-amber hover:text-rd-amber sm:px-7 sm:py-4 sm:text-xs"
              >
                Request a Consultation
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full min-w-0 overflow-hidden lg:max-w-[560px]">
            <section className="relative mx-auto w-full max-w-md lg:max-w-full">
              <SwiperCarousel slides={PROCESS_STEPS} className="relative" componentSize="lg" />
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
