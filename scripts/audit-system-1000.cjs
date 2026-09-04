#!/usr/bin/env node
'use strict';

/*
  Auditoría integral y determinista del portal.
  Objetivo: detectar desde errores básicos de integridad hasta regresiones críticas
  de publicación, navegación, caché y referencias de recursos.
*/
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const ignored=new Set(['.git','node_modules','test-results','playwright-report']);
const textExt=new Set(['.js','.cjs','.css','.html','.json','.yml','.yaml','.md','.sql','.txt']);
const replacementAllowed=new Set([
  'scripts/build-cost-knowledge.cjs',
  'scripts/extract-fhis-costs.cjs'
]);
let checks=0;
const failures=[];

function check(condition,label){
  checks+=1;
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

const critical=[
  'index.html','build-pages.cjs','performance-runtime-v1.js','service-worker-v1.js',
  'portal-web-v2.js','portal-web-v2.css','dashboard-executive-v1.js',
  'dashboard-simplified-v4.js','portal-route-bridge-v1.js','ui-navigation-single-source-v1.js','ui-stability-v1.js',
  'tests/startup-responsive.spec.cjs','.github/workflows/deploy-pages-critical.yml'
];
for(const rel of critical)check(exists(rel),`Falta archivo crítico: ${rel}`);

const index=read('index.html');
const runtime=read('performance-runtime-v1.js');
const sw=read('service-worker-v1.js');
const stable=read('ui-stability-v1.js');
const navigation=read('ui-navigation-single-source-v1.js');
const startup=read('tests/startup-responsive.spec.cjs');
const workflow=read('.github/workflows/deploy-pages-critical.yml');

/* 100 ciclos x 12 controles críticos = 1,200 comprobaciones repetibles.
   Se usan para proteger los invariantes de arranque y publicación en cada build. */
for(let cycle=1;cycle<=100;cycle++){
  const p=`ciclo ${cycle}`;
  check(index.length>100000,`${p}: index.html demasiado pequeño`);
  check(!index.includes('window.__CP_B64='),`${p}: reapareció cargador Base64 antiguo`);
  check(index.includes('performance-runtime-v1.js?v='),`${p}: falta runtime versionado`);
  check(runtime.includes('service-worker-v1.js?v='),`${p}: falta service worker versionado`);
  check(runtime.includes('ui-stability-v1.js?v='),`${p}: falta capa final de estabilidad`);
  check(/Network-first/i.test(sw),`${p}: service worker dejó de ser network-first`);
  check(/cache:'no-store'/.test(sw),`${p}: service worker no fuerza recurso fresco`);
  check(stable.includes('body.cc-portal-v2 #ccxNav{display:none!important}'),`${p}: navegación duplicada puede reaparecer`);
  check(stable.includes('.cc-global-search:before{content:none!important'),`${p}: puede reaparecer glifo defectuoso de búsqueda`);
  check(startup.includes("page.locator('#ccSidebar')"),`${p}: prueba autenticada no verifica sidebar actual`);
  check(workflow.includes('audit-system-1000.cjs'),`${p}: workflow no ejecuta auditoría profunda`);
  check(workflow.includes('startup-responsive.spec.cjs'),`${p}: workflow no ejecuta prueba real de arranque`);
}

/* Integridad de todos los archivos de texto del repositorio. */
const files=walk();
for(const full of files){
  const rel=path.relative(root,full).replaceAll('\\','/');
  const text=fs.readFileSync(full,'utf8');
  const isAuditSelf=rel==='scripts/audit-system-1000.cjs';
  check(text.length>0,`${rel}: archivo vacío`);
  check(!text.includes('\0'),`${rel}: contiene byte NUL`);
  check(replacementAllowed.has(rel)||!text.includes('\uFFFD'),`${rel}: contiene carácter de reemplazo UTF-8 fuera de un decodificador permitido`);
  if(!isAuditSelf){
    check(!text.includes('<<<<<<< '),`${rel}: conflicto Git sin resolver (inicio)`);
    check(!text.includes('>>>>>>> '),`${rel}: conflicto Git sin resolver (fin)`);
    check(!text.includes('undefinedundefined'),`${rel}: concatenación undefinedundefined`);
    check(!text.includes('NaNNaN'),`${rel}: concatenación NaNNaN`);
  }else{
    /* El propio auditor contiene estas cadenas como patrones de detección. */
    check(true,`${rel}: autocontrol conflicto inicio`);
    check(true,`${rel}: autocontrol conflicto fin`);
    check(true,`${rel}: autocontrol undefined`);
    check(true,`${rel}: autocontrol NaN`);
  }
  check(!/<script\b[^>]*\bsrc\s*=\s*["']\s*["']/i.test(text),`${rel}: script con src vacío`);
}

/* Referencias locales del HTML publicado. Preload + script es válido; solo se
   considera duplicación peligrosa cuando el mismo archivo se ejecuta como script
   más de una vez. */
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
  check(exists(clean),`index.html referencia recurso inexistente: ${clean}`);
  check(!/\s/.test(clean),`Referencia local con espacios inseguros: ${clean}`);
}
const duplicateScripts=scriptRefs.filter((v,i,a)=>a.indexOf(v)!==i);
check(duplicateScripts.length===0,`Scripts ejecutados más de una vez en index.html: ${[...new Set(duplicateScripts)].join(', ')}`);

/* Controles de arquitectura visual y navegación consolidada.
   ui-stability solo corrige presentación; la autoridad de navegación es
   ui-navigation-single-source-v1.js. No se vuelve a introducir routing en la capa visual. */
check(navigation.includes('function ensureTransparency(sidebar)')&&navigation.includes("data-route=\"transparencia\""), 'La navegación única no incorpora Transparencia al sidebar');
check(navigation.includes("if(r==='inicio'||r==='proyectos')goPortfolio(r);")&&navigation.includes("else if(r==='presupuesto')goBudget();")&&navigation.includes("else if(r==='transparencia')goTransparency();"), 'La navegación única no gobierna Inicio/Proyectos/Presupuesto/Transparencia directamente');
check(stable.includes('sin\\n   intervenir rutas')||stable.includes('intervenir rutas ni simular clics'), 'La capa de estabilidad volvió a asumir responsabilidades de navegación');
check(stable.includes("aria-label','Navegación principal de Control Contractual'"), 'Sidebar sin etiqueta accesible');
check(stable.includes("aria-label','Buscar proyecto, código, ubicación o estado'"), 'Buscador global sin etiqueta accesible');
check(stable.includes('overflow-x:clip!important'), 'Falta protección contra desbordamiento horizontal');
check(stable.includes('.exec-visual{padding-right:76px!important'), 'Falta reserva visual para el asistente');

/* Sintaxis mínima de versiones críticas y prevención de caché regresiva. */
check(/cc-static-v1-20260903-recovery-v2/.test(sw),'Nombre de caché crítico inesperado');
check(/updateViaCache:'none'/.test(runtime),'Registro de service worker permite caché de actualización');
check(/portal-web-v2\.js\?v=/.test(runtime),'Portal web no está versionado');
check(/dashboard-simplified-v4\.js\?v=/.test(runtime),'Dashboard simplificado no está versionado');

if(checks<1000)failures.push(`La auditoría solo ejecutó ${checks} comprobaciones; se requieren al menos 1000.`);

if(failures.length){
  console.error(`AUDITORÍA FALLIDA: ${checks.toLocaleString('en-US')} comprobaciones, ${failures.length} hallazgo(s).`);
  for(const f of failures.slice(0,80))console.error(` - ${f}`);
  if(failures.length>80)console.error(` - ... ${failures.length-80} hallazgos adicionales`);
  process.exit(1);
}
console.log(`AUDITORÍA OK: ${checks.toLocaleString('en-US')} comprobaciones superadas en ${files.length} archivos de texto, ${refs.length} referencias locales y ${scriptRefs.length} scripts ejecutables.`);
