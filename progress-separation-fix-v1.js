/* ===== SEPARAR AVANCE FÍSICO Y FINANCIERO V1 ===== */
(()=>{
'use strict';
if(window.__CC_PROGRESS_SEPARATION_FIX_V1__)return;
window.__CC_PROGRESS_SEPARATION_FIX_V1__=true;

const A=v=>Array.isArray(v)?v:[];
const N=v=>Number.isFinite(Number(v))?Number(v):0;
const clamp=v=>Math.max(0,Math.min(100,Math.round(N(v)*100)/100));
const dateText=v=>{try{return v&&typeof dmy==='function'?dmy(v):v||'—'}catch{return v||'—'}};

window.projectAutomaticProgress=function(p,c=null){
  const contract=c||A(db?.contracts).find(x=>x.projectId===p?.id)||null;
  const fin=typeof projectFinancials==='function'?projectFinancials(p,contract):null;
  const baseC=fin?.currentC||((contract?.currentAmount??p?.budget??0)*100);
  const financial=baseC>0?clamp((N(fin?.grossC)/N(baseC))*100):0;
  const visits=A(db?.visits).filter(v=>v.projectId===p?.id).slice().sort((a,b)=>String(a.date||a.createdAt||'').localeCompare(String(b.date||b.createdAt||''))||N(a.number)-N(b.number));
  const last=visits.at(-1)||null;
  const physical=last?clamp(last.physical):0;
  return{
    physical,
    financial,
    source:last?`Visita N.º ${N(last.number)||'—'} · ${dateText(last.date)}`:'Sin visita de campo',
    date:last?.date||last?.createdAt||''
  };
};

window.syncAllProjectProgress=function(){
  A(db?.projects).forEach(p=>{
    const c=A(db?.contracts).find(x=>x.projectId===p.id)||null;
    const a=window.projectAutomaticProgress(p,c);
    p.physicalProgress=a.physical;
    p.financialProgress=a.financial;
    p.progressSource=a.source;
    p.progressUpdatedAt=a.date||p.progressUpdatedAt||'';
  });
};

function decorate(){
  let screen='',tab='';
  try{screen=view?.screen||'';tab=view?.tab||''}catch{}

  document.querySelectorAll('.progress-label span').forEach(el=>{
    if(/Avance físico\s*=\s*financiero|estimado acumulado/i.test(el.textContent||''))el.textContent='Avance financiero acumulado';
  });

  document.querySelectorAll('.info').forEach(box=>{
    const small=box.querySelector('small');
    if(!small)return;
    if((small.textContent||'').trim()==='Avance automático'){
      small.textContent='Avance físico observado';
      const notes=box.querySelectorAll('small');
      if(notes[1]){
        const p=A(db?.projects).find(x=>x.id===view?.projectId);
        const c=p?A(db?.contracts).find(x=>x.projectId===p.id):null;
        const a=p?window.projectAutomaticProgress(p,c):null;
        notes[1].textContent=a?`Último registro de campo: ${a.source}`:'Sin registro de campo';
      }
    }
  });

  if(screen==='project'&&tab==='summary'){
    const grid=document.querySelector('#tabBody .summary-grid');
    const p=A(db?.projects).find(x=>x.id===view?.projectId);
    const c=p?A(db?.contracts).find(x=>x.projectId===p.id):null;
    if(grid&&p){
      const a=window.projectAutomaticProgress(p,c);
      let box=grid.querySelector('[data-cc-financial-progress]');
      if(!box){box=document.createElement('div');box.className='info';box.dataset.ccFinancialProgress='1';grid.appendChild(box)}
      box.innerHTML=`<small>Avance financiero acumulado</small><strong>${a.financial.toFixed(2)}%</strong><small>Total estimado acumulado ÷ monto contractual vigente</small>`;
    }
  }

  const modal=document.getElementById('estForm');
  if(modal){
    const input=document.getElementById('ePhysical');
    const field=input?.closest('.field');
    const label=field?.querySelector('span');
    const note=field?.querySelector('small');
    if(label)label.textContent='Avance financiero acumulado %';
    if(note)note.textContent='Se calcula con el total estimado acumulado ÷ monto contractual vigente. El avance físico se registra en las visitas de campo.';
  }
}

let queued=false;
new MutationObserver(()=>{
  if(queued)return;
  queued=true;
  requestAnimationFrame(()=>{queued=false;decorate()});
}).observe(document.documentElement,{childList:true,subtree:true});
setTimeout(decorate,0);
setTimeout(decorate,250);
})();