"use client";

import { useMemo, useState } from "react";
import { SERVICES } from "@/app/data/services";
import type { ServiceAccent } from "@/app/types/rong-dhonu";

const CATEGORIES = [
  "All",
  "Painting",
  "Color & Design",
  "Surface Preparation",
  "Decorative Finish",
  "Texture & Feature Walls",
];

// Static (non-interpolated) class names so Tailwind can pick them up at build time.
const ACCENT_STYLES: Record<ServiceAccent, { border: string; bar: string; text: string }> = {
  red: { border: "border-rd-red/30 hover:border-rd-red", bar: "bg-rd-red", text: "text-rd-red" },
  orange: { border: "border-rd-orange/30 hover:border-rd-orange", bar: "bg-rd-orange", text: "text-rd-orange" },
  amber: { border: "border-rd-amber/30 hover:border-rd-amber", bar: "bg-rd-amber", text: "text-rd-amber" },
  green: { border: "border-rd-green/30 hover:border-rd-green", bar: "bg-rd-green", text: "text-rd-green" },
  teal: { border: "border-rd-teal/30 hover:border-rd-teal", bar: "bg-rd-teal", text: "text-rd-teal" },
  blue: { border: "border-rd-blue/30 hover:border-rd-blue", bar: "bg-rd-blue", text: "text-rd-blue" },
  purple: { border: "border-rd-purple/30 hover:border-rd-purple", bar: "bg-rd-purple", text: "text-rd-purple" },
  pink: { border: "border-rd-pink/30 hover:border-rd-pink", bar: "bg-rd-pink", text: "text-rd-pink" },
};

export default function ServicesSection() {
  const [category, setCategory] = useState("All");

  const services = useMemo(
    () => SERVICES.filter((service) => category === "All" || service.category === category),
    [category],
  );

  return (
    <section id="services" className="bg-background py-14 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl sm:mb-12">
          <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
            <div className="h-px w-8 bg-rainbow sm:w-12" />
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-rd-red sm:text-xs sm:tracking-[0.4em]">
              Our Services
            </span>
          </div>
          <h2 className="text-3xl font-black uppercase leading-tight text-foreground sm:text-5xl">
            FINISHES THAT <span className="text-rainbow animate-rainbow">TRANSFORM</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:mt-4 sm:text-base">
            From general painting to decorative marble, Ambrose and texture work, we
            transform surfaces through color, preparation and finish.
          </p>
        </div>

        <div className="mb-7 flex gap-2 overflow-x-auto pb-2 sm:mb-10 sm:flex-wrap sm:overflow-visible">
          {CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`shrink-0 rounded-sm border px-3 py-2 text-[9px] font-black uppercase tracking-wider transition-colors sm:px-4 sm:text-xs ${
                category === item
                  ? "border-rd-red bg-rd-red text-white"
                  : "border-border text-muted hover:border-rd-amber hover:text-rd-amber"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {services.map((service, index) => {
            const accent = ACCENT_STYLES[service.accent];

            return (
              <article
                key={service.id}
                className={`group relative overflow-hidden rounded-sm border bg-surface p-4 transition-all duration-300 sm:p-6 ${accent.border}`}
              >
                <div className={`absolute left-0 top-0 h-0.5 w-full ${accent.bar}`} />
                <div className="mb-5 flex items-start justify-between gap-3">
                  <span className={`text-xs font-black tracking-widest ${accent.text}`}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="rounded-sm border border-border px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-muted">
                    {service.category}
                  </span>
                </div>
                <h3 className="text-lg font-black leading-tight text-foreground sm:text-xl">
                  {service.name}
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-muted sm:text-sm">
                  {service.description}
                </p>
                <div className="mt-5 border-t border-border pt-4">
                  <span className="text-[8px] font-black uppercase tracking-widest text-muted sm:text-[9px]">
                    Best for
                  </span>
                  <p className="mt-1 text-xs font-bold text-muted-strong">
                    {service.bestFor}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
