/* eslint-disable @typescript-eslint/no-require-imports -- Exercise TS modules and the real OG renderer in Node. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
for (const extension of ['.ts', '.tsx']) require.extensions[extension] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText, filename);
const resolve = Module._resolveFilename;
Module._resolveFilename = function(name, parent, ...rest) { return resolve.call(this, name.startsWith('@/') ? path.resolve(__dirname, '..', name.slice(2)) : name, parent, ...rest); };
const { getFaqItems, validateFaq } = require('../lib/home-faq.ts');
const { socialImage } = require('../lib/social-sharing.ts');
const { customizationUploadRule, assertUploadGeometry } = require('../lib/cms-upload-rules.ts');
const imageUrl = 'https://pmcvhrkykezvtdzkkfpa.supabase.co/storage/v1/object/public/site-content/social/test.png';

test('FAQ validates complete visible answers, preserves order and allows hidden drafts', () => {
  assert.equal(getFaqItems({}).length, 4);
  assert.equal(getFaqItems({items: '[]'}).length, 0);
  assert.match(validateFaq({items: 'broken'}), /ler as perguntas/);
  assert.match(validateFaq({items: JSON.stringify([{id:'x',question:'Teste',answer:'',active:true}])}), /resposta/);
  assert.equal(validateFaq({items: JSON.stringify([{id:'x',question:'',answer:'',active:false}])}), null);
  assert.deepEqual(getFaqItems({items: JSON.stringify([{id:'b',question:'B',answer:'B'},{id:'a',question:'A',answer:'A'}])}).map(item=>item.id), ['b','a']);
  assert.equal(getFaqItems({items: 'not json'}).length, 0);
});
test('sharing images have fixed geometry and trusted storage URLs', () => {
  assert.equal(customizationUploadRule('social:image'), 'socialImage');
  assertUploadGeometry('socialImage',1200,630);
  assert.throws(()=>assertUploadGeometry('socialImage',1080,1350), /1200 × 630/);
  assert.equal(socialImage({image:imageUrl}), imageUrl);
  assert.equal(socialImage({image:'https://untrusted.example/image.png'}), null);
  assert.equal(socialImage({image:imageUrl+'?redirect=1'}), null);
  assert.equal(socialImage({image:imageUrl.replace('/social/', '/campaigns/')}), null);
});
test('real Open Graph renderer uses uploaded artwork and falls back for a broken file', async () => {
  const canvas=createCanvas(1200,630);const ctx=canvas.getContext('2d');ctx.fillStyle='#ef4037';ctx.fillRect(0,0,1200,630);const png=canvas.toBuffer('image/png');
  const original=global.fetch;let broken=false;
  global.fetch=async url=>String(url).includes('/rest/v1/site_settings')?new Response(JSON.stringify([{value:{image:imageUrl}}]),{headers:{'content-type':'application/json'}}):String(url)===imageUrl?new Response(broken?'invalid image':png,{headers:{'content-type':'image/png'}}):original(url);
  try {
    const generate=require('../app/opengraph-image.tsx').default;
    const response=await generate();assert.equal(response.headers.get('content-type'),'image/png');assert.equal(response.headers.get('cache-control'),'no-store');
    const decoded=await loadImage(Buffer.from(await response.arrayBuffer()));assert.equal(decoded.width,1200);assert.equal(decoded.height,630);
    const output=createCanvas(1200,630);output.getContext('2d').drawImage(decoded,0,0);assert.deepEqual([...output.getContext('2d').getImageData(1,1,1,1).data],[239,64,55,255]);
    broken=true;const fallback=await generate();const fallbackImage=await loadImage(Buffer.from(await fallback.arrayBuffer()));assert.equal(fallbackImage.width,1200);assert.equal(fallbackImage.height,630);
  } finally {global.fetch=original;}
});
test('rich FAQ answers link phrases, keep old text and escape unsupported markup', () => {
  const { answerLink, answerText }=require('../lib/faq-rich-text.ts');
  const React=require('react');const {renderToStaticMarkup}=require('react-dom/server');const {FaqAnswer}=require('../components/publications/FaqAnswer.tsx');
  const answer=JSON.stringify([{text:'Veja '},{text:'Nossa História',href:'/#historia',bold:true},{text:' e o '},{text:'site parceiro',href:'https://example.com'}]);
  assert.equal(answerText(answer,'rich'),'Veja Nossa História e o site parceiro');
  const html=renderToStaticMarkup(React.createElement(FaqAnswer,{answer,format:'rich'}));
  assert.match(html,/href="\/#historia"/);assert.match(html,/>Nossa História<\/strong>/);assert.match(html,/target="_blank" rel="noopener noreferrer"/);
  assert.equal(answerText('Resposta anterior'),'Resposta anterior');
  for(const href of ['javascript:alert(1)','data:text/html,test','//evil.example','/\\evil.example','https://user:password@example.com'])assert.equal(answerLink(href),null);
  const unsafe=renderToStaticMarkup(React.createElement(FaqAnswer,{answer:JSON.stringify([{text:'<script>alert(1)</script>',href:'javascript:alert(1)'}]),format:'rich'}));
  assert.ok(!unsafe.includes('<script>'));assert.ok(!unsafe.includes('<a '));
  assert.match(validateFaq({items:JSON.stringify([{id:'empty',question:'Teste',answer:'[]',answerFormat:'rich',active:true}])}),/resposta/);
});
test('store galleries preserve cover order, deduplicate photos and reject invalid destinations', () => {
  const {storeGallery,validateStoreGalleries}=require('../lib/store-gallery.ts');
  const first='https://pmcvhrkykezvtdzkkfpa.supabase.co/storage/v1/object/public/site-content/stores/front.jpg';
  const second=first.replace('front','inside');
  assert.deepEqual(storeGallery({'loja-1':JSON.stringify([first,second,first])},'loja-1'),[first,second]);
  assert.deepEqual(storeGallery({'loja-1':'broken'},'loja-1'),[]);
  assert.equal(validateStoreGalleries({'loja-1':JSON.stringify([first,second])}),null);
  assert.match(validateStoreGalleries({'loja-1':JSON.stringify(Array(7).fill(first))}),/6 fotos/);
  assert.match(validateStoreGalleries({'loja-1':JSON.stringify(['https://outside.example/image.jpg'])}),/válidas/);
  assert.deepEqual(storeGallery({'loja-1':JSON.stringify(['javascript:alert(1)','/stores/jardim-cica.jpg'])},'loja-1'),['/stores/jardim-cica.jpg']);
});
