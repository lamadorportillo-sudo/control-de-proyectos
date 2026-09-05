const assert=require('node:assert/strict');
const fs=require('node:fs');

const read=file=>fs.readFileSync(file,'utf8');
const html=read('index.html');
// El contrato backend abarca tanto scripts ejecutables directos como módulos
// autenticados declarados de forma inerte con data-src; ambos pueden invocar RPC
// una vez que el usuario inicia sesión.
const rootScripts=[...html.matchAll(/<script\s+[^>]*(?:\s|^)(?:src|data-src)=["']([^"']+)/g)]
  .map(match=>match[1].split('?')[0])
  .filter(src=>!/^https?:/i.test(src));
const sources=[html,...[...new Set(rootScripts)].filter(fs.existsSync).map(read)].join('\n');

const rpcReferences=[...new Set([...sources.matchAll(/\/rest\/v1\/rpc\/([a-z0-9_]+)/gi)].map(match=>match[1]))].sort();
// Contrato de RPC consumidos actualmente por el cliente. Durante el cierre de
// auditoría se contrastó pg_proc en producción: acknowledge_alert y
// record_reconciliation_review continúan disponibles en backend, pero ya no son
// invocados por la interfaz consolidada y por eso no deben fingirse como carga UI.
const publishedClientRpcs=[
  'approve_access_request','archive_project','create_workspace_invite','get_control_center',
  'reject_access_request','restore_project','save_app_state','security_lockdown_other_users',
].sort();
assert.deepEqual(rpcReferences,publishedClientRpcs,'La interfaz cambió sus RPC; hay que validar el contrato en Supabase antes de publicar');

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
assert.match(chatbot,/Promise\.resolve\(answer\(q\)\)/,'Halu debe conservar una respuesta local cuando falle la IA externa');

console.log(`backend-contracts: ${rpcReferences.length} RPC de cliente, ${edgeReferences.length} Edge Functions y ${adminActions.length} acciones verificadas`);
