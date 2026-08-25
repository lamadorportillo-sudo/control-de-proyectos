/* ===== ZORDON · CHAT LIMPIO Y ENVÍO DIRECTO V3 ===== */
(()=>{
'use strict';
if(window.__CC_ZORDON_CHAT_UI_V3__)return;
window.__CC_ZORDON_CHAT_UI_V3__=true;

let busy=false;
const CHAT='#ccEngineerChat';

function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]))}
function norm(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9ñ]+/g,' ').trim()}
function chat(){return document.querySelector(CHAT)}
function body(){return chat()?.querySelector('.cc-eng-chat-body')||null}
function form(){return chat()?.querySelector('.cc-eng-chat-form')||null}
function input(){return form()?.querySelector('textarea')||null}
function sendButton(){return form()?.querySelector('button[type="submit"],button[data-zordon-send]')||null}

function conversation(){return window.__ccEngineerChat?.conversation||null}
function remember(role,text){
  const c=conversation();if(!c)return;
  c.history=Array.isArray(c.history)?c.history:[];
  const clean=String(text||'').trim();if(!clean)return;
  const last=c.history.at(-1);if(last?.role===role&&last?.text===clean)return;
  c.history.push({role,text:clean.slice(0,1000)});c.history=c.history.slice(-30);
  c.lastType='social';
}

function removeIntro(){
  const b=body();if(!b)return;
  b.querySelectorAll('.cc-eng-quick').forEach(node=>node.remove());
  if(!b.querySelector('.cc-eng-msg.user,.cc-eng-msg-wrap.user')){
    [...b.children].forEach(node=>{
      if(node.matches?.('.cc-eng-msg.bot')&&/Qué tal\. Soy (?:Halu|ZORDON)|Aquí hablamos directo|Voy a seguir el hilo contigo/i.test(node.textContent||''))node.remove();
    });
  }
  b.style.paddingTop='14px';
}

function technicalMessage(text){
  const q=norm(text);
  return /\b(proyecto|obra|contrato|contratista|estimacion|pago|presupuesto|avance|visita|garantia|plazo|multa|adenda|orden de cambio|licitacion|oferta|ingenieria|calculo|estructura|concreto|pavimento|supervision|informe|reporte|documento|ley|norma|articulo|costos?)\b/.test(q);
}
function isCasual(text){
  const q=norm(text);if(!q||technicalMessage(q))return false;
  const words=q.split(/\s+/).filter(Boolean);
  return words.length<=18;
}

function casualReply(text){
  const raw=String(text||'').trim(),q=norm(raw);
  if(!q||technicalMessage(q))return'';
  if(/^(hola+|buenas|buenos dias|buenas tardes|buenas noches|hey|que tal)$/.test(q))return'¡Hola! ¿Cómo estás?';
  if(/^(bien|muy bien|todo bien|excelente|genial|super|ahi vamos)$/.test(q))return'Qué bueno 😄';
  if(/^(mas o menos|regular)$/.test(q))return'Uy 😅 ¿qué pasó?';
  if(/\b(bien|muy bien|todo bien)\b.*\b(y tu|y vos|tu que tal)\b/.test(q)||/^(y tu|y vos|como estas|como te va)$/.test(q))return'Bien también 😄';
  if(/^como te decia\b/.test(q)){
    const tail=raw.replace(/^como\s+te\s+dec[ií]a\s*[:,.-]?\s*/i,'').trim();
    if(/^(bien|muy bien|todo bien)$/i.test(tail))return'Sí, me decías que estabas bien 😄';
    return tail?`Sí, te sigo: ${tail}`:'Sí, te sigo.';
  }
  if(/^(gracias|muchas gracias|gracias zordon)$/.test(q))return'¡De nada! 😄';
  if(/^(que haces|que andas haciendo)$/.test(q))return'Aquí, platicando contigo 😄';
  if(/^(solo platicar|aqui solo platicar|quiero platicar|quiero hablar|conversemos|hablemos)$/.test(q))return'Claro 😄, platiquemos.';
  if(/^(aqui tranquilo|aqui tranquila|tranquilo|tranquila|relajado|relajada)$/.test(q))return'Qué bien 😄';
  if(/^(jaja+|jeje+|jajaja+)$/.test(q))return'😂';
  return'';
}

function compactCasual(reply,query){
  const text=String(reply||'').replace(/\bHalu\b/gi,'ZORDON').trim();
  if(!text||!isCasual(query))return text;
  const direct=casualReply(query);if(direct)return direct;
  if(/^te sigo[.,]/i.test(text))return'Sí, te sigo.';
  const sentences=text.split(/(?<=[.!?])\s+/).filter(Boolean);
  let short=(sentences[0]||text).trim();
  const words=short.split(/\s+/).filter(Boolean);
  if(words.length>18)short=words.slice(0,18).join(' ')+'…';
  return short;
}

function add(kind,text){
  const b=body();if(!b)return null;
  const wrap=document.createElement('div');wrap.className=`cc-eng-msg-wrap ${kind}`;
  const msg=document.createElement('div');msg.className=`cc-eng-msg ${kind}`;msg.innerHTML=esc(text);
  wrap.appendChild(msg);b.appendChild(wrap);b.scrollTop=b.scrollHeight;return wrap;
}

function finishControls(btn){
  busy=false;
  if(btn){btn.disabled=false;btn.removeAttribute('aria-busy');btn.setAttribute('aria-disabled','false')}
  input()?.focus();
}

async function ask(text){
  const q=String(text||'').trim();if(!q||busy)return;
  const inp=input(),btn=sendButton();
  busy=true;
  if(inp){inp.value='';inp.style.height='auto'}
  if(btn){btn.disabled=true;btn.setAttribute('aria-busy','true')}
  add('user',q);remember('user',q);

  const quick=casualReply(q);
  if(quick){
    add('bot',quick);remember('assistant',quick);
    try{window.__ccZordonLearning?.captureInteraction?.(q,quick,{source:'zordon-casual',interactionId:`zordon-casual-${Date.now()}`})}catch{}
    finishControls(btn);return;
  }

  const typing=add('bot','ZORDON está pensando…');
  try{
    const core=window.__ccZordonContinuousCore;
    const engine=window.__ccEngineerChat;
    let reply='';
    if(core&&typeof core.ask==='function')reply=await Promise.resolve(core.ask(q));
    else if(engine&&typeof engine.answerWithAI==='function')reply=await Promise.resolve(engine.answerWithAI(q));
    else if(engine&&typeof engine.answer==='function')reply=await Promise.resolve(engine.answer(q));
    else throw new Error('Motor ZORDON no disponible');
    typing?.remove();
    const clean=compactCasual(reply,q)||'No pude completar la respuesta. Intenta nuevamente.';
    add('bot',clean);remember('assistant',clean);
  }catch(error){
    typing?.remove();
    const fallback=isCasual(q)?'Sí, te sigo.':'No pude completar la consulta en este momento. Intenta nuevamente.';
    add('bot',fallback);remember('assistant',fallback);
    console.warn('ZORDON: fallo de envío directo.',error?.message||error);
  }finally{finishControls(btn)}
}

function pointInside(el,x,y){
  if(!el||!Number.isFinite(x)||!Number.isFinite(y))return false;
  const r=el.getBoundingClientRect();return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;
}
function isSendEvent(event){
  const btn=sendButton();if(!btn)return false;
  const target=event.target;
  if(target===btn||target?.closest?.('#ccEngineerChat .cc-eng-chat-form button[type="submit"],#ccEngineerChat .cc-eng-chat-form button[data-zordon-send]'))return true;
  return pointInside(btn,event.clientX,event.clientY);
}
function bindUi(){
  const f=form(),inp=input(),btn=sendButton();if(!f||!inp||!btn)return;
  removeIntro();
  btn.dataset.zordonSend='1';btn.type='button';btn.disabled=false;btn.setAttribute('aria-disabled','false');
  btn.style.setProperty('pointer-events','auto','important');btn.style.setProperty('position','relative','important');btn.style.setProperty('z-index','2147483647','important');
  inp.style.setProperty('pointer-events','auto','important');inp.style.setProperty('position','relative','important');inp.style.setProperty('z-index','2147483646','important');
  f.onsubmit=e=>{e.preventDefault();e.stopPropagation();ask(inp.value)};
}

window.addEventListener('click',event=>{
  if(!isSendEvent(event))return;
  event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();ask(input()?.value||'');
},true);
window.addEventListener('keydown',event=>{
  const inp=event.target?.closest?.('#ccEngineerChat .cc-eng-chat-form textarea');
  if(!inp||event.key!=='Enter'||event.shiftKey||event.isComposing)return;
  event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();ask(inp.value||'');
},true);

const observer=new MutationObserver(()=>bindUi());observer.observe(document.documentElement,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindUi,{once:true});else bindUi();
setTimeout(bindUi,250);setTimeout(bindUi,1000);
window.__ccZordonChatUI={send:ask,clean:removeIntro,status:()=>({busy,ready:!!sendButton(),version:3})};
})();