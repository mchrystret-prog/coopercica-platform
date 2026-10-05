import {
  field,
  normalize,
  enabled,
  resolvePresentation,
  type LeafletAsset,
} from "./leaflet-presentation";

export function parseMoney(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  let text = String(value ?? "")
    .trim()
    .replace(/R\$\s?/gi, "")
    .replace(/\s/g, "");
  if (!text) return null;
  if (text.includes(",")) text = text.replace(/\./g, "").replace(",", ".");
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}
export function spreadsheetRecords(rows: unknown[][]) {
  const headers = (rows[0] || []).map(String);
  const required = ["EAN", "Descritivo Marketing", "Preço Vigente"];
  const missing = required.filter(
    (label) =>
      !headers.some((header) => normalize(header) === normalize(label)),
  );
  if (missing.length)
    throw new Error(
      `Exportação incompatível. Colunas ausentes: ${missing.join(", ")}.`,
    );
  const used = headers.filter((header) => normalize(header));
  if (new Set(used.map(normalize)).size !== used.length)
    throw new Error("A planilha contém nomes de colunas repetidos.");
  const records = rows
    .slice(1)
    .map((row, index) => ({
      row: Object.fromEntries(
        headers.map((header, i) => [header, row[i] ?? ""]),
      ),
      line: index + 2,
    }))
    .filter(({ row }) =>
      Object.values(row).some((value) => String(value ?? "").trim()),
    );
  if (!records.length) throw new Error("A aba “Tabloide Digital” está vazia.");
  return records;
}
export function importProducts(
  records: ReturnType<typeof spreadsheetRecords>,
  assets: LeafletAsset[],
  overrides: Record<string, string> = {},
) {
  return records.map(({ row, line }, index) => {
    try {
      const text = (...labels: string[]) =>
        String(field(row, ...labels)).trim();
      const ean = text("EAN"),
        description = text("Descritivo Marketing"),
        regular = parseMoney(field(row, "Preço Vigente"));
      if (!description || regular === null || regular < 0)
        throw new Error("Descrição ou Preço Vigente inválido.");
      const cooper = parseMoney(field(row, "CooperMais")),
        offer = parseMoney(field(row, "Oferta (Todos)"));
      const presentation = resolvePresentation(row, assets, overrides);
      return {
        sort_order: index + 1,
        ean: ean || null,
        description,
        complement:
          [text("Embalagem"), text("Unidade")].filter(Boolean).join(" ") ||
          null,
        regular_price: regular,
        coopermais_price: cooper && cooper > 0 ? cooper : null,
        offer_all_price: offer && offer > 0 ? offer : null,
        unit: text("Unidade") || null,
        delivery_url: text("URL") || null,
        super_offer: enabled(field(row, "Super Ofertas")),
        age_18: presentation.seals.some((s) => s.code === "+18"),
        breastfeeding_warning: presentation.seals.some(
          (s) => s.code === "aleitamento",
        ),
        image_url: ean ? `/images/products/${ean}.webp` : null,
        erp_code: text("Código") || null,
        principal: text("Principal") || null,
        box: text("BOX", "Box folheteria") || null,
        family_code: text("Cód. Família") || null,
        buyer: text("Comprador") || null,
        section: text("Seção") || null,
        special_section: text("Seção Especial") || null,
        buy_3_pay_2: enabled(field(row, "Leve 3 Pague 2")),
        promo_pack: text("Embalagem Promo") || null,
        erp_payload: { ...row, _leaflet_presentation: presentation },
      };
    } catch (error) {
      throw new Error(
        `Linha ${line}: ${error instanceof Error ? error.message : "Dados inválidos."}`,
      );
    }
  });
}
