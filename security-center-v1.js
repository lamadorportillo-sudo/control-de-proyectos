/* ===== CENTRO DE SEGURIDAD Y ACCESOS V1 ===== */
(()=>{
'use strict';
if(window.__CC_SECURITY_CENTER_V1__)return;window.__CC_SECURITY_CENTER_V1__=true;
const E=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const A=v=>Array.isArray(v)?v:[];
const apiEndpoint=()=>`${SUPABASE_URL}/functions/v1/manage-users`;
const headers=()=>({apikey:SUPABASE_KEY,Authorization:`Bearer ${session?.accessToken||''}`,'Content-Type':'application/json'});
async function call(action,payload={}){const r=await fetch(apiEndpoint(),{method:'POST',headers:headers(),body:JSON.stringify({action,...payload}),cache:'no-store'});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'No se pudo consultar la seguridad.');return d}
const DT=v=>{try{return v?new Date(v).toLocaleString('es-HN',{dateStyle:'short',timeStyle:'short'}):'—'}catch{return v||'—'}};
const ago=v=>{if(!v)return'—';const n=Date.now()-new Date(v).getTime();if(!Number.isFinite(n))return'—';if(n<60000)return'ahora';if(n<3600000)return`${Math.floor(n/60000)} min`;if(n<86400000)return`${Math.floor(n/3600000)} h`;return`${Math.floor(n/86400000)} d`};
const labels={login_success:'Ingreso correcto',login_failure:'Intento fallido',login_blocked:'Ingreso bloqueado',login_rate_limited:'Límite de intentos',logout:'Cierre de sesión',session_revoked:'Sesiones cerradas por administrador',account_disabled:'Usuario desactivado',account_reactivated:'Usuario reactivado',password_reset_by_admin:'Clave temporal restablecida',password_changed:'Contraseña personal actualizada',user_created:'Usuario creado'};
function css(){if(document.getElementById('cc-security-center-style'))return;const s=document.createElement('style');s.id='cc-security-center-style';s.textContent=`
.cc-sec-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin:0 0 14px}.cc-sec-kpi{border:1px solid var(--line);border-radius:13px;background:#0a1119;padding:12px}.cc-sec-kpi small{display:block;color:var(--muted);font-size:10px}.cc-sec-kpi strong{display:block;font-size:22px;margin-top:5px}.cc-sec-kpi.warn{border-color:#665b1d;background:#211d0c}.cc-sec-kpi.danger{border-color:#6d2a2a;background:#241011}.cc-sec-toolbar{display:flex;justify-content:space-between;gap:8px;align-items:center;flex-wrap:wrap;margin:0 0 12px}.cc-sec-list{display:grid;gap:8px}.cc-sec-row{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(120px,.8fr) minmax(120px,.8fr) auto;gap:9px;align-items:center;border:1px solid var(--line);border-radius:12px;background:#0a1119;padding:10px}.cc-sec-row small{display:block;color:var(--muted);font-size:9px}.cc-sec-event{display:grid;grid-template-columns:125px minmax(0,1.3fr) minmax(0,1fr) 110px;gap:9px;align-items:center;padding:9px 4px;border-bottom:1px solid #1b2636}.cc-sec-event:last-child{border-bottom:0}.cc-sec-dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px;background:#22c55e}.cc-sec-dot.warning{background:#eab308}.cc-sec-dot.critical{background:#ef4444}.cc-sec-section{margin-top:14px}.cc-sec-section>h3{margin-bottom:8px}.cc-sec-note{font-size:10px;color:var(--muted)}
@media(max-width:760px){.cc-sec-kpis{grid-template-columns:1fr 1fr}.cc-sec-row,.cc-sec-event{grid-template-columns:1fr 1fr}.cc-sec-row .actions{grid-column:1/-1}.cc-sec-event>div:nth-child(2){grid-column:1/-1;grid-row:1}}
@media(max-width:440px){.cc-sec-kpis,.cc-sec-row,.cc-sec-event{grid-template-columns:1fr}.cc-sec-event>div:nth-child(2){grid-column:auto;grid-row:auto}}
`;document.head.appendChild(s)}
function sessionState(s){if(s.revoked_at)return['CERRADA POR SEGURIDAD','danger'];if(s.ended_at)return['CERRADA',''];if(Date.now()-new Date(s.last_seen_at).getTime()<=15*60000)return['ACTIVA','good'];return['SIN ACTIVIDAD','warn']}

async function securityCenterModal(){
 css();
 const m=openModal('Seguridad y accesos',`<div class="alert info"><b>Control de acceso en tiempo real.</b> Aquí se registran ingresos correctos, intentos fallidos, dispositivos aproximados y sesiones. Cerrar sesiones obliga al usuario a autenticarse nuevamente.</div><div id="ccSecurityCenter"><div class="empty">Consultando eventos de seguridad…</div></div>`);
 const host=m.querySelector('#ccSecurityCenter');
 async function load(){
  host.innerHTML='<div class="empty">Actualizando seguridad…</div>';
  try{
   const d=await call('security_overview'),s=d.summary||{},users=A(d.users),sessions=A(d.sessions),events=A(d.events),userMap=new Map(users.map(u=>[u.user_id,u]));
   const active=sessions.filter(x=>!x.ended_at&&!x.revoked_at).slice(0,30);
   host.innerHTML=`<div class="cc-sec-toolbar"><div><b>Estado de seguridad</b><div class="cc-sec-note">Actualizado ${new Date().toLocaleTimeString('es-HN',{hour:'2-digit',minute:'2-digit'})}. Los dispositivos son identificaciones aproximadas del navegador y sistema operativo.</div></div><div class="actions"><button class="btn" data-sec-refresh>Actualizar</button>${typeof adminUsersModal==='function'?'<button class="btn" data-sec-users>Usuarios</button>':''}</div></div>
   <section class="cc-sec-kpis"><div class="cc-sec-kpi"><small>Ingresos correctos · 24 h</small><strong>${Number(s.success_24h)||0}</strong></div><div class="cc-sec-kpi ${(Number(s.failed_24h)||0)>0?'warn':''}"><small>Intentos fallidos · 24 h</small><strong>${Number(s.failed_24h)||0}</strong></div><div class="cc-sec-kpi"><small>Sesiones activas</small><strong>${Number(s.active_sessions)||0}</strong></div><div class="cc-sec-kpi ${(Number(s.restricted_users)||0)>0?'danger':''}"><small>Usuarios restringidos</small><strong>${Number(s.restricted_users)||0}</strong></div></section>
   <section class="cc-sec-section"><h3>Sesiones recientes</h3><div class="cc-sec-list">${active.length?active.map(x=>{const u=userMap.get(x.user_id)||{},st=sessionState(x),self=x.user_id===session?.userId;return`<div class="cc-sec-row"><div><b>${E(u.full_name||x.email||'Usuario')}</b><small>${E(x.email||u.email||'')} · ${E(u.role||'')}</small></div><div><small>Dispositivo</small><b>${E(x.device_label||'No identificado')}</b></div><div><small>Última actividad</small><b>${E(ago(x.last_seen_at))}</b><small>${E(DT(x.started_at))}</small></div><div class="actions"><span class="status ${st[1]}">${st[0]}</span>${self?'':`<button class="btn danger" data-sec-revoke="${E(x.user_id)}" data-sec-name="${E(u.full_name||x.email||'usuario')}">Cerrar sesiones</button>`}</div></div>`}).join(''):'<div class="empty">No hay sesiones abiertas registradas.</div>'}</div></section>
   <section class="cc-sec-section"><h3>Actividad de acceso</h3><div class="panel" style="padding:8px 12px"><div class="cc-sec-list">${events.length?events.slice(0,60).map(x=>{const u=userMap.get(x.user_id)||{},sev=x.severity||(!x.success?'warning':'info');return`<div class="cc-sec-event"><div><small>Fecha</small><b>${E(DT(x.created_at))}</b></div><div><b><span class="cc-sec-dot ${E(sev)}"></span>${E(labels[x.event_type]||x.event_type||'Evento')}</b><small>${E(u.full_name||x.email||'Cuenta no identificada')}</small></div><div><small>Dispositivo</small><b>${E(x.device_label||'No identificado')}</b></div><div><span class="status ${x.success?'good':sev==='critical'?'danger':'warn'}">${x.success?'CORRECTO':'REVISAR'}</span></div></div>`}).join(''):'<div class="empty">Todavía no hay eventos de acceso registrados.</div>'}</div></div></section>`;
   host.querySelector('[data-sec-refresh]')?.addEventListener('click',load);
   host.querySelector('[data-sec-users]')?.addEventListener('click',()=>adminUsersModal());
   host.querySelectorAll('[data-sec-revoke]').forEach(b=>b.onclick=async()=>{const name=b.dataset.secName||'este usuario';if(!confirm(`¿Cerrar todas las sesiones actuales de ${name}? Deberá ingresar nuevamente con su contraseña.`))return;b.disabled=true;try{await call('revoke_sessions',{user_id:b.dataset.secRevoke});toast('Sesiones cerradas. El usuario deberá autenticarse nuevamente.');await load()}catch(e){toast(e.message)}finally{b.disabled=false}});
  }catch(e){host.innerHTML=`<div class="alert danger"><b>No se pudo cargar el panel de seguridad.</b><br>${E(e.message)}</div>`}
 }
 await load();
}

function bind(){
 if(!session?.accessToken||String(cloudRole||'')!=='admin')return document.getElementById('ccSecurityBtn')?.remove();
 if(document.getElementById('ccSecurityBtn'))return;
 const anchor=document.getElementById('ccTeamBtn'),host=anchor?.parentElement||document.querySelector('.top-actions');if(!host)return;
 const b=document.createElement('button');b.id='ccSecurityBtn';b.className='btn';b.type='button';b.textContent='Seguridad';b.title='Ingresos, intentos fallidos y sesiones';b.onclick=securityCenterModal;
 anchor?host.insertBefore(b,anchor):host.appendChild(b);
}
try{if(typeof renderApp==='function'&&!renderApp.__securityCenter){const base=renderApp;renderApp=function(){const r=base.apply(this,arguments);setTimeout(bind,0);return r};renderApp.__securityCenter=true}}catch(e){console.warn(e)}
new MutationObserver(bind).observe(document.documentElement,{subtree:true,childList:true});setTimeout(bind,0);
window.securityCenterModal=securityCenterModal;
})();
