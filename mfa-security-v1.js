/* ===== CONTROL CONTRACTUAL · VERIFICACION EN DOS PASOS V1 ===== */
(()=>{
'use strict';
if(window.__CC_MFA_SECURITY_V1__)return;window.__CC_MFA_SECURITY_V1__=true;
const E=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const endpoint=()=>`${SUPABASE_URL}/functions/v1/secure-mfa`;
const headers=()=>({apikey:SUPABASE_KEY,Authorization:`Bearer ${session?.accessToken||''}`,'Content-Type':'application/json'});
function saveTokens(d){
 if(!d?.access_token||!session)return;
 session={...session,accessToken:d.access_token,refreshToken:d.refresh_token||session.refreshToken,expiresAt:Date.now()+(Number(d.expires_in)||3600)*1000};
 try{localStorage.setItem(SESSION,JSON.stringify(session))}catch{}
}
async function call(action,payload={}){
 if(!session?.accessToken||!session?.refreshToken)throw new Error('La sesión debe renovarse. Ingrese nuevamente.');
 const r=await fetch(endpoint(),{method:'POST',headers:headers(),body:JSON.stringify({action,refresh_token:session.refreshToken,...payload}),cache:'no-store'});const d=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(d.error||'No se pudo completar la verificación en dos pasos.');
 saveTokens(d);return d;
}
function safeQr(src){src=String(src||'');return /^data:image\/svg\+xml(?:;charset=[^;,]+)?(?:;base64)?,/i.test(src)?src:''}
function css(){if(document.getElementById('cc-mfa-style'))return;const s=document.createElement('style');s.id='cc-mfa-style';s.textContent=`
.cc-mfa-wrap{display:grid;gap:12px}.cc-mfa-card{border:1px solid var(--line);border-radius:14px;background:#0a1119;padding:14px}.cc-mfa-qr{display:grid;place-items:center;background:#fff;border-radius:14px;padding:14px;width:min(280px,100%);margin:12px auto}.cc-mfa-qr img{display:block;width:100%;height:auto}.cc-mfa-secret{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;overflow-wrap:anywhere;background:#080d14;border:1px solid var(--line);border-radius:10px;padding:10px}.cc-mfa-code{font-size:22px!important;letter-spacing:.16em;text-align:center}.cc-mfa-factor{display:flex;gap:10px;justify-content:space-between;align-items:center;border:1px solid var(--line);border-radius:11px;padding:10px;background:#0b121c}.cc-mfa-factor small{display:block;color:var(--muted)}
@media(max-width:520px){.cc-mfa-factor{align-items:flex-start;flex-direction:column}.cc-mfa-factor .actions{width:100%}.cc-mfa-factor .actions .btn{flex:1}}
`;document.head.appendChild(s)}
async function mfaModal(){
 css();
 const m=openModal('Verificación en dos pasos (2FA)',`<div class="alert info"><b>Protección adicional de la cuenta.</b> Puede usar una aplicación autenticadora compatible con códigos TOTP. Una vez activada, la contraseña por sí sola ya no dará acceso al contenido.</div><div id="ccMfaHost"><div class="empty">Consultando protección 2FA…</div></div>`),host=m.querySelector('#ccMfaHost');
 let pendingFactor='';
 async function load(){
  pendingFactor='';host.innerHTML='<div class="empty">Actualizando estado 2FA…</div>';
  try{
   const d=await call('status'),factors=Array.isArray(d.factors)?d.factors:[];
   if(d.enabled){
    host.innerHTML=`<div class="cc-mfa-wrap"><div class="alert good"><b>2FA está activado.</b><br>${d.aal==='aal2'?'Esta sesión ya fue verificada con el segundo factor.':'Esta sesión todavía no tiene nivel AAL2; cierre sesión e ingrese nuevamente para completar la verificación.'}</div><div class="cc-mfa-card"><h3>Factores registrados</h3><div class="cc-mfa-wrap">${factors.map(f=>`<div class="cc-mfa-factor"><div><b>${E(f.friendly_name||'Aplicación autenticadora')}</b><small>${E((f.factor_type||'totp').toUpperCase())} · VERIFICADO</small></div><div class="actions"><button type="button" class="btn danger" data-mfa-remove="${E(f.id)}">Desactivar</button></div></div>`).join('')}</div></div><div class="cc-mfa-card"><b>Recomendación</b><p class="notice" style="margin:6px 0 0">Mantenga acceso a su aplicación autenticadora. Si pierde el dispositivo, un administrador deberá ayudarle a recuperar el acceso.</p></div></div>`;
    host.querySelectorAll('[data-mfa-remove]').forEach(b=>b.onclick=async()=>{if(!confirm('¿Desactivar este segundo factor? La cuenta volverá a depender solo de la contraseña si no queda otro factor activo.'))return;b.disabled=true;try{await call('unenroll',{factor_id:b.dataset.mfaRemove});toast('Factor 2FA desactivado.');await load()}catch(e){toast(e.message||'No se pudo desactivar 2FA.')}finally{b.disabled=false}});
    return;
   }
   host.innerHTML=`<div class="cc-mfa-wrap"><div class="cc-mfa-card"><h3>2FA todavía no está activado</h3><p class="notice">Al activarlo, cada nuevo ingreso necesitará su contraseña y un código temporal generado en su teléfono o aplicación autenticadora.</p><div class="actions"><button type="button" class="btn primary" data-mfa-start>Activar 2FA</button></div></div><div class="cc-mfa-card"><b>Antes de activarlo</b><p class="notice" style="margin:6px 0 0">No comparta el código QR ni la clave secreta. Ambos permiten registrar el segundo factor en otro dispositivo.</p></div></div>`;
   host.querySelector('[data-mfa-start]').onclick=startEnrollment;
  }catch(e){host.innerHTML=`<div class="alert danger"><b>No se pudo consultar 2FA.</b><br>${E(e.message)}</div>`}
 }
 async function startEnrollment(){
  host.innerHTML='<div class="empty">Preparando código QR seguro…</div>';
  try{
   const d=await call('enroll');pendingFactor=d.factor_id||'';const qr=safeQr(d.qr_code);
   host.innerHTML=`<div class="cc-mfa-wrap"><div class="cc-mfa-card"><h3>1. Escanee el código QR</h3>${qr?`<div class="cc-mfa-qr"><img alt="Código QR para activar 2FA" src="${E(qr)}"></div>`:'<div class="alert warn">No se pudo mostrar el QR. Use la clave manual.</div>'}<small class="muted">Si su aplicación pide una clave manual:</small><div class="cc-mfa-secret" id="ccMfaSecret">${E(d.secret||'')}</div><div class="actions"><button type="button" class="btn" data-mfa-copy>Copiar clave manual</button></div></div><div class="cc-mfa-card"><h3>2. Confirme el código</h3><label class="field"><span>Código generado por su aplicación</span><input id="ccMfaEnrollCode" class="cc-mfa-code" inputmode="numeric" autocomplete="one-time-code" maxlength="10" placeholder="000000"></label><div id="ccMfaEnrollMsg" class="notice">Después de verificarlo, esta misma sesión quedará elevada a AAL2.</div><div class="actions"><button type="button" class="btn" data-mfa-cancel>Cancelar</button><button type="button" class="btn primary" data-mfa-confirm>Confirmar y activar</button></div></div></div>`;
   host.querySelector('[data-mfa-copy]').onclick=()=>navigator.clipboard?.writeText(d.secret||'').then(()=>toast('Clave 2FA copiada.')).catch(()=>toast('No se pudo copiar.'));
   host.querySelector('[data-mfa-cancel]').onclick=async()=>{try{if(pendingFactor)await call('cancel_enrollment',{factor_id:pendingFactor})}catch{}await load()};
   host.querySelector('[data-mfa-confirm]').onclick=async e=>{const b=e.currentTarget,code=String(host.querySelector('#ccMfaEnrollCode').value||'').replace(/\D/g,''),msg=host.querySelector('#ccMfaEnrollMsg');if(code.length<6){msg.textContent='Escriba el código generado por la aplicación.';return}b.disabled=true;try{await call('verify_enrollment',{factor_id:pendingFactor,code});pendingFactor='';toast('Verificación en dos pasos activada.');await load()}catch(err){msg.textContent=err.message||'No se pudo verificar el código.';b.disabled=false}};
   setTimeout(()=>host.querySelector('#ccMfaEnrollCode')?.focus(),50);
  }catch(e){host.innerHTML=`<div class="alert danger"><b>No se pudo iniciar 2FA.</b><br>${E(e.message)}</div><div class="actions"><button type="button" class="btn" data-mfa-back>Volver</button></div>`;host.querySelector('[data-mfa-back]').onclick=load}
 }
 await load();
}
function bind(){
 if(!session?.accessToken)return document.getElementById('ccMfaBtn')?.remove();
 if(document.getElementById('ccMfaBtn'))return;
 const anchor=document.getElementById('ccSecurityBtn')||document.getElementById('ccTeamBtn'),host=anchor?.parentElement||document.querySelector('.top-actions');if(!host)return;
 const b=document.createElement('button');b.id='ccMfaBtn';b.type='button';b.className='btn';b.textContent='2FA';b.title='Configurar verificación en dos pasos';b.onclick=mfaModal;anchor?host.insertBefore(b,anchor):host.appendChild(b);
}
try{if(typeof renderApp==='function'&&!renderApp.__mfaSecurity){const base=renderApp;renderApp=function(){const r=base.apply(this,arguments);setTimeout(bind,0);return r};renderApp.__mfaSecurity=true}}catch(e){console.warn(e)}
new MutationObserver(bind).observe(document.documentElement,{subtree:true,childList:true});setTimeout(bind,0);window.mfaSecurityModal=mfaModal;
})();
