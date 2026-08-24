const assert=require('node:assert/strict');
const fs=require('node:fs');

const html=fs.readFileSync('index.html','utf8');
const refs=[...html.matchAll(/<script\s+[^>]*src=["']([^"']+)/g)].map(match=>match[1].split('?')[0]);
const directBytes=refs.reduce((sum,file)=>sum+(fs.existsSync(file)?fs.statSync(file).size:0),0);
const forbidden=['fhis-cost-data-v1.js','assets/cost-knowledge/index.js','cost-program-v1.js','law-knowledge-v1.js','legal-assistant-v2.js'];

for(const file of forbidden)assert(!refs.includes(file),`${file} no debe bloquear la carga inicial`);
assert(refs.includes('feature-lazy-loader-v1.js'),'Debe existir el cargador progresivo');
assert(directBytes<1_000_000,`El JavaScript inicial debe pesar menos de 1 MB; actual: ${directBytes}`);
assert(fs.statSync('index.html').size<450_000,'La página principal no debe superar 450 KB sin compresión');

console.log(`initial-payload: ${refs.length} scripts directos, ${directBytes} bytes de JavaScript inicial`);
