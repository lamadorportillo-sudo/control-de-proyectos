const fs=require('fs');
const vm=require('vm');

const htmlFile='index.html';

/* Capas retiradas de forma intencional: todas duplicaban navegación, Inicio,
   portafolio o detalle de proyecto que ya tienen una versión vigente. Git
   conserva su historial; no deben seguir ejecutándose en producción. */
const legacyVisualModules=[
  'system-ui-refinement-v2.js',
  'dashboard-executive-v1.js',
  'home-executive-fix-v2.js',
  'portfolio-redesign-v1.js',
  'project-portfolio-detail-v1.js',
  'portfolio-screen-fix-v1.js',
];

const modules=[
  ['portfolio-gallery-v1.js','20260828-gallery3'],
  ['project-photo-story-v1.js','20260821-photostory1'],
  ['guest-mode-v1.js','20260825-guest4'],
  ['ui-compact-elegance-v1.js','20260825-elegance3'],
  ['functional-repair-v1.js','20260826-repair3'],
  ['system-ui-refinement-v3.js','20260826-system5'],
  ['integrity-diagnostics-v1.js','20260826-integrity1'],
  ['hero-typography-v1.js','20260830-hero1'],
  /* Última capa: una sola navegación visible, sin accionar menús ocultos. */
  ['ui-navigation-single-source-v1.js','20260903-singlenav2'],
];

if(!fs.existsSync(htmlFile)) throw new Error('No se encontró index.html.');
for(const [moduleFile] of modules){
  if(!fs.existsSync(moduleFile)) throw new Error(`No se encontró ${moduleFile}.`);
  new vm.Script(fs.readFileSync(moduleFile,'utf8'),{filename:moduleFile});
}

let html=fs.readFileSync(htmlFile,'utf8');
if(!html.toLowerCase().includes('</body>')) throw new Error('index.html no contiene </body>.');

function strip(moduleFile){
  const escaped=moduleFile.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  html=html.replace(new RegExp(`<script\\s+src=["']${escaped}(?:\\?[^"']*)?["']\\s*><\\/script>\\s*`,'gi'),'');
}

for(const moduleFile of legacyVisualModules)strip(moduleFile);

for(const [moduleFile,version] of modules){
  strip(moduleFile);
  const pos=html.toLowerCase().lastIndexOf('</body>');
  html=html.slice(0,pos)+`<script src="${moduleFile}?v=${version}"></script>\n`+html.slice(pos);
}

for(const moduleFile of legacyVisualModules){
  if(new RegExp(moduleFile.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i').test(html)){
    throw new Error(`La capa heredada ${moduleFile} no debe permanecer cargada.`);
  }
}

fs.writeFileSync(htmlFile,html,'utf8');
console.log('Interfaz consolidada: un solo Inicio, un solo portafolio y navegación directa.');
