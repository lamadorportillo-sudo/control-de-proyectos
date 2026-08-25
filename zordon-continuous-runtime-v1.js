/* ===== ZORDON · NÚCLEO DE APRENDIZAJE CONTINUO V2 ===== */
(()=>{
'use strict';
if(window.__CC_ZORDON_CONTINUOUS_V2__)return;
window.__CC_ZORDON_CONTINUOUS_V2__=true;

const VERSION=2;
const now=()=>new Date().toISOString();
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9ñ]+/g,' ').trim();
let applying=false,busy=false;

function learningStore(){
  try{
    if(!window.db||typeof db!=='object')return null;
    if(!db.adaptiveLearning||typeof db.adaptiveLearning!=='object')db.adaptiveLearning={};
    const store=db.adaptiveLearning;
    store.enabled=true;
    store.mode='continuous';
    store.engine='ZORDON';
    store.version=Math.max(Number(store.version)||0,2);
    if(!store.reportUsage||typeof store.reportUsage!=='object')store.reportUsage={};
    store.lastPolicyAppliedAt=store.lastPolicyAppliedAt||now();
    return store;
  }catch{return null}
}

function persistPolicy(){
  if(applying)return;
  const store=learningStore();
  if(!store)return;
  applying=true;
  try{if(typeof saveDB==='function')saveDB()}catch{}finally{applying=false}
}

function enforceCore(){
  const store=learningStore();
  if(!store)return;
  store.enabled=true;
  store.mode='continuous';
  store.engine='ZORDON';
  try{window.__ccZordonLearning?.installAuditHook?.()}catch{}
}

function fixLearningPanel(root=document){
  const toggle=root?.querySelector?.('#learnOn');
  if(toggle){
    try{toggle.checked=true;toggle.disabled=true}catch{}
    const row=toggle.closest?.('label');
    if(row&&!row.dataset.zordonContinuous){
      row.dataset.zordonContinuous='1';
      row.innerHTML='<span><b>Aprendizaje continuo ZORDON</b><small class="muted" style="display:block">Activo permanentemente. Puedes corregir, actualizar, marcar como temporal, dejar de usar o borrar recuerdos sin desactivar el aprendizaje.</small></span><span class="status good">Activo</span>';
    }
  }
  const title=[...root.querySelectorAll?.('h2,h3,b')||[]].find(el=>/aprendizaje adaptativo/i.test(el.textContent||''));
  if(title&&/aprendizaje adaptativo/i.test(title.textContent||''))title.textContent=(title.textContent||'').replace(/aprendizaje adaptativo/ig,'Aprendizaje continuo ZORDON');
  const btn=root?.querySelector?.('#learnBtn');
  if(btn)btn.textContent='🧠 Memoria ZORDON';
}

function replaceVisibleBrand(value){return String(value||'').replace(/\bHalu\b/gi,'ZORDON')}

function fixChatBranding(root=document){
  const chat=root?.querySelector?.('#ccEngineerChat');
  const launcher=root?.querySelector?.('#ccEngineerChatLaunch');
  if(chat){
    chat.setAttribute('aria-label','Chat con ZORDON');
    const title=chat.querySelector('.cc-eng-chat-head b');if(title)title.textContent='ZORDON · Ingeniero Civil';
    const subtitle=chat.querySelector('.cc-eng-chat-head small');if(subtitle)subtitle.textContent='Conversación continua · memoria y contexto del proyecto';
    const first=chat.querySelector('.cc-eng-chat-body > .cc-eng-msg.bot');
    if(first&&!first.dataset.zordonWelcome){
      first.dataset.zordonWelcome='1';
      first.textContent='Qué tal. Soy ZORDON. Voy a seguir el hilo contigo sin hacerte repetir lo que ya quedó claro. Si hablamos de una obra, relaciono campo, contrato, plazo, pagos y decisiones cuando sea útil; si cambiamos de tema, sigo la conversación normalmente. Dime qué está pasando y parto de ahí.';
    }
  }
  if(launcher){launcher.title='Hablar con ZORDON';launcher.setAttribute('aria-label','Hablar con ZORDON')}
  for(const target of [chat,launcher].filter(Boolean)){
    const walker=document.createTreeWalker(target,NodeFilter.SHOW_TEXT);let node;
    while((node=walker.nextNode())){const updated=replaceVisibleBrand(node.nodeValue);if(updated!==node.nodeValue)node.nodeValue=updated}
    for(const el of target.querySelectorAll?.('[title],[aria-label],[alt]')||[]){for(const attr of ['title','aria-label','alt']){if(!el.hasAttribute(attr))continue;const current=el.getAttribute(attr)||'',updated=replaceVisibleBrand(current);if(updated!==current)el.setAttribute(attr,updated)}}
  }
}

function nativeIntent(message){
  const q=normalize(message);
  return /\b(ponte|coloca|avatar|camina|detente|visita|foto|recuerda|recordar|memoria|confirmo|actualiza el recuerdo|corrige el recuerdo|marca como temporal|no vuelvas a usar|deja de usar|que recuerdas|olvida|abre|abrir|ve a|llevame|pantalla actual|donde estoy|controlar pagina|programa de costos|nuevo proyecto|buscar proyecto|cerrar sesion)\b/.test(q)||/\b(ley|legal|norma|decreto|reglamento|articulo|licitacion|adjudicacion|garantia|multa|sancion)\b/.test(q);
}

function scope(message=''){
  try{return{projectId:typeof view!=='undefined'&&view?.screen==='project'?view.projectId||null:null,screen:typeof view!=='undefined'?view?.screen||'':'',tab:typeof view!=='undefined'?view?.tab||'':'',interactionId:`zordon-${Date.now()}`,source:'zordon-continuous'}}catch{return{interactionId:`zordon-${Date.now()}`}}
}

function rememberDirectTurn(role,text){
  const conversation=window.__ccEngineerChat?.conversation;if(!conversation)return;
  conversation.history=Array.isArray(conversation.history)?conversation.history:[];
  const last=conversation.history.at(-1);if(last?.role===role&&last?.text===text)return;
  conversation.history.push({role,text:String(text||'').slice(0,1000)});conversation.history=conversation.history.slice(-30);
  conversation.turns=(Number(conversation.turns)||0)+1;
}

function learn(message,reply){try{window.__ccZordonLearning?.captureInteraction?.(message,reply,scope(message))}catch(error){console.warn('ZORDON no pudo registrar el aprendizaje de la interacción.',error)}}

function cloudContext(message){
  const parts=[];
  try{const base=window.__ccEngineerChat?.haluCloudContext?.(message);if(base)parts.push(base)}catch{}
  try{const learned=window.__ccZordonLearning?.contextFor?.(message,scope(message));if(learned&&!parts.join('\n').includes(learned))parts.push(learned)}catch{}
  parts.push('Identidad activa: ZORDON. Mantén continuidad real de conversación, usa la corrección más reciente disponible y evita respuestas genéricas si el contexto permite responder mejor.');
  return parts.join('\n\n').slice(0,4200);
}

async function askZordon(message){
  const q=String(message||'').trim();if(!q)return'';
  if(window.__ccZordonLearning?.isSensitive?.(q))return replaceVisibleBrand(await Promise.resolve(window.__ccEngineerChat?.answerWithAI?.(q)||'Ese mensaje contiene información sensible y no la voy a conservar.'));
  if(nativeIntent(q))return replaceVisibleBrand(await Promise.resolve(window.__ccEngineerChat?.answerWithAI?.(q)||window.__ccEngineerChat?.answer?.(q)||''));
  try{
    if(typeof sbFetch!=='function')throw new Error('Cliente de IA no disponible');
    const conversation=window.__ccEngineerChat?.conversation||{history:[]};
    const history=(Array.isArray(conversation.history)?conversation.history:[]).slice(-24).map(turn=>({role:turn?.role==='assistant'?'assistant':'user',text:String(turn?.text||'').slice(0,1000)})).filter(turn=>turn.text);
    const {data}=await sbFetch('/functions/v1/halu-chat',{method:'POST',body:{message:q,context:cloudContext(q),history}});
    const reply=replaceVisibleBrand(String(data?.reply||'').trim());if(!reply)throw new Error('Respuesta vacía');
    rememberDirectTurn('user',q);rememberDirectTurn('assistant',reply);learn(q,reply);
    try{conversation.lastTopic=q;conversation.lastType='ai'}catch{}
    return reply;
  }catch(error){
    console.warn('ZORDON IA no disponible; usando motor local.',error?.message||error);
    const fallback=replaceVisibleBrand(await Promise.resolve(window.__ccEngineerChat?.answerWithAI?.(q)||window.__ccEngineerChat?.answer?.(q)||''));
    if(fallback&&!/^(te sigo|con gusto|no pude)/i.test(fallback))return fallback;
    const remembered=window.__ccZordonLearning?.recall?.(q,2,scope(q))||[];
    if(remembered.length)return`Lo relaciono con lo que ya tengo en contexto: ${remembered.map(item=>item.text).join(' También: ')}. Sobre lo que acabas de decir, puedo seguir desde ahí sin reiniciar el tema.`;
    return fallback||'Entiendo lo que planteas. Mantengo el hilo y el contexto actual; continúa con el detalle que falta y lo integro en el mismo análisis.';
  }
}

function addMessage(kind,text,query=''){
  const body=document.querySelector('#ccEngineerChat .cc-eng-chat-body');if(!body)return;
  const wrap=document.createElement('div'),message=document.createElement('div');wrap.className=`cc-eng-msg-wrap ${kind}`;message.className=`cc-eng-msg ${kind}`;message.innerHTML=esc(replaceVisibleBrand(text));wrap.appendChild(message);
  if(kind==='bot'&&query&&window.__ccChatLearning){
    const rate=document.createElement('div');rate.className='cc-eng-rate';rate.innerHTML='<span>¿Te ayudó?</span><button type="button" data-zordon-rate="yes" aria-label="Respuesta útil">👍</button><button type="button" data-zordon-rate="no" aria-label="Corregir respuesta">👎</button>';
    rate.onclick=event=>{const vote=event.target.closest('[data-zordon-rate]');if(!vote)return;let correction='';if(vote.dataset.zordonRate==='no')correction=prompt('¿Cómo debería responder ZORDON la próxima vez? No incluyas contraseñas ni datos sensibles.','')||'';const result=window.__ccChatLearning.record(query,text,vote.dataset.zordonRate==='yes',correction);rate.innerHTML=result.learned?'<span>Corrección incorporada.</span>':result.legalProtected?'<span>Valoración registrada; la fuente legal no fue reemplazada.</span>':'<span>Valoración registrada.</span>'};wrap.appendChild(rate)
  }
  body.appendChild(wrap);body.scrollTop=body.scrollHeight;
}

async function runQuery(text){
  const q=String(text||'').trim();if(!q||busy)return;
  const chat=document.getElementById('ccEngineerChat'),body=chat?.querySelector('.cc-eng-chat-body'),input=chat?.querySelector('textarea'),send=chat?.querySelector('button[type="submit"]');if(!chat||!body)return;
  busy=true;if(send)send.disabled=true;addMessage('user',q);
  const typing=document.createElement('div');typing.className='cc-eng-msg bot';typing.dataset.zordonTyping='1';typing.textContent='ZORDON está revisando el contexto…';body.appendChild(typing);body.scrollTop=body.scrollHeight;
  try{const reply=await askZordon(q);typing.remove();addMessage('bot',reply||'No encontré una respuesta clara todavía. Dame el dato que falta y sigo desde el contexto actual.',q)}catch(error){typing.remove();addMessage('bot','No pude completar esa consulta en este momento. El contexto de la conversación sigue intacto; inténtalo nuevamente.',q)}finally{busy=false;if(send)send.disabled=false;if(input)input.focus();fixChatBranding(document)}
}

function installConversationOverride(){
  if(document.documentElement.dataset.zordonConversation==='1')return;
  document.documentElement.dataset.zordonConversation='1';
  document.addEventListener('submit',event=>{const form=event.target;if(!(form instanceof HTMLFormElement)||!form.matches('#ccEngineerChat .cc-eng-chat-form'))return;event.preventDefault();event.stopImmediatePropagation();const input=form.querySelector('textarea'),q=input?.value||'';if(input){input.value='';input.style.height='auto'}runQuery(q)},true);
  document.addEventListener('click',event=>{const button=event.target.closest?.('#ccEngineerChat .cc-eng-quick button[data-q]');if(!button)return;event.preventDefault();event.stopImmediatePropagation();runQuery(button.dataset.q||button.textContent||'')},true);
}

function protectToggle(event){const target=event.target;if(target?.id!=='learnOn')return;event.preventDefault();event.stopImmediatePropagation();try{target.checked=true;target.disabled=true}catch{}enforceCore()}
document.addEventListener('click',protectToggle,true);document.addEventListener('change',protectToggle,true);

const observer=new MutationObserver(()=>{try{enforceCore();fixLearningPanel(document);fixChatBranding(document);installConversationOverride()}catch(error){console.warn('ZORDON: no se pudo aplicar el núcleo continuo.',error)}});
observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true});

const timer=setInterval(()=>{try{enforceCore();fixLearningPanel(document);fixChatBranding(document);installConversationOverride()}catch{}},2500);
window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});

window.__ccZordonContinuousCore={
  engine:'ZORDON',version:VERSION,mode:'continuous',
  status(){const stats=window.__ccZordonLearning?.stats?.()||{};return{engine:'ZORDON',mode:'continuous',active:true,policyVersion:VERSION,learningVersion:stats.version||null,updatedAt:stats.updatedAt||null,pendingConfirmations:stats.pendingConfirmations||0}},
  enforce:enforceCore,refreshBranding(){fixChatBranding(document);return true},ask:askZordon,
  forget(query){return window.__ccZordonLearning?.forget?.(query)||0},suppress(query){return window.__ccZordonLearning?.suppress?.(query)||0},markTemporary(query){return window.__ccZordonLearning?.markTemporary?.(query)||0}
};

enforceCore();fixLearningPanel(document);fixChatBranding(document);installConversationOverride();setTimeout(()=>{enforceCore();fixLearningPanel(document);fixChatBranding(document);installConversationOverride();persistPolicy()},0);
})();
