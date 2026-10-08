const { test } = require('node:test');
const assert = require('node:assert/strict');
const { footerContactDefaults, footerContact, safeSocialUrl, whatsappUrl, validateFooterContact } = require('../.contact-test/footer-contact.js');
test('WhatsApp de exemplo não direciona o visitante a um número fictício', () => {
  assert.equal(whatsappUrl(footerContactDefaults.whatsapp, 'Olá'), null);
  assert.equal(whatsappUrl('', 'Olá'), null);
  assert.equal(whatsappUrl('+55 (11) 3456-7890', 'Olá & ajuda'), 'https://wa.me/551134567890?text=Ol%C3%A1%20%26%20ajuda');
});
test('links sociais aceitam HTTPS e rejeitam protocolos executáveis ou credenciais', () => {
  assert.equal(safeSocialUrl('javascript:alert(1)'), null);
  assert.equal(safeSocialUrl('http://example.com'), null);
  assert.equal(safeSocialUrl('https://user:password@example.com'), null);
  assert.equal(safeSocialUrl(''), null);
  assert.equal(safeSocialUrl(footerContactDefaults.instagram), footerContactDefaults.instagram);
});
test('CMS valida contatos antes de publicar, preservando opções de ocultar canais', () => {
  assert.equal(validateFooterContact({}), null);
  assert.ok(validateFooterContact({ backgroundColor: 'red; display:none' }));
  assert.equal(footerContact({ socialColor: 'invalid' }).socialColor, '#a8cf38');
  assert.equal(validateFooterContact({ whatsapp: '', instagram: '' }), null);
  assert.ok(validateFooterContact({ email: 'contato@example.com?bcc=outro@example.com' }));
  assert.ok(validateFooterContact({ whatsapp: '55119999abc9999' }));
  assert.ok(validateFooterContact({ linkedin: 'javascript:alert(1)' }));
  assert.equal(footerContact({ email: 'inválido' }).email, footerContactDefaults.email);
  assert.equal(footerContact({ enabled: 'false', instagram: '' }).instagram, '');
});
