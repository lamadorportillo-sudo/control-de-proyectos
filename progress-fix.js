(()=>{
  function automaticProgress(p,c=null){
    const contract=c||db.contracts.find(x=>x.projectId===p.id);
    const fin=projectFinancials(p,contract);
    const baseC=fin.currentC||cents(contract?.currentAmount??p.budget??0);
    const value=baseC>0?Math.max(0,Math.min(100,round2(fin.grossC/baseC*100))):0;
    const last=(fin.est||[]).slice().sort((a,b)=>(a.end||a.start||'').localeCompare(b.end||b.start||'')).at(-1);
    return {physical:value,financial:value,source:fin.est?.length?'Total estimado acumulado':'Sin estimaciones',date:last?.end||last?.start||''};
  }
  projectAutomaticProgress=automaticProgress;
  window.projectAutomaticProgress=automaticProgress;

  function cumulativeProgress(c,e,estimates){
    if(!c||!e)return 0;
    const list=(estimates||db.estimates.filter(x=>x.contractId===c.id)).slice().sort((a,b)=>Number(a.number)-Number(b.number));
    const baseC=cents(c.currentAmount||c.originalAmount||0);
    if(!baseC)return 0;
    let grossC=0;
    for(const x of list){
      grossC+=cents(x.gross||0);
      if(x.id===e.id)break;
    }
    return Math.max(0,Math.min(100,round2(grossC/baseC*100)));
  }
  window.estimateAutomaticProgress=cumulativeProgress;

  const originalEstimateModal=estimateModal;
  estimateModal=function(p,c,e=null){
    const result=originalEstimateModal(p,c,e);
    const input=document.querySelector('#ePhysical');
    const grossInput=document.querySelector('#eGross');
    if(input&&grossInput){
      const label=input.closest('label');
      const title=label?.querySelector('span');
      const help=label?.querySelector('small');
      if(title)title.textContent='Avance físico / financiero automático %';
      if(help)help.textContent='Se calcula automáticamente: total estimado acumulado ÷ monto contractual vigente.';
      input.readOnly=true;
      input.setAttribute('aria-readonly','true');
      const ests=db.estimates.filter(x=>x.contractId===c.id).sort((a,b)=>Number(a.number)-Number(b.number));
      const next=e?.number||(ests.length?Math.max(...ests.map(x=>Number(x.number)||0))+1:1);
      const updateProgress=()=>{
        const baseC=cents(c.currentAmount||c.originalAmount||p.budget||0);
        const priorC=ests.filter(z=>z.id!==e?.id&&Number(z.number)<Number(next)).reduce((sum,z)=>sum+cents(z.gross||0),0);
        const grossC=cents(grossInput.value||0);
        const pctValue=baseC?Math.max(0,Math.min(100,round2((priorC+grossC)/baseC*100))):0;
        input.value=pctValue.toFixed(2);
      };
      grossInput.addEventListener('input',updateProgress);
      updateProgress();
    }
    return result;
  };
  window.estimateModal=estimateModal;

  const originalRenderEstimates=renderEstimates;
  renderEstimates=function(p,c,est){
    const result=originalRenderEstimates(p,c,est);
    if(c){
      const sorted=(est||[]).slice().sort((a,b)=>Number(a.number)-Number(b.number));
      const tables=[...document.querySelectorAll('#tabBody table')];
      const table=tables.find(t=>[...t.querySelectorAll('thead th')].some(th=>th.textContent.trim()==='Avance'));
      if(table){
        const rows=[...table.querySelectorAll('tbody tr')];
        let grossC=0;
        const baseC=cents(c.currentAmount||c.originalAmount||p.budget||0);
        sorted.forEach((e,i)=>{
          grossC+=cents(e.gross||0);
          const v=baseC?Math.max(0,Math.min(100,round2(grossC/baseC*100))):0;
          const cell=rows[i]?.children?.[9];
          if(cell)cell.innerHTML=`${pct(v)}<br><small>Automático</small>`;
          e.physical=v;
        });
      }
    }
    return result;
  };
  window.renderEstimates=renderEstimates;

  try{ syncAllProjectProgress(); }catch(_e){}
})();
