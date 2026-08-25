/* ===== ZORDON · CHAT NATURAL Y CONTINUO V4 ===== */
(()=>{
'use strict';
if(window.__CC_ZORDON_CHAT_UI_V4__)return;
window.__CC_ZORDON_CHAT_UI_V4__=true;

let busy=false;
const CHAT='#ccEngineerChat';

function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function norm(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9ñ]+/g,' ').trim()}
function chat(){return document.querySelector(CHAT)}
function body(){return chat()?.querySelector('.cc-eng-chat-body')||null}
function form(){return chat()?.querySelector('.cc-eng-chat-form')||null}
function input(){return form()?.querySelector('textarea')||null}
function sendButton(){return form()?.querySelector('button[type="submit"],button[data-zordon-send]')||null}
function conversation(){return window.__ccEngineerChat?.conversation||null}

function remember(role,text,type='social'){
  const c=conversation();if(!c)return;
  c.history=Array.isArray(c.history)?c.history:[];
  const clean=String(text||'').trim();if(!clean)return;
  const last=c.history.at(-1);if(last?.role===role&&last?.text===clean)return;
  c.history.push({role,text:clean.slice(0,1000)});c.history=c.history.slice(-30);
  c.lastType=type;
}

function removeIntro(){
  const b=body();if(!b)return;
  b.querySelectorAll('.cc-eng-quick,.cc-eng-rate').forEach(node=>node.remove());
  if(!b.querySelector('.cc-eng-msg.user,.cc-eng-msg-wrap.user')){
    [...b.children].forEach(node=>{
      if(node.matches?.('.cc-eng-msg.bot')&&/Qué tal\. Soy (?:Halu|ZORDON)|Aquí hablamos directo|Voy a seguir el hilo contigo/i.test(node.textContent||''))node.remove();
    });
  }
  b.style.paddingTop='14px';
}

function technicalMessage(text){
  const q=norm(text);
  return /\b(proyecto|obra|contrato|contratista|estimacion|estimaciones|pago|pagos|presupuesto|avance|visita|garantia|plazo|multa|adenda|orden de cambio|licitacion|oferta|ingenieria|calculo|estructura|concreto|pavimento|supervision|informe|reporte|documento|ley|norma|articulo|costos?|supabase|base de datos|codigo|programar|programacion)\b/.test(q);
}

function wantsCasual(text){
  const q=norm(text),c=conversation();
  if(/\b(no quiero hablar de trabajo|cero trabajo|nada de trabajo|solo platicar|solo quiero platicar|quiero platicar|quiero hablar de otra cosa|conversemos|hablemos de otra cosa)\b/.test(q)){
    if(c)c.zordonCasualLock=true;
    return true;
  }
  if(/\b(volvamos al trabajo|hablemos de trabajo|vamos con el proyecto|sigamos con el proyecto)\b/.test(q)){
    if(c)c.zordonCasualLock=false;
    return false;
  }
  return !!c?.zordonCasualLock;
}

function socialSignal(text){
  const q=norm(text);
  return /\b(hola|buenas|que tal|como estas|y tu|y vos|bien|cansado|cansada|tranquilo|tranquila|aburrido|aburrida|platicar|hablar|pelicula|peliculas|serie|series|terror|miedo|dibujar|dibujo|carbon|rostros|jaja|jeje|gracias|cuentame de ti|me gusta|me gustan|amigo|fin de semana)\b/.test(q);
}

function modeFor(text){
  if(technicalMessage(text))return'technical';
  if(wantsCasual(text))return'casual';
  const q=norm(text),words=q.split(/\s+/).filter(Boolean),c=conversation();
  if(socialSignal(q))return'casual';
  if(c?.lastType==='social'&&words.length<=26)return'casual';
  return'normal';
}

function casualReply(text){
  const q=norm(text);if(!q)return'';
  if(/^(hola+|buenas|buenos dias|buenas tardes|buenas noches|hey|que tal)$/.test(q))return'¡Hola! ¿Cómo estás?';
  if(/^(gracias|muchas gracias|gracias zordon)$/.test(q))return'¡De nada! 😄';
  if(/^(jaja+|jeje+|jajaja+|jiji+)$/.test(q))return'Jajaja 😄';
  if(/\b(no quiero hablar de trabajo|cero trabajo|nada de trabajo)\b/.test(q))return'Va, cero trabajo 😄';
  if(/\b(bien|muy bien|todo bien)\b.*\b(y tu|y vos|tu que tal)\b/.test(q)||/^(y tu|y vos)$/.test(q))return'Bien también 😄';
  return'';
}

function compactCasual(reply,query){
  let text=String(reply||'').replace(/\bHalu\b/gi,'ZORDON').trim();
  if(!text||modeFor(query)!=='casual')return text;
  text=text.replace(/^(te entiendo totalmente|entiendo perfectamente|claro que sí|por supuesto)[,.! ]*/i,'');
  const sentences=text.split(/(?<=[.!?])\s+/).filter(Boolean);
  let short=(sentences[0]||text).trim();
  if(sentences.length>1){
    const candidate=`${short} ${sentences[1]}`.trim();
    if(candidate.split(/\s+/).length<=18)short=candidate;
  }
  const words=short.split(/\s+/).filter(Boolean);
  if(words.length>18)short=words.slice(0,18).join(' ')+'…';
  if(/^te sigo[.,]?$/i.test(short))return'Sí 😄';
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
  const inp=input(),btn=sendButton(),mode=modeFor(q);
  busy=true;
  if(inp){inp.value='';inp.style.height='auto'}
  if(btn){btn.disabled=true;btn.setAttribute('aria-busy','true')}
  add('user',q);remember('user',q,mode==='casual'?'social':mode);

  const quick=mode==='casual'?casualReply(q):'';
  if(quick){
    add('bot',quick);remember('assistant',quick,'social');
    try{window.__ccZordonLearning?.captureInteraction?.(q,quick,{source:'zordon-casual',interactionId:`zordon-casual-${Date.now()}`})}catch{}
    finishControls(btn);return;
  }

  const typing=add('bot',mode==='casual'?'…':'ZORDON está pensando…');
  try{
    const core=window.__ccZordonContinuousCore;
    const engine=window.__ccEngineerChat;
    let reply='';
    if(core&&typeof core.ask==='function')reply=await Promise.resolve(core.ask(q));
    else if(engine&&typeof engine.answerWithAI==='function')reply=await Promise.resolve(engine.answerWithAI(q));
    else if(engine&&typeof engine.answer==='function')reply=await Promise.resolve(engine.answer(q));
    else throw new Error('Motor ZORDON no disponible');
    typing?.remove();
    const clean=(mode==='casual'?compactCasual(reply,q):String(reply||'').replace(/\bHalu\b/gi,'ZORDON').trim())||'No pude completar la respuesta. Intenta nuevamente.';
    add('bot',clean);remember('assistant',clean,mode==='casual'?'social':mode);
  }catch(error){
    typing?.remove();
    const fallback=mode==='casual'?'Aquí sigo 😄':'No pude completar la consulta en este momento. Intenta nuevamente.';
    add('bot',fallback);remember('assistant',fallback,mode==='casual'?'social':mode);
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
window.__ccZordonChatUI={send:ask,clean:removeIntro,status:()=>({busy,ready:!!sendButton(),version:4,mode:conversation()?.lastType||''})};
})();