"use client";

import { useMemo, useState } from "react";
import { SERVICES } from "@/app/data/services";

const CATEGORIES = [
  "All",
  "Painting",
  "Color & Design",
  "Surface Preparation",
  "Decorative Finish",
  "Texture & Feature Walls",
];

export default function ServicesSection() {
  const [category, setCategory] = useState("All");

  const services = useMemo(
    () => SERVICES.filter((service) => category === "All" || service.category === category),
    [category],
  );

  return (
    <section id="services" className="bg-black py-14 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-3xl sm:mb-12">
          <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
            <div className="h-px w-8 bg-red-600 sm:w-12" />
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-red-500 sm:text-xs sm:tracking-[0.4em]">
              Our Services
            </span>
          </div>
          <h2 className="text-3xl font-black uppercase leading-tight text-white sm:text-5xl">
            FINISHES THAT <span className="text-red-600">TRANSFORM</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-400 sm:mt-4 sm:text-base">
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
                  ? "border-red-600 bg-red-600 text-white"
                  : "border-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {services.map((service, index) => {
            const accent =
              service.accent === "amber"
                ? "border-amber-500/30 hover:border-amber-500"
                : "border-red-600/30 hover:border-red-600";

            const accentText =
              service.accent === "amber" ? "text-amber-500" : "text-red-500";

            return (
              <article
                key={service.id}
                className={`group relative overflow-hidden rounded-sm border bg-neutral-950 p-4 transition-all duration-300 sm:p-6 ${accent}`}
              >
                <div
                  className={`absolute left-0 top-0 h-0.5 w-full ${
                    service.accent === "amber" ? "bg-amber-500" : "bg-red-600"
                  }`}
                />
                <div className="mb-5 flex items-start justify-between gap-3">
                  <span className={`text-xs font-black tracking-widest ${accentText}`}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="rounded-sm border border-neutral-800 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-neutral-500">
                    {service.category}
                  </span>
                </div>
                <h3 className="text-lg font-black leading-tight text-white sm:text-xl">
                  {service.name}
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-neutral-400 sm:text-sm">
                  {service.description}
                </p>
                <div className="mt-5 border-t border-neutral-800 pt-4">
                  <span className="text-[8px] font-black uppercase tracking-widest text-neutral-600 sm:text-[9px]">
                    Best for
                  </span>
                  <p className="mt-1 text-xs font-bold text-neutral-300">
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
