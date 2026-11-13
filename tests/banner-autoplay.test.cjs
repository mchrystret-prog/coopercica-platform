const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function setup() {
  const document = new EventTarget();
  document.hidden = false;
  const window = new EventTarget();
  let intersect, disconnected = false;
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync('lib/banner-autoplay.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(source, { exports, document, window, IntersectionObserver: class {
    constructor(callback) { intersect = callback; }
    observe() {}
    disconnect() { disconnected = true; }
  } });
  const video = new EventTarget();
  let attempts = 0, pauses = 0;
  video.play = () => { attempts++; return attempts === 1 ? Promise.reject(new Error('NotAllowedError')) : Promise.resolve(); };
  video.pause = () => { pauses++; };
  const stop = exports.observeBannerAutoplay(video);
  return { video, document, window, stop, enter: () => intersect([{ isIntersecting: true }]),
    leave: () => intersect([{ isIntersecting: false }]),
    get attempts() { return attempts; }, get pauses() { return pauses; }, get disconnected() { return disconnected; } };
}

test('retries rejected autoplay on readiness and reentry, always muted', async () => {
  const s = setup();
  assert.equal(s.attempts, 0);
  s.enter();
  await Promise.resolve();
  s.video.dispatchEvent(new Event('canplay'));
  assert.equal(s.attempts, 2);
  assert.equal(s.video.muted, true);
  assert.equal(s.video.defaultMuted, true);
  s.leave();
  s.video.dispatchEvent(new Event('loadeddata'));
  assert.equal(s.attempts, 2);
  assert.equal(s.pauses, 1);
  s.enter();
  assert.equal(s.attempts, 3);
  s.stop();
});

test('resumes visible video after returning, stops retries after cleanup/manual pause', async () => {
  const s = setup();
  s.enter();
  await Promise.resolve();
  s.document.hidden = true;
  s.document.dispatchEvent(new Event('visibilitychange'));
  s.video.dispatchEvent(new Event('canplay'));
  assert.equal(s.attempts, 1);
  s.document.hidden = false;
  s.document.dispatchEvent(new Event('visibilitychange'));
  s.window.dispatchEvent(new Event('pageshow'));
  assert.equal(s.attempts, 3);
  s.stop();
  s.video.dispatchEvent(new Event('canplay'));
  s.document.dispatchEvent(new Event('visibilitychange'));
  s.window.dispatchEvent(new Event('pageshow'));
  s.enter();
  assert.equal(s.attempts, 3);
  assert.equal(s.disconnected, true);
});
