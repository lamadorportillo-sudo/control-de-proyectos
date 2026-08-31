/* ===== MULTA DIARIA Y ACUMULADA V2 ===== */
(()=>{
'use strict';
if(window.__CC_CONTRACT_PENALTY_CARD_V2__)return;
window.__CC_CONTRACT_PENALTY_CARD_V2__=true;

function install(){
  if(typeof window.renderContract!=='function'||window.renderContract.__ccDailyPenaltyCardV2)return;
  const base=window.renderContract;
  const wrapped=function(p,c){
    const out=base.apply(this,arguments);
    if(!c)return out;
    const grid=document.querySelector('#tabBody .summary-grid');
    if(!grid||grid.querySelector('.cc-contract-daily-penalty-v2'))return out;

    const ctrl=typeof window.contractControlDefaults==='function'
      ? window.contractControlDefaults(c.controls||{})
      : (c.controls||{});
    const rateRaw=ctrl.penaltyDailyPct;
    const rate=Number(rateRaw===undefined||rateRaw===null||rateRaw===''?0.18:rateRaw)||0;
    const original=Number(c.originalAmount||0);
    const dailyRaw=original*rate/100;
    const daily=typeof window.round2==='function'
      ? window.round2(dailyRaw)
      : Math.round(dailyRaw*100)/100;

    const currentDate=typeof window.today==='function'
      ? window.today()
      : new Date().toISOString().slice(0,10);
    let lateDays=0;
    if(c.end&&currentDate>c.end){
      lateDays=typeof window.daysBetween==='function'
        ? Math.max(0,window.daysBetween(c.end,currentDate))
        : Math.max(0,Math.floor((new Date(currentDate+'T12:00:00')-new Date(c.end+'T12:00:00'))/86400000));
    }

    const accumulatedRaw=daily*lateDays;
    const accumulated=typeof window.round2==='function'
      ? window.round2(accumulatedRaw)
      : Math.round(accumulatedRaw*100)/100;
    const rateText=typeof window.pct==='function'?window.pct(rate):`${rate.toFixed(2)}%`;
    const money=v=>typeof window.moneyHTML==='function'
      ? window.moneyHTML(v)
      : `<strong>L ${Number(v||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</strong>`;

    const dailyCard=document.createElement('div');
    dailyCard.className='info cc-contract-daily-penalty-v2';
    dailyCard.innerHTML=`<small>Multa diaria por retraso</small>${money(daily)}<div class="words">${rateText} del monto original por cada día de retraso</div>`;

    const daysCard=document.createElement('div');
    daysCard.className='info cc-contract-delay-days';
    daysCard.innerHTML=`<small>Días de atraso</small><strong>${lateDays} día${lateDays===1?'':'s'}</strong><div class="words">${lateDays>0?`Calculados desde el ${typeof window.dmy==='function'?window.dmy(c.end):c.end} hasta hoy`:'Sin atraso contractual a la fecha'}</div>`;

    const totalCard=document.createElement('div');
    totalCard.className='info cc-contract-accumulated-penalty';
    totalCard.innerHTML=`<small>Multa acumulada por atraso</small>${money(accumulated)}<div class="words">${lateDays>0?`${lateDays} día${lateDays===1?'':'s'} × multa diaria de L ${daily.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`:'Se calculará automáticamente al vencer el plazo contractual'}</div>`;

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
  wrapped.__ccDailyPenaltyCardV2=true;
  window.renderContract=wrapped;
}

install();
setTimeout(install,0);
})();
