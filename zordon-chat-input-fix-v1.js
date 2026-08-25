/* ===== ZORDON · ENVÍO DE CHAT RESILIENTE V1 ===== */
(()=>{
'use strict';
if(window.__CC_ZORDON_CHAT_INPUT_FIX_V1__)return;
window.__CC_ZORDON_CHAT_INPUT_FIX_V1__=true;

const CHAT='#ccEngineerChat';
const FORM='.cc-eng-chat-form';
let fallbackBusy=false;

function hasThinking(body){
  return /(?:ZORDON|Halu)\s+est[aá]\s+pensando/i.test(body?.textContent||'');
}
function lastUserText(body){
  const nodes=body?.querySelectorAll?.('.cc-eng-msg.user')||[];
  return nodes.length?String(nodes[nodes.length-1].textContent||'').trim():'';
}
function addMessage(body,kind,text){
  if(!body)return null;
  const wrap=document.createElement('div');
  wrap.className=`cc-eng-msg-wrap ${kind}`;
  const msg=document.createElement('div');
  msg.className=`cc-eng-msg ${kind}`;
  msg.textContent=String(text||'');
  wrap.appendChild(msg);
  body.appendChild(wrap);
  body.scrollTop=body.scrollHeight;
  return wrap;
}
async function fallbackSend(form,input,button,q){
  const chat=form.closest(CHAT),body=chat?.querySelector('.cc-eng-chat-body');
  if(!body||fallbackBusy||hasThinking(body))return;
  if(lastUserText(body)===q)return;
  fallbackBusy=true;
  button.disabled=true;
  input.value='';
  input.style.height='auto';
  addMessage(body,'user',q);
  const thinking=addMessage(body,'bot','ZORDON está pensando…');
  try{
    const engine=window.__ccEngineerChat?.answerWithAI;
    if(typeof engine!=='function')throw new Error('Motor de chat no disponible');
    const reply=await Promise.resolve(engine(q));
    thinking?.remove();
    addMessage(body,'bot',String(reply||'').trim()||'No pude completar esa respuesta. Escríbeme de nuevo y continuamos desde aquí.');
  }catch(error){
    thinking?.remove();
    addMessage(body,'bot','No pude completar el envío. El mensaje quedó en pantalla; inténtalo nuevamente.');
    console.warn('ZORDON: envío de respaldo falló.',error?.message||error);
  }finally{
    fallbackBusy=false;
    button.disabled=false;
    input.focus();
  }
}
function bind(){
  const chat=document.querySelector(CHAT),form=chat?.querySelector(FORM);
  if(!form||form.dataset.zordonSendFix)return;
  const input=form.querySelector('textarea'),button=form.querySelector('button[type="submit"]');
  if(!input||!button)return;
  form.dataset.zordonSendFix='1';
  button.style.pointerEvents='auto';
  button.style.position='relative';
  button.style.zIndex='5';
  button.setAttribute('aria-disabled','false');

  button.addEventListener('click',event=>{
    const q=String(input.value||'').trim();
    if(!q)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const body=chat.querySelector('.cc-eng-chat-body');
    const beforeCount=body?.querySelectorAll?.('.cc-eng-msg.user').length||0;
    if(button.disabled&&!hasThinking(body))button.disabled=false;
    try{
      const submitEvent=typeof SubmitEvent==='function'
        ?new SubmitEvent('submit',{bubbles:true,cancelable:true,submitter:button})
        :new Event('submit',{bubbles:true,cancelable:true});
      form.dispatchEvent(submitEvent);
    }catch(error){console.warn('ZORDON: no se pudo disparar submit normal.',error)}
    setTimeout(()=>{
      const afterCount=body?.querySelectorAll?.('.cc-eng-msg.user').length||0;
      if(afterCount<=beforeCount&&!hasThinking(body))fallbackSend(form,input,button,q);
    },120);
  },true);

  input.addEventListener('keydown',event=>{
    if(event.key!=='Enter'||event.shiftKey||event.isComposing)return;
    event.preventDefault();
    button.click();
  },true);

  // Recupera botones que hayan quedado bloqueados por una solicitud interrumpida.
  setInterval(()=>{
    const body=chat.querySelector('.cc-eng-chat-body');
    if(button.disabled&&!fallbackBusy&&!hasThinking(body)){
      button.disabled=false;
      button.setAttribute('aria-disabled','false');
    }
  },1800);
}

const observer=new MutationObserver(bind);
observer.observe(document.documentElement,{subtree:true,childList:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
