import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./leaflets";
export type Job = {
  id: string;
  slug: string;
  title: string;
  department: string;
  city: string;
  unit: string;
  employment_type: string;
  work_mode: string;
  openings: number;
  salary: string;
  description: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  status: "draft" | "open" | "closed";
  closes_on: string | null;
  created_at: string;
  updated_at: string;
};
export type Application = {
  id: string;
  job_id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  message: string;
  resume_path: string;
  status: string;
  internal_notes: string;
  created_at: string;
  updated_at: string;
};
export const employmentNames: Record<string, string> = {
  clt: "Efetivo · CLT",
  temporary: "Temporário",
  apprentice: "Jovem Aprendiz",
  internship: "Estágio",
};
export const workModeNames: Record<string, string> = {
  onsite: "Presencial",
  hybrid: "Híbrido",
  remote: "Remoto",
};
export const applicationStatuses: Record<string, string> = {
  received: "Recebida",
  review: "Em análise",
  interview: "Entrevista",
  hired: "Contratado",
  rejected: "Não selecionado",
};
export function jobSlug(title: string, id: string) {
  const stem =
    title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 115)
      .replace(/-$/g, "") || "vaga";
  return `${stem}-${id.slice(0, 8)}`;
}
export function filterJobs(
  jobs: Job[],
  filters: { search: string; department: string; city: string },
) {
  const norm = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  return jobs.filter(
    (j) =>
      (!filters.department || j.department === filters.department) &&
      (!filters.city || j.city === filters.city) &&
      (!filters.search ||
        norm([j.title, j.department, j.city, j.unit].join(" ")).includes(
          norm(filters.search.trim()),
        )),
  );
}
async function publicJobs(query: string): Promise<Job[]> {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/site_jobs?select=*&${query}`,
    { headers: { apikey: SUPABASE_PUBLISHABLE_KEY }, cache: "no-store" },
  );
  if (!response.ok)
    throw new Error(
      "Não foi possível carregar as vagas. Tente novamente em instantes.",
    );
  return response.json();
}
export async function getJobs() {
  const jobs: Job[] = [];
  let offset = 0;
  while (true) {
    const batch = await publicJobs(
      `status=eq.open&order=created_at.desc,id.asc&limit=200&offset=${offset}`,
    );
    jobs.push(...batch);
    if (batch.length < 200) return jobs;
    offset += batch.length;
  }
}
export async function getJob(slug: string) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length > 160) return null;
  return (
    (await publicJobs(`slug=eq.${encodeURIComponent(slug)}&limit=1`))[0] || null
  );
}
export async function recruitmentRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = sessionStorage.getItem("coopercica_admin_token");
  if (!token) throw new Error("Sua sessão expirou. Entre novamente no CMS.");
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
    cache: "no-store",
  });
  if (!response.ok)
    throw new Error(
      [401, 403].includes(response.status)
        ? "Seu acesso não está autorizado ou expirou."
        : "Não foi possível concluir a operação. Verifique os dados e tente novamente.",
    );
  return response.status === 204 ? (undefined as T) : response.json();
}

export async function recruitmentList<T>(
  query: string,
): Promise<{ items: T[]; total: number }> {
  const token = sessionStorage.getItem("coopercica_admin_token");
  if (!token) throw new Error("Sua sessão expirou. Entre novamente no CMS.");
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${query}`, {
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${token}`,
      Prefer: "count=exact",
    },
    cache: "no-store",
  });
  if (!r.ok)
    throw new Error(
      "Não foi possível carregar este módulo. Verifique seu acesso e tente novamente.",
    );
  const items = await r.json();
  return {
    items,
    total: Number(
      r.headers.get("content-range")?.split("/")[1] || items.length,
    ),
  };
}
