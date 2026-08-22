/* Recuperacion segura de contrasena con Supabase Auth. */
(()=>{
'use strict';
if(window.__passwordRecoveryV1)return;window.__passwordRecoveryV1=1;

const $=s=>document.querySelector(s);
const authHeaders=()=>({'apikey':SUPABASE_KEY,'Content-Type':'application/json','Accept':'application/json'});
const messageFrom=(data,fallback)=>data?.error_description||data?.msg||data?.message||data?.error||fallback;
const cleanReturnUrl=()=>location.origin+location.pathname;

function recoveryToken(){
  const hash=new URLSearchParams(location.hash.replace(/^#/,''));
  return hash.get('type')==='recovery'?hash.get('access_token')||'':'';
}

function addForgotPasswordOption(){
  const form=$('#authForm'),pass=$('#authPass'),loginTab=$('#loginTab');
  if(!form||!pass||$('#forgotPasswordBtn'))return;
  const link=document.createElement('button');
  link.type='button';link.id='forgotPasswordBtn';link.className='btn';
  link.style.cssText='width:100%;background:transparent;border-color:transparent;color:#9fc1ff;padding:7px 10px';
  link.textContent='¿Olvidaste tu contraseña?';
  pass.closest('.field')?.insertAdjacentElement('afterend',link);
  const sync=()=>link.classList.toggle('hidden',!loginTab?.classList.contains('active'));
  loginTab?.addEventListener('click',sync);
  $('#registerTab')?.addEventListener('click',sync);
  sync();
  link.onclick=()=>renderRecoveryRequest();
}

function renderRecoveryRequest(){
  const email=$('#authEmail')?.value.trim().toLowerCase()||'';
  document.getElementById('app').innerHTML=`<div class="auth"><div class="auth-card"><div class="logo">CP</div><p class="eyebrow">RECUPERAR ACCESO</p><h1>Recupera tu contraseña</h1><p class="muted">Escribe tu correo y te enviaremos un enlace seguro para crear una nueva contraseña.</p><form id="recoveryRequestForm" class="stack"><label class="field"><span>Correo</span><input id="recoveryEmail" type="email" required autocomplete="email" value="${typeof esc==='function'?esc(email):''}"></label><button class="btn primary" id="recoverySend">Enviar enlace al correo</button><button class="btn" type="button" id="recoveryBack">Volver al inicio</button><p class="notice" id="recoveryMessage">Por seguridad, la respuesta será la misma aunque el correo no esté registrado.</p></form></div></div>`;
  $('#recoveryBack').onclick=()=>renderAuth();
  $('#recoveryRequestForm').onsubmit=async e=>{
    e.preventDefault();const btn=$('#recoverySend'),msg=$('#recoveryMessage'),address=$('#recoveryEmail').value.trim().toLowerCase();
    btn.disabled=true;msg.textContent='Enviando enlace…';
    try{
      const redirectTo=cleanReturnUrl();
      const r=await fetch(`${SUPABASE_URL}/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`,{method:'POST',headers:authHeaders(),body:JSON.stringify({email:address})});
      const data=await r.json().catch(()=>({}));
      if(!r.ok)throw new Error(messageFrom(data,'No se pudo enviar el enlace. Inténtalo nuevamente.'));
      msg.textContent='Si existe una cuenta con ese correo, recibirás un enlace para cambiar la contraseña. Revisa también la carpeta de correo no deseado.';
      btn.textContent='Enlace solicitado';
    }catch(err){msg.textContent=err.message||'No se pudo enviar el enlace. Inténtalo nuevamente.';btn.disabled=false}
  };
}

function renderNewPassword(token){
  session=null;localStorage.removeItem(SESSION);
  document.getElementById('app').innerHTML=`<div class="auth"><div class="auth-card"><div class="logo">CP</div><p class="eyebrow">NUEVA CONTRASEÑA</p><h1>Crea una nueva contraseña</h1><p class="muted">Elige una contraseña de al menos 8 caracteres para recuperar tu acceso.</p><form id="newPasswordForm" class="stack"><label class="field"><span>Nueva contraseña</span><input id="newPassword" type="password" minlength="8" required autocomplete="new-password"></label><label class="field"><span>Confirmar contraseña</span><input id="confirmPassword" type="password" minlength="8" required autocomplete="new-password"></label><button class="btn primary" id="newPasswordSubmit">Guardar nueva contraseña</button><p class="notice" id="newPasswordMessage">El enlace es temporal y solo debe abrirlo su destinatario.</p></form></div></div>`;
  $('#newPasswordForm').onsubmit=async e=>{
    e.preventDefault();const password=$('#newPassword').value,confirm=$('#confirmPassword').value,btn=$('#newPasswordSubmit'),msg=$('#newPasswordMessage');
    if(password.length<8){msg.textContent='La contraseña debe tener al menos 8 caracteres.';return}
    if(password!==confirm){msg.textContent='Las contraseñas no coinciden.';return}
    btn.disabled=true;msg.textContent='Actualizando contraseña…';
    try{
      const r=await fetch(`${SUPABASE_URL}/auth/v1/user`,{method:'PUT',headers:{...authHeaders(),'Authorization':`Bearer ${token}`},body:JSON.stringify({password})});
      const data=await r.json().catch(()=>({}));
      if(!r.ok)throw new Error(messageFrom(data,'No se pudo actualizar la contraseña.'));
      try{await fetch(`${SUPABASE_URL}/auth/v1/logout`,{method:'POST',headers:{...authHeaders(),'Authorization':`Bearer ${token}`}})}catch{}
      history.replaceState(null,'',location.pathname+location.search);
      document.getElementById('app').innerHTML=`<div class="auth"><div class="auth-card"><div class="logo">CP</div><p class="eyebrow">ACCESO RECUPERADO</p><h1>Contraseña actualizada</h1><p class="muted">Ya puedes ingresar con tu correo y la nueva contraseña.</p><button class="btn primary" id="recoveryDone" style="width:100%">Ir al inicio de sesión</button></div></div>`;
      $('#recoveryDone').onclick=()=>renderAuth();
    }catch(err){msg.textContent=err.message||'El enlace venció o ya fue utilizado. Solicita uno nuevo.';btn.disabled=false}
  };
}

try{
  if(typeof renderAuth==='function'&&!renderAuth.__passwordRecovery){
    const original=renderAuth;
    renderAuth=function(){const result=original.apply(this,arguments);setTimeout(addForgotPasswordOption,0);return result};
    renderAuth.__passwordRecovery=true;
  }
  const token=recoveryToken();
  if(token)setTimeout(()=>renderNewPassword(token),0);else setTimeout(addForgotPasswordOption,0);
}catch(error){console.warn('No se pudo inicializar la recuperación de contraseña.',error)}
})();
