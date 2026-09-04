const fs=require('fs');
const {retiredModules,supplementalModules}=require('./authenticated-module-manifest-v1.cjs');

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

function stripScriptFrom(source,moduleFile){
  const escaped=moduleFile.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  return source.replace(new RegExp(`<script\\s+src=["']${escaped}(?:\\?[^"']*)?["']\\s*><\\/script>\\s*`,'gi'),'');
}

function escapeAttr(v){return String(v||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')}

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
      insertar un dashboard o portafolio obsoleto. La lista vive en el mismo
      manifiesto que define los módulos suplementarios autorizados. */
const retired=[...retiredModules];
for(const moduleFile of retired)stripScript(moduleFile);

/* 4. ARRANQUE SIN BLOQUEOS EXTERNOS: JSZip es una dependencia del generador
      Word y nunca debe convertirse en un script de arranque del portal. */
html=html.replace(/<script\s+[^>]*src=["']https:\/\/cdn\.jsdelivr\.net\/npm\/jszip[^"']*["'][^>]*><\/script>\s*/gi,'');

/* 5. MODO DE ACCESO LIGERO Y CARGA AUTENTICADA ESCALONADA.
      Sin sesión se conserva únicamente el núcleo y los módulos estrictamente
      necesarios para login seguro/recuperación. El resto se convierte en un
      plan inerte. Con sesión primero se dibuja la interfaz crítica (portal,
      navegación y pestañas); después se cargan, en serie y cediendo tiempo al
      navegador, el resto de módulos. Así ningún lote grande de observadores
      puede bloquear el primer render autenticado. */
const SESSION_KEY='control_contractual_session_v3';
const PRE_AUTH_MODULES=new Set(['private-access-v1.js','password-recovery-v1.js']);
const loginSuccess="localStorage.setItem(SESSION,JSON.stringify(session));cloudLoaded=false;await render()";
if(html.includes(loginSuccess)){
  html=html.split(loginSuccess).join("localStorage.setItem(SESSION,JSON.stringify(session));cloudLoaded=false;location.reload();return");
}
const bootEnd='render();\n</script>';
const bootPos=html.indexOf(bootEnd);
if(bootPos<0)throw new Error('No se encontró el cierre del núcleo para aislar módulos autenticados.');
const cut=bootPos+bootEnd.length;
let head=html.slice(0,cut),tail=html.slice(cut);
if(!tail.includes('data-cc-auth-plan')){
  /* El antiguo project-tabs-complete cargaba estas dependencias de forma
     dinámica. Ahora se garantiza una sola copia aquí, con versiones y orden
     auditables. Los scripts quedan inmediatamente convertidos en plan inerte. */
  for(const [moduleFile,version] of supplementalModules){
    if(!fs.existsSync(moduleFile))throw new Error(`Falta módulo autenticado requerido: ${moduleFile}`);
    tail=stripScriptFrom(tail,moduleFile);
    const bodyClose=tail.toLowerCase().lastIndexOf('</body>');
    if(bodyClose<0)throw new Error('No se encontró </body> al consolidar módulos autenticados.');
    tail=tail.slice(0,bodyClose)+`<script src="${moduleFile}?v=${version}"></script>\n`+tail.slice(bodyClose);
  }

  tail=tail.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi,(full,attrs,body)=>{
    const src=String(attrs||'').match(/\bsrc\s*=\s*(["'])(.*?)\1/i)?.[2]||'';
    if(src){
      const bare=src.split('?')[0].split('/').pop();
      if(PRE_AUTH_MODULES.has(bare))return full;
      return `<script type="application/x-cc-auth" data-cc-auth-script data-src="${escapeAttr(src)}"></script>`;
    }
    return `<script type="application/x-cc-auth" data-cc-auth-script>${body}</script>`;
  });

  const loader=`<script data-cc-auth-loader data-cc-auth-plan>
(()=>{
  'use strict';
  const SESSION_KEY='${SESSION_KEY}';
  if(!localStorage.getItem(SESSION_KEY))return;
  if(window.__CC_AUTH_MODULE_LOADER__)return;
  window.__CC_AUTH_MODULE_LOADER__=true;
  window.__CC_STAGED_AUTH_BOOT__=true;

  const nodes=[...document.querySelectorAll('script[data-cc-auth-script]')];
  const bare=src=>String(src||'').split('?')[0].split('/').pop();
  const loaded=new Set();
  const nodeByBare=name=>nodes.find(node=>bare(node.dataset.src)===name)||null;
  const nextTurn=()=>new Promise(resolve=>setTimeout(resolve,0));
  const shortPause=()=>new Promise(resolve=>setTimeout(resolve,40));

  const styleOnce=(href,id)=>{
    if(document.getElementById(id))return;
    const link=document.createElement('link');link.id=id;link.rel='stylesheet';link.href=href;document.head.appendChild(link);
  };

  const runSrc=src=>new Promise((resolve,reject)=>{
    const name=bare(src);
    if(name&&loaded.has(name))return resolve();
    const existing=[...document.scripts].find(s=>{
      const x=s.getAttribute('src')||'';return x&&bare(x)===name&&s.type!=='application/x-cc-auth';
    });
    if(existing){if(name)loaded.add(name);return resolve()}
    const script=document.createElement('script');script.async=false;script.src=src;
    script.onload=()=>{if(name)loaded.add(name);resolve()};
    script.onerror=()=>reject(new Error('No se pudo cargar '+src));
    document.body.appendChild(script);
  });

  const runNode=async node=>{
    const src=node?.dataset?.src||'';
    if(src)return runSrc(src);
    if(!node)return;
    const script=document.createElement('script');script.textContent=node.textContent||'';
    document.body.appendChild(script);script.remove();
  };

  const safeRun=async(label,task)=>{
    try{await task()}
    catch(error){console.error('Módulo autenticado no cargado:',label,error)}
  };

  (async()=>{
    /* FASE A · PRIMERA PINTURA AUTENTICADA.
       El sidebar ya debe existir antes de activar centros secundarios. */
    styleOnce('portal-web-v2.css?v=20260903-web3','ccAuthPortalCss');
    styleOnce('project-detail-v2.css?v=20260901-detail2','ccAuthProjectCss');
    styleOnce('dashboard-simplified-v4.css?v=20260903-dash6','ccAuthDashboardCss');

    await safeRun('portal-web-v2.js',()=>runSrc('portal-web-v2.js?v=20260903-web3'));
    const tabs=nodeByBare('project-tabs-complete-v1.js');
    if(tabs)await safeRun('project-tabs-complete-v1.js',()=>runNode(tabs));
    const nav=nodeByBare('ui-navigation-single-source-v1.js');
    if(nav)await safeRun('ui-navigation-single-source-v1.js',()=>runNode(nav));
    await nextTurn();await shortPause();
    window.__CC_AUTH_CRITICAL_READY__=true;
    document.dispatchEvent(new CustomEvent('cc:authenticated-critical-ready'));

    /* FASE B · CENTROS WEB PRINCIPALES, UNO A UNO. */
    const webModules=[
      'project-detail-v2.js?v=20260901-detail2',
      'dashboard-simplified-v4.js?v=20260903-dash6',
      'payments-center-v1.js?v=20260901-payments1',
      'guarantees-center-v1.js?v=20260901-guarantees1',
      'visits-center-v1.js?v=20260901-visits1',
      'reports-center-v1.js?v=20260901-reports1',
      'alerts-center-v1.js?v=20260901-alerts1',
      'audit-center-v1.js?v=20260901-audit1',
      'portal-route-bridge-v1.js?v=20260901-route5',
      'ui-stability-v1.js?v=20260903-stable1'
    ];
    for(let i=0;i<webModules.length;i++){
      const src=webModules[i];
      await safeRun(src,()=>runSrc(src));
      if(i%2===1)await nextTurn();
    }
    window.__CC_AUTH_WEB_READY__=true;
    document.dispatchEvent(new CustomEvent('cc:authenticated-web-ready'));
    await shortPause();

    /* FASE C · RESTO DEL SISTEMA HISTÓRICO.
       performance-runtime se deja al final: al encontrar los centros web ya
       cargados solo agrega estilos/containment y no inicia una carrera doble. */
    const performance=nodeByBare('performance-runtime-v1.js');
    const alreadyCritical=new Set(['project-tabs-complete-v1.js','ui-navigation-single-source-v1.js']);
    let count=0;
    for(const node of nodes){
      const name=bare(node.dataset.src);
      if(node===performance||alreadyCritical.has(name)||loaded.has(name))continue;
      await safeRun(name||'inline',()=>runNode(node));
      if(++count%3===0)await nextTurn();
    }
    if(performance)await safeRun('performance-runtime-v1.js',()=>runNode(performance));

    window.__CC_AUTH_MODULES_READY__=true;
    document.dispatchEvent(new CustomEvent('cc:authenticated-modules-ready'));
  })();
})();
</script>`;
  const bodyClose=tail.toLowerCase().lastIndexOf('</body>');
  if(bodyClose<0)throw new Error('No se encontró </body> para instalar el cargador autenticado.');
  tail=tail.slice(0,bodyClose)+loader+'\n'+tail.slice(bodyClose);
  html=head+tail;
}

/* 6. Verificaciones que deben fallar antes de publicar si la consolidación se
      revierte accidentalmente. */
if(!html.includes("view.screen='project';view.tab='summary'"))throw new Error('El alta de proyecto no abre su expediente.');
if(html.includes("const targetPct=Number(contract.recoveryTarget||80);"))throw new Error('Sigue activa la recuperación universal al 80%.');
if(/<script\s+[^>]*src=["']https:\/\/cdn\.jsdelivr\.net\/npm\/jszip/i.test(html))throw new Error('JSZip volvió a bloquear el arranque del portal.');
if(!html.includes('data-cc-auth-script'))throw new Error('Los módulos funcionales no quedaron convertidos en un plan autenticado.');
if(!html.includes('data-cc-auth-loader data-cc-auth-plan'))throw new Error('Falta el cargador autenticado escalonado.');
if(/document\.write\s*\(/.test(html))throw new Error('Reapareció document.write en el HTML autenticado.');
if(!html.includes('__CC_AUTH_CRITICAL_READY__'))throw new Error('Falta la fase crítica del arranque autenticado.');
if(!html.includes('__CC_AUTH_WEB_READY__'))throw new Error('Falta la fase web del arranque autenticado.');
if(!/<script\s+src=["']private-access-v1\.js\?/i.test(html))throw new Error('El login seguro quedó bloqueado antes de autenticar.');
if(!/<script\s+src=["']password-recovery-v1\.js\?/i.test(html))throw new Error('La recuperación de contraseña quedó bloqueada antes de autenticar.');
if(html.includes(loginSuccess))throw new Error('El acceso todavía intenta activar todos los módulos sin recargar el contexto autenticado.');
for(const [moduleFile] of supplementalModules){
  const count=(html.match(new RegExp(`data-src=["'][^"']*${moduleFile.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}[^"']*["']`,'gi'))||[]).length;
  if(count!==1)throw new Error(`El módulo autenticado ${moduleFile} debe aparecer exactamente una vez en el plan; encontrado: ${count}.`);
}
for(const moduleFile of retired){
  if(new RegExp(moduleFile.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i').test(html))throw new Error(`Sigue cargada la capa retirada ${moduleFile}.`);
}
if(!html.toLowerCase().includes('</html>'))throw new Error('El HTML estabilizado quedó incompleto.');

fs.writeFileSync(path,html,'utf8');
console.log(`Núcleo estabilizado: alta directa, anticipo contractual, login ligero y ${supplementalModules.length} módulos autenticados consolidados.`);
