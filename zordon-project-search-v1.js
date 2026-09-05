/* ===== ZORDON · BUSCADOR INTELIGENTE DE PROYECTOS V4 · RUNTIME AISLADO ===== */
(()=>{
'use strict';
if(typeof window==='undefined'||typeof document==='undefined')return;
if(window.__CC_ZORDON_PROJECT_SEARCH_V4__)return;
window.__CC_ZORDON_PROJECT_SEARCH_V4__=true;
window.__CC_ZORDON_PROJECT_SEARCH_V3__=true;
window.__CC_ZORDON_PROJECT_SEARCH_V2__=true;
window.__CC_ZORDON_PROJECT_SEARCH_V1__=true;

const STYLE_ID='cc-zordon-project-search-v4-style';
const WRAP='[data-zordon-project-search]';
const NativeObserver=window.__ccNativeMutationObserver||window.MutationObserver;
const STOP=new Set(['quiero','quisiera','necesito','muestrame','muestra','mostrar','dame','busca','buscar','encuentra','encontrar','localiza','localizar','proyecto','proyectos','expediente','expedientes','el','la','los','las','un','una','unos','unas','de','del','al','a','en','por','para','con','que','cual','cuales','me','se','y','o','favor']);
const GROUPS=[
  ['parque','plaza'],
  ['iglesia','catolica','templo','ermita','hermita'],
  ['pavimento','pavimentacion','huella','huellas'],
  ['colegio','escuela','instituto','kinder','jardin'],
  ['electrico','electrica','electricidad','transformador','transformadores'],
  ['agua','tanque','pozo','acueducto','hidrico'],
  ['estadio','cancha'],
  ['comunal','social'],
  ['ejecucion','ejecutando','activo','activa','vigente'],
  ['finalizado','finalizada','finalizados','finalizadas','terminado','terminada','cerrado','cerrada'],
  ['contratista','constructor','constructora','ingeniero','ingeniera']
];
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9.%]+/g,' ').replace(/\s+/g,' ').trim();
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const words=v=>norm(v).split(' ').filter(Boolean);
const alternatives=t=>GROUPS.find(g=>g.includes(t))||[t];
const coreTokens=q=>words(q).filter(t=>!STOP.has(t));
function closeEnough(token,text){
  if(!token)return true;
  if(text.includes(token))return true;
  if(token.length<5)return false;
  const candidates=text.split(' ').filter(w=>Math.abs(w.length-token.length)<=1&&w.length>=4);
  return candidates.some(w=>{
    if(w[0]!==token[0])return false;
    let i=0,j=0,d=0;
    while(i<token.length&&j<w.length){
      if(token[i]===w[j]){i++;j++;continue}
      d++;if(d>1)return false;
      if(token.length>w.length)i++;else if(w.length>token.length)j++;else{i++;j++}
    }
    d+=token.length-i+w.length-j;
    return d<=1;
  });
}
function tokenMatches(token,text){return alternatives(token).some(a=>closeEnough(a,text))}
function corpus(card){
  const code=card.querySelector('.project-v3-code')?.textContent||'';
  const title=card.querySelector('h3')?.textContent||'';
  const contractor=card.querySelector('.project-v3-contractor')?.textContent||'';
  const location=card.querySelector('.project-v3-location')?.textContent||'';
  const status=card.querySelector('.status,.project-v3-status')?.textContent||'';
  return norm(`${code} ${title} ${contractor} ${location} ${status} ${card.textContent||''}`);
}
function scoreCard(card,q){
  const text=corpus(card),tokens=coreTokens(q),phrase=norm(q);
  if(!tokens.length)return 0;
  if(!tokens.every(t=>tokenMatches(t,text)))return 0;
  let score=40;
  if(phrase&&text.includes(phrase))score+=100;
  tokens.forEach(t=>{
    if(text.includes(t))score+=30;
    else if(alternatives(t).some(a=>text.includes(a)))score+=18;
    else score+=8;
  });
  return score;
}
function installCss(){
  if(document.getElementById(STYLE_ID)||typeof document.createElement!=='function')return;
  const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
  .projects-board .project-grid-v3>.project-v3[data-zordon-hidden="1"]{display:none!important}
  .zordon-project-search{margin:0 0 10px;padding:10px 11px;border:1px solid #2c435b;border-radius:12px;background:linear-gradient(145deg,#0d1a28,#09131f);box-shadow:0 10px 24px rgba(0,0,0,.16)}
  .zordon-project-search-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:7px}.zordon-project-search-head small{display:block;color:#72a6ff;font-size:8.5px;font-weight:900;letter-spacing:.12em}.zordon-project-search-head b{display:block;color:#f1f6fb;font-size:12px;margin-top:1px}.zordon-project-search-head span{color:#91a6bb;font-size:8.5px;line-height:1.3;max-width:620px}
  .zordon-project-search-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px}.zordon-project-search-input{min-height:38px!important;padding:7px 10px!important;border:1px solid #355270!important;border-radius:9px!important;background:#07111b!important;color:#f3f8fd!important;font-size:11.5px!important}.zordon-project-search-input:focus{border-color:#5794ff!important;box-shadow:0 0 0 3px rgba(79,140,255,.13)!important}.zordon-project-clear{min-width:82px!important}
  .zordon-project-hints{display:flex;gap:4px;flex-wrap:wrap;margin-top:6px}.zordon-project-hints button{min-height:24px!important;padding:4px 7px!important;border:1px solid #2c435b!important;border-radius:999px!important;background:#0d1b2a!important;color:#a9bfd4!important;font-size:8px!important}.zordon-project-hints button:hover{border-color:#4c7db2!important;color:#fff!important}
  .zordon-project-state{grid-column:1/-1;padding:24px 14px;border:1px dashed #30475f;border-radius:11px;background:#0a1520;color:#9cb0c4;text-align:center}.zordon-project-state b{display:block;color:#eaf3fc;font-size:12px;margin-bottom:4px}.zordon-project-state span{display:block;font-size:9px;line-height:1.4}.zordon-project-count{display:inline-flex;align-items:center;gap:4px;padding:4px 7px;border-radius:999px;background:#10243a;border:1px solid #2f4d6e;color:#b9d5f2;font-size:8px;font-weight:850;white-space:nowrap}
  .projects-board>.filter-row{display:none!important}
  @media(max-width:720px){.zordon-project-search-row{grid-template-columns:1fr}.zordon-project-clear{width:100%!important}.zordon-project-search-head{display:block}.zordon-project-count{margin-top:6px}}
  `;document.head.appendChild(s);
}
function stateNode(grid){let node=grid.querySelector(':scope > .zordon-project-state');if(!node){node=document.createElement('div');node.className='zordon-project-state';grid.prepend(node)}return node}
function showState(grid,title,detail){const n=stateNode(grid);n.innerHTML=`<b>${esc(title)}</b><span>${esc(detail)}</span>`;if(n.style.display==='none')n.style.removeProperty('display')}
function hideState(grid){const n=grid.querySelector(':scope > .zordon-project-state');if(n&&n.style.display!=='none')n.style.display='none'}
function hide(card){if(card.dataset.zordonHidden!=='1')card.dataset.zordonHidden='1'}
function show(card){if(card.dataset.zordonHidden==='1')delete card.dataset.zordonHidden}
function isGuest(){return !!document.body?.classList?.contains('cc-guest-mode')}
function apply(board,query){
  const grid=board.querySelector('.project-grid-v3');if(!grid)return;
  const cards=[...grid.querySelectorAll(':scope > .project-v3')],q=String(query||'').trim(),count=board.querySelector('[data-zordon-count]');
  if(!q){
    if(isGuest()){
      cards.forEach(show);hideState(grid);if(count)count.textContent=`${cards.length} proyecto${cards.length===1?'':'s'}`;
    }else{
      cards.forEach(hide);showState(grid,'Zordon está listo','Escribe el nombre, código, contratista, ubicación, estado o una frase como “proyectos en ejecución”.');if(count)count.textContent='Esperando búsqueda';
    }
    return;
  }
  if(/^(todos|todas|mostrar todos|muestra todos|ver todos)$/i.test(norm(q))){cards.forEach(show);hideState(grid);if(count)count.textContent=`${cards.length} proyecto${cards.length===1?'':'s'}`;return}
  const ranked=cards.map(c=>({c,score:scoreCard(c,q)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
  cards.forEach(hide);ranked.forEach(({c})=>show(c));
  if(ranked.length){hideState(grid);if(count)count.textContent=`${ranked.length} resultado${ranked.length===1?'':'s'}`}
  else{showState(grid,'No encontré coincidencias',`No encontré un proyecto para “${q}”. Prueba con código, nombre, contratista, comunidad, tipo de obra o estado.`);if(count)count.textContent='0 resultados'}
}
function mount(board){
  installCss();if(!board||!board.querySelector('.project-grid-v3'))return false;
  let box=board.querySelector(WRAP);
  if(!box){
    const old=board.querySelector('#projectSearch');if(old&&!old.matches('[data-zordon-input]')){old.id='projectSearchLegacy';old.setAttribute('aria-hidden','true')}
    box=document.createElement('section');box.className='zordon-project-search';box.dataset.zordonProjectSearch='1';
    box.innerHTML=`<div class="zordon-project-search-head"><div><small>ZORDON · BÚSQUEDA INTELIGENTE</small><b>¿Qué proyecto quieres ver?</b><span>Escribe como hablas: nombre, código, contratista, comunidad, tipo de obra o estado.</span></div><span class="zordon-project-count" data-zordon-count>Esperando búsqueda</span></div><div class="zordon-project-search-row"><input id="projectSearch" class="zordon-project-search-input search" data-zordon-input data-cc-search-clean="1" type="search" autocomplete="off" spellcheck="false" placeholder="Ej.: parque central · contratista Harold · pavimento colegio · proyectos en ejecución"><button type="button" class="btn zordon-project-clear" data-zordon-clear>Limpiar</button></div><div class="zordon-project-hints"><button type="button" data-zordon-q="parque">Parque</button><button type="button" data-zordon-q="pavimento">Pavimento</button><button type="button" data-zordon-q="iglesia">Iglesia</button><button type="button" data-zordon-q="en ejecución">En ejecución</button><button type="button" data-zordon-q="finalizados">Finalizados</button></div>`;
    const legacy=board.querySelector('.filter-row');if(legacy)legacy.insertAdjacentElement('beforebegin',box);else board.querySelector('.project-grid-v3').insertAdjacentElement('beforebegin',box);
    const input=box.querySelector('[data-zordon-input]');
    const enforce=()=>{apply(board,input.value);setTimeout(()=>apply(board,input.value),0)};
    input.addEventListener('input',enforce,true);
    input.addEventListener('keydown',e=>{if(e.key==='Escape'){input.value='';enforce();input.blur()}});
    box.querySelector('[data-zordon-clear]').addEventListener('click',()=>{input.value='';enforce();input.focus()});
    box.querySelectorAll('[data-zordon-q]').forEach(btn=>btn.addEventListener('click',()=>{input.value=btn.dataset.zordonQ||'';enforce();input.focus()}));
  }
  const input=box.querySelector('[data-zordon-input]');if(input&&input.id!=='projectSearch'){const duplicate=document.getElementById('projectSearch');if(duplicate&&duplicate!==input)duplicate.id='projectSearchLegacy';input.id='projectSearch'}
  apply(board,input?.value||'');return true;
}
function run(){document.querySelectorAll('.projects-board').forEach(mount)}
let queued=false;
const schedule=()=>{
  if(queued)return;queued=true;
  const go=()=>{queued=false;run()};
  if(typeof requestAnimationFrame==='function')requestAnimationFrame(go);else setTimeout(go,0);
};
const observer=typeof NativeObserver==='function'?new NativeObserver(mutations=>{
  if(mutations.some(m=>m.type==='childList'||(m.type==='attributes'&&m.attributeName==='class')))schedule();
}):null;
observer?.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
setTimeout(run,0);setTimeout(run,350);setTimeout(run,1100);
window.addEventListener('pagehide',()=>observer?.disconnect(),{once:true});
window.__ccZordonProjectSearch={run,apply,scoreCard};
})();
