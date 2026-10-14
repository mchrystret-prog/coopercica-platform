"use client";
import { useEffect, useState, type ReactNode } from "react";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/leaflets";
export function CmsModuleWorkspace({ children, settings, listLabel, settingsLabel = "Apresentação no site", initialTab, restrictSettings = false }: { children: ReactNode; settings: ReactNode; listLabel: string; settingsLabel?: string; initialTab?: string; restrictSettings?: boolean }) {
  const [tab, setTab] = useState(initialTab === "settings" ? "settings" : "content");
  const [canEditSettings, setCanEditSettings] = useState(!restrictSettings);
  useEffect(() => {
    if (!restrictSettings) return;
    const controller = new AbortController();
    const token = sessionStorage.getItem("coopercica_admin_token");
    if (!token) return;
    fetch(`${SUPABASE_URL}/rest/v1/rpc/cms_can_edit`, { method: "POST", headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: "{}", signal: controller.signal }).then(async r => r.ok && await r.json() === true).then(setCanEditSettings).catch(() => {});
    return () => controller.abort();
  }, [restrictSettings]);
  const showSettings = tab === "settings" && canEditSettings;
  return <section className="admin-page cms-module-workspace">
    {canEditSettings ? <nav className="cms-custom-tabs" aria-label="Conteúdo do módulo"><button type="button" aria-pressed={!showSettings} data-active={!showSettings} onClick={() => setTab("content")}>{listLabel}</button><button type="button" aria-pressed={showSettings} data-active={showSettings} onClick={() => setTab("settings")}>{settingsLabel}</button></nav> : null}
    <div className="cms-module-body">{showSettings ? settings : children}</div>
  </section>;
}
