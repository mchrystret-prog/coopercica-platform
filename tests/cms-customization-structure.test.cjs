const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const ts = require('typescript');
const source = ts.transpileModule(fs.readFileSync('lib/cms-customization-structure.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const moduleExports = {};
new Function('exports', source)(moduleExports);
const { customizationModules, customizationSavePayload } = moduleExports;
const allSettings = Object.fromEntries([...new Set(Object.values(customizationModules).flatMap(m => m.settings)), 'store_galleries'].map(key => [key, { test: key }]));
const sections = ['lojas', 'revista', 'ofertas', 'delivery', 'drogaria', 'historia'].map(id => ({ id, label: id, active: true, sort_order: 1, content: { title1: id } }));
test('each module saves only its own settings and sections', () => {
  for (const [name, config] of Object.entries(customizationModules)) {
    const saved = customizationSavePayload(name, { settings: allSettings, sections });
    assert.deepEqual(Object.keys(saved.p_settings).sort(), [...config.settings].sort());
    assert.ok(!('store_galleries' in saved.p_settings));
    if (name !== 'personalization') {
      assert.deepEqual(saved.p_sections.map(s => s.id).sort(), [...config.sections].sort());
      assert.ok(saved.p_sections.every(s => !('sort_order' in s) && !('active' in s)));
    }
  }
});
test('Home visibility updates do not overwrite content owned by dedicated menus', () => {
  const saved = customizationSavePayload('personalization', { settings: allSettings, sections });
  for (const id of ['lojas', 'revista', 'ofertas']) {
    const section = saved.p_sections.find(s => s.id === id);
    assert.equal(section.active, true);
    assert.ok(!('content' in section));
  }
  assert.equal(saved.p_sections.find(s => s.id === 'delivery').content.title1, 'delivery');
});
test('dedicated content cannot reappear as a personalization tab', () => {
  assert.deepEqual(customizationModules.personalization.tabs, ['sections', 'history', 'partners', 'faq']);
  const memberships = Object.values(customizationModules).flatMap(m => m.settings);
  assert.equal(new Set(memberships).size, memberships.length);
});
