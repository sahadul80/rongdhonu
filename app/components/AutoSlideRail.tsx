"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";

interface AutoSlideRailProps {
  children: ReactNode;
  label: string;
  intervalMs?: number;
}

/**
 * Horizontal card rail that advances by one card on a timer, loops back to the start,
 * pauses while hovered / focused / touched / off-screen, and respects reduced motion.
 */
export default function AutoSlideRail({ children, label, intervalMs = 3800 }: AutoSlideRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const visibleRef = useRef(true);
  const [index, setIndex] = useState(0);
  const count = Children.count(children);

  const step = useCallback(() => {
    const rail = railRef.current;
    const first = rail?.firstElementChild as HTMLElement | null;
    if (!rail || !first) return 0;
    const gap = Number.parseFloat(getComputedStyle(rail).columnGap) || 0;
    return first.offsetWidth + gap;
  }, []);

  const goTo = useCallback((target: number) => {
    railRef.current?.scrollTo({ left: target * step(), behavior: "smooth" });
  }, [step]);

  const advance = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const atEnd = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4;
    if (atEnd) rail.scrollTo({ left: 0, behavior: "smooth" });
    else rail.scrollBy({ left: step(), behavior: "smooth" });
  }, [step]);

  useEffect(() => {
    if (count < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (!pausedRef.current && visibleRef.current && !document.hidden) advance();
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [advance, count, intervalMs]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const observer = new IntersectionObserver(([entry]) => { visibleRef.current = Boolean(entry?.isIntersecting); }, { threshold: 0.25 });
    observer.observe(rail);
    return () => observer.disconnect();
  }, []);

  const onScroll = () => {
    const rail = railRef.current;
    const size = step();
    if (!rail || !size) return;
    const atEnd = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4;
    setIndex(atEnd ? count - 1 : Math.round(rail.scrollLeft / size));
  };

  const pause = () => { pausedRef.current = true; };
  const resume = () => { pausedRef.current = false; };

  return (
    <div onMouseEnter={pause} onMouseLeave={resume} onFocus={pause} onBlur={resume} onTouchStart={pause} onTouchEnd={() => window.setTimeout(resume, 2500)}>
      <div ref={railRef} onScroll={onScroll} className="auto-rail" role="group" aria-roledescription="carousel" aria-label={label} tabIndex={0}>
        {children}
      </div>
      {count > 1 && (
        <div className="mt-2.5 flex justify-center gap-1.5" role="tablist" aria-label={label}>
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`${i + 1} / ${count}`}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-6 bg-primary" : "w-1.5 bg-border hover:bg-muted"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
