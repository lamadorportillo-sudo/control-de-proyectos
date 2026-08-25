/* ===== ZORDON · ENVÍO DIRECTO V2 ===== */
(()=>{
'use strict';
if(window.__CC_ZORDON_CHAT_SUBMIT_V2__)return;
window.__CC_ZORDON_CHAT_SUBMIT_V2__=true;

let busy=false;
const esc=v=>String(v??'');

function chatParts(){
  const chat=document.querySelector('#ccEngineerChat');
  if(!chat)return{};
  return{
    chat,
    body:chat.querySelector('.cc-eng-chat-body'),
    form:chat.querySelector('.cc-eng-chat-form'),
    input:chat.querySelector('.cc-eng-chat-form textarea'),
    button:chat.querySelector('.cc-eng-chat-form button[type="submit"]')
  };
}

function add(kind,text){
  const {body}=chatParts();
  if(!body)return null;
  const wrap=document.createElement('div');
  wrap.className=`cc-eng-msg-wrap ${kind}`;
  const msg=document.createElement('div');
  msg.className=`cc-eng-msg ${kind}`;
  msg.textContent=esc(text);
  wrap.appendChild(msg);
  body.appendChild(wrap);
  body.scrollTop=body.scrollHeight;
  return wrap;
}

async function send(){
  const {input,button}=chatParts();
  if(!input||!button||busy)return;
  const q=String(input.value||'').trim();
  if(!q)return;

  busy=true;
  button.disabled=true;
  button.setAttribute('aria-busy','true');
  input.value='';
  input.style.height='auto';
  add('user',q);
  const thinking=add('bot','ZORDON está pensando…');

  try{
    const engine=window.__ccEngineerChat?.answerWithAI||window.__ccEngineerChat?.answer;
    if(typeof engine!=='function')throw new Error('Motor de ZORDON no disponible');
    const reply=await Promise.resolve(engine(q));
    thinking?.remove();
    add('bot',String(reply||'').trim()||'No pude completar la respuesta. Escríbeme de nuevo y seguimos desde aquí.');
  }catch(error){
    thinking?.remove();
    add('bot','No pude completar el envío. Intenta nuevamente; tu conversación sigue abierta.');
    console.warn('ZORDON V2: error al enviar.',error?.message||error);
  }finally{
    busy=false;
    button.disabled=false;
    button.removeAttribute('aria-busy');
    input.focus();
  }
}

function harden(){
  const {form,input,button}=chatParts();
  if(!form||!input||!button)return;
  form.setAttribute('novalidate','novalidate');
  button.disabled=false;
  button.style.setProperty('pointer-events','auto','important');
  button.style.setProperty('position','relative','important');
  button.style.setProperty('z-index','2147483646','important');
  input.style.setProperty('pointer-events','auto','important');
  input.style.setProperty('position','relative','important');
  input.style.setProperty('z-index','2147483645','important');
}

// Captura antes que cualquier manejador antiguo y envía directamente.
document.addEventListener('click',event=>{
  const button=event.target?.closest?.('#ccEngineerChat .cc-eng-chat-form button[type="submit"]');
  if(!button)return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  send();
},true);

document.addEventListener('keydown',event=>{
  const input=event.target?.closest?.('#ccEngineerChat .cc-eng-chat-form textarea');
  if(!input||event.key!=='Enter'||event.shiftKey||event.isComposing)return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  send();
},true);

const observer=new MutationObserver(harden);
observer.observe(document.documentElement,{subtree:true,childList:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',harden,{once:true});else harden();
setInterval(harden,1500);

window.__ccZordonChatSubmitV2={send,harden,status:()=>({active:true,busy})};
})();