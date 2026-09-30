"use client";

import { createContext, createElement, useContext, type ReactNode } from "react";
import type { CmsBusiness, CmsHeroImage, CmsReview, CmsService, CmsTeamMember, CmsWork } from "@/app/types/public-cms";

export type { CmsBusiness, CmsHeroImage, CmsReview, CmsService, CmsTeamMember, CmsWork } from "@/app/types/public-cms";

export interface CmsContent {
  business: CmsBusiness | null;
  services: CmsService[];
  reviews: CmsReview[];
  team?: CmsTeamMember[];
  work?: CmsWork[];
  heroImages: CmsHeroImage[];
}

interface CmsContextValue {
  data: CmsContent | null;
  loading: boolean;
}

// Backwards-compatible context for older imports. The landing page now uses
// section-owned lazy requests, so this provider deliberately performs no
// page-wide network request and cannot delay the first render.
const CmsContext = createContext<CmsContextValue>({ data: null, loading: false });

export function CmsContentProvider({ children }: { children: ReactNode }) {
  return createElement(CmsContext.Provider, { value: { data: null, loading: false } }, children);
}

export function useCmsContent(): CmsContextValue {
  return useContext(CmsContext);
}
