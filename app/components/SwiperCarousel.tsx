'use client'
import { useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// Swiper components
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCoverflow, Navigation, Pagination, Autoplay } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { ProcessSteps } from '../types/rong-dhonu'

interface SwiperCarouselProps {
  slides: ProcessSteps[];
  className?: string;
  componentSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const SwiperCarousel: React.FC<SwiperCarouselProps> = ({ 
  slides, 
  className = '',
  componentSize = 'sm'
}) => {
  const swiperRef = useRef<SwiperType | null>(null)
  const nextArrowRef = useRef<HTMLDivElement>(null)
  const prevArrowRef = useRef<HTMLDivElement>(null)

  // Size mapping for container dimensions
  const sizeClasses = {
    xs: 'max-w-xs max-h-xs',      // 320px
    sm: 'max-w-sm max-h-sm',      // 384px
    md: 'max-w-md max-h-md',      // 448px
    lg: 'max-w-lg max-h-lg',      // 512px
    xl: 'max-w-xl max-h-xl'       // 576px
  }

  useEffect(() => {
    // Initialize navigation after component mounts
    if (swiperRef.current && nextArrowRef.current && prevArrowRef.current) {
      swiperRef.current.navigation.init()
      swiperRef.current.navigation.update()
    }
  }, [])

  // Don't render if no slides
  if (!slides || slides.length === 0) {
    return null
  }

  return (
    <div className={`relative w-full ${sizeClasses[componentSize]} mx-auto ${className}`}>
      <Swiper
        onSwiper={(swiper) => {
          swiperRef.current = swiper
        }}
        effect={'coverflow'}
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={'auto'}
        spaceBetween={20}
        loop={true}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 100,
          modifier: 2.5,
          slideShadows: false,
        }}
        navigation={{
          nextEl: '.swiper-next-arrow',
          prevEl: '.swiper-prev-arrow',
        }}
        pagination={{
          clickable: true,
          el: '.swiper-pagination',
          bulletClass: 'swiper-pagination-bullet bg-soft-sage/60 hover:bg-forest-emerald transition-all duration-300',
          bulletActiveClass: 'swiper-pagination-bullet-active !bg-forest-emerald',
        }}
        modules={[EffectCoverflow, Navigation, Pagination, Autoplay]}
        className="w-full h-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide 
            key={slide.number || index} 
            className="w-70! h-100! sm:w-[320px]! sm:h-112.5! md:w-95! md:h-125! lg:w-105! lg:h-137.5! transition-all duration-500 ease-in-out"
          >
            <div className="relative group w-full h-full">
              <div className="views-field views-field-field-image w-full h-full">
                <div className="field-content relative overflow-hidden rounded-lg shadow-xl transition-all duration-500 w-full h-full backdrop-blur-glass border-none">
                  <Image
                    src={slide.image || '/images/placeholder.jpg'}
                    alt={slide.title || 'Product image'}
                    fill
                    className="object-cover rounded-lg transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    sizes="(max-width: 640px) 280px, (max-width: 768px) 320px, (max-width: 1024px) 380px, 420px"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="text-center">
                      <Link 
                        href={slide.title ? `/process/${slide.number}` : '#'}
                        className="text-xl font-bold text-white hover:text-soft-sage transition-all duration-300 inline-block font-heading bg-forest-emerald/90 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-forest-emerald hover:scale-105"
                      >
                        {slide.description || 'Learn More'}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

export default SwiperCarousel