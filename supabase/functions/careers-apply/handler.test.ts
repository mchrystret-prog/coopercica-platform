import { handleApplication } from "./handler.ts";
const job = "81000000-0000-4000-8000-000000000001";
function assert(value: unknown, message: string) {
  if (!value) throw new Error(message);
}
function request() {
  const form = new FormData();
  for (const [k, v] of Object.entries({
    job_id: job,
    name: "Pessoa Teste",
    email: "qa@example.invalid",
    phone: "11900000000",
    city: "Jundiaí",
    message: "",
    consent: "accepted",
  }))
    form.set(k, v);
  form.set(
    "resume",
    new File(["%PDF-1.7\n%%EOF"], "curriculo.pdf", { type: "application/pdf" }),
  );
  return new Request("https://edge.example.invalid", {
    method: "POST",
    headers: { origin: "https://coopercica.com.br" },
    body: form,
  });
}
for (const scenario of [
  "success",
  "duplicate",
  "closed",
  "rate",
  "committed-network-error",
  "failed-insert",
  "uncertain-insert",
])
  Deno.test(`application workflow: ${scenario}`, async () => {
    const originalFetch = globalThis.fetch;
    const oldUrl = Deno.env.get("SUPABASE_URL");
    const oldKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    Deno.env.set("SUPABASE_URL", "https://backend.example.invalid");
    Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "test-service-key");
    const calls: string[] = [];
    let id = "";
    globalThis.fetch = async (input, init) => {
      const url = String(input);
      calls.push(`${init?.method || "GET"} ${url}`);
      if (url.endsWith("/rpc/recruitment_charge_limit"))
        return scenario === "rate"
          ? Response.json({ message: "rate_limited" }, { status: 400 })
          : Response.json(null);
      if (url.includes("/site_jobs?"))
        return Response.json(scenario === "closed" ? [] : [{ id: job }]);
      if (url.includes("/storage/v1/object/job-resumes/"))
        return Response.json({ Key: "private-file" });
      if (url.endsWith("/rpc/recruitment_submit_application")) {
        const payload = JSON.parse(String(init?.body));
        id = payload.p_id;
        assert(
          payload.p_resume_path === `${job}/${id}.pdf`,
          "private path must match new application",
        );
        if (
          [
            "committed-network-error",
            "failed-insert",
            "uncertain-insert",
          ].includes(scenario)
        )
          throw new TypeError("simulated connection lost");
        return Response.json(scenario === "duplicate" ? null : id);
      }
      if (url.includes("/site_job_applications?")) {
        if (scenario === "uncertain-insert")
          throw new TypeError("verification unavailable");
        return Response.json(
          scenario === "committed-network-error" ? [{ id }] : [],
        );
      }
      if (init?.method === "DELETE") return Response.json([]);
      throw new Error(`Unexpected request ${url}`);
    };
    try {
      const response = await handleApplication(request());
      const expected =
        scenario === "closed"
          ? 409
          : scenario === "rate"
            ? 429
            : ["failed-insert", "uncertain-insert"].includes(scenario)
              ? 503
              : 202;
      assert(
        response.status === expected,
        `expected ${expected}, got ${response.status}: ${await response.text()}`,
      );
      const removed = calls.some((c) => c.startsWith("DELETE"));
      assert(
        removed === ["duplicate", "failed-insert"].includes(scenario),
        "cleanup must preserve committed or uncertain resumes",
      );
      if (["closed", "rate"].includes(scenario))
        assert(
          !calls.some((c) => c.includes("/storage/")),
          "must reject before upload",
        );
    } finally {
      globalThis.fetch = originalFetch;
      if (oldUrl) Deno.env.set("SUPABASE_URL", oldUrl);
      else Deno.env.delete("SUPABASE_URL");
      if (oldKey) Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", oldKey);
      else Deno.env.delete("SUPABASE_SERVICE_ROLE_KEY");
    }
  });
