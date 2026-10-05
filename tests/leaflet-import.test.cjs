const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  spreadsheetRecords,
  importProducts,
  parseMoney,
} = require("../.leaflet-test/leaflet-import.js");
const {
  groupProducts,
  productPresentation,
  requestedSeals,
} = require("../.leaflet-test/leaflet-presentation.js");
const asset = (kind, code, image = code) => ({
  kind,
  code,
  name: code,
  alt: code,
  imageUrl: `https://example.com/${image}.png`,
});
const library = [
  asset("box", "padaria"),
  asset("box", "natal"),
  asset("seal", "+18"),
  asset("seal", "aleitamento"),
  asset("seal", "novidade"),
];
const records = (rows, columns = ["BOX", "Selos"]) =>
  spreadsheetRecords([
    ["EAN", "Descritivo Marketing", "Preço Vigente", ...columns],
    ...rows,
  ]);

test("BOX vazio do ERP e Box preenchido manualmente são consolidados sem perder produtos", () => {
  const input = records(
    [
      ["1", "Acém", 40.99, "", "Açougue", ""],
      ["2", "Bolo", 12, "Padaria", "", ""],
      ["3", "Cerveja", 5, "", "", 18],
    ],
    ["BOX", "Box", "Selo 18 Top Ofertas / Cooperado"],
  );
  const products = importProducts(input, [...library, asset("box", "acougue")]);
  assert.equal(products.length, 3);
  assert.deepEqual(
    products.map((product) => product.box),
    ["Açougue", "Padaria", null],
  );
  assert.equal(
    products[0].erp_payload._leaflet_presentation.box.code,
    "acougue",
  );
  assert.equal(products[0].regular_price, 40.99);
  assert.equal(products[2].age_18, true);
  assert.equal(
    products[2].erp_payload._leaflet_presentation.seals[0].code,
    "+18",
  );
  assert.equal(input[0].row.Box, undefined);
});

test("BOX repetido aceita indicações equivalentes e cabeçalhos idênticos", () => {
  const input = records(
    [
      ["1", "Pão", 5, " Box PADARIA ", "Padaria"],
      ["2", "Bolo", 12, "Padaria", ""],
    ],
    ["BOX", "BOX"],
  );
  const products = importProducts(input, library);
  assert.deepEqual(
    products.map(
      (product) => product.erp_payload._leaflet_presentation.box.code,
    ),
    ["padaria", "padaria"],
  );
});

test("BOX conflitante bloqueia a leitura com a linha real sem escolher um box silenciosamente", () => {
  assert.throws(
    () =>
      records([[], ["1", "Produto", 5, "Padaria", "Açougue"]], ["BOX", "Box"]),
    /Linha 3:.*boxes diferentes.*Padaria.*Açougue/,
  );
});

test("BOX padaria normaliza caixa, espaços e acentos sem alterar produtos sem box", () => {
  const products = importProducts(
    records([
      ["001", "Pão", "R$ 4,90", " Box PADARIA ", ""],
      ["002", "Leite", 5.9, "", "aleitamento"],
    ]),
    library,
  );
  assert.equal(
    products[0].erp_payload._leaflet_presentation.box.code,
    "padaria",
  );
  assert.equal(products[1].erp_payload._leaflet_presentation.box, null);
  assert.equal(products[1].breastfeeding_warning, true);
  assert.equal(products[0].regular_price, 4.9);
  assert.equal(products[0].ean, "001");
});
test("mesmo box em linhas separadas gera uma única seção na ordem da primeira aparição", () => {
  const products = importProducts(
    records([
      ["1", "Pão", 5, "Padaria", ""],
      ["2", "Arroz", 10, "", ""],
      ["3", "Bolo", 12, "Box padaria", ""],
    ]),
    library,
  ).map((p, i) => ({ ...p, id: String(i) }));
  const groups = groupProducts(products, library);
  assert.deepEqual(
    groups.map((g) => g.code),
    ["padaria", ""],
  );
  assert.deepEqual(
    groups[0].products.map((p) => p.product.description),
    ["Pão", "Bolo"],
  );
  assert.equal(groups.flatMap((g) => g.products).length, 3);
});
test("seleção de fundo por folheto preserva o box e captura a arte escolhida", () => {
  const [product] = importProducts(
    records([["1", "Pão", 5, "Padaria", ""]]),
    library,
    { padaria: "natal" },
  );
  assert.equal(product.erp_payload._leaflet_presentation.box.code, "padaria");
  assert.equal(
    product.erp_payload._leaflet_presentation.box.imageUrl,
    "https://example.com/natal.png",
  );
  assert.equal(
    productPresentation(product, [asset("box", "padaria", "nova")]).box
      .imageUrl,
    "https://example.com/natal.png",
  );
});
test("vários selos e aliases não duplicam advertências", () => {
  const [product] = importProducts(
    records([["1", "Bebida", 5, "", "18+; +18; novidade"]]),
    library,
  );
  assert.equal(product.age_18, true);
  assert.deepEqual(
    product.erp_payload._leaflet_presentation.seals.map((a) => a.code),
    ["+18", "novidade"],
  );
});
test("colunas legadas e nova advertência de leite são reconhecidas", () => {
  const [product] = importProducts(
    records(
      [["1", "Produto", 5, "Sim", "X"]],
      ["Selo 18 Top Ofertas / Cooperado", "Advertência leite"],
    ),
    library,
  );
  assert.equal(product.age_18, true);
  assert.equal(product.breastfeeding_warning, true);
  assert.deepEqual(requestedSeals({ Selos: "leite; Ministério da Saúde" }), [
    "aleitamento",
  ]);
});
test("arquivo ausente bloqueia importação com o número real da linha", () => {
  assert.throws(
    () => importProducts(records([["1", "Produto", 5, "Padaria", ""]]), []),
    /Linha 2: Fundo não cadastrado/,
  );
  assert.throws(
    () =>
      importProducts(records([[], ["1", "Produto", 5, "", "aleitamento"]]), []),
    /Linha 3: Selo/,
  );
});
test("folhetos antigos sem apresentação continuam legíveis com a biblioteca atual", () => {
  const product = {
    id: "1",
    sort_order: 1,
    box: "Box padaria",
    age_18: true,
    breastfeeding_warning: false,
    erp_payload: {},
  };
  assert.equal(productPresentation(product, library).box.code, "padaria");
  assert.equal(productPresentation(product, library).seals[0].code, "+18");
  assert.equal(groupProducts([{ ...product, box: null }], [])[0].code, "");
});
test("planilha vazia, preço inválido e cabeçalhos ambíguos são rejeitados", () => {
  assert.throws(() => records([]), /está vazia/);
  assert.throws(
    () => spreadsheetRecords([["EAN", "Descritivo Marketing"]]),
    /Colunas ausentes/,
  );
  assert.throws(
    () =>
      spreadsheetRecords([
        ["EAN", "ean", "Descritivo Marketing", "Preço Vigente"],
      ]),
    /repetidos/,
  );
  assert.throws(
    () => importProducts(records([["1", "Produto", "erro", "", ""]]), library),
    /Linha 2/,
  );
  assert.throws(
    () => importProducts(records([["1", "Produto", -1, "", ""]]), library),
    /inválido/,
  );
  assert.equal(parseMoney("R$ 1.234,56"), 1234.56);
  assert.equal(parseMoney(Infinity), null);
});
