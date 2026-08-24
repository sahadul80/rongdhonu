export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  bestFor: string;
  accent: "red" | "amber";
}

export const SERVICES: Service[] = [
  {
    id: "general-painting",
    name: "General Painting Work",
    category: "Painting",
    description: "Professional painting work for residential, commercial and renovation projects.",
    bestFor: "Complete spaces and property refresh",
    accent: "red",
  },
  {
    id: "wall-paint-color",
    name: "Various Wall Paint & Color Schemes",
    category: "Color & Design",
    description: "Wall paint application and coordinated color schemes designed around the character of your space.",
    bestFor: "Homes, offices and feature spaces",
    accent: "amber",
  },
  {
    id: "skim-coat",
    name: "Skim Coat Work",
    category: "Surface Preparation",
    description: "Smooth surface preparation using skim coat work before the final decorative finish.",
    bestFor: "Uneven or imperfect wall surfaces",
    accent: "red",
  },
  {
    id: "marble-painting",
    name: "Marble Painting",
    category: "Decorative Finish",
    description: "Decorative marble-effect painting for spaces that need a distinctive premium finish.",
    bestFor: "Feature walls and statement interiors",
    accent: "amber",
  },
  {
    id: "ambrose-painting",
    name: "Ambrose Painting",
    category: "Decorative Finish",
    description: "Ambrose painting work for decorative surfaces and customized interior treatments.",
    bestFor: "Decorative and premium surfaces",
    accent: "red",
  },
  {
    id: "texture-work",
    name: "Texture Work",
    category: "Texture & Feature Walls",
    description: "Texture finishes that add depth, character and visual interest to walls and selected surfaces.",
    bestFor: "Feature walls and accent areas",
    accent: "amber",
  },
];
