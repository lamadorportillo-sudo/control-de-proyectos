/* ===== ASISTENTE INGENIERO V1 ===== */
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

function css(){
  if(document.getElementById('ccEngineerChatStyle'))return;
  const s=document.createElement('style');s.id='ccEngineerChatStyle';s.textContent=`
  .cc-eng-chat-launch{position:fixed;right:20px;bottom:20px;z-index:120;width:62px;height:62px;border:2px solid #38bdf8;border-radius:50%;padding:0;overflow:hidden;background:#07111d;box-shadow:0 14px 38px rgba(0,0,0,.45),0 0 0 5px rgba(56,189,248,.10);cursor:pointer}.cc-eng-chat-launch img{width:100%;height:100%;object-fit:cover}.cc-eng-chat-launch .dot{position:absolute;right:2px;bottom:3px;width:13px;height:13px;border:2px solid #07111d;border-radius:50%;background:#22c55e}
  .cc-eng-chat{position:fixed;right:20px;bottom:94px;z-index:121;width:min(390px,calc(100vw - 24px));height:min(610px,calc(100vh - 120px));display:none;grid-template-rows:auto 1fr auto;border:1px solid #29405a;border-radius:18px;overflow:hidden;background:#08111b;box-shadow:0 22px 70px rgba(0,0,0,.58);color:#eaf3fc}.cc-eng-chat.open{display:grid}.cc-eng-chat-head{display:flex;align-items:center;gap:10px;padding:12px 13px;border-bottom:1px solid #213247;background:linear-gradient(135deg,#10243b,#09131f)}.cc-eng-chat-head img{width:43px;height:43px;border-radius:50%;object-fit:cover;border:1px solid #38bdf8}.cc-eng-chat-head div{min-width:0;flex:1}.cc-eng-chat-head b,.cc-eng-chat-head small{display:block}.cc-eng-chat-head small{color:#83a0bb;font-size:9px;margin-top:2px}.cc-eng-chat-close{border:0;background:transparent;color:#9fb5ca;font-size:20px;cursor:pointer}
  .cc-eng-chat-body{overflow:auto;padding:13px;display:flex;flex-direction:column;gap:9px}.cc-eng-msg{max-width:86%;padding:9px 11px;border-radius:13px;font-size:11px;line-height:1.45;white-space:pre-wrap}.cc-eng-msg.bot{align-self:flex-start;background:#112238;border:1px solid #244667}.cc-eng-msg.user{align-self:flex-end;background:#174b7a;border:1px solid #246da9}.cc-eng-quick{display:flex;flex-wrap:wrap;gap:6px}.cc-eng-quick button{border:1px solid #294866;border-radius:999px;background:#0c1a29;color:#b8d5ee;padding:7px 9px;font-size:9px;cursor:pointer}.cc-eng-quick button:hover{border-color:#38bdf8;color:#fff}
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
  if(!q)return'Escribe una consulta legal o dime qué pestaña deseas abrir.';
  if(/d[oó]nde estoy|ubicaci[oó]n actual|pantalla actual/i.test(q))return contextText();
  if(/qu[eé] puedes hacer|ayuda|opciones/i.test(q))return'Puedo buscar disposiciones en el Decreto 62-2026, la Ley de Contratación del Estado y su Reglamento; también puedo explicar el sistema y abrir sus módulos. Las respuestas legales incluyen documento, artículo y página del PDF.';
  const tab=tabWords.find(([rx])=>rx.test(q));
  if(tab&&/abre|abrir|ir|ll[eé]vame|mostrar|ve a/i.test(q))return navigateTab(tab[1])?`Abrí ${tabLabels[tab[1]]||tab[1]} en el expediente actual.`:`Para abrir ${tabLabels[tab[1]]||tab[1]}, primero entra a un expediente desde Proyectos.`;
  const screen=screenWords.find(([rx])=>rx.test(q));
  if(screen&&/abre|abrir|ir|ll[eé]vame|mostrar|ve a/i.test(q))return navigateScreen(screen[1])?`Abrí ${screen[1]==='home'?'Inicio':screen[1]}.`:'No pude cambiar de pantalla desde el estado actual. Usa el menú superior.';
  if(window.__ccLegalKnowledge&&(/\b(ley|legal|norma|decreto|reglamento|art[ií]culo|licitaci[oó]n|adjudicaci[oó]n|oferente|pliego|garant[ií]a|multa|sanci[oó]n|contratista|contrataci[oó]n|presupuesto|vigencia|plazo)\b/i.test(q)||/\?$/.test(q)))return window.__ccLegalKnowledge.answer(q);
  if(/relacion|sincron|actualiza/i.test(q))return'Los módulos comparten la misma información relacionada. Al guardar un cambio se actualizan las vistas del expediente y el Centro de Control invalida su caché para consultar la versión más reciente.';
  if(/pestaña|m[oó]dulo|proceso/i.test(q))return'Resumen concentra el estado; Contrato y Modificaciones definen el monto vigente; Pagos/Estimaciones alimentan el avance financiero; Visitas alimentan el avance físico; Garantías generan alertas; Informes reúnen esos resultados.';
  return'Puedo ayudarte con la normativa cargada y con el funcionamiento del sistema. Prueba: “¿qué regula la garantía de cumplimiento?”, “artículo 5 de la Ley”, “abre pagos” o “¿cómo se relacionan los módulos?”.';
}
function mount(){
  css();if(document.getElementById('ccEngineerChat'))return;
  const launch=document.createElement('button');launch.id='ccEngineerChatLaunch';launch.className='cc-eng-chat-launch';launch.title='Abrir asistente ingeniero';launch.setAttribute('aria-label','Abrir asistente ingeniero');launch.innerHTML='<img src="engineer-assistant-avatar.png" alt="Asistente ingeniero"><span class="dot"></span>';
  const box=document.createElement('section');box.id='ccEngineerChat';box.className='cc-eng-chat';box.setAttribute('aria-label','Chatbot Asistente Ingeniero');box.innerHTML=`<header class="cc-eng-chat-head"><img src="engineer-assistant-avatar.png" alt=""><div><b>Ingeniero Asistente</b><small>Apoyo legal y operativo · sin modificar expedientes</small></div><button class="cc-eng-chat-close" aria-label="Cerrar">×</button></header><div class="cc-eng-chat-body"><div class="cc-eng-msg bot">Hola. Puedo orientarte en el sistema y consultar las tres normas cargadas, citando documento, artículo y página.</div><div class="cc-eng-quick"><button data-q="¿Dónde estoy?">¿Dónde estoy?</button><button data-q="¿Qué regula la garantía de cumplimiento?">Consulta legal</button><button data-q="Abre proyectos">Proyectos</button><button data-q="Ayuda">Ayuda</button></div></div><form class="cc-eng-chat-form"><input autocomplete="off" maxlength="500" placeholder="Pregunta por una norma o módulo…" aria-label="Mensaje"><button>Enviar</button></form>`;
  document.body.append(launch,box);
  const body=box.querySelector('.cc-eng-chat-body'),input=box.querySelector('input');
  const add=(kind,text)=>{const m=document.createElement('div');m.className=`cc-eng-msg ${kind}`;m.innerHTML=E(text);body.appendChild(m);body.scrollTop=body.scrollHeight};
  const ask=text=>{const q=String(text||'').trim();if(!q)return;add('user',q);setTimeout(()=>add('bot',answer(q)),140)};
  launch.onclick=()=>{box.classList.toggle('open');if(box.classList.contains('open')){setTimeout(()=>input.focus(),0)}};
  box.querySelector('.cc-eng-chat-close').onclick=()=>box.classList.remove('open');
  box.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>ask(b.dataset.q));
  box.querySelector('form').onsubmit=e=>{e.preventDefault();const q=input.value;input.value='';ask(q)};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
window.__ccEngineerChat={answer,navigateTab,navigateScreen,contextText};
})();
