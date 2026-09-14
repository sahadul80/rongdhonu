"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Language = "en" | "bn";

type Dictionary = Record<string, { en: string; bn: string }>;

export const DICTIONARY: Dictionary = {
  services: { en: "Services", bn: "সেবাসমূহ" },
  process: { en: "Process", bn: "প্রক্রিয়া" },
  about: { en: "About", bn: "আমাদের সম্পর্কে" },
  contact: { en: "Contact", bn: "যোগাযোগ" },
  getInTouch: { en: "Get in Touch", bn: "যোগাযোগ করুন" },
  requestConsultation: { en: "Request Consultation", bn: "পরামর্শের জন্য যোগাযোগ করুন" },
  ourServices: { en: "Our Services", bn: "আমাদের সেবাসমূহ" },
  finishesTransform: { en: "FINISHES THAT TRANSFORM", bn: "ফিনিশিংয়ে নতুন রূপ" },
  servicesIntro: { en: "From general painting to decorative marble, Ambrose and texture work, we transform surfaces through color, preparation and finish.", bn: "সাধারণ পেইন্টিং থেকে ডেকোরেটিভ মার্বেল, অ্যামব্রোস ও টেক্সচার কাজ—রং, প্রস্তুতি ও ফিনিশিংয়ের মাধ্যমে আমরা আপনার স্থানকে নতুন রূপ দিই।" },
  all: { en: "All", bn: "সব" },
  painting: { en: "Painting", bn: "পেইন্টিং" },
  colorDesign: { en: "Color & Design", bn: "রং ও ডিজাইন" },
  surfacePreparation: { en: "Surface Preparation", bn: "সারফেস প্রস্তুতি" },
  decorativeFinish: { en: "Decorative Finish", bn: "ডেকোরেটিভ ফিনিশ" },
  textureWalls: { en: "Texture & Feature Walls", bn: "টেক্সচার ও ফিচার ওয়াল" },
  aboutCompany: { en: "About the Company", bn: "প্রতিষ্ঠান সম্পর্কে" },
  partnerSpace: { en: "A FINISHING PARTNER FOR YOUR SPACE", bn: "আপনার স্পেসের ফিনিশিং পার্টনার" },
  aboutText: { en: "is positioned around a simple promise: Color, Design and Transform. Our service offering focuses on painting, wall color schemes, surface preparation and decorative finishing work.", bn: "একটি সহজ প্রতিশ্রুতিকে সামনে রেখে কাজ করে: রং, ডিজাইন ও রূপান্তর। আমাদের সেবায় রয়েছে পেইন্টিং, দেয়ালের রং, সারফেস প্রস্তুতি ও ডেকোরেটিভ ফিনিশিং।" },
  aboutGoal: { en: "The goal is not simply to apply paint—it is to create a finish that works with the space, the design and the client's intended result.", bn: "লক্ষ্য শুধু রং করা নয়—স্পেস, ডিজাইন ও ক্লায়েন্টের প্রত্যাশিত ফলাফলের সঙ্গে সামঞ্জস্যপূর্ণ একটি সুন্দর ফিনিশ তৈরি করা।" },
  colorPlanning: { en: "Color Planning", bn: "রং পরিকল্পনা" },
  colorPlanningDesc: { en: "Choose coordinated wall colors and finish combinations for the character of your space.", bn: "আপনার স্পেসের বৈশিষ্ট্য অনুযায়ী সমন্বিত দেয়ালের রং ও ফিনিশ নির্বাচন।" },
  prepDesc: { en: "Prepare walls properly, including skim coat work where required before finishing.", bn: "প্রয়োজনে স্কিম কোটসহ ফিনিশিংয়ের আগে দেয়াল সঠিকভাবে প্রস্তুত করা।" },
  decorativeDesc: { en: "Create distinctive surfaces through marble painting, Ambrose painting and texture work.", bn: "মার্বেল, অ্যামব্রোস ও টেক্সচার কাজের মাধ্যমে স্বতন্ত্র সারফেস তৈরি করা।" },
  transformation: { en: "Transformation", bn: "রূপান্তর" },
  transformationDesc: { en: "Bring the selected finish together into a consistent, polished renovation result.", bn: "নির্বাচিত ফিনিশকে সমন্বিত করে পরিপাটি ও সম্পূর্ণ রেনোভেশন ফলাফল তৈরি করা।" },
  howWork: { en: "How We Work", bn: "আমরা যেভাবে কাজ করি" },
  ideaFinish: { en: "FROM IDEA TO FINISH", bn: "আইডিয়া থেকে ফিনিশিং" },
  stepOf: { en: "Step", bn: "ধাপ" },
  pause: { en: "Pause auto-play", bn: "অটো-প্লে থামান" },
  play: { en: "Play steps", bn: "ধাপ চালু করুন" },
  contactUs: { en: "Contact Us", bn: "যোগাযোগ করুন" },
  readyTransform: { en: "READY TO TRANSFORM?", bn: "রূপান্তরের জন্য প্রস্তুত?" },
  contactIntro: { en: "Tell us about the space, the finish you want and the type of work you need. We can then discuss the most suitable service approach.", bn: "আপনার স্পেস, পছন্দের ফিনিশ এবং কাজের ধরন সম্পর্কে জানান। এরপর আমরা উপযুক্ত সেবা পদ্ধতি নিয়ে আলোচনা করতে পারি।" },
  emailUs: { en: "Email Us", bn: "ইমেইল করুন" },
  callUs: { en: "Call Us", bn: "কল করুন" },
  businessInfo: { en: "Business Information", bn: "ব্যবসায়িক তথ্য" },
  coreOffering: { en: "Core Offering", bn: "প্রধান সেবা" },
  openMaps: { en: "Open in Google Maps →", bn: "Google Maps-এ খুলুন →" },
  discussProject: { en: "DISCUSS YOUR PROJECT", bn: "আপনার প্রজেক্ট নিয়ে আলোচনা করুন" },
  newsletterText: { en: "Leave your email and start a conversation about your painting, color, surface or decorative finishing requirements.", bn: "আপনার ইমেইল দিন এবং পেইন্টিং, রং, সারফেস বা ডেকোরেটিভ ফিনিশিংয়ের প্রয়োজন নিয়ে আলোচনা শুরু করুন।" },
  startEnquiry: { en: "Start Enquiry", bn: "অনুসন্ধান শুরু করুন" },
  thankYou: { en: "Thank you. Your enquiry has been received.", bn: "ধন্যবাদ। আপনার অনুসন্ধান গ্রহণ করা হয়েছে।" },
  reviews: { en: "Customer Reviews", bn: "গ্রাহকের মতামত" },
  reviewTitle: { en: "WHAT OUR CLIENTS SAY", bn: "আমাদের ক্লায়েন্টরা কী বলেন" },
  reviewIntro: { en: "Real experiences from clients who trusted us with their spaces.", bn: "যেসব ক্লায়েন্ট তাদের স্পেসের দায়িত্ব আমাদের দিয়েছেন, তাদের অভিজ্ঞতা।" },
  language: { en: "Language", bn: "ভাষা" },
  menu: { en: "Menu", bn: "মেনু" },
  address: { en: "Address", bn: "ঠিকানা" },
  phone: { en: "Phone", bn: "ফোন" },
  email: { en: "Email", bn: "ইমেইল" },
  website: { en: "Website", bn: "ওয়েবসাইট" },
};

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: keyof typeof DICTIONARY) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  useEffect(() => {
    document.documentElement.lang = language === "bn" ? "bn" : "en";
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    t: (key: keyof typeof DICTIONARY) => DICTIONARY[key][language],
  }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
