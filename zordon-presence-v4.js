/* ===== ZORDON · PRESENCIA PERMANENTE V4 =====
   Control Contractual / HALU.
   Nunca desaparece, no bloquea controles críticos y solo se mueve cuando hace falta. */
(()=>{
'use strict';
if(window.__CC_ZORDON_PRESENCE_V4__)return;
window.__CC_ZORDON_PRESENCE_V4__=true;

const STORAGE_KEY='halu.zordon.v2';
const LEGACY_KEY='cc_halu_avatar_position_v1';
const STYLE_ID='ccZordonPresenceV4Style';
const EDGE=14;
const DRAG_DELTA=5;
const DEFAULTS={version:2,position:null,size:'normal',autoAvoid:true,idleSeconds:120};
const state={
  launcher:null,chat:null,settingsButton:null,settingsPanel:null,drag:null,
  suppressClick:false,lastActivity:Date.now(),idleTimer:0,avoidTimer:0,
  movingTimer:0,mode:'ACTIVE',config:null,pointer:{x:-9999,y:-9999},observer:null
};

const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const finite=n=>Number.isFinite(Number(n));
const reduced=()=>window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const editorActive=()=>{
  const e=document.activeElement;
  return !!e&&!!e.matches&&e.matches('input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]),textarea,[contenteditable="true"]');
};
function viewport(){
  const v=window.visualViewport;
  return v?{left:v.offsetLeft||0,top:v.offsetTop||0,width:v.width||innerWidth,height:v.height||innerHeight}:{left:0,top:0,width:innerWidth,height:innerHeight};
}
function normalizeConfig(raw){
  const c={version:2,position:null,size:'normal',autoAvoid:true,idleSeconds:120};
  if(raw&&typeof raw==='object'){
    if(raw.size==='compact'||raw.size==='normal')c.size=raw.size;
    if(typeof raw.autoAvoid==='boolean')c.autoAvoid=raw.autoAvoid;
    if(finite(raw.idleSeconds))c.idleSeconds=clamp(Math.round(Number(raw.idleSeconds)),30,600);
    if(raw.position&&finite(raw.position.left)&&finite(raw.position.top))c.position={left:Number(raw.position.left),top:Number(raw.position.top)};
  }
  return c;
}
function loadConfig(){
  try{
    const v=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
    if(v)return normalizeConfig(v);
  }catch{}
  try{
    const old=JSON.parse(localStorage.getItem(LEGACY_KEY)||'null');
    if(old&&finite(old.x)&&finite(old.y)){
      const v=viewport();
      return normalizeConfig({position:{left:Number(old.x)*v.width,top:Number(old.y)*v.height}});
    }
  }catch{}
  return normalizeConfig(null);
}
function saveConfig(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state.config))}catch{}}

function css(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=[
    '#ccEngineerChatLaunch.cc-zordon-v4{position:fixed!important;right:auto!important;bottom:auto!important;z-index:140!important;width:132px!important;height:270px!important;min-width:0!important;min-height:0!important;padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important;overflow:visible!important;pointer-events:auto!important;touch-action:none!important;user-select:none!important;cursor:grab!important;transform-origin:center bottom!important;transition:none!important}',
    '#ccEngineerChatLaunch.cc-zordon-v4.cc-zordon-size-compact{width:94px!important;height:192px!important}',
    '#ccEngineerChatLaunch.cc-zordon-v4.cc-zordon-dragging{cursor:grabbing!important}',
    '#ccEngineerChatLaunch.cc-zordon-v4.cc-zordon-moving{transition:left .46s cubic-bezier(.22,.8,.3,1),top .46s cubic-bezier(.22,.8,.3,1)!important}',
    '#ccEngineerChatLaunch.cc-zordon-v4 .cc-halu-layer{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;max-width:none!important;object-fit:contain!important;object-position:center bottom!important}',
    '#ccEngineerChatLaunch.cc-zordon-v4 .cc-halu-seated-image{display:none!important}',
    '#ccEngineerChatLaunch.cc-zordon-v4.cc-zordon-working .cc-halu-torso,#ccEngineerChatLaunch.cc-zordon-v4.cc-zordon-working .cc-halu-leg{display:none!important}',
    '#ccEngineerChatLaunch.cc-zordon-v4.cc-zordon-working .cc-halu-seated-image{display:block!important;animation:ccZordonDeskWork 2.6s ease-in-out infinite!important}',
    '#ccEngineerChatLaunch.cc-zordon-v4:not(.cc-zordon-working) .cc-halu-walker{animation:ccZordonBreathe 3.8s ease-in-out infinite!important}',
    '#ccEngineerChatLaunch.cc-zordon-v4 .dot{pointer-events:none!important}',
    '#ccEngineerChat.cc-eng-chat{z-index:141!important;right:auto!important;bottom:auto!important;max-width:calc(100vw - 24px)!important;max-height:calc(100vh - 24px)!important}',
    '.cc-zordon-settings-trigger{position:fixed;z-index:142;width:30px;height:30px;border:1px solid rgba(82,118,150,.65);border-radius:999px;background:rgba(8,17,27,.92);color:#cbdcec;display:grid;place-items:center;font:15px/1 system-ui;box-shadow:0 6px 20px rgba(0,0,0,.28);cursor:pointer;opacity:.82}',
    '.cc-zordon-settings-trigger:hover,.cc-zordon-settings-trigger:focus-visible{opacity:1;outline:2px solid #38bdf8;outline-offset:2px}',
    '.cc-zordon-settings-panel{position:fixed;z-index:143;display:none;width:min(340px,calc(100vw - 24px));padding:14px;border:1px solid #29405a;border-radius:14px;background:#08111b;color:#eaf3fc;box-shadow:0 22px 70px rgba(0,0,0,.58);font:12px/1.4 system-ui}',
    '.cc-zordon-settings-panel.open{display:block}',
    '.cc-zordon-settings-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}.cc-zordon-settings-head b{font-size:14px}.cc-zordon-settings-head button{border:0;background:transparent;color:#a8bfd4;font-size:20px;cursor:pointer}',
    '.cc-zordon-setting{display:grid;gap:6px;margin:10px 0}.cc-zordon-setting.inline{grid-template-columns:1fr auto;align-items:center}.cc-zordon-setting select,.cc-zordon-setting input[type="range"]{width:100%}.cc-zordon-setting select{min-height:34px;border:1px solid #29405a;border-radius:8px;background:#0b1826;color:#eef6ff;padding:5px 8px}.cc-zordon-setting small{color:#83a0bb}',
    '.cc-zordon-settings-actions{display:flex;justify-content:flex-end;margin-top:12px}.cc-zordon-settings-actions button{border:1px solid #365571;border-radius:9px;background:#10243b;color:#eaf3fc;padding:8px 10px;cursor:pointer}',
    '@keyframes ccZordonBreathe{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}',
    '@keyframes ccZordonDeskWork{0%,100%{transform:translateY(0)}50%{transform:translateY(-1px)}}',
    '@media(max-width:640px){#ccEngineerChatLaunch.cc-zordon-v4{width:98px!important;height:200px!important}#ccEngineerChatLaunch.cc-zordon-v4.cc-zordon-size-compact{width:78px!important;height:160px!important}#ccEngineerChat.cc-eng-chat{width:calc(100vw - 20px)!important;height:min(78vh,610px)!important}}',
    '@media(prefers-reduced-motion:reduce){#ccEngineerChatLaunch.cc-zordon-v4,#ccEngineerChatLaunch.cc-zordon-v4 *{animation:none!important;transition:none!important}}'
  ].join('\n');
  document.head.appendChild(s);
}
function els(){
  state.launcher=document.getElementById('ccEngineerChatLaunch');
  state.chat=document.getElementById('ccEngineerChat');
  return !!state.launcher;
}
function setMode(mode){
  state.mode=mode;
  const l=state.launcher;if(!l)return;
  l.classList.toggle('cc-zordon-working',mode==='WORKING');
  l.classList.toggle('cc-zordon-dragging',mode==='DRAGGING');
  l.classList.toggle('cc-zordon-moving',mode==='AVOIDING');
  l.dataset.zordonState=mode;
  l.setAttribute('aria-label',mode==='WORKING'?'ZORDON revisando documentación. Activar para abrir el chat.':'Abrir ZORDON');
}
function bounds(){
  const v=viewport(),r=state.launcher&&state.launcher.getBoundingClientRect();
  const w=Math.max(56,r?r.width:132),h=Math.max(80,r?r.height:270);
  return{left:v.left+EDGE,top:v.top+EDGE,right:Math.max(v.left+EDGE,v.left+v.width-w-EDGE),bottom:Math.max(v.top+EDGE,v.top+v.height-h-EDGE),width:w,height:h};
}
function defaultPosition(){const b=bounds();return{left:b.right,top:b.bottom}}
function fit(p){
  const b=bounds();
  if(!p||!finite(p.left)||!finite(p.top))return defaultPosition();
  return{left:clamp(Number(p.left),b.left,b.right),top:clamp(Number(p.top),b.top,b.bottom)};
}
function place(p,save,animate){
  if(!state.launcher)return;
  const n=fit(p);
  if(animate&&!reduced())setMode('AVOIDING');
  state.launcher.style.setProperty('left',Math.round(n.left)+'px','important');
  state.launcher.style.setProperty('top',Math.round(n.top)+'px','important');
  state.launcher.style.setProperty('right','auto','important');
  state.launcher.style.setProperty('bottom','auto','important');
  state.config.position={left:n.left,top:n.top};
  if(save!==false)saveConfig();
  placeSettings();
  if(state.chat&&state.chat.classList.contains('open'))placeChat();
  if(animate&&!reduced()){
    clearTimeout(state.movingTimer);
    state.movingTimer=setTimeout(function(){if(!state.drag)setMode(state.chat&&state.chat.classList.contains('open')?'CHAT_OPEN':'ACTIVE')},520);
  }
}
function placeSettings(){
  const b=state.settingsButton,l=state.launcher;if(!b||!l)return;
  const r=l.getBoundingClientRect(),v=viewport();
  b.style.left=clamp(r.right-26,v.left+6,v.left+v.width-36)+'px';
  b.style.top=clamp(r.top+4,v.top+6,v.top+v.height-36)+'px';
}
function placePanel(panel,anchor){
  if(!panel||!anchor)return;
  const v=viewport(),gap=12,w=Math.min(panel.offsetWidth||390,v.width-24),h=Math.min(panel.offsetHeight||560,v.height-24);
  const space={left:anchor.left-v.left-gap,right:v.left+v.width-anchor.right-gap,top:anchor.top-v.top-gap,bottom:v.top+v.height-anchor.bottom-gap};
  const candidates=[
    {side:'left',fit:space.left>=w,left:anchor.left-w-gap,top:anchor.top+(anchor.height-h)/2},
    {side:'right',fit:space.right>=w,left:anchor.right+gap,top:anchor.top+(anchor.height-h)/2},
    {side:'top',fit:space.top>=h,left:anchor.left+(anchor.width-w)/2,top:anchor.top-h-gap},
    {side:'bottom',fit:space.bottom>=h,left:anchor.left+(anchor.width-w)/2,top:anchor.bottom+gap}
  ];
  let best=candidates.find(function(c){return c.fit});
  if(!best)best=candidates.sort(function(a,b){return space[b.side]-space[a.side]})[0];
  panel.style.left=Math.round(clamp(best.left,v.left+12,v.left+v.width-w-12))+'px';
  panel.style.top=Math.round(clamp(best.top,v.top+12,v.top+v.height-h-12))+'px';
  panel.style.right='auto';panel.style.bottom='auto';
}
function placeChat(){
  if(!state.chat||!state.launcher||!state.chat.classList.contains('open'))return false;
  placePanel(state.chat,state.launcher.getBoundingClientRect());return true;
}
function placeConfig(){
  if(state.settingsPanel&&state.settingsButton&&state.settingsPanel.classList.contains('open'))placePanel(state.settingsPanel,state.settingsButton.getBoundingClientRect());
}
function overlap(a,b){return Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top))}
function critical(){
  return Array.from(document.querySelectorAll('[data-zordon-critical],.modal.open,.modal[open],[role="dialog"],.dropdown-menu.show,.dropdown-menu.open,button,input,textarea,select,[role="button"],[contenteditable="true"],.form-actions,.modal-actions,.toast-actions')).filter(function(el){
    if(!el||el===state.launcher||el===state.settingsButton||el.closest&&el.closest('#ccEngineerChat,.cc-zordon-settings-panel'))return false;
    const r=el.getBoundingClientRect();if(r.width<4||r.height<4)return false;
    const s=getComputedStyle(el);return s.visibility!=='hidden'&&s.display!=='none'&&Number(s.opacity||1)>0;
  });
}
function blocked(rect){
  return critical().reduce(function(sum,el){
    const r=el.getBoundingClientRect(),g=8;
    return sum+overlap(rect,{left:r.left-g,top:r.top-g,right:r.right+g,bottom:r.bottom+g});
  },0);
}
function candidates(){
  const b=bounds(),r=state.launcher.getBoundingClientRect(),current={left:r.left,top:r.top};
  const xs=[b.left,(b.left+b.right)/2,b.right],ys=[b.top,(b.top+b.bottom)/2,b.bottom],out=[];
  xs.forEach(function(left){ys.forEach(function(top){
    const rect={left:left,top:top,right:left+r.width,bottom:top+r.height};
    out.push({left:left,top:top,score:blocked(rect)+Math.hypot(left-current.left,top-current.top)*.08});
  })});
  return out.sort(function(a,b){return a.score-b.score});
}
function avoid(force,reason){
  clearTimeout(state.avoidTimer);
  if(!state.config.autoAvoid||!state.launcher||state.drag||(state.settingsPanel&&state.settingsPanel.classList.contains('open'))||(state.chat&&state.chat.classList.contains('open')))return false;
  if(editorActive()&&reason!=='focus')return false;
  const r=state.launcher.getBoundingClientRect(),score=blocked(r),near=state.pointer.x>=r.left-40&&state.pointer.x<=r.right+40&&state.pointer.y>=r.top-40&&state.pointer.y<=r.bottom+40;
  if(!force&&score<Math.min(500,r.width*r.height*.06)&&!near)return false;
  const best=candidates()[0];if(!best)return false;
  if(!force&&best.score>=score)return false;
  place(best,true,true);return true;
}
function scheduleAvoid(delay,reason,force){
  clearTimeout(state.avoidTimer);
  state.avoidTimer=setTimeout(function(){avoid(!!force,reason||'dom')},delay||180);
}
function workAllowed(){
  return !!state.launcher&&!state.drag&&!editorActive()&&!(state.chat&&state.chat.classList.contains('open'))&&!(state.settingsPanel&&state.settingsPanel.classList.contains('open'))&&state.mode!=='AVOIDING';
}
function enterWork(){
  if(Date.now()-state.lastActivity<state.config.idleSeconds*1000){activity();return}
  if(!workAllowed()){state.idleTimer=setTimeout(enterWork,5000);return}
  setMode('WORKING');
}
function activity(){
  state.lastActivity=Date.now();clearTimeout(state.idleTimer);
  if(state.mode==='WORKING')setMode(state.chat&&state.chat.classList.contains('open')?'CHAT_OPEN':'ACTIVE');
  state.idleTimer=setTimeout(enterWork,state.config.idleSeconds*1000);
}
function applySize(){
  if(state.launcher)state.launcher.classList.toggle('cc-zordon-size-compact',state.config.size==='compact');
}
function createSettings(){
  if(state.settingsButton&&state.settingsButton.isConnected)return;
  const b=document.createElement('button');
  b.type='button';b.className='cc-zordon-settings-trigger';b.textContent='⚙';b.title='Ajustes de ZORDON';b.setAttribute('aria-label','Abrir ajustes de ZORDON');
  const p=document.createElement('section');
  p.className='cc-zordon-settings-panel';p.setAttribute('role','dialog');p.setAttribute('aria-modal','false');p.setAttribute('aria-label','Ajustes de ZORDON');
  p.innerHTML='<div class="cc-zordon-settings-head"><b>Ajustes de ZORDON</b><button type="button" data-zordon-settings-close aria-label="Cerrar ajustes">×</button></div>'+
    '<label class="cc-zordon-setting inline"><span>Esquivar controles automáticamente</span><input type="checkbox" data-zordon-autoavoid></label>'+
    '<label class="cc-zordon-setting"><span>Tamaño</span><select data-zordon-size><option value="compact">Compacto</option><option value="normal">Normal</option></select></label>'+
    '<label class="cc-zordon-setting"><span>Modo trabajo después de <b data-zordon-idle-label></b></span><input type="range" min="30" max="600" step="30" data-zordon-idle><small>Se activa solo cuando realmente no estás trabajando en la página.</small></label>'+
    '<div class="cc-zordon-settings-actions"><button type="button" data-zordon-reset>Restaurar posición y configuración inicial</button></div>';
  document.body.append(b,p);state.settingsButton=b;state.settingsPanel=p;
  const auto=p.querySelector('[data-zordon-autoavoid]'),size=p.querySelector('[data-zordon-size]'),idle=p.querySelector('[data-zordon-idle]'),label=p.querySelector('[data-zordon-idle-label]');
  function sync(){
    auto.checked=state.config.autoAvoid;size.value=state.config.size;idle.value=String(state.config.idleSeconds);
    label.textContent=state.config.idleSeconds<60?state.config.idleSeconds+' s':Math.round(state.config.idleSeconds/60)+' min';
  }
  b.addEventListener('click',function(e){e.stopPropagation();p.classList.toggle('open');if(p.classList.contains('open')){setMode('SETTINGS_OPEN');sync();placeConfig()}else{setMode('ACTIVE');activity()}});
  p.querySelector('[data-zordon-settings-close]').addEventListener('click',function(){p.classList.remove('open');setMode('ACTIVE');activity()});
  auto.addEventListener('change',function(){state.config.autoAvoid=auto.checked;saveConfig();if(auto.checked)scheduleAvoid(60,'settings',true)});
  size.addEventListener('change',function(){state.config.size=size.value==='compact'?'compact':'normal';saveConfig();applySize();place(state.config.position||defaultPosition(),true,false);placeConfig()});
  idle.addEventListener('input',function(){state.config.idleSeconds=clamp(Number(idle.value)||120,30,600);sync();saveConfig();activity()});
  p.querySelector('[data-zordon-reset]').addEventListener('click',function(){state.config=normalizeConfig(DEFAULTS);saveConfig();applySize();place(defaultPosition(),true,false);sync();p.classList.remove('open');setMode('ACTIVE');activity()});
  sync();placeSettings();
}
function bindDrag(){
  const l=state.launcher;if(!l||l.dataset.zordonBound==='4')return;
  l.dataset.zordonBound='4';
  l.addEventListener('pointerdown',function(e){
    if(e.button!==0)return;
    const r=l.getBoundingClientRect();
    state.drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,dx:e.clientX-r.left,dy:e.clientY-r.top,moved:false};
    try{l.setPointerCapture(e.pointerId)}catch{}
    activity();
  },true);
  l.addEventListener('pointermove',function(e){
    const d=state.drag;if(!d||d.id!==e.pointerId)return;
    if(!d.moved&&Math.hypot(e.clientX-d.startX,e.clientY-d.startY)<DRAG_DELTA)return;
    d.moved=true;setMode('DRAGGING');
    const b=bounds(),left=clamp(e.clientX-d.dx,b.left,b.right),top=clamp(e.clientY-d.dy,b.top,b.bottom);
    l.style.setProperty('left',Math.round(left)+'px','important');l.style.setProperty('top',Math.round(top)+'px','important');
    state.config.position={left:left,top:top};placeSettings();if(state.chat&&state.chat.classList.contains('open'))placeChat();e.preventDefault();
  },true);
  function finish(e){
    const d=state.drag;if(!d||d.id!==e.pointerId)return;
    state.suppressClick=d.moved;state.drag=null;
    if(d.moved){saveConfig();setMode('ACTIVE');setTimeout(function(){state.suppressClick=false},120)}
    activity();
  }
  l.addEventListener('pointerup',finish,true);l.addEventListener('pointercancel',finish,true);
  l.addEventListener('click',function(e){
    if(state.suppressClick){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();state.suppressClick=false;return}
    activity();setTimeout(function(){if(state.chat&&state.chat.classList.contains('open')){setMode('CHAT_OPEN');placeChat()}else setMode('ACTIVE')},0);
  },true);
  l.addEventListener('keydown',function(e){
    const step={ArrowLeft:[-20,0],ArrowRight:[20,0],ArrowUp:[0,-20],ArrowDown:[0,20]}[e.key];
    if(!step)return;e.preventDefault();const r=l.getBoundingClientRect();place({left:r.left+step[0],top:r.top+step[1]},true,false);activity();
  });
}
function context(){
  let screen='',tab='',projectId=null,projectName='';
  try{
    screen=window.view&&window.view.screen||'';tab=window.view&&window.view.tab||'';projectId=window.view&&window.view.projectId||null;
    const projects=window.db&&Array.isArray(window.db.projects)?window.db.projects:[];
    projectName=projectId&&projects.find(function(p){return p&&p.id===projectId})?.name||'';
  }catch{}
  const c={module:screen||'inicio',tab:tab,projectId:projectId,projectName:projectName,route:location.hash||location.pathname};
  window.__ccZordonContext=c;return c;
}
function bindGlobal(){
  if(document.documentElement.dataset.zordonPresenceGlobal==='4')return;
  document.documentElement.dataset.zordonPresenceGlobal='4';
  ['pointerdown','keydown','wheel','touchstart','input','change'].forEach(function(type){document.addEventListener(type,activity,{capture:true,passive:type!=='keydown'})});
  document.addEventListener('scroll',activity,{capture:true,passive:true});
  document.addEventListener('focusin',function(e){activity();if(e.target&&e.target.matches&&e.target.matches('input,textarea,select,[contenteditable="true"],button,[role="button"]'))scheduleAvoid(20,'focus',true)},true);
  document.addEventListener('pointermove',function(e){
    state.pointer={x:e.clientX,y:e.clientY};
    if(!state.config.autoAvoid||state.drag||editorActive())return;
    const r=state.launcher&&state.launcher.getBoundingClientRect();
    if(r&&e.clientX>=r.left-36&&e.clientX<=r.right+36&&e.clientY>=r.top-36&&e.clientY<=r.bottom+36)scheduleAvoid(160,'pointer',true);
  },{passive:true});
  document.addEventListener('keydown',function(e){
    if(e.key!=='Escape')return;
    if(state.settingsPanel&&state.settingsPanel.classList.contains('open')){state.settingsPanel.classList.remove('open');setMode('ACTIVE');return}
    if(state.chat&&state.chat.classList.contains('open')){state.chat.classList.remove('open');setMode('ACTIVE');state.launcher&&state.launcher.focus()}
  },true);
  function viewportChanged(){if(!state.launcher)return;place(state.config.position||defaultPosition(),true,false);placeChat();placeConfig()}
  window.addEventListener('resize',viewportChanged,{passive:true});
  window.addEventListener('orientationchange',function(){setTimeout(viewportChanged,120)},{passive:true});
  if(window.visualViewport){window.visualViewport.addEventListener('resize',viewportChanged,{passive:true});window.visualViewport.addEventListener('scroll',viewportChanged,{passive:true})}
  window.addEventListener('cc:route-changed',function(){context();scheduleAvoid(120,'route',false)});
}
function command(text){
  const q=String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  if(/\b(quieto|detente|deja de moverte|no te muevas)\b/.test(q)){state.config.autoAvoid=false;saveConfig();return'Me quedo fijo. Puedes volver a activar “esquivar controles” en mis ajustes.'}
  if(/\b(modo autonomo|recorre|camina por la pantalla)\b/.test(q))return'Ya no camino sin motivo. Solo me aparto cuando cubro un control importante.';
  if(/no te veo|aparece|ven aca/.test(q)){place(defaultPosition(),true,true);return'Aquí estoy. Me quedo visible y fuera del área de trabajo.'}
  return'';
}
function point(name){
  const q=String(name||'').trim().toLowerCase();if(!q)return false;
  const nodes=Array.from(document.querySelectorAll('button,[data-tab],[data-nav],[data-ccx],a,h1,h2,h3')).filter(function(el){return el!==state.launcher&&el.offsetParent!==null});
  const el=nodes.find(function(el){return (el.textContent||'').trim().toLowerCase().includes(q)});if(!el)return false;
  el.scrollIntoView({behavior:reduced()?'auto':'smooth',block:'center'});
  setTimeout(function(){const r=el.getBoundingClientRect(),lr=state.launcher.getBoundingClientRect();place({left:r.left>innerWidth/2?r.left-lr.width-EDGE:r.right+EDGE,top:r.top+r.height/2-lr.height/2},true,true);if(el.animate)el.animate([{outline:'0 solid transparent'},{outline:'4px solid rgba(56,189,248,.65)'},{outline:'0 solid transparent'}],{duration:1200})},350);
  return true;
}
function moveTo(x,y){place({left:Number(x)||EDGE,top:Number(y)||EDGE},true,true);return true}
function placeNext(){
  if(!state.launcher)return false;
  if(state.chat)state.chat.classList.remove('open');
  function pick(e){
    if(e.target.closest&&e.target.closest('#ccEngineerChat,#ccEngineerChatLaunch,.cc-zordon-settings-panel,.cc-zordon-settings-trigger'))return;
    e.preventDefault();e.stopPropagation();document.removeEventListener('pointerdown',pick,true);
    const r=state.launcher.getBoundingClientRect();place({left:e.clientX-r.width/2,top:e.clientY-r.height/2},true,false);activity();
  }
  document.addEventListener('pointerdown',pick,true);return true;
}
function mount(){
  css();state.config=state.config||loadConfig();
  if(!els())return false;
  state.launcher.classList.add('cc-zordon-v4');state.launcher.setAttribute('data-zordon-permanent','true');
  applySize();bindDrag();createSettings();bindGlobal();context();place(state.config.position||defaultPosition(),true,false);activity();scheduleAvoid(600,'mount',false);return true;
}
let mountQueued=false;
function scheduleMount(){
  if(mountQueued)return;mountQueued=true;
  requestAnimationFrame(function(){mountQueued=false;if(mount())scheduleAvoid(120,'dom',false)});
}
const NativeObserver=window.__ccNativeMutationObserver||window.MutationObserver;
if(NativeObserver){
  state.observer=new NativeObserver(function(mutations){
    let relevant=false;
    mutations.some(function(m){return Array.from(m.addedNodes||[]).some(function(n){
      if(n.nodeType!==1)return false;
      if((n.matches&&n.matches('#ccEngineerChat,#ccEngineerChatLaunch,[role="dialog"],.modal,.dropdown-menu,[data-zordon-critical]'))||(n.querySelector&&n.querySelector('#ccEngineerChat,#ccEngineerChatLaunch,[role="dialog"],.modal,.dropdown-menu,[data-zordon-critical]'))){relevant=true;return true}
      return false;
    })});
    if(relevant)scheduleMount();
  });
  state.observer.observe(document.documentElement,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scheduleMount,{once:true});else scheduleMount();
setTimeout(scheduleMount,250);setTimeout(scheduleMount,900);

window.__ccHaluAvatar={
  command:command,moveTo:moveTo,point:point,placeNext:placeNext,roam:function(){return false},
  repositionChat:placeChat,avoidObstruction:function(){return avoid(true,'api')},moveOutOfWay:function(){return avoid(true,'api')}
};
window.__ccZordonAvatar={
  context:context,
  settings:function(){if(state.settingsButton)state.settingsButton.click()},
  reset:function(){state.config=normalizeConfig(DEFAULTS);saveConfig();applySize();place(defaultPosition(),true,false);activity()},
  status:function(){return{permanent:true,state:state.mode,config:Object.assign({},state.config),context:context()}}
};
})();