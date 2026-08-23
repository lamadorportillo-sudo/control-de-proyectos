/* ===== SEGURIDAD DE SESIÓN Y CONTENIDO V1 ===== */
(()=>{
'use strict';
if(window.__CC_SECURITY_RUNTIME_V1__)return;
window.__CC_SECURITY_RUNTIME_V1__=true;

const SESSION_KEY='control_contractual_session_v3';
const STORE_KEY='control_contractual_independiente_v3';
const IDLE_LIMIT=30*60*1000;
const IDLE_WARNING=25*60*1000;
const ABSOLUTE_LIMIT=12*60*60*1000;
let lastActivity=Date.now(),warned=false,loggingOut=false,lastTouchWrite=0;

function session(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}}
function userId(){return session()?.userId||''}
function role(){try{return String(cloudRole||currentUser?.()?.role||'consulta')}catch{return'consulta'}}
function loginKey(){return `cc_security_login_started_v1:${userId()||'anon'}`}
function activityKey(){return `cc_security_last_activity_v1:${userId()||'anon'}`}
function say(msg){try{toast(msg)}catch{console.warn(msg)}}

function meta(){
 if(!document.querySelector('meta[name="referrer"]')){const m=document.createElement('meta');m.name='referrer';m.content='no-referrer';document.head.appendChild(m)}
 if(!document.querySelector('meta[http-equiv="Content-Security-Policy"]')){const m=document.createElement('meta');m.httpEquiv='Content-Security-Policy';m.content="object-src 'none'; base-uri 'self'; form-action 'self'";document.head.appendChild(m)}
}

function css(){
 if(document.getElementById('cc-security-runtime-style'))return;
 const s=document.createElement('style');s.id='cc-security-runtime-style';s.textContent=`
 body.cc-content-shield #app{filter:blur(18px);pointer-events:none;user-select:none}
 body.cc-content-shield:before{content:'Contenido protegido';position:fixed;inset:0;z-index:2147483646;display:grid;place-items:center;background:#071019;color:#dce8df;font:800 18px/1.2 system-ui;letter-spacing:.04em}
 body.cc-consulta-security .report-paper{position:relative!important}
 body.cc-consulta-security .report-paper:after{content:attr(data-security-watermark);position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) rotate(-28deg);font:800 clamp(22px,5vw,48px)/1 system-ui;color:rgba(73,101,69,.085);letter-spacing:.08em;white-space:nowrap;pointer-events:none;z-index:10}
 .cc-security-badge{position:fixed;left:10px;bottom:10px;z-index:80;border:1px solid rgba(88,119,71,.28);background:rgba(255,255,255,.90);color:#536158;border-radius:999px;padding:5px 8px;font:800 9px/1 system-ui;box-shadow:0 5px 18px rgba(31,50,35,.10);pointer-events:none}
 @media(max-width:620px){.cc-security-badge{bottom:74px;font-size:8px}}
 `;document.head.appendChild(s);
}

function frameGuard(){
 try{if(window.top!==window.self){document.documentElement.style.display='none';window.top.location=window.self.location.href}}catch{document.documentElement.style.display='none'}
}

function stampReports(){
 const isConsulta=role()==='consulta';document.body.classList.toggle('cc-consulta-security',isConsulta);
 document.querySelectorAll('.report-paper').forEach(el=>{if(isConsulta){let name='USUARIO';try{name=currentUser?.()?.name||session()?.email||'USUARIO'}catch{}el.setAttribute('data-security-watermark',`SOLO CONSULTA · ${String(name).slice(0,40)}`)}else el.removeAttribute('data-security-watermark')});
 let badge=document.querySelector('.cc-security-badge');
 if(isConsulta&&session()){if(!badge){badge=document.createElement('div');badge.className='cc-security-badge';document.body.appendChild(badge)}badge.textContent='SOLO CONSULTA · sesión protegida'}else badge?.remove();
}

function restrictBulkExport(){
 const allowed=role()==='admin';
 document.querySelectorAll('[data-ccx-backup]').forEach(btn=>{if(!allowed){btn.setAttribute('hidden','');btn.setAttribute('aria-hidden','true');btn.tabIndex=-1}else{btn.removeAttribute('hidden');btn.removeAttribute('aria-hidden')}});
}

function touch(){
 const s=session();if(!s)return;lastActivity=Date.now();warned=false;
 if(lastActivity-lastTouchWrite>5000){lastTouchWrite=lastActivity;try{localStorage.setItem(activityKey(),String(lastActivity))}catch{}}
}

async function logout(reason){
 if(loggingOut)return;loggingOut=true;
 try{say(reason||'La sesión se cerró por seguridad.')}catch{}
 await new Promise(r=>setTimeout(r,250));
 try{if(typeof cloudSignOut==='function'){await cloudSignOut();return}}catch{}
 try{localStorage.removeItem(SESSION_KEY);localStorage.removeItem(STORE_KEY)}catch{}
 location.reload();
}

function initSessionClock(){
 const s=session();if(!s)return;
 const key=loginKey();let start=Number(localStorage.getItem(key)||0);if(!start||start>Date.now()){start=Date.now();try{localStorage.setItem(key,String(start))}catch{}}
 let saved=Number(localStorage.getItem(activityKey())||0);if(saved&&saved<=Date.now())lastActivity=Math.max(lastActivity,saved);
}

function enforce(){
 const s=session();if(!s)return;
 const now=Date.now(),start=Number(localStorage.getItem(loginKey())||now),shared=Number(localStorage.getItem(activityKey())||0),activity=Math.max(lastActivity,shared||0);
 if(now-start>=ABSOLUTE_LIMIT){logout('Por seguridad, la sesión alcanzó su límite de 12 horas. Ingrese nuevamente.');return}
 const idle=now-activity;
 if(idle>=IDLE_LIMIT){logout('La sesión se cerró después de 30 minutos sin actividad.');return}
 if(idle>=IDLE_WARNING&&!warned){warned=true;say('Seguridad: la sesión se cerrará en 5 minutos si no hay actividad.')}
}

function privacyOnBackground(){
 if(!session())return document.body.classList.remove('cc-content-shield');
 document.body.classList.toggle('cc-content-shield',document.visibilityState==='hidden');
}

function cleanConsultaCache(){
 if(role()!=='consulta')return;
 try{localStorage.removeItem(STORE_KEY)}catch{}
}

function run(){css();meta();frameGuard();initSessionClock();stampReports();restrictBulkExport()}

['pointerdown','keydown','touchstart','mousedown'].forEach(type=>addEventListener(type,touch,{passive:true,capture:true}));
addEventListener('scroll',touch,{passive:true,capture:true});
document.addEventListener('visibilitychange',privacyOnBackground,{passive:true});
addEventListener('pagehide',cleanConsultaCache,{passive:true});
addEventListener('storage',e=>{if(e.key===SESSION_KEY&&!e.newValue&&session()===null)location.reload();if(e.key&&e.key.startsWith('cc_security_last_activity_v1:'))lastActivity=Math.max(lastActivity,Number(e.newValue||0))});
document.addEventListener('click',e=>{const b=e.target.closest?.('[data-ccx-backup]');if(b&&role()!=='admin'){e.preventDefault();e.stopImmediatePropagation();say('El respaldo completo está reservado para administradores.')}},true);
new MutationObserver(()=>{stampReports();restrictBulkExport()}).observe(document.documentElement,{subtree:true,childList:true});
setInterval(enforce,30000);
setInterval(()=>{stampReports();restrictBulkExport()},2500);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
window.__ccSecurity={enforce,touch,logout,stampReports,restrictBulkExport};
})();
