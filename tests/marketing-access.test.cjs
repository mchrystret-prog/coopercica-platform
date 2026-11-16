const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
function load(path) {
  const exports = {};
  new Function('exports', ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText)(exports);
  return exports;
}
const { canAccessCms, cmsRoleName } = load('lib/cms-access.ts');
const { customizationTabsForRole, customizationSavePayload } = load('lib/cms-customization-structure.ts');
test('Marketing has only explicitly supported content modules, including nested routes', () => {
  assert(canAccessCms('marketing', '/admin'));
  for (const module of ['personalizacao', 'campanhas', 'revistas', 'folheteria', 'lojas', 'midias', 'analytics', 'politicas']) {
    assert(canAccessCms('marketing', `/admin/${module}`));
    assert(canAccessCms('marketing', `/admin/${module}/editar`));
  }
  for (const path of ['/admin/vagas', '/admin/vagas/candidaturas', '/admin/configuracoes', '/admin/configuracoes/api', '/admin/usuarios', '/admin/futuro', '/admin/personalizacao-extra']) assert(!canAccessCms('marketing', path), path);
  assert.equal(cmsRoleName('marketing'), 'Marketing');
});
test('Marketing cannot open recruitment or API tabs via customization', () => {
  const tabs = customizationTabsForRole('personalization', 'marketing');
  assert(tabs.includes('identity') && tabs.includes('history'));
  assert(!tabs.includes('careers'));
  assert.deepEqual(customizationTabsForRole('settings', 'marketing'), []);
  assert(customizationTabsForRole('personalization', 'admin').includes('careers'));
});
test('Marketing save payload excludes restricted settings even from stale client data', () => {
  const data = { settings: { identity: { siteName: 'Coopercica' }, history_images: {}, careers_hero: { title: 'Protected' }, offers_delivery: { endpoint: 'protected' } }, sections: [] };
  const result = customizationSavePayload('personalization', data, data, 'marketing');
  assert.deepEqual(Object.keys(result.p_settings), ['identity', 'history_images']);
  assert.deepEqual(customizationSavePayload('settings', data, data, 'marketing').p_settings, {});
  assert('careers_hero' in customizationSavePayload('personalization', data, data, 'admin').p_settings);
});
