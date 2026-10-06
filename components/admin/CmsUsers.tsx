"use client";
import { useEffect, useState } from "react";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/leaflets";
import { cmsRoleName, type CmsRole } from "@/lib/cms-access";
type Member = {
  user_id: string;
  name: string | null;
  email: string;
  role: CmsRole;
  status: string;
  created_at: string;
};
async function fetchMembers(): Promise<{ items: Member[]; self: string }> {
  const token = sessionStorage.getItem("coopercica_admin_token");
  if (!token) throw new Error("Sessão expirada");
  const headers = {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${token}`,
  };
  const [members, user] = await Promise.all([
    fetch(
      `${SUPABASE_URL}/rest/v1/cms_members?select=*&order=created_at.desc`,
      { headers },
    ),
    fetch(`${SUPABASE_URL}/auth/v1/user`, { headers }),
  ]);
  if (!members.ok || !user.ok) throw new Error("Não autorizado");
  return { items: await members.json(), self: (await user.json()).id };
}
export function CmsUsers() {
  const [items, setItems] = useState<Member[]>([]),
    [msg, setMsg] = useState(""),
    [busy, setBusy] = useState(false),
    [self, setSelf] = useState("");
  async function load() {
    const result = await fetchMembers();
    setItems(result.items);
    setSelf(result.self);
  }
  useEffect(() => {
    let cancelled = false;
    void fetchMembers()
      .then((result) => {
        if (!cancelled) {
          setItems(result.items);
          setSelf(result.self);
        }
      })
      .catch(() => {
        if (!cancelled) setMsg("Não foi possível carregar os usuários.");
      });
    return () => {
      cancelled = true;
    };
  }, []);
  async function update(id: string, status: string, role?: CmsRole) {
    const token = sessionStorage.getItem("coopercica_admin_token");
    if (!token) return;
    setBusy(true);
    const body: { status: string; role?: CmsRole; approved_at?: string } = {
      status,
    };
    if (role) body.role = role;
    if (status === "approved") body.approved_at = new Date().toISOString();
    try {
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/cms_members?user_id=eq.${id}`,
        {
          method: "PATCH",
          headers: {
            apikey: SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify(body),
        },
      );
      if (!r.ok || !(await r.json()).length) throw new Error("denied");
      setMsg(
        "Acesso atualizado. O usuário deve sair e entrar novamente para atualizar seu menu.",
      );
      await load();
    } catch {
      setMsg("Não foi possível atualizar o acesso.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <p>
        O perfil <strong>Recursos Humanos</strong> acessa somente Portal de
        Vagas, candidaturas e Políticas e documentos.
      </p>
      <div className="cms-list">
        {items.map((x) => (
          <article className="cms-list-row" key={x.user_id}>
            <div>
              <strong>{x.name || x.email}</strong>
              <small>{x.email}</small>
            </div>
            <span className="badge">
              {x.status === "approved"
                ? cmsRoleName(x.role)
                : x.status === "pending"
                  ? "Aguardando aprovação"
                  : "Recusado"}
            </span>
            <div className="cms-row-actions">
              {x.status !== "approved" ? (
                <>
                  {(["editor", "hr", "admin"] as const).map((role) => (
                    <button
                      key={role}
                      disabled={busy}
                      onClick={() => update(x.user_id, "approved", role)}
                    >
                      Aprovar {cmsRoleName(role)}
                    </button>
                  ))}
                  <button
                    disabled={busy}
                    onClick={() => update(x.user_id, "rejected")}
                  >
                    Recusar
                  </button>
                </>
              ) : (
                <>
                  <label>
                    Perfil
                    <select
                      value={x.role}
                      disabled={busy || x.user_id === self}
                      onChange={(e) =>
                        update(x.user_id, "approved", e.target.value as CmsRole)
                      }
                      aria-label={`Perfil de ${x.name || x.email}`}
                    >
                      {(["editor", "hr", "admin"] as const).map((role) => (
                        <option key={role} value={role}>
                          {cmsRoleName(role)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    disabled={busy || x.user_id === self}
                    onClick={() => update(x.user_id, "rejected")}
                  >
                    Revogar acesso
                  </button>
                </>
              )}
            </div>
          </article>
        ))}
      </div>
      {msg ? (
        <div className="form-status" role="status">
          <strong>{msg}</strong>
        </div>
      ) : null}
    </>
  );
}
