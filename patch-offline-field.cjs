const fs=require('fs');
const vm=require('vm');

const htmlPath='index.html';
if(!fs.existsSync(htmlPath))throw new Error('No se encontró index.html para instalar el modo offline.');
for(const file of ['offline-core-v1.js','offline-field-v1.js','manifest.webmanifest']){
  if(!fs.existsSync(file))throw new Error(`Falta ${file}.`);
}
const offlineCore=fs.readFileSync('offline-core-v1.js','utf8');
const offlineUi=fs.readFileSync('offline-field-v1.js','utf8');
try{new vm.Script(offlineCore,{filename:'offline-core-v1.js'});new vm.Script(offlineUi,{filename:'offline-field-v1.js'})}
catch(error){throw new Error(`JavaScript offline inválido: ${error.message}`)}

let html=fs.readFileSync(htmlPath,'utf8');
const coreEnd='window.ccHydrateCanonicalState=hydrateCanonicalState;\n})();\nrender();';
if(!html.includes('window.__CC_OFFLINE_FIELD_CORE_V1__')){
  if(!html.includes(coreEnd))throw new Error('No se encontró el cierre del núcleo antes de render().');
  html=html.replace(coreEnd,`window.ccHydrateCanonicalState=hydrateCanonicalState;\n})();\n${offlineCore}\nrender();`);
}

if(!html.includes('rel="manifest" href="manifest.webmanifest"')){
  html=html.replace('</head>','<link rel="manifest" href="manifest.webmanifest">\n<meta name="application-name" content="Control Contractual">\n<meta name="apple-mobile-web-app-title" content="Control Proyectos">\n</head>');
}

html=html.replace(/<script\s+src=["']offline-field-v1\.js(?:\?[^"']*)?["']\s*><\/script>\s*/gi,'');
const bodyClose=html.toLowerCase().lastIndexOf('</body>');
if(bodyClose<0)throw new Error('No se encontró </body> para instalar la interfaz offline.');
html=html.slice(0,bodyClose)+'<script src="offline-field-v1.js?v=20260908-offline1"></script>\n'+html.slice(bodyClose);

if(!html.includes('window.__CC_OFFLINE_FIELD_CORE_V1__'))throw new Error('El núcleo offline no quedó antes del render inicial.');
if(!html.includes('offline-field-v1.js?v=20260908-offline1'))throw new Error('La interfaz offline no quedó publicada.');
if(!html.includes('manifest.webmanifest'))throw new Error('El manifiesto PWA no quedó enlazado.');
fs.writeFileSync(htmlPath,html,'utf8');
console.log('Modo campo offline instalado: IndexedDB, sincronización pendiente y PWA.');
