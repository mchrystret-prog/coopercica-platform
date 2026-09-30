import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
function walk(dir) { return readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(join(dir,entry.name)) : [join(dir,entry.name)]); }
const files = ['app','components','styles'].flatMap(walk).filter(file => /\.(css|tsx|ts)$/.test(file));
const definitions = new Set(['--font-montserrat']); // Provided by next/font at runtime.
const references = [];
for (const file of files) {
  const source = readFileSync(file,'utf8');
  for (const match of source.matchAll(/(--[\w-]+)\s*:/g)) definitions.add(match[1]);
  for (const match of source.matchAll(/var\((--[\w-]+)(?=\s*[,)]|\s*\})/g)) references.push([file,match[1]]);
}
const missing = references.filter(([,token]) => !definitions.has(token));
const publicCSS = files.filter(file => file.endsWith('.css') && file !== 'styles/tokens.css' && file !== 'styles/admin.css');
const hardcoded = publicCSS.flatMap(file => [...readFileSync(file,'utf8').matchAll(/#[\da-f]{3,8}\b/gi)].map(match=>[file,match[0]]));
if (missing.length || hardcoded.length) {
  for(const [file,token] of missing) console.error(`${file}: undefined ${token}`);
  for(const [file,color] of hardcoded) console.error(`${file}: literal ${color}, use a semantic token`);
  process.exitCode=1;
} else console.log(`OK: ${files.length} source files; no undefined CSS tokens or literal hex colors in public styles.`);
