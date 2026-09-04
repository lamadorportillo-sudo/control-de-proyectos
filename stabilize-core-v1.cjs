const fs=require('fs');

const path='index.html';
if(!fs.existsSync(path))throw new Error('No se encontró index.html para estabilizar.');
let html=fs.readFileSync(path,'utf8');

function replaceRequired(label,oldText,newText){
  if(html.includes(newText))return;
  if(!html.includes(oldText))throw new Error(`No se encontró el patrón requerido: ${label}`);
  html=html.replace(oldText,newText);
  console.log(`Corregido: ${label}`);
}

function stripScript(moduleFile){
  const escaped=moduleFile.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  html=html.replace(new RegExp(`<script\\s+src=["']${escaped}(?:\\?[^"']*)?["']\\s*><\\/script>\\s*`,'gi'),'');
}

/* 1. CREAR PROYECTO: al guardar un proyecto nuevo se abre directamente su
      expediente. Se elimina el paso extra Inicio -> Proyectos -> buscar. */
const projectCreateOld="db.projects.push(np);audit('CREAR','Proyecto',np.id,data);rememberExecutionDuration(np.id,data.budget,data.type,data.executionDays,'proyecto')}saveDB();m.remove();renderApp();toast('Proyecto guardado y sincronizado.')";
const projectCreateNew="db.projects.push(np);audit('CREAR','Proyecto',np.id,data);rememberExecutionDuration(np.id,data.budget,data.type,data.executionDays,'proyecto');view.projectId=np.id;view.screen='project';view.tab='summary';view.trash=false;try{localStorage.setItem('cc_main_route_v2','proyectos')}catch{}}saveDB();m.remove();renderApp();toast('Proyecto guardado. Sincronización con Supabase en curso.')";
replaceRequired('abrir expediente después de crear proyecto',projectCreateOld,projectCreateNew);

/* 2. ANTICIPO: la recuperación al 80% deja de ser una regla universal.
      Si el contrato no define meta, el sistema NO inventa amortización. */
replaceRequired(
  'eliminar recuperación automática del anticipo al 80%',
  "const targetPct=Number(contract.recoveryTarget||80);",
  "const targetPct=Number(contract.recoveryTarget||0);"
);
replaceRequired(
  'nuevo contrato sin meta de recuperación inventada',
  "recoveryTarget:80,controls:contractControlDefaults(),notes:''",
  "recoveryTarget:null,controls:contractControlDefaults(),notes:''"
);
replaceRequired(
  'guardar meta contractual solo cuando existe',
  "recoveryTarget:advOn?round2($('#cRecovery')?.value||80):80,controls:",
  "recoveryTarget:advOn?($('#cRecovery')?.value===''?null:round2($('#cRecovery')?.value)):null,controls:"
);
html=html.replace(/value="\$\{x\.recoveryTarget\}"/g,'value="${x.recoveryTarget??\'\'}"');
html=html.replace(
  '<span>Recuperar totalmente al % del proyecto</span>',
  '<span>Meta de recuperación del anticipo % (según contrato)</span>'
);
html=html.replace(
  '<small>Meta recuperación</small><strong>${pct(c.recoveryTarget)}</strong>',
  '<small>Meta recuperación</small><strong>${c.recoveryTarget?pct(c.recoveryTarget):\'Definir según contrato\'}</strong>'
);

const advanceGuaranteeAlert="if(c.advanceStatus==='Pagado'&&!db.guarantees.some(g=>g.contractId===c.id&&g.type==='Anticipo'))out.push({level:'danger',text:'Existe anticipo pagado y no se ha registrado la Garantía de Anticipo.'});";
const recoveryAlert=advanceGuaranteeAlert+"if(c.advanceStatus==='Pagado'&&!Number(c.recoveryTarget||0))out.push({level:'danger',text:'Existe anticipo pagado, pero no se ha definido la meta contractual de amortización/recuperación del anticipo.'});";
if(!html.includes(recoveryAlert)){
  if(!html.includes(advanceGuaranteeAlert))throw new Error('No se encontró la alerta de garantía de anticipo para agregar control de amortización.');
  html=html.replace(advanceGuaranteeAlert,recoveryAlert);
}

/* 3. CAPAS RETIRADAS: defensa final aunque algún generador histórico vuelva a
      insertar un dashboard o portafolio obsoleto. */
const retired=[
  'dashboard-executive-v1.js',
  'home-executive-fix-v2.js',
  'portfolio-redesign-v1.js',
  'project-portfolio-detail-v1.js',
  'portfolio-screen-fix-v1.js',
];
for(const moduleFile of retired)stripScript(moduleFile);

/* 4. Verificaciones que deben fallar antes de publicar si la consolidación se
      revierte accidentalmente. */
if(!html.includes("view.screen='project';view.tab='summary'"))throw new Error('El alta de proyecto no abre su expediente.');
if(html.includes("const targetPct=Number(contract.recoveryTarget||80);"))throw new Error('Sigue activa la recuperación universal al 80%.');
for(const moduleFile of retired){
  if(new RegExp(moduleFile.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i').test(html))throw new Error(`Sigue cargada la capa retirada ${moduleFile}.`);
}
if(!html.toLowerCase().includes('</html>'))throw new Error('El HTML estabilizado quedó incompleto.');

fs.writeFileSync(path,html,'utf8');
console.log('Núcleo estabilizado: alta de proyecto directa, anticipo contractual y capas duplicadas retiradas.');
