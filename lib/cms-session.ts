import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./leaflets";

const accessKey = "coopercica_admin_token";
const refreshKey = "coopercica_admin_refresh_token";
let generation = 0;
let refreshing: { generation: number; promise: Promise<string> } | null = null;
export class CmsSessionExpired extends Error {
  constructor() { super("Sua sessão expirou. Saia do CMS e entre novamente antes de enviar os arquivos."); this.name = "CmsSessionExpired"; }
}
export function clearCmsSession() {
  generation++;
  sessionStorage.removeItem(accessKey);
  sessionStorage.removeItem(refreshKey);
}
export function saveCmsSession(accessToken: string, refreshToken: string) {
  generation++;
  sessionStorage.setItem(accessKey, accessToken);
  sessionStorage.setItem(refreshKey, refreshToken);
}
// Decode only for scheduling renewal. The server validates identity and permissions.
function expiresAt(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" ? payload.exp * 1000 : 0;
  } catch { return 0; }
}
export async function getCmsAccessToken(): Promise<string> {
  const accessToken = sessionStorage.getItem(accessKey);
  const refreshToken = sessionStorage.getItem(refreshKey);
  if (!accessToken) throw new CmsSessionExpired();
  if (expiresAt(accessToken) > Date.now() + 90_000) return accessToken;
  // Older logins need a new sign-in when their access token approaches expiry.
  if (!refreshToken) throw new CmsSessionExpired();
  if (refreshing?.generation === generation) return refreshing.promise;
  const currentGeneration = generation;
  const promise = (async () => {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST", headers: { apikey: SUPABASE_PUBLISHABLE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }), signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) {
      if (response.status === 400 || response.status === 401 || response.status === 403) throw new CmsSessionExpired();
      throw new Error("Não foi possível renovar a sessão agora. Confira a conexão e tente novamente.");
    }
    const session = await response.json();
    if (typeof session.access_token !== "string" || typeof session.refresh_token !== "string") throw new Error("Resposta de sessão inválida. Tente novamente.");
    if (generation !== currentGeneration || sessionStorage.getItem(refreshKey) !== refreshToken) throw new CmsSessionExpired();
    sessionStorage.setItem(accessKey, session.access_token);
    sessionStorage.setItem(refreshKey, session.refresh_token);
    return session.access_token as string;
  })();
  refreshing = { generation: currentGeneration, promise };
  try { return await promise; }
  finally { if (refreshing?.promise === promise) refreshing = null; }
}
