/* ===== HALU · REFERENCIA TECNICA DEL MANUAL DE INGENIERIA V1 ===== */
(()=>{
'use strict';
if(window.__CC_ENGINEERING_MANUAL_REFERENCE_V1__)return;
window.__CC_ENGINEERING_MANUAL_REFERENCE_V1__=true;

const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const H=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const MANUAL={
  title:'Manual técnico de ingeniería y construcción',
  pages:150,
  source:'Manual.pdf',
  jurisdictionNote:'Referencia técnica complementaria. Varias láminas citan RNE del Perú (E.020, E.030, E.050, E.060 y E.070) y ACI 318. Para proyectos en Honduras deben prevalecer contrato, planos, especificaciones, normativa y criterios aprobados aplicables al proyecto. La lámina de contratación pública de la pág. 109 corresponde a la Ley N.º 32069 de Perú y no debe tratarse como norma hondureña.',
  topics:[
    {id:'programacion',title:'Rendimientos y producción de maquinaria',pages:'3–11',keys:'rendimiento maquinaria tractor oruga bulldozer cargador frontal motoniveladora rodillo compactador volquete excavadora retroexcavadora pavimentadora finisher tandem acarreo terraceria compactacion',summary:'Relaciona producción con capacidad o área efectiva, eficiencia y tiempo de ciclo. Para control de obra conviene registrar tipo de material, distancia de acarreo, pendiente, humedad, operador, estado del equipo, número de pasadas y tiempos de carga/transporte/descarga/retorno.'},
    {id:'concreto',title:'Concreto: materiales, colocación y durabilidad',pages:'49, 52–54, 73–77',keys:'concreto cemento agregado arena grava agua mezcla dosificacion revenimiento slump trabajabilidad segregacion vibrado curado resistencia durabilidad retraccion fluencia',summary:'Controlar relación agua/cemento, calidad de materiales, dosificación, mezclado, transporte, colocación, compactación/vibrado, curado, edad y condiciones ambientales. El manual remarca que la durabilidad depende del control integral y no solo de la resistencia.'},
    {id:'acero',title:'Acero, recubrimiento, traslapes y confinamiento',pages:'50–51, 78–79, 87',keys:'acero refuerzo varilla estribo confinamiento traslape anclaje recubrimiento columna viga armado',summary:'Verificar diámetro y grado del acero, separación y cierre de estribos, recubrimiento, anclajes y traslapes, limpieza y posición antes del vaciado. El confinamiento mejora ductilidad y comportamiento del elemento.'},
    {id:'calidad',title:'Control de calidad y fallas frecuentes',pages:'33, 87–88, 110–114',keys:'falla grieta fisura defecto error calidad columna losa vaciado deflexion ancho grieta',summary:'Las láminas identifican como riesgos recurrentes el acero insuficiente, estribos mal espaciados, recubrimiento inadecuado, concreto mal dosificado, falta de vibrado, traslapes insuficientes, vaciado sin planificación, altura de caída excesiva y falta de control del acero y encofrado.'},
    {id:'estructuras',title:'Diseño y predimensionamiento estructural',pages:'1–2, 14–18, 20–30, 46–57, 80–108',keys:'diseno estructural estado limite carga viva carga muerta sismo flexion viga columna losa zapata cimentacion cuantia rigidez curvatura',summary:'Presenta diseño por estados límite, combinaciones de carga, factores de reducción, comportamiento dúctil/frágil y predimensionamiento de vigas, columnas, losas, zapatas y secciones especiales. Debe usarse como apoyo preliminar y verificarse con análisis estructural y normativa aplicable.'},
    {id:'cimentaciones',title:'Cimentaciones y capacidad del suelo',pages:'14–15, 23, 90–94',keys:'zapata cimentacion suelo capacidad portante asentamiento losa cimentacion fundacion',summary:'Revisar cargas, capacidad portante admisible, presión de contacto, asentamientos, punzonamiento, flexión, corte y distribución del acero. El predimensionamiento no sustituye el diseño geotécnico/estructural.'},
    {id:'mamposteria',title:'Albañilería y muros portantes',pages:'33–34, 61–69',keys:'muro mamposteria albanileria ladrillo bloque solera confinamiento muro portante',summary:'Incluye fallas típicas, espesor mínimo, esfuerzo axial, aplastamiento, densidad mínima de muros, metrado de cargas y predimensionamiento de vigas soleras y columnas de confinamiento. Las referencias RNE mostradas son peruanas.'},
    {id:'escaleras',title:'Escaleras, rampas y pendientes',pages:'26, 39–45, 59, 99–105',keys:'escalera rampa pendiente contrahuella huella descanso helicoidal caracol tuberia',summary:'Controlar geometría, relación huella–contrahuella, número de pasos, longitud, descansos, pendiente y seguridad de uso. Para rampas y tuberías el manual usa pendiente como relación entre desnivel y desarrollo horizontal.'},
    {id:'topografia',title:'Topografía, replanteo y control geométrico',pages:'19, 31, 43, 115, 117–150',keys:'topografia nivel estacion total teodolito prisma mira jalon wincha cinta coordenada replanteo pendiente desnivel area volumen corte relleno precision tolerancia',summary:'Abarca levantamientos planimétricos, altimétricos y planialtimétricos; escalas, precisión, tolerancias, errores, pendientes, áreas, volúmenes, coordenadas, nivelación y replanteo. Recomienda calibrar equipos, registrar datos y verificar mediciones antes de retirarse del campo.'},
    {id:'materiales',title:'Metrados y cantidades de materiales',pages:'32, 34, 36, 58, 70–72',keys:'metrado cantidad material cemento arena grava ladrillo revoque repello tarrajeo columna concreto volumen',summary:'Incluye ejemplos de cantidades de agregados, ladrillos, mortero/revoque, cemento para piso y volumen de concreto en columnas. Los rendimientos y desperdicios deben ajustarse a especificaciones, proveedor, dosificación y condiciones reales de obra.'},
    {id:'saneamiento',title:'Buzones y alcantarillado',pages:'12',keys:'buzon alcantarillado sanitario tuberia inspeccion camara',summary:'Presenta criterios de diámetro, acceso, ubicación y verificación de cámaras de inspección. La lámina se basa en RNE OS.070, por lo que sus valores deben contrastarse con la normativa y especificaciones aplicables al proyecto.'},
    {id:'legal-peru',title:'Contratación pública — referencia peruana',pages:'109',keys:'ley 32069 contratacion publica peru',summary:'La página 109 resume la Ley General de Contrataciones Públicas N.º 32069 del Perú. En el sistema queda marcada solo como referencia comparativa y no como base legal para Honduras.'}
  ]
};

function matches(text){
  const q=norm(text);
  const found=MANUAL.topics.map(t=>{const words=t.keys.split(/\s+/);const score=words.reduce((n,w)=>n+(w&&q.includes(w)?1:0),0);return{...t,score}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
  return found.length?found:[];
}
function lookup(text,limit=4){return matches(text).slice(0,limit)}
function manualContext(text){
  const topics=lookup(text,4);
  if(!topics.length)return'';
  return [
    'REFERENCIA INTERNA: Manual técnico de ingeniería y construcción (150 páginas).',
    'Regla de uso: utilizarlo como apoyo técnico y de supervisión; no inventar datos faltantes; pedir dimensiones, unidades, resistencia, equipo o condiciones cuando sean necesarios para calcular. Priorizar contrato, planos, especificaciones y normativa aplicable al proyecto.',
    ...topics.map(t=>`${t.title} (págs. ${t.pages}): ${t.summary}`),
    MANUAL.jurisdictionNote
  ].join('\n');
}
function answer(text){
  const topics=lookup(text,4);
  if(!topics.length)return'';
  const head=topics.length===1?`Esto conecta directamente con ${topics[0].title.toLowerCase()}.`:`El manual relaciona tu consulta con ${topics.map(t=>t.title.toLowerCase()).join(', ')}.`;
  const lines=topics.map(t=>`• ${t.title} · págs. ${t.pages}: ${t.summary}`);
  return `${head}\n${lines.join('\n')}\n\nCriterio de uso: ${MANUAL.jurisdictionNote}`;
}
window.__ccEngineeringManual={...MANUAL,lookup,context:manualContext,answer};

(function patchFetch(){
  if(window.__CC_MANUAL_FETCH_PATCH__||typeof window.fetch!=='function')return;
  window.__CC_MANUAL_FETCH_PATCH__=true;
  const base=window.fetch.bind(window);
  window.fetch=function(input,init){
    try{
      const url=typeof input==='string'?input:String(input?.url||'');
      if(/\/functions\/v1\/halu-chat(?:\?|$)/.test(url)&&init&&typeof init.body==='string'){
        const data=JSON.parse(init.body),ctx=manualContext(data?.message||'');
        if(ctx){data.context=`${String(data.context||'').slice(0,2200)}\n\n${ctx}`.slice(0,6500);init={...init,body:JSON.stringify(data)}}
      }
    }catch{}
    return base(input,init);
  };
})();

(function patchWebKnowledge(){
  const tryPatch=()=>{
    const wk=window.__ccWebKnowledge;
    if(!wk||typeof wk.answer!=='function'||wk.answer.__ccManualPatched)return false;
    const base=wk.answer.bind(wk);
    const wrapped=function(q){
      const local=answer(q);
      if(local)return Promise.resolve(local);
      return base(q);
    };
    wrapped.__ccManualPatched=true;
    wk.answer=wrapped;
    return true;
  };
  if(!tryPatch()){let n=0;const t=setInterval(()=>{n++;if(tryPatch()||n>40)clearInterval(t)},250)}
})();

function activityText(pid){
  try{
    const s=window.__ccProgramacionControl?.state?.(pid);
    return Array.isArray(s?.activities)?s.activities.map(a=>`${a.name||''} ${a.equipment||''} ${a.materials||''} ${a.notes||''}`).join(' '):'';
  }catch{return''}
}
function panelHtml(pid){
  const detected=lookup(activityText(pid),5);
  const topics=detected.length?detected:[MANUAL.topics[0],MANUAL.topics[8],MANUAL.topics[1]];
  return `<section class="ccpc-panel cc-manual-panel" data-cc-manual-panel>
    <div class="ccpc-panel-head"><div><h3>Referencia técnica del Manual</h3><p>El seguimiento de obra ahora cruza actividades y recursos con criterios de rendimiento, control de calidad, materiales y topografía.</p></div><span class="ccpc-badge">150 págs.</span></div>
    <div class="cc-manual-grid">${topics.map(t=>`<article class="cc-manual-card"><b>${H(t.title)}</b><span>Págs. ${H(t.pages)}</span><p>${H(t.summary)}</p></article>`).join('')}</div>
    <div class="cc-manual-warning"><b>Uso normativo responsable.</b> ${H(MANUAL.jurisdictionNote)}</div>
  </section>`;
}
function injectCss(){
  if(document.getElementById('cc-engineering-manual-style'))return;
  const s=document.createElement('style');s.id='cc-engineering-manual-style';s.textContent=`
  .cc-manual-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.cc-manual-card{border:1px solid #243449;background:#0a111a;border-radius:11px;padding:10px;min-width:0}.cc-manual-card b{display:block;font-size:11px;color:#eef4fb}.cc-manual-card span{display:inline-block;margin:5px 0 3px;font-size:9px;font-weight:800;color:#9fc1ff}.cc-manual-card p{margin:0!important;font-size:10px!important;color:#8298b1!important;line-height:1.45}.cc-manual-warning{margin-top:9px;border:1px solid #5a4c1f;background:#251f0b;color:#fde68a;border-radius:10px;padding:9px 10px;font-size:10px;line-height:1.45}.cc-manual-warning b{color:#fff3b0}@media(max-width:900px){.cc-manual-grid{grid-template-columns:1fr 1fr}}@media(max-width:560px){.cc-manual-grid{grid-template-columns:1fr}}
  `;document.head.appendChild(s);
}
function injectPanel(){
  injectCss();
  document.querySelectorAll('[data-ccpc-root]').forEach(root=>{
    if(root.querySelector('[data-cc-manual-panel]'))return;
    const pid=root.getAttribute('data-ccpc-root')||'';
    root.insertAdjacentHTML('beforeend',panelHtml(pid));
  });
}
let queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;injectPanel()})}
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('cc:data-changed',schedule);
setTimeout(schedule,180);
})();
