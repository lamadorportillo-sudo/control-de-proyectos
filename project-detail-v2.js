/* CONTROL CONTRACTUAL · RESUMEN COMPACTO DE EXPEDIENTE V2 */
(()=>{
'use strict';
if(window.__CC_PROJECT_DETAIL_V2__)return;window.__CC_PROJECT_DETAIL_V2__=true;
const NativeObserver=window.__ccNativeMutationObserver||window.MutationObserver;
const esc2=v=>typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const pct2=v=>Math.max(0,Math.min(100,Number(v)||0));
function moneyC(v){try{return typeof fmtC==='function'?fmtC(Number(v)||0):`L ${(Number(v)||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`}catch{return'L 0.00'}}
function dateText(v){try{return typeof dmy==='function'?dmy(v):(v||'—')}catch{return v||'—'}}
function dayDiff(end){if(!end)return null;const a=new Date(),b=new Date(end+'T12:00:00');a.setHours(12,0,0,0);return Math.ceil((b-a)/86400000)}
function enhanceProject(){
  try{
    if(typeof view==='undefined'||view.screen!=='project'||!view.projectId||typeof db==='undefined')return;
    const content=document.getElementById('content');if(!content)return;
    if(content.querySelector('.cc-project-hero'))return;
    const p=(db.projects||[]).find(x=>x.id===view.projectId&&!x.deletedAt);if(!p)return;
    const c=(db.contracts||[]).find(x=>x.projectId===p.id)||null;
    const fin=typeof projectFinancials==='function'?projectFinancials(p,c):{};
    const prog=typeof projectAutomaticProgress==='function'?projectAutomaticProgress(p,c):{physical:0,financial:0};
    const end=c?.end||p.end||'',left=dayDiff(end),days=c?.executionDays||p.executionDays||0;
    const visits=(db.visits||[]).filter(v=>v.projectId===p.id).length;
    const guarantees=(db.guarantees||[]).filter(g=>g.projectId===p.id);
    const alertCount=typeof guaranteeAlert==='function'?guarantees.filter(g=>['warning','attention','critical','urgent','expired'].includes(guaranteeAlert(g.end).level)).length:0;
    const amountC=fin.currentC!=null?fin.currentC:(typeof cents==='function'?cents(c?.currentAmount??p.budget):Number(c?.currentAmount??p.budget)*100);
    const estimatedC=fin.grossC||0,paidC=fin.totalPaidC||0,saldoC=fin.saldoEstimarC||0;
    const advance=Number(c?.advancePaid||c?.advanceApproved||0);
    const physical=pct2(prog.physical),financial=pct2(prog.financial);
    const status=p.status||c?.status||'N/D';
    const contractor=c?.contractor||'N/D';
    const hero=document.createElement('section');hero.className='cc-project-hero';
    hero.innerHTML=`<div class="cc-project-hero-head"><div class="cc-project-hero-title"><small>EXPEDIENTE DIGITAL · ${esc2(p.code||'SIN CÓDIGO')}</small><h2>${esc2(p.name||'Proyecto')}</h2><p>${esc2(p.location||'Ubicación no registrada')} · ${esc2(c?.number?`Contrato ${c.number}`:'Contrato pendiente')}</p></div><span class="cc-project-state">${esc2(status)}</span></div>
    <div class="cc-project-keygrid">
      <div class="cc-project-key"><small>Código</small><b>${esc2(p.code||'N/D')}</b></div>
      <div class="cc-project-key"><small>Contratista</small><b title="${esc2(contractor)}">${esc2(contractor)}</b></div>
      <div class="cc-project-key money"><small>Monto contractual</small><b>${moneyC(amountC)}</b></div>
      <div class="cc-project-key advance"><small>Anticipo</small><b>${advance?moneyC(Math.round(advance*100)):'N/D'}</b></div>
      <div class="cc-project-key"><small>Plazo</small><b>${days?`${days} días`:'N/D'}${left!=null?` · ${left>=0?left+' restantes':Math.abs(left)+' vencidos'}`:''}</b></div>
      <div class="cc-project-key"><small>Fecha final</small><b>${dateText(end)}</b></div>
    </div>
    <div class="cc-project-progresses">
      <div class="cc-project-progress"><div class="cc-project-progress-head"><span>Avance físico</span><b>${physical.toFixed(2)}%</b></div><div class="cc-project-track"><i style="width:${physical}%"></i></div></div>
      <div class="cc-project-progress"><div class="cc-project-progress-head"><span>Avance financiero</span><b>${financial.toFixed(2)}%</b></div><div class="cc-project-track"><i class="fin" style="width:${financial}%"></i></div></div>
    </div>
    <div class="cc-project-mini"><div><small>Total estimado</small><b>${moneyC(estimatedC)}</b></div><div><small>Total pagado</small><b>${moneyC(paidC)}</b></div><div><small>Saldo por estimar</small><b>${moneyC(saldoC)}</b></div><div><small>Supervisión</small><b>${visits} visita${visits===1?'':'s'} · ${alertCount} alerta${alertCount===1?'':'s'}</b></div></div>`;
    const back=content.querySelector('.back');if(back)back.insertAdjacentElement('afterend',hero);else content.prepend(hero);
    content.classList.add('cc-project-enhanced');
  }catch(e){console.warn('Detalle compacto no disponible:',e?.message||e)}
}
if(NativeObserver)new NativeObserver(()=>enhanceProject()).observe(document.getElementById('app')||document.documentElement,{childList:true,subtree:true});
setTimeout(enhanceProject,80);setTimeout(enhanceProject,600);
})();
