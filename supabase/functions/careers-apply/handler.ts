import {
  readApplicationBody,
  validateApplication,
  validateResume,
} from "../_shared/recruitment.ts";
const origins = [
  "https://coopercica-platform.vercel.app",
  "https://coopercica.com.br",
  "https://www.coopercica.com.br",
  "http://localhost:3000",
];
export async function handleApplication(request: Request): Promise<Response> {
  const origin = request.headers.get("origin") || "";
  if (
    ![
      ...origins,
      ...(Deno.env.get("CAREERS_ALLOWED_ORIGINS") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ].includes(origin)
  )
    return new Response(null, { status: 403 });
  const headers = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    Vary: "Origin",
    "Cache-Control": "no-store",
  };
  const reply = (status: number, message: string) =>
    Response.json({ message }, { status, headers });
  if (request.method === "OPTIONS")
    return new Response(null, { status: 204, headers });
  if (request.method !== "POST") return reply(405, "Método não permitido.");
  const type = request.headers.get("content-type") || "";
  if (!type.startsWith("multipart/form-data;"))
    return reply(415, "Envie o formulário e seu currículo em PDF.");
  let uploadedPath: string | null = null;
  let removeUpload: (() => Promise<void>) | null = null;
  let committed = false;
  let submissionAttempted = false;
  let verifySubmission: (() => Promise<boolean>) | null = null;
  try {
    const bytes = await readApplicationBody(request);
    const form = await new Request(request.url, {
      method: "POST",
      headers: { "Content-Type": type },
      body: new Uint8Array(bytes).buffer,
    }).formData();
    const allowed = [
      "job_id",
      "name",
      "email",
      "phone",
      "city",
      "message",
      "consent",
      "resume",
      "website",
    ];
    for (const key of new Set(form.keys()))
      if (!allowed.includes(key) || form.getAll(key).length !== 1)
        throw new Error("invalid_fields");
    if (form.get("website"))
      return reply(202, "Candidatura recebida. Obrigado por seu interesse!");
    const fields: Record<string, unknown> = {};
    for (const key of allowed.filter((k) => !["resume", "website"].includes(k)))
      fields[key] = form.get(key) ?? (key === "message" ? "" : null);
    const input = validateApplication(fields);
    const file = form.get("resume");
    if (!(file instanceof File)) throw new Error("invalid_resume");
    const resume = new Uint8Array(await file.arrayBuffer());
    validateResume(resume, file.type);
    const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
    const key: string =
      keys.default ||
      Object.values(keys)[0] ||
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const url = Deno.env.get("SUPABASE_URL");
    if (!key || !url)
      return reply(
        503,
        "Não foi possível enviar agora. Tente novamente em instantes.",
      );
    const auth: Record<string, string> = { apikey: key };
    if (!key.startsWith("sb_secret_")) auth.Authorization = `Bearer ${key}`;
    const rpc = async (name: string, body: object) => {
      const r = await fetch(`${url}/rest/v1/rpc/${name}`, {
        method: "POST",
        headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(
          ["rate_limited", "job_closed"].includes(err.message)
            ? err.message
            : "service_failed",
        );
      }
      return r.status === 204 ? null : r.json();
    };
    const hmac = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(key),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const digest = async (value: string) =>
      [
        ...new Uint8Array(
          await crypto.subtle.sign(
            "HMAC",
            hmac,
            new TextEncoder().encode(value),
          ),
        ),
      ]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    const ip =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ||
      "unknown";
    const [ipKey, emailKey] = await Promise.all([
      digest(`${new Date().toISOString().slice(0, 10)}:ip:${ip}`),
      digest(`${new Date().toISOString().slice(0, 10)}:email:${input.email}`),
    ]);
    await rpc("recruitment_charge_limit", {
      p_ip_key: ipKey,
      p_email_key: emailKey,
    });
    // Check availability before uploading; submission rechecks under a row lock.
    const available = await fetch(
      `${url}/rest/v1/site_jobs?select=id&id=eq.${input.job_id}&status=eq.open&or=(closes_on.is.null,closes_on.gte.${new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date())})`,
      { headers: auth },
    );
    if (!available.ok) throw new Error("service_failed");
    if (!(await available.json()).length) throw new Error("job_closed");
    const id = crypto.randomUUID();
    const path = `${input.job_id}/${id}.pdf`;
    const upload = await fetch(`${url}/storage/v1/object/job-resumes/${path}`, {
      method: "POST",
      headers: {
        ...auth,
        "Content-Type": "application/pdf",
        "x-upsert": "false",
      },
      body: resume,
    });
    if (!upload.ok) throw new Error("service_failed");
    uploadedPath = path;
    removeUpload = async () => {
      const r = await fetch(`${url}/storage/v1/object/job-resumes`, {
        method: "DELETE",
        headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify({ prefixes: [path] }),
      });
      if (!r.ok) throw new Error("cleanup_failed");
    };
    verifySubmission = async () => {
      const r = await fetch(
        `${url}/rest/v1/site_job_applications?select=id&id=eq.${id}`,
        { headers: auth },
      );
      if (!r.ok) throw new Error("service_failed");
      return (await r.json()).length > 0;
    };
    submissionAttempted = true;
    const saved = await rpc("recruitment_submit_application", {
      p_id: id,
      p_job_id: input.job_id,
      p_name: input.name,
      p_email: input.email,
      p_phone: input.phone,
      p_city: input.city,
      p_message: input.message,
      p_resume_path: path,
    });
    if (saved) committed = true;
    else {
      await removeUpload();
      uploadedPath = null;
    }
    return reply(
      202,
      "Candidatura recebida. Obrigado por seu interesse! O RH entrará em contato se houver continuidade no processo.",
    );
  } catch (error) {
    let safeToRemove = !submissionAttempted;
    if (submissionAttempted && verifySubmission)
      try {
        committed = await verifySubmission();
        safeToRemove = !committed;
      } catch {
        /* An uncertain commit must not delete a valid candidate resume. */
      }
    if (committed)
      return reply(202, "Candidatura recebida. Obrigado por seu interesse!");
    if (uploadedPath && safeToRemove && removeUpload)
      try {
        await removeUpload();
      } catch {
        /* Keep any orphaned file private. */
      }
    const code = error instanceof Error ? error.message : "service_failed";
    if (code === "rate_limited")
      return reply(
        429,
        "Muitas tentativas de envio. Tente novamente mais tarde.",
      );
    if (code === "job_closed")
      return reply(
        409,
        "Esta vaga foi encerrada ou não está mais recebendo candidaturas.",
      );
    if (code === "payload_too_large")
      return reply(413, "O currículo deve ter no máximo 5 MB.");
    if (code === "invalid_resume")
      return reply(400, "Envie um currículo válido em PDF, de até 5 MB.");
    if (code === "consent_required")
      return reply(400, "Autorize o uso dos dados para esta candidatura.");
    if (code === "invalid_fields")
      return reply(400, "Confira os campos obrigatórios do formulário.");
    return reply(
      503,
      "Não foi possível enviar agora. Tente novamente em instantes.",
    );
  }
}
