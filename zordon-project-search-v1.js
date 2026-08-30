/* ===== ZORDON · BUSCADOR INTELIGENTE DE PROYECTOS V1 ===== */
(()=>{
'use strict';
if(window.__CC_ZORDON_PROJECT_SEARCH_V1__)return;
window.__CC_ZORDON_PROJECT_SEARCH_V1__=true;

const STYLE_ID='cc-zordon-project-search-v1-style';
const WRAP='[data-zordon-project-search]';
const STOP=new Set(['quiero','quisiera','necesito','muestrame','muestra','mostrar','dame','busca','buscar','encuentra','encontrar','localiza','localizar','proyecto','proyectos','expediente','expedientes','el','la','los','las','un','una','unos','unas','de','del','al','a','en','por','para','con','que','cual','cuales','me','se','y','o','favor']);
const ALIASES={
  parque:['parque','plaza','central'],
  iglesia:['iglesia','catolica','templo','ermita','hermita'],
  pavimento:['pavimento','pavimentacion','calle','concreto','huella','huellas'],
  colegio:['colegio','escuela','instituto','kinder','jardin'],
  electrico:['electrico','electrica','electricidad','linea','primaria','secundaria','transformador','transformadores'],
  agua:['agua','tanque','pozo','sistema','hidrico'],
  tanque:['tanque','agua','almacenamiento'],
  estadio:['estadio','campo','cancha'],
  comunal:['comunal','social','centro'],
  ejecucion:['ejecucion','ejecutando','activo','activa','vigente'],
  finalizado:['finalizado','finalizada','terminado','terminada','cerrado','cerrada'],
  atencion:['atencion','seguimiento','alerta','riesgo','atraso','atrasado','atrasada'],
  contratista:['contratista','constructor','constructora','ingeniero','ingeniera']
};

const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9.%]+/g,' ').replace(/\s+/g,' ').trim();
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const words=v=>norm(v).split(' ').filter(Boolean);
function significant(q){
  const raw=words(q);const out=[];
  raw.forEach(t=>{if(STOP.has(t))return;out.push(t);for(const [key,arr] of Object.entries(ALIASES)){if(t===key||arr.includes(t))arr.forEach(x=>out.push(x))}});
  return [...new Set(out)];
}
function getDB(){try{return typeof db!=='undefined'?db:window.db}catch{return window.db}}
function flatObject(obj,depth=0){
  if(depth>2||obj==null)return'';
  if(['string','number','boolean'].includes(typeof obj))return` ${obj}`;
  if(Array.isArray(obj))return obj.slice(0,12).map(x=>flatObject(x,depth+1)).join(' ');
  if(typeof obj==='object')return Object.entries(obj).filter(([k])=>!/token|secret|password|key/i.test(k)).slice(0,45).map(([,v])=>flatObject(v,depth+1)).join(' ');
  return'';
}
function projectDataForCard(card){
  const code=norm(card.querySelector('.project-v3-code')?.textContent||'');
  const store=getDB();if(!store||!code)return null;
  try{return (store.projects||[]).find(p=>norm(p.code)===code)||null}catch{return null}
}
function corpus(card){
  const p=projectDataForCard(card);let extra='';
  if(p){
    extra+=flatObject(p);
    try{const store=getDB();
      const contracts=(store?.contracts||[]).filter(c=>c.projectId===p.id);extra+=flatObject(contracts);
      const contractorIds=new Set(contracts.map(c=>c.contractorId||c.contractor_id).filter(Boolean));
      const contractors=(store?.contractors||[]).filter(c=>contractorIds.has(c.id));extra+=flatObject(contractors);
    }catch{}
  }
  return norm(`${card.textContent||''} ${extra}`);
}
function closeEnough(token,text){
  if(!token)return true;
  if(text.includes(token))return true;
  if(token.length<5)return false;
  const candidates=text.split(' ').filter(w=>Math.abs(w.length-token.length)<=1&&w.length>=4);
  return candidates.some(w=>{
    if(w[0]!==token[0])return false;let i=0,j=0,d=0;
    while(i<token.length&&j<w.length){if(token[i]===w[j]){i++;j++;continue}d++;if(d>1)return false;if(token.length>w.length)i++;else if(w.length>token.length)j++;else{i++;j++}}
    d+=token.length-i+w.length-j;return d<=1;
  });
}
function scoreCard(card,q){
  const text=corpus(card),tokens=significant(q);if(!tokens.length)return 0;
  const original=norm(q);let score=0,matchedCore=0;
  if(original&&text.includes(original))score+=100;
  const rawCore=words(q).filter(t=>!STOP.has(t));
  rawCore.forEach(t=>{if(closeEnough(t,text)){matchedCore++;score+=18+(t.length>6?4:0)}});
  tokens.forEach(t=>{if(closeEnough(t,text))score+=3});
  if(rawCore.length&&matchedCore===rawCore.length)score+=35;
  if(rawCore.length>1&&matchedCore<Math.ceil(rawCore.length*.6))return 0;
  if(rawCore.length===1&&matchedCore===0)return 0;
  return score;
}
function installCss(){
  if(document.getElementById(STYLE_ID))return;
  const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
  .zordon-project-search{margin:0 0 12px;padding:13px 14px;border:1px solid #2c435b;border-radius:15px;background:linear-gradient(145deg,#0d1a28,#09131f);box-shadow:0 12px 30px rgba(0,0,0,.18)}
  .zordon-project-search-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:9px}.zordon-project-search-head small{display:block;color:#72a6ff;font-size:9px;font-weight:900;letter-spacing:.13em}.zordon-project-search-head b{display:block;color:#f1f6fb;font-size:14px;margin-top:2px}.zordon-project-search-head span{color:#91a6bb;font-size:9px;line-height:1.35;max-width:620px}
  .zordon-project-search-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px}.zordon-project-search-input{min-height:44px!important;padding:9px 13px!important;border:1px solid #355270!important;border-radius:12px!important;background:#07111b!important;color:#f3f8fd!important;font-size:13px!important}.zordon-project-search-input:focus{border-color:#5794ff!important;box-shadow:0 0 0 3px rgba(79,140,255,.13)!important}.zordon-project-clear{min-width:92px!important}
  .zordon-project-hints{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.zordon-project-hints button{min-height:27px!important;padding:5px 8px!important;border:1px solid #2c435b!important;border-radius:999px!important;background:#0d1b2a!important;color:#a9bfd4!important;font-size:8.5px!important}.zordon-project-hints button:hover{border-color:#4c7db2!important;color:#fff!important}
  .zordon-project-state{grid-column:1/-1;padding:30px 16px;border:1px dashed #30475f;border-radius:14px;background:#0a1520;color:#9cb0c4;text-align:center}.zordon-project-state b{display:block;color:#eaf3fc;font-size:14px;margin-bottom:5px}.zordon-project-state span{display:block;font-size:10px;line-height:1.45}.zordon-project-count{display:inline-flex;align-items:center;gap:5px;padding:5px 8px;border-radius:999px;background:#10243a;border:1px solid #2f4d6e;color:#b9d5f2;font-size:8.5px;font-weight:850;white-space:nowrap}
  .projects-board>.filter-row{display:none!important}
  @media(max-width:720px){.zordon-project-search-row{grid-template-columns:1fr}.zordon-project-clear{width:100%!important}.zordon-project-search-head{display:block}.zordon-project-count{margin-top:8px}}
  `;document.head.appendChild(s);
}
function stateNode(grid){
  let node=grid.querySelector(':scope > .zordon-project-state');
  if(!node){node=document.createElement('div');node.className='zordon-project-state';grid.prepend(node)}
  return node;
}
function showState(grid,title,detail){const n=stateNode(grid);n.innerHTML=`<b>${esc(title)}</b><span>${esc(detail)}</span>`;n.style.display='block'}
function hideState(grid){const n=grid.querySelector(':scope > .zordon-project-state');if(n)n.style.display='none'}
function apply(board,query){
  const grid=board.querySelector('.project-grid-v3');if(!grid)return;
  const cards=[...grid.querySelectorAll(':scope > .project-v3')];const q=String(query||'').trim();
  const count=board.querySelector('[data-zordon-count]');
  if(!q){cards.forEach(c=>{c.style.display='none'});showState(grid,'Zordon está listo','Escribe el nombre, código, contratista, ubicación, estado o una frase como “proyectos en ejecución” o “parque central”.');if(count)count.textContent='Esperando búsqueda';return}
  if(/^(todos|todas|mostrar todos|muestra todos|ver todos)$/i.test(norm(q))){cards.forEach(c=>{c.style.display=''});hideState(grid);if(count)count.textContent=`${cards.length} proyecto${cards.length===1?'':'s'}`;return}
  const ranked=cards.map(c=>({c,score:scoreCard(c,q)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
  cards.forEach(c=>{c.style.display='none'});ranked.forEach(({c})=>{c.style.display=''});
  if(ranked.length){hideState(grid);if(count)count.textContent=`${ranked.length} resultado${ranked.length===1?'':'s'}`}
  else{showState(grid,'No encontré coincidencias',`No encontré un proyecto para “${q}”. Prueba con código, nombre, contratista, comunidad, tipo de obra o estado.`);if(count)count.textContent='0 resultados'}
}
function mount(board){
  installCss();
  if(!board||!board.querySelector('.project-grid-v3'))return false;
  let box=board.querySelector(WRAP);
  if(!box){
    box=document.createElement('section');box.className='zordon-project-search';box.dataset.zordonProjectSearch='1';
    box.innerHTML=`<div class="zordon-project-search-head"><div><small>ZORDON · BÚSQUEDA INTELIGENTE</small><b>¿Qué proyecto quieres ver?</b><span>Puedes escribir como hablas: nombre del proyecto, código, contratista, comunidad, tipo de obra o estado.</span></div><span class="zordon-project-count" data-zordon-count>Esperando búsqueda</span></div><div class="zordon-project-search-row"><input class="zordon-project-search-input" data-zordon-input type="search" autocomplete="off" spellcheck="false" placeholder="Ej.: parque central · contratista Harold · pavimento colegio · proyectos en ejecución"><button type="button" class="btn zordon-project-clear" data-zordon-clear>Limpiar</button></div><div class="zordon-project-hints"><button type="button" data-zordon-q="parque central">Parque</button><button type="button" data-zordon-q="pavimento">Pavimento</button><button type="button" data-zordon-q="iglesia">Iglesia</button><button type="button" data-zordon-q="en ejecución">En ejecución</button><button type="button" data-zordon-q="finalizados">Finalizados</button></div>`;
    const legacy=board.querySelector('.filter-row');if(legacy)legacy.insertAdjacentElement('beforebegin',box);else board.querySelector('.project-grid-v3').insertAdjacentElement('beforebegin',box);
    const input=box.querySelector('[data-zordon-input]');
    input.addEventListener('input',()=>apply(board,input.value));
    input.addEventListener('keydown',e=>{if(e.key==='Escape'){input.value='';apply(board,'');input.blur()}});
    box.querySelector('[data-zordon-clear]').addEventListener('click',()=>{input.value='';apply(board,'');input.focus()});
    box.querySelectorAll('[data-zordon-q]').forEach(btn=>btn.addEventListener('click',()=>{input.value=btn.dataset.zordonQ||'';apply(board,input.value);input.focus()}));
  }
  apply(board,box.querySelector('[data-zordon-input]')?.value||'');return true;
}
function run(){
  document.querySelectorAll('.projects-board').forEach(mount);
}
let queued=false;
const observer=new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;run()})});
observer.observe(document.documentElement,{childList:true,subtree:true});
setTimeout(run,0);setTimeout(run,350);setTimeout(run,1100);
window.__ccZordonProjectSearch={run,apply,scoreCard};
})();
