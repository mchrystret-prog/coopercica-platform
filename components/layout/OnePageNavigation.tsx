"use client";

import { useEffect } from "react";

const HEADER_FALLBACK = 82;
const EASE_OUT_CUBIC = (value: number) => 1 - Math.pow(1 - value, 3);

function getHeaderOffset() {
  const header = document.querySelector<HTMLElement>("header");
  return (header?.getBoundingClientRect().height ?? HEADER_FALLBACK) + 2;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

async function refreshScrollTriggers() {
  try {
    const { ScrollTrigger } = await import("gsap/ScrollTrigger");
    ScrollTrigger.refresh(true);
  } catch {
    // A navegação continua funcionando mesmo sem GSAP disponível.
  }
}

function targetScrollPosition(target: HTMLElement) {
  return Math.max(
    0,
    target.getBoundingClientRect().top + window.scrollY - getHeaderOffset(),
  );
}

function animateScroll(targetY: number, onComplete: () => void) {
  const startY = window.scrollY;
  const distance = targetY - startY;

  if (prefersReducedMotion() || Math.abs(distance) < 4) {
    window.scrollTo({ top: targetY, behavior: "auto" });
    onComplete();
    return () => undefined;
  }

  const duration = Math.min(1100, Math.max(420, Math.abs(distance) * 0.32));
  const startTime = performance.now();
  let frame = 0;

  const tick = (time: number) => {
    const progress = Math.min(1, (time - startTime) / duration);
    window.scrollTo(0, startY + distance * EASE_OUT_CUBIC(progress));

    if (progress < 1) {
      frame = requestAnimationFrame(tick);
    } else {
      onComplete();
    }
  };

  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}

export function OnePageNavigation() {
  useEffect(() => {
    let cancelAnimation: (() => void) | undefined;
    let correctionFrame = 0;

    const navigate = async (hash: string, updateUrl = true) => {
      const id = decodeURIComponent(hash.replace(/^#/, ""));
      const target = document.getElementById(id);
      if (!target) return;

      cancelAnimation?.();
      cancelAnimation = undefined;
      cancelAnimationFrame(correctionFrame);

      document.documentElement.dataset.anchorScrolling = "true";
      await refreshScrollTriggers();

      // Espera o refresh aplicar pin-spacers antes de medir a posição final.
      requestAnimationFrame(() => {
        const destination = targetScrollPosition(target);

        cancelAnimation = animateScroll(destination, () => {
          // Corrige qualquer diferença residual causada por imagens/fontes/pins.
          correctionFrame = requestAnimationFrame(() => {
            const correctedDestination = targetScrollPosition(target);
            if (Math.abs(window.scrollY - correctedDestination) > 2) {
              window.scrollTo({ top: correctedDestination, behavior: "auto" });
            }

            delete document.documentElement.dataset.anchorScrolling;
            target.focus({ preventScroll: true });
          });
        });
      });

      if (updateUrl) {
        window.history.replaceState(null, "", `#${id}`);
      }
    };

    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>(
        'a[href^="#"]',
      );
      if (!link) return;

      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;

      event.preventDefault();
      void navigate(hash);
    };

    const handleInitialHash = () => {
      if (window.location.hash) {
        window.setTimeout(() => void navigate(window.location.hash, false), 80);
      }
    };

    document.addEventListener("click", handleClick);
    window.addEventListener("load", handleInitialHash, { once: true });

    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("load", handleInitialHash);
      cancelAnimation?.();
      cancelAnimationFrame(correctionFrame);
      delete document.documentElement.dataset.anchorScrolling;
    };
  }, []);

  return null;
}
