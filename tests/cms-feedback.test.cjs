const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
const {readableCmsError}=require('../.cms-feedback-test/cms-feedback.js');
test('technical failures become actionable Portuguese without raw payloads',()=>{
 assert.match(readableCmsError(new Error('Failed to fetch')),/conexão/);
 assert.match(readableCmsError('HTTP 401'),/Entre novamente/);
 assert.match(readableCmsError('row-level security policy'),/permissões/);
 assert.match(readableCmsError('HTTP 413'),/Reduza/);
 assert.match(readableCmsError('duplicate key violates unique constraint'),/Já existe/);
 assert.doesNotMatch(readableCmsError('{"code":"PGRST000","details":"private"}'),/private|PGRST/);
 const message='Banner mobile: esperado 1080 × 1350 px; arquivo recebido: 400 × 400 px. Redimensione a imagem.';
 assert.equal(readableCmsError(message),message);
});
test('CMS destructive buttons and upload fields use shared components',()=>{
 let destructive=0,uploads=0;
 for(const f of fs.readdirSync('components/admin').filter(f=>f.endsWith('.tsx'))){const a=ts.createSourceFile(f,fs.readFileSync('components/admin/'+f,'utf8'),99,true,4);function v(n){if(ts.isJsxOpeningElement(n)||ts.isJsxSelfClosingElement(n)){
 const tag=n.tagName.getText(a);
 if(tag==='CmsFileInput')uploads++;
 if(tag==='input'&&f!=='CmsFileInput.tsx')assert.ok(!n.attributes.properties.some(p=>p.name?.getText(a)==='type'&&p.initializer?.text==='file'),f);
 if(tag==='Button'&&ts.isJsxElement(n.parent)&&/\b(Apagar|Remover|Excluir|Zerar|Cancelar|Encerrar|Desativar|Rejeitar)\b/i.test(n.parent.children.map(c=>c.getText(a)).join(' '))){assert.equal(n.attributes.properties.find(p=>p.name?.getText(a)==='variant')?.initializer?.text,'danger',f);destructive++;}
 }ts.forEachChild(n,v)}v(a)}assert.ok(destructive>=10);assert.ok(uploads>=20);
});
