const assert=require('node:assert/strict');
const fs=require('node:fs');

const html=fs.readFileSync('index.html','utf8');
const refs=[...html.matchAll(/<script\s+[^>]*src=["']([^"']+)/g)].map(match=>match[1].split('?')[0]);
const directBytes=refs.reduce((sum,file)=>sum+(fs.existsSync(file)?fs.statSync(file).size:0),0);
const forbidden=['fhis-cost-data-v1.js','assets/cost-knowledge/index.js','cost-program-v1.js','law-knowledge-v1.js','legal-assistant-v2.js','system-ui-refinement-v2.js'];

for(const file of forbidden)assert(!refs.includes(file),`${file} no debe bloquear o duplicar la carga inicial`);
assert(refs.includes('feature-lazy-loader-v1.js'),'Debe existir el cargador progresivo');
assert(refs.includes('system-ui-refinement-v3.js'),'La interfaz debe usar una sola capa final de refinamiento visual');
assert(refs.includes('integrity-diagnostics-v1.js'),'Debe cargarse el diagnóstico contractual no destructivo');
assert(directBytes<1_000_000,`El JavaScript inicial debe pesar menos de 1 MB; actual: ${directBytes}`);
assert(fs.statSync('index.html').size<450_000,'La página principal no debe superar 450 KB sin compresión');
assert(fs.statSync('halu-engineer-cutout-v4.webp').size<100_000,'El avatar de pie debe estar optimizado');
assert(fs.statSync('halu-engineer-seated-v1.webp').size<100_000,'El avatar sentado debe estar optimizado');
assert(!fs.readFileSync('engineer-chatbot-v3.js','utf8').includes('halu-engineer-cutout-v4.png'),'El chatbot no debe descargar el avatar PNG pesado');
assert(html.includes('rel="preconnect" href="https://flethujkrharehjikwgj.supabase.co"'),'Debe anticipar la conexión de autenticación');
assert(html.includes('rel="preload" href="performance-runtime-v1.js?v=20260823-perf5"'),'Debe anticipar el coordinador de rendimiento');

console.log(`initial-payload: ${refs.length} scripts directos, ${directBytes} bytes de JavaScript inicial`);
