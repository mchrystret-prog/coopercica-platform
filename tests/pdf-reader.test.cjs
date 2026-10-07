/* eslint-disable @typescript-eslint/no-require-imports -- Node tests exercise the generated browser PDF engine. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { PDFDocument, rgb } = require('pdf-lib');
const { createCanvas } = require('@napi-rs/canvas');

test('compatible main and worker render PDF pages without recent JavaScript APIs', async () => {
  // Reproduce clients without the new collection and typed-array helpers.
  delete Map.prototype.getOrInsertComputed;
  delete WeakMap.prototype.getOrInsertComputed;
  delete Uint8Array.prototype.toHex;
  const vendor = path.resolve(__dirname, '../public/vendor/pdfjs');
  const pdfjs = await import(pathToFileURL(path.join(vendor, 'pdf.legacy.min.mjs')).href);
  pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(path.join(vendor, 'pdf.worker.legacy.min.mjs')).href;
  const document = await PDFDocument.create();
  for (let i = 0; i < 3; i++) {
    const page = document.addPage([200, 300]);
    page.drawRectangle({ x: 20, y: 30, width: 100, height: 100, color: rgb(0.1, 0.3, 0.15) });
    page.drawText(`Pagina ${i + 1}`, { x: 20, y: 200, size: 20 });
  }
  const task = pdfjs.getDocument({ data: await document.save(), standardFontDataUrl: vendor + "/standard_fonts/", isEvalSupported: false });
  try {
    const pdf = await task.promise;
    assert.equal(pdf.numPages, 3);
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1 });
      const canvas = createCanvas(viewport.width, viewport.height);
      await page.render({ canvas, viewport }).promise;
      const pixel = canvas.getContext('2d').getImageData(50, 200, 1, 1).data;
      assert.ok(pixel[0] < 100 && pixel[1] < 130 && pixel[2] < 100, `Page ${i} must render content, not a blank canvas`);
      page.cleanup();
    }
  } finally {
    await task.destroy();
  }
});
