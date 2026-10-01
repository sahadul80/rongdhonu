"use client";

import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import type { BusinessPublicSummary } from "@/app/types/public-cms";
import PublicSectionSkeleton from "./PublicSectionSkeleton";

const ServicesSection = lazy(() => import("./ServicesSection"));
const ProcessSection = lazy(() => import("./ProcessSection"));
const AboutSection = lazy(() => import("./AboutSection"));
const WorkSection = lazy(() => import("./WorkSection"));
const ReviewsSection = lazy(() => import("./ReviewsSection"));
const ContactTeamSection = lazy(() => import("./ContactTeamSection"));
const ContactSection = lazy(() => import("./ContactSection"));
const BannerSection = lazy(() => import("./BannerSection"));
const Footer = lazy(() => import("./Footer"));

interface ViewportLoaderProps {
  anchorId?: string;
  fallback?: ReactNode;
  children: ReactNode;
}

function ViewportLoader({ anchorId, fallback, children }: ViewportLoaderProps) {
  const [active, setActive] = useState(false);
  const nodeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node || active) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        setActive(true);
      },
      { rootMargin: "650px 0px", threshold: 0.01 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [active]);

  return <div ref={nodeRef} id={anchorId} className="min-w-0 scroll-mt-[calc(var(--nav-h)+0.9rem)]">{active ? <Suspense fallback={fallback ?? <PublicSectionSkeleton />}>{children}</Suspense> : fallback ?? <PublicSectionSkeleton />}</div>;
}

export default function LazyLandingSections({ business }: { business: BusinessPublicSummary | null }) {
  return (
    <>
      <ViewportLoader anchorId="services" fallback={<PublicSectionSkeleton variant="services" />}><ServicesSection /></ViewportLoader>
      <ViewportLoader anchorId="process" fallback={<PublicSectionSkeleton variant="process" />}><ProcessSection /></ViewportLoader>
      <ViewportLoader anchorId="about" fallback={<PublicSectionSkeleton variant="about" />}><AboutSection /></ViewportLoader>
      <ViewportLoader anchorId={business?.workSlug || "our-work"} fallback={<PublicSectionSkeleton variant="work" />}><WorkSection /></ViewportLoader>
      <ViewportLoader anchorId="reviews" fallback={<PublicSectionSkeleton variant="reviews" />}><ReviewsSection /></ViewportLoader>
      <ViewportLoader anchorId={business?.teamSlug || "our-team"} fallback={<PublicSectionSkeleton variant="team" />}><ContactTeamSection business={business} /></ViewportLoader>
      <ViewportLoader anchorId="contact" fallback={<PublicSectionSkeleton variant="contact" />}><ContactSection /></ViewportLoader>
      <ViewportLoader><BannerSection /></ViewportLoader>
      <ViewportLoader fallback={<PublicSectionSkeleton className="min-h-40" />}><Footer /></ViewportLoader>
    </>
  );
}
