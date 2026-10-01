"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
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

export default function ContentDetailModal({
  open,
  title,
  onClose,
  children,
  labelledById,
}: ContentDetailModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const frame = window.requestAnimationFrame(() => {
      closeRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  useModalScrollLock(open);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="
        modal-layer
        content-modal-layer
        fixed
        inset-0
        z-100
        flex
        items-center
        justify-center
        overflow-hidden
        overscroll-none
        bg-background
        p-2
        sm:p-4
        md:p-5
      "
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="
          flex
          h-auto
          max-h-[calc(100dvh-1rem)]
          w-full
          max-w-5xl
          min-h-0
          flex-col
          overflow-hidden
          rounded-2xl
          border
          border-white/20
          bg-background/95
          shadow-2xl
          backdrop-blur-2xl
          sm:max-h-[calc(100dvh-2rem)]
          sm:rounded-3xl
          md:max-h-[calc(100dvh-2.5rem)]
        "
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledById}
        aria-label={labelledById ? undefined : title}
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >
        {/* Header */}
        <header
          className="
            flex
            shrink-0
            items-center
            justify-between
            gap-3
            border-b
            border-border
            bg-surface/95
            px-4
            py-3
            backdrop-blur-xl
            sm:px-6
          "
        >
          <h2
            id={labelledById}
            className="
              min-w-0
              flex-1
              truncate
              text-sm
              font-black
              text-foreground
              sm:text-base
              md:text-lg
            "
          >
            {title}
          </h2>

          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="
              grid
              h-9
              w-9
              shrink-0
              place-items-center
              rounded-full
              border
              border-border
              bg-background
              text-muted-strong
              transition
              hover:border-primary
              hover:text-primary
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-primary
              focus-visible:ring-offset-2
            "
            aria-label={`Close ${title}`}
          >
            <X
              className="h-4 w-4"
              aria-hidden="true"
            />
          </button>
        </header>

        {/* Content */}
        <div
          className="
            min-h-0
            overflow-x-hidden
            overflow-y-auto
            overscroll-contain
            touch-pan-y
          "
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}