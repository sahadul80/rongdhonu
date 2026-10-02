"use client";

import { LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface AdminActionButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children: ReactNode;
  loading?: boolean;
  loadingLabel?: string;
  icon?: ReactNode;
}

export default function AdminActionButton({
  children,
  loading = false,
  loadingLabel = "Working…",
  icon,
  className = "",
  disabled,
  ...props
}: AdminActionButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`${className} disabled:cursor-wait disabled:opacity-60`}
    >
      {loading ? (
        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        icon ?? null
      )}
      <span>{loading ? loadingLabel : children}</span>
    </button>
  );
}
