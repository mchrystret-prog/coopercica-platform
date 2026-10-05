"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  chooseConsent,
  getConsent,
  startAnalytics,
  subscribeConsent,
} from "@/lib/analytics-browser";
import { safePath } from "@/supabase/functions/_shared/analytics";
import styles from "./SiteAnalytics.module.css";

export function SiteAnalytics() {
  const pathname = usePathname();
  const consent = useSyncExternalStore(
    subscribeConsent,
    getConsent,
    () => "unknown",
  );
  const [preferences, setPreferences] = useState(false);
  const page = useRef<{ path: string; id: string } | null>(null);
  useEffect(() => {
    if (consent !== "granted") {
      page.current = null;
      return;
    }
    if (!page.current || page.current.path !== pathname)
      page.current = { path: pathname, id: crypto.randomUUID() };
    return startAnalytics(pathname, page.current.id);
  }, [consent, pathname]);
  if (!safePath(pathname)) return null;
  const choose = (choice: "granted" | "denied") => {
    chooseConsent(choice);
    setPreferences(false);
  };
  return (
    <div data-analytics-ignore>
      {consent === "unknown" || preferences ? (
        <section
          className={styles.banner}
          role="dialog"
          aria-labelledby="analytics-consent-title"
          aria-describedby="analytics-consent-description"
        >
          <div>
            <strong id="analytics-consent-title">
              Sua privacidade, sua escolha.
            </strong>
            <p id="analytics-consent-description">
              Podemos medir visitas e cliques para melhorar o site? Não
              coletamos o que você digita em formulários. Você pode mudar sua
              escolha a qualquer momento.
            </p>
            <a href="/politicas">Consultar políticas de privacidade</a>
          </div>
          <div className={styles.actions}>
            <button type="button" onClick={() => choose("denied")}>
              Somente necessários
            </button>
            <button
              type="button"
              className={styles.accept}
              onClick={() => choose("granted")}
            >
              Permitir analytics
            </button>
            {preferences ? (
              <button type="button" onClick={() => setPreferences(false)}>
                Fechar
              </button>
            ) : null}
          </div>
        </section>
      ) : (
        <button
          className={styles.preferences}
          type="button"
          onClick={() => setPreferences(true)}
        >
          Preferências de privacidade
        </button>
      )}
    </div>
  );
}
