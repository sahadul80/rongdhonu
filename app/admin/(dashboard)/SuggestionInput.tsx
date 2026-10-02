"use client";

import { useEffect, useId, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";

interface SuggestionInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  collection: "services" | "work" | "team" | "reviews" | "business" | "hero";
  field: string;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}

export default function SuggestionInput({
  label,
  value,
  onChange,
  collection,
  field,
  placeholder,
  inputMode = "text",
}: SuggestionInputProps) {
  const listId = useId().replace(/:/g, "");
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ collection, field });
        if (value.trim()) params.set("q", value.trim());
        const response = await fetch(`/api/admin/suggestions?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) return;
        setOptions(Array.isArray(data.values) ? data.values.filter((item: unknown): item is string => typeof item === "string") : []);
      } catch {
        if (!controller.signal.aborted) setOptions([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 160);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [collection, field, value]);

  return (
    <label className="admin-label relative">
      <span>{label}</span>
      <div className="relative">
        <input
          className="admin-input pr-16"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          list={listId}
          autoComplete="off"
        />
        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center gap-1 text-muted">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}
          <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
        </div>
      </div>
      <datalist id={listId}>
        {options.map((option) => <option key={option} value={option} />)}
      </datalist>
      {options.length > 0 ? <span className="admin-field-hint">{options.length} saved suggestion{options.length === 1 ? "" : "s"}</span> : null}
    </label>
  );
}
