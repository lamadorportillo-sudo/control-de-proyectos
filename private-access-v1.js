/* ===== CONTROL CONTRACTUAL · ACCESO PRIVADO CON APROBACIÓN V1 ===== */
(()=>{
'use strict';
if(window.__CC_PRIVATE_ACCESS_V1__)return;
window.__CC_PRIVATE_ACCESS_V1__=true;

const E=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const endpoint=()=>`${SUPABASE_URL}/functions/v1/request-access`;
const authHeaders=()=>({'apikey':SUPABASE_KEY,'Content-Type':'application/json'});
let authMode='login',requestRegistered=false,requestEmail='';

function field(id,label,attrs='',help=''){
  return `<label class="field reg hidden"><span>${label}</span><input id="${id}" ${attrs}>${help?`<small>${help}</small>`:''}</label>`;
}

function enhanceAuth(){
  const form=document.getElementById('authForm');
  if(!form||form.dataset.privateAccess==='1')return;
  form.dataset.privateAccess='1';
  const name=document.getElementById('authName')?.closest('.field');
  if(!name)return;
  document.getElementById('authInvite')?.closest('.field')?.remove();
  name.insertAdjacentHTML('afterend',
    field('authPhone','Teléfono','type="tel" autocomplete="tel" placeholder="Ej. 9999-9999"')+
    field('authPosition','Cargo o institución','autocomplete="organization-title" placeholder="Ej. Supervisor de obra"')+
    `<label class="field reg hidden"><span>Tipo de acceso solicitado</span><select id="authRequestedRole"><option value="consulta">Consulta · solo lectura</option><option value="editor">Editor · registrar y actualizar</option></select></label>`+
    `<label class="field reg hidden" id="accessCodeField"><span>Código de acceso</span><input id="privateAccessCode" autocomplete="one-time-code" maxlength="12" placeholder="Código proporcionado por el administrador"><small>El código es personal, temporal y solo funciona con el correo solicitado.</small></label>`+
    `<label class="field reg hidden" style="position:absolute;left:-9999px" aria-hidden="true"><span>Sitio web</span><input id="authWebsite" tabindex="-1" autocomplete="off"></label>`
  );
  const loginTab=document.getElementById('loginTab'),registerTab=document.getElementById('registerTab');
  registerTab.textContent='Solicitar acceso';

  function mode(next){
    authMode=next;requestRegistered=false;requestEmail='';
    loginTab.classList.toggle('active',next==='login');registerTab.classList.toggle('active',next==='register');
    document.querySelectorAll('#authForm .reg').forEach(x=>x.classList.toggle('hidden',next!=='register'));
    document.getElementById('authSubmit').textContent=next==='login'?'Ingresar':'Enviar solicitud';
    document.getElementById('authPass').closest('.field').classList.toggle('hidden',next==='register');
    document.getElementById('authPass').required=next==='login';
    document.getElementById('accessCodeField').classList.toggle('hidden',true);
    document.getElementById('authMessage').textContent=next==='login'
      ?'Acceso privado. Ingrese con una cuenta previamente autorizada.'
      :'Complete sus datos. El administrador recibirá la solicitud y le proporcionará un código personal.';
  }
  loginTab.onclick=()=>mode('login');registerTab.onclick=()=>mode('register');
  mode('login');

  form.onsubmit=async ev=>{
    ev.preventDefault();ev.stopPropagation();
    const email=document.getElementById('authEmail').value.trim().toLowerCase();
    const password=document.getElementById('authPass').value;
    const nameValue=document.getElementById('authName').value.trim();
    const btn=document.getElementById('authSubmit'),msg=document.getElementById('authMessage');
    btn.disabled=true;msg.textContent='Procesando…';
    try{
      if(authMode==='login'){
        const r=await fetch(SUPABASE_URL+'/auth/v1/token?grant_type=password',{method:'POST',headers:authHeaders(),body:JSON.stringify({email,password})});
        const d=await r.json();if(!r.ok)throw new Error(d.error_description||d.msg||d.message||'Correo o contraseña incorrectos.');
        session={userId:d.user.id,email:d.user.email,accessToken:d.access_token,refreshToken:d.refresh_token,expiresAt:Date.now()+(d.expires_in||3600)*1000};
        localStorage.setItem(SESSION,JSON.stringify(session));cloudLoaded=false;await render();return;
      }
      if(!requestRegistered){
        if(nameValue.length<3)throw new Error('Escriba su nombre completo.');
        const payload={full_name:nameValue,email,phone:document.getElementById('authPhone').value.trim(),position:document.getElementById('authPosition').value.trim(),requested_role:document.getElementById('authRequestedRole').value,website:document.getElementById('authWebsite').value};
        const r=await fetch(endpoint(),{method:'POST',headers:authHeaders(),body:JSON.stringify(payload)});const d=await r.json();
        if(!r.ok)throw new Error(d.error||'No se pudo enviar la solicitud.');
        requestRegistered=true;requestEmail=email;
        document.getElementById('accessCodeField').classList.remove('hidden');
        document.getElementById('authPass').closest('.field').classList.remove('hidden');
        document.getElementById('authPass').required=true;document.getElementById('authPass').autocomplete='new-password';
        btn.textContent='Confirmar código y crear acceso';
        msg.textContent=d.email_sent
          ?'Solicitud enviada. El administrador fue notificado por correo. Cuando le entregue el código, escríbalo aquí junto con su contraseña.'
          :'Solicitud registrada. El administrador podrá verla en el sistema. Cuando le entregue el código, escríbalo aquí junto con su contraseña.';
        document.getElementById('privateAccessCode').focus();return;
      }
      if(email!==requestEmail)throw new Error('El correo fue cambiado. Envíe nuevamente la solicitud para ese correo.');
      const code=document.getElementById('privateAccessCode').value.trim().toUpperCase();
      if(code.length!==12)throw new Error('Escriba el código de 12 caracteres proporcionado por el administrador.');
      if(password.length<8)throw new Error('La contraseña debe tener al menos 8 caracteres.');
      const r=await fetch(SUPABASE_URL+'/auth/v1/signup',{method:'POST',headers:authHeaders(),body:JSON.stringify({email,password,data:{full_name:nameValue,workspace_invite_code:code}})});const d=await r.json();
      if(!r.ok)throw new Error(d.msg||d.message||d.error_description||'Código incorrecto, vencido o asignado a otro correo.');
      if(!d.access_token){msg.textContent='Cuenta autorizada. Revise su correo para confirmarla y luego ingrese.';mode('login');return}
      session={userId:d.user.id,email:d.user.email,accessToken:d.access_token,refreshToken:d.refresh_token,expiresAt:Date.now()+(d.expires_in||3600)*1000};
      localStorage.setItem(SESSION,JSON.stringify(session));cloudLoaded=false;await render();
    }catch(err){msg.textContent=err.message||'No se pudo completar la operación.'}
    finally{btn.disabled=false}
  };
}

async function requestRows(){
  const r=await sbFetch('/rest/v1/access_requests?select=id,full_name,email,phone,position,requested_role,status,requested_at,notification_sent&status=in.(pending,approved)&order=requested_at.desc&limit=50');
  return Array.isArray(r.data)?r.data:[];
}

async function privateTeamModal(){
  if(typeof openModal!=='function')return;
  const m=openModal('Solicitudes y accesos',`<div class="alert info">Solo usted puede aprobar solicitudes y entregar el código. Cada código queda ligado al correo, vence y funciona una sola vez.</div><div id="privateRequests"><div class="empty">Cargando solicitudes…</div></div>`);
  const host=m.querySelector('#privateRequests');
  try{
    const rows=await requestRows();
    host.innerHTML=rows.length?rows.map(x=>`<article class="panel" style="margin-bottom:10px" data-request="${E(x.id)}"><div class="row spread wrap"><div><h3 style="margin-bottom:3px">${E(x.full_name)}</h3><div class="muted">${E(x.email)}${x.phone?' · '+E(x.phone):''}</div><small class="muted">${E(x.position||'Cargo no indicado')} · ${x.requested_role==='editor'?'Editor':'Solo consulta'} · ${new Date(x.requested_at).toLocaleString('es-HN')}</small></div><span class="status ${x.status==='approved'?'good':'warn'}">${x.status==='approved'?'APROBADA':'PENDIENTE'}</span></div><div class="actions">${x.status==='pending'?`<button class="btn primary" data-approve="${E(x.id)}">Aprobar y generar código</button><button class="btn danger" data-reject="${E(x.id)}">Rechazar</button>`:`<button class="btn primary" data-approve="${E(x.id)}">Ver código</button>`}</div><div class="invite-output"></div></article>`).join(''):'<div class="empty">No hay solicitudes pendientes.</div>';
    host.querySelectorAll('[data-approve]').forEach(b=>b.onclick=async()=>{
      b.disabled=true;
      try{
        const r=await sbFetch('/rest/v1/rpc/approve_access_request',{method:'POST',body:{p_request_id:b.dataset.approve,p_days:3}}),x=Array.isArray(r.data)?r.data[0]:r.data;
        const card=b.closest('[data-request]'),out=card.querySelector('.invite-output');
        out.innerHTML=`<div class="alert good" style="margin-top:10px"><small>CÓDIGO PERSONAL PARA ${E(x.email)}</small><div style="font-size:22px;font-weight:900;letter-spacing:.12em;margin:5px 0">${E(x.invite_code)}</div><small>Vence ${new Date(x.expires_at).toLocaleString('es-HN')} · ${x.role==='editor'?'Editor':'Solo consulta'}</small><div class="actions"><button class="btn" data-copy>Copiar código</button></div></div>`;
        out.querySelector('[data-copy]').onclick=()=>navigator.clipboard?.writeText(x.invite_code).then(()=>toast('Código copiado.')).catch(()=>toast('Código: '+x.invite_code));
        b.textContent='Ver código';card.querySelector('.status').className='status good';card.querySelector('.status').textContent='APROBADA';card.querySelector('[data-reject]')?.remove();
      }catch(e){toast(e.message||'No se pudo aprobar la solicitud.')}finally{b.disabled=false}
    });
    host.querySelectorAll('[data-reject]').forEach(b=>b.onclick=async()=>{
      if(!confirm('¿Rechazar esta solicitud de acceso?'))return;
      b.disabled=true;try{await sbFetch('/rest/v1/rpc/reject_access_request',{method:'POST',body:{p_request_id:b.dataset.reject}});b.closest('[data-request]').remove();toast('Solicitud rechazada.')}catch(e){toast(e.message||'No se pudo rechazar.')}
    });
  }catch(e){host.innerHTML=`<div class="alert danger">${E(e.message||'No se pudieron cargar las solicitudes.')}</div>`}
}

function bindTeam(){const b=document.getElementById('ccTeamBtn');if(b&&!b.dataset.privateAccess){b.dataset.privateAccess='1';b.textContent='Solicitudes';b.onclick=privateTeamModal}}

try{if(typeof renderAuth==='function'&&!renderAuth.__privateAccess){const base=renderAuth;renderAuth=function(){const r=base.apply(this,arguments);setTimeout(enhanceAuth,0);return r};renderAuth.__privateAccess=true}}catch(e){console.warn(e)}
try{if(typeof renderApp==='function'&&!renderApp.__privateAccess){const base=renderApp;renderApp=function(){const r=base.apply(this,arguments);setTimeout(bindTeam,0);return r};renderApp.__privateAccess=true}}catch(e){console.warn(e)}
new MutationObserver(()=>{enhanceAuth();bindTeam()}).observe(document.documentElement,{subtree:true,childList:true});
setTimeout(()=>{enhanceAuth();bindTeam()},0);
})();
