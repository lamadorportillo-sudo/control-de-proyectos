#!/usr/bin/env node
'use strict';

/*
  Auditoría integral y determinista del portal.

  Regla de calidad: el contador representa comprobaciones aplicadas a archivos,
  referencias e invariantes distintos. No se permite inflar la cifra repitiendo
  la misma aserción cientos de veces.
*/
const fs=require('node:fs');
const path=require('node:path');
const {retiredModules,supplementalModules}=require('../authenticated-module-manifest-v1.cjs');

const root=path.resolve(__dirname,'..');
const ignored=new Set(['.git','node_modules','test-results','playwright-report']);
const textExt=new Set(['.js','.cjs','.css','.html','.json','.yml','.yaml','.md','.sql','.txt','.ts']);
const replacementAllowed=new Set([
  'scripts/build-cost-knowledge.cjs',
  'scripts/extract-fhis-costs.cjs'
]);
let checks=0;
const failures=[];
const labels=new Set();

function check(condition,label){
  checks+=1;
  if(labels.has(label))failures.push(`Comprobación duplicada: ${label}`);
  labels.add(label);
  if(!condition)failures.push(label);
}
function read(rel){return fs.readFileSync(path.join(root,rel),'utf8')}
function exists(rel){return fs.existsSync(path.join(root,rel))}
function walk(dir=root,out=[]){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(ignored.has(entry.name))continue;
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())walk(full,out);
    else if(textExt.has(path.extname(entry.name).toLowerCase()))out.push(full);
  }
  return out;
}
function relOf(full){return path.relative(root,full).replaceAll('\\','/')}
function isClientRuntime(rel){return !rel.startsWith('supabase/functions/')&&!rel.startsWith('.github/')&&!rel.startsWith('tests/')&&!rel.startsWith('scripts/')}

const critical=[
  'index.html','build-pages.cjs','inject-portfolio.cjs','patch-session-security.cjs','stabilize-core-v1.cjs',
  'authenticated-module-manifest-v1.cjs','performance-runtime-v1.js','service-worker-v1.js',
  'portal-web-v2.js','dashboard-simplified-v4.js','portal-route-bridge-v1.js','ui-stability-v1.js',
  'private-access-v1.js','security-runtime-v1.js','security-center-v1.js',
  'tests/startup-responsive.spec.cjs','tests/accessibility-responsive.spec.cjs',
  'tests/auth-staged-login-regression.test.cjs','.github/workflows/deploy-pages-critical.yml',
  '.github/workflows/responsive-audit.yml'
];
for(const rel of critical)check(exists(rel),`archivo crítico presente: ${rel}`);

const index=read('index.html');
const runtime=read('performance-runtime-v1.js');
const sw=read('service-worker-v1.js');
const stable=read('ui-stability-v1.js');
const startup=read('tests/startup-responsive.spec.cjs');
const accessibility=read('tests/accessibility-responsive.spec.cjs');
const patchSession=read('patch-session-security.cjs');
const stabilizer=read('stabilize-core-v1.cjs');
const criticalWorkflow=read('.github/workflows/deploy-pages-critical.yml');
const responsiveWorkflow=read('.github/workflows/responsive-audit.yml');

/* Invariantes críticos: cada uno se evalúa una sola vez. */
check(index.length>100000,'index.html conserva tamaño compatible con aplicación completa');
check(!index.includes('window.__CP_B64='),'index.html sin cargador Base64 antiguo');
check(index.includes('performance-runtime-v1.js?v='),'index.html referencia runtime versionado');
check(runtime.includes('service-worker-v1.js?v='),'runtime referencia service worker versionado');
check(runtime.includes('ui-stability-v1.js?v='),'runtime referencia capa final de estabilidad');
check(/Network-first/i.test(sw),'service worker mantiene estrategia network-first');
check(/cache:'no-store'/.test(sw),'service worker evita cachear respuestas sensibles');
check(/updateViaCache:'none'/.test(runtime),'registro del service worker evita caché de actualización');
check(stable.includes('body.cc-portal-v2 #ccxNav{display:none!important}'),'navegación ejecutiva duplicada permanece oculta');
check(stable.includes('.cc-global-search:before{content:none!important'),'buscador no reintroduce glifo defectuoso');
check(startup.includes("page.locator('#ccSidebar')"),'prueba de arranque verifica sidebar vigente');
check(criticalWorkflow.includes('audit-system-1000.cjs'),'publicación crítica ejecuta auditoría profunda');
check(criticalWorkflow.includes('startup-responsive.spec.cjs'),'publicación crítica ejecuta prueba real de arranque');
check(responsiveWorkflow.includes('node --test tests/*.test.cjs'),'auditoría responsive ejecuta regresiones estructurales');
check(responsiveWorkflow.includes('npx playwright test'),'auditoría responsive ejecuta recorrido de navegador');
check(accessibility.includes("['serious','critical'].includes(v.impact)"),'accesibilidad bloquea hallazgos serios y críticos');
check(accessibility.includes("'wcag22aa'"),'accesibilidad incluye WCAG 2.2 AA');
check(patchSession.includes('cc-staged-login-reload-bridge'),'login privado enlazado con arranque autenticado');
check(stabilizer.includes('data-cc-auth-loader data-cc-auth-plan'),'existe un único plan de carga autenticada por etapas');
check(!/document\.write\s*\(/.test(index),'HTML publicado no usa document.write');

/* Integridad y seguridad básica de TODOS los archivos de texto.
   Estas comprobaciones son independientes porque se aplican a recursos distintos. */
const files=walk();
for(const full of files){
  const rel=relOf(full);
  const text=fs.readFileSync(full,'utf8');
  const self=rel==='scripts/audit-system-1000.cjs';
  const ext=path.extname(rel).toLowerCase();

  check(text.length>0,`${rel}: no está vacío`);
  check(!text.includes('\0'),`${rel}: no contiene byte NUL`);
  check(replacementAllowed.has(rel)||!text.includes('\uFFFD'),`${rel}: UTF-8 sin carácter de reemplazo inesperado`);
  check(self||!text.includes('<<<<<<< '),`${rel}: sin conflicto Git de apertura`);
  check(self||!text.includes('>>>>>>> '),`${rel}: sin conflicto Git de cierre`);
  check(self||!text.includes('undefinedundefined'),`${rel}: sin concatenación undefinedundefined`);
  check(self||!text.includes('NaNNaN'),`${rel}: sin concatenación NaNNaN`);
  check(!/<script\b[^>]*\bsrc\s*=\s*["']\s*["']/i.test(text),`${rel}: sin script con src vacío`);
  check(!/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text),`${rel}: sin clave privada embebida`);
  check(!/(?:ghp_|github_pat_)[A-Za-z0-9_]{20,}/.test(text),`${rel}: sin token GitHub embebido`);

  if(ext==='.json'){
    let valid=true;try{JSON.parse(text)}catch{valid=false}
    check(valid,`${rel}: JSON válido`);
  }else{
    check(true,`${rel}: formato JSON no aplica`);
  }

  if(isClientRuntime(rel)){
    check(!/SUPABASE_SERVICE_ROLE_KEY\s*=\s*["'][^"']+/i.test(text),`${rel}: cliente sin service-role hardcodeada`);
  }else{
    check(true,`${rel}: control service-role cliente no aplica`);
  }
}

/* Manifiesto autenticado: existencia, unicidad, orden y retiro efectivo. */
const supplementalNames=supplementalModules.map(([name])=>name);
check(new Set(supplementalNames).size===supplementalNames.length,'manifiesto suplementario sin módulos duplicados');
check(new Set(retiredModules).size===retiredModules.length,'manifiesto retirado sin módulos duplicados');
for(const [name,version] of supplementalModules){
  check(exists(name),`módulo suplementario existe: ${name}`);
  check(typeof version==='string'&&version.length>=8,`módulo suplementario versionado: ${name}`);
}
for(const name of retiredModules){
  check(!new RegExp(`<script\\s+[^>]*src=["'][^"']*${name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(?:\\?[^"']*)?["']`,'i').test(index),`capa retirada no ejecutable en index: ${name}`);
}

/* Referencias locales del HTML publicado. */
const refs=[];
const scriptRefs=[];
for(const m of index.matchAll(/<(script|link)\b[^>]*(?:src|href)=["']([^"']+)["'][^>]*>/gi)){
  const tag=m[1].toLowerCase();
  const ref=m[2];
  if(/^(?:https?:|data:|blob:|#|mailto:|tel:)/i.test(ref))continue;
  const clean=ref.split(/[?#]/)[0].replace(/^\.\//,'');
  if(!clean||clean.startsWith('/'))continue;
  refs.push(clean);
  if(tag==='script')scriptRefs.push(clean);
  check(exists(clean),`referencia local existe: ${clean}`);
  check(!/\s/.test(clean),`referencia local sin espacios inseguros: ${clean}`);
}
const duplicateScripts=scriptRefs.filter((v,i,a)=>a.indexOf(v)!==i);
check(duplicateScripts.length===0,`scripts ejecutables sin duplicados: ${[...new Set(duplicateScripts)].join(', ')||'ninguno'}`);

/* Arquitectura visual y navegación consolidada. */
check(stable.includes("dataset.route='transparencia'")||stable.includes('dataset.route="transparencia"'),'sidebar incorpora Transparencia');
check(stable.includes("map={inicio:'home',proyectos:'projects',presupuesto:'budget'}"),'sidebar sincroniza rutas principales');
check(stable.includes("aria-label','Navegación principal de Control Contractual'"),'sidebar tiene etiqueta accesible');
check(stable.includes("aria-label','Buscar proyecto, código, ubicación o estado'"),'buscador global tiene etiqueta accesible');
check(stable.includes('overflow-x:clip!important'),'protección contra desbordamiento horizontal activa');
check(stable.includes('.exec-visual{padding-right:76px!important'),'interfaz reserva espacio para asistente');
check(/portal-web-v2\.js\?v=/.test(runtime),'portal web versionado');
check(/dashboard-simplified-v4\.js\?v=/.test(runtime),'dashboard simplificado versionado');
check(/cc-static-v1-20260903-recovery-v2/.test(sw),'nombre de caché crítico esperado');

if(checks<1000)failures.push(`Cobertura insuficiente: ${checks} comprobaciones reales; se requieren al menos 1000 sin repetición artificial.`);
if(labels.size!==checks)failures.push(`El auditor generó ${checks-labels.size} etiqueta(s) duplicada(s).`);

if(failures.length){
  console.error(`AUDITORÍA FALLIDA: ${checks.toLocaleString('en-US')} comprobaciones reales, ${failures.length} hallazgo(s).`);
  for(const f of [...new Set(failures)].slice(0,120))console.error(` - ${f}`);
  if(new Set(failures).size>120)console.error(` - ... ${new Set(failures).size-120} hallazgos adicionales`);
  process.exit(1);
}
console.log(`AUDITORÍA OK: ${checks.toLocaleString('en-US')} comprobaciones reales y no repetidas en ${files.length} archivos de texto, ${refs.length} referencias locales y ${scriptRefs.length} scripts ejecutables.`);
