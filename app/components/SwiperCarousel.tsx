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
import { useLanguage } from "./LanguageContext";

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
  const { language } = useLanguage();
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
        spaceBetween={8}
        effect="coverflow"
        coverflowEffect={{
          rotate: 8,
          stretch: 0,
          depth: 45,
          modifier: 0.55,
          slideShadows: false,
        }}
        loop={slides.length > 1}
        speed={350}
        autoplay={{ delay: 7000, disableOnInteraction: true, pauseOnMouseEnter: true }}
        pagination={{ clickable: true, dynamicBullets: true }}
        modules={[Pagination, Autoplay, EffectCoverflow]}
        className="overflow-hidden! pb-7! contain-[layout_paint]"
      >
        {slides.map((slide, index) => (
          <SwiperSlide
            key={slide.number || index}
            className="h-80! sm:h-95! md:h-105! lg:h-[min(58svh,440px)]!"
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

                <h3 className="mt-2 text-lg font-black uppercase leading-tight text-white sm:text-xl">
                  {language === "bn" ? ["পরামর্শ", "রং ও ফিনিশ পরিকল্পনা", "সারফেস প্রস্তুতি", "কাজ সম্পাদন", "চূড়ান্ত পর্যালোচনা"][index] : slide.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-white/85 sm:text-sm">
                  {language === "bn" ? ["আপনার স্পেস, প্রয়োজন, পছন্দের ফিনিশ ও প্রত্যাশিত ফলাফল বুঝে নেওয়া।", "উপযুক্ত কালার স্কিম, সারফেস ট্রিটমেন্ট ও ডেকোরেটিভ ফিনিশের পরামর্শ।", "প্রয়োজনে স্কিম কোটসহ কাজের সারফেস প্রস্তুত করা।", "পেইন্টিং, মার্বেল, অ্যামব্রোস বা টেক্সচার কাজ নির্ভুলভাবে সম্পন্ন করা।", "সম্পন্ন কাজ পরিদর্শন করে চূড়ান্ত ফলাফল পর্যালোচনা করা।"][index] : slide.description}
                </p>
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
