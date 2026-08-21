/* ===== CORRECCION BUSCADOR DISPONIBILIDAD PRESUPUESTARIA V1 ===== */
(()=>{
'use strict';
if(window.__CC_BUDGET_SEARCH_FIX_V1__)return;
window.__CC_BUDGET_SEARCH_FIX_V1__=true;

function resetBudgetFilterBeforeSearch(e){
  const input=e.target?.closest?.('#cpBudgetSearch');
  if(!input)return;
  const root=input.closest('.cp-budget-page')||document;
  const all=root.querySelector('[data-f="all"]');
  const active=root.querySelector('[data-f].active');
  if(all&&active&&active!==all){
    all.click();
  }
}

document.addEventListener('input',resetBudgetFilterBeforeSearch,true);
})();
