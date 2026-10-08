"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ContactIcon } from "./ContactIcon";
import styles from "./FloatingActions.module.css";

export function FloatingActions({ whatsappHref, whatsappLabel }: { whatsappHref: string; whatsappLabel: string }) {
  const ring = useRef<SVGCircleElement>(null);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const extent = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = extent > 0 ? Math.min(1, Math.max(0, window.scrollY / extent)) : 0;
      ring.current?.setAttribute("stroke-dashoffset", String(100 * (1 - progress)));
      setShowTop(window.scrollY > 180);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    observer.observe(document.documentElement);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  function goToTop() {
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    const main = document.querySelector("main");
    if (main) {
      if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
      main.focus({ preventScroll: true });
    }
  }

  return <div className={styles.actions}>
    <button type="button" className={styles.top} data-visible={showTop} tabIndex={showTop ? 0 : -1} aria-hidden={!showTop} aria-label="Subir para o topo" onClick={goToTop}>
      <svg className={styles.progress} viewBox="0 0 64 64" aria-hidden="true" focusable="false"><circle className={styles.track} cx="32" cy="32" r="29"/><circle ref={ring} className={styles.ring} cx="32" cy="32" r="29" pathLength="100" strokeDasharray="100" strokeDashoffset="100"/></svg>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="m5 12 7-7 7 7M12 5v15"/></svg>
    </button>
    {whatsappHref ? <Link className={styles.whatsapp} href={whatsappHref} aria-label={whatsappLabel || "Chamar no WhatsApp"}><ContactIcon name="whatsapp"/></Link> : null}
  </div>;
}
