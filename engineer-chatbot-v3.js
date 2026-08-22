/* ===== HALU · INGENIERO CIVIL DE APOYO ===== */
(()=>{
'use strict';
if(window.__CC_ENGINEER_CHATBOT_V1__)return;
window.__CC_ENGINEER_CHATBOT_V1__=true;

const E=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const A=v=>Array.isArray(v)?v:[];
const tabLabels={summary:'Resumen',procurement:'Ofertas y adjudicación',contract:'Contrato',controls:'Cláusulas y controles',estimates:'Pagos / Estimaciones',visits:'Visitas',guarantees:'Garantías',changes:'Modificaciones',reports:'Informes',lifecycle:'Proceso contractual',gallery:'Galería'};
const tabWords=[
  [/\b(resumen|inicio del expediente)\b/i,'summary'],[/\b(oferta|ofertas|adjudicaci[oó]n)\b/i,'procurement'],[/\bcontrato\b/i,'contract'],
  [/\b(cl[aá]usula|control contractual)\b/i,'controls'],[/\b(pago|pagos|estimaci[oó]n|estimaciones)\b/i,'estimates'],[/\b(visita|visitas|supervisi[oó]n)\b/i,'visits'],
  [/\b(garant[ií]a|garant[ií]as)\b/i,'guarantees'],[/\b(modificaci[oó]n|modificaciones|cambio|adenda)\b/i,'changes'],[/\b(informe|informes|reporte del proyecto)\b/i,'reports'],
  [/\b(proceso contractual|ciclo contractual)\b/i,'lifecycle'],[/\b(galer[ií]a|foto|fotos)\b/i,'gallery']
];
const screenWords=[[/\b(inicio|panel principal|dashboard)\b/i,'home'],[/\bproyectos\b/i,'projects'],[/\bpresupuesto\b/i,'budget'],[/\balertas\b/i,'alerts'],[/\bauditor[ií]a\b/i,'audit'],[/\breportes\b/i,'reports']];
const conversation={lastTopic:'',lastType:'',turns:0,userName:'',history:[]};
const conversationalNorm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-zñ0-9]+/g,' ').trim();
function rememberTurn(role,text){conversation.history.push({role,text:String(text||'').slice(0,500)});conversation.history=conversation.history.slice(-12)}
function socialReply(q,spoken){
  const name=conversation.userName?`, ${conversation.userName}`:'';
  if(/^(gracias|muchas gracias|perfecto|entendido)$/.test(spoken)){conversation.lastType='social';return`A la orden${name}. ¿Cómo seguimos?`}
  const named=spoken.match(/^(?:me llamo|mi nombre es)\s+([a-zñ]{2,24})$/);if(named){conversation.userName=named[1].charAt(0).toUpperCase()+named[1].slice(1);conversation.lastType='social';return`Mucho gusto, ${conversation.userName}. ¿Qué tienes entre manos hoy?`}
  if(/\b(hola+|buenas|buenos dias|buenas tardes|buenas noches|hey|que tal)\b/.test(spoken)){conversation.lastType='social';return`Qué tal${name}. Aquí andamos, entre contratos, estimaciones y problemas de obra, como siempre. ¿Cómo estás tú?`}
  if(/\b(tranquilo|tranquila|relajado|relajada|todo bien|muy bien|aqui bien|ahi vamos)\b/.test(spoken)&&(/\by tu\b/.test(spoken)||conversation.lastType==='social')){conversation.lastType='social';return`Pues qué bueno${name}. Yo aquí, pendiente de la obra. ¿Qué tienes entre manos hoy?`}
  if(/^(bien|excelente|super|genial|todo bien|mas o menos|ahi vamos)( y tu)?$/.test(spoken)){conversation.lastType='social';return`Me alegra saberlo${name}. Yo estoy muy bien, gracias por preguntar. ¿Cómo va tu día?`}
  if(/^(mal|no muy bien|cansado|cansada|preocupado|preocupada|estresado|estresada)$/.test(spoken)){conversation.lastType='social';return`Lo siento${name}. Cuéntame qué pasó y lo vemos con calma.`}
  if(/\b(como estas|como te va|y tu|que haces)\b/.test(spoken)){conversation.lastType='social';return`Bien${name}, revisando números y plazos. ¿Cómo va tu día?`}
  if(/^(necesito ayuda|ayudame|no se por donde empezar|no se por donde comenzar)$/.test(spoken)){conversation.lastType='help';return'Mira, dime qué tienes trabado y arrancamos por lo urgente. ¿Qué pasó?'}
  if(/^(quiero hablar|conversemos|hablemos|cuentame algo)$/.test(spoken)){conversation.lastType='social';return`Dale${name}, conversemos. Puede ser de obra, contratos, proveedores o de ese atraso que nadie quiere poner por escrito. ¿Qué anda pasando?`}
  if(/\b(espero (?:que )?me ayudes|cuento contigo|llevar un buen control|trabajemos juntos|quiero que me ayudes)\b/.test(spoken)){conversation.lastType='work';return`Esa es la idea${name}: cuadrar lo contratado, lo ejecutado y lo pagado. ¿Con qué proyecto arrancamos?`}
  if(/\b(que bueno|me alegro|excelente|perfecto)\b/.test(spoken)&&conversation.lastType==='social'){return`Pues sí${name}, aquí vamos a llevarlo con orden y sin tanta vuelta. Lo importante es registrar las cosas cuando pasan, no reconstruir la historia tres meses después. ¿Con qué proyecto arrancamos?`}
  if(conversation.lastType==='social'&&spoken.split(/\s+/).length<=25&&!/\b(ley|contrato|proyecto|articulo|busca|investiga|explica|como hago|que es|cuando|donde|cuanto)\b/.test(spoken)){return`Te sigo${name}. La conversación va por buen camino; dime cómo están trabajando ahora y de ahí sacamos el siguiente paso. ¿Qué tienen en marcha?`}
  return'';
}

function css(){
  if(document.getElementById('ccEngineerChatStyle'))return;
  const s=document.createElement('style');s.id='ccEngineerChatStyle';s.textContent=`
  .cc-eng-chat-launch{position:fixed;right:20px;bottom:20px;z-index:120;width:62px;height:62px;border:2px solid #38bdf8;border-radius:50%;padding:0;overflow:hidden;background:#07111d;box-shadow:0 14px 38px rgba(0,0,0,.45),0 0 0 5px rgba(56,189,248,.10);cursor:pointer}.cc-eng-chat-launch img{width:100%;height:100%;object-fit:cover}.cc-eng-chat-launch .dot{position:absolute;right:2px;bottom:3px;width:13px;height:13px;border:2px solid #07111d;border-radius:50%;background:#22c55e}
  .cc-eng-chat{position:fixed;right:20px;bottom:94px;z-index:121;width:min(390px,calc(100vw - 24px));height:min(610px,calc(100vh - 120px));display:none;grid-template-rows:auto 1fr auto;border:1px solid #29405a;border-radius:18px;overflow:hidden;background:#08111b;box-shadow:0 22px 70px rgba(0,0,0,.58);color:#eaf3fc}.cc-eng-chat.open{display:grid}.cc-eng-chat-head{display:flex;align-items:center;gap:10px;padding:12px 13px;border-bottom:1px solid #213247;background:linear-gradient(135deg,#10243b,#09131f)}.cc-eng-chat-head img{width:43px;height:43px;border-radius:50%;object-fit:cover;border:1px solid #38bdf8}.cc-eng-chat-head div{min-width:0;flex:1}.cc-eng-chat-head b,.cc-eng-chat-head small{display:block}.cc-eng-chat-head small{color:#83a0bb;font-size:9px;margin-top:2px}.cc-eng-chat-close{border:0;background:transparent;color:#9fb5ca;font-size:20px;cursor:pointer}
  .cc-eng-chat-body{overflow:auto;padding:13px;display:flex;flex-direction:column;gap:9px}.cc-eng-msg{max-width:86%;padding:9px 11px;border-radius:13px;font-size:11px;line-height:1.45;white-space:pre-wrap}.cc-eng-msg.bot{align-self:flex-start;background:#112238;border:1px solid #244667}.cc-eng-msg.user{align-self:flex-end;background:#174b7a;border:1px solid #246da9}.cc-eng-quick{display:flex;flex-wrap:wrap;gap:6px}.cc-eng-quick button{border:1px solid #294866;border-radius:999px;background:#0c1a29;color:#b8d5ee;padding:7px 9px;font-size:9px;cursor:pointer}.cc-eng-quick button:hover{border-color:#38bdf8;color:#fff}.cc-eng-msg-wrap{display:flex;flex-direction:column}.cc-eng-msg-wrap.bot{align-items:flex-start}.cc-eng-msg-wrap.user{align-items:flex-end}.cc-eng-msg-wrap .cc-eng-msg{align-self:inherit}.cc-eng-rate{display:flex;align-items:center;gap:5px;margin:4px 0 1px 5px;color:#7892aa;font-size:9px}.cc-eng-rate button{border:1px solid #29405a;border-radius:8px;background:#0a1623;color:#bcd0e2;padding:3px 6px;cursor:pointer}.cc-eng-rate button:hover{border-color:#38bdf8}
  .cc-eng-chat-form{display:grid;grid-template-columns:1fr auto;gap:7px;padding:10px;border-top:1px solid #213247;background:#09131f}.cc-eng-chat-form input{min-width:0;border:1px solid #29405a;border-radius:11px;background:#060d15;color:#eef6ff;padding:10px 11px;font-size:11px}.cc-eng-chat-form button{border:0;border-radius:11px;background:#2563eb;color:#fff;padding:0 14px;font-weight:850;cursor:pointer}
  @media(max-width:520px){.cc-eng-chat-launch{right:12px;bottom:12px}.cc-eng-chat{right:12px;bottom:84px;height:calc(100vh - 105px)}}
  `;document.head.appendChild(s);
}
function contextText(){
  try{
    if(view?.screen==='project'){
      const p=A(db?.projects).find(x=>x.id===view.projectId);return p?`Estás en el expediente ${p.code||''}, pestaña ${tabLabels[view.tab]||view.tab||'Resumen'}.`:'Estás en un expediente.';
    }
    const labels={projects:'Proyectos',budgetPortfolio:'Presupuesto'};return `Estás en ${labels[view?.screen]||'el Centro de Control'}.`;
  }catch{return'Estás en el sistema de Control Contractual.'}
}
function navigateTab(tab){
  try{
    if(view?.screen!=='project'||!view?.projectId)return false;
    view.tab=tab;renderProject();return true;
  }catch{return false}
}
function navigateScreen(section){
  try{
    if(window.__ccExecutiveRelations&&document.querySelector(`[data-ccx="${section}"]`)){document.querySelector(`[data-ccx="${section}"]`).click();return true}
    if(section==='projects'){view.screen='projects';view.projectId=null;renderApp();return true}
  }catch{}
  return false;
}
function answer(text){
  const q=String(text||'').trim();
  const spoken=conversationalNorm(q);conversation.turns+=1;
  if(!q)return'Escribe una consulta legal o dime qué pestaña deseas abrir.';
  rememberTurn('user',q);window.__ccChatLearning?.observeStyle?.(q);
  if(/\b(eres una ia|eres ia|inteligencia artificial|eres un bot|eres humano|persona real)\b/.test(spoken))return'Soy Halu, el asistente digital de ingeniería del sistema; no te voy a vender humo diciendo que soy una persona. ¿Qué revisamos?';
  const remember=q.match(/^recuerda que\s+(.+)/i);if(remember){const result=window.__ccChatLearning?.rememberFact?.(remember[1]);return result?.saved?`Anotado: ${result.text}. ¿Algo más que deba relacionar?`:'Eso parece incluir un dato sensible y no lo guardaré. ¿Puedes redactarlo sin claves ni información privada?'}
  const recall=q.match(/^qu[eé] recuerdas (?:de|del|sobre|acerca de)\s+(.+)/i);if(recall){const facts=window.__ccChatLearning?.recall?.(recall[1],3)||[];return facts.length?`Mira, tengo presente esto: ${facts.map(item=>item.text).join(' También recuerdo que ')}. ¿Cuál de esos puntos retomamos?`:`No tengo un recuerdo aprobado sobre ${recall[1]}. Si quieres conservarlo entre sesiones, dime “recuerda que…” y lo dejo anotado. ¿Qué dato era?`}
  const forget=q.match(/^olvida (?:que\s+)?(.+)/i);if(forget){const removed=window.__ccChatLearning?.forget?.(forget[1])||0;return removed?`Listo, quité ${removed} recuerdo${removed===1?'':'s'} relacionado${removed===1?'':'s'}. ¿Seguimos con otro asunto?`:'No encontré un recuerdo que coincida con eso. ¿Cómo lo habíamos anotado?'}
  const social=socialReply(q,spoken);if(social){rememberTurn('assistant',social);return social}
  if(/^(que has aprendido|que recuerdas|memoria|aprendizaje)$/.test(spoken)){const stats=window.__ccChatLearning?.stats?.()||{examples:0,feedback:0,facts:0,styleSamples:0};return`Mira, en este espacio tengo ${stats.facts} recuerdo${stats.facts===1?'':'s'} aprobado${stats.facts===1?'':'s'}, ${stats.examples} respuesta${stats.examples===1?'':'s'} corregida${stats.examples===1?'':'s'} y ${stats.feedback} valoración${stats.feedback===1?'':'es'}. También he ajustado el tono con ${stats.styleSamples} interacción${stats.styleSamples===1?'':'es'}, sin guardar los mensajes completos. ¿Qué parte quieres revisar?`;}
  if(/^(gracias|muchas gracias|perfecto|entendido)[!.\s]*$/i.test(q))return'Con gusto. Si quieres, seguimos con otra consulta o revisamos juntos una etapa del proyecto.';
  if(/d[oó]nde estoy|ubicaci[oó]n actual|pantalla actual/i.test(q))return contextText();
  if(/qu[eé] puedes hacer|ayuda|opciones/i.test(q))return'Reviso normativa, ubico módulos y sigo el control del proyecto contigo. ¿Qué tienes pendiente?';
  const tab=tabWords.find(([rx])=>rx.test(q));
  if(tab&&/abre|abrir|ir|ll[eé]vame|mostrar|ve a/i.test(q))return navigateTab(tab[1])?`Abrí ${tabLabels[tab[1]]||tab[1]} en el expediente actual.`:`Para abrir ${tabLabels[tab[1]]||tab[1]}, primero entra a un expediente desde Proyectos.`;
  const screen=screenWords.find(([rx])=>rx.test(q));
  if(screen&&/abre|abrir|ir|ll[eé]vame|mostrar|ve a/i.test(q))return navigateScreen(screen[1])?`Abrí ${screen[1]==='home'?'Inicio':screen[1]}.`:'No pude cambiar de pantalla desde el estado actual. Usa el menú superior.';
  const legalIntent=/\b(ley|legal|norma|decreto|reglamento|art[ií]culo|licitaci[oó]n|adjudicaci[oó]n|oferente|pliego|garant[ií]a|multa|sanci[oó]n|contratista|contrataci[oó]n|presupuesto|vigencia|plazo)\b/i.test(q);
  if(window.__ccLegalKnowledge&&legalIntent){
    conversation.lastTopic=q;conversation.lastType='legal';
    const legal=window.__ccLegalKnowledge.answer(q);
    return window.__ccWebKnowledge?window.__ccWebKnowledge.answer(q).then(web=>`${legal}\n\n${web}`):legal;
  }
  if(/relacion|sincron|actualiza/i.test(q))return'Los módulos usan el mismo expediente; un cambio contractual debe reflejarse en resumen, pagos e informes. ¿Qué dato no te está cuadrando?';
  if(/pestaña|m[oó]dulo|proceso/i.test(q))return'Resumen concentra el estado; Contrato, Pagos, Visitas y Garantías alimentan el control. ¿Qué etapa estás trabajando?';
  const learned=window.__ccChatLearning?.answer?.(q);if(learned)return learned;
  const remembered=window.__ccChatLearning?.recall?.(q,2)||[];if(remembered.length)return`Esto conecta con lo anotado: ${remembered.map(item=>item.text).join(' También: ')}. ¿Cómo siguió en campo?`;
  if(/^(si|claro|por favor|continua|sigue|explicame mas|mas detalles)$/.test(spoken)&&conversation.lastTopic){
    const follow=`${conversation.lastTopic} ${q}`;
    if(conversation.lastType==='legal'&&window.__ccLegalKnowledge){const legal=window.__ccLegalKnowledge.answer(follow);return window.__ccWebKnowledge?window.__ccWebKnowledge.answer(follow).then(web=>`${legal}\n\n${web}`):legal}
    if(window.__ccWebKnowledge)return window.__ccWebKnowledge.answer(follow);
  }
  const infoIntent=/[?¿]|\b(busca|investiga|consulta|explica|que es|que significa|como se|como hago|cuando|donde|cuanto|quien|por que|informacion)\b/i.test(q);
  if(window.__ccWebKnowledge&&infoIntent){conversation.lastTopic=q;conversation.lastType='web';return window.__ccWebKnowledge.answer(q)}
  return'Te sigo. ¿Hablamos del control, del contrato o de la ejecución en campo?';
}
function mount(){
  css();if(document.getElementById('ccEngineerChat'))return;
  const launch=document.createElement('button');launch.id='ccEngineerChatLaunch';launch.className='cc-eng-chat-launch';launch.title='Hablar con Halu';launch.setAttribute('aria-label','Hablar con Halu');launch.innerHTML='<img src="engineer-assistant-avatar.png" alt="Halu, ingeniero civil de apoyo"><span class="dot"></span>';
  const box=document.createElement('section');box.id='ccEngineerChat';box.className='cc-eng-chat';box.setAttribute('aria-label','Chat con Halu');box.innerHTML=`<header class="cc-eng-chat-head"><img src="engineer-assistant-avatar.png" alt=""><div><b>Halu · Ingeniero Civil</b><small>Obra, contratos y control de proyectos</small></div><button class="cc-eng-chat-close" aria-label="Cerrar">×</button></header><div class="cc-eng-chat-body"><div class="cc-eng-msg bot">Qué tal. Soy Halu. Aquí hablamos directo: obra, contratos, estimaciones y los problemas que en el plano no aparecen. ¿Cómo va todo?</div><div class="cc-eng-quick"><button data-q="¿Dónde estoy?">¿Dónde estoy?</button><button data-q="¿Qué regula la garantía de cumplimiento?">Consulta legal</button><button data-q="Abre proyectos">Proyectos</button><button data-q="Ayuda">Ayuda</button></div></div><form class="cc-eng-chat-form"><input autocomplete="off" maxlength="500" placeholder="Cuéntame qué está pasando…" aria-label="Mensaje"><button>Enviar</button></form>`;
  document.body.append(launch,box);
  const body=box.querySelector('.cc-eng-chat-body'),input=box.querySelector('input');
  const add=(kind,text,query='')=>{const wrap=document.createElement('div'),m=document.createElement('div');wrap.className=`cc-eng-msg-wrap ${kind}`;m.className=`cc-eng-msg ${kind}`;m.innerHTML=E(text);wrap.appendChild(m);if(kind==='bot'&&query&&window.__ccChatLearning){const rate=document.createElement('div');rate.className='cc-eng-rate';rate.innerHTML='<span>¿Te ayudó?</span><button type="button" data-rate="yes" aria-label="Respuesta útil">👍</button><button type="button" data-rate="no" aria-label="Corregir respuesta">👎</button>';rate.onclick=event=>{const vote=event.target.closest('[data-rate]');if(!vote)return;let correction='';if(vote.dataset.rate==='no')correction=prompt('¿Cómo debería responder la próxima vez? No incluyas contraseñas ni datos personales.','')||'';const result=window.__ccChatLearning.record(query,text,vote.dataset.rate==='yes',correction);rate.innerHTML=result.learned?'<span>Gracias. Aprendí la corrección.</span>':result.legalProtected?'<span>Gracias. Registré tu valoración; la ley no será reemplazada.</span>':'<span>Gracias por ayudarme a mejorar.</span>'};wrap.appendChild(rate)}body.appendChild(wrap);body.scrollTop=body.scrollHeight};
  const ask=text=>{const q=String(text||'').trim();if(!q)return;add('user',q);const typing=document.createElement('div');typing.className='cc-eng-msg bot';typing.textContent='Estoy revisando…';body.appendChild(typing);body.scrollTop=body.scrollHeight;setTimeout(()=>Promise.resolve(answer(q)).then(reply=>{typing.remove();add('bot',reply,q)}).catch(()=>{typing.remove();add('bot','No pude completar la consulta. Intenta nuevamente.',q)}),140)};
  launch.onclick=()=>{box.classList.toggle('open');if(box.classList.contains('open')){setTimeout(()=>input.focus(),0)}};
  box.querySelector('.cc-eng-chat-close').onclick=()=>box.classList.remove('open');
  box.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>ask(b.dataset.q));
  box.querySelector('form').onsubmit=e=>{e.preventDefault();const q=input.value;input.value='';ask(q)};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
window.__ccEngineerChat={answer,navigateTab,navigateScreen,contextText,conversation};
})();
