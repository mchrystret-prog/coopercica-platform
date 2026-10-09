/* eslint-disable @typescript-eslint/no-require-imports -- Tests run compiled upload validators in Node. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createCanvas, loadImage } = require("@napi-rs/canvas");
const { PDFDocument } = require("pdf-lib");
const { assertUploadGeometry, uploadRequirements } = require("../.upload-test/cms-upload-rules.js");
const { validateCmsUpload, validateCmsUploads } = require("../.upload-test/cms-upload-validation.js");

// Decode real images rather than returning fabricated dimensions.
global.createImageBitmap = async (file) => {
  const decoded = await loadImage(Buffer.from(await file.arrayBuffer()));
  return { width: decoded.width, height: decoded.height, close() {} };
};
function imageFile(width, height, name = "foto.png") {
  const canvas = createCanvas(width, height);
  canvas.getContext("2d").fillRect(0, 0, width, height);
  return new File([canvas.toBuffer("image/png")], name, { type: "image/png" });
}

test("real image dimensions are checked before upload", async () => {
  await validateCmsUpload(imageFile(1080, 1440), "leafletCover");
  await assert.rejects(validateCmsUpload(imageFile(1080, 1350, "capa-errada.png"), "leafletCover"), /capa-errada.*1080 × 1440.*1080 × 1350/);
});
test("products retain their proportions within a bounded size", async () => {
  await validateCmsUpload(imageFile(100, 900), "product");
  await assert.rejects(validateCmsUpload(imageFile(40, 900), "product"), /fora do intervalo/);
  await assert.rejects(validateCmsUpload(imageFile(1601, 300), "product"), /fora do intervalo/);
});
test("oversized, empty, renamed and corrupted files are rejected", async () => {
  await assert.rejects(validateCmsUpload(new File([new Uint8Array(1024 * 1024 + 1)], "produto.png", { type: "image/png" }), "product"), /limite de 1 MB/);
  await assert.rejects(validateCmsUpload(new File([], "vazio.png", { type: "image/png" }), "product"), /não vazio/);
  await assert.rejects(validateCmsUpload(new File(["not a PNG"], "falso.png", { type: "image/png" }), "product"), /conteúdo não corresponde/);
  await assert.rejects(validateCmsUpload(new File([new Uint8Array([137, 80, 78, 71])], "corrompido.png", { type: "image/png" }), "product"));
  await assert.rejects(validateCmsUpload(new File(["x"], "produto.gif", { type: "image/gif" }), "product"), /formato inválido/);
});
test("a bad second file prevents the complete batch from reaching the upload", async () => {
  let sent = false;
  async function submit(entries) { await validateCmsUploads(entries); sent = true; }
  await assert.rejects(submit([[imageFile(1920, 826), "campaignDesktop"], [imageFile(800, 600), "campaignMobile"]]));
  assert.equal(sent, false);
  await assert.rejects(submit([[null, "campaignDesktop"]]), /selecione/);
  assert.equal(sent, false);
});
test("video dimensions and duration have independent limits", () => {
  assertUploadGeometry("coopermaisVideo", 2880, 432, false, 15);
  assert.throws(() => assertUploadGeometry("coopermaisVideo", 2880, 432, false, 15.01), /duração/);
  assert.throws(() => assertUploadGeometry("coopermaisVideo", 2880, 432, false, Infinity), /duração/);
  assert.throws(() => assertUploadGeometry("coopermaisVideo", 1920, 1080, false, 5), /esperado 2880 × 432/);
});
test("logos accept scalable horizontal SVG geometry and bound raster resolution", () => {
  assertUploadGeometry("logo", 861, 145, true);
  assertUploadGeometry("logo", 1200, 203);
  assert.throws(() => assertUploadGeometry("logo", 861, 145), /fora do intervalo/);
  assert.throws(() => assertUploadGeometry("logo", 1200, 600), /proporção/);
  assert.match(uploadRequirements("logo"), /512 KB/);
});
test("PDFs are parsed and constrained to 300 pages", async () => {
  const pdf = await PDFDocument.create();
  pdf.addPage();
  await validateCmsUpload(new File([await pdf.save()], "valido.pdf", { type: "application/pdf" }), "pdf");
  for (let i = 0; i < 300; i++) pdf.addPage();
  await assert.rejects(validateCmsUpload(new File([await pdf.save()], "longo.pdf", { type: "application/pdf" }), "pdf"), /300 páginas/);
  await assert.rejects(validateCmsUpload(new File(["%PDF-invalid"], "corrompido.pdf", { type: "application/pdf" }), "pdf"), /PDF válido/);
});
