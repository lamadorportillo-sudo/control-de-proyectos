/* ===== RECUPERACIÓN SEGURA DE CONTRASEÑA SUPABASE V2 · ACCESO WCAG ===== */
(()=>{
'use strict';
if(window.__CC_PASSWORD_RECOVERY_V1__)return;window.__CC_PASSWORD_RECOVERY_V1__=true;window.__CC_PASSWORD_RECOVERY_V2__=true;
const apiBase=()=>typeof SUPABASE_URL!=='undefined'?SUPABASE_URL:'';
const publicKey=()=>typeof SUPABASE_KEY!=='undefined'?SUPABASE_KEY:'';
const redirectUrl=()=>`${location.origin}${location.pathname}`;
async function requestReset(email){
  const response=await fetch(`${apiBase()}/auth/v1/recover?redirect_to=${encodeURIComponent(redirectUrl())}`,{method:'POST',headers:{apikey:publicKey(),'Content-Type':'application/json'},body:JSON.stringify({email:String(email||'').trim().toLowerCase()})});
  if(!response.ok){const data=await response.json().catch(()=>({}));throw new Error(response.status===429?'Demasiados intentos. Espera unos minutos antes de volver a solicitar el correo.':(data?.msg||data?.message||'No se pudo enviar el correo de recuperación.'))}
  return true;
}
async function updatePassword(accessToken,password){
  const response=await fetch(`${apiBase()}/auth/v1/user`,{method:'PUT',headers:{apikey:publicKey(),Authorization:`Bearer ${accessToken}`,'Content-Type':'application/json'},body:JSON.stringify({password})});
  if(!response.ok){const data=await response.json().catch(()=>({}));throw new Error(data?.msg||data?.message||'No se pudo actualizar la contraseña.')}
  return response.json().catch(()=>({}));
}
function ensureAuthAccessibility(){
  const fields=[
    ['authEmail','Correo electrónico'],
    ['authPass','Contraseña'],
    ['authName','Nombre completo']
  ];
  for(const [id,label] of fields){
    const input=document.getElementById(id);
    if(input&&!input.getAttribute('aria-label')&&!input.getAttribute('aria-labelledby'))input.setAttribute('aria-label',label);
  }
}
function injectLink(){
  ensureAuthAccessibility();
  const form=document.getElementById('authForm'),email=document.getElementById('authEmail');if(!form||!email||document.getElementById('ccForgotPassword'))return;
  const button=document.createElement('button');button.type='button';button.id='ccForgotPassword';button.textContent='¿Olvidaste tu contraseña?';button.style.cssText='display:block;margin:2px 0 10px auto;padding:2px;border:0;background:transparent;color:#60a5fa;font-size:12px;font-weight:700;cursor:pointer;text-decoration:underline;text-underline-offset:3px';
  const pass=document.getElementById('authPass');(pass?.closest('label')||pass?.parentElement||email).insertAdjacentElement('afterend',button);
  button.onclick=async()=>{const value=email.value.trim(),msg=document.getElementById('authMessage');if(!value||!/^\S+@\S+\.\S+$/.test(value)){if(msg)msg.textContent='Escribe primero el correo de tu cuenta.';email.focus();return}button.disabled=true;button.textContent='Enviando…';try{await requestReset(value);if(msg)msg.textContent='Si el correo pertenece a una cuenta, recibirás un enlace para crear una contraseña nueva. Revisa también la carpeta de spam.';button.textContent='Correo solicitado'}catch(error){if(msg)msg.textContent=error.message||'No se pudo solicitar la recuperación.';button.textContent='Intentar nuevamente';button.disabled=false}}
}
function recoveryToken(){const params=new URLSearchParams(location.hash.replace(/^#/,''));return params.get('type')==='recovery'?params.get('access_token'):null}
function showResetForm(token){
  if(!token||document.getElementById('ccPasswordReset'))return;
  const box=document.createElement('div');box.id='ccPasswordReset';box.style.cssText='position:fixed;inset:0;z-index:10000;display:grid;place-items:center;padding:20px;background:#06101deF;color:#eaf3fc';box.innerHTML='<form style="width:min(430px,100%);padding:26px;border:1px solid #29405a;border-radius:18px;background:#091522;box-shadow:0 24px 70px #0009"><p style="margin:0 0 5px;color:#60a5fa;font-size:11px;font-weight:800;letter-spacing:.12em">RECUPERACIÓN DE ACCESO</p><h2 style="margin:0 0 8px">Crear contraseña nueva</h2><p style="margin:0 0 18px;color:#9fb5ca;font-size:13px">Utiliza al menos ocho caracteres y no compartas tu clave.</p><label style="display:grid;gap:6px;margin-bottom:12px"><span>Nueva contraseña</span><input id="ccNewPassword" type="password" minlength="8" required autocomplete="new-password" style="padding:12px;border:1px solid #35506e;border-radius:10px"></label><label style="display:grid;gap:6px;margin-bottom:14px"><span>Confirmar contraseña</span><input id="ccConfirmPassword" type="password" minlength="8" required autocomplete="new-password" style="padding:12px;border:1px solid #35506e;border-radius:10px"></label><button style="width:100%;padding:12px;border:0;border-radius:10px;background:#2563eb;color:white;font-weight:800">Actualizar contraseña</button><p id="ccResetMessage" style="min-height:18px;margin:12px 0 0;color:#a9c0d5;font-size:12px"></p></form>';
  document.body.appendChild(box);const form=box.querySelector('form'),message=box.querySelector('#ccResetMessage');form.onsubmit=async event=>{event.preventDefault();const password=box.querySelector('#ccNewPassword').value,confirmPassword=box.querySelector('#ccConfirmPassword').value,button=form.querySelector('button');if(password.length<8){message.textContent='La contraseña debe tener al menos ocho caracteres.';return}if(password!==confirmPassword){message.textContent='Las contraseñas no coinciden.';return}button.disabled=true;message.textContent='Actualizando…';try{await updatePassword(token,password);history.replaceState(null,'',redirectUrl());message.textContent='Contraseña actualizada. Ya puedes iniciar sesión con tu nueva clave.';setTimeout(()=>location.reload(),1800)}catch(error){message.textContent=error.message||'No se pudo actualizar la contraseña.';button.disabled=false}}
}
function start(){const token=recoveryToken();if(token)showResetForm(token);injectLink();ensureAuthAccessibility();new MutationObserver(()=>{injectLink();ensureAuthAccessibility()}).observe(document.documentElement,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.__ccPasswordRecovery={requestReset,updatePassword,recoveryToken,injectLink,ensureAuthAccessibility};
})();
