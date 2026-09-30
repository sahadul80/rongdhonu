"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useLanguage } from "./LanguageContext";

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  // Avoid a hydration mismatch: the resolved theme is only known on the client.
  useEffect(() => setMounted(true), []);

  const isDark = mounted ? resolvedTheme === "dark" : false;

  const toggle = () => {
    // Once a person picks manually we respect that choice, but starting from
    // "system" means the site still follows the OS appearance by default.
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mounted ? t(isDark ? "switchToLight" : "switchToDark") : t("toggleTheme")}
      title={mounted ? (theme === "system" ? t("themeSystem") : isDark ? t("themeDark") : t("themeLight")) : undefined}
      className={`glass-toggle tap-target relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/70 bg-background/55 backdrop-blur-xl text-foreground transition-colors hover:border-rd-purple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rd-purple ${className}`}
    >
      {mounted && (
        <>
          <Sun
            className={`absolute h-4 w-4 text-rd-amber transition-all duration-300 ${
              isDark ? "translate-y-6 opacity-0" : "translate-y-0 opacity-100"
            }`}
          />
          <Moon
            className={`absolute h-4 w-4 text-rd-indigo transition-all duration-300 ${
              isDark ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0"
            }`}
          />
        </>
      )}
    </button>
  );
}
