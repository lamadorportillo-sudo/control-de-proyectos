/* ===== ADMINISTRACION CENTRALIZADA DE USUARIOS SUPABASE V1 ===== */
(()=>{
'use strict';
if(window.__CC_ADMIN_USERS_V1__)return;window.__CC_ADMIN_USERS_V1__=true;
const E=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const endpoint=()=>`${SUPABASE_URL}/functions/v1/manage-users`;
const headers=()=>({apikey:SUPABASE_KEY,Authorization:`Bearer ${session?.accessToken||''}`,'Content-Type':'application/json'});
async function call(action,payload={}){const r=await fetch(endpoint(),{method:'POST',headers:headers(),body:JSON.stringify({action,...payload})});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'No se pudo completar la operacion.');return d}

async function adminUsersModal(){
  const m=openModal('Usuarios de Supabase',`<div class="alert info"><b>Cuentas centralizadas.</b> Los usuarios creados aqui quedan registrados en Supabase y pueden ingresar desde cualquier computadora.</div><form id="ccCreateUser" class="form-grid" style="margin-top:12px"><label class="field"><span>Nombre completo</span><input id="ccUserName" required maxlength="120"></label><label class="field"><span>Correo</span><input id="ccUserEmail" type="email" required maxlength="180"></label><label class="field"><span>Contrasena temporal</span><input id="ccUserPassword" type="password" required minlength="8" autocomplete="new-password"></label><label class="field"><span>Rol</span><select id="ccUserRole"><option value="consulta">Consulta</option><option value="editor">Editor</option><option value="admin">Administrador</option></select></label><label class="field"><span>Vigencia para primer ingreso</span><select id="ccUserHours"><option value="24">24 horas</option><option value="48">48 horas</option><option value="72">72 horas</option></select></label><div class="actions" style="grid-column:1/-1"><button class="btn primary">Crear usuario en Supabase</button></div><p id="ccCreateMessage" class="notice" style="grid-column:1/-1"></p></form><div class="panel" style="margin-top:14px"><h3>Usuarios registrados</h3><div id="ccUserRows"><div class="empty">Cargando...</div></div></div>`);
  const host=m.querySelector('#ccUserRows'),form=m.querySelector('#ccCreateUser'),msg=m.querySelector('#ccCreateMessage');
  async function load(){try{const d=await call('list');host.innerHTML=d.users.length?`<div class="table-wrap"><table class="table"><thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th></tr></thead><tbody>${d.users.map(u=>`<tr><td>${E(u.full_name||'—')}</td><td>${E(u.email||'—')}</td><td>${E((u.role||'consulta').toUpperCase())}</td><td>${u.active===false?'<span class="status danger">INACTIVO</span>':u.must_change_password?'<span class="status warn">CAMBIO DE CLAVE PENDIENTE</span>':'<span class="status good">ACTIVO</span>'}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">No hay usuarios.</div>'}catch(e){host.innerHTML=`<div class="alert danger">${E(e.message)}</div>`}}
  form.onsubmit=async ev=>{ev.preventDefault();const b=form.querySelector('button');b.disabled=true;msg.textContent='Creando cuenta real en Supabase...';try{await call('create',{full_name:m.querySelector('#ccUserName').value.trim(),email:m.querySelector('#ccUserEmail').value.trim().toLowerCase(),password:m.querySelector('#ccUserPassword').value,role:m.querySelector('#ccUserRole').value,expires_in_hours:Number(m.querySelector('#ccUserHours').value)});msg.textContent='Usuario creado. Podra ingresar desde cualquier equipo y debera cambiar la contrasena temporal.';form.reset();await load()}catch(e){msg.textContent=e.message}finally{b.disabled=false}};
  await load();
}

let forceCheckRunning=false,forceCheckedUser='';
async function enforceTemporaryPassword(){
  if(forceCheckRunning||!session?.accessToken||!cloudProfile||forceCheckedUser===session.userId)return;forceCheckRunning=true;forceCheckedUser=session.userId;
  try{
    const x=(await sbFetch(`/rest/v1/profiles?select=must_change_password,temporary_password_expires_at&user_id=eq.${encodeURIComponent(session.userId)}&limit=1`)).data?.[0];
    if(!x?.must_change_password)return;
    if(x.temporary_password_expires_at&&Date.now()>new Date(x.temporary_password_expires_at).getTime()){
      await cloudSignOut();throw new Error('La contrasena temporal vencio. Solicite al administrador una nueva clave.');
    }
    if(document.getElementById('ccForcePassword'))return;
    const box=document.createElement('div');box.id='ccForcePassword';box.style.cssText='position:fixed;inset:0;z-index:20000;display:grid;place-items:center;padding:20px;background:#06101df5;color:#eaf3fc';box.innerHTML='<form style="width:min(430px,100%);padding:26px;border:1px solid #29405a;border-radius:18px;background:#091522"><p style="color:#60a5fa;font-weight:800">SEGURIDAD DE LA CUENTA</p><h2>Cambie la contrasena temporal</h2><p style="color:#9fb5ca">Debe crear una contrasena personal antes de utilizar el sistema.</p><label class="field"><span>Nueva contrasena</span><input id="ccForcedNew" type="password" minlength="8" required autocomplete="new-password"></label><label class="field"><span>Confirmar contrasena</span><input id="ccForcedConfirm" type="password" minlength="8" required autocomplete="new-password"></label><button class="btn primary" style="width:100%;margin-top:12px">Guardar mi nueva contrasena</button><p id="ccForcedMessage" class="notice"></p></form>';
    document.body.appendChild(box);const form=box.querySelector('form'),message=box.querySelector('#ccForcedMessage');form.onsubmit=async ev=>{ev.preventDefault();const p=box.querySelector('#ccForcedNew').value,c=box.querySelector('#ccForcedConfirm').value,b=form.querySelector('button');if(p.length<8)return message.textContent='Use al menos 8 caracteres.';if(p!==c)return message.textContent='Las contrasenas no coinciden.';b.disabled=true;message.textContent='Actualizando...';try{const r=await fetch(`${SUPABASE_URL}/auth/v1/user`,{method:'PUT',headers:headers(),body:JSON.stringify({password:p})});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.message||'No se pudo cambiar la contrasena.');await call('complete_password_change');box.remove();toast('Contrasena personal guardada correctamente.')}catch(e){message.textContent=e.message;b.disabled=false}};
  }catch(e){forceCheckedUser='';if(e.message)toast(e.message)}finally{forceCheckRunning=false}
}

function bind(){const b=document.getElementById('ccTeamBtn');if(b&&cloudRole==='admin'&&b.dataset.adminUsers!=='1'){b.textContent='Usuarios';b.onclick=adminUsersModal;b.dataset.adminUsers='1'}setTimeout(enforceTemporaryPassword,0)}
try{if(typeof renderApp==='function'&&!renderApp.__adminUsers){const base=renderApp;renderApp=function(){const r=base.apply(this,arguments);setTimeout(bind,0);return r};renderApp.__adminUsers=true}}catch(e){console.warn(e)}
new MutationObserver(bind).observe(document.documentElement,{subtree:true,childList:true});setTimeout(bind,0);
window.adminUsersModal=adminUsersModal;
})();
