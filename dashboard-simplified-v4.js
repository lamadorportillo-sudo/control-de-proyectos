/* CONTROL CONTRACTUAL · DASHBOARD SIMPLIFICADO V4
   Mejora de experiencia web sobre el dashboard existente, sin duplicar datos ni alterar Supabase. */
(()=>{
'use strict';
if(window.__CC_DASHBOARD_SIMPLIFIED_V4__)return;window.__CC_DASHBOARD_SIMPLIFIED_V4__=true;
const Q=(s,r=document)=>r.querySelector(s);
const QA=(s,r=document)=>[...r.querySelectorAll(s)];
const NativeObserver=window.__ccNativeMutationObserver||window.MutationObserver;
let working=false;

function safeView(){try{return typeof view!=='undefined'?view:null}catch{return null}}
function safeDB(){try{return typeof db!=='undefined'?db:null}catch{return null}}
function currentName(){
  try{const u=typeof currentUser==='function'?currentUser():null;if(u?.name)return String(u.name)}catch{}
  return Q('[data-cc-user]')?.textContent?.trim()||'Usuario';
}
function spanishDate(){
  const t=new Date().toLocaleDateString('es-HN',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
  return t.charAt(0).toUpperCase()+t.slice(1);
}
function activeProjects(){return (safeDB()?.projects||[]).filter(p=>!p.deletedAt)}
function count(re){return activeProjects().filter(p=>re.test(String(p.status||''))).length}

function regroupSidebar(){
  const side=Q('#ccSidebar');if(!side||side.dataset.groupedV4==='1')return;
  const buttons=QA('.cc-side-btn[data-route]',side);if(!buttons.length)return;
  const byRoute=new Map(buttons.map(b=>[b.dataset.route,b]));
  buttons.forEach(b=>b.remove());
  QA(':scope > .cc-nav-label,:scope > .cc-side-nav',side).forEach(x=>x.remove());
  const bottom=Q('.cc-sidebar-bottom',side);
  const groups=[
    ['Control ejecutivo',['inicio','proyectos','alertas']],
    ['Contratos y finanzas',['contratos','presupuesto','pagos','garantias']],
    ['Supervisión',['visitas','reportes']],
    ['Sistema',['auditoria','campo','arquitectura']]
  ];
  groups.forEach(([title,routes])=>{
    const label=document.createElement('div');label.className='cc-nav-label';label.textContent=title;
    const nav=document.createElement('nav');nav.className='cc-side-nav';
    routes.forEach(r=>{const b=byRoute.get(r);if(b)nav.appendChild(b)});
    side.insertBefore(label,bottom);side.insertBefore(nav,bottom);
  });
  side.dataset.groupedV4='1';
  const projects=byRoute.get('proyectos');
  projects?.addEventListener('click',()=>setTimeout(()=>Q('.projects-board')?.scrollIntoView({behavior:'smooth',block:'start'}),180));
}

function welcome(){
  const v=safeView(),content=Q('#content');
  if(!v||v.screen!=='projects'||v.trash||!content||Q('.cc-dashboard-welcome-v4',content))return;
  const first=(currentName().split(/\s+/)[0]||'Usuario').replace(/[^\p{L}\p{N}.'-]/gu,'');
  const execution=count(/ejecuci/i),alerts=Number(Q('.rail-attention-count')?.textContent||0),visits=(safeDB()?.visits||[]).length;
  const box=document.createElement('section');box.className='cc-dashboard-welcome-v4';
  box.innerHTML=`<div><p class="cc-welcome-kicker">CONTROL CONTRACTUAL · SANTA MARÍA, LA PAZ</p><h2>¡Hola, ${first}!</h2><p class="cc-welcome-date">${spanishDate()}</p></div><div class="cc-welcome-summary"><span><b>${execution}</b> en ejecución</span><span class="${alerts?'attention':''}"><b>${alerts}</b> por revisar</span><span><b>${visits}</b> visitas registradas</span></div>`;
  content.insertBefore(box,content.firstChild);
}

function lifecycle(){
  const v=safeView(),content=Q('#content');
  if(!v||v.screen!=='projects'||v.trash||!content||Q('.cc-lifecycle-v4',content))return;
  const workspace=Q('.dashboard-workspace-v3',content);if(!workspace)return;
  const stages=[
    ['1','Planificación',/planific/i,'Planificación'],
    ['2','Contratación',/contrat/i,'contratación'],
    ['3','Adjudicado',/adjudic/i,'Adjudicado'],
    ['4','Ejecución',/ejecuci/i,'En ejecución'],
    ['5','Suspendido',/suspend/i,'Suspendido'],
    ['6','Finalizado',/finaliz/i,'Finalizado'],
    ['7','Cerrado',/cerrad/i,'Cerrado']
  ];
  const section=document.createElement('section');section.className='cc-lifecycle-v4';
  section.innerHTML=`<div class="cc-life-head"><div><p class="cc-welcome-kicker">CICLO DE VIDA DEL PROYECTO</p><h3>Del expediente a la finalización</h3><p>Cada registro conserva su trazabilidad técnica, contractual y financiera.</p></div><button class="cc-life-clear" type="button" ${v.search?'':'hidden'}>Ver todos</button></div><div class="cc-life-track">${stages.map(([n,label,re,q])=>{const c=count(re),special=/Suspendido/.test(label)?' warn':'';return `<button class="cc-life-step${special}${c?' has-data':''}" type="button" data-life-query="${q}"><span class="cc-life-node">${n}</span><span class="cc-life-name">${label}</span><b>${c}</b></button>`}).join('')}</div>`;
  workspace.insertAdjacentElement('afterend',section);
  QA('[data-life-query]',section).forEach(b=>b.onclick=()=>{try{view.search=b.dataset.lifeQuery;view.screen='projects';view.projectId=null;view.trash=false;renderApp()}catch{}});
  Q('.cc-life-clear',section)?.addEventListener('click',()=>{try{view.search='';renderApp()}catch{}});
}

function enhance(){
  if(working)return;working=true;
  try{regroupSidebar();welcome();lifecycle()}finally{working=false}
}
if(NativeObserver)new NativeObserver(()=>enhance()).observe(document.getElementById('app')||document.documentElement,{childList:true,subtree:true});
window.addEventListener('cc:data-changed',()=>setTimeout(enhance,40));
setTimeout(enhance,0);setTimeout(enhance,300);setTimeout(enhance,1000);
})();
