/* ===== CONTROL CONTRACTUAL · EQUIPO, INVITACIONES Y RECUPERACIÓN OFFLINE V2 ===== */
(()=>{
'use strict';
if(window.__CC_WORKSPACE_ACCESS_V2__)return;
window.__CC_WORKSPACE_ACCESS_V2__=true;

const H=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const say=m=>{try{toast(m)}catch{console.log(m)}};
const scopedStoreKey=()=>{try{return cloudWorkspaceId&&session?.userId?`${STORE}:${cloudWorkspaceId}:${session.userId}`:null}catch{return null}};
const pendingKey=()=>{const k=scopedStoreKey();return k?`cc_pending_sync:${k}`:'cc_pending_sync'};

function markPending(){
  try{localStorage.setItem(pendingKey(),'1')}catch{}
}
function clearPending(){
  try{localStorage.removeItem(pendingKey());localStorage.removeItem('cc_pending_sync')}catch{}
}
function hasPending(){
  try{return localStorage.getItem(pendingKey())==='1'||localStorage.getItem('cc_pending_sync')==='1'}catch{return false}
}
function pendingSnapshot(){
  const key=scopedStoreKey();if(!key)return null;
  try{const x=JSON.parse(localStorage.getItem(key)||'null');return x&&typeof x==='object'?x:null}catch{return null}
}

async function recoverPending(){
  if(!navigator.onLine||!hasPending()||!session?.accessToken||!cloudWorkspaceId)return false;
  const local=pendingSnapshot();
  if(!local)return false;
  try{
    db=Object.assign(defaultDB(),local);
    say('Conexión disponible. Validando cambios pendientes…');
    const ok=await saveCloudNow();
    if(ok!==false){
      clearPending();
      say('Cambios pendientes sincronizados.');
      try{renderApp()}catch{}
      return true;
    }
  }catch(e){
    console.warn('Recuperación de cambios pendientes',e);
    say('Hay cambios pendientes que requieren revisión antes de sincronizar.');
  }
  return false;
}

function installCoreHooks(){
  try{
    if(typeof saveDB==='function'&&!saveDB.__ccPendingV2){
      const base=saveDB;
      const wrapped=function(){const r=base.apply(this,arguments);if(!navigator.onLine)markPending();return r};
      wrapped.__ccPendingV2=true;saveDB=wrapped;
    }
  }catch(e){console.warn(e)}
  try{
    if(typeof scheduleCloudSave==='function'&&!scheduleCloudSave.__ccOfflineV2){
      const base=scheduleCloudSave;
      const wrapped=function(){if(!navigator.onLine){markPending();say('Sin conexión: los cambios quedan protegidos como borrador local.');return}return base.apply(this,arguments)};
      wrapped.__ccOfflineV2=true;scheduleCloudSave=wrapped;
    }
  }catch(e){console.warn(e)}
  try{
    if(typeof loadCloudData==='function'&&!loadCloudData.__ccPendingRestoreV2){
      const base=loadCloudData;
      const wrapped=async function(){const r=await base.apply(this,arguments);if(hasPending())await recoverPending();return r};
      wrapped.__ccPendingRestoreV2=true;loadCloudData=wrapped;
    }
  }catch(e){console.warn(e)}
}

function loadCore(){
  if(window.__CC_CORE_HARDENING_V1__){installCoreHooks();setTimeout(recoverPending,0);return}
  if(document.getElementById('ccCoreHardeningLoader'))return;
  const s=document.createElement('script');
  s.id='ccCoreHardeningLoader';
  s.src='core-hardening-v1.js?v=20260820-hardening2';
  s.async=false;
  s.onload=()=>{installCoreHooks();setTimeout(recoverPending,0);setTimeout(installCoreHooks,900)};
  s.onerror=()=>say('No se pudo cargar el núcleo de sincronización protegida. Recarga la aplicación antes de editar.');
  document.head.appendChild(s);
}

function authInvite(){
  const f=document.getElementById('authForm');
  if(!f||document.getElementById('authInvite'))return;
  const name=document.getElementById('authName'),host=name?.closest('.field')||f.querySelector('.reg');
  if(!host)return;
  const lab=document.createElement('label');lab.className='field reg hidden';
  lab.innerHTML='<span>Código de invitación <small style="font-weight:500">(opcional)</small></span><input id="authInvite" autocomplete="off" placeholder="Ej. A1B2C3D4E5F6"><small>Úsalo si un administrador te invitó al mismo Control Contractual.</small>';
  host.insertAdjacentElement('afterend',lab);
}

async function invitedSignup(ev){
  const f=ev.target;if(f?.id!=='authForm')return;
  const reg=document.getElementById('registerTab'),invite=document.getElementById('authInvite');
  const isReg=reg?.classList.contains('active')||/crear/i.test(document.getElementById('authSubmit')?.textContent||'');
  if(!isReg||!invite?.value.trim())return;
  ev.preventDefault();ev.stopImmediatePropagation();
  const email=document.getElementById('authEmail')?.value.trim().toLowerCase(),password=document.getElementById('authPass')?.value||'',name=document.getElementById('authName')?.value.trim(),code=invite.value.trim().toUpperCase(),btn=document.getElementById('authSubmit'),msg=document.getElementById('authMessage');
  if(!name||!email||password.length<8)return say('Completa nombre, correo y una contraseña de al menos 8 caracteres.');
  btn.disabled=true;if(msg)msg.textContent='Validando invitación…';
  try{
    const r=await fetch(SUPABASE_URL+'/auth/v1/signup',{method:'POST',headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json'},body:JSON.stringify({email,password,data:{full_name:name,workspace_invite_code:code}})}),d=await r.json();
    if(!r.ok)throw new Error(d.msg||d.message||d.error_description||'No se pudo usar la invitación.');
    if(!d.access_token){if(msg)msg.textContent='Cuenta creada. Confirma tu correo y luego ingresa; quedarás vinculado al mismo espacio de trabajo.';return}
    session={userId:d.user.id,email:d.user.email,accessToken:d.access_token,refreshToken:d.refresh_token,expiresAt:Date.now()+(d.expires_in||3600)*1000};
    localStorage.setItem(SESSION,JSON.stringify(session));cloudLoaded=false;await render();
  }catch(e){if(msg)msg.textContent=e.message||'No se pudo crear el acceso.'}
  finally{btn.disabled=false}
}

function teamButton(){
  let u;try{u=currentUser()}catch{return}
  if(!u||u.role!=='admin')return;
  const box=document.querySelector('.userbox');if(!box||document.getElementById('ccTeamBtn'))return;
  const b=document.createElement('button');b.type='button';b.className='btn';b.id='ccTeamBtn';b.textContent='Equipo';
  const out=document.getElementById('logoutBtn');box.insertBefore(b,out||null);b.onclick=teamModal;
}

function teamModal(){
  if(typeof openModal!=='function')return;
  openModal('Equipo y accesos',`<div class="stack"><div class="alert info">Crea un código temporal para que otro usuario entre al mismo espacio de trabajo. No compartas tu contraseña.</div><label class="field"><span>Rol</span><select id="ccInviteRole"><option value="consulta">Consulta · solo lectura</option><option value="editor">Editor · puede registrar y actualizar</option></select></label><label class="field"><span>Vigencia del código</span><select id="ccInviteDays"><option value="1">1 día</option><option value="3">3 días</option><option value="7" selected>7 días</option><option value="14">14 días</option></select></label><button class="btn primary" id="ccCreateInvite">Generar código de invitación</button><div id="ccInviteResult"></div></div>`);
  document.getElementById('ccCreateInvite').onclick=async()=>{
    const btn=document.getElementById('ccCreateInvite'),out=document.getElementById('ccInviteResult');btn.disabled=true;
    try{
      const r=await sbFetch('/rest/v1/rpc/create_workspace_invite',{method:'POST',body:{p_role:document.getElementById('ccInviteRole').value,p_days:Number(document.getElementById('ccInviteDays').value)}}),x=Array.isArray(r.data)?r.data[0]:r.data;
      if(!x?.invite_code)throw new Error('No se recibió el código.');
      out.innerHTML=`<div class="panel" style="margin-top:10px"><small class="muted">CÓDIGO DE INVITACIÓN</small><div style="font-size:22px;font-weight:900;letter-spacing:.12em;margin:6px 0">${H(x.invite_code)}</div><small class="muted">Rol: ${H(x.role)} · vence ${new Date(x.expires_at).toLocaleString('es-HN')}</small><div class="actions"><button class="btn" id="ccCopyInvite">Copiar código</button></div></div>`;
      document.getElementById('ccCopyInvite').onclick=()=>navigator.clipboard?.writeText(x.invite_code).then(()=>say('Código copiado.')).catch(()=>say('Código: '+x.invite_code));
    }catch(e){out.innerHTML=`<div class="alert danger">${H(e.message||'No se pudo generar la invitación.')}</div>`}
    finally{btn.disabled=false}
  };
}

try{if(typeof renderAuth==='function'&&!renderAuth.__ccInvite){const base=renderAuth;renderAuth=function(){const r=base.apply(this,arguments);setTimeout(authInvite,0);return r};renderAuth.__ccInvite=true}}catch(e){console.warn(e)}
try{if(typeof renderApp==='function'&&!renderApp.__ccTeam){const base=renderApp;renderApp=function(){const r=base.apply(this,arguments);setTimeout(teamButton,0);return r};renderApp.__ccTeam=true}}catch(e){console.warn(e)}

document.addEventListener('submit',ev=>{
  invitedSignup(ev);
  if(!navigator.onLine){markPending();setTimeout(()=>say('Borrador local guardado. Se sincronizará al recuperar internet.'),0)}
},true);
window.addEventListener('online',()=>setTimeout(recoverPending,50));

loadCore();
setTimeout(authInvite,0);setTimeout(teamButton,0);setTimeout(installCoreHooks,1200);
})();
