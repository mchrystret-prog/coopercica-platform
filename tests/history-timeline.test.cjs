const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
function load(path, dependencies = {}) {
  const exports = {};
  new Function('exports', 'require', ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText)(exports, name => dependencies[name]);
  return exports;
}
const history = load('data/history.ts');
const { historyEntries, resolveHistory, validateHistory } = load('lib/history-timeline.ts', { '../data/history': history });
const settings = entries => ({ __timeline: JSON.stringify(entries) });
test('existing timelines and uploaded photos remain unchanged', () => {
  assert.deepEqual(resolveHistory({}), history.historyItems);
  assert.equal(resolveHistory({ fundacao: '/custom.jpg' })[0].image, '/custom.jpg');
  assert.equal(validateHistory({}), null);
});
test('editing, reordering, hiding and removal apply to both page variants', () => {
  const config = settings([{ id: 'loja-1', year: '1979', title: 'Novo título' }, { id: 'fundacao', active: false }]);
  const result = resolveHistory(config);
  assert.equal(result.length, 1);
  assert.equal(result[0].year, '1979');
  assert.equal(result[0].title, 'Novo título');
  assert.equal(resolveHistory(config, history.historyItems, true).length, 2);
  const about = history.historyItems.map(item => ({ ...item, description: 'Texto institucional detalhado' }));
  assert.equal(resolveHistory(config, about)[0].description, 'Texto institucional detalhado');
});
test('new active milestones require text and an accessible photo', () => {
  const entry = { id: 'novo', year: '2026', title: 'Expansão', description: 'Nova unidade', imageAlt: 'Fachada' };
  assert.match(validateHistory(settings([entry])), /imagem/);
  const config = { ...settings([entry]), novo: '/new.jpg' };
  assert.equal(validateHistory(config), null);
  assert.equal(resolveHistory(config)[0].image, '/new.jpg');
});
test('empty and entirely hidden timelines stay empty instead of restoring defaults', () => {
  assert.deepEqual(resolveHistory(settings([])), []);
  assert.deepEqual(resolveHistory(settings([{ id: 'fundacao', active: false }])), []);
});
test('malformed configuration falls back to existing history', () => {
  assert.equal(historyEntries({ __timeline: 'invalid' }).length, history.historyItems.length);
  assert.equal(historyEntries(settings([{ id: 'x' }, { id: 'x' }])).length, history.historyItems.length);
});
