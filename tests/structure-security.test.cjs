const fs=require('fs');
const path=require('path');
const assert=require('assert');

const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');

const localRefs=[...html.matchAll(/(?:src|href)=["']([^"'#?]+)[^"']*["']/g)]
  .map(match=>match[1])
  .filter(ref=>!/^([a-z]+:|\/\/|data:|mailto:)/i.test(ref) && !ref.includes('${'));
const missing=[...new Set(localRefs.filter(ref=>!fs.existsSync(path.resolve(root,ref))))];
assert.deepStrictEqual(missing,[],`Recursos locales inexistentes: ${missing.join(', ')}`);

const scripts=[...html.matchAll(/<script\s+src=["']([^"']+)/g)].map(match=>match[1].split('?')[0]);
const duplicateScripts=[...new Set(scripts.filter((script,index)=>scripts.indexOf(script)!==index))];
assert.deepStrictEqual(duplicateScripts,[],`Scripts duplicados: ${duplicateScripts.join(', ')}`);

const staticIds=[...html.matchAll(/\bid=["']([^"'$]+)["']/g)].map(match=>match[1]);
const duplicateIds=[...new Set(staticIds.filter((id,index)=>staticIds.indexOf(id)!==index))];
// Estos ID aparecen en plantillas de render alternativas que nunca conviven en el DOM.
const allowedTemplateIds=['contractBtn','projectSearch','scanEstimateBtn','trashToggle'];
assert.deepStrictEqual(duplicateIds.sort(),allowedTemplateIds.sort(),`Cambió el conjunto de ID reutilizados por plantillas: ${duplicateIds.join(', ')}`);

const sourceFiles=fs.readdirSync(root).filter(file=>file.endsWith('.js')).concat([
  'supabase/functions/halu-chat/index.ts',
  'supabase/functions/manage-users/index.ts',
]);
for(const file of sourceFiles){
  const source=fs.readFileSync(path.join(root,file),'utf8');
  assert(!/\bsk-[A-Za-z0-9_-]{20,}/.test(source),`Posible clave de OpenAI expuesta en ${file}`);
  if(!file.startsWith('supabase/'))assert(!/SUPABASE_SERVICE_ROLE_KEY|service_role/i.test(source),`Clave privilegiada referenciada desde cliente en ${file}`);
}

const halu=fs.readFileSync(path.join(root,'supabase/functions/halu-chat/index.ts'),'utf8');
assert(halu.includes('Deno.env.get("OPENAI_API_KEY")'),'La función de Halu debe leer la clave desde secretos.');
assert(/\bstore\s*:\s*false\b/.test(halu),'Las respuestas de Halu deben desactivar el almacenamiento recuperable.');
assert(halu.includes('allowedOrigins'),'La función de Halu debe restringir CORS.');
assert(halu.includes('requestBuckets'),'La función de Halu debe limitar la frecuencia por sesión.');
assert(/content-length[\s\S]{0,160}>\s*24_?000/.test(halu),'La función de Halu debe rechazar solicitudes excesivas.');
assert(html.includes('engineer-chatbot-v3.js?v=20260823-ai3'),'La versión publicada de Halu no coincide.');
assert(html.includes('programacion-control-v1.js?v=20260823-programacion2'),'Programación y Control debe estar activa.');
assert(html.includes('engineering-manual-reference-v1.js?v=20260823-manual1'),'La referencia técnica del manual debe estar activa.');

console.log(`structure-security: ${localRefs.length} referencias, ${scripts.length} scripts, ${staticIds.length} ID y ${sourceFiles.length} fuentes verificadas`);
