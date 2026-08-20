/* ===== CONTROL CONTRACTUAL · RESPALDO EXCEL + ACCESO INSTITUCIONAL V2 ===== */
(()=>{
'use strict';
if(window.__CP_EXCEL_LOGIN_V2__)return;
window.__CP_EXCEL_LOGIN_V2__=true;
window.__CP_EXCEL_BACKUP_V1__=true;

/* ---------------- RESPALDO EXCEL ---------------- */
const SHEETJS_URL='https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
let sheetJsPromise=null;
const safeArray=v=>Array.isArray(v)?v:[];
const r2=v=>Math.round((Number(v)||0)*100)/100;
const dateStamp=()=>{try{if(typeof today==='function')return today();}catch(_e){}return new Date().toISOString().slice(0,10)};
const notify=msg=>{try{if(typeof toast==='function')return toast(msg)}catch(_e){}console.info(msg)};

function loadSheetJS(){
  if(window.XLSX)return Promise.resolve(window.XLSX);
  if(sheetJsPromise)return sheetJsPromise;
  sheetJsPromise=new Promise((resolve,reject)=>{
    const old=document.querySelector('script[data-cp-sheetjs]');
    if(old){old.addEventListener('load',()=>window.XLSX?resolve(window.XLSX):reject(new Error('No se pudo iniciar Excel.')),{once:true});old.addEventListener('error',()=>reject(new Error('No se pudo cargar Excel.')),{once:true});return;}
    const s=document.createElement('script');s.src=SHEETJS_URL;s.async=true;s.dataset.cpSheetjs='1';
    s.onload=()=>window.XLSX?resolve(window.XLSX):reject(new Error('No se pudo iniciar Excel.'));
    s.onerror=()=>reject(new Error('No se pudo cargar el generador de Excel.'));
    document.head.appendChild(s);
  });
  return sheetJsPromise;
}

function projectOf(id){return safeArray(db?.projects).find(p=>p.id===id)}
function contractOf(id){return safeArray(db?.contracts).find(c=>c.id===id)}
function projectFromRecord(x){
  if(x?.projectId)return projectOf(x.projectId);
  if(x?.contractId){const c=contractOf(x.contractId);return c?projectOf(c.projectId):null;}
  return null;
}
function baseLink(x){const p=projectFromRecord(x),c=x?.contractId?contractOf(x.contractId):safeArray(db?.contracts).find(z=>z.projectId===p?.id);return{'Código proyecto':p?.code||'','Nombre proyecto':p?.name||'','Contrato':c?.number||''}}
function flatten(obj){
  const out={};
  Object.entries(obj||{}).forEach(([k,v])=>{
    if(v==null||typeof v==='string'||typeof v==='number'||typeof v==='boolean')out[k]=v??'';
    else if(v instanceof Date)out[k]=v.toISOString();
    else out[k]=JSON.stringify(v);
  });
  return out;
}
function rowsLinked(arr){return safeArray(arr).map(x=>Object.assign({},baseLink(x),flatten(x)))}

function budgetSnapshot(p){
  const b=p?.budgetControl||{};let assigned=+b.assigned||0,decrease=+b.decrease||0,expansion=+b.expansion||0,tp=+b.transferPositive||0,tn=+b.transferNegative||0,paid=+b.paid||0;
  safeArray(b.movements).forEach(m=>{const a=+m.amount||0;if(m.type==='Ampliación')expansion+=a;else if(m.type==='Disminución')decrease+=a;else if(m.type==='Transferencia +')tp+=a;else if(m.type==='Transferencia -')tn+=a;else if(m.type==='Pago')paid+=a;});
  const vigente=r2(assigned-decrease+expansion+tp-tn),disponible=r2(vigente-paid);
  return{assigned:r2(assigned),decrease:r2(decrease),expansion:r2(expansion),tp:r2(tp),tn:r2(tn),vigente,paid:r2(paid),disponible,pct:vigente?r2(paid/vigente*100):0};
}
function budgetRows(){return safeArray(db?.projects).filter(p=>p.budgetControl).map(p=>{const s=budgetSnapshot(p),b=p.budgetControl||{};return{'Código':p.code||'','Proyecto':p.name||'','Fuente':b.source||'','Fecha de corte':b.cutDate||'','Asignado':s.assigned,'Disminuciones':s.decrease,'Ampliaciones':s.expansion,'Transferencia +':s.tp,'Transferencia -':s.tn,'Presupuesto vigente':s.vigente,'Pagado':s.paid,'Disponible':s.disponible,'% pagado':s.pct}})}
function budgetMovementRows(){const out=[];safeArray(db?.projects).forEach(p=>safeArray(p.budgetControl?.movements).forEach(m=>out.push(Object.assign({'Código proyecto':p.code||'','Nombre proyecto':p.name||''},flatten(m)))));return out;}
function auditRows(){return safeArray(db?.audit).map(a=>{const u=safeArray(db?.users).find(x=>x.id===a.userId);return Object.assign({'Usuario':u?.name||u?.email||''},flatten(a))})}
function technicalRows(){const raw=JSON.stringify(db,null,2),size=30000,out=[];for(let i=0,n=1;i<raw.length;i+=size,n++)out.push({'Parte':n,'Contenido JSON':raw.slice(i,i+size)});return out;}

function addSheet(XLSX,wb,name,rows){
  const data=rows?.length?rows:[{'Sin datos':'No hay registros en esta sección.'}],ws=XLSX.utils.json_to_sheet(data),headers=Object.keys(data[0]||{});
  if(headers.length)ws['!autofilter']={ref:`A1:${XLSX.utils.encode_col(headers.length-1)}${data.length+1}`};
  ws['!cols']=headers.map(h=>{let m=String(h).length;for(let i=0;i<Math.min(250,data.length);i++)m=Math.max(m,String(data[i]?.[h]??'').length);return{wch:Math.max(10,Math.min(/proyecto|nombre|descrip|observ|detalle|contenido/i.test(h)?50:24,m+2))}});
  const range=XLSX.utils.decode_range(ws['!ref']||'A1:A1');
  for(let c=range.s.c;c<=range.e.c;c++){
    const h=String(ws[XLSX.utils.encode_cell({r:0,c})]?.v||'');
    if(/monto|presupuesto|pagado|disponible|asignado|ampliacion|disminucion|retencion|anticipo|transferencia|precio|total|saldo/i.test(h))for(let r=1;r<=range.e.r;r++){const cell=ws[XLSX.utils.encode_cell({r,c})];if(cell&&cell.t==='n')cell.z='"L" #,##0.00';}
  }
  XLSX.utils.book_append_sheet(wb,ws,name.slice(0,31));
}

async function exportBackupExcel(){
  try{
    if(typeof db==='undefined'||!db)throw new Error('No hay información cargada para respaldar.');
    notify('Preparando respaldo en Excel…');
    const XLSX=await loadSheetJS(),wb=XLSX.utils.book_new(),budgets=budgetRows();
    const bt=budgets.reduce((a,r)=>{a.v+=Number(r['Presupuesto vigente'])||0;a.p+=Number(r.Pagado)||0;a.d+=Number(r.Disponible)||0;return a;},{v:0,p:0,d:0});
    addSheet(XLSX,wb,'Resumen',[
      {'Concepto':'Fecha de generación','Valor':new Date().toLocaleString('es-HN')},
      {'Concepto':'Sistema','Valor':'Control Contractual – Control de Proyectos'},
      {'Concepto':'Proyectos registrados','Valor':safeArray(db.projects).filter(p=>!p.deletedAt).length},
      {'Concepto':'Contratos','Valor':safeArray(db.contracts).length},
      {'Concepto':'Estimaciones','Valor':safeArray(db.estimates).length},
      {'Concepto':'Garantías','Valor':safeArray(db.guarantees).length},
      {'Concepto':'Presupuesto vigente S.A.M.I.','Valor':r2(bt.v)},
      {'Concepto':'Pagado S.A.M.I.','Valor':r2(bt.p)},
      {'Concepto':'Disponible S.A.M.I.','Valor':r2(bt.d)}
    ]);
    addSheet(XLSX,wb,'Proyectos',safeArray(db.projects).map(flatten));
    addSheet(XLSX,wb,'Contratos',rowsLinked(db.contracts));
    addSheet(XLSX,wb,'Estimaciones',rowsLinked(db.estimates));
    addSheet(XLSX,wb,'Pagos',safeArray(db.payments).length?rowsLinked(db.payments):rowsLinked(db.estimates));
    addSheet(XLSX,wb,'Garantías',rowsLinked(db.guarantees));
    addSheet(XLSX,wb,'Modificaciones',rowsLinked(db.modifications||db.changeOrders));
    addSheet(XLSX,wb,'Visitas',rowsLinked(db.visits));
    addSheet(XLSX,wb,'Disponibilidad',budgets);
    addSheet(XLSX,wb,'Mov Presupuestarios',budgetMovementRows());
    addSheet(XLSX,wb,'Usuarios',safeArray(db.users).map(u=>{const x=Object.assign({},u);delete x.password;return flatten(x)}));
    addSheet(XLSX,wb,'Auditoría',auditRows());
    addSheet(XLSX,wb,'Respaldo técnico',technicalRows());
    XLSX.writeFile(wb,`control-contractual-respaldo-${dateStamp()}.xlsx`,{compression:true});
    notify('Respaldo Excel generado correctamente.');
  }catch(err){console.error(err);notify(err?.message||'No se pudo generar el respaldo Excel.');}
}
window.exportBackupExcel=exportBackupExcel;
try{if(typeof exportBackup!=='undefined')exportBackup=exportBackupExcel}catch(_e){}
function wireBackup(){const b=document.getElementById('backupBtn');if(!b)return;b.textContent='⇩ Respaldo Excel';b.onclick=exportBackupExcel;}

/* ---------------- ACCESO INSTITUCIONAL ---------------- */
function installLoginStyles(){
  if(document.getElementById('cp-login-institutional-style'))return;
  const s=document.createElement('style');s.id='cp-login-institutional-style';s.textContent=`
.cp-login-page{min-height:100vh;display:grid;place-items:center;padding:28px;background:radial-gradient(circle at 15% 10%,rgba(37,99,235,.18),transparent 32%),radial-gradient(circle at 90% 90%,rgba(14,165,233,.12),transparent 30%),#060a10;color:#eef4fb}
.cp-login-shell{width:min(1180px,100%);min-height:650px;display:grid;grid-template-columns:1.18fr .82fr;border:1px solid #20314a;border-radius:28px;overflow:hidden;background:#0a111b;box-shadow:0 38px 110px rgba(0,0,0,.48)}
.cp-login-brand{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:58px;background:linear-gradient(145deg,#0b2241 0%,#0b1728 48%,#08111c 100%);overflow:hidden;text-align:center}
.cp-login-brand:before{content:'';position:absolute;width:430px;height:430px;border-radius:50%;border:1px solid rgba(96,165,250,.12);box-shadow:0 0 0 70px rgba(59,130,246,.035),0 0 0 140px rgba(59,130,246,.025)}
.cp-login-brand>*{position:relative;z-index:1}.cp-login-mark{width:126px;height:126px;border-radius:34px;display:grid;place-items:center;background:linear-gradient(145deg,#2563eb,#0ea5e9);font-size:42px;font-weight:950;letter-spacing:-.06em;box-shadow:0 24px 60px rgba(37,99,235,.32);margin-bottom:24px}
.cp-login-brand h1{font-size:46px;line-height:1;margin:0;color:#f8fbff;letter-spacing:.05em}.cp-login-brand h2{font-size:20px;font-weight:500;color:#9cb5cf;margin:10px 0 0}.cp-login-brand p{max-width:560px;color:#7991aa;font-size:13px;margin:24px 0 0;line-height:1.65}.cp-login-brand .cp-brand-line{width:120px;height:3px;border-radius:99px;background:linear-gradient(90deg,transparent,#60a5fa,transparent);margin-top:25px}
.cp-login-access{display:flex;align-items:center;justify-content:center;padding:58px 64px;background:linear-gradient(180deg,#0b121c,#080e16);border-left:1px solid #243854}.cp-login-formbox{width:100%;max-width:390px}.cp-login-kicker{font-size:10px;font-weight:900;letter-spacing:.18em;color:#68a4ff;margin-bottom:9px}.cp-login-formbox h3{font-size:27px;margin:0 0 7px;color:#f4f8fd}.cp-login-sub{color:#7f94aa;font-size:12px;margin:0 0 30px}.cp-login-mode{display:flex;gap:4px;padding:4px;border:1px solid #1e2d40;border-radius:11px;background:#070c13;margin-bottom:22px}.cp-login-mode button{flex:1;border:0;border-radius:8px;padding:9px;background:transparent;color:#70869d;font-weight:800}.cp-login-mode button.active{background:#15263b;color:#e8f2ff;box-shadow:inset 0 0 0 1px #254667}
.cp-login-field{display:block;margin-bottom:17px}.cp-login-field>span{display:block;font-size:12px;font-weight:850;color:#dce7f4;margin-bottom:7px}.cp-login-field input{width:100%;height:47px;background:#f8fafc;color:#111827;border:1px solid #cbd5e1;border-radius:7px;padding:0 13px;font-size:14px;outline:none;box-shadow:none}.cp-login-field input:focus{border-color:#60a5fa;box-shadow:0 0 0 3px rgba(96,165,250,.14)}.cp-login-field small{display:block;color:#688097;font-size:10px;margin-top:5px}.cp-login-submit{width:100%;height:46px;border:1px solid #58a6df;border-radius:9px;background:linear-gradient(180deg,#60b8eb,#2787c6);color:#062348;font-size:14px;font-weight:950;box-shadow:inset 0 1px rgba(255,255,255,.38),0 10px 24px rgba(14,116,180,.18)}.cp-login-submit:hover{filter:brightness(1.06)}.cp-login-message{min-height:18px;margin:13px 0 0;color:#8298ae;font-size:10px;line-height:1.5}.cp-login-message.error{color:#fca5a5}.cp-login-foot{margin-top:26px;padding-top:16px;border-top:1px solid #182536;color:#5f758b;font-size:9px;text-align:center}
@media(max-width:900px){.cp-login-page{padding:16px}.cp-login-shell{grid-template-columns:1fr;min-height:0}.cp-login-brand{padding:34px 24px}.cp-login-mark{width:82px;height:82px;border-radius:24px;font-size:29px;margin-bottom:16px}.cp-login-brand h1{font-size:32px}.cp-login-brand h2{font-size:15px}.cp-login-brand p{display:none}.cp-login-brand .cp-brand-line{margin-top:16px}.cp-login-access{border-left:0;border-top:1px solid #243854;padding:36px 28px}}
@media(max-width:480px){.cp-login-page{padding:0;display:block}.cp-login-shell{min-height:100vh;border:0;border-radius:0}.cp-login-brand{padding:28px 18px 25px}.cp-login-access{padding:31px 20px}.cp-login-formbox h3{font-size:23px}.cp-login-field input{height:48px}}
`;
  document.head.appendChild(s);
}

function institutionalRenderAuth(){
  installLoginStyles();
  const app=document.getElementById('app');if(!app)return;
  app.innerHTML=`<div class="cp-login-page"><main class="cp-login-shell"><section class="cp-login-brand"><div class="cp-login-mark">CC</div><h1>CONTROL</h1><h2>Contractual · Proyectos</h2><div class="cp-brand-line"></div><p>Sistema de seguimiento financiero, contractual y técnico de proyectos. Información centralizada y sincronizada de forma segura.</p></section><section class="cp-login-access"><div class="cp-login-formbox"><div class="cp-login-kicker">ACCESO AL SISTEMA</div><h3 id="cpLoginTitle">Iniciar sesión</h3><p class="cp-login-sub" id="cpLoginSub">Ingrese sus credenciales para continuar.</p><div class="cp-login-mode"><button type="button" class="active" id="loginTab">Ingresar</button><button type="button" id="registerTab">Crear acceso</button></div><form id="authForm"><label class="cp-login-field reg" style="display:none"><span>Nombre completo:</span><input id="authName" autocomplete="name"></label><label class="cp-login-field"><span>Usuario / Correo:</span><input id="authEmail" type="email" required autocomplete="email"></label><label class="cp-login-field"><span>Clave:</span><input id="authPass" type="password" minlength="8" required autocomplete="current-password"></label><button class="cp-login-submit" id="authSubmit">Ingresar</button><p class="cp-login-message" id="authMessage">Acceso protegido mediante Supabase.</p></form><div class="cp-login-foot">CONTROL CONTRACTUAL · CONTROL DE PROYECTOS</div></div></section></main></div>`;
  let mode='login';
  const setMode=m=>{mode=m;const login=document.getElementById('loginTab'),reg=document.getElementById('registerTab'),name=document.querySelector('.cp-login-field.reg'),submit=document.getElementById('authSubmit'),pass=document.getElementById('authPass'),title=document.getElementById('cpLoginTitle'),sub=document.getElementById('cpLoginSub'),msg=document.getElementById('authMessage');login?.classList.toggle('active',m==='login');reg?.classList.toggle('active',m==='register');if(name)name.style.display=m==='register'?'block':'none';if(submit)submit.textContent=m==='login'?'Ingresar':'Crear acceso';if(pass)pass.autocomplete=m==='login'?'current-password':'new-password';if(title)title.textContent=m==='login'?'Iniciar sesión':'Crear acceso';if(sub)sub.textContent=m==='login'?'Ingrese sus credenciales para continuar.':'Registre el usuario que tendrá acceso al sistema.';if(msg){msg.classList.remove('error');msg.textContent=m==='login'?'Acceso protegido mediante Supabase.':'La cuenta quedará vinculada al espacio de trabajo en la nube.';}};
  document.getElementById('loginTab').onclick=()=>setMode('login');document.getElementById('registerTab').onclick=()=>setMode('register');
  document.getElementById('authForm').onsubmit=async e=>{
    e.preventDefault();
    const email=document.getElementById('authEmail').value.trim().toLowerCase(),password=document.getElementById('authPass').value,name=document.getElementById('authName').value.trim(),btn=document.getElementById('authSubmit'),msg=document.getElementById('authMessage');
    btn.disabled=true;msg.classList.remove('error');msg.textContent='Procesando…';
    try{
      if(mode==='register'){
        if(!name)throw new Error('Escriba el nombre completo.');
        const r=await fetch(SUPABASE_URL+'/auth/v1/signup',{method:'POST',headers:{'apikey':SUPABASE_KEY,'Content-Type':'application/json'},body:JSON.stringify({email,password,data:{full_name:name}})}),d=await r.json();
        if(!r.ok)throw new Error(d.msg||d.message||d.error_description||'No se pudo crear el acceso.');
        if(!d.access_token){msg.textContent='Cuenta creada. Revise su correo para confirmar el acceso y luego ingrese.';setMode('login');return;}
        session={userId:d.user.id,email:d.user.email,accessToken:d.access_token,refreshToken:d.refresh_token,expiresAt:Date.now()+(d.expires_in||3600)*1000};localStorage.setItem(SESSION,JSON.stringify(session));cloudLoaded=false;await render();
      }else{
        const r=await fetch(SUPABASE_URL+'/auth/v1/token?grant_type=password',{method:'POST',headers:{'apikey':SUPABASE_KEY,'Content-Type':'application/json'},body:JSON.stringify({email,password})}),d=await r.json();
        if(!r.ok)throw new Error(d.error_description||d.msg||d.message||'Usuario o clave incorrectos.');
        session={userId:d.user.id,email:d.user.email,accessToken:d.access_token,refreshToken:d.refresh_token,expiresAt:Date.now()+(d.expires_in||3600)*1000};localStorage.setItem(SESSION,JSON.stringify(session));cloudLoaded=false;await render();
      }
    }catch(err){msg.classList.add('error');msg.textContent=err.message||'No se pudo completar la operación.';}finally{btn.disabled=false;}
  };
}

function installLoginOverride(){
  installLoginStyles();
  try{if(typeof renderAuth==='function'&&!renderAuth.__cpInstitutional){institutionalRenderAuth.__cpInstitutional=true;renderAuth=institutionalRenderAuth;}}catch(_e){}
  try{if(typeof renderApp==='function'&&!renderApp.__cpExcelWire){const base=renderApp;const wrapped=function(){const result=base.apply(this,arguments);queueMicrotask(wireBackup);return result};wrapped.__cpExcelWire=true;renderApp=wrapped;}}catch(_e){}
  wireBackup();
  const authVisible=!document.querySelector('.shell')&&!!document.getElementById('authForm');
  if(authVisible&&!document.querySelector('.cp-login-page'))institutionalRenderAuth();
}

installLoginOverride();
setTimeout(installLoginOverride,0);
setTimeout(installLoginOverride,250);
setTimeout(installLoginOverride,900);
})();