const fs=require('fs');
const zlib=require('zlib');
const vm=require('vm');

const files=Array.from({length:12},(_,i)=>`bundle-${String(i+1).padStart(2,'0')}.js`);
let b64='';
for(const file of files){
  const src=fs.readFileSync(file,'utf8');
  const m=src.match(/\+\s*'([^']*)'/s);
  if(!m) throw new Error(`No se pudo leer ${file}`);
  b64+=m[1];
}

b64=b64.replace(/[^A-Za-z0-9+/=]/g,'').replace(/=+$/,'');
b64+='='.repeat((4-(b64.length%4))%4);
if(!b64.startsWith('H4sI')) throw new Error('Paquete Base64/GZIP inválido');

let html=zlib.gunzipSync(Buffer.from(b64,'base64')).toString('utf8');
if(!html.includes('</body>')) throw new Error('HTML base incompleto');

const viewStateOld="let db=loadDB();let session=JSON.parse(localStorage.getItem(SESSION)||'null');let view={screen:'projects',projectId:null,tab:'summary',search:'',trash:false};";
const viewStateBridge=viewStateOld+"window.ccCurrentProjectId=()=>view.screen==='project'?view.projectId||'':'';";
if(!html.includes(viewStateOld)) throw new Error('No se encontró el estado de navegación para exponer el proyecto activo.');
html=html.replace(viewStateOld,viewStateBridge);

// Conserva el endurecimiento de red y los datos de la sesión de seguridad.
// La base comprimida es histórica, por lo que toda reconstrucción debe aplicar
// explícitamente estas protecciones antes de publicar el HTML resultante.
const sbFetchOld="async function sbFetch(path,{method='GET',body=null,auth=true,retry=true}={}){const headers={'apikey':SUPABASE_KEY,'Content-Type':'application/json','Accept':'application/json'};if(auth&&session?.accessToken)headers.Authorization=`Bearer ${session.accessToken}`;const res=await fetch(SUPABASE_URL+path,{method,headers,body:body==null?undefined:JSON.stringify(body)});if(res.status===401&&retry&&session?.refreshToken){const ok=await refreshCloudSession();if(ok)return sbFetch(path,{method,body,auth,retry:false})}const text=await res.text();let data=null;try{data=text?JSON.parse(text):null}catch{data=text}if(!res.ok)throw new Error(data?.message||data?.error_description||data?.error||`Error ${res.status}`);return{data,res}}";
const sbFetchSecure=sbFetchOld.replace("body:body==null?undefined:JSON.stringify(body)}","body:body==null?undefined:JSON.stringify(body),cache:'no-store'}");
if(!html.includes(sbFetchOld)) throw new Error('No se encontró el cliente Supabase esperado para aplicar no-store.');
html=html.replace(sbFetchOld,sbFetchSecure);

const refreshOld="async function refreshCloudSession(){try{const res=await fetch(SUPABASE_URL+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{'apikey':SUPABASE_KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:session.refreshToken})});if(!res.ok)return false;const d=await res.json();session={userId:d.user?.id||session.userId,email:d.user?.email||session.email,accessToken:d.access_token,refreshToken:d.refresh_token||session.refreshToken,expiresAt:Date.now()+(d.expires_in||3600)*1000};localStorage.setItem(SESSION,JSON.stringify(session));return true}catch{return false}}";
const refreshSecure="async function refreshCloudSession(){try{const res=await fetch(SUPABASE_URL+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{'apikey':SUPABASE_KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:session.refreshToken}),cache:'no-store'});if(!res.ok)return false;const d=await res.json();const priorSession=session||{};session={userId:d.user?.id||priorSession.userId,email:d.user?.email||priorSession.email,accessToken:d.access_token,refreshToken:d.refresh_token||priorSession.refreshToken,expiresAt:Date.now()+(d.expires_in||3600)*1000,securitySessionId:priorSession.securitySessionId||'',deviceLabel:priorSession.deviceLabel||''};localStorage.setItem(SESSION,JSON.stringify(session));return true}catch{return false}}";
if(!html.includes(refreshOld)) throw new Error('No se encontró la renovación de sesión esperada para endurecerla.');
html=html.replace(refreshOld,refreshSecure);

// Buscador del dashboard antiguo: filtra sin redibujar y conserva el foco.
const searchOld="$('#projectSearch').oninput=e=>{view.search=e.target.value;renderProjects(k)};";
const searchNew="$('#projectSearch').oninput=e=>{view.search=e.target.value;const q=view.search.trim().toLowerCase(),grid=$('.dashboard-project-grid');if(!grid)return;const cards=[...grid.querySelectorAll('.card')];let visible=0;cards.forEach(card=>{const show=!q||card.textContent.toLowerCase().includes(q);card.style.display=show?'':'none';if(show)visible++});let empty=grid.querySelector('[data-search-empty]');if(!visible){if(!empty){empty=document.createElement('div');empty.className='empty';empty.dataset.searchEmpty='1';empty.textContent='No hay proyectos que coincidan con la búsqueda.';grid.appendChild(empty)}}else if(empty)empty.remove()};";
if(html.includes(searchOld)) html=html.replace(searchOld,searchNew);

// Buscador V3: esta era la causa real del desenfoque porque rerender() reconstruía el input.
const searchV3Old="$('#projectSearch').oninput=e=>{view.search=e.target.value;rerender()};";
const searchV3New="$('#projectSearch').oninput=e=>{view.search=e.target.value;const q=view.search.trim().toLowerCase(),grid=document.querySelector('.project-grid-v3');if(!grid)return;const cards=[...grid.querySelectorAll('.project-v3')];let visible=0;cards.forEach(card=>{const show=!q||card.textContent.toLowerCase().includes(q);card.hidden=!show;if(show)visible++});let empty=grid.querySelector('[data-search-empty]');if(!visible){if(!empty){empty=document.createElement('div');empty.className='empty';empty.dataset.searchEmpty='1';empty.textContent='No hay proyectos que coincidan con la búsqueda.';grid.appendChild(empty)}}else if(empty)empty.remove()};";
if(html.includes(searchV3Old)){
  html=html.replace(searchV3Old,searchV3New);
  console.log('Buscador V3 corregido: ya no redibuja el input al escribir.');
}else if(!html.includes("grid.querySelectorAll('.project-v3')")){
  console.log('Aviso: no se encontró el manejador V3 esperado.');
}

// Vista de expedientes en formato LISTA: una fila por proyecto, menos saturación visual.
// Se fuerza la vista compacta/lista independientemente de una preferencia vieja guardada.
html=html.replace("let dashView=localStorage.getItem(VIEW_KEY)||'cards';","let dashView='compact';localStorage.setItem(VIEW_KEY,'compact');");
html=html.replace('▦ Tarjetas</button><button data-dashboard-view="compact" class="${dashView===\'compact\'?\'active\':\'\'}">☰ Compacta','☰ Lista</button><button data-dashboard-view="compact" class="${dashView===\'compact\'?\'active\':\'\'}">☰ Lista');

const listCss=`<style id="projects-list-fix-v1">
/* Lista limpia de expedientes */
.project-grid-v3{grid-template-columns:1fr!important;gap:8px!important}
.view-switch{display:none!important}
.project-v3{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;align-items:stretch!important;border-radius:14px!important;transform:none!important}
.project-v3-main{display:grid!important;grid-template-columns:minmax(0,1.8fr) minmax(260px,.8fr)!important;gap:14px!important;align-items:center!important;padding:12px 14px!important}
.project-v3 h3{font-size:13px!important;line-height:1.25!important;margin:5px 0 4px!important;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.project-v3-code{font-size:9px!important}.project-v3 .status{font-size:8px!important;padding:4px 7px!important}
.project-v3-sub{font-size:8px!important;gap:6px!important}.project-v3-contractor,.project-v3-progress,.project-v3-health,.v3-words{display:none!important}
.project-v3-money{grid-template-columns:1.2fr .7fr .7fr!important;gap:6px!important;margin:0!important}
.v3-metric{padding:7px 8px!important}.v3-metric small{font-size:7px!important}.v3-metric b,.v3-metric.primary b{font-size:11px!important;margin-top:2px!important}
.project-v3-actions{min-width:116px!important;display:flex!important;flex-direction:column!important;justify-content:center!important;gap:5px!important;padding:9px!important;border-top:0!important;border-left:1px solid rgba(148,163,184,.08)!important}
.project-v3-actions .btn{min-height:30px!important;padding:6px 8px!important;font-size:8px!important;width:100%!important;margin:0!important}
.project-v3-actions .btn.primary{order:-1!important}
.project-grid-v3 .empty{grid-column:1/-1}
@media(max-width:760px){
 .project-v3{display:block!important}.project-v3-main{display:block!important;padding:12px!important}.project-v3-money{margin-top:9px!important}.project-v3-actions{min-width:0!important;flex-direction:row!important;flex-wrap:wrap!important;border-left:0!important;border-top:1px solid rgba(148,163,184,.08)!important}.project-v3-actions .btn{width:auto!important;flex:1!important}.project-v3-actions .btn.primary{flex-basis:100%!important}
}
</style>`;
if(!html.includes('projects-list-fix-v1')) html=html.replace('</head>',listCss+'\n</head>');

// Descubre antes los recursos críticos mientras termina de analizar el HTML histórico.
html=html.replace(/<!-- cc-critical-hints:start -->[\s\S]*?<!-- cc-critical-hints:end -->\s*/gi,'');
const criticalHints='<!-- cc-critical-hints:start --><link rel="preconnect" href="https://flethujkrharehjikwgj.supabase.co" crossorigin><link rel="preload" href="performance-runtime-v1.js?v=20260823-perf5" as="script"><link rel="preload" href="private-access-v1.js?v=20260823-private5" as="script"><link rel="preload" href="workspace-access-v1.js?v=20260820-master4" as="script"><link rel="preload" href="engineer-chatbot-v3.js?v=20260823-ai4" as="script"><link rel="preload" href="halu-engineer-cutout-v4.webp" as="image" type="image/webp"><!-- cc-critical-hints:end -->';
html=html.replace('</head>',criticalHints+'\n</head>');

// El avance nunca cambia por sí solo el estado contractual del proyecto.
const progressOld="function syncAllProjectProgress(){(db.projects||[]).forEach(p=>{const c=db.contracts.find(x=>x.projectId===p.id),a=projectAutomaticProgress(p,c);p.physicalProgress=a.physical;p.financialProgress=a.financial})}";
const progressNew="function syncAllProjectProgress(){(db.projects||[]).forEach(p=>{const c=db.contracts.find(x=>x.projectId===p.id),a=projectAutomaticProgress(p,c);p.physicalProgress=a.physical;p.financialProgress=a.financial})}";
if(html.includes(progressOld)) html=html.replace(progressOld,progressNew);

// Elimina una copia histórica del escáner dentro del template de informes.
const fnPos=html.indexOf('function downloadCurrentReport');
const badStart='<body>${body}<script>\n/* ===== ESCANER / IMPORTADOR DE ESTIMACIONES V1 ===== */';
const start=fnPos>=0?html.indexOf(badStart,fnPos):-1;
if(start>=0){
  const endMarker='</script>\n</body></html>`;';
  const end=html.indexOf(endMarker,start);
  if(end<0) throw new Error('Se detectó el escáner incrustado, pero no se encontró su cierre.');
  html=html.slice(0,start)+'<body>${body}</body></html>`;'+html.slice(end+endMarker.length);
}

const deepScanner=fs.readFileSync('estimate-scanner-v1.js','utf8');
if(!deepScanner.includes('LECTOR DOCUMENTAL PROFUNDO V2')) throw new Error('No se encontró el lector documental V2.');
if(!html.includes('LECTOR DOCUMENTAL PROFUNDO V2')){
  const bodyEnd=html.toLowerCase().lastIndexOf('</body>');
  html=html.slice(0,bodyEnd)+`<script>\n${deepScanner}\n</script>\n`+html.slice(bodyEnd);
}

const adaptiveLearning=fs.readFileSync('adaptive-learning-v1.js','utf8');
if(!adaptiveLearning.includes('APRENDIZAJE ADAPTATIVO V1')) throw new Error('No se encontró el motor de aprendizaje adaptativo.');
if(!html.includes('APRENDIZAJE ADAPTATIVO V1')){
  const bodyEnd=html.toLowerCase().lastIndexOf('</body>');
  html=html.slice(0,bodyEnd)+`<script>\n${adaptiveLearning}\n</script>\n`+html.slice(bodyEnd);
}

// El endurecimiento se instala antes del primer render para evitar mezclar espacios de trabajo.
const coreHardening=fs.readFileSync('core-hardening-v1.js','utf8');
try{new vm.Script(coreHardening,{filename:'core-hardening-v1.js'})}catch(err){throw new Error(`JavaScript inválido en core-hardening-v1.js: ${err.message}`)}
const bootMarker='installProjectActionSafety();\nrender();';
if(!html.includes(bootMarker)) throw new Error('No se encontró el punto de arranque para instalar el endurecimiento.');
html=html.replace(bootMarker,`installProjectActionSafety();\n${coreHardening}\nrender();`);

// Pestaña independiente para la disponibilidad presupuestaria.
if(!fs.existsSync('budget-portfolio-tab-v1.js')) throw new Error('No se encontró budget-portfolio-tab-v1.js.');
if(!html.includes('budget-portfolio-tab-v1.js')){
  const bodyEnd=html.toLowerCase().lastIndexOf('</body>');
  html=html.slice(0,bodyEnd)+'<script src="budget-portfolio-tab-v1.js"></script>\n'+html.slice(bodyEnd);
}

// Coordina los observadores antes de cargar cualquier módulo funcional.
const performanceModule='performance-runtime-v1.js',performanceVersion='20260823-perf5';
if(!fs.existsSync(performanceModule)) throw new Error(`No se encontró ${performanceModule}.`);
try{new vm.Script(fs.readFileSync(performanceModule,'utf8'),{filename:performanceModule})}catch(err){throw new Error(`JavaScript inválido en ${performanceModule}: ${err.message}`)}
html=html.replace(/<script\s+src=["']performance-runtime-v1\.js(?:\?[^"']*)?["']\s*><\/script>\s*/gi,'');
const firstFeature=/<script src="budget-portfolio-tab-v1\.js(?:\?v=[^"]+)?"><\/script>/;
html=html.replace(firstFeature,`<script src="${performanceModule}?v=${performanceVersion}"></script>\n<script src="budget-portfolio-tab-v1.js?v=20260823-budget5"></script>`);

// Arquitectura ejecutiva, normativa histórica, documentos de adjudicación y diseño corporativo.
// Los módulos funcionales se cargan de forma directa para no depender de cachés o cargadores secundarios.
const lateModules=[
  ['workspace-access-v1.js','20260820-master4'],
  ['private-access-v1.js','20260823-private5'],
  ['password-recovery-v1.js','20260822-password1'],
  ['admin-users-v1.js','20260823-admin-users4'],
  ['security-runtime-v1.js','20260823-security1'],
  ['security-center-v1.js','20260823-security-center1'],
  ['mfa-security-v1.js','20260824-mfa4'],
  ['alerts-compact-v1.js','20260820-master4'],
  ['dashboard-executive-v1.js','20260820-master4'],
  ['engineering-ux-v1.js','20260820-master4'],
  ['procurement-thresholds-v1.js','20260820-gacetas4'],
  ['contracts-center-v1.js','20260820-contracts2'],
  ['corporate-ui-v1.js','20260820-corporate3'],
  ['corporate-polish-v1.js','20260820-polish6'],
  ['procurement-award-fix-v1.js','20260820-award3'],
  ['visit-photos-v1.js','20260820-visits1'],
  ['award-notices-v1.js','20260820-notes1'],
  ['visit-photo-persistence-v2.js','20260820-photopersist2'],
  ['visit-print-v3.js','20260820-visitprint3'],
  ['procurement-invitations-v2.js','20260820-invitations2'],
  ['procurement-offers-invitees-v1.js','20260822-offersinvitees2'],
  ['summary-budget-law-v1.js','20260820-summarybudgetlaw1'],
  ['project-search-clean-v1.js','20260820-searchclean1'],
  ['storage-quota-fix-v1.js','20260820-storagequota2'],
  ['project-tabs-complete-v1.js','20260823-tabscomplete24'],
  ['feature-lazy-loader-v1.js','20260824-lazy3'],
  ['procurement-process-save-v4.js','20260820-procsave4'],
  ['contract-integrity-fix-v1.js','20260822-integrity1'],
  ['integrity-hardening-v2.js','20260822-integrity2'],
  ['cross-module-sync-v1.js','20260822-relations1'],
  ['programacion-control-v1.js','20260823-programacion4'],
  ['web-knowledge-v2.js','20260822-short1'],
  ['engineering-manual-reference-v1.js','20260823-manual1'],
  ['adaptive-chat-learning-v1.js','20260822-global1'],
['engineer-chatbot-v3.js','20260823-ai4'],
  ['halu-avatar-motion-v1.js','20260822-place13'],
  ['transparency-portal-v1.js','20260822-transparency1'],
  ['photo-gallery-polish-v2.js','20260822-photopolish2'],
  ['ui-theme-unifier-v1.js','20260822-theme1'],
  ['engineering-visibility-fix-v1.js','20260822-visibility1'],
  ['ui-operational-polish-v1.js','20260822-operational1'],
  ['home-executive-fix-v2.js','20260822-home2'],
  ['ui-visibility-audit-v1.js','20260822-uiaudit1'],
  ['portfolio-redesign-v1.js','20260821-portfolio3'],
  ['project-portfolio-detail-v1.js','20260821-projectdetail2'],
  ['portfolio-gallery-v1.js','20260821-gallery2'],
  ['portfolio-screen-fix-v1.js','20260821-screenfix1'],
  ['project-photo-story-v1.js','20260821-photostory1'],
];
for(const [module,version] of lateModules){
  if(!fs.existsSync(module)) throw new Error(`No se encontró ${module}.`);
  try{new vm.Script(fs.readFileSync(module,'utf8'),{filename:module})}catch(err){throw new Error(`JavaScript inválido en ${module}: ${err.message}`)}
  const re=new RegExp(`<script\\s+src=["']${module.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}(?:\\?[^"']*)?["']\\s*></script>\\s*`,'gi');
  html=html.replace(re,'');
  const pos=html.toLowerCase().lastIndexOf('</body>');
  html=html.slice(0,pos)+`<script src="${module}?v=${version}"></script>\n`+html.slice(pos);
}

const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);
if(!scripts.length) throw new Error('No se encontraron scripts en el HTML final.');
for(let i=0;i<scripts.length;i++){
  try{new vm.Script(scripts[i],{filename:`inline-${i+1}.js`});}
  catch(err){throw new Error(`JavaScript inválido en bloque ${i+1}: ${err.message}`)}
}
if(!html.toLowerCase().includes('</html>')) throw new Error('Falta el cierre </html>.');
if(html.includes('window.__CP_B64=')) throw new Error('El HTML final aún contiene el cargador Base64.');

fs.writeFileSync('index.html',html,'utf8');
console.log(`index.html directo generado: ${Buffer.byteLength(html,'utf8')} bytes; ${scripts.length} scripts validados.`);
