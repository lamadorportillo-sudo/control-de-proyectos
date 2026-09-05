const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const source=fs.readFileSync('supabase/functions/telegram-router/index.ts','utf8');

test('el vínculo Telegram exige membresía activa del mismo workspace',()=>{
  assert.match(source,/async function linkFor\(tid:any\)[\s\S]*from\("workspace_members"\)[\s\S]*eq\("workspace_id",data\.workspace_id\)[\s\S]*eq\("user_id",data\.user_id\)[\s\S]*eq\("active",true\)/,
    'un telegram_link activo no basta: debe verificarse workspace_members activo');
});

test('toda lectura directa de proyecto queda limitada al workspace del vínculo',()=>{
  assert.match(source,/async function getProject\(l:any,id:string\)[\s\S]*from\("projects"\)[\s\S]*eq\("workspace_id",l\.workspace_id\)[\s\S]*eq\("id",id\)/,
    'getProject debe filtrar workspace_id antes de devolver el proyecto');
  assert.doesNotMatch(source,/async function getProject\(id:string\)/,'no puede sobrevivir el helper global sin contexto de workspace');
  const invocations=[...source.matchAll(/getProject\(([^)]*)\)/g)]
    .map(match=>match[1].trim())
    .filter(args=>!args.includes(':'));
  assert.ok(invocations.length>=8,'deben detectarse las llamadas operativas a getProject');
  for(const args of invocations)assert.match(args,/^l\s*,/,`getProject(${args}) omite el vínculo/workspace`);
});

test('callbacks con project_id tampoco pueden saltar de workspace',()=>{
  for(const prefix of ['vqp:','vqpl:','vrp:','vrrp:']){
    const pos=source.indexOf(`d.startsWith("${prefix}")`);
    assert.ok(pos>=0,`debe existir callback ${prefix}`);
    const fragment=source.slice(pos,pos+420);
    assert.match(fragment,/getProject\(l,pid\)/,`${prefix} debe validar el proyecto con el workspace del vínculo`);
  }
  const rv=source.slice(source.indexOf('d.startsWith("rv:")'),source.indexOf('d.startsWith("rf:")'));
  assert.match(rv,/getProject\(l,dr\.project_id\)/,'la selección de visita desde draft también debe validar workspace');
});

test('el router anuncia la revisión aislada por workspace',()=>{
  assert.match(source,/version:"3\.2-workspace-isolated"/);
});
