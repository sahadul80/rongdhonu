/** Content is CMS-driven. This module intentionally contains no shipped process data. */
export interface ProcessStep {
  number: string;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  image: string;
}

export const PROCESS_STEPS: ProcessStep[] = [];
export const SERVICE_CATEGORIES: string[] = [];
