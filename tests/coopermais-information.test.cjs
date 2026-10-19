const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const Module = require('node:module');
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, file);
const resolve = Module._resolveFilename;
Module._resolveFilename = function(name, parent, ...rest) { return resolve.call(this, name.startsWith('@/') ? require('node:path').resolve(name.slice(2)) : name, parent, ...rest); };
const { getCoopermaisInformation, validateCoopermaisInformation } = require('../lib/coopermais-banner.ts');
test('existing video-only settings receive all supplied institutional information', () => {
  const data = getCoopermaisInformation({ mode: 'video' });
  assert.equal(data.enabled, true);
  assert.equal(data.eyebrow, 'Desde 1969');
  assert.deepEqual(data.metrics.map(item => item.value), ['210 mil', '9', '1.100', '12 mil']);
});
test('CMS customization changes information and safely accepts internal or HTTPS links', () => {
  assert.equal(getCoopermaisInformation({ metric1Value: '220 mil', infoEnabled: 'false' }).enabled, false);
  assert.equal(getCoopermaisInformation({ metric1Value: '220 mil' }).metrics[0].value, '220 mil');
  for (const href of ['/quem-somos', '/quem-somos#historia', '#historia', 'https://coopercica.com.br/historia']) {
    assert.equal(getCoopermaisInformation({ historyCtaHref: href }).ctaHref, href);
    assert.equal(validateCoopermaisInformation({ historyCtaHref: href }), null);
  }
});
test('invalid links fall back on the public site and are rejected when saving', () => {
  for (const href of ['javascript:alert(1)', '//example.com', '/\\example.com', 'https://user:pass@example.com', '/bad path']) {
    assert.equal(getCoopermaisInformation({ historyCtaHref: href }).ctaHref, '/quem-somos');
    assert.ok(validateCoopermaisInformation({ historyCtaHref: href }));
  }
});
