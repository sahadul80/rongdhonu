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
  category: string;
  description: string;
  bestFor: string;
  accent: ServiceAccent;
}

export interface ProcessSteps {
  number: string;
  title: string;
  description?: string;
  image?: string;
}[]