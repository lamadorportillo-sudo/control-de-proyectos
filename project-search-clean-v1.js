/* ===== BUSCADOR LIMPIO DE PROYECTOS V2 ===== */
(()=>{
'use strict';
if(window.__CC_PROJECT_SEARCH_CLEAN_V2__)return;
window.__CC_PROJECT_SEARCH_CLEAN_V2__=true;

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

/* Selector independiente de visitas de campo.
   El buscador original del modal podía conservar el texto escrito sin filtrar las tarjetas. */
function visitPickerRoot(){
 const candidates=[...document.querySelectorAll('[role="dialog"],.modal,.modal-bg,.sheet,.ccx-modal,.dialog')];
 return candidates.find(el=>/visitas de campo/i.test(el.textContent||'')&&/abrir visitas/i.test(el.textContent||''))||null;
}
function visitOpenButtons(root){
 return [...root.querySelectorAll('button,a')].filter(el=>/abrir\s+visitas/i.test(el.textContent||''));
}
function visitCardForButton(btn,root){
 let node=btn.parentElement,best=null;
 while(node&&node!==root){
   const opens=visitOpenButtons(node);
   const txt=(node.textContent||'').trim();
   if(opens.length===1&&txt.length>(btn.textContent||'').trim().length+12)best=node;
   if(best&&(/\b\d{3,6}\b/.test(txt)||/visitas?/i.test(txt))&&txt.length>30)return best;
   node=node.parentElement;
 }
 return best||btn.parentElement;
}
function visitPickerCards(root){
 return [...new Set(visitOpenButtons(root).map(btn=>visitCardForButton(btn,root)).filter(Boolean))];
}
function visitPickerInput(root){
 const fields=[...root.querySelectorAll('input[type="search"],input[type="text"],input:not([type])')];
 return fields.find(i=>!i.disabled&&!i.readOnly&&(i.offsetParent!==null||i.getClientRects().length))||fields[0]||null;
}
function applyVisitPickerSearch(input,root){
 if(!root||!root.isConnected)return;
 const q=normalize(input?.value),cards=visitPickerCards(root);
 let visible=0;
 cards.forEach(card=>{
   const show=!q||normalize(card.textContent).includes(q);
   card.hidden=!show;
   card.style.display=show?'':'none';
   if(show)visible++;
 });
 let empty=root.querySelector('[data-visit-search-empty]');
 if(q&&!visible){
   if(!empty){
     empty=document.createElement('div');
     empty.dataset.visitSearchEmpty='1';
     empty.style.cssText='padding:18px 14px;text-align:center;color:#68756c;font-size:13px;';
     empty.textContent='No hay proyectos que coincidan con la búsqueda.';
     const cardsNow=visitPickerCards(root),last=cardsNow.at(-1);
     (last?.parentElement||root).appendChild(empty);
   }
 }else if(empty)empty.remove();
}
function bindVisitPicker(){
 const root=visitPickerRoot();if(!root)return;
 const input=visitPickerInput(root);if(!input)return;
 if(input.dataset.ccVisitSearchClean!=='1'){
   input.dataset.ccVisitSearchClean='1';
   const rerun=()=>{
     requestAnimationFrame(()=>applyVisitPickerSearch(input,root));
     setTimeout(()=>applyVisitPickerSearch(input,root),25);
   };
   input.addEventListener('input',rerun,true);
   input.addEventListener('change',rerun,true);
   input.addEventListener('search',rerun,true);
 }
 if(input.value)applyVisitPickerSearch(input,root);
}

try{
 if(typeof renderApp==='function'&&!renderApp.__ccSearchClean){const base=renderApp;const wrapped=function(){const r=base.apply(this,arguments);setTimeout(bind,0);setTimeout(bindVisitPicker,0);return r};wrapped.__ccSearchClean=true;renderApp=wrapped}
}catch(e){console.warn(e)}
document.addEventListener('click',e=>{
 if(e.target.closest?.('[data-ccx="projects"],#cpToggleProjects'))setTimeout(bind,0);
 if(e.target.closest?.('button,a,[data-open]'))setTimeout(bindVisitPicker,40);
},true);
let visitQueued=false;
new MutationObserver(()=>{
 if(visitQueued)return;visitQueued=true;
 requestAnimationFrame(()=>{visitQueued=false;bindVisitPicker()});
}).observe(document.documentElement,{childList:true,subtree:true});
setTimeout(bind,150);setTimeout(bind,700);setTimeout(bindVisitPicker,150);setTimeout(bindVisitPicker,700);
})();