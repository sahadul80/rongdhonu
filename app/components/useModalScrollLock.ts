"use client";

import { useEffect } from "react";

let lockCount = 0;
let lockedScrollY = 0;
let savedScrollbarCompensation = "";

export function useModalScrollLock(open: boolean) {
  useEffect(() => {
    if (!open) return;

    const html = document.documentElement;
    const body = document.body;

    if (lockCount === 0) {
      lockedScrollY = window.scrollY;
      savedScrollbarCompensation = body.style.paddingRight;

      const scrollbarWidth = Math.max(0, window.innerWidth - html.clientWidth);
      html.dataset.modalScrollLocked = "true";
      html.style.overflow = "hidden";
      html.style.overscrollBehavior = "none";
      html.style.scrollBehavior = "auto";
      body.style.overflow = "hidden";
      body.style.paddingRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : savedScrollbarCompensation;
    }

    lockCount += 1;

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount > 0) return;

      html.removeAttribute("data-modal-scroll-locked");
      html.style.overflow = "";
      html.style.overscrollBehavior = "";
      body.style.overflow = "";
      body.style.paddingRight = savedScrollbarCompensation;
      // html still has scroll-behavior:auto inline here, so the restore is instant, not a smooth animation.
      window.scrollTo(0, lockedScrollY);
      html.style.scrollBehavior = "";
    };
  }, [open]);
}
