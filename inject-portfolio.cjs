const fs=require('fs');
const vm=require('vm');

const htmlFile='index.html';
const legacyVisualModules=[
  'system-ui-refinement-v2.js',
];
const modules=[
  ['portfolio-redesign-v1.js','20260821-portfolio3'],
  ['project-portfolio-detail-v1.js','20260821-projectdetail2'],
  ['portfolio-gallery-v1.js','20260828-gallery3'],
  ['portfolio-screen-fix-v1.js','20260821-screenfix1'],
  ['project-photo-story-v1.js','20260821-photostory1'],
  ['guest-mode-v1.js','20260825-guest4'],
  // Se conserva este módulo por su iconografía y comportamiento de controles.
  // La capa visual final queda gobernada por system-ui-refinement-v3.js.
  ['ui-compact-elegance-v1.js','20260825-elegance3'],
  ['functional-repair-v1.js','20260826-repair3'],
  ['system-ui-refinement-v3.js','20260826-system5'],
  ['integrity-diagnostics-v1.js','20260826-integrity1'],
];
if(!fs.existsSync(htmlFile)) throw new Error('No se encontró index.html.');
for(const [moduleFile] of modules){
  if(!fs.existsSync(moduleFile)) throw new Error(`No se encontró ${moduleFile}.`);
  new vm.Script(fs.readFileSync(moduleFile,'utf8'),{filename:moduleFile});
}

let html=fs.readFileSync(htmlFile,'utf8');
if(!html.toLowerCase().includes('</body>')) throw new Error('index.html no contiene </body>.');

// Elimina capas visuales antiguas para evitar reglas CSS duplicadas y cascadas
// de !important que hacían que una corrección visual rompiera otra sección.
for(const moduleFile of legacyVisualModules){
  const escaped=moduleFile.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  html=html.replace(new RegExp(`<script\\s+src=["']${escaped}(?:\\?[^"']*)?["']\\s*><\\/script>\\s*`,'gi'),'');
}

for(const [moduleFile,version] of modules){
  const escaped=moduleFile.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  html=html.replace(new RegExp(`<script\\s+src=["']${escaped}(?:\\?[^"']*)?["']\\s*><\\/script>\\s*`,'gi'),'');
  const pos=html.toLowerCase().lastIndexOf('</body>');
  html=html.slice(0,pos)+`<script src="${moduleFile}?v=${version}"></script>\n`+html.slice(pos);
}

if(/system-ui-refinement-v2\.js/i.test(html)) throw new Error('La capa visual V2 no debe permanecer cargada.');
fs.writeFileSync(htmlFile,html,'utf8');
console.log('Interfaz consolidada: iconografía compacta, refinamiento visual V3 e integridad contractual sin capa V2 redundante.');
