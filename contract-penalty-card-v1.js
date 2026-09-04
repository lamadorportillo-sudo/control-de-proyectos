/* ===== MULTA DIARIA Y ACUMULADA V3 · SEGÚN CONTRATO ===== */
(()=>{
'use strict';
if(window.__CC_CONTRACT_PENALTY_CARD_V3__)return;
window.__CC_CONTRACT_PENALTY_CARD_V3__=true;

function install(){
  if(typeof window.renderContract!=='function'||window.renderContract.__ccDailyPenaltyCardV3)return;
  const base=window.renderContract;
  const wrapped=function(p,c){
    const out=base.apply(this,arguments);
    if(!c)return out;
    const grid=document.querySelector('#tabBody .summary-grid');
    if(!grid||grid.querySelector('.cc-contract-daily-penalty-v3'))return out;

    const ctrl=typeof window.contractControlDefaults==='function'
      ? window.contractControlDefaults(c.controls||{})
      : (c.controls||{});
    const rateRaw=ctrl.penaltyDailyPct;
    const hasRate=rateRaw!==undefined&&rateRaw!==null&&rateRaw!==''&&Number.isFinite(Number(rateRaw));
    const rate=hasRate?Number(rateRaw):null;
    const original=Number(c.originalAmount||0);
    const round=v=>typeof window.round2==='function'?window.round2(v):Math.round(Number(v||0)*100)/100;
    const daily=hasRate?round(original*rate/100):null;

    const currentDate=typeof window.today==='function'
      ? window.today()
      : new Date().toISOString().slice(0,10);
    let lateDays=0;
    if(c.end&&currentDate>c.end){
      lateDays=typeof window.daysBetween==='function'
        ? Math.max(0,window.daysBetween(c.end,currentDate))
        : Math.max(0,Math.floor((new Date(currentDate+'T12:00:00')-new Date(c.end+'T12:00:00'))/86400000));
    }

    const accumulated=hasRate?round(daily*lateDays):null;
    const rateText=hasRate
      ? (typeof window.pct==='function'?window.pct(rate):`${rate.toFixed(2)}%`)
      : 'Definir según contrato';
    const money=v=>typeof window.moneyHTML==='function'
      ? window.moneyHTML(v)
      : `<strong>L ${Number(v||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</strong>`;
    const unset='<strong>Definir según contrato</strong>';

    const dailyCard=document.createElement('div');
    dailyCard.className='info cc-contract-daily-penalty-v3';
    dailyCard.innerHTML=hasRate
      ? `<small>Multa diaria por retraso</small>${money(daily)}<div class="words">${rateText} del monto original por cada día de retraso, según la cláusula registrada.</div>`
      : `<small>Multa diaria por retraso</small>${unset}<div class="words">No se calcula ninguna multa hasta registrar el porcentaje establecido expresamente en este contrato.</div>`;

    const daysCard=document.createElement('div');
    daysCard.className='info cc-contract-delay-days';
    daysCard.innerHTML=`<small>Días posteriores al plazo registrado</small><strong>${lateDays} día${lateDays===1?'':'s'}</strong><div class="words">${lateDays>0?`Calculados desde el ${typeof window.dmy==='function'?window.dmy(c.end):c.end} hasta hoy. Este dato no aplica una penalización por sí solo.`:'Sin días posteriores al plazo registrado a la fecha.'}</div>`;

    const totalCard=document.createElement('div');
    totalCard.className='info cc-contract-accumulated-penalty';
    totalCard.innerHTML=hasRate
      ? `<small>Multa acumulada por atraso</small>${money(accumulated)}<div class="words">${lateDays>0?`${lateDays} día${lateDays===1?'':'s'} × multa diaria de L ${daily.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`:'Se calculará cuando exista atraso y una tasa contractual registrada.'}</div>`
      : `<small>Multa acumulada por atraso</small>${unset}<div class="words">El sistema no presume una tasa de multa. Debe definirse con base en el contrato aplicable.</div>`;

    const wide=[...grid.querySelectorAll('.info.wide')].at(-1);
    if(wide){
      grid.insertBefore(dailyCard,wide);
      grid.insertBefore(daysCard,wide);
      grid.insertBefore(totalCard,wide);
    }else{
      grid.append(dailyCard,daysCard,totalCard);
    }
    return out;
  };
  wrapped.__ccDailyPenaltyCardV3=true;
  window.renderContract=wrapped;
}

install();
setTimeout(install,0);
})();
