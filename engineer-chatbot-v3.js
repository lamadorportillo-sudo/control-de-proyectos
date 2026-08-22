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
const FIELD_DRAFT_KEY='cc_halu_field_visit_draft_v1';
let fieldVisit=(()=>{try{return JSON.parse(localStorage.getItem(FIELD_DRAFT_KEY)||'null')}catch{return null}})();
function fieldNorm(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function projectForField(text=''){
  try{
    if(view?.screen==='project'&&view?.projectId)return A(db?.projects).find(p=>p.id===view.projectId&&!p.deletedAt)||null;
    const q=fieldNorm(text);return A(db?.projects).filter(p=>!p.deletedAt).find(p=>{const name=fieldNorm(p.name),code=fieldNorm(p.code),location=fieldNorm(p.location);return(code&&q.includes(code))||(name.length>8&&q.includes(name))||(location.length>8&&q.includes(location))})||null;
  }catch{return null}
}
function saveFieldDraft(){try{fieldVisit?localStorage.setItem(FIELD_DRAFT_KEY,JSON.stringify(fieldVisit)):localStorage.removeItem(FIELD_DRAFT_KEY)}catch{}}
function fieldProject(){try{return A(db?.projects).find(p=>p.id===fieldVisit?.projectId)||null}catch{return null}}
function beginFieldVisit(text){
  const p=projectForField(text);if(!p){conversation.lastType='field';return'Listo, activamos la bitácora. Dime el nombre o código del proyecto para vincular la visita.'}
  const old=fieldVisit&&fieldVisit.projectId===p.id?fieldVisit:null;
  fieldVisit=old||{projectId:p.id,startedAt:new Date().toISOString(),date:new Date().toISOString().slice(0,10),type:'Supervisión',notes:[],photos:[],physical:0,personnel:0,weather:'',objective:'Seguimiento técnico de campo'};saveFieldDraft();conversation.lastType='field';
  return old?`Retomamos la visita de ${p.name}; tengo ${old.notes.length} nota${old.notes.length===1?'':'s'} guardada${old.notes.length===1?'':'s'}. ¿Qué observaste ahora?`:`Ya quedó abierta la visita de ${p.name}. Cuéntame lo que vas viendo; yo lo voy ordenando.`;
}
function categoryFor(text){const q=fieldNorm(text);if(/seguridad|casco|chaleco|senalizacion|accidente/.test(q))return'Seguridad';if(/calidad|fisura|grieta|concreto|compactacion|acabado|material/.test(q))return'Calidad';if(/atraso|plazo|programa|rendimiento/.test(q))return'Plazo';if(/documento|bitacora|plano|estimacion/.test(q))return'Documental';if(/ambient|escombro|desecho|agua|polvo/.test(q))return'Ambiental';return'Técnica'}
function addFieldNote(text){
  const q=String(text||'').trim(),norm=fieldNorm(q);if(!fieldVisit)return'';
  const pct=norm.match(/(?:avance(?: fisico)?(?: de)?|ejecutado)\s*(?:del?\s*)?(\d{1,3}(?:[.,]\d+)?)\s*(?:por ciento|%)/);if(pct)fieldVisit.physical=Math.max(0,Math.min(100,Number(pct[1].replace(',','.'))||0));
  const people=norm.match(/(\d+)\s*(?:personas|trabajadores|obreros|empleados)/);if(people)fieldVisit.personnel=Number(people[1])||0;
  const weather=norm.match(/(?:clima|tiempo|condiciones?)\s*(?:esta|estaba|de)?\s*(soleado|nublado|lluvioso|lluvia|seco|humedo)/);if(weather)fieldVisit.weather=weather[1].charAt(0).toUpperCase()+weather[1].slice(1);
  const category=categoryFor(q);fieldVisit.notes.push({text:q,category,createdAt:new Date().toISOString()});saveFieldDraft();return`Anotado en ${category.toLowerCase()}. Llevo ${fieldVisit.notes.length} observación${fieldVisit.notes.length===1?'':'es'}; sigue dictándome.`;
}
function fieldSummary(){const p=fieldProject();if(!fieldVisit||!p)return'No tengo una visita abierta. Dime “voy a registrar una visita” y arrancamos.';return`Visita de ${p.name}: ${fieldVisit.notes.length} observación${fieldVisit.notes.length===1?'':'es'}, avance ${Number(fieldVisit.physical||0).toFixed(2)}%, ${fieldVisit.personnel||0} personas y clima ${fieldVisit.weather||'pendiente'}. ¿La guardamos o seguimos?`}
function fieldPhotoCrossCheck(){const p=fieldProject();if(!p)return'Foto guardada. Dime qué elemento o frente aparece para revisarlo con criterio de campo.';let time=0;try{if(p.start&&p.end){const a=new Date(p.start+'T12:00:00'),b=new Date(p.end+'T12:00:00'),n=new Date(),total=b-a;if(total>0)time=Math.max(0,Math.min(100,100*(n-a)/total))}}catch{}const physical=Number(fieldVisit?.physical)||0;if(time&&physical&&time-physical>15)return`Foto guardada. Ojo: el plazo va cerca de ${time.toFixed(0)}% y el avance anotado en ${physical.toFixed(0)}%; hay una brecha que conviene verificar. ¿Qué frente muestra la imagen?`;return'Foto guardada y vinculada a la visita. Dime qué elemento o frente aparece; no voy a marcar una falla técnica sin evidencia suficiente.'}
function finishFieldVisit(){
  const p=fieldProject();if(!fieldVisit||!p)return'No hay una visita abierta para guardar.';
  try{
    db.visits=db.visits||[];const visits=db.visits.filter(v=>v.projectId===p.id),number=visits.length?Math.max(...visits.map(v=>Number(v.number)||0))+1:1,c=A(db.contracts).find(x=>x.projectId===p.id),now=new Date().toISOString();
    const observations=fieldVisit.notes.map((n,i)=>({id:typeof uid==='function'?uid():`${Date.now()}-${i}`,date:fieldVisit.date,category:n.category||'Técnica',priority:/urgente|critico|crítico|riesgo|peligro/i.test(n.text)?'Alta':'Normal',responsible:'',dueDate:'',status:'Pendiente',text:n.text,createdBy:typeof currentUser==='function'?(currentUser()?.name||''):'',createdAt:n.createdAt||now,updatedAt:now}));
    const visit={id:typeof uid==='function'?uid():String(Date.now()),projectId:p.id,contractId:c?.id||null,number,date:fieldVisit.date,type:fieldVisit.type||'Supervisión',status:observations.length?'Con observaciones':'Abierta',objective:fieldVisit.objective||'Seguimiento técnico de campo',physical:Number(fieldVisit.physical)||0,personnel:Number(fieldVisit.personnel)||0,weather:fieldVisit.weather||'',contractorRepresentative:'',supervisor:typeof currentUser==='function'?(currentUser()?.name||''):'',activities:fieldVisit.notes.filter(n=>/ejecut|trabaj|fund|coloc|instal|excav|compact|acarreo/i.test(n.text)).map(n=>n.text).join(' '),generalObservations:fieldVisit.notes.map(n=>n.text).join('\n'),instructions:'',commitments:'',nextVisit:'',observations,photos:A(fieldVisit.photos),createdAt:now,updatedAt:now};
    db.visits.push(visit);if(typeof audit==='function')audit('CREAR','Visita',visit.id,{projectId:p.id,number,source:'Halu campo'});if(typeof saveDB==='function')saveDB();fieldVisit=null;saveFieldDraft();conversation.lastType='work';try{view.projectId=p.id;view.screen='project';view.tab='visits';renderApp()}catch{}
    return`Visita N.º ${number} guardada en ${p.name}, con ${observations.length} observación${observations.length===1?'':'es'}. Ya quedó en la pestaña Visitas.`;
  }catch{return'No pude guardar la visita todavía; el borrador sigue intacto. Inténtalo nuevamente.'}
}
function handleFieldVisit(q,spoken){
  const activate=/\b(voy a registrar una visita|registrar visita|iniciar visita|nueva visita|abrir bitacora|modo campo)\b/.test(spoken);if(activate)return beginFieldVisit(q);
  if(!fieldVisit&&conversation.lastType==='field'){const p=projectForField(q);if(p)return beginFieldVisit(q)}if(!fieldVisit)return'';
  if(/^(cancelar|descartar|cancelar visita|descartar visita)$/.test(spoken)){fieldVisit=null;saveFieldDraft();conversation.lastType='work';return'Visita descartada; no se agregó nada al expediente.'}
  if(/\b(cerrar visita|terminar visita|guardar visita|cerrar bitacora|finalizar bitacora)\b/.test(spoken))return finishFieldVisit();if(/\b(resumen|que llevamos|leer bitacora|mostrar bitacora)\b/.test(spoken))return fieldSummary();return addFieldNote(q);
}
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
  .cc-eng-chat-launch{position:fixed;right:18px;bottom:12px;z-index:120;width:132px;height:270px;border:0;border-radius:0;padding:0;overflow:visible;background:transparent;box-shadow:none;filter:drop-shadow(0 12px 10px rgba(0,0,0,.32));cursor:pointer}.cc-eng-avatar-frame{position:relative;display:block;flex:0 0 auto;overflow:visible;border-radius:0;background:transparent}.cc-eng-chat-launch .cc-eng-avatar-frame{width:100%;height:100%}.cc-eng-avatar-frame img{position:absolute;width:100%;height:100%;max-width:none;left:0;top:0;object-fit:contain;object-position:center bottom}.cc-eng-chat-launch .dot{position:absolute;right:20px;bottom:8px;width:13px;height:13px;border:2px solid #07111d;border-radius:50%;background:#22c55e}
  .cc-eng-chat{position:fixed;right:164px;bottom:20px;z-index:121;width:min(390px,calc(100vw - 24px));height:min(610px,calc(100vh - 40px));display:none;grid-template-rows:auto 1fr auto;border:1px solid #29405a;border-radius:18px;overflow:hidden;background:#08111b;box-shadow:0 22px 70px rgba(0,0,0,.58);color:#eaf3fc}.cc-eng-chat.open{display:grid}.cc-eng-chat-head{display:flex;align-items:center;gap:10px;padding:10px 13px;border-bottom:1px solid #213247;background:linear-gradient(135deg,#10243b,#09131f)}.cc-eng-chat-head .cc-eng-avatar-frame{width:48px;height:70px;border:0}.cc-eng-chat-head>div{min-width:0;flex:1}.cc-eng-chat-head b,.cc-eng-chat-head small{display:block}.cc-eng-chat-head small{color:#83a0bb;font-size:9px;margin-top:2px}.cc-eng-chat-close{border:0;background:transparent;color:#9fb5ca;font-size:20px;cursor:pointer}
  .cc-eng-chat-body{overflow:auto;padding:13px;display:flex;flex-direction:column;gap:9px}.cc-eng-msg{max-width:86%;padding:9px 11px;border-radius:13px;font-size:11px;line-height:1.45;white-space:pre-wrap}.cc-eng-msg.bot{align-self:flex-start;background:#112238;border:1px solid #244667}.cc-eng-msg.user{align-self:flex-end;background:#174b7a;border:1px solid #246da9}.cc-eng-quick{display:flex;flex-wrap:wrap;gap:6px}.cc-eng-quick button{border:1px solid #294866;border-radius:999px;background:#0c1a29;color:#b8d5ee;padding:7px 9px;font-size:9px;cursor:pointer}.cc-eng-quick button:hover{border-color:#38bdf8;color:#fff}.cc-eng-msg-wrap{display:flex;flex-direction:column}.cc-eng-msg-wrap.bot{align-items:flex-start}.cc-eng-msg-wrap.user{align-items:flex-end}.cc-eng-msg-wrap .cc-eng-msg{align-self:inherit}.cc-eng-rate{display:flex;align-items:center;gap:5px;margin:4px 0 1px 5px;color:#7892aa;font-size:9px}.cc-eng-rate button{border:1px solid #29405a;border-radius:8px;background:#0a1623;color:#bcd0e2;padding:3px 6px;cursor:pointer}.cc-eng-rate button:hover{border-color:#38bdf8}
  .cc-eng-chat-form{display:grid;grid-template-columns:auto auto 1fr auto;gap:7px;padding:10px;border-top:1px solid #213247;background:#09131f}.cc-eng-chat-form input[type="text"]{min-width:0;border:1px solid #29405a;border-radius:11px;background:#060d15;color:#eef6ff;padding:10px 11px;font-size:11px}.cc-eng-chat-form button{border:0;border-radius:11px;background:#2563eb;color:#fff;padding:0 14px;font-weight:850;cursor:pointer}.cc-eng-chat-form .tool{padding:0 10px;background:#17324c;font-size:16px}.cc-eng-chat-form input[type="file"]{display:none}
  @media(max-width:520px){.cc-eng-chat-launch{right:6px;bottom:8px;width:92px;height:188px}.cc-eng-chat-launch .dot{right:12px;bottom:5px}.cc-eng-chat{right:12px;bottom:12px;height:calc(100vh - 24px)}}
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
  const visual=window.__ccHaluAvatar?.command?.(q)||'';if(visual){rememberTurn('assistant',visual);return visual}
  const field=handleFieldVisit(q,spoken);if(field){rememberTurn('assistant',field);return field}
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
function compactPhoto(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=reject;reader.onload=()=>{const img=new Image();img.onerror=reject;img.onload=()=>{const max=1280,scale=Math.min(1,max/Math.max(img.width,img.height)),canvas=document.createElement('canvas');canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',.78))};img.src=reader.result};reader.readAsDataURL(file)})}
function mount(){
  css();if(document.getElementById('ccEngineerChat'))return;
  const launch=document.createElement('button');launch.id='ccEngineerChatLaunch';launch.className='cc-eng-chat-launch';launch.title='Hablar con Halu';launch.setAttribute('aria-label','Hablar con Halu');launch.innerHTML='<span class="cc-eng-avatar-frame"><img src="halu-engineer-cutout-v4.png" alt="Halu, ingeniero civil de apoyo"></span><span class="dot"></span>';
  const box=document.createElement('section');box.id='ccEngineerChat';box.className='cc-eng-chat';box.setAttribute('aria-label','Chat con Halu');box.innerHTML=`<header class="cc-eng-chat-head"><span class="cc-eng-avatar-frame"><img src="halu-engineer-cutout-v4.png" alt="Halu, ingeniero civil"></span><div><b>Halu · Ingeniero Civil</b><small>Obra, contratos y control de proyectos</small></div><button class="cc-eng-chat-close" aria-label="Cerrar">×</button></header><div class="cc-eng-chat-body"><div class="cc-eng-msg bot">Qué tal. Soy Halu. Aquí hablamos directo: obra, contratos, estimaciones y los problemas que en el plano no aparecen. ¿Cómo va todo?</div><div class="cc-eng-quick"><button data-q="Camina por la pantalla">Caminar</button><button data-q="Voy a registrar una visita">Registrar visita</button><button data-q="¿Dónde estoy?">¿Dónde estoy?</button><button data-q="¿Qué regula la garantía de cumplimiento?">Consulta legal</button><button data-q="Abre proyectos">Proyectos</button></div></div><form class="cc-eng-chat-form"><button type="button" class="tool" data-photo title="Agregar foto">📷</button><button type="button" class="tool" data-mic title="Dictar nota">🎙️</button><input type="file" accept="image/*" capture="environment" data-photo-input><input type="text" autocomplete="off" maxlength="500" placeholder="Cuéntame qué está pasando…" aria-label="Mensaje"><button>Enviar</button></form>`;
  document.body.append(launch,box);
  const body=box.querySelector('.cc-eng-chat-body'),input=box.querySelector('input[type="text"]'),photoInput=box.querySelector('[data-photo-input]');
  const add=(kind,text,query='')=>{const wrap=document.createElement('div'),m=document.createElement('div');wrap.className=`cc-eng-msg-wrap ${kind}`;m.className=`cc-eng-msg ${kind}`;m.innerHTML=E(text);wrap.appendChild(m);if(kind==='bot'&&query&&window.__ccChatLearning){const rate=document.createElement('div');rate.className='cc-eng-rate';rate.innerHTML='<span>¿Te ayudó?</span><button type="button" data-rate="yes" aria-label="Respuesta útil">👍</button><button type="button" data-rate="no" aria-label="Corregir respuesta">👎</button>';rate.onclick=event=>{const vote=event.target.closest('[data-rate]');if(!vote)return;let correction='';if(vote.dataset.rate==='no')correction=prompt('¿Cómo debería responder la próxima vez? No incluyas contraseñas ni datos personales.','')||'';const result=window.__ccChatLearning.record(query,text,vote.dataset.rate==='yes',correction);rate.innerHTML=result.learned?'<span>Gracias. Aprendí la corrección.</span>':result.legalProtected?'<span>Gracias. Registré tu valoración; la ley no será reemplazada.</span>':'<span>Gracias por ayudarme a mejorar.</span>'};wrap.appendChild(rate)}body.appendChild(wrap);body.scrollTop=body.scrollHeight};
  const ask=text=>{const q=String(text||'').trim();if(!q)return;add('user',q);const typing=document.createElement('div');typing.className='cc-eng-msg bot';typing.textContent='Estoy revisando…';body.appendChild(typing);body.scrollTop=body.scrollHeight;setTimeout(()=>Promise.resolve(answer(q)).then(reply=>{typing.remove();add('bot',reply,q)}).catch(()=>{typing.remove();add('bot','No pude completar la consulta. Intenta nuevamente.',q)}),140)};
  box.querySelector('[data-photo]').onclick=()=>{if(!fieldVisit)return add('bot','Primero abre una visita y luego vamos agregando las fotos.');photoInput.click()};
  photoInput.onchange=async()=>{const files=[...photoInput.files];for(const file of files){try{const src=await compactPhoto(file);fieldVisit.photos=fieldVisit.photos||[];fieldVisit.photos.push({src,name:file.name,caption:`Evidencia de campo ${fieldVisit.photos.length+1}`,createdAt:new Date().toISOString()});saveFieldDraft();add('bot',fieldPhotoCrossCheck())}catch{add('bot','No pude leer esa foto; prueba con otra imagen.')}}photoInput.value=''};
  box.querySelector('[data-mic]').onclick=()=>{const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SpeechRecognition)return add('bot','El dictado no está disponible en este navegador; puedes usar el micrófono del teclado.');const recognition=new SpeechRecognition();recognition.lang='es-HN';recognition.interimResults=false;recognition.onstart=()=>add('bot','Te escucho; dicta la observación.');recognition.onresult=e=>{input.value=e.results[0][0].transcript;input.focus()};recognition.onerror=()=>add('bot','No pude tomar el dictado; inténtalo de nuevo o escríbelo.');recognition.start()};
  launch.onclick=()=>{box.classList.toggle('open');if(box.classList.contains('open')){setTimeout(()=>{window.__ccHaluAvatar?.repositionChat?.();input.focus()},0)}};
  box.querySelector('.cc-eng-chat-close').onclick=()=>box.classList.remove('open');
  box.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>ask(b.dataset.q));
  box.querySelector('form').onsubmit=e=>{e.preventDefault();const q=input.value;input.value='';ask(q)};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
window.__ccEngineerChat={answer,navigateTab,navigateScreen,contextText,conversation};
})();
