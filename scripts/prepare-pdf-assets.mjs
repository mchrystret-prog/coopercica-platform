import { cp, mkdir, copyFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
const require = createRequire(import.meta.url);
const pdf = path.dirname(require.resolve('pdfjs-dist/package.json'));
const flip = path.dirname(require.resolve('page-flip/package.json'));
await mkdir('public/vendor/pdfjs', { recursive: true });
await mkdir('public/vendor/page-flip', { recursive: true });
// The legacy main/worker pair includes polyfills for browsers without the newest JS APIs.
for (const file of ['pdf.min.mjs', 'pdf.worker.min.mjs']) {
  const compatibleName = file.replace('.min.mjs', '.legacy.min.mjs');
  await copyFile(path.join(pdf, 'legacy/build', file), path.join('public/vendor/pdfjs', compatibleName));
}
for (const folder of ['cmaps', 'standard_fonts', 'wasm']) await cp(path.join(pdf, folder), path.join('public/vendor/pdfjs', folder), { recursive: true });
await copyFile(path.join(pdf, 'LICENSE'), 'public/vendor/pdfjs/LICENSE');
await copyFile(path.join(flip, 'dist/js/page-flip.module.js'), 'public/vendor/page-flip/page-flip.module.js');
await copyFile(path.join(flip, 'LICENSE'), 'public/vendor/page-flip/LICENSE');
