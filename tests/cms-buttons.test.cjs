const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):e.name.endsWith('.tsx')?[path.join(dir,e.name)]:[])}
test('all CMS action buttons use the design system; only drawer backdrop is native',()=>{
  const violations=[];let buttons=0;
  for(const file of [...files('components/admin'),...files('app/admin')]){
    const source=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
    function visit(node){
      if(ts.isJsxOpeningElement(node)||ts.isJsxSelfClosingElement(node)){
        const name=node.tagName.getText(source);
        if(name==='button'&&!node.attributes.getText(source).includes('cms-drawer-backdrop'))violations.push(file);
        if(name==='Button')buttons++;
      }
      ts.forEachChild(node,visit);
    }
    visit(source);
  }
  assert.deepEqual(violations,[]);
  assert.ok(buttons>100,'audit must cover the complete CMS');
});
