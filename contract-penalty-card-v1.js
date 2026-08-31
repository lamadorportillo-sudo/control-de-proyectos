/* ===== MULTA DIARIA VISIBLE EN CONTRATO V1 ===== */
(()=>{
'use strict';
if(window.__CC_CONTRACT_PENALTY_CARD_V1__)return;
window.__CC_CONTRACT_PENALTY_CARD_V1__=true;

function install(){
  if(typeof window.renderContract!=='function'||window.renderContract.__ccDailyPenaltyCard)return;
  const base=window.renderContract;
  const wrapped=function(p,c){
    const out=base.apply(this,arguments);
    if(!c)return out;
    const grid=document.querySelector('#tabBody .summary-grid');
    if(!grid||grid.querySelector('.cc-contract-daily-penalty'))return out;

    const ctrl=typeof window.contractControlDefaults==='function'
      ? window.contractControlDefaults(c.controls||{})
      : (c.controls||{});
    const rateRaw=ctrl.penaltyDailyPct;
    const rate=Number(rateRaw===undefined||rateRaw===null||rateRaw===''?0.18:rateRaw)||0;
    const original=Number(c.originalAmount||0);
    const amountRaw=original*rate/100;
    const amount=typeof window.round2==='function'
      ? window.round2(amountRaw)
      : Math.round(amountRaw*100)/100;
    const rateText=typeof window.pct==='function'?window.pct(rate):`${rate.toFixed(2)}%`;
    const money=typeof window.moneyHTML==='function'
      ? window.moneyHTML(amount)
      : `<strong>L ${amount.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</strong>`;

    const card=document.createElement('div');
    card.className='info cc-contract-daily-penalty';
    card.innerHTML=`<small>Multa diaria por retraso</small>${money}<div class="words">${rateText} del monto original por cada día de retraso</div>`;

    const wide=[...grid.querySelectorAll('.info.wide')].at(-1);
    if(wide)grid.insertBefore(card,wide);else grid.appendChild(card);
    return out;
  };
  wrapped.__ccDailyPenaltyCard=true;
  window.renderContract=wrapped;
}

install();
setTimeout(install,0);
})();
