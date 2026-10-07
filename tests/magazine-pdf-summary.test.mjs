import { test } from "node:test";
import assert from "node:assert/strict";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { suggestMagazineEditorial, pdfTextLines } from "../lib/magazine-pdf-summary.ts";

const item = (str, x, y, size = 12, width = str.length * size / 2) => ({ str, width, height: size, transform: [size, 0, 0, size, x, y] });
const page = (items, number = 1) => ({ number, width: 600, height: 800, items });

test("real PDF.js text extraction identifies sections, joins title lines and ignores body/footer", async () => {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs", import.meta.url).href;
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.Helvetica);
  const source = document.addPage([600, 800]);
  for (const [text, y, size] of [["Dicas da nutri", 740, 14], ["Escolhas para uma", 700, 26], ["alimentação equilibrada", 670, 26], ["Conheça alimentos que podem fazer parte da sua rotina.", 620, 11], ["Consulte um profissional para orientações individuais.", 600, 11], ["Revista Coopercica 12", 20, 10]]) source.drawText(text, { x: 40, y, size, font });
  const task = pdfjs.getDocument({ data: await document.save(), standardFontDataUrl: new URL("../node_modules/pdfjs-dist/standard_fonts/", import.meta.url).pathname });
  try {
    const pdf = await task.promise;
    const pdfPage = await pdf.getPage(1);
    const text = await pdfPage.getTextContent();
    const result = suggestMagazineEditorial([page(text.items.filter(row => "str" in row))]);
    assert.deepEqual(result.highlights, [{ label: "Dicas da nutri", text: "Escolhas para uma alimentação equilibrada", page: 1 }]);
    assert.equal(result.summary, "Nesta edição: Escolhas para uma alimentação equilibrada.");
  } finally { await task.destroy(); }
});

test("TOC contents are deduplicated, page numbers removed and limits respected", () => {
  const pages = Array.from({ length: 12 }, (_, index) => page([
    item(`Receitas: Receita especial ${String.fromCharCode(65 + index)} .... ${index + 2}`, 30, 700),
    item("Texto de apresentação da revista para leitura.", 30, 600),
  ], index + 1));
  const result = suggestMagazineEditorial([pages[0], ...pages], 80);
  assert.equal(result.highlights.length, 8);
  assert.equal(result.highlights[0].text, "Receita especial A");
  assert.ok(result.summary.length <= 700);
  assert.equal(result.pagesRead, 13);
  assert.equal(result.totalPages, 80);
});

test("columns remain separate and prices are not article titles", () => {
  const source = page([item("Receitas", 30, 740, 14), item("Fique bem", 340, 740, 14),
    item("Bolo de cenoura", 30, 700, 24), item("Cuidados no verão", 340, 700, 24),
    item("R$ 19,90", 30, 670, 30), item("Texto do corpo da matéria para contextualizar.", 30, 600)]);
  assert.equal(pdfTextLines(source).filter(line => line.y === 740).length, 2);
  assert.deepEqual(suggestMagazineEditorial([source]).highlights.map(row => row.text), ["Bolo de cenoura", "Cuidados no verão"]);
});

test("image-only PDF and unrelated text cannot fabricate a summary", () => {
  assert.throws(() => suggestMagazineEditorial([page([])]), /OCR/);
  assert.throws(() => suggestMagazineEditorial([page([item("Um documento qualquer sem quadros reconhecíveis e sem índice.", 30, 700)])]), /com segurança/);
});
