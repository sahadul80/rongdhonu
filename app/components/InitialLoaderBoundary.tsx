"use client";

import type { ReactNode } from "react";
import AnimatedLogoLoader from "./AnimatedLogoLoader";

interface InitialLoaderBoundaryProps {
  ready: boolean;
  children: ReactNode;
  error?: boolean;
  fallback?: ReactNode;
}

/**
 * Data-gated loader only. There is intentionally no timer: the UI is released immediately
 * when the server/client data gate becomes ready.
 */
export default function InitialLoaderBoundary({ ready, children, error = false, fallback }: InitialLoaderBoundaryProps) {
  if (error) return <>{fallback ?? null}</>;
  if (ready) return <>{children}</>;
  return <AnimatedLogoLoader />;
}
