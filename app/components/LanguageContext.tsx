"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Language = "en" | "bn";

type Dictionary = Record<string, { en: string; bn: string }>;

export const DICTIONARY: Dictionary = {
  services: { en: "Services", bn: "সেবাসমূহ" },
  work: { en: "Our Work", bn: "আমাদের কাজ" },
  viewProfile: { en: "View Profile", bn: "প্রোফাইল দেখুন" },
  selectedWork: { en: "Selected Work", bn: "নির্বাচিত কাজ" },
  workIntro: { en: "Browse published projects. Select a project to view the full details and related client reviews.", bn: "প্রকাশিত প্রজেক্টগুলো দেখুন। বিস্তারিত তথ্য ও সংশ্লিষ্ট ক্লায়েন্টের মতামত দেখতে একটি প্রজেক্ট নির্বাচন করুন।" },
  viewDetails: { en: "View Details", bn: "বিস্তারিত দেখুন" },
  relatedReviews: { en: "Related client reviews", bn: "সংশ্লিষ্ট ক্লায়েন্টের মতামত" },
  noRelatedReviews: { en: "No related reviews.", bn: "কোনও সংশ্লিষ্ট মতামত নেই।" },
  viewRoadMap: { en: "View Roadmap", bn: "রোডম্যাপ দেখুন" },

  process: { en: "Process", bn: "প্রক্রিয়া" },
  about: { en: "About", bn: "আমাদের সম্পর্কে" },
  aboutUs: { en: "About Us", bn: "আমাদের সম্পর্কে" },
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
  pause: { en: "Pause Autoplay", bn: "অটো-প্লে থামান" },
  play: { en: "Play Steps", bn: "ধাপ চালু করুন" },
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
  team: { en: "Our Team", bn: "আমাদের দল" },
  teamTitle: { en: "THE PEOPLE BEHIND THE FINISH", bn: "ফিনিশের পেছনের মানুষগুলো" },
  teamIntro: { en: "Meet the people who plan, prepare and finish every project.", bn: "যাঁরা প্রতিটি প্রজেক্টের পরিকল্পনা, প্রস্তুতি ও ফিনিশিং করেন, তাঁদের সঙ্গে পরিচিত হোন।" },
  language: { en: "Language", bn: "ভাষা" },
  menu: { en: "Menu", bn: "মেনু" },
  address: { en: "Address", bn: "ঠিকানা" },
  phone: { en: "Phone", bn: "ফোন" },
  email: { en: "Email", bn: "ইমেইল" },
  website: { en: "Website", bn: "ওয়েবসাইট" },

  // ── Navigation / accessibility labels
  primaryNav: { en: "Primary navigation", bn: "প্রধান নেভিগেশন" },
  sectionLinks: { en: "Section links", bn: "সেকশন লিংক" },
  mobileNav: { en: "Mobile navigation", bn: "মোবাইল নেভিগেশন" },
  openMenu: { en: "Open navigation menu", bn: "নেভিগেশন মেনু খুলুন" },
  closeMenu: { en: "Close navigation menu", bn: "নেভিগেশন মেনু বন্ধ করুন" },
  closeMenuShort: { en: "Close menu", bn: "মেনু বন্ধ করুন" },
  homeAria: { en: "home", bn: "হোম" },
  switchToLight: { en: "Switch to light mode", bn: "লাইট মোডে যান" },
  switchToDark: { en: "Switch to dark mode", bn: "ডার্ক মোডে যান" },
  toggleTheme: { en: "Toggle theme", bn: "থিম পরিবর্তন করুন" },
  themeSystem: { en: "Following system appearance", bn: "সিস্টেমের থিম অনুসরণ করছে" },
  themeDark: { en: "Dark mode", bn: "ডার্ক মোড" },
  themeLight: { en: "Light mode", bn: "লাইট মোড" },
  loadingSite: { en: "Loading", bn: "লোড হচ্ছে" },
  bannerLabel: { en: "promotional banner", bn: "প্রচারমূলক ব্যানার" },

  // ── Services / process / reviews
  bestFor: { en: "Best for", bn: "যাদের জন্য উপযুক্ত" },
  processSteps: { en: "Process steps", bn: "কাজের ধাপসমূহ" },
  processStepAlt: { en: "Process step", bn: "প্রক্রিয়ার ধাপ" },
  fiveStars: { en: "5 stars", bn: "৫ স্টার" },
  clientRole: { en: "Client", bn: "ক্লায়েন্ট" },

  // ── Contact section
  dhaka: { en: "Dhaka", bn: "ঢাকা" },
  officeLocation: { en: "Office location", bn: "অফিসের অবস্থান" },
  mapTitle: { en: "location on Google Maps", bn: "গুগল ম্যাপে অবস্থান" },
  coreOfferingList: { en: "Painting · Color Schemes · Skim Coat · Marble · Ambrose · Texture", bn: "পেইন্টিং · কালার স্কিম · স্কিম কোট · মার্বেল · অ্যামব্রোস · টেক্সচার" },
  nextStep: { en: "Your next step", bn: "আপনার পরবর্তী ধাপ" },
  nextStepText: { en: "Tell us about your space and the work you need, and we can discuss the right finish and next steps.", bn: "আপনার স্পেস ও কাজের ধরন জানালে আমরা উপযুক্ত ফিনিশিং ও পরবর্তী পদক্ষেপ নিয়ে আলোচনা করতে পারি।" },

  // ── Enquiry form
  formName: { en: "Your name", bn: "আপনার নাম" },
  formEmail: { en: "your@email.com", bn: "আপনার ইমেইল" },
  formPhone: { en: "Phone (optional)", bn: "ফোন (ঐচ্ছিক)" },
  formService: { en: "Service you're interested in (optional)", bn: "আপনি কোন সেবায় আগ্রহী (ঐচ্ছিক)" },
  formMessage: { en: "Tell us about your space and what you need…", bn: "আপনার স্পেস ও কী প্রয়োজন তা জানান…" },
  formSending: { en: "Sending…", bn: "পাঠানো হচ্ছে…" },
  errRequired: { en: "Please fill in your name, email and a short message.", bn: "অনুগ্রহ করে আপনার নাম, ইমেইল ও একটি সংক্ষিপ্ত বার্তা লিখুন।" },
  errInvalidEmail: { en: "Enter a valid email address.", bn: "সঠিক ইমেইল ঠিকানা লিখুন।" },
  errGeneric: { en: "Something went wrong. Please try again.", bn: "কিছু একটা ভুল হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" },
  errNetwork: { en: "Could not reach the server. Please try again.", bn: "সার্ভারের সাথে সংযোগ করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।" },

  // ── Footer
  builtBy: { en: "by", bn: "নির্মাণে" },
};

const BENGALI_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"] as const;

/** 2026 → ২০২৬ (only in Bangla; returns plain digits for English). */
export function formatDigits(value: number | string, language: Language): string {
  const text = String(value);
  return language === "bn" ? text.replace(/[0-9]/g, (digit) => BENGALI_DIGITS[Number(digit)]) : text;
}

const STORAGE_KEY = "rd_language";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: keyof typeof DICTIONARY) => string;
  /** Picks the text for the current language. */
  pick: (en: string, bn: string | null | undefined) => string;
  /** Digits in the current language's numerals. */
  n: (value: number | string) => string;
  /** BCP-47 locale for Date/Number formatting. */
  locale: string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  // Restore the visitor's last choice after hydration (reading storage during the first
  // render would make server and client HTML differ).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "bn" || saved === "en") setLanguageState(saved);
    } catch {
      // Storage can be blocked (private mode) — the default language is fine.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === "bn" ? "bn" : "en";
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage: (next: Language) => {
      setLanguageState(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore
      }
    },
    t: (key: keyof typeof DICTIONARY) => DICTIONARY[key][language],
    pick: (en: string, bn: string | null | undefined) => (language === "bn" && bn ? bn : en),
    n: (input: number | string) => formatDigits(input, language),
    locale: language === "bn" ? "bn-BD" : "en-US",
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
