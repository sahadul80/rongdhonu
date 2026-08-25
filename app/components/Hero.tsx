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
    <section className="relative flex min-h-svh items-center overflow-hidden bg-background lg:min-h-[calc(100svh-4rem)] lg:h-[calc(100svh-4rem)]">
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          color: "var(--foreground)",
        }}
      />
      <div className="pointer-events-none absolute right-0 top-1/4 h-64 w-64 rounded-full bg-rd-red/10 blur-[80px] sm:h-150 sm:w-150 sm:blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-48 w-48 rounded-full bg-rd-blue/10 blur-[60px] sm:h-100 sm:w-100 sm:blur-[100px]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-40 rounded-full bg-rd-green/10 blur-[60px] sm:h-80 sm:w-80 sm:blur-[100px]" />
      <div className="absolute bottom-0 left-0 top-0 w-0.5 bg-rainbow opacity-70 sm:w-1" />

      <div className="relative mx-auto flex w-full max-w-7xl items-center gap-10 px-6 py-16 lg:gap-8 lg:px-8 lg:py-20 xl:gap-12">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8 xl:gap-12">
          <div>

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

          <div className="relative mx-auto w-full min-w-0 overflow-hidden lg:max-w-140">
            <section className="relative mx-auto w-full max-w-md lg:max-w-full px-8 sm:px-6 lg:px-0">
              <SwiperCarousel slides={PROCESS_STEPS} className="relative" componentSize="lg" />
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
