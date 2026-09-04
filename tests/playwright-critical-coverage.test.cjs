const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const config=fs.readFileSync(path.join(root,'playwright.config.cjs'),'utf8');
const workflow=fs.readFileSync(path.join(root,'.github/workflows/architecture-validation.yml'),'utf8');

const critical=[
  'architecture-auth-boot',
  'admin-mfa-enforcement-browser',
  'contract-explicit-rules-browser',
  'contract-document-safety-browser',
  'accessibility-responsive'
];

test('los escenarios críticos pedidos por CI también están permitidos por testMatch',()=>{
  for(const name of critical){
    assert.match(workflow,new RegExp(`${name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\.spec\\.cjs`),`${name}: el workflow debe invocarlo`);
    if(name.endsWith('-responsive')){
      assert.match(config,/\.\*responsive\.\*/,`${name}: testMatch debe admitir specs responsive`);
    }else{
      assert.ok(config.includes(name),`${name}: testMatch lo estaba filtrando y produciría un falso verde`);
    }
  }
});

test('la validación arquitectónica ejecuta Playwright con cero reintentos para no ocultar fallos',()=>{
  assert.match(workflow,/playwright test[\s\S]*--workers=1\s+--retries=0/);
});
