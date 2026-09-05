const assert=require('node:assert/strict');
const fs=require('node:fs');
const {supplementalModules}=require('../authenticated-module-manifest-v1.cjs');

const source=fs.readFileSync('visit-independent-reports-v1.js','utf8');
assert.match(source,/VISITAS INDEPENDIENTES E INFORMES INDIVIDUALES V2 · CONTRASTE AA/,'el módulo de informes de visita debe publicar la revisión de contraste AA');
assert.match(source,/\.cc-visit-report-picker \.field>span\{[^}]*background-color:#f8faf7!important;[^}]*color:#334e68!important;/s,'la etiqueta del selector debe declarar superficie clara y texto oscuro explícitos');
assert.match(source,/\.cc-visit-report-picker\{[^}]*background:#f8faf7;[^}]*color:#243b4a/s,'el contenedor del selector debe conservar contraste contextual');

const visit=supplementalModules.find(([name])=>name==='visit-independent-reports-v1.js');
assert.deepEqual(visit,['visit-independent-reports-v1.js','20260905-visitsind2'],'la caché autenticada debe invalidarse para cargar la corrección de contraste');

console.log('visit-report-contrast: selector de informes de visita con contraste AA y versión canónica');
