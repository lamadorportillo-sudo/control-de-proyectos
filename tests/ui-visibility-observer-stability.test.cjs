const assert=require('node:assert/strict');
const fs=require('node:fs');
const {supplementalModules}=require('../authenticated-module-manifest-v1.cjs');

const source=fs.readFileSync('ui-visibility-audit-v1.js','utf8');
const tabs=fs.readFileSync('project-tabs-complete-v1.js','utf8');

assert.match(source,/VISIBILIDAD GLOBAL Y CONTRASTE V5 · OBSERVADOR IDÉMPOTENTE/,'debe estar activa la versión V5 estable');
assert.match(source,/window\.__CC_VISIBILITY_AUDIT_V5__=true/,'la V5 debe tener guardia propia de carga única');
assert.match(source,/const CSS=`[\s\S]*?`;/,'el CSS de contraste debe existir como valor estable reutilizable');
assert.match(source,/if\(s\.textContent!==CSS\)s\.textContent=CSS/,'la hoja de estilos solo debe escribirse cuando realmente cambia');
assert.doesNotMatch(source,/if\(!s\)\{[^}]+\}\s*s\.textContent=`/,'injectCss no debe reescribir incondicionalmente el style en cada auditoría');
assert.match(source,/const label='🧠 IA \/ Aprendizaje';if\(learn\.textContent!==label\)learn\.textContent=label/,'el botón de IA no debe provocar mutaciones de texto repetidas');
assert.match(source,/function queue\(\)\{if\(queued\)return;queued=true;requestAnimationFrame/,'las mutaciones reales deben seguir agrupándose por frame');
assert.match(source,/attributeFilter:\['class','style','disabled'\]/,'el observador no debe reaccionar a data-cc-readable que él mismo modifica');

const entry=supplementalModules.find(([name])=>name==='ui-visibility-audit-v1.js');
assert.deepEqual(entry,['ui-visibility-audit-v1.js','20260904-visibility5'],'el manifiesto autenticado debe invalidar la caché de la V5');
assert.match(tabs,/ui-visibility-audit-v1\.js\?v=20260904-visibility5/,'los metadatos de pestañas deben reflejar la misma versión canónica');

console.log('ui-visibility-observer-stability: auditoría visual idempotente y sin bucle de MutationObserver');
