/* ===== VINCULACION PRESUPUESTARIA POR PROYECTO V2 ===== */
(()=>{
  'use strict';
  if(window.__CP_BUDGET_PROJECT_LINK_V2__) return;
  window.__CP_BUDGET_PROJECT_LINK_V2__=true;

  const round2=v=>Math.round((Number(v)||0)*100)/100;
  const money=v=>`L ${round2(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
  const esc2=s=>typeof esc==='function'?esc(String(s??'')):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function values(p){
    const b=p?.budgetControl;
    if(!b) return null;
    let assigned=+b.assigned||0,decrease=+b.decrease||0,expansion=+b.expansion||0,tp=+b.transferPositive||0,tn=+b.transferNegative||0,paid=+b.paid||0;
    (Array.isArray(b.movements)?b.movements:[]).forEach(m=>{
      const a=+m.amount||0;
      if(m.type==='Ampliación') expansion+=a;
      else if(m.type==='Disminución') decrease+=a;
      else if(m.type==='Transferencia +') tp+=a;
      else if(m.type==='Transferencia -') tn+=a;
      else if(m.type==='Pago') paid+=a;
    });
    const vigente=round2(assigned-decrease+expansion+tp-tn);
    return {vigente,paid:round2(paid),disponible:round2(vigente-paid)};
  }

  function ensureLinks(){
    if(typeof db==='undefined'||!db||!Array.isArray(db.projects)) return false;
    let changed=false;
    db.projects.forEach(p=>{
      if(!p?.budgetControl) return;
      const b=p.budgetControl;
      const next={projectId:p.id,projectCode:p.code||'',linked:true};
      if(b.projectId!==next.projectId||b.projectCode!==next.projectCode||b.linked!==true){
        b.projectId=next.projectId;
        b.projectCode=next.projectCode;
        b.linked=true;
        b.linkedAt=b.linkedAt||new Date().toISOString();
        changed=true;
      }
    });
    if(changed&&typeof saveDB==='function'){
      try{saveDB();}catch(_e){}
    }
    return changed;
  }

  function injectStyle(){
    if(document.getElementById('budget-project-link-v2-style')) return;
    const s=document.createElement('style');
    s.id='budget-project-link-v2-style';
    s.textContent=`
      .budget-linked-strip{display:grid;grid-template-columns:minmax(180px,1.5fr) repeat(3,minmax(140px,.65fr));gap:8px;margin:0 0 12px;padding:10px;border:1px solid rgba(34,197,94,.28);border-radius:13px;background:linear-gradient(135deg,rgba(10,39,27,.92),rgba(8,20,25,.96))}
      .budget-linked-strip .bl-main,.budget-linked-strip .bl-metric{min-width:0;padding:7px 9px}
      .budget-linked-strip .bl-main small,.budget-linked-strip .bl-metric small{display:block;color:#8fb9a4;font-size:9px;text-transform:uppercase;letter-spacing:.05em}
      .budget-linked-strip .bl-main b{display:block;margin-top:3px;color:#bbf7d0;font-size:12px}.budget-linked-strip .bl-main span{display:block;color:#759387;font-size:9px;margin-top:3px}
      .budget-linked-strip .bl-metric{border-left:1px solid rgba(134,239,172,.12)}.budget-linked-strip .bl-metric b{display:block;margin-top:3px;font-size:13px}.budget-linked-strip .bl-metric.available b{color:#86efac;font-size:15px}
      .budget-linked-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 7px;border-radius:999px;border:1px solid rgba(34,197,94,.3);background:rgba(34,197,94,.08);color:#bbf7d0;font-size:8px;font-weight:900;margin-left:6px;vertical-align:middle}
      @media(max-width:760px){.budget-linked-strip{grid-template-columns:1fr 1fr}.budget-linked-strip .bl-main{grid-column:1/-1}.budget-linked-strip .bl-metric{border-left:0;border-top:1px solid rgba(134,239,172,.1)}}
      @media(max-width:440px){.budget-linked-strip{grid-template-columns:1fr}}
    `;
    document.head.appendChild(s);
  }

  function decorateProject(){
    if(typeof db==='undefined'||!db||typeof view==='undefined'||view.screen!=='project') return;
    const p=(db.projects||[]).find(x=>x.id===view.projectId&&!x.deletedAt);
    if(!p?.budgetControl) return;
    const v=values(p);if(!v)return;
    const content=document.getElementById('content');if(!content)return;
    const old=content.querySelector('[data-budget-linked-strip]');if(old)old.remove();
    const strip=document.createElement('section');
    strip.className='budget-linked-strip';strip.dataset.budgetLinkedStrip='1';
    strip.innerHTML=`<div class="bl-main"><small>Vinculación presupuestaria</small><b>✓ S.A.M.I. vinculado a este expediente</b><span>BIPM ${esc2(p.code||'—')} · ${esc2(p.budgetControl.source||'Control presupuestario')}</span></div><div class="bl-metric"><small>Vigente</small><b>${money(v.vigente)}</b></div><div class="bl-metric"><small>Pagado</small><b>${money(v.paid)}</b></div><div class="bl-metric available"><small>Disponible</small><b>${money(v.disponible)}</b></div>`;
    const panel=content.querySelector('.panel');
    if(panel) panel.insertAdjacentElement('beforebegin',strip); else content.prepend(strip);

    const title=content.querySelector('.panel-head h2');
    if(title&&!title.parentElement.querySelector('.budget-linked-badge')){
      const badge=document.createElement('span');badge.className='budget-linked-badge';badge.textContent='✓ S.A.M.I. vinculado';title.insertAdjacentElement('afterend',badge);
    }
  }

  function decorateCards(){
    if(typeof db==='undefined'||!db||typeof view==='undefined'||view.screen==='project') return;
    document.querySelectorAll('[data-open], [data-dashboard-open], .project-v3').forEach(el=>{
      let id=el.dataset?.open||el.dataset?.dashboardOpen||el.dataset?.projectId||el.closest?.('[data-open]')?.dataset?.open;
      if(!id&&el.classList?.contains('project-v3')){
        const b=el.querySelector('[data-open]');id=b?.dataset?.open;
      }
      if(!id)return;
      const p=(db.projects||[]).find(x=>x.id===id&&!x.deletedAt);if(!p?.budgetControl)return;
      if(el.querySelector?.('.budget-linked-badge'))return;
      const target=el.querySelector?.('h3')||el.querySelector?.('.project-v3-code');if(!target)return;
      const badge=document.createElement('span');badge.className='budget-linked-badge';badge.textContent='S.A.M.I.';target.insertAdjacentElement('afterend',badge);
    });
  }

  function decorate(){ensureLinks();injectStyle();decorateProject();decorateCards();}

  const observer=new MutationObserver(()=>setTimeout(decorate,0));
  observer.observe(document.documentElement,{subtree:true,childList:true});
  setTimeout(decorate,0);setTimeout(decorate,500);setTimeout(decorate,1500);

  if(typeof renderApp==='function'){
    const base=renderApp;
    renderApp=function(){const r=base.apply(this,arguments);setTimeout(decorate,0);return r;};
  }
})();
