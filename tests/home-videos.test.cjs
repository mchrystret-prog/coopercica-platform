/* eslint-disable @typescript-eslint/no-require-imports -- Test the server feed with isolated YouTube responses. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
function modules(fetch, key) {
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    const exports = {};
    const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
    vm.runInNewContext(code, { exports, require: name => name === 'server-only' ? {} : load(name === '@/data/videos' ? 'data/videos.ts' : 'lib/home-videos.ts'), fetch, process: { env: { YOUTUBE_API_KEY: key } }, URL, URLSearchParams, AbortSignal });
    cache.set(file, exports); return exports;
  }
  return { client: load('lib/home-videos.ts'), server: load('lib/home-videos-server.ts') };
}
test('manual lists accept YouTube URLs and reject foreign or malformed IDs', () => {
  const { client } = modules();
  assert.equal(client.youtubeId('https://youtu.be/5OSt_rpLsrI'), '5OSt_rpLsrI');
  assert.equal(client.youtubeId('https://evil.test/watch?v=5OSt_rpLsrI'), '');
  assert.equal(client.youtubeId('javascript:alert(1)'), '');
  assert.ok(client.validateHomeVideos({ featured: 'bad' }));
  const feed = client.manualFeed({ videos: JSON.stringify([{ id: 'https://www.youtube.com/watch?v=5OSt_rpLsrI', title: 'Receita' }]), playlists: '[]' });
  assert.equal(feed.featured, '5OSt_rpLsrI'); assert.equal(feed.playlists.length, 0);
});
test('API mode without credentials keeps manual content available', async () => {
  const { server } = modules(() => { throw new Error('Must not request API'); });
  const feed = await server.getHomeVideos({ mode: 'api' });
  assert.ok(feed.videos.length > 0);
});
test('YouTube feed loads uploads, playlists and only public embeddable videos', async () => {
  const calls = [];
  const { server } = modules(async url => {
    calls.push(url);
    const name = url.pathname.split('/').pop();
    const items = name === 'channels' ? [{ id: 'UCtest', contentDetails: { relatedPlaylists: { uploads: 'UUtest' } } }] : name === 'playlistItems' ? [{ snippet: { resourceId: { videoId: '5OSt_rpLsrI' } } }, { snippet: { resourceId: { videoId: 'q4fbx2FSRsA' } } }] : name === 'videos' ? [{ id: '5OSt_rpLsrI', snippet: { title: 'Receita API' }, status: { embeddable: true, privacyStatus: 'public' } }, { id: 'q4fbx2FSRsA', snippet: { title: 'Private' }, status: { embeddable: true, privacyStatus: 'private' } }] : [{ id: 'PLSSvXcn3LQpXaHbor4n9ng5fHX2rXYXsL', snippet: { title: 'Playlist API', thumbnails: { medium: { url: 'https://evil.test/image.jpg' } } } }];
    return { ok: true, json: async () => ({ items }) };
  }, 'test-key');
  const feed = await server.getHomeVideos({ mode: 'api', channel: '@coopercicajundiai' });
  assert.equal(feed.videos.length, 1); assert.equal(feed.videos[0].title, 'Receita API'); assert.equal(feed.playlists[0].title, 'Playlist API'); assert.equal(feed.playlists[0].thumbnail, undefined);
  assert.equal(calls.length, 4); assert.ok(calls.every(url => url.origin === 'https://www.googleapis.com'));
  assert.ok(!JSON.stringify(feed).includes('test-key'));
});
test('API errors preserve the curated manual feed', async () => {
  const { server } = modules(async () => ({ ok: false }), 'test-key');
  const feed = await server.getHomeVideos({ mode: 'api', videos: JSON.stringify([{ id: '5OSt_rpLsrI', title: 'Manual fallback' }]) });
  assert.equal(feed.videos[0].title, 'Manual fallback');
});
