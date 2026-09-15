/* CONTROL CONTRACTUAL · DASHBOARD SIMPLIFICADO V6 · ESTABLE
   Mejora de experiencia web sobre el dashboard existente, sin duplicar datos ni alterar Supabase. */
(()=>{
'use strict';
if(window.__CC_DASHBOARD_SIMPLIFIED_V6__)return;window.__CC_DASHBOARD_SIMPLIFIED_V6__=true;window.__CC_DASHBOARD_SIMPLIFIED_V5__=true;window.__CC_DASHBOARD_SIMPLIFIED_V4__=true;
const Q=(s,r=document)=>r.querySelector(s);
const QA=(s,r=document)=>[...r.querySelectorAll(s)];
const NativeObserver=window.__ccNativeMutationObserver||window.MutationObserver;
const H=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const setText=(el,value)=>{if(!el)return;const next=String(value??'');if(el.textContent!==next)el.textContent=next};
const PORTFOLIO_VIEW_KEY='cc_portfolio_view_v4';
let working=false,observerQueued=false;
let portfolioView=(()=>{const saved=localStorage.getItem(PORTFOLIO_VIEW_KEY);if(['executive','cards','table'].includes(saved))return saved;return localStorage.getItem('cp_dashboard_view_v3')==='compact'?'executive':'cards'})();

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
  box.innerHTML=`<div><p class="cc-welcome-kicker">CONTROL CONTRACTUAL · GESTIÓN DE INFRAESTRUCTURA</p><h2>¡Hola, ${first}!</h2><p class="cc-welcome-date">${spanishDate()}</p></div><div class="cc-welcome-summary"><span role="button" tabindex="0" class="cc-summary-action" data-cc-summary-action="execution" aria-label="Ver proyectos en ejecución"><b>${execution}</b> en ejecución</span><span role="button" tabindex="0" class="cc-summary-action ${alerts?'attention':''}" data-cc-summary-action="review" aria-label="Ver asuntos por revisar"><b>${alerts}</b> por revisar</span><span role="button" tabindex="0" class="cc-summary-action" data-cc-summary-action="visits" aria-label="Ver visitas registradas"><b>${visits}</b> visitas registradas</span></div>`;
  content.insertBefore(box,content.firstChild);
}

function currentMainRoute(){
  let route='';
  try{route=String(document.body?.dataset?.ccMainRoute||window.__ccMainRoute||localStorage.getItem('cc_main_route_v2')||'').toLowerCase()}catch{}
  if(!route)route=String(Q('#ccSidebar .cc-side-btn.active[data-route]')?.dataset?.route||'').toLowerCase();
  if(route&&document.body?.dataset?.ccMainRoute!==route)document.body.dataset.ccMainRoute=route;
  return route;
}
const HOME_PHOTO_KEY='cc_home_photo_index_v2';
let homePhotoCache=null,homePhotoPromise=null;

function ensureHomeHeroStyle(){
  if(Q('#cc-home-primary-industrial-style'))return;
  const s=document.createElement('style');s.id='cc-home-primary-industrial-style';s.textContent=`
  body.cc-portal-v2[data-cc-main-route="inicio"] #content .cc-home-hero-v7.cc-primary-industrial{
    position:relative!important;display:block!important;overflow:hidden!important;isolation:isolate!important;
    min-height:500px!important;padding:0!important;border:1px solid rgba(72,163,219,.30)!important;border-radius:18px!important;
    background:#081725!important;box-shadow:0 22px 58px rgba(0,0,0,.24)!important
  }
  .cc-primary-industrial .cc-hi-photo{position:absolute;inset:0;z-index:0;background:linear-gradient(135deg,#0a2236,#124766)}
  .cc-primary-industrial .cc-hi-photo img{width:100%;height:100%;object-fit:cover;object-position:center;display:block}
  .cc-primary-industrial .cc-hi-photo:after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(3,14,24,.96) 0%,rgba(3,14,24,.82) 39%,rgba(3,14,24,.32) 70%,rgba(3,14,24,.12) 100%)}
  .cc-primary-industrial .cc-hi-grid{position:absolute;inset:0;z-index:1;opacity:.12;background-image:linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px);background-size:42px 42px;mask-image:linear-gradient(90deg,#000,transparent 72%)}
  .cc-primary-industrial .cc-home-copy-v7{position:relative;z-index:3;width:min(760px,67%);padding:64px 54px 150px!important}
  .cc-primary-industrial .cc-home-chip-v7{display:inline-flex!important;align-items:center!important;gap:7px!important;color:#83d6ff!important;font-size:10px!important;font-weight:900!important;letter-spacing:.19em!important}
  .cc-primary-industrial .cc-home-copy-v7 h2{max-width:690px!important;margin:12px 0 14px!important;font-size:clamp(38px,4.8vw,68px)!important;line-height:.98!important;letter-spacing:-.04em!important;color:#fff!important;text-shadow:0 4px 26px rgba(0,0,0,.35)}
  .cc-primary-industrial .cc-home-copy-v7 p{max-width:650px!important;margin:0!important;color:#dce9f3!important;font-size:clamp(14px,1.1vw,18px)!important;line-height:1.58!important}
  .cc-primary-industrial .cc-hi-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:24px}
  .cc-primary-industrial .cc-hi-actions button{min-width:150px;padding:11px 16px;border-radius:8px;border:1px solid rgba(255,255,255,.38);background:rgba(6,23,38,.42);color:#fff;font-weight:850;backdrop-filter:blur(8px)}
  .cc-primary-industrial .cc-hi-actions button.primary{background:#118ed7;border-color:#2eb5fb}
  .cc-primary-industrial .cc-hi-caption{position:absolute;z-index:4;right:24px;top:24px;max-width:330px;padding:11px 13px;border-radius:10px;background:rgba(4,17,29,.75);border:1px solid rgba(255,255,255,.20);color:#fff;backdrop-filter:blur(10px)}
  .cc-primary-industrial .cc-hi-caption small{display:block;color:#9fc1d8;font-size:8px;text-transform:uppercase;letter-spacing:.12em}
  .cc-primary-industrial .cc-hi-caption b{display:block;margin-top:4px;font-size:12px;line-height:1.35}
  .cc-primary-industrial .cc-hi-caption span{display:block;margin-top:3px;color:#c0d3df;font-size:9px}
  .cc-primary-industrial .cc-hi-nav{position:absolute;z-index:5;right:24px;top:104px;display:flex;gap:7px}
  .cc-primary-industrial .cc-hi-nav button{width:36px;height:36px;border-radius:50%;border:1px solid rgba(255,255,255,.40);background:rgba(4,17,29,.60);color:#fff;font-size:18px}
  .cc-primary-industrial .cc-home-stats-v7{position:absolute!important;z-index:4!important;left:0;right:0;bottom:0;margin:0!important;padding:11px 14px!important;display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:8px!important;background:rgba(4,17,29,.78)!important;border-top:1px solid rgba(255,255,255,.13)!important;backdrop-filter:blur(13px)}
  .cc-primary-industrial .cc-home-stats-v7 article{min-width:0!important;padding:10px 11px!important;border:1px solid rgba(255,255,255,.10)!important;border-radius:10px!important;background:rgba(255,255,255,.045)!important}
  .cc-primary-industrial .cc-home-stats-v7 small,.cc-primary-industrial .cc-home-stats-v7 span{color:#a9c0d1!important}
  .cc-primary-industrial .cc-home-stats-v7 strong{color:#fff!important}
  @media(max-width:930px){
    .cc-primary-industrial .cc-home-copy-v7{width:100%;padding:46px 28px 190px!important}
    .cc-primary-industrial .cc-hi-caption{top:auto;bottom:148px;right:18px;max-width:50%}
    .cc-primary-industrial .cc-hi-nav{right:18px;top:18px}
    .cc-primary-industrial .cc-home-stats-v7{grid-template-columns:1fr 1fr!important}
  }
  @media(max-width:590px){
    body.cc-portal-v2[data-cc-main-route="inicio"] #content .cc-home-hero-v7.cc-primary-industrial{min-height:680px!important}
    .cc-primary-industrial .cc-hi-photo:after{background:linear-gradient(180deg,rgba(3,14,24,.88),rgba(3,14,24,.52) 52%,rgba(3,14,24,.92))}
    .cc-primary-industrial .cc-home-copy-v7{padding:34px 20px 300px!important}
    .cc-primary-industrial .cc-home-copy-v7 h2{font-size:38px!important}
    .cc-primary-industrial .cc-hi-caption{left:18px;right:18px;bottom:225px;max-width:none}
    .cc-primary-industrial .cc-home-stats-v7{grid-template-columns:1fr!important}
  }`;
  document.head.appendChild(s);
}
function homeLocalPhotos(){
  const d=safeDB()||{},out=[],seen=new Set();
  const push=(src,p={})=>{src=String(src||'').trim();if(!src||seen.has(src)||!/^data:image\/(?:jpeg|jpg|png|webp);base64,/i.test(src))return;seen.add(src);out.push({src,project:p.name||p.code||'Proyecto',code:p.code||'',location:p.location||''})};
  const projects=new Map((d.projects||[]).map(p=>[String(p.id),p]));
  (d.visits||[]).forEach(v=>{const p=projects.get(String(v.projectId||v.project_id))||{};const raw=v.rawData||v.raw_data||{};(raw.photos||v.photos||[]).forEach(x=>push(x?.src||x,p))});
  (d.projects||[]).forEach(p=>{const raw=p.rawData||p.raw_data||{};[...(p.photos||[]),...(raw.photos||[])].forEach(x=>push(x?.src||x,p))});
  return out.slice(0,10);
}
function signedEvidenceUrl(path){
  const encoded=String(path||'').split('/').map(encodeURIComponent).join('/');
  return sbFetch('/storage/v1/object/sign/telegram-evidence/'+encoded,{method:'POST',body:{expiresIn:3600}}).then(r=>{
    const u=r?.data?.signedURL||r?.data?.signedUrl||r?.data?.signed_url||'';
    if(!u)return'';
    if(/^https?:/i.test(u))return u;
    return SUPABASE_URL+'/storage/v1'+(u.startsWith('/')?u:'/'+u);
  }).catch(()=> '');
}
async function homeEvidencePhotos(){
  if(homePhotoCache)return homePhotoCache;
  if(homePhotoPromise)return homePhotoPromise;
  homePhotoPromise=(async()=>{
    const local=homeLocalPhotos();
    if(local.length){homePhotoCache=local;return local}
    if(typeof sbFetch!=='function'||!cloudWorkspaceId){homePhotoCache=[];return[]}
    try{
      const q='/rest/v1/project_evidence?select=id,project_id,storage_path,file_name,analysis,extracted_text,created_at&workspace_id=eq.'+encodeURIComponent(cloudWorkspaceId)+'&evidence_type=eq.photo&storage_path=not.is.null&order=created_at.desc&limit=10';
      const r=await sbFetch(q),rows=Array.isArray(r?.data)?r.data:[],projects=new Map(activeProjects().map(p=>[String(p.id),p]));
      const photos=[];
      for(const e of rows){
        const src=await signedEvidenceUrl(e.storage_path);if(!src)continue;
        const p=projects.get(String(e.project_id))||{};
        photos.push({src,project:p.name||p.code||'Proyecto',code:p.code||'',location:p.location||'',caption:e.analysis?.summary||e.extracted_text||e.file_name||'Evidencia fotográfica'});
        if(photos.length>=8)break;
      }
      homePhotoCache=photos;return photos;
    }catch(error){console.warn('Portada: no se pudieron preparar fotografías.',error);homePhotoCache=[];return[]}
  })().finally(()=>{homePhotoPromise=null});
  return homePhotoPromise;
}
function bindHomeHero(section){
  const go=route=>Q('#ccSidebar [data-route="'+route+'"]')?.click();
  QA('[data-hi-route]',section).forEach(b=>b.addEventListener('click',()=>go(b.dataset.hiRoute)));
}
async function hydrateHomePhoto(section){
  if(!section?.isConnected)return;
  const photos=await homeEvidencePhotos();if(!section.isConnected||!photos.length)return;
  let last=Number(localStorage.getItem(HOME_PHOTO_KEY)||-1),index=photos.length===1?0:Math.floor(Math.random()*photos.length);
  if(index===last&&photos.length>1)index=(index+1)%photos.length;
  const img=Q('.cc-hi-photo img',section),cap=Q('.cc-hi-caption',section);
  const apply=i=>{index=(i+photos.length)%photos.length;const x=photos[index];if(img){img.src=x.src;img.alt='Fotografía de '+(x.project||'proyecto')}if(cap){cap.hidden=false;cap.innerHTML='<small>Fotografía registrada en Control Contractual</small><b>'+H(x.project||'Proyecto')+'</b><span>'+H([x.code,x.location].filter(Boolean).join(' · ')||x.caption||'Evidencia fotográfica')+'</span>'}try{localStorage.setItem(HOME_PHOTO_KEY,String(index))}catch{}};
  apply(index);
  const nav=Q('.cc-hi-nav',section);if(nav){nav.hidden=photos.length<2;const bs=QA('button',nav);if(bs[0])bs[0].onclick=()=>apply(index-1);if(bs[1])bs[1].onclick=()=>apply(index+1)}
}
function homeHero(){
  const content=Q('#content');if(!content||currentMainRoute()!=='inicio')return;
  let section=Q('.cc-home-hero-v7',content);
  const overview=Q('.exec-overview',content);if(!overview)return;
  if(section?.classList.contains('cc-primary-industrial'))return;
  section?.remove();
  const total=Q('.exec-money strong',overview)?.textContent?.trim()||'L. 0.00',active=activeProjects().length;
  const estimatedPct=Q('.portfolio-ring-content b',overview)?.textContent?.trim()||'0.00%',labels=QA('.exec-bar-label',overview);
  const estimated=Q('b',labels[0])?.textContent?.trim()||'L. 0.00',paidPct=Q('b',labels[1])?.textContent?.trim()||'0.00%';
  const paid=Q('.exec-kpis .exec-kpi:nth-child(4) strong',content)?.textContent?.trim()||'L. 0.00';
  const guaranteeRow=QA('.rail-state-row',content).find(x=>/garant/i.test(x.textContent||'')),guarantees=Q('b',guaranteeRow)?.textContent?.trim()||'0';
  ensureHomeHeroStyle();
  section=document.createElement('section');section.className='cc-home-hero-v7 cc-primary-industrial';
  section.innerHTML=`<div class="cc-hi-photo"><img alt="" decoding="async"></div><div class="cc-hi-grid"></div><div class="cc-home-copy-v7"><span class="cc-home-chip-v7">INFRAESTRUCTURA · CONTROL CONTRACTUAL</span><h2>Control técnico y contractual de proyectos.</h2><p>Supervisión, contratos, presupuesto, pagos, garantías y evidencia de obra en un solo expediente. Una plataforma para distintos municipios e instituciones.</p><div class="cc-hi-actions"><button class="primary" type="button" data-hi-route="proyectos">Ver proyectos →</button><button type="button" data-hi-route="transparencia">Transparencia</button></div></div><div class="cc-hi-caption" hidden></div><div class="cc-hi-nav" hidden><button type="button" aria-label="Fotografía anterior">‹</button><button type="button" aria-label="Fotografía siguiente">›</button></div><div class="cc-home-stats-v7"><article><small>Portafolio registrado</small><strong>${H(total)}</strong><span>${active} expedientes activos</span></article><article><small>Avance estimado global</small><strong>${H(estimatedPct)}</strong><span>${H(estimated)} certificado</span></article><article><small>Desembolso global</small><strong>${H(paidPct)}</strong><span>${H(paid)} pagado</span></article><article><small>Alertas de garantía</small><strong>${H(guarantees)}</strong><span>${Number(guarantees)?'Requieren seguimiento':'Sin alertas activas'}</span></article></div>`;
  overview.insertAdjacentElement('beforebegin',section);
  bindHomeHero(section);hydrateHomePhoto(section);
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

function rememberPortfolioView(mode){portfolioView=mode;localStorage.setItem(PORTFOLIO_VIEW_KEY,mode)}
function cardData(card){
  const metrics=QA('.v3-metric b',card),progress=QA('.mini-progress-label b',card),sub=QA('.project-v3-sub span',card);
  return{
    id:Q('[data-open]',card)?.dataset.open||'',code:Q('.project-v3-code',card)?.textContent?.trim()||'—',name:Q('h3',card)?.textContent?.trim()||'Proyecto',status:Q('.status',card)?.textContent?.trim()||'—',statusClass:Q('.status',card)?.className||'status',location:(sub[0]?.textContent||'').replace(/^\s*⌖\s*/,'').trim()||'Sin ubicación',contract:(sub[1]?.textContent||'').replace(/^\s*Contrato:\s*/i,'').trim()||'Pendiente',final:(sub[2]?.textContent||'').replace(/^\s*Final:\s*/i,'').trim()||'—',contractor:Q('.project-v3-contractor b',card)?.textContent?.trim()||'No registrado',amount:metrics[0]?.textContent?.trim()||'—',estimated:metrics[1]?.textContent?.trim()||'0.00%',paid:metrics[2]?.textContent?.trim()||'0.00%',progress:progress[0]?.textContent?.trim()||'0.00%',time:progress[1]?.textContent?.trim()||'0.00%',health:Q('.health-tag',card)?.textContent?.trim()||'Sin evaluación',healthClass:Q('.health-tag',card)?.className||'health-tag'
  };
}
function openProject(id){if(!id)return;try{view.projectId=id;view.screen='project';view.tab='summary';renderApp()}catch(e){console.warn(e)}}
function renderPortfolioTable(grid,cards){
  const rows=cards.map(cardData);if(!rows.length)return;
  grid.classList.remove('compact');grid.classList.add('cc-portfolio-table-mode');
  grid.innerHTML=`<div class="cc-portfolio-table-v4"><div class="cc-pt-head"><span>Proyecto</span><span>Estado</span><span>Contratista / contrato</span><span>Monto contractual</span><span>Avance</span><span>Plazo</span><span></span></div>${rows.map(r=>`<div class="cc-pt-row" data-cc-pt-row="${H(r.id)}"><div class="cc-pt-project"><b>${H(r.code)}</b><strong>${H(r.name)}</strong><small>${H(r.location)}</small></div><div><span class="${H(r.statusClass)}">${H(r.status)}</span><small class="cc-pt-health ${/danger/.test(r.healthClass)?'danger':/warn/.test(r.healthClass)?'warn':''}">${H(r.health)}</small></div><div class="cc-pt-contract"><b>${H(r.contractor)}</b><small>Contrato ${H(r.contract)}</small></div><div class="cc-pt-money"><b>${H(r.amount)}</b><small>Estimado ${H(r.estimated)} · Pagado ${H(r.paid)}</small></div><div class="cc-pt-progress"><b>${H(r.progress)}</b><small>Físico / financiero</small></div><div class="cc-pt-time"><b>${H(r.time)}</b><small>Final ${H(r.final)}</small></div><div class="cc-pt-action"><button class="btn primary" type="button" data-cc-pt-open="${H(r.id)}">Abrir expediente →</button></div></div>`).join('')}</div>`;
  QA('[data-cc-pt-open]',grid).forEach(b=>b.onclick=()=>openProject(b.dataset.ccPtOpen));
}
function portfolioViews(){
  const v=safeView(),board=Q('.projects-board');if(!v||v.screen!=='projects'||v.trash||!board)return;
  const switcher=Q('.view-switch',board),grid=Q('.project-grid-v3',board);if(!switcher||!grid)return;
  const cardsBtn=Q('[data-dashboard-view="cards"]',switcher),executiveBtn=Q('[data-dashboard-view="compact"]',switcher);if(!cardsBtn||!executiveBtn)return;
  setText(cardsBtn,'▦ Tarjetas');setText(executiveBtn,'☰ Ejecutiva');
  let tableBtn=Q('[data-portfolio-view="table"]',switcher);
  if(!tableBtn){
    tableBtn=document.createElement('button');tableBtn.type='button';tableBtn.dataset.portfolioView='table';tableBtn.textContent='▤ Tabla';
    tableBtn.onclick=e=>{e.preventDefault();e.stopPropagation();rememberPortfolioView('table');setTimeout(enhance,0)};
    switcher.appendChild(tableBtn);
  }
  if(switcher.dataset.portfolioBound!=='1'){
    switcher.addEventListener('click',e=>{const b=e.target.closest?.('[data-dashboard-view]');if(!b)return;rememberPortfolioView(b.dataset.dashboardView==='compact'?'executive':'cards')},true);
    switcher.dataset.portfolioBound='1';
  }
  const countHost=Q('.board-controls',board);let badge=Q('.cc-portfolio-count-v4',countHost);
  if(!badge){badge=document.createElement('span');badge.className='cc-portfolio-count-v4';countHost.prepend(badge)}
  const currentCards=QA(':scope > .project-v3',grid);setText(badge,`${currentCards.length||QA('.cc-pt-row',grid).length} visibles`);
  executiveBtn.classList.toggle('active',portfolioView==='executive');cardsBtn.classList.toggle('active',portfolioView==='cards');tableBtn.classList.toggle('active',portfolioView==='table');
  if(portfolioView==='table'){if(!Q('.cc-portfolio-table-v4',grid)&&currentCards.length)renderPortfolioTable(grid,currentCards);return}
  grid.classList.remove('cc-portfolio-table-mode');
}

function dashboardStatus(status,attempt=0){
  const search=Q('#projectSearch');
  try{if(typeof view!=='undefined')view.search=''}catch{}
  if(search)search.value='';
  const selector='[data-status-filter="'+String(status||'all').replace(/"/g,'')+'"]';
  const button=QA(selector).find(el=>el.offsetParent!==null||el.getClientRects().length)||Q(selector);
  if(button){
    button.click();
    setTimeout(()=>Q('.projects-board')?.scrollIntoView({behavior:'smooth',block:'start'}),80);
    return true;
  }
  if(attempt<3){
    const projects=Q('#ccSidebar [data-route="proyectos"]');
    if(projects){projects.click();setTimeout(()=>dashboardStatus(status,attempt+1),140);return true}
  }
  return false;
}
function dashboardRoute(route){
  const button=Q('#ccSidebar [data-route="'+String(route||'').replace(/"/g,'')+'"]');
  if(button){button.click();return true}
  return false;
}
function ensureDashboardNavigationStyle(){
  if(Q('#cc-dashboard-navigation-style'))return;
  const style=document.createElement('style');style.id='cc-dashboard-navigation-style';style.textContent='.cc-dashboard-nav-item{cursor:pointer!important}.cc-dashboard-nav-item:focus-visible{outline:2px solid #60a5fa;outline-offset:3px}';
  document.head.appendChild(style);
}
function bindDashboardNavigationItem(element,action,label){
  if(!element||element.dataset.ccNavBound==='1')return;
  element.dataset.ccNavBound='1';
  element.classList.add('cc-dashboard-nav-item');
  element.setAttribute('role','button');
  element.setAttribute('tabindex','0');
  if(label)element.setAttribute('aria-label',label);
  const go=()=>{
    if(action==='review'){
      const review=Q('#reviewIssuesBtn');
      if(review)review.click();else dashboardRoute('alertas');
    }else if(action.startsWith('status:'))dashboardStatus(action.slice(7));
    else if(action.startsWith('route:'))dashboardRoute(action.slice(6));
  };
  element.addEventListener('click',go);
  element.addEventListener('keydown',event=>{
    if(event.key==='Enter'||event.key===' '){event.preventDefault();go()}
  });
}
function bindDashboardNavigation(){
  ensureDashboardNavigationStyle();
  QA('.exec-chips .exec-chip:not(.review-issues-chip)').forEach(element=>{
    const text=element.textContent.toLowerCase();
    const action=/ejecuci/.test(text)?'status:execution':/contrat|adjudic/.test(text)?'status:procurement':/finaliz|cerrad/.test(text)?'status:closed':'';
    if(action)bindDashboardNavigationItem(element,action,'Filtrar proyectos: '+element.textContent.trim());
  });
  QA('.cc-summary-action,.cc-welcome-summary > span').forEach(element=>{
    const action=element.dataset.ccSummaryAction||(
      /visita/.test(element.textContent.toLowerCase())?'visits':
      /revisar/.test(element.textContent.toLowerCase())?'review':
      /ejecuci/.test(element.textContent.toLowerCase())?'execution':''
    );
    if(action==='execution')bindDashboardNavigationItem(element,'status:execution','Ver proyectos en ejecución');
    else if(action==='review')bindDashboardNavigationItem(element,'review','Ver asuntos por revisar');
    else if(action==='visits')bindDashboardNavigationItem(element,'route:visitas','Ver visitas registradas');
  });
  QA('.exec-kpi').forEach(element=>{
    const text=element.textContent.toLowerCase();
    const action=/proyectos activos/.test(text)?'status:all':
      /monto contractual/.test(text)?'route:contratos':
      /total estimado|total pagado/.test(text)?'route:pagos':
      /alertas garantías/.test(text)?'route:garantias':'';
    if(action)bindDashboardNavigationItem(element,action,'Abrir '+text.split(/\s+/).slice(0,4).join(' '));
  });
  QA('.followup-mini').forEach(element=>{
    const text=element.textContent.toLowerCase();
    const action=/plazo/.test(text)?'route:alertas':
      /garant/.test(text)?'route:garantias':
      /observ/.test(text)?'route:visitas':
      /anticipo/.test(text)?'route:pagos':'';
    if(action)bindDashboardNavigationItem(element,action,'Abrir '+text.split(/\s+/).slice(0,3).join(' '));
  });
  QA('.rail-state-row').forEach(element=>{
    const text=element.textContent.toLowerCase();
    const action=/en ejecución/.test(text)?'status:execution':
      /contratación|adjudicación/.test(text)?'status:procurement':
      /finalizado|cerrado/.test(text)?'status:closed':
      /garantías con alerta/.test(text)?'route:garantias':
      /observaciones pendientes/.test(text)?'route:visitas':
      /anticipos por amortizar|estimaciones pendientes/.test(text)?'route:pagos':
      /otros estados/.test(text)?'status:all':'';
    if(action)bindDashboardNavigationItem(element,action,'Abrir '+text.split(/\s+/).slice(0,4).join(' '));
  });
}
function enhance(){if(working)return;working=true;try{regroupSidebar();welcome();homeHero();lifecycle();portfolioViews();bindDashboardNavigation()}finally{working=false}}
function queueEnhance(){
  if(observerQueued)return;observerQueued=true;
  const run=()=>{observerQueued=false;enhance()};
  (typeof requestAnimationFrame==='function'?requestAnimationFrame:setTimeout)(run);
}
if(NativeObserver)new NativeObserver(queueEnhance).observe(document.getElementById('app')||document.documentElement,{childList:true,subtree:true});
window.addEventListener('cc:data-changed',()=>setTimeout(enhance,40));
setTimeout(enhance,0);setTimeout(enhance,300);setTimeout(enhance,1000);
})();