/* ===== HALU · AVATAR VISUAL INTERACTIVO V1 ===== */
(()=>{
'use strict';
if(window.__CC_HALU_AVATAR_MOTION_V1__)return;window.__CC_HALU_AVATAR_MOTION_V1__=true;
const KEY='cc_halu_avatar_position_v1';
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
let launch=null,chat=null,placing=false;
function css(){if(document.getElementById('ccHaluMotionStyle'))return;const s=document.createElement('style');s.id='ccHaluMotionStyle';s.textContent=`
#ccEngineerChatLaunch.cc-halu-moving{transition:left 1.15s cubic-bezier(.22,.8,.3,1),top 1.15s cubic-bezier(.22,.8,.3,1),transform .18s ease;animation:ccHaluWalk .36s ease-in-out infinite alternate;right:auto!important;bottom:auto!important}
#ccEngineerChatLaunch.cc-halu-gesture{overflow:visible;animation:ccHaluHello .42s ease-in-out 3 alternate}
#ccEngineerChatLaunch.cc-halu-gesture:after{content:'☝';position:absolute;right:-22px;top:-18px;font-size:27px;filter:drop-shadow(0 3px 5px rgba(0,0,0,.4));transform-origin:bottom center;animation:ccHaluPoint .5s ease-in-out 4 alternate}
#ccEngineerChatLaunch.cc-halu-place{box-shadow:0 0 0 8px rgba(56,189,248,.22),0 16px 40px rgba(0,0,0,.5)}
body.cc-halu-placing,body.cc-halu-placing *{cursor:crosshair!important}
@keyframes ccHaluWalk{from{transform:translateY(0) rotate(-2deg)}to{transform:translateY(-7px) rotate(2deg)}}
@keyframes ccHaluHello{from{transform:rotate(-4deg)}to{transform:rotate(4deg)}}
@keyframes ccHaluPoint{from{transform:rotate(-15deg) translateY(2px)}to{transform:rotate(12deg) translateY(-4px)}}
`;document.head.appendChild(s)}
function els(){launch=document.getElementById('ccEngineerChatLaunch');chat=document.getElementById('ccEngineerChat');return!!launch}
function chatFollow(x,y){if(!chat)return;const left=x>innerWidth/2?'auto':`${clamp(x,12,Math.max(12,innerWidth-chat.offsetWidth-12))}px`,right=x>innerWidth/2?`${clamp(innerWidth-x-62,12,Math.max(12,innerWidth-chat.offsetWidth-12))}px`:'auto';chat.style.left=left;chat.style.right=right;chat.style.bottom='auto';chat.style.top=y>innerHeight/2?`${clamp(y-chat.offsetHeight-12,12,innerHeight-chat.offsetHeight-12)}px`:`${clamp(y+72,12,innerHeight-chat.offsetHeight-12)}px`}
function moveTo(x,y,gesture=true){if(!els())return false;x=clamp(Math.round(x),8,Math.max(8,innerWidth-72));y=clamp(Math.round(y),8,Math.max(8,innerHeight-72));launch.classList.remove('cc-halu-gesture');launch.classList.add('cc-halu-moving');launch.style.left=`${x}px`;launch.style.top=`${y}px`;try{localStorage.setItem(KEY,JSON.stringify({x:x/innerWidth,y:y/innerHeight}))}catch{}setTimeout(()=>{launch.classList.remove('cc-halu-moving');if(gesture){launch.classList.add('cc-halu-gesture');setTimeout(()=>launch?.classList.remove('cc-halu-gesture'),1900)}chatFollow(x,y)},1200);return true}
function point(name){const q=String(name||'').toLowerCase().trim();if(!q)return false;const nodes=[...document.querySelectorAll('button,[data-tab],[data-nav],[data-ccx],a,h1,h2,h3')].filter(el=>el!==launch&&el.offsetParent!==null);const el=nodes.find(el=>(el.textContent||'').trim().toLowerCase().includes(q));if(!el)return false;const r=el.getBoundingClientRect();el.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>moveTo(r.left>innerWidth/2?r.left-78:r.right+16,clamp(r.top+r.height/2-31,8,innerHeight-72),true),450);return true}
function named(place){const p=norm(place),w=innerWidth-78,h=innerHeight-78,m=14;if(/superior.*izquierda|arriba.*izquierda/.test(p))return moveTo(m,m);if(/superior.*derecha|arriba.*derecha/.test(p))return moveTo(w,m);if(/inferior.*izquierda|abajo.*izquierda/.test(p))return moveTo(m,h);if(/inferior.*derecha|abajo.*derecha/.test(p))return moveTo(w,h);if(/centro|en medio/.test(p))return moveTo(w/2,h/2);if(/izquierda/.test(p))return moveTo(m,h/2);if(/derecha/.test(p))return moveTo(w,h/2);if(/arriba|superior/.test(p))return moveTo(w/2,m);if(/abajo|inferior/.test(p))return moveTo(w/2,h);return false}
function placeNext(){if(!els())return false;placing=true;launch.classList.add('cc-halu-place');document.body.classList.add('cc-halu-placing');const pick=e=>{if(!placing||e.target.closest?.('#ccEngineerChat,#ccEngineerChatLaunch'))return;e.preventDefault();e.stopPropagation();placing=false;document.body.classList.remove('cc-halu-placing');launch.classList.remove('cc-halu-place');document.removeEventListener('click',pick,true);moveTo(e.clientX-31,e.clientY-31,true)};document.addEventListener('click',pick,true);return true}
function command(text){const q=norm(text);if(/\b(ponte aqui|colocate aqui|inicia aqui)\b/.test(q)){placeNext();return'Marca con un toque el punto donde quieres que me quede.'}const target=q.match(/(?:ve|anda|camina|ponte|colocate|inicia)\s+(?:a|en|hacia)?\s*(?:la|el)?\s*(.+)$/);if(target&&named(target[1]))return'Voy para allá; ya quedé en esa zona.';const pointAt=q.match(/(?:senala|muestra|busca|ve a)\s+(?:la|el|los|las)?\s*(.+)$/);if(pointAt&&point(pointAt[1]))return'Ya lo ubiqué; te lo estoy señalando.';if(/no te veo|no estas visible|aparece|ven aca/.test(q)){moveTo(innerWidth-92,innerHeight/2,true);return'Aquí estoy; me quedo visible a este lado.'}return''}
function restore(){if(!els())return setTimeout(restore,80);css();try{const p=JSON.parse(localStorage.getItem(KEY)||'null');if(p&&Number.isFinite(p.x)&&Number.isFinite(p.y))moveTo(p.x*innerWidth,p.y*innerHeight,false)}catch{}}
addEventListener('resize',()=>{try{const p=JSON.parse(localStorage.getItem(KEY)||'null');if(p)moveTo(p.x*innerWidth,p.y*innerHeight,false)}catch{}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',restore,{once:true});else restore();
window.__ccHaluAvatar={command,moveTo,point,placeNext};
})();
