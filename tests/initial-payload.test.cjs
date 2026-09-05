const assert=require('node:assert/strict');
const fs=require('node:fs');
const {retiredModules}=require('../authenticated-module-manifest-v1.cjs');

const html=fs.readFileSync('index.html','utf8');
// Solo cuenta scripts ejecutables en la carga inicial. Los módulos autenticados se
// publican como <script type="application/x-cc-auth" data-src="…"> y son inertes
// hasta que el cargador autenticado los activa; data-src no debe confundirse con src.
const refs=[...html.matchAll(/<script\s+src=["']([^"']+)/g)].map(match=>match[1].split('?')[0]);
const directBytes=refs.reduce((sum,file)=>sum+(fs.existsSync(file)?fs.statSync(file).size:0),0);
const forbidden=['fhis-cost-data-v1.js','assets/cost-knowledge/index.js','cost-program-v1.js','law-knowledge-v1.js','legal-assistant-v2.js'];

for(const file of forbidden)assert(!refs.includes(file),`${file} no debe bloquear la carga inicial`);
assert(/(?:src|data-src)=["']feature-lazy-loader-v1\.js\?v=/.test(html),'Debe existir el cargador progresivo en el plan publicado');
assert(directBytes<1_000_000,`El JavaScript inicial debe pesar menos de 1 MB; actual: ${directBytes}`);
assert(fs.statSync('index.html').size<450_000,'La página principal no debe superar 450 KB sin compresión');
assert(fs.statSync('halu-engineer-cutout-v4.webp').size<100_000,'El avatar de pie debe estar optimizado');
assert(fs.statSync('halu-engineer-seated-v1.webp').size<100_000,'El avatar sentado debe estar optimizado');
assert(!fs.readFileSync('engineer-chatbot-v3.js','utf8').includes('halu-engineer-cutout-v4.png'),'El chatbot no debe descargar el avatar PNG pesado');
assert(html.includes('rel="preconnect" href="https://flethujkrharehjikwgj.supabase.co"'),'Debe anticipar la conexión de autenticación');
assert(/rel="preload" href="performance-runtime-v1\.js\?v=[^"]+"/.test(html),'Debe anticipar el coordinador de rendimiento con una versión vigente');

const injector=fs.readFileSync('inject-portfolio.cjs','utf8');
assert(retiredModules.includes('system-ui-refinement-v2.js'),'El manifiesto debe declarar la capa visual V2 como retirada');
assert(injector.includes("require('./authenticated-module-manifest-v1.cjs')"),'El inyector debe consumir el manifiesto canónico de módulos retirados');
assert(injector.includes('retiredModules'),'El inyector debe retirar las capas heredadas desde una sola fuente');
assert(injector.includes("'system-ui-refinement-v3.js'"),'El inyector debe cargar la capa visual final V3');
assert(injector.includes("'integrity-diagnostics-v1.js'"),'El inyector debe cargar el diagnóstico contractual no destructivo');

console.log(`initial-payload: ${refs.length} scripts ejecutables directos, ${directBytes} bytes de JavaScript inicial`);
