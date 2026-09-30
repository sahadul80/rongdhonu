import type { Language } from "@/app/components/LanguageContext";

const PROCESS_LABELS: Record<string, { en: string; bn: string }> = {
  "process-1": { en: "Consultation", bn: "পরামর্শ" },
  "process-2": { en: "Color & Finish Plan", bn: "রং ও ফিনিশ পরিকল্পনা" },
  "process-3": { en: "Surface Preparation", bn: "সারফেস প্রস্তুতি" },
  "process-4": { en: "Execution", bn: "কাজ বাস্তবায়ন" },
  "process-5": { en: "Final Review", bn: "চূড়ান্ত পর্যালোচনা" },
};

const LABEL_ALIASES: Array<{ test: RegExp; key: keyof typeof PROCESS_LABELS }> = [
  { test: /consult/i, key: "process-1" },
  { test: /color.*finish|finish.*plan/i, key: "process-2" },
  { test: /surface.*prepar/i, key: "process-3" },
  { test: /execut/i, key: "process-4" },
  { test: /final.*review|review.*final/i, key: "process-5" },
];

export function localizedProcessLabel(slot: string, fallback: string, language: Language, position?: number): string {
  const match = String(slot || "").match(/(?:process|step)[-_]?(\d+)/i);
  if (match) {
    const item = PROCESS_LABELS[`process-${match[1]}`];
    if (item) return item[language];
  }

  if (position !== undefined && position >= 0) {
    const positional = PROCESS_LABELS[`process-${position + 1}`];
    if (positional) return positional[language];
  }

  const source = String(fallback || "");
  const alias = LABEL_ALIASES.find(({ test }) => test.test(source));
  if (alias) return PROCESS_LABELS[alias.key][language];

  if (language === "bn" && /^process\s*[—:-]/i.test(source)) {
    const trimmed = source.replace(/^process\s*[—:-]\s*/i, "");
    const inferred = LABEL_ALIASES.find(({ test }) => test.test(trimmed));
    if (inferred) return PROCESS_LABELS[inferred.key].bn;
  }

  return fallback;
}
