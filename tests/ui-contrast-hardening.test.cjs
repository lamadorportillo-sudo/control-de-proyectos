const assert=require('node:assert/strict');
const fs=require('node:fs');

const hard=fs.readFileSync('ui-contrast-hardening-v1.js','utf8');
const loader=fs.readFileSync('project-tabs-complete-v1.js','utf8');

assert.match(hard,/ENDURECIMIENTO DE CONTRASTE V3/,'debe existir la guardia final de contraste V3');
assert.match(hard,/#ccxNav button\[data-ccx\]/,'la navegación principal debe quedar cubierta');
assert.match(hard,/#ccgNavBtn/,'el botón de navegación invitado debe quedar cubierto');
assert.match(hard,/#ccxNav button\[data-ccx\][\s\S]*background:#0d1520!important[\s\S]*color:#f8fbff!important/,'la navegación debe tener fondo y texto deterministas');
assert.match(hard,/#content \.ccx-kpi[\s\S]*background:#0d1520!important[\s\S]*background-image:none!important/,'las tarjetas KPI deben tener fondo sólido oscuro verificable');
assert.match(hard,/#content \.ccx-access button[\s\S]*background:#0d1520!important/,'los accesos ejecutivos deben tener fondo sólido oscuro verificable');
assert.match(hard,/#content \.ccx-kpi small/,'debe reforzar etiquetas KPI del centro ejecutivo');
assert.match(hard,/#content \.ccx-access small/,'debe reforzar textos secundarios de accesos');
assert.match(hard,/#content \.ccx-page \.status\.good/,'el estado de integridad de auditoría debe tener contraste determinista');
assert.match(hard,/#content \.ccx-page \.status\.danger/,'el estado crítico de auditoría debe tener contraste determinista');
assert.match(hard,/#174a9c/,'las acciones primarias deben usar un azul oscuro con contraste suficiente');
assert.match(hard,/#content \.cp-budget-kpi/,'las tarjetas presupuestarias deben tener fondo sólido');
assert.match(hard,/#content \.cp-exec-metric/,'las métricas de ejecución deben tener fondo sólido');
assert.match(hard,/#content \.cp-budget-page small/,'todo texto pequeño de presupuesto debe tener color reforzado');
assert.match(hard,/\.cp-budget-page \.good > strong/,'los valores positivos de presupuesto deben conservar texto legible');
assert.match(hard,/\.cp-budget-page \[data-cc-readable\]/,'presupuesto debe neutralizar una inversión errónea del reparador automático');
assert.match(hard,/#content \.followup-panel/,'el centro de seguimiento del Inicio debe tener una superficie de contraste determinista');
assert.match(hard,/#content \.followup-count/,'el contador del centro de seguimiento debe tener fondo y texto de alto contraste');
assert.match(hard,/#content \.cp-alerts-compact/,'las alertas compactas del Inicio deben conservar el tema oscuro');
assert.match(hard,/#content \.cp-alert-chip strong/,'los valores dentro de chips de alertas deben ser legibles');
assert.match(hard,/#content \.cp-project-search-note b/,'la nota de proyectos no debe conservar texto oscuro sobre fondo oscuro');
assert.match(hard,/#content \.ped-shell \.ped-kpi span/,'los textos secundarios KPI del expediente deben reforzarse');
assert.match(hard,/#content \.ped-shell \.ped-panel-head p/,'la descripción del panel evaluativo debe reforzarse');
assert.match(hard,/#content \.ped-shell \.ped-process p/,'los detalles de procesos del expediente deben reforzarse');
assert.match(hard,/#536476!important/,'el dashboard evaluativo debe usar un gris oscuro con margen WCAG suficiente');
assert.doesNotMatch(hard,/attributeFilter:\['class','style','data-cc-readable'\]/,'la guardia no debe crear una oscilación de atributos con el auditor global');

const modules=loader.match(/const modules=\[(.*?)\];const current/s)?.[1]||'';
const auditAt=modules.lastIndexOf('ui-visibility-audit-v1.js');
const hardAt=modules.lastIndexOf('ui-contrast-hardening-v1.js');
assert.ok(auditAt>=0&&hardAt>auditAt,'la guardia final debe cargarse después del auditor global');
assert.match(modules,/ui-contrast-hardening-v1\.js\?v=20260831-contrast5/,'debe forzarse la versión publicada del endurecimiento de contraste corregido');

console.log('ui-contrast-hardening: navegación, auditoría, Inicio, fondos sólidos, KPI, acciones, presupuesto y expediente verificados');