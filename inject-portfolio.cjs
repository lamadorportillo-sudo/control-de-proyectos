const fs=require('fs');
const vm=require('vm');

const htmlFile='index.html';
const modules=[
  ['portfolio-redesign-v1.js','20260821-portfolio3'],
  ['project-portfolio-detail-v1.js','20260821-projectdetail2'],
  ['portfolio-gallery-v1.js','20260821-gallery2'],
  ['portfolio-screen-fix-v1.js','20260821-screenfix1'],
  ['project-photo-story-v1.js','20260821-photostory1'],
  ['guest-mode-v1.js','20260825-guest4'],
  ['ui-compact-elegance-v1.js','20260825-elegance3'],
  ['system-ui-refinement-v2.js','20260825-system3'],
  ['functional-repair-v1.js','20260825-repair1'],
  ['system-ui-refinement-v3.js','20260825-system4'],
];
if(!fs.existsSync(htmlFile)) throw new Error('No se encontró index.html.');
for(const [moduleFile] of modules){
  if(!fs.existsSync(moduleFile)) throw new Error(`No se encontró ${moduleFile}.`);
  new vm.Script(fs.readFileSync(moduleFile,'utf8'),{filename:moduleFile});
}

let html=fs.readFileSync(htmlFile,'utf8');
if(!html.toLowerCase().includes('</body>')) throw new Error('index.html no contiene </body>.');
for(const [moduleFile,version] of modules){
  const escaped=moduleFile.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  html=html.replace(new RegExp(`<script\\s+src=["']${escaped}(?:\\?[^"']*)?["']\\s*><\\/script>\\s*`,'gi'),'');
  const pos=html.toLowerCase().lastIndexOf('</body>');
  html=html.slice(0,pos)+`<script src="${moduleFile}?v=${version}"></script>\n`+html.slice(pos);
}

fs.writeFileSync(htmlFile,html,'utf8');
console.log('Interfaz profesional, modo invitado, iconografía elegante, portafolio, reparaciones funcionales y refinamiento visual V3 integrados permanentemente en index.html.');