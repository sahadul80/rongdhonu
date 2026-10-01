import type { Language } from "@/app/components/LanguageContext";

const PROCESS_LABELS: Record<
  string,
  {
    en: string;
    bn: string;
  }
> = {
  "process-1": {
    en: "Consultation",
    bn: "পরামর্শ",
  },

  "process-2": {
    en: "Color & Finish Plan",
    bn: "রং ও ফিনিশ পরিকল্পনা",
  },

  "process-3": {
    en: "Surface Preparation",
    bn: "সারফেস প্রস্তুতি",
  },

  "process-4": {
    en: "Execution",
    bn: "কাজ বাস্তবায়ন",
  },

  "process-5": {
    en: "Final Review",
    bn: "চূড়ান্ত পর্যালোচনা",
  },
};

const PROCESS_DESCRIPTIONS: Record<
  string,
  {
    en: string;
    bn: string;
  }
> = {
  "process-1": {
    en: "We discuss your space, requirements, preferred style, project scope, materials and expected outcome before the work begins.",
    bn: "কাজ শুরুর আগে আপনার স্পেস, প্রয়োজন, পছন্দের স্টাইল, কাজের পরিধি, উপকরণ এবং প্রত্যাশিত ফলাফল নিয়ে বিস্তারিত আলোচনা করা হয়।",
  },

  "process-2": {
    en: "We develop the right color palette, finish options and visual direction based on the space, materials and desired look.",
    bn: "স্পেস, উপকরণ এবং কাঙ্ক্ষিত লুক অনুযায়ী সঠিক রঙের প্যালেট, ফিনিশ অপশন এবং ভিজ্যুয়াল দিকনির্দেশনা নির্ধারণ করা হয়।",
  },

  "process-3": {
    en: "The surface is cleaned, repaired, leveled and properly prepared to create a strong base for a durable and refined finish.",
    bn: "দীর্ঘস্থায়ী ও সুন্দর ফিনিশ নিশ্চিত করতে সারফেস পরিষ্কার, মেরামত, সমতল এবং প্রয়োজন অনুযায়ী যথাযথভাবে প্রস্তুত করা হয়।",
  },

  "process-4": {
    en: "Our team carries out the approved work with controlled application, careful execution and consistent attention to detail.",
    bn: "অনুমোদিত পরিকল্পনা অনুযায়ী আমাদের টিম নিয়ন্ত্রিত প্রয়োগ, যত্নশীল বাস্তবায়ন এবং প্রতিটি খুঁটিনাটির প্রতি নজর রেখে কাজ সম্পন্ন করে।",
  },

  "process-5": {
    en: "We inspect the completed work, review the final finish with you and make any required adjustments before handover.",
    bn: "কাজ সম্পন্ন হওয়ার পর চূড়ান্ত ফিনিশ পরীক্ষা করা হয়, আপনার সঙ্গে পর্যালোচনা করা হয় এবং হস্তান্তরের আগে প্রয়োজনীয় সমন্বয় করা হয়।",
  },
};

const LABEL_ALIASES: Array<{
  test: RegExp;
  key: keyof typeof PROCESS_LABELS;
}> = [
  {
    test: /consult/i,
    key: "process-1",
  },
  {
    test: /color.*finish|finish.*plan/i,
    key: "process-2",
  },
  {
    test: /surface.*prepar/i,
    key: "process-3",
  },
  {
    test: /execut/i,
    key: "process-4",
  },
  {
    test: /final.*review|review.*final/i,
    key: "process-5",
  },
];

function resolveProcessKey(
  slot: string,
  fallback: string,
  position?: number,
): keyof typeof PROCESS_LABELS | null {
  /*
   * 1. Resolve from slot, e.g.
   *    process-1
   *    process_2
   *    step-3
   *    step4
   */
  const match = String(slot || "").match(
    /(?:process|step)[-_]?(\d+)/i,
  );

  if (match) {
    const key =
      `process-${match[1]}` as keyof typeof PROCESS_LABELS;

    if (PROCESS_LABELS[key]) {
      return key;
    }
  }

  /*
   * 2. Resolve by array position when no usable slot exists.
   */
  if (position !== undefined && position >= 0) {
    const positional =
      `process-${position + 1}` as keyof typeof PROCESS_LABELS;

    if (PROCESS_LABELS[positional]) {
      return positional;
    }
  }

  /*
   * 3. Resolve from the English fallback label.
   */
  const source = String(fallback || "");

  const alias = LABEL_ALIASES.find(({ test }) =>
    test.test(source),
  );

  if (alias) {
    return alias.key;
  }

  /*
   * 4. Handle labels such as:
   *    Process — Consultation
   *    Process: Execution
   *    Process - Final Review
   */
  if (/^process\s*[—:-]/i.test(source)) {
    const trimmed = source.replace(
      /^process\s*[—:-]\s*/i,
      "",
    );

    const inferred = LABEL_ALIASES.find(({ test }) =>
      test.test(trimmed),
    );

    if (inferred) {
      return inferred.key;
    }
  }

  return null;
}

export function localizedProcessLabel(
  slot: string,
  fallback: string,
  language: Language,
  position?: number,
): string {
  const key = resolveProcessKey(
    slot,
    fallback,
    position,
  );

  if (!key) {
    return fallback;
  }

  return PROCESS_LABELS[key][language];
}

export function localizedProcessDescription(
  slot: string,
  fallback: string,
  language: Language,
  position?: number,
): string {
  const key = resolveProcessKey(
    slot,
    fallback,
    position,
  );

  if (!key) {
    return fallback;
  }

  return PROCESS_DESCRIPTIONS[key][language];
}