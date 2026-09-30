export type ServiceAccent =
  | "red"
  | "orange"
  | "amber"
  | "green"
  | "teal"
  | "blue"
  | "purple"
  | "pink";

export interface Service {
  id: string;
  name: string;
  nameBn?: string | null;
  category: string;
  categoryBn?: string | null;
  description: string;
  descriptionBn?: string | null;
  bestFor: string;
  bestForBn?: string | null;
  accent: ServiceAccent;
}

export interface ProcessSteps {
  number: string;
  title: string;
  description?: string;
  image?: string;
}[]