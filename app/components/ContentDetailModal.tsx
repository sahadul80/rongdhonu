"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useModalScrollLock } from "./useModalScrollLock";

interface ContentDetailModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  labelledById?: string;
}

export default function ContentDetailModal({ open, title, onClose, children, labelledById }: ContentDetailModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => closeRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useModalScrollLock(open);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="modal-layer fixed inset-0 z-1000 isolate flex items-center justify-center overscroll-none bg-black/60 p-3 backdrop-blur-[3px] sm:p-5 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="flex max-h-[92dvh] w-full max-w-4xl min-h-0 flex-col overflow-hidden rounded-2xl border border-white/20 bg-background/95 shadow-2xl backdrop-blur-2xl sm:max-h-[88dvh] sm:rounded-3xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledById}
        aria-label={labelledById ? undefined : title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-surface px-4 py-3 sm:px-6">
          <h2 id={labelledById} className="min-w-0 truncate text-base font-black text-foreground sm:text-lg">
            {title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-background text-muted-strong transition hover:border-primary hover:text-primary"
            aria-label={`Close ${title}`}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
