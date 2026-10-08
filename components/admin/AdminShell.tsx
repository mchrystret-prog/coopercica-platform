"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { FormEvent, useEffect, useState } from "react";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/leaflets";
import { canAccessCms, cmsRoleName, type CmsRole } from "@/lib/cms-access";
import { clearCmsSession, CmsSessionExpired, getCmsAccessToken, saveCmsSession } from "@/lib/cms-session";
const items = [
  ["/admin", "Visão geral"],
  ["/admin/personalizacao", "Personalização"],
  ["/admin/campanhas", "Campanhas"],
  ["/admin/revistas", "Revistas"],
  ["/admin/folheteria", "Folheteria"],
  ["/admin/lojas", "Lojas"],
  ["/admin/midias", "Biblioteca de mídia"],
  ["/admin/analytics", "Analytics"],
  ["/admin/vagas", "Portal de Vagas"],
  ["/admin/politicas", "Políticas e documentos"],
  ["/admin/usuarios", "Usuários"],
  ["/admin/configuracoes", "Configurações"],
] as const;
type Member = {
  name: string | null;
  email: string;
  role: CmsRole;
  status: "pending" | "approved" | "rejected";
};
async function loadMember(t: string) {
  const user = await getUser(t);
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/cms_member_for_user`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${t}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_user_id: user.id }),
  });
  if (!r.ok) return null;
  const rows = await r.json();
  return rows[0] ?? null;
}
async function getUser(t: string) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${t}`,
    },
  });
  if (!r.ok) throw new Error("Sessão inválida");
  return r.json();
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [requestMode, setRequestMode] = useState(false);
  const [mobilePath, setMobilePath] = useState<string | null>(null);
  const mobileOpen = mobilePath === pathname;
  const setMobileOpen = (open: boolean) =>
    setMobilePath(open ? pathname : null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (sessionStorage.getItem("coopercica_admin_token"))
        try {
          const t = await getCmsAccessToken();
          const m = await loadMember(t);
          if (cancelled) return;
          if (m?.status === "approved") {
            setToken(t);
            setMember(m);
          } else clearCmsSession();
        } catch (cause) {
          if (cancelled) return;
          if (cause instanceof CmsSessionExpired) clearCmsSession();
          setError(cause instanceof Error ? cause.message : "Não foi possível verificar sua sessão.");
        }
      if (!cancelled) setReady(true);
    })();
    return () => { cancelled = true; };
  }, []);
  const authenticated = Boolean(token);
  useEffect(() => {
    if (!authenticated) return;
    let cancelled = false;
    async function renew() {
      if (document.hidden) return;
      try {
        const fresh = await getCmsAccessToken();
        if (!cancelled) setToken(fresh);
      } catch (cause) {
        if (!cancelled && cause instanceof CmsSessionExpired) {
          clearCmsSession(); setToken(null); setMember(null); setError(cause.message);
        }
      }
    }
    const timer = window.setInterval(renew, 30_000);
    window.addEventListener("focus", renew);
    document.addEventListener("visibilitychange", renew);
    return () => { cancelled = true; window.clearInterval(timer); window.removeEventListener("focus", renew); document.removeEventListener("visibilitychange", renew); };
  }, [authenticated]);
  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: String(fd.get("email") || "").trim().toLowerCase(),
        password: fd.get("password"),
      }),
    });
    const j = await r.json();
    if (!r.ok) {
      const code = j.error_code || j.code;
      setError(
        code === "email_not_confirmed" || j.error_description === "Email not confirmed"
          ? "Seu e-mail ainda não foi confirmado. Abra o e-mail recebido no cadastro e clique no link de confirmação. A aprovação no CMS não substitui essa etapa."
          : r.status === 429
            ? "Muitas tentativas de login. Aguarde alguns minutos e tente novamente."
            : code === "invalid_credentials" || j.error_description === "Invalid login credentials"
              ? "E-mail ou senha inválidos."
              : "Não foi possível entrar agora. Tente novamente; se o erro persistir, contate o administrador.",
      );
      setLoading(false);
      return;
    }
    const m = await loadMember(j.access_token);
    if (!m || m.status !== "approved") {
      setError(
        m?.status === "rejected"
          ? "Seu acesso ao CMS não foi aprovado."
          : "Sua solicitação ainda está aguardando aprovação.",
      );
      setLoading(false);
      return;
    }
    saveCmsSession(j.access_token, j.refresh_token);
    setToken(j.access_token);
    setMember(m);
    setLoading(false);
  }
  async function requestAccess(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "")
      .trim()
      .toLowerCase();
    if (!email.endsWith("@coopercica.com.br")) {
      setError("Use seu e-mail corporativo @coopercica.com.br.");
      setLoading(false);
      return;
    }
    const r = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password: fd.get("password"),
        data: { name: fd.get("name") },
      }),
    });
    const j = await r.json();
    setLoading(false);
    if (!r.ok) {
      setError(
        j.msg || j.error_description || "Não foi possível solicitar o acesso.",
      );
      return;
    }
    setRequestMode(false);
    setError(
      "Solicitação enviada. Verifique sua caixa de entrada e spam para confirmar o e-mail, se solicitado. Após a confirmação e a aprovação no CMS, use seu e-mail e senha para entrar.",
    );
  }
  function logout() {
    clearCmsSession();
    setMobileOpen(false);
    setToken(null);
    setMember(null);
  }
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);
  useEffect(() => {
    if (member?.role === "hr" && pathname === "/admin")
      router.replace("/admin/vagas");
  }, [member?.role, pathname, router]);
  if (!ready) return null;
  if (!token)
    return (
      <div className="cms-auth">
        <section className="cms-auth-card">
          <div className="cms-auth-brand">
            <Link href="/">Coopercica</Link>
            <span>CMS</span>
          </div>
          <div className="cms-auth-copy">
            <span className="eyebrow">
              {requestMode ? "Solicitar acesso" : "Conteúdo digital"}
            </span>
            <h1>
              {requestMode
                ? "Acesse o CMS da Coopercica"
                : "Gerencie o site em um só lugar."}
            </h1>
            <p>
              {requestMode
                ? "Crie sua solicitação. Um administrador precisa aprovar o acesso antes do primeiro login."
                : "Entre para administrar campanhas, folhetos, revistas, lojas e arquivos do site."}
            </p>
          </div>
          <form
            onSubmit={requestMode ? requestAccess : login}
            className="cms-auth-form"
          >
            {requestMode ? (
              <label>
                Nome
                <input name="name" required autoComplete="name" />
              </label>
            ) : null}
            <label>
              E-mail
              <input name="email" type="email" required autoComplete="email" />
            </label>
            <label>
              Senha
              <input
                name="password"
                type="password"
                minLength={6}
                required
                autoComplete={requestMode ? "new-password" : "current-password"}
              />
            </label>
            {error ? <div className="cms-auth-message">{error}</div> : null}
            <button className="button" disabled={loading}>
              {loading
                ? "Aguarde..."
                : requestMode
                  ? "Solicitar acesso"
                  : "Entrar no CMS"}
            </button>
          </form>
          <button
            className="cms-auth-switch"
            type="button"
            onClick={() => {
              setRequestMode((v) => !v);
              setError("");
            }}
          >
            {requestMode
              ? "Já tenho acesso"
              : "Ainda não tenho acesso · Solicitar"}
          </button>
          <Link className="cms-auth-back" href="/">
            ← Voltar ao site
          </Link>
        </section>
      </div>
    );
  const nav = items.filter(
    ([href]) => member && canAccessCms(member.role, href),
  );
  const home = member?.role === "hr" ? "/admin/vagas" : "/admin";
  const allowed = member && canAccessCms(member.role, pathname);
  return (
    <div className="admin-shell">
      <header className="cms-mobile-header">
        <Link href={home} className="cms-mobile-brand">
          <strong>Coopercica</strong>
          <span>CMS</span>
        </Link>
        <button
          className="cms-menu-button"
          type="button"
          aria-label="Abrir menu do CMS"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(true)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>
      {mobileOpen ? (
        <button
          className="cms-drawer-backdrop"
          aria-label="Fechar menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}
      <aside className={mobileOpen ? "cms-drawer-open" : ""}>
        <div className="cms-aside-head">
          <div>
            <Link className="admin-brand" href={home}>
              Coopercica
            </Link>
            <span className="admin-kicker">CMS · Conteúdo Digital</span>
          </div>
          <button
            className="cms-drawer-close"
            type="button"
            aria-label="Fechar menu"
            onClick={() => setMobileOpen(false)}
          >
            ×
          </button>
        </div>
        <nav>
          {nav.map(([href, label]) => {
            const active =
              href === "/admin" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                href={href}
                key={href}
                aria-current={active ? "page" : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="cms-user">
          <strong>{member?.name || member?.email}</strong>
          <small>{cmsRoleName(member?.role || "")}</small>
          <button onClick={logout}>Sair do CMS</button>
        </div>
      </aside>
      <main>
        {allowed ? (
          children
        ) : (
          <section className="admin-page">
            <h1>Acesso restrito</h1>
            <p>Seu perfil não tem acesso a este módulo do CMS.</p>
            <Link className="button" href={home}>
              Ir para meu painel
            </Link>
          </section>
        )}
      </main>
    </div>
  );
}
