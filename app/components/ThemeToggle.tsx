"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
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
      aria-label={mounted ? `Switch to ${isDark ? "light" : "dark"} mode` : "Toggle theme"}
      title={mounted ? (theme === "system" ? "Following system appearance" : isDark ? "Dark mode" : "Light mode") : undefined}
      className={`relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-surface text-foreground transition-colors hover:border-rd-purple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rd-purple ${className}`}
    >
      {mounted && (
        <>
          <Sun
            className={`absolute h-4.5 w-4.5 text-rd-amber transition-all duration-300 ${
              isDark ? "translate-y-6 opacity-0" : "translate-y-0 opacity-100"
            }`}
          />
          <Moon
            className={`absolute h-4.5 w-4.5 text-rd-indigo transition-all duration-300 ${
              isDark ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0"
            }`}
          />
        </>
      )}
    </button>
  );
}
