import { applicationStatuses, recruitmentList, type Application } from "./jobs";
import type * as XLSX from "xlsx";

export type ReportCandidate = Application & { site_jobs: { title: string; department: string } | null };
export type ApplicationFilters = { job: string; status: string; query: string; start: string; end: string };

export function applicationFilterQuery(filters: ApplicationFilters) {
  const params = new URLSearchParams();
  for (const date of [filters.start, filters.end]) {
    if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date))
      throw new Error("Informe uma data válida.");
  }
  if (filters.start && filters.end && filters.start > filters.end)
    throw new Error("A data inicial deve ser anterior ou igual à data final.");
  if (filters.job) params.set("job_id", `eq.${filters.job}`);
  if (filters.status) params.set("status", `eq.${filters.status}`);
  // PostgreSQL resolves the IANA zone, including historical daylight saving time.
  if (filters.start) params.append("created_at", `gte.${filters.start}T00:00:00 America/Sao_Paulo`);
  if (filters.end) {
    const next = new Date(`${filters.end}T12:00:00Z`);
    next.setUTCDate(next.getUTCDate() + 1);
    params.append("created_at", `lt.${next.toISOString().slice(0, 10)}T00:00:00 America/Sao_Paulo`);
  }
  const term = filters.query.replace(/[^\p{L}\p{N} @._-]/gu, "").trim().slice(0, 120);
  if (term) params.set("or", `(name.ilike.*${term}*,email.ilike.*${term}*)`);
  return params.toString();
}

export async function loadApplicationReport(filters: ApplicationFilters, list = recruitmentList<ReportCandidate>) {
  const filter = applicationFilterQuery(filters);
  const rows: ReportCandidate[] = [];
  const seen = new Set<string>();
  let offset = 0;
  while (true) {
    const batch = await list(`site_job_applications?select=*,site_jobs(title,department)&order=created_at.desc,id.asc&limit=200&offset=${offset}&${filter}`);
    for (const row of batch.items) if (!seen.has(row.id)) { seen.add(row.id); rows.push(row); }
    offset += batch.items.length;
    if (offset >= batch.total) return rows;
    if (!batch.items.length) throw new Error("A lista mudou durante a exportação. Gere o relatório novamente.");
  }
}

export function applicationWorkbook(xlsx: typeof XLSX, rows: ReportCandidate[], filters: ApplicationFilters) {
  const workbook = xlsx.utils.book_new();
  const date = (value: string) => value ? new Date(value).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "";
  const sheet = xlsx.utils.aoa_to_sheet([
    ["ID", "Nome", "E-mail", "Telefone", "Cidade", "Vaga", "Departamento", "Status", "Enviada em (São Paulo)", "Atualizada em (São Paulo)", "Apresentação", "Observações internas"],
    ...rows.map(row => [row.id, row.name, row.email, row.phone, row.city, row.site_jobs?.title || "Vaga indisponível", row.site_jobs?.department || "", applicationStatuses[row.status] || row.status, date(row.created_at), date(row.updated_at), row.message || "", row.internal_notes || ""]),
  ]);
  sheet["!cols"] = [38, 30, 36, 22, 24, 32, 24, 22, 27, 27, 50, 60].map(wch => ({ wch }));
  sheet["!autofilter"] = { ref: sheet["!ref"]! };
  xlsx.utils.book_append_sheet(workbook, sheet, "Candidaturas");
  const summary = xlsx.utils.aoa_to_sheet([
    ["Relatório de candidaturas", "Valor"], ["Gerado em (São Paulo)", date(new Date().toISOString())],
    ["Data inicial (inclusive)", filters.start || "Sem limite"], ["Data final (inclusive)", filters.end || "Sem limite"],
    ["Status", applicationStatuses[filters.status] || "Todos"], ["ID da vaga", filters.job || "Todas"],
    ["Busca", filters.query || "Sem busca"], ["Total", rows.length],
    ...Object.entries(applicationStatuses).map(([key, label]) => [label, rows.filter(row => row.status === key).length]),
  ]);
  summary["!cols"] = [{ wch: 34 }, { wch: 42 }];
  xlsx.utils.book_append_sheet(workbook, summary, "Resumo");
  return workbook;
}
