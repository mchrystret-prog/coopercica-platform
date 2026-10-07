/* eslint-disable @typescript-eslint/no-require-imports -- Exercise the browser reader without a native fullscreen API. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../public/reader.js'), 'utf8')
  .replace(/^import .*;\n/gm, '')
  .replace(/init\(\)\.catch\([\s\S]*$/, '');
function reader(requestFullscreen, fullscreenEnabled = false) {
  const elements = new Map(), messages = [], events = {}, documentEvents = {};
  const element = id => {
    if (!elements.has(id)) elements.set(id, { hidden: true, value: '', style: {}, attributes: {}, classList: { toggle() {} }, setAttribute(name, value) { this.attributes[name] = value; } });
    return elements.get(id);
  };
  element('reader').requestFullscreen = requestFullscreen;
  const parent = { postMessage: (data, origin) => messages.push({ data, origin }) };
  const document = { getElementById: element, fullscreenEnabled, fullscreenElement: null, addEventListener: (type, callback) => { documentEvents[type] = callback; } };
  const context = { document, parent, window: { addEventListener: (type, callback) => { events[type] = callback; } }, location: { search: '?id=edition-1', origin: 'https://example.test' }, URL, URLSearchParams, pdfjs: { GlobalWorkerOptions: {} }, console, setTimeout, clearTimeout };
  vm.runInNewContext(source, context);
  return { element, parent, messages, events, documentEvents, document };
}
test('missing native fullscreen expands the embedded reader and can exit', async () => {
  const r = reader(undefined);
  await r.element('fullscreen').onclick();
  assert.equal(r.messages[0].data.type, 'coopercica-reader-expand');
  assert.equal(r.messages[0].data.expanded, true);
  assert.equal(r.messages[0].origin, 'https://example.test');
  r.events.message({ origin: 'https://example.test', source: r.parent, data: { type: 'coopercica-reader-expanded', id: 'edition-1', expanded: true } });
  assert.equal(r.element('fullscreen').attributes['aria-label'], 'Sair da tela cheia');
  await r.element('fullscreen').onclick();
  assert.equal(r.messages[1].data.expanded, false);
});
test('native fullscreen rejection falls back to expanded reading', async () => {
  const r = reader(async () => { throw new Error('Not supported'); }, true);
  await r.element('fullscreen').onclick();
  assert.equal(r.messages[0].data.expanded, true);
});
test('supported native fullscreen retains native behavior', async () => {
  let entered = false;
  const r = reader(async () => { entered = true; }, true);
  await r.element('fullscreen').onclick();
  assert.equal(entered, true);
  assert.equal(r.messages.length, 0);
});
test('foreign messages cannot change fullscreen state; Escape exits expanded mode', () => {
  const r = reader(undefined);
  const data = { type: 'coopercica-reader-expanded', id: 'edition-1', expanded: true };
  r.events.message({ origin: 'https://other.test', source: r.parent, data });
  assert.equal(r.element('fullscreen').attributes['aria-label'], undefined);
  r.events.message({ origin: 'https://example.test', source: r.parent, data });
  r.documentEvents.keydown({ key: 'Escape', target: { closest: () => null } });
  assert.equal(r.messages[0].data.expanded, false);
});
