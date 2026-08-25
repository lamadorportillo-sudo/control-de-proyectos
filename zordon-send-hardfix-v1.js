/* ===== ZORDON · ENVIO FISICO PRIORITARIO V1 ===== */
(()=>{
'use strict';
if(window.__CC_ZORDON_SEND_HARDFIX_V1__)return;
window.__CC_ZORDON_SEND_HARDFIX_V1__=true;

const CHAT='#ccEngineerChat';
let lastSendAt=0;
let lastText='';

function controls(){
  const chat=document.querySelector(CHAT);
  const form=chat?.querySelector('.cc-eng-chat-form');
  const input=form?.querySelector('textarea');
  const button=form?.querySelector('button[type="submit"]');
  return{chat,form,input,button};
}

function insideRect(event,element){
  if(!element||typeof event?.clientX!=='number'||typeof event?.clientY!=='number')return false;
  const r=element.getBoundingClientRect();
  return event.clientX>=r.left&&event.clientX<=r.right&&event.clientY>=r.top&&event.clientY<=r.bottom;
}

function makeInteractive(){
  const {form,input,button}=controls();
  if(!form||!input||!button)return;
  form.style.setProperty('position','relative','important');
  form.style.setProperty('z-index','2147483644','important');
  form.style.setProperty('pointer-events','auto','important');
  input.style.setProperty('pointer-events','auto','important');
  input.style.setProperty('position','relative','important');
  input.style.setProperty('z-index','2147483645','important');
  button.disabled=false;
  button.removeAttribute('disabled');
  button.setAttribute('aria-disabled','false');
  button.style.setProperty('pointer-events','auto','important');
  button.style.setProperty('position','relative','important');
  button.style.setProperty('z-index','2147483647','important');
  button.style.setProperty('touch-action','manipulation','important');
}

function sendNow(){
  const {input,button}=controls();
  const q=String(input?.value||'').trim();
  if(!q)return false;
  const now=Date.now();
  if(q===lastText&&now-lastSendAt<700)return true;
  lastText=q;lastSendAt=now;
  if(input){input.value='';input.style.height='auto'}
  if(button){button.disabled=true;button.setAttribute('aria-busy','true')}
  try{
    const core=window.__ccZordonContinuousCore;
    if(core&&typeof core.send==='function'){
      Promise.resolve(core.send(q)).finally(()=>{const c=controls();if(c.button){c.button.disabled=false;c.button.removeAttribute('aria-busy');c.button.setAttribute('aria-disabled','false')}c.input?.focus()});
      return true;
    }
    const engine=window.__ccEngineerChat?.answerWithAI;
    if(typeof engine==='function'){
      const body=document.querySelector('#ccEngineerChat .cc-eng-chat-body');
      const add=(kind,text)=>{if(!body)return;const wrap=document.createElement('div'),msg=document.createElement('div');wrap.className=`cc-eng-msg-wrap ${kind}`;msg.className=`cc-eng-msg ${kind}`;msg.textContent=String(text||'');wrap.appendChild(msg);body.appendChild(wrap);body.scrollTop=body.scrollHeight};
      add('user',q);add('bot','ZORDON está revisando el contexto…');
      const typing=body?.lastElementChild;
      Promise.resolve(engine(q)).then(reply=>{typing?.remove();add('bot',String(reply||'').replace(/\bHalu\b/gi,'ZORDON')||'No pude completar la respuesta.')}).catch(()=>{typing?.remove();add('bot','No pude completar la consulta. Inténtalo nuevamente.')}).finally(()=>{const c=controls();if(c.button){c.button.disabled=false;c.button.removeAttribute('aria-busy');c.button.setAttribute('aria-disabled','false')}c.input?.focus()});
      return true;
    }
  }catch(error){console.warn('ZORDON hardfix:',error?.message||error)}
  if(button){button.disabled=false;button.removeAttribute('aria-busy')}
  return false;
}

function interceptPointer(event){
  const {button}=controls();
  if(!button)return;
  const targetButton=event.target?.closest?.('#ccEngineerChat .cc-eng-chat-form button[type="submit"]');
  if(!targetButton&&!insideRect(event,button))return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  sendNow();
}

function interceptKey(event){
  const {input}=controls();
  if(!input||event.target!==input||event.key!=='Enter'||event.shiftKey||event.isComposing)return;
  event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();sendNow();
}

function interceptSubmit(event){
  if(!event.target?.matches?.('#ccEngineerChat .cc-eng-chat-form'))return;
  event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();sendNow();
}

// Se instala en window para ejecutarse antes que los manejadores heredados del documento.
window.addEventListener('pointerup',interceptPointer,true);
window.addEventListener('click',interceptPointer,true);
window.addEventListener('keydown',interceptKey,true);
window.addEventListener('submit',interceptSubmit,true);

const observer=new MutationObserver(makeInteractive);
observer.observe(document.documentElement,{subtree:true,childList:true});
const timer=setInterval(makeInteractive,500);
window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',makeInteractive,{once:true});else makeInteractive();
window.__ccZordonSendHardfix={send:sendNow,refresh:makeInteractive};
})();
