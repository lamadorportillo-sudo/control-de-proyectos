/* ===== CONTROL CONTRACTUAL · SISTEMA VISUAL CORPORATIVO V1 ===== */
(()=>{
'use strict';
if(window.__CC_CORPORATE_UI_V1__)return;
window.__CC_CORPORATE_UI_V1__=true;

function injectStyle(){
  if(document.getElementById('cc-corporate-ui-v1-style'))return;
  const s=document.createElement('style');
  s.id='cc-corporate-ui-v1-style';
  s.textContent=`
:root{
  color-scheme:light!important;
  --bg:#f2f5f9!important;--panel:#ffffff!important;--panel2:#f8fafc!important;
  --line:#dfe7f0!important;--text:#172231!important;--muted:#6c7c8f!important;
  --accent:#1769c2!important;--accent2:#0b4f93!important;--good:#168a5b!important;
  --warn:#c88711!important;--orange:#d66d12!important;--danger:#c23e48!important;
  --cyan:#147aa1!important;--shadow:0 12px 34px rgba(23,45,73,.08)!important;
}
html,body{background:#f2f5f9!important;color:#172231!important}
body{background-image:linear-gradient(180deg,#e8f1fb 0,#f2f5f9 240px,#f2f5f9 100%)!important}
.shell{max-width:1580px!important;padding:18px 24px 34px!important}
.topbar{position:relative;margin:0 0 12px!important;padding:18px 20px!important;border-radius:18px!important;background:linear-gradient(120deg,#082c52,#0d4e8c 58%,#1769c2)!important;box-shadow:0 16px 42px rgba(12,57,101,.18)!important;color:#fff!important}
.topbar h1,.topbar h2,.topbar h3,.topbar p,.topbar .muted,.topbar small{color:#fff!important}.topbar .muted{opacity:.72}
.logo{background:rgba(255,255,255,.14)!important;border:1px solid rgba(255,255,255,.28)!important;color:#fff!important;box-shadow:none!important}
.top-actions .btn,.topbar .btn{background:rgba(255,255,255,.10)!important;border-color:rgba(255,255,255,.24)!important;color:#fff!important}.top-actions .btn:hover,.topbar .btn:hover{background:rgba(255,255,255,.18)!important}
.userbox,.avatar{color:#fff}.avatar{background:rgba(255,255,255,.16)!important;border:1px solid rgba(255,255,255,.22)!important}

.ccx-nav{position:sticky!important;top:8px!important;z-index:24!important;display:flex!important;gap:3px!important;margin:0 0 14px!important;padding:6px!important;background:rgba(255,255,255,.94)!important;border:1px solid #dce5ef!important;border-radius:14px!important;box-shadow:0 8px 26px rgba(22,50,79,.07)!important;backdrop-filter:blur(12px)!important}
.ccx-nav button{color:#60748a!important;background:transparent!important;border:0!important;border-radius:9px!important;padding:9px 13px!important;font-size:11px!important;font-weight:750!important}.ccx-nav button:hover{background:#eef5fc!important;color:#0c5ca9!important}.ccx-nav button.active{background:#e7f1fc!important;color:#0b5ead!important;box-shadow:inset 0 0 0 1px #c5dbf1!important}
.ccx-sync{background:#fff!important;border:1px solid #e1e8f0!important;color:#718196!important;border-radius:10px!important;box-shadow:none!important}.ccx-sync b{color:#168a5b!important}

.panel,.card,.kpi,.info,.advance>div,.ccx-kpi,.ccx-access button,.ccx-fold,.ccx-row,.ccx-alert,.ccx-report,.ccx-integrity,.ccx-projbar,.ccx-server,.ccg-panel,.ccg-kpi,.ccg-year,.ccg-issue,.ccg-form-section,.ccg-project-rule,.report-type-card{
  background:#fff!important;color:#172231!important;border-color:#dfe7f0!important;box-shadow:0 8px 28px rgba(24,48,75,.055)!important
}
.panel,.ccg-panel{border-radius:14px!important}.card,.kpi,.ccx-kpi,.ccx-access button,.ccg-kpi,.ccg-year{border-radius:12px!important}
.ccx-kpi strong,.ccx-access strong,.ccg-kpi strong,.money,.kpi strong{color:#12263b!important}
.ccx-kpi.good,.ccg-kpi.good,.ccx-integrity{border-color:#bfe4d1!important;background:#f7fcf9!important}.ccx-kpi.good strong,.ccg-kpi.good strong,.ccx-integrity strong{color:#13794f!important}
.ccx-kpi.warn,.ccg-kpi.warn{border-color:#efdba8!important;background:#fffaf0!important}.ccx-kpi.warn strong,.ccg-kpi.warn strong{color:#a66a08!important}
.ccx-exec{background:linear-gradient(120deg,#0b365f,#0f62aa)!important;border-color:#1c6db0!important;border-radius:14px!important;box-shadow:0 12px 30px rgba(15,84,145,.14)!important}.ccx-exec>div{background:rgba(255,255,255,.09)!important;border-color:rgba(255,255,255,.14)!important;color:#fff!important}.ccx-exec small,.ccx-exec strong{color:#fff!important}.ccx-bar{background:rgba(255,255,255,.2)!important}.ccx-bar i{background:#6ee7a5!important}
.ccx-fold summary{color:#22364b!important}.ccx-row,.ccx-alert{background:#fff!important}.ccx-alert.crit{background:#fff5f6!important;border-color:#efc8cc!important}

.input,input,select,textarea{background:#fff!important;color:#172231!important;border:1px solid #ccd8e5!important;border-radius:9px!important;box-shadow:inset 0 1px 1px rgba(16,42,67,.025)!important}.input:focus,input:focus,select:focus,textarea:focus{border-color:#2f80ed!important;box-shadow:0 0 0 3px rgba(47,128,237,.12)!important}.field span{color:#3c4e61!important}.field small,.muted,.notice,.words,.ccx-head p,.ccg-head p,.ccg-year small,.ccg-issue small{color:#74869a!important}
.btn{background:#fff!important;color:#294158!important;border:1px solid #cfdbe7!important;border-radius:9px!important;box-shadow:0 2px 4px rgba(23,45,73,.03)!important}.btn:hover{background:#f4f8fc!important;border-color:#abc2d8!important}.btn.primary{background:linear-gradient(135deg,#1769c2,#2f80ed)!important;color:#fff!important;border-color:#1769c2!important}.btn.good{background:#edf9f3!important;color:#13794f!important;border-color:#b7dfca!important}.btn.danger{background:#fff3f4!important;color:#ae313c!important;border-color:#edc3c7!important}

.tabs{padding:5px!important;background:#eef3f8!important;border-radius:11px!important;gap:3px!important}.tabs button{border:0!important;background:transparent!important;color:#60748a!important;border-radius:8px!important}.tabs button.active{background:#fff!important;color:#0b5ead!important;box-shadow:0 2px 8px rgba(20,48,78,.08)!important}
.table-wrap{background:#fff!important;border-color:#dfe7f0!important;border-radius:12px!important}.table th{background:#f4f7fa!important;color:#5d7186!important;border-bottom-color:#dfe7f0!important}.table td{color:#24384d!important;border-bottom-color:#edf1f5!important}.table tbody tr:hover{background:#f8fbfe!important}
.status,.pill{background:#eef3f8!important;border-color:#d8e2ed!important;color:#4a6076!important}.status.good,.pill.good{background:#eaf7f0!important;border-color:#bfe2cf!important;color:#13794f!important}.status.warn,.pill.warn{background:#fff5dc!important;border-color:#ecd79f!important;color:#9a6509!important}.status.danger,.pill.danger{background:#fcedef!important;border-color:#efc6ca!important;color:#ad3540!important}.status.blue,.pill.blue{background:#eaf4ff!important;border-color:#c5ddf5!important;color:#1769c2!important}

.modal-bg{background:rgba(13,35,57,.52)!important;backdrop-filter:blur(7px)!important}.modal{background:#fff!important;color:#172231!important;border-color:#d9e3ed!important;border-radius:16px!important;box-shadow:0 32px 80px rgba(11,38,65,.24)!important}.modal-head{background:#fff!important;border-bottom-color:#e3eaf1!important}.modal-head h2,.modal-head h3{color:#172231!important}.modal-body{background:#fff!important}
.alert{background:#fff8e8!important;border-color:#efd99d!important;color:#8d5b05!important}.alert.danger{background:#fff1f2!important;border-color:#efc4c8!important;color:#a92f3a!important}.alert.good{background:#edf9f3!important;border-color:#bce0cb!important;color:#13794f!important}.alert.info{background:#edf6ff!important;border-color:#c3dcf3!important;color:#1769c2!important}

.ccg-note{background:#f1f7fd!important;border-color:#cbdfee!important;color:#45627d!important}.ccg-note.good{background:#edf9f3!important;border-color:#bfe2ce!important;color:#13794f!important}.ccg-note.warn{background:#fff8e8!important;border-color:#efd99d!important;color:#8c5b06!important}.ccg-rule{background:#f7f9fc!important;border-color:#e2e9f0!important;color:#34495e!important}.ccg-badge{background:#f2f6fa!important;border-color:#d6e0ea!important;color:#526a80!important}.ccg-badge.good{background:#eaf7f0!important;border-color:#bfe2cf!important;color:#13794f!important}.ccg-badge.lock{background:#eef2f6!important;border-color:#d1dbe6!important;color:#4b6075!important}.ccg-preview{background:#eef6fe!important;border-color:#c6dcf0!important;color:#395c7a!important}.ccg-preview.good{background:#edf9f3!important;border-color:#bce0cb!important;color:#13794f!important}.ccg-preview.warn{background:#fff8e8!important;border-color:#efd99d!important;color:#8d5b05!important}

.auth{background:linear-gradient(140deg,#072b50,#0c4f8d 58%,#1769c2)!important}.auth-card{background:#fff!important;color:#172231!important;border-color:rgba(255,255,255,.45)!important;box-shadow:0 30px 80px rgba(3,30,56,.28)!important}.auth-card h1,.auth-card h2,.auth-card h3{color:#172231!important}.seg{background:#eef3f8!important;border-color:#dbe4ee!important}.seg button{color:#61758a!important}.seg button.active{background:#fff!important;color:#0c5ca9!important;box-shadow:0 2px 8px rgba(22,52,82,.08)!important}
.toast{background:#173a5c!important;border-color:#245c8f!important;color:#fff!important;box-shadow:0 16px 36px rgba(10,48,83,.25)!important}

.report-paper{box-shadow:0 18px 50px rgba(23,45,73,.12)!important}.project-context{background:#fff!important;border-color:#dbe5ef!important;color:#172231!important}.project-context .ctx{border-color:#e3eaf1!important}.project-context small{color:#71849a!important}.project-context .ctx:first-child strong{color:#1769c2!important}

@media(max-width:720px){.shell{padding:10px 10px 24px!important}.topbar{padding:15px!important;border-radius:14px!important}.ccx-nav{top:4px!important}.ccx-nav button{padding:8px 10px!important}.ccg-kpis,.ccx-kpis,.ccx-access{gap:7px!important}}
`;
  document.head.appendChild(s);
}

function labels(){
  const map={home:'Dashboard',projects:'Proyectos',budget:'Presupuesto',alerts:'Alertas',audit:'Auditoría',reports:'Reportes'};
  document.querySelectorAll('#ccxNav [data-ccx]').forEach(b=>{const k=b.dataset.ccx;if(map[k])b.textContent=map[k]});
  const g=document.getElementById('ccgNavBtn');if(g)g.textContent='Gacetas';
}

function brand(){
  document.body.classList.add('cc-corporate-ready');
  document.documentElement.style.colorScheme='light';
  const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content='#0b4f93';
  const top=document.querySelector('.topbar');if(!top)return;
  const brand=top.querySelector('.brand');
  if(brand&&!brand.querySelector('[data-cc-corp-sub]')){
    const text=brand.querySelector('div:last-child');
    if(text){const p=document.createElement('div');p.dataset.ccCorpSub='1';p.textContent='Gestión técnica, financiera y contractual';p.style.cssText='font-size:10px;opacity:.72;margin-top:1px;letter-spacing:.01em';text.appendChild(p)}
  }
}

function apply(){injectStyle();brand();labels();}

if(typeof renderApp==='function'&&!renderApp.__ccCorporateUi){
  const base=renderApp;
  const wrapped=function(){const r=base.apply(this,arguments);setTimeout(apply,0);return r};
  wrapped.__ccCorporateUi=true;renderApp=wrapped;
}

apply();setTimeout(apply,250);setTimeout(apply,900);
})();
