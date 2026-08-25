"use client";

import { useRef } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectCoverflow } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";
import type { ProcessSteps } from "../types/rong-dhonu";

interface SwiperCarouselProps {
  slides: ProcessSteps[];
  className?: string;
  componentSize?: "xs" | "sm" | "md" | "lg" | "xl";
}

export default function SwiperCarousel({
  slides,
  className = "",
  componentSize = "sm",
}: SwiperCarouselProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const sizeClasses = {
    xs: "max-w-[280px] sm:max-w-xs",
    sm: "max-w-[300px] sm:max-w-sm",
    md: "max-w-[320px] sm:max-w-md",
    lg: "max-w-[340px] sm:max-w-lg",
    xl: "max-w-[360px] sm:max-w-xl",
  };

  if (!slides?.length) return null;

  return (
    <div className={`w-full min-w-0 ${sizeClasses[componentSize]} ${className}`}>
      <Swiper
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        grabCursor
        centeredSlides
        slidesPerView={1}
        spaceBetween={-6}
        effect="coverflow"
        coverflowEffect={{
          rotate: 12,
          stretch: 0,
          depth: 70,
          modifier: 0.8,
          slideShadows: false,
        }}
        loop={slides.length > 1}
        speed={450}
        autoplay={{ delay: 6000, disableOnInteraction: true, pauseOnMouseEnter: true }}
        pagination={{ clickable: true, dynamicBullets: true }}
        modules={[Pagination, Autoplay, EffectCoverflow]}
        className="overflow-hidden! pb-10!"
      >
        {slides.map((slide, index) => (
          <SwiperSlide
            key={slide.number || index}
            className="h-100! sm:h-115! md:h-125! lg:h-[min(68svh,540px)]!"
          >
            <article className="group relative h-full w-full overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
              <Image
                src={slide.image || "/images/placeholder.jpg"}
                alt={slide.title || `Process step ${index + 1}`}
                fill
                priority={index === 0}
                className="object-cover"
                sizes="(max-width: 640px) 260px, (max-width: 768px) 300px, (max-width: 1024px) 320px, 32vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
                  Step {slide.number}
                </p>
                <h3 className="mt-2 text-lg font-black uppercase leading-tight text-white sm:text-xl">
                  {slide.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-white/85 sm:text-sm">
                  {slide.description}
                </p>
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
