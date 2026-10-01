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
      html.style.scrollBehavior = "auto";
      body.style.overflow = "hidden";
      body.style.paddingRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : savedScrollbarCompensation;
      body.style.touchAction = "none";
    }

    lockCount += 1;

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount > 0) return;

      html.removeAttribute("data-modal-scroll-locked");
      html.style.overflow = "";
      html.style.scrollBehavior = "";
      body.style.overflow = "";
      body.style.paddingRight = savedScrollbarCompensation;
      body.style.touchAction = "";
      window.scrollTo({ top: lockedScrollY, behavior: "auto" });
    };
  }, [open]);
}
