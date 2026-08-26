/* ===== CONTROL CONTRACTUAL · REPARACIONES FUNCIONALES V1 ===== */
(()=>{
'use strict';
if(window.__CC_FUNCTIONAL_REPAIR_V1__)return;
window.__CC_FUNCTIONAL_REPAIR_V1__=true;

const STYLE_ID='cc-functional-repair-v1-style';
const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function installStyle(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');
  s.id=STYLE_ID;
  s.textContent=`
  /* Las cinco áreas principales permanecen ordenadas en una sola fila en PC y tablet horizontal. */
  @media (min-width:821px){
    html body:not(.print-report) .service-strip{
      display:grid!important;
      grid-template-columns:repeat(5,minmax(0,1fr))!important;
      gap:9px!important;
      align-items:stretch!important;
    }
    html body:not(.print-report) .service-strip .service-tile{min-width:0!important;width:auto!important;max-width:none!important}
  }
  .cc-stable-quick{display:flex;flex-wrap:wrap;gap:6px;margin:2px 0 5px}
  .cc-stable-quick button{border:1px solid #294866;border-radius:999px;background:#0c1a29;color:#b8d5ee;padding:7px 9px;font-size:9px;cursor:pointer}
  .cc-stable-quick button:hover,.cc-stable-quick button:focus-visible{border-color:#38bdf8;color:#fff;outline:none}
  #ccAccessRequestsBtn.has-pending{border-color:#d5a51d!important;background:#fff8da!important;color:#5d4a0a!important}
  .cc-access-count{display:inline-grid;place-items:center;min-width:20px;height:20px;margin-left:5px;padding:0 6px;border-radius:999px;background:#b42318;color:#fff;font-size:10px;font-weight:900;line-height:1}
  `;
  document.head.appendChild(s);
}

function canReviewAccess(){
  try{return String(cloudRole||'')==='admin'&&!!session?.accessToken&&!window.__ccGuestMode?.isActive?.()}catch{return false}
}

async function directApi(path,{method='GET',body}={}){
  const token=(()=>{try{return session?.accessToken||''}catch{return''}})();
  if(!token)throw new Error('Sesión administrativa no disponible.');
  const response=await fetch(SUPABASE_URL+path,{
    method,
    headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
    body:body===undefined?undefined:JSON.stringify(body),
    cache:'no-store'
  });
  const text=await response.text();
  let data=null;
  try{data=text?JSON.parse(text):null}catch{data=text}
  if(!response.ok)throw new Error(data?.message||data?.error||'No se pudo completar la operación.');
  return data;
}

function accessButton(){
  let button=document.getElementById('ccAccessRequestsBtn');
  if(button||!canReviewAccess())return button;
  const team=document.getElementById('ccTeamBtn');
  if(!team?.parentElement)return null;
  button=document.createElement('button');
  button.id='ccAccessRequestsBtn';button.type='button';button.className='btn';button.textContent='Solicitudes';
  team.parentElement.insertBefore(button,team);
  return button;
}

async function pendingRows(){
  const data=await directApi('/rest/v1/access_requests?select=id,full_name,email,phone,position,requested_role,status,requested_at,notification_sent&status=eq.pending&order=requested_at.desc&limit=50');
  return Array.isArray(data)?data:[];
}
async function allRequestRows(){
  const data=await directApi('/rest/v1/access_requests?select=id,full_name,email,phone,position,requested_role,status,requested_at,notification_sent&status=in.(pending,approved)&order=requested_at.desc&limit=50');
  return Array.isArray(data)?data:[];
}

function renderAccessNotice(rows){
  if(!canReviewAccess())return;
  const pending=Array.isArray(rows)?rows.filter(x=>x?.status==='pending'):[],count=pending.length;
  const button=accessButton();
  if(button){
    button.classList.toggle('has-pending',count>0);
    button.innerHTML=count?`Solicitudes <span class="cc-access-count" aria-label="${count} pendiente${count===1?'':'s'}">${count}</span>`:'Solicitudes';
    button.title=count?`${count} solicitud${count===1?'':'es'} pendiente${count===1?'':'s'}`:'No hay solicitudes pendientes';
    button.onclick=openAccessModal;
  }
  let notice=document.querySelector('.cc-access-request-notice');
  if(!count){notice?.remove();return}
  const shell=document.querySelector('#app .shell');
  if(!shell)return;
  if(!notice){notice=document.createElement('aside');notice.className='cc-access-request-notice';notice.setAttribute('role','status');shell.prepend(notice)}
  notice.innerHTML=`<div><b>${count===1?'Nueva solicitud de usuario':`${count} solicitudes nuevas de usuarios`}</b><small>${count===1?`${E(pending[0]?.full_name||'Un usuario')} solicita autorización de acceso.`:'Revise quién solicita acceso y autorice o rechace cada cuenta.'}</small></div><div class="actions"><button type="button" class="btn primary" data-access-open>Revisar y autorizar</button><button type="button" class="btn" data-access-dismiss aria-label="Cerrar aviso">×</button></div>`;
  notice.querySelector('[data-access-open]').onclick=openAccessModal;
  notice.querySelector('[data-access-dismiss]').onclick=()=>notice.remove();
}

let accessBusy=false;
async function refreshAccess(){
  if(document.hidden||!canReviewAccess()||accessBusy)return;
  accessBusy=true;
  try{renderAccessNotice(await pendingRows())}catch(error){console.warn('Control de solicitudes:',error?.message||error)}finally{accessBusy=false}
}
function settleAccessRefresh(){
  [30,650,1750].forEach(delay=>setTimeout(refreshAccess,delay));
}

async function openAccessModal(){
  if(!canReviewAccess()||typeof openModal!=='function')return;
  const modal=openModal('Solicitudes y accesos','<div class="alert info">Revise cada solicitud antes de autorizar el acceso. Los códigos son personales, temporales y quedan vinculados al correo aprobado.</div><div id="ccRepairRequests"><div class="empty">Cargando solicitudes…</div></div>');
  const host=modal.querySelector('#ccRepairRequests');
  try{
    const rows=await allRequestRows();
    host.innerHTML=rows.length?rows.map(x=>`<article class="panel" style="margin-bottom:9px" data-request="${E(x.id)}"><div class="row spread wrap"><div><h3 style="margin-bottom:3px">${E(x.full_name||'Usuario')}</h3><div class="muted">${E(x.email||'')}${x.phone?' · '+E(x.phone):''}</div><small class="muted">${E(x.position||'Cargo no indicado')} · ${x.requested_role==='editor'?'Editor':'Solo consulta'}</small></div><span class="status ${x.status==='approved'?'good':'warn'}">${x.status==='approved'?'APROBADA':'PENDIENTE'}</span></div><div class="actions">${x.status==='pending'?`<button type="button" class="btn primary" data-approve="${E(x.id)}">Aprobar y generar código</button><button type="button" class="btn danger" data-reject="${E(x.id)}">Rechazar</button>`:`<button type="button" class="btn primary" data-approve="${E(x.id)}">Ver código</button>`}</div><div class="invite-output"></div></article>`).join(''):'<div class="empty">No hay solicitudes pendientes.</div>';

    host.querySelectorAll('[data-approve]').forEach(button=>button.onclick=async()=>{
      button.disabled=true;
      try{
        const data=await directApi('/rest/v1/rpc/approve_access_request',{method:'POST',body:{p_request_id:button.dataset.approve,p_days:3}});
        const x=Array.isArray(data)?data[0]:data;
        if(!x?.invite_code)throw new Error('No se recibió el código de autorización.');
        const card=button.closest('[data-request]'),out=card.querySelector('.invite-output');
        out.innerHTML=`<div class="alert good" style="margin-top:9px"><small>CÓDIGO PERSONAL PARA ${E(x.email||'')}</small><div style="font-size:20px;font-weight:900;letter-spacing:.1em;margin:5px 0">${E(x.invite_code)}</div><small>Vence ${x.expires_at?new Date(x.expires_at).toLocaleString('es-HN'):''} · ${x.role==='editor'?'Editor':'Solo consulta'}</small><div class="actions"><button type="button" class="btn" data-copy>Copiar código</button></div></div>`;
        out.querySelector('[data-copy]').onclick=()=>navigator.clipboard?.writeText(x.invite_code).then(()=>toast?.('Código copiado.')).catch(()=>{});
        button.textContent='Ver código';
        const status=card.querySelector('.status');if(status){status.className='status good';status.textContent='APROBADA'}
        card.querySelector('[data-reject]')?.remove();
        settleAccessRefresh();
      }catch(error){try{toast(error.message||'No se pudo aprobar la solicitud.')}catch{}}
      finally{button.disabled=false}
    });

    host.querySelectorAll('[data-reject]').forEach(button=>button.onclick=async()=>{
      if(!confirm('¿Rechazar esta solicitud de acceso?'))return;
      button.disabled=true;
      try{
        await directApi('/rest/v1/rpc/reject_access_request',{method:'POST',body:{p_request_id:button.dataset.reject}});
        button.closest('[data-request]')?.remove();
        settleAccessRefresh();
        try{toast('Solicitud rechazada.')}catch{}
      }catch(error){button.disabled=false;try{toast(error.message||'No se pudo rechazar la solicitud.')}catch{}}
    });
  }catch(error){host.innerHTML=`<div class="alert danger">${E(error.message||'No se pudieron cargar las solicitudes.')}</div>`}
}

function loadScript(src,predicate){
  if(predicate())return Promise.resolve();
  return new Promise((resolve,reject)=>{
    const existing=[...document.scripts].find(s=>(s.src||'').includes('/'+src.split('?')[0]));
    if(existing){existing.addEventListener('load',()=>predicate()?resolve():reject(new Error(`No se inicializó ${src}`)),{once:true});existing.addEventListener('error',()=>reject(new Error(`No se pudo cargar ${src}`)),{once:true});return}
    const script=document.createElement('script');
    script.src=`${src}${src.includes('?')?'&':'?'}v=repair3`;
    script.onload=()=>predicate()?resolve():reject(new Error(`No se inicializó ${src}`));
    script.onerror=()=>reject(new Error(`No se pudo cargar ${src}`));
    document.head.appendChild(script);
  });
}

async function openLegalQuick(){
  try{
    if(window.__ccLazyFeatures?.loadLegal)await window.__ccLazyFeatures.loadLegal();
    else{
      await loadScript('law-knowledge-v1.js',()=>!!window.__CC_LAW_KNOWLEDGE__);
      await loadScript('legal-assistant-v2.js',()=>!!window.__ccLegalKnowledge);
    }
    if(window.__ccZordonChatUI?.send)await window.__ccZordonChatUI.send('¿Qué regula la garantía de cumplimiento?');
  }catch(error){console.warn('Consulta legal rápida:',error?.message||error)}
}

function ensureStableQuick(){
  const chat=document.getElementById('ccEngineerChat'),body=chat?.querySelector('.cc-eng-chat-body');
  if(!body||body.querySelector('.cc-stable-quick'))return;
  const quick=document.createElement('div');quick.className='cc-stable-quick';
  quick.innerHTML='<button type="button" data-q="¿Qué regula la garantía de cumplimiento?">Consulta legal</button>';
  quick.querySelector('button').onclick=openLegalQuick;
  body.appendChild(quick);
}

let pendingNameIntro=null,lastNameIntroKey='';
function normalizePersonName(value){
  return String(value||'').trim().replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ'’-]/g,'').slice(0,32).replace(/^./,c=>c.toUpperCase());
}
function detectNameIntro(){
  const chat=document.getElementById('ccEngineerChat');if(!chat)return;
  const user=[...chat.querySelectorAll('.cc-eng-msg.user')].at(-1);if(!user)return;
  const text=String(user.textContent||'').trim();
  const match=text.match(/\b(?:me llamo|mi nombre es)\s+([A-Za-zÁÉÍÓÚÜÑáéíóúüñ'’-]{2,32})\b/i);if(!match)return;
  const name=normalizePersonName(match[1]);if(!name)return;
  const key=`${text}|${name}`;if(lastNameIntroKey===key||pendingNameIntro?.key===key)return;
  pendingNameIntro={key,name,started:Date.now()};
  try{if(window.__ccEngineerChat?.conversation)window.__ccEngineerChat.conversation.userName=name}catch{}
}
function applyNameIntro(){
  if(!pendingNameIntro)return;
  const chat=document.getElementById('ccEngineerChat'),body=chat?.querySelector('.cc-eng-chat-body');if(!body)return;
  const bots=[...body.querySelectorAll('.cc-eng-msg.bot')];
  const bot=bots.at(-1);if(!bot)return;
  if(bot.dataset.zordonTyping==='1'||/pensando|revisando el contexto/i.test(bot.textContent||''))return;
  const {key,name}=pendingNameIntro;
  const reply=`Mucho gusto, ${name}. ¿Cómo estás? Cuéntame qué estás revisando y seguimos desde ahí.`;
  bot.textContent=reply;
  try{
    const conversation=window.__ccEngineerChat?.conversation;
    if(conversation){
      conversation.userName=name;
      conversation.history=Array.isArray(conversation.history)?conversation.history:[];
      const last=conversation.history.at(-1);
      if(last?.role==='assistant')last.text=reply;
      else conversation.history.push({role:'assistant',text:reply});
    }
  }catch{}
  lastNameIntroKey=key;pendingNameIntro=null;
}
function repairConversationContinuity(){
  detectNameIntro();
  if(!pendingNameIntro)return;
  applyNameIntro();
  if(pendingNameIntro&&Date.now()-pendingNameIntro.started<12000)setTimeout(applyNameIntro,90);
}

let scheduled=false;
function repair(){
  installStyle();
  ensureStableQuick();
  repairConversationContinuity();
  if(canReviewAccess()){
    const button=accessButton();if(button)button.onclick=openAccessModal;
  }
}
function scheduleRepair(){
  if(scheduled)return;scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;repair()});
}
function attachObserver(){
  const root=document.getElementById('app')||document.body;
  if(!root)return null;
  const observer=new MutationObserver(scheduleRepair);
  observer.observe(root,{childList:true,subtree:true});
  return observer;
}

installStyle();repair();
setTimeout(()=>{repair();refreshAccess()},160);
setTimeout(()=>{repair();refreshAccess()},850);
const observer=attachObserver();
const accessTimer=setInterval(()=>{if(!document.hidden)refreshAccess()},60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){repair();refreshAccess()}});
window.addEventListener('pagehide',()=>{clearInterval(accessTimer);observer?.disconnect?.()},{once:true});
window.__ccFunctionalRepair={refreshAccess,openAccessModal,openLegalQuick,repairConversationContinuity,version:3};
})();
