const assert=require('node:assert/strict');
const fs=require('node:fs');

const read=file=>fs.readFileSync(file,'utf8');
const html=read('index.html');
const rootScripts=[...html.matchAll(/<script\s+[^>]*src=["']([^"']+)/g)]
  .map(match=>match[1].split('?')[0])
  .filter(src=>!/^https?:/i.test(src));
const sources=[html,...rootScripts.map(read)].join('\n');

const rpcReferences=[...new Set([...sources.matchAll(/\/rest\/v1\/rpc\/([a-z0-9_]+)/gi)].map(match=>match[1]))].sort();
// Contrato contrastado con pg_proc del proyecto activo durante la auditoria funcional.
const publishedRpcs=[
  'acknowledge_alert','approve_access_request','archive_project','create_workspace_invite',
  'get_control_center','record_reconciliation_review','reject_access_request','restore_project','save_app_state',
  'security_lockdown_other_users',
].sort();
assert.deepEqual(rpcReferences,publishedRpcs,'La interfaz cambio sus RPC; hay que validar el contrato en Supabase antes de publicar');

const edgeReferences=[...new Set([...sources.matchAll(/\/functions\/v1\/([a-z0-9_-]+)/gi)].map(match=>match[1]))].sort();
for(const slug of edgeReferences){
  assert.ok(fs.existsSync(`supabase/functions/${slug}/index.ts`),`Funcion Edge sin fuente: ${slug}`);
}

const adminUi=read('admin-users-v1.js');
const adminEdge=read('supabase/functions/manage-users/index.ts');
const adminActions=[...new Set([...adminUi.matchAll(/call\(['"]([a-z0-9_]+)['"]/gi)].map(match=>match[1]))].sort();
for(const action of adminActions){
  assert.match(adminEdge,new RegExp(`action\\s*(?:===|!==)\\s*["']${action}["']`),`Accion administrativa sin backend: ${action}`);
}

const recovery=read('password-recovery-v1.js');
assert.match(recovery,/\/auth\/v1\/recover/,'Recuperacion no solicita el correo a Supabase Auth');
assert.match(recovery,/\/auth\/v1\/user/,'Recuperacion no guarda la nueva contrasena');
assert.match(html,/id=["']authEmail["'][^>]*type=["']email["']|type=["']email["'][^>]*id=["']authEmail["']/,'Recuperacion no valida el correo en el formulario');

const chatbot=read('engineer-chatbot-v3.js');
assert.match(chatbot,/cloudAiAvailable=false/,'Halu debe evitar solicitudes 503 repetidas y conservar el modo local');
assert.match(chatbot,/return answer\(q\)/,'Halu debe conservar una respuesta local cuando falle la IA externa');

console.log(`backend-contracts: ${rpcReferences.length} RPC, ${edgeReferences.length} Edge Functions y ${adminActions.length} acciones verificadas`);
