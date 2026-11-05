import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "authorization, apikey, content-type, x-leaflet-cleanup-token",
  "content-type": "application/json; charset=utf-8",
};
const respond = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "cache-control": "no-store" } });

type Candidate = { path: string; size_bytes: number };

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return respond({});
  if (request.method !== "POST") return respond({ error: "Method not allowed" }, 405);
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !serviceKey || !anonKey) return respond({ error: "Configuration unavailable" }, 503);

  const service = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const input = await request.json().catch(() => ({}));
  const cronToken = request.headers.get("x-leaflet-cleanup-token");
  let isCron = false;
  if (cronToken) {
    const { data, error } = await service.rpc("leaflet_cleanup_verify_cron_token", { p_token: cronToken });
    isCron = !error && data === true;
  }

  if (!isCron) {
    const jwt = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!jwt) return respond({ error: "Unauthorized" }, 401);
    const { data: auth, error: authError } = await service.auth.getUser(jwt);
    if (authError || !auth.user) return respond({ error: "Unauthorized" }, 401);
    const userClient = createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: allowed, error } = await userClient.rpc("cms_can_edit");
    if (error || !allowed) return respond({ error: "Forbidden" }, 403);
  }

  // Somente o cron autenticado pode executar exclusões.
  const requestedMode = input && typeof input === "object" ? input.mode : null;
  const mode = requestedMode === "delete" && isCron ? "delete" : "dry_run";
  const { data, error } = await service.rpc("leaflet_cleanup_candidates");
  if (error) return respond({ error: "Candidate audit failed" }, 500);
  const candidates = (data ?? []) as Candidate[];
  const totalBytes = candidates.reduce((n, f) => n + Number(f.size_bytes || 0), 0);
  const maxPerRun = 50;
  let deleted = 0;
  let bytesReclaimed = 0;
  const failures: string[] = [];

  if (mode === "delete") {
    for (const candidate of candidates.slice(0, maxPerRun)) {
      if (!candidate.path.startsWith("products/")) continue;
      // Recheca as referências imediatamente antes de excluir o objeto.
      const { data: current, error: recheckError } = await service.rpc("leaflet_cleanup_candidates");
      if (recheckError || !(current as Candidate[] ?? []).some((item) => item.path === candidate.path)) {
        failures.push("Eligibility changed");
        continue;
      }
      const { error: removalError } = await service.storage.from("leaflet-assets").remove([candidate.path]);
      if (removalError) {
        failures.push("Storage removal failed");
        continue;
      }
      const { error: markError } = await service.rpc("leaflet_cleanup_mark_deleted", { p_path: candidate.path });
      if (markError) {
        failures.push("Metadata archival failed");
        continue;
      }
      deleted++;
      bytesReclaimed += Number(candidate.size_bytes || 0);
    }
  }
  await service.from("leaflet_cleanup_runs").insert({
    mode,
    candidates: candidates.length,
    deleted,
    bytes_reclaimed: bytesReclaimed,
    errors: failures.length,
    details: { candidate_bytes: totalBytes, grace_days: 7, batch_limit: maxPerRun, failures: failures.slice(0, 10) },
  });
  return respond({
    mode, graceDays: 7, eligibleFiles: candidates.length,
    eligibleBytes: totalBytes, deletedFiles: deleted, reclaimedBytes: bytesReclaimed,
    failed: failures.length, maxPerRun,
  });
});
