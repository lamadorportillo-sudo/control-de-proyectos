/* ===== BUSCADOR LIMPIO DE PROYECTOS V1 ===== */
(()=>{
'use strict';
if(window.__CC_PROJECT_SEARCH_CLEAN_V1__)return;
window.__CC_PROJECT_SEARCH_CLEAN_V1__=true;

function normalize(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()}
function findGrid(){return document.querySelector('.project-grid-v3,.dashboard-project-grid,.project-grid')}
function projectCards(grid){return [...grid.querySelectorAll(':scope > .project-v3,:scope > .card')].filter(x=>!x.matches('[data-search-empty]'))}
function hideNonCardsWhileSearching(grid,active){
 [...grid.children].forEach(ch=>{
   if(ch.matches('.project-v3,.card,[data-search-empty]'))return;
   ch.style.display=active?'none':'';
 });
}
function applySearch(input){
 const grid=findGrid();if(!grid)return;
 const q=normalize(input?.value);
 const cards=projectCards(grid);
 let visible=0;
 cards.forEach(card=>{
   const show=!q||normalize(card.textContent).includes(q);
   card.hidden=!show;
   card.style.display=show?'':'none';
   if(show)visible++;
 });
 hideNonCardsWhileSearching(grid,!!q);
 let empty=grid.querySelector('[data-search-empty]');
 if(q&&!visible){
   if(!empty){empty=document.createElement('div');empty.dataset.searchEmpty='1';empty.className='empty';empty.textContent='No hay proyectos que coincidan con la búsqueda.';grid.appendChild(empty)}
 }else if(empty)empty.remove();
}
function bind(){
 const input=document.getElementById('projectSearch');if(!input||input.dataset.ccSearchClean==='1')return;
 input.dataset.ccSearchClean='1';
 input.oninput=()=>{try{view.search=input.value}catch{}applySearch(input)};
 if(input.value)applySearch(input);
}
try{
 if(typeof renderApp==='function'&&!renderApp.__ccSearchClean){const base=renderApp;const wrapped=function(){const r=base.apply(this,arguments);setTimeout(bind,0);return r};wrapped.__ccSearchClean=true;renderApp=wrapped}
}catch(e){console.warn(e)}
document.addEventListener('click',e=>{if(e.target.closest?.('[data-ccx="projects"],#cpToggleProjects'))setTimeout(bind,0)},true);
setTimeout(bind,150);setTimeout(bind,700);
})();