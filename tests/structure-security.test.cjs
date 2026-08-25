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

const zordon=fs.readFileSync(path.join(root,'supabase/functions/halu-chat/index.ts'),'utf8');
assert(zordon.includes('Deno.env.get("OPENAI_API_KEY")'),'La función de ZORDON debe leer la clave desde secretos.');
assert(/\bstore\s*:\s*false\b/.test(zordon),'Las respuestas de ZORDON deben desactivar el almacenamiento recuperable.');
assert(zordon.includes('allowedOrigins'),'La función de ZORDON debe restringir CORS.');
assert(zordon.includes('requestBuckets'),'La función de ZORDON debe limitar la frecuencia por sesión.');
assert(/content-length[\s\S]{0,160}>\s*24_?000/.test(zordon),'La función de ZORDON debe rechazar solicitudes excesivas.');
assert(/halu-page-controller-v1\.js\?v=/.test(html),'El control opcional de página de ZORDON debe estar activo.');
assert(/engineer-chatbot-v3\.js\?v=/.test(html),'El motor de chat de ZORDON debe estar publicado.');
assert(/programacion-control-v1\.js\?v=/.test(html),'Programación y Control debe estar activa.');
assert(/project-tabs-complete-v1\.js\?v=/.test(html),'La navegación publicada debe estar activa.');
assert(/zordon-continuous-runtime-v1\.js\?v=/.test(html),'El núcleo continuo de ZORDON debe estar publicado.');
const projectTabs=fs.readFileSync(path.join(root,'project-tabs-complete-v1.js'),'utf8');
assert(projectTabs.includes('immersive-engineering-experience-v1.js?v=20260824-immersive1'),'La experiencia 3D debe cargarse desde la navegación global.');
assert(projectTabs.includes('zordon-continuous-runtime-v1.js?v=20260824-zordonbrand3'),'La navegación debe cargar ZORDON V3 con versión renovada.');
const immersive=fs.readFileSync(path.join(root,'immersive-engineering-experience-v1.js'),'utf8');
assert(immersive.includes('EXPERIENCIA DE INGENIERIA 3D V1'),'El módulo inmersivo debe estar disponible.');
const lazyLoader=fs.readFileSync(path.join(root,'feature-lazy-loader-v1.js'),'utf8');
assert(/feature-lazy-loader-v1\.js\?v=/.test(html),'La carga progresiva debe estar activa.');
assert(lazyLoader.includes('assets/cost-knowledge/index.js?v=20260823-costsync2'),'El índice completo de fichas debe estar disponible bajo demanda.');
assert(lazyLoader.includes('fhis-cost-data-v1.js?v=20260824-fhis2'),'La tabla de precios FHIS debe estar disponible bajo demanda.');
assert(lazyLoader.includes('cost-program-v1.js?v=20260824-costs6'),'El Programa de costos debe estar disponible bajo demanda.');
assert(lazyLoader.includes('law-knowledge-v1.js?v=20260822-law1'),'La biblioteca legal debe estar disponible bajo demanda.');
assert(/engineering-manual-reference-v1\.js\?v=/.test(html),'La referencia técnica del manual debe estar activa.');

assert(/security-runtime-v1\.js\?v=/.test(html),'El control de sesiones debe estar activo.');
assert(/security-center-v1\.js\?v=/.test(html),'El Centro de Seguridad debe estar activo.');
assert(/mfa-security-v1\.js\?v=/.test(html),'La configuración 2FA debe estar activa.');

console.log(`structure-security: ${localRefs.length} referencias, ${scripts.length} scripts, ${staticIds.length} ID y ${sourceFiles.length} fuentes verificadas`);
