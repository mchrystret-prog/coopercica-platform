"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import styles from "./LeafletNavigationGuide.module.css";

const storageKey = "coopercica:leaflet-navigation:v1";
const guideSteps = [
  { target: "products", title: "Deslize para descobrir as ofertas", description: "No computador, clique, segure e arraste os cards para os lados. No celular, deslize com o dedo. Você também pode usar as setas ou navegar pelo teclado." },
  { target: "delivery", title: "Gostou de um produto?", description: "Nos cards com link de compra, um clique abre o produto no Delivery em uma nova aba. Arrastar o carrossel não abre o link." },
  { target: "flip", title: "Folheie o encarte", description: "Use Folhear PDF para abrir o leitor e virar as páginas. Lá você também encontra zoom e tela cheia." },
  { target: "open", title: "Abra o PDF", description: "Abrir PDF mostra o arquivo em uma nova aba, usando o leitor do seu navegador." },
  { target: "download", title: "Guarde as ofertas com você", description: "Use Baixar PDF para salvar o folheto no computador ou celular e consultar depois." },
] as const;

export function LeafletNavigationGuide({ hasProducts, hasDelivery, hasPdf }: {
  hasProducts: boolean;
  hasDelivery: boolean;
  hasPdf: boolean;
}) {
  const steps = useMemo(() => guideSteps.filter((item) =>
    item.target === "products" ? hasProducts : item.target === "delivery" ? hasDelivery : hasPdf,
  ), [hasProducts, hasDelivery, hasPdf]);
  const [step, setStep] = useState<number | null>(null);
  const [placement, setPlacement] = useState<CSSProperties | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const tip = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);
  const focusOnOpen = useRef(false);
  const started = useRef(false);
  const active = step === null ? null : steps[step];

  useEffect(() => {
    if (!steps.length) return;
    try { if (localStorage.getItem(storageKey)) return; } catch { /* The guide also works without storage. */ }
    const element = document.querySelector<HTMLElement>(`[data-leaflet-guide="${steps[0].target}"]`);
    if (!element) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      if (started.current) return;
      started.current = true;
      try { localStorage.setItem(storageKey, "seen"); } catch { /* Storage may be disabled. */ }
      setStep(0);
    }, { threshold: 0.2 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [steps]);

  const dismiss = useCallback(() => {
    try { localStorage.setItem(storageKey, "seen"); } catch { /* Storage may be disabled. */ }
    const shouldRestoreFocus = restoreFocus.current || Boolean(tip.current?.contains(document.activeElement));
    setStep(null);
    setPlacement(null);
    if (shouldRestoreFocus) trigger.current?.focus({ preventScroll: true });
    restoreFocus.current = false;
    focusOnOpen.current = false;
  }, []);

  useEffect(() => {
    if (!active) return;
    const target = document.querySelector<HTMLElement>(`[data-leaflet-guide="${active.target}"]`);
    if (!target) return;
    target.classList.add(styles.highlight);
    let frame = 0;
    const update = () => {
      const rect = target.getBoundingClientRect();
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
      const width = Math.min(360, viewportWidth - 24);
      const height = tip.current?.getBoundingClientRect().height ?? 260;
      const left = Math.max(12, Math.min(rect.left + rect.width / 2 - width / 2, viewportWidth - width - 12));
      const below = rect.bottom + 12;
      const top = Math.max(12, Math.min(below + height <= viewportHeight - 12 ? below : rect.top - height - 12, viewportHeight - height - 12));
      setPlacement({ width, left, top });
    };
    const scheduleUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        dismiss();
      }
    };
    const observer = new ResizeObserver(scheduleUpdate);
    if (tip.current) observer.observe(tip.current);
    observer.observe(target);
    update();
    if (focusOnOpen.current) {
      closeButton.current?.focus({ preventScroll: true });
      focusOnOpen.current = false;
    }
    window.addEventListener("scroll", scheduleUpdate, { passive: true, capture: true });
    window.addEventListener("resize", scheduleUpdate);
    window.visualViewport?.addEventListener("resize", scheduleUpdate);
    document.addEventListener("keydown", escape);
    return () => {
      target.classList.remove(styles.highlight);
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", scheduleUpdate, true);
      window.removeEventListener("resize", scheduleUpdate);
      window.visualViewport?.removeEventListener("resize", scheduleUpdate);
      document.removeEventListener("keydown", escape);
    };
  }, [active, dismiss]);

  function showStep(index: number) {
    const target = document.querySelector<HTMLElement>(`[data-leaflet-guide="${steps[index].target}"]`);
    target?.scrollIntoView({ block: "center", inline: "nearest", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    setStep(index);
  }

  if (!steps.length) return null;
  return <>
    <button ref={trigger} type="button" className={styles.trigger} aria-expanded={active !== null} aria-controls={active ? "leaflet-navigation-guide" : undefined}
      onClick={() => {
        started.current = true;
        try { localStorage.setItem(storageKey, "seen"); } catch { /* Storage may be disabled. */ }
        restoreFocus.current = true;
        focusOnOpen.current = true;
        showStep(0);
      }}>
      <span aria-hidden="true">?</span> Como navegar
    </button>
    {active && typeof document !== "undefined" ? createPortal(
      <div ref={tip} id="leaflet-navigation-guide" role="dialog" aria-modal="false" aria-labelledby="leaflet-guide-title" aria-describedby="leaflet-guide-description"
        className={styles.tip} style={placement ?? { visibility: "hidden" }}>
        <div className={styles.topline}>
          <span>DICA {step! + 1} DE {steps.length}</span>
          <button ref={closeButton} type="button" className={styles.close} aria-label="Fechar dicas de navegação" onClick={dismiss}>×</button>
        </div>
        <div aria-live="polite" aria-atomic="true">
          <h2 id="leaflet-guide-title">{active.title}</h2>
          <p id="leaflet-guide-description">{active.description}</p>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.secondary} onClick={() => step ? showStep(step - 1) : dismiss()}>{step ? "Anterior" : "Pular dicas"}</button>
          <button type="button" className={styles.next} onClick={() => step! < steps.length - 1 ? showStep(step! + 1) : dismiss()}>{step! < steps.length - 1 ? "Próxima dica" : "Entendi"}</button>
        </div>
      </div>, document.body,
    ) : null}
  </>;
}
