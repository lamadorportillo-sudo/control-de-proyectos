const fs=require('fs');
const vm=require('vm');

const htmlFile='index.html';
const modules=[
  ['portfolio-redesign-v1.js','20260821-portfolio2'],
  ['project-portfolio-detail-v1.js','20260821-projectdetail1'],
  ['portfolio-gallery-v1.js','20260821-gallery1'],
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
console.log('Rediseño portafolio, ficha profesional y galería visual integrados en index.html.');