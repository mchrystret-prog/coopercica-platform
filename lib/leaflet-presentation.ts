import type { LeafletProduct } from "./leaflets";

export type LeafletAsset = {
  kind: "box" | "seal";
  code: string;
  name: string;
  imageUrl: string;
  alt: string;
};
export type LeafletPresentation = {
  box: LeafletAsset | null;
  seals: LeafletAsset[];
};
export const ASSET_PREFIX = "leaflet_asset:";
export const normalize = (value: unknown) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
export const boxCode = (value: unknown) =>
  normalize(value).replace(/^box[\s:_-]+/, "");
export const sealCode = (value: unknown) => {
  const code = normalize(value);
  if (["+18", "18", "18+", "selo +18", "selo 18"].includes(code)) return "+18";
  if (
    ["leite", "aleitamento", "amamentacao", "ministerio da saude"].includes(
      code,
    )
  )
    return "aleitamento";
  return code;
};
export const assetKey = (asset: Pick<LeafletAsset, "kind" | "code">) =>
  `${ASSET_PREFIX}${asset.kind}:${asset.code}`;
export function isAsset(value: unknown): value is LeafletAsset {
  if (!value || typeof value !== "object") return false;
  const a = value as Partial<LeafletAsset>;
  return (
    (a.kind === "box" || a.kind === "seal") &&
    typeof a.code === "string" &&
    !!a.code &&
    typeof a.name === "string" &&
    !!a.name &&
    typeof a.alt === "string" &&
    typeof a.imageUrl === "string" &&
    /^https:\/\//.test(a.imageUrl)
  );
}
export function field(row: Record<string, unknown>, ...labels: string[]) {
  for (const label of labels) {
    const entry = Object.entries(row).find(
      ([key]) => normalize(key) === normalize(label),
    );
    if (entry && String(entry[1] ?? "").trim()) return entry[1];
  }
  return "";
}
export const enabled = (value: unknown) =>
  ["sim", "s", "true", "1", "x", "yes", "+18", "18"].includes(
    normalize(value),
  ) ||
  (typeof value === "number" && value > 0);
export function requestedSeals(
  row: Record<string, unknown>,
  age18 = false,
  breastfeeding = false,
) {
  const codes = String(field(row, "Selos", "Selo"))
    .split(/[;,|]/)
    .map(sealCode)
    .filter(Boolean);
  if (
    age18 ||
    ["Selo +18", "+18", "Selo 18 Top Ofertas / Cooperado"].some((label) =>
      enabled(field(row, label)),
    )
  )
    codes.push("+18");
  if (
    breastfeeding ||
    [
      "Advertência leite",
      "Advertência Ministério da Saúde",
      "Selo leite",
      "Aleitamento materno",
    ].some((label) => enabled(field(row, label)))
  )
    codes.push("aleitamento");
  return [...new Set(codes)];
}
export function resolvePresentation(
  row: Record<string, unknown>,
  assets: LeafletAsset[],
  overrides: Record<string, string> = {},
): LeafletPresentation {
  const box = boxCode(field(row, "BOX", "Box folheteria"));
  const selectedCode = Object.prototype.hasOwnProperty.call(overrides, box)
    ? overrides[box]
    : box;
  const background = assets.find(
    (a) => a.kind === "box" && a.code === selectedCode,
  );
  if (box && !background)
    throw new Error(
      `Fundo não cadastrado para o box “${box}”. Cadastre-o na biblioteca ou selecione outro fundo.`,
    );
  const seals = requestedSeals(row).map((code) => {
    const seal = assets.find((a) => a.kind === "seal" && a.code === code);
    if (!seal)
      throw new Error(
        `Selo “${code}” não cadastrado. Envie a arte na biblioteca de fundos e selos.`,
      );
    return seal;
  });
  return {
    box: background
      ? {
          ...background,
          code: box,
          name: String(field(row, "BOX", "Box folheteria"))
            .trim()
            .replace(/^box\s+/i, ""),
        }
      : null,
    seals,
  };
}
export function productPresentation(
  product: LeafletProduct,
  assets: LeafletAsset[],
): LeafletPresentation {
  const saved = product.erp_payload?._leaflet_presentation;
  if (saved && typeof saved === "object") {
    const p = saved as Partial<LeafletPresentation>;
    if (
      (p.box === null || isAsset(p.box)) &&
      Array.isArray(p.seals) &&
      p.seals.every(isAsset)
    )
      return p as LeafletPresentation;
  }
  const code = boxCode(
    product.box || field(product.erp_payload || {}, "BOX", "Box folheteria"),
  );
  return {
    box: assets.find((a) => a.kind === "box" && a.code === code) || null,
    seals: requestedSeals(
      product.erp_payload || {},
      product.age_18,
      product.breastfeeding_warning,
    ).flatMap((code) =>
      assets.filter((a) => a.kind === "seal" && a.code === code),
    ),
  };
}
export function groupProducts(
  products: LeafletProduct[],
  assets: LeafletAsset[],
) {
  const groups = new Map<
    string,
    {
      code: string;
      title: string;
      background: LeafletAsset | null;
      products: Array<{
        product: LeafletProduct;
        presentation: LeafletPresentation;
      }>;
    }
  >();
  for (const product of [...products].sort(
    (a, b) => a.sort_order - b.sort_order,
  )) {
    const presentation = productPresentation(product, assets);
    const raw =
      product.box || field(product.erp_payload || {}, "BOX", "Box folheteria");
    const code = presentation.box?.code || boxCode(raw);
    if (!groups.has(code))
      groups.set(code, {
        code,
        title:
          presentation.box?.name ||
          String(raw || "Ofertas").replace(/^box\s+/i, ""),
        background: presentation.box,
        products: [],
      });
    groups.get(code)!.products.push({ product, presentation });
  }
  return [...groups.values()];
}
