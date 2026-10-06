export type PublicationKind = "revista" | "folheto";

export type Publication = {
  id: string;
  kind: PublicationKind;
  title: string;
  edition: string;
  cover: string;
  pdfFile: string | null;
  pageCount: number;
  published: boolean;
  startsAt: string;
  endsAt: string;
  updatedAt: string;
};

export function publicationPath(item: Pick<Publication, "kind" | "id">) {
  return `/${item.kind === "revista" ? "revista" : "folhetos"}/${item.id}/folhear`;
}

export function publicationIsVisible(item: Publication, now = new Date()) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  return item.published && (!item.startsAt || item.startsAt <= today) && (!item.endsAt || item.endsAt >= today);
}
