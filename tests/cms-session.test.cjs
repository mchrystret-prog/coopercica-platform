/* eslint-disable @typescript-eslint/no-require-imports -- Tests run the compiled browser session helper in Node. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const session = require('../.cms-session-test/cms-session.js');
const { publicationUploadError } = require('../.cms-session-test/publication-upload-error.js');
const values = new Map();
global.sessionStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key) };
const token = (seconds) => 'header.' + Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + seconds })).toString('base64url') + '.signature';

test('valid session skips refresh; expiring concurrent requests share one rotation', async () => {
  let calls = 0;
  const fresh = token(3600);
  global.fetch = async (_url, options) => {
    calls++;
    assert.equal(JSON.parse(options.body).refresh_token, 'fake-refresh-old');
    return Response.json({ access_token: fresh, refresh_token: 'fake-refresh-new' });
  };
  session.saveCmsSession(fresh, 'fake-refresh-old');
  assert.equal(await session.getCmsAccessToken(), fresh);
  assert.equal(calls, 0);
  session.saveCmsSession(token(-10), 'fake-refresh-old');
  assert.deepEqual(await Promise.all([session.getCmsAccessToken(), session.getCmsAccessToken()]), [fresh, fresh]);
  assert.equal(calls, 1);
  assert.equal(sessionStorage.getItem('coopercica_admin_refresh_token'), 'fake-refresh-new');
});

test('logout during renewal cannot restore credentials', async () => {
  let complete;
  global.fetch = () => new Promise(resolve => { complete = resolve; });
  session.saveCmsSession(token(-10), 'fake-refresh-pending');
  const promise = session.getCmsAccessToken();
  session.clearCmsSession();
  complete(Response.json({ access_token: token(3600), refresh_token: 'fake-refresh-rotated' }));
  await assert.rejects(promise, session.CmsSessionExpired);
  assert.equal(sessionStorage.getItem('coopercica_admin_token'), null);
});

test('expired legacy login and rejected refresh require reauthentication', async () => {
  session.clearCmsSession();
  sessionStorage.setItem('coopercica_admin_token', token(-5));
  await assert.rejects(session.getCmsAccessToken(), session.CmsSessionExpired);
  session.saveCmsSession(token(-5), 'fake-invalid-refresh');
  global.fetch = async () => Response.json({ error_code: 'refresh_token_not_found' }, { status: 400 });
  await assert.rejects(session.getCmsAccessToken(), session.CmsSessionExpired);
});

test('temporary service failure preserves refresh token for later retry', async () => {
  session.saveCmsSession(token(-5), 'fake-refresh-retry');
  global.fetch = async () => new Response(null, { status: 503 });
  await assert.rejects(session.getCmsAccessToken(), /conexão/);
  assert.equal(sessionStorage.getItem('coopercica_admin_refresh_token'), 'fake-refresh-retry');
});

test('storage 400 expired JWT is explained separately from size and permission failures', async () => {
  assert.match((await publicationUploadError(Response.json({ message: '"exp" claim timestamp check failed' }, { status: 400 }), 'O PDF')).message, /sessão expirou/);
  assert.match((await publicationUploadError(Response.json({ message: 'new row violates row-level security policy' }, { status: 403 }), 'O PDF')).message, /permissão/);
  assert.match((await publicationUploadError(new Response('not JSON', { status: 413 }), 'O PDF')).message, /15 MB/);
});
