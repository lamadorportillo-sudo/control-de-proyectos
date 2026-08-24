/* ===== HALU · REFERENCIA TECNICA DEL MANUAL DE INGENIERIA V2 ===== */
(()=>{
'use strict';
if(window.__CC_ENGINEERING_MANUAL_REFERENCE_V2__)return;
window.__CC_ENGINEERING_MANUAL_REFERENCE_V2__=true;

const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const H=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const MANUAL={
  title:'Manual técnico de ingeniería y construcción',
  pages:150,
  source:'Manual.pdf',
  sourceMode:'Documento visual de 150 páginas incorporado como referencia interna de Halu.',
  jurisdictionNote:'Referencia técnica complementaria. Varias láminas citan RNE del Perú (E.020, E.030, E.050, E.060, E.070 y OS.070) y ACI 318. Para proyectos en Honduras deben prevalecer contrato, planos, especificaciones, estudios, normativa hondureña y criterios aprobados aplicables al proyecto. La pág. 109 resume la Ley N.º 32069 de Perú y queda únicamente como referencia comparativa, no como base legal hondureña.',
  topics:[
    {id:'programacion',title:'Rendimientos y producción de maquinaria',pages:'3–11',keys:'rendimiento maquinaria tractor oruga bulldozer cargador frontal motoniveladora rodillo compactador volquete excavadora retroexcavadora pavimentadora finisher tandem acarreo terraceria compactacion produccion ciclo',summary:'Relaciona producción con capacidad o área efectiva, eficiencia y tiempo de ciclo. Para control de obra conviene registrar tipo de material, distancia de acarreo, pendiente, humedad, operador, estado del equipo, número de pasadas y tiempos de carga, transporte, descarga y retorno.'},
    {id:'pavimentos',title:'Terracerías, compactación y pavimentación',pages:'3–11',keys:'terraceria corte relleno compactacion humedad densidad rodillo tandem pavimento asfalto finisher motoniveladora subrasante base acarreo',summary:'El rendimiento real depende de ancho efectivo, velocidad, número de pasadas, eficiencia, material, humedad, pendientes y coordinación de equipos. En compactación y pavimentación deben controlarse secuencia, uniformidad, pasadas, nivelación y condiciones del material.'},
    {id:'concreto',title:'Concreto: materiales, colocación y durabilidad',pages:'49, 52–54, 73–77',keys:'concreto cemento agregado arena grava agua mezcla dosificacion revenimiento slump trabajabilidad segregacion vibrado curado resistencia durabilidad retraccion fluencia temperatura',summary:'Controlar relación agua/cemento, calidad de materiales, dosificación, mezclado, transporte, colocación, compactación o vibrado, curado, edad y condiciones ambientales. La durabilidad depende del control integral y no solo de la resistencia.'},
    {id:'acero',title:'Acero, recubrimiento, traslapes y confinamiento',pages:'20, 44, 50–51, 78–79, 87',keys:'acero refuerzo varilla estribo confinamiento traslape anclaje recubrimiento columna viga armado gancho',summary:'Verificar diámetro y grado del acero, separación y cierre de estribos, recubrimiento, anclajes y traslapes, limpieza y posición antes del vaciado. El confinamiento mejora ductilidad y comportamiento del elemento.'},
    {id:'calidad',title:'Control de calidad y fallas frecuentes',pages:'33, 52–54, 87–88, 110–116',keys:'falla grieta fisura defecto error calidad columna losa vaciado deflexion ancho grieta curado segregacion vibrado',summary:'Riesgos recurrentes: acero insuficiente, estribos mal espaciados, recubrimiento inadecuado, concreto mal dosificado, falta de vibrado, traslapes insuficientes, vaciado sin planificación, altura de caída excesiva, falta de control del encofrado y curado deficiente.'},
    {id:'estructuras',title:'Diseño y predimensionamiento estructural',pages:'1–2, 13–30, 46–57, 80–108',keys:'diseno estructural estado limite carga viva carga muerta sismo flexion viga columna losa zapata cimentacion cuantia rigidez curvatura momento corte',summary:'Presenta diseño por estados límite, combinaciones de carga, factores de reducción, comportamiento dúctil y frágil, y predimensionamiento de vigas, columnas, losas, zapatas y secciones especiales. Debe usarse como apoyo preliminar y verificarse con análisis estructural y normativa aplicable.'},
    {id:'cimentaciones',title:'Cimentaciones y capacidad del suelo',pages:'14–15, 23, 90–94',keys:'zapata cimentacion suelo capacidad portante asentamiento losa cimentacion fundacion presion contacto punzonamiento balasto winkler',summary:'Revisar cargas, capacidad portante admisible, presión de contacto, asentamientos, punzonamiento, flexión, corte y distribución del acero. El predimensionamiento no sustituye el diseño geotécnico y estructural.'},
    {id:'mamposteria',title:'Albañilería y muros portantes',pages:'33–34, 61–69',keys:'muro mamposteria albanileria ladrillo bloque solera confinamiento muro portante aplastamiento densidad',summary:'Incluye fallas típicas, espesor mínimo, esfuerzo axial, aplastamiento, densidad mínima de muros, metrado de cargas y predimensionamiento de vigas soleras y columnas de confinamiento. Las referencias RNE mostradas son peruanas.'},
    {id:'escaleras',title:'Escaleras, rampas y pendientes',pages:'26, 39–45, 59, 99–105',keys:'escalera rampa pendiente contrahuella huella descanso helicoidal caracol tuberia longitud inclinacion',summary:'Controlar geometría, relación huella–contrahuella, número de pasos, longitud, descansos, pendiente y seguridad de uso. Para rampas y tuberías el manual expresa la pendiente a partir del desnivel y el desarrollo horizontal.'},
    {id:'topografia',title:'Topografía, replanteo y control geométrico',pages:'19, 31, 43, 115, 117–150',keys:'topografia nivel estacion total teodolito prisma mira jalon wincha cinta coordenada replanteo pendiente desnivel area volumen corte relleno precision tolerancia nivelacion azimut',summary:'Abarca levantamientos planimétricos, altimétricos y planialtimétricos; escalas, precisión, tolerancias, errores, pendientes, áreas, volúmenes, coordenadas, nivelación y replanteo. Recomienda calibrar equipos, registrar datos y verificar mediciones antes de retirarse del campo.'},
    {id:'materiales',title:'Metrados y cantidades de materiales',pages:'32, 34, 36, 58, 70–72',keys:'metrado cantidad material cemento arena grava ladrillo revoque repello tarrajeo columna concreto volumen desperdicio',summary:'Incluye ejemplos de cantidades de agregados, ladrillos, mortero o revoque, cemento para piso y volumen de concreto en columnas. Los rendimientos y desperdicios deben ajustarse a especificaciones, proveedor, dosificación y condiciones reales de obra.'},
    {id:'saneamiento',title:'Buzones y alcantarillado',pages:'12, 45',keys:'buzon alcantarillado sanitario tuberia inspeccion camara pendiente drenaje',summary:'Presenta criterios de cámaras de inspección y pendiente de tuberías. La lámina de buzones se basa en RNE OS.070, por lo que sus valores deben contrastarse con normativa y especificaciones aplicables al proyecto.'},
    {id:'legal-peru',title:'Contratación pública — referencia peruana',pages:'109',keys:'ley 32069 contratacion publica peru bienes servicios obras',summary:'La pág. 109 resume la Ley General de Contrataciones Públicas N.º 32069 del Perú. En el sistema queda marcada solo como referencia comparativa y nunca como fundamento legal para contratación pública hondureña.'}
  ],
  pageIndex:[
    {pages:'1–2',title:'Diseño en concreto armado y estados límite',keys:'estado limite concreto armado carga resistencia servicio',detail:'Conceptos de resistencia, servicio, factores de carga y reducción. Criterio general mostrado: resistencia de diseño mayor o igual al efecto de las cargas. Usar solo como marco conceptual y verificar norma vigente.'},
    {pages:'3–11',title:'Rendimiento de maquinaria',keys:'tractor cargador motoniveladora rodillo volquete retroexcavadora excavadora pavimentadora tandem rendimiento',detail:'Ciclos de trabajo y producción de equipos. Idea recurrente: producción = capacidad o área efectiva × eficiencia / tiempo de ciclo, con conversión de tiempo y ajustes por condiciones reales.'},
    {pages:'12',title:'Buzones de inspección',keys:'buzon alcantarillado camara inspeccion',detail:'Criterios geométricos y de acceso para cámaras de inspección. Referencia peruana OS.070: contrastar siempre con especificaciones y norma aplicable al proyecto.'},
    {pages:'13–18, 20–30',title:'Cargas, zapatas, columnas, losas y vigas',keys:'carga zapata columna losa viga estribo predimensionamiento',detail:'Metrado de cargas y guías de predimensionamiento estructural. Sirven para revisión preliminar, nunca para sustituir memoria de cálculo, geotecnia ni planos estructurales aprobados.'},
    {pages:'19, 31, 43, 45',title:'Pendientes y desniveles',keys:'pendiente desnivel nivel tuberia inclinacion',detail:'Relación básica: pendiente = desnivel / distancia horizontal; en porcentaje se multiplica por 100. El ángulo se obtiene a partir de la tangente. Verificar signos, unidades y referencias de nivel.'},
    {pages:'21',title:'Tanque elevado',keys:'tanque elevado estructura agua',detail:'Esquema de cargas, geometría, elementos principales y verificación estructural de un tanque elevado como ejemplo didáctico.'},
    {pages:'32, 34–38, 58, 70–72',title:'Cantidades, metrados y cargas',keys:'agregado ladrillo cemento mortero revoque carga distribuida reaccion materiales metrado',detail:'Ejemplos de cubicación, desperdicios, dosificaciones, cargas distribuidas y reacciones. Las dosificaciones y rendimientos deben ajustarse al diseño de mezcla y a datos reales del proyecto.'},
    {pages:'39–42, 59, 99–105',title:'Escaleras y rampas',keys:'escalera rampa huella contrahuella longitud peldaño',detail:'Geometría de escaleras rectas, L, U, helicoidales y caracol, más rampas. Comprobar huella, contrahuella, descansos, ancho, pendiente, espesor y condiciones de accesibilidad aplicables.'},
    {pages:'44, 50–51, 78–79, 87–88',title:'Acero y buenas prácticas de vaciado',keys:'acero estribo traslape anclaje recubrimiento vaciado vibrado columna losa',detail:'Inspección previa de acero, estribos, anclajes, recubrimientos, encofrado, vibrado y secuencia de colocación. Se destacan errores constructivos que pueden comprometer desempeño y durabilidad.'},
    {pages:'46–57, 73–86, 89, 92, 95–98, 106–108',title:'Flexión, resistencia y comportamiento estructural',keys:'flexion cuantia whitney viga rigidez curvatura momento resistencia ductil fragil',detail:'Fundamentos de flexión de concreto armado, bloque equivalente, cuantías, vigas simples y dobles, secciones especiales, rigidez y momento-curvatura. Referencia didáctica; cálculo final requiere normativa y datos completos.'},
    {pages:'49, 52–54, 73–77',title:'Tecnología del concreto',keys:'concreto resistencia agua cemento slump asentamiento curado retraccion fluencia durabilidad',detail:'Componentes, propiedades frescas y endurecidas, resistencia, asentamiento, retracción, fluencia, durabilidad y control de obra. El control de agua, compactación y curado aparece como tema crítico.'},
    {pages:'61–69',title:'Muros portantes y albañilería',keys:'muro portante albanileria densidad sismo solera confinamiento ladrillo',detail:'Espesor, carga axial, aplastamiento, densidad de muros, factores sísmicos, metrado de cargas, vigas soleras y columnas de confinamiento. Basado en RNE del Perú; usar solo como referencia técnica.'},
    {pages:'90–94',title:'Losas de cimentación',keys:'losa cimentacion rigida flexible winkler balasto capacidad portante asentamiento',detail:'Metodologías de cimentación rígida y flexible, presión de contacto, capacidad portante, asentamiento, modelo de Winkler, flexión y punzonamiento.'},
    {pages:'110–116, 120',title:'Grietas y deflexiones',keys:'grieta fisura deflexion inmediata diferida retraccion fluencia',detail:'Formación y control de grietas, factores de ancho de fisura, deflexiones inmediatas y diferidas, fluencia y retracción. Útil para diagnóstico preliminar y supervisión, no para concluir causas sin inspección y cálculo.'},
    {pages:'115, 117–123',title:'Fundamentos y levantamientos topográficos',keys:'topografia geodesia cartografia levantamiento planimetrico altimetrico',detail:'Conceptos, ramas, geodesia, cartografía y levantamientos planimétricos, altimétricos y planialtimétricos.'},
    {pages:'124–136',title:'Precisión y cálculos topográficos',keys:'escala precision exactitud tolerancia error conversion trigonometria pitagoras seno coseno area volumen coordenada',detail:'Escalas, precisión, tolerancias, errores, conversiones, geometría, trigonometría, áreas, volúmenes y coordenadas. Mantener unidades, convenciones de azimut y controles de cierre.'},
    {pages:'137–150',title:'Instrumentos y replanteo',keys:'wincha cinta jalon plomada prisma mira nivel automatico electronico replanteo teodolito',detail:'Uso, partes, cuidados y aplicaciones de instrumentos básicos y ópticos, más replanteo de obra. Recomienda calibración, verificación y registro de campo.'},
    {pages:'109',title:'Contratación pública peruana',keys:'ley 32069 peru contratacion',detail:'Contenido legal peruano. No debe utilizarse para justificar procedimientos, plazos o requisitos de contratación en Honduras.'}
  ],
  important:[
    {title:'Control de concreto en obra',pages:'49, 52–54, 73–77, 88',checks:['Verificar materiales y dosificación aprobada.','Evitar agregar agua sin control.','Controlar colocación, vibrado y segregación.','Registrar curado, edad y condiciones ambientales.']},
    {title:'Acero antes del vaciado',pages:'20, 44, 50–51, 78–79, 87',checks:['Diámetro, grado y cantidad según planos.','Estribos, ganchos, separación y confinamiento.','Recubrimiento, anclajes y traslapes.','Limpieza, posición y estabilidad del armado.']},
    {title:'Terracería y maquinaria',pages:'3–11',checks:['Registrar equipo, material y frente de trabajo.','Medir tiempos reales de ciclo y distancia de acarreo.','Controlar humedad, pendientes, pasadas y eficiencia.','Comparar producción real contra la programada.']},
    {title:'Topografía y replanteo',pages:'19, 31, 43, 115, 117–150',checks:['Confirmar banco o referencia de nivel.','Verificar calibración y estado del equipo.','Registrar coordenadas, cotas, tolerancias y croquis.','Repetir comprobaciones antes de retirarse del campo.']},
    {title:'Cimentaciones',pages:'14–15, 23, 90–94',checks:['Cruzar cargas con estudio de suelo.','Revisar presión de contacto y capacidad portante.','Comprobar asentamientos, corte y punzonamiento.','No aprobar dimensiones solo por predimensionamiento.']},
    {title:'Metrados y cantidades',pages:'32, 34, 36, 58, 70–72',checks:['Trabajar con dimensiones y unidades verificadas.','Separar volumen geométrico de desperdicio.','Usar dosificación y rendimiento reales del proyecto.','Documentar supuestos para poder auditar el cálculo.']},
    {title:'Grietas, deflexiones y fallas',pages:'33, 87–88, 110–116, 120',checks:['Registrar ubicación, longitud, ancho y evolución.','Revisar cargas, apoyos, curado y secuencia constructiva.','No asignar causa definitiva solo por apariencia.','Escalar a revisión estructural cuando corresponda.']},
    {title:'Pendientes, rampas y tuberías',pages:'19, 31, 39–45',checks:['Usar desnivel y distancia horizontal con unidades consistentes.','Confirmar sentido positivo o negativo de la pendiente.','Verificar drenaje, accesibilidad y tolerancias del proyecto.','Respaldar resultados con cotas o lecturas de campo.']}
  ]
};

function scoreEntry(entry,q){
  const words=String(entry.keys||'').split(/\s+/).filter(Boolean);
  let score=0;
  for(const w of words)if(q.includes(w))score+=w.length>7?2:1;
  if(q.includes(norm(entry.title)))score+=5;
  return score;
}
function lookup(text,limit=5){
  const q=norm(text);
  return MANUAL.topics.map(t=>({...t,score:scoreEntry(t,q)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,limit);
}
function pageLookup(text,limit=5){
  const q=norm(text);
  return MANUAL.pageIndex.map(t=>({...t,score:scoreEntry(t,q)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,limit);
}
function manualContext(text){
  const topics=lookup(text,4),pages=pageLookup(text,4);
  if(!topics.length&&!pages.length)return'';
  const lines=[
    'REFERENCIA INTERNA: Manual técnico de ingeniería y construcción (Manual.pdf, 150 páginas).',
    'Instrucción para Halu: responde usando esta referencia cuando sea pertinente, indica las páginas y distingue claramente entre referencia didáctica y criterio aplicable al proyecto. No inventes valores que no estén en el contexto. Si faltan dimensiones, unidades, resistencias, cargas, equipo o condiciones de campo, solicítalas.',
    ...topics.map(t=>`${t.title} · págs. ${t.pages}: ${t.summary}`),
    ...pages.map(t=>`Detalle relacionado · págs. ${t.pages} · ${t.title}: ${t.detail}`),
    MANUAL.jurisdictionNote
  ];
  return lines.join('\n').slice(0,5200);
}
function answer(text){
  const topics=lookup(text,4),pages=pageLookup(text,3);
  if(!topics.length&&!pages.length)return'';
  const lines=[];
  for(const t of topics)lines.push(`• ${t.title} · págs. ${t.pages}: ${t.summary}`);
  for(const t of pages)if(!lines.some(x=>x.includes(`págs. ${t.pages}:`)))lines.push(`• Págs. ${t.pages} · ${t.title}: ${t.detail}`);
  return `Sí. Ese tema está registrado en el Manual técnico que usa Halu como referencia interna.\n${lines.join('\n')}\n\nCriterio de uso: ${MANUAL.jurisdictionNote}`;
}
window.__ccEngineeringManual={...MANUAL,lookup,pageLookup,context:manualContext,answer};

(function patchFetch(){
  if(window.__CC_MANUAL_FETCH_PATCH__||typeof window.fetch!=='function')return;
  window.__CC_MANUAL_FETCH_PATCH__=true;
  const base=window.fetch.bind(window);
  window.fetch=function(input,init){
    try{
      const url=typeof input==='string'?input:String(input?.url||'');
      if(/\/functions\/v1\/halu-chat(?:\?|$)/.test(url)&&init&&typeof init.body==='string'){
        const data=JSON.parse(init.body),ctx=manualContext(data?.message||'');
        if(ctx){
          const existing=String(data.context||'').slice(0,2200);
          data.context=`${existing}\n\n${ctx}`.slice(0,7200);
          init={...init,body:JSON.stringify(data)};
        }
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
    const wrapped=function(q){const local=answer(q);if(local)return Promise.resolve(local);return base(q)};
    wrapped.__ccManualPatched=true;wk.answer=wrapped;return true;
  };
  if(!tryPatch()){let n=0;const t=setInterval(()=>{n++;if(tryPatch()||n>40)clearInterval(t)},250)}
})();

function injectCss(){
  if(document.getElementById('cc-engineering-manual-style'))return;
  const s=document.createElement('style');s.id='cc-engineering-manual-style';s.textContent=`
  .cc-manual-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.cc-manual-card{border:1px solid #243449;background:#0a111a;border-radius:11px;padding:10px;min-width:0}.cc-manual-card b{display:block;font-size:11px;color:#eef4fb}.cc-manual-card span{display:inline-block;margin:5px 0 3px;font-size:9px;font-weight:800;color:#9fc1ff}.cc-manual-card p{margin:0!important;font-size:10px!important;color:#8298b1!important;line-height:1.45}.cc-manual-warning{margin-top:9px;border:1px solid #5a4c1f;background:#251f0b;color:#fde68a;border-radius:10px;padding:9px 10px;font-size:10px;line-height:1.45}.cc-manual-warning b{color:#fff3b0}.cc-manual-modal-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.cc-manual-important{border:1px solid var(--line);background:#09111b;border-radius:13px;padding:12px}.cc-manual-important h3{margin:0 0 3px}.cc-manual-important small{color:#8fb6e8}.cc-manual-important ul{padding-left:18px;margin:9px 0 0;color:#b9c7d6;font-size:11px;line-height:1.55}.cc-manual-search-result{border-bottom:1px solid #1c2a3a;padding:9px 2px}.cc-manual-search-result:last-child{border-bottom:0}.cc-manual-search-result small{color:#9fc1ff}.cc-manual-source-badge{display:inline-flex;align-items:center;gap:6px;border:1px solid #2f4d6f;background:#0d2034;color:#bfdbfe;border-radius:999px;padding:5px 9px;font-size:10px;font-weight:800}.cc-manual-top-btn{white-space:nowrap}
  @media(max-width:900px){.cc-manual-grid{grid-template-columns:1fr 1fr}}@media(max-width:650px){.cc-manual-modal-grid,.cc-manual-grid{grid-template-columns:1fr}.cc-manual-top-btn{flex:1}}
  `;document.head.appendChild(s);
}

function openHaluFromManual(){
  const launch=document.getElementById('ccEngineerChatLaunch'),box=document.getElementById('ccEngineerChat');
  if(launch&&!box?.classList.contains('open'))launch.click();
  setTimeout(()=>{
    const input=document.querySelector('#ccEngineerChat input[type="text"]');
    if(input){input.value='Consulta el Manual técnico: ';input.focus()}
  },80);
}
function manualModal(){
  injectCss();
  if(typeof openModal!=='function')return;
  const m=openModal('Manual técnico · referencia de ingeniería',`
    <div class="alert info"><b>Manual.pdf registrado en Halu.</b><br>La página muestra únicamente los controles de mayor utilidad operativa. El contenido restante queda indexado para consultas del chatbot por tema y por rango de páginas.</div>
    <div class="row spread wrap" style="margin-bottom:12px"><span class="cc-manual-source-badge">150 páginas · referencia interna</span><button class="btn primary" type="button" data-manual-halu>Preguntar a Halu</button></div>
    <section class="cc-manual-modal-grid">${MANUAL.important.map(x=>`<article class="cc-manual-important"><h3>${H(x.title)}</h3><small>Págs. ${H(x.pages)}</small><ul>${x.checks.map(c=>`<li>${H(c)}</li>`).join('')}</ul></article>`).join('')}</section>
    <section class="panel" style="margin-top:14px"><div class="panel-head"><div><h3>Buscar dentro del índice del Manual</h3><p class="muted">Escribe un tema: concreto, acero, topografía, excavadora, zapata, grietas, pendiente, escalera…</p></div></div><input id="ccManualSearch" placeholder="Buscar tema técnico" autocomplete="off"><div id="ccManualResults" style="margin-top:8px"><div class="notice">Halu conserva el índice completo por temas y páginas.</div></div></section>
    <div class="cc-manual-warning"><b>Importante.</b> ${H(MANUAL.jurisdictionNote)}</div>
  `);
  m.querySelector('[data-manual-halu]')?.addEventListener('click',()=>{m.remove();openHaluFromManual()});
  const input=m.querySelector('#ccManualSearch'),host=m.querySelector('#ccManualResults');
  const render=()=>{
    const q=String(input.value||'').trim();
    if(!q){host.innerHTML='<div class="notice">Halu conserva el índice completo por temas y páginas.</div>';return}
    const rows=[...lookup(q,4),...pageLookup(q,5)].slice(0,7);
    host.innerHTML=rows.length?rows.map(x=>`<div class="cc-manual-search-result"><b>${H(x.title)}</b><br><small>Págs. ${H(x.pages)}</small><div class="notice">${H(x.summary||x.detail||'')}</div></div>`).join(''):'<div class="empty">No encontré coincidencia exacta. Puedes preguntárselo a Halu con tus propias palabras.</div>';
  };
  input?.addEventListener('input',render);
}
function bindManualButton(){
  injectCss();
  if(!session?.accessToken){document.getElementById('ccManualBtn')?.remove();return}
  if(document.getElementById('ccManualBtn'))return;
  const host=document.querySelector('.top-actions');if(!host)return;
  const b=document.createElement('button');b.id='ccManualBtn';b.className='btn cc-manual-top-btn';b.type='button';b.textContent='Manual técnico';b.title='Referencia técnica de ingeniería registrada en Halu';b.onclick=manualModal;
  host.insertBefore(b,host.firstChild);
}
function bindChatQuick(){
  const quick=document.querySelector('#ccEngineerChat .cc-eng-quick');
  if(!quick||quick.querySelector('[data-manual-quick]'))return;
  const b=document.createElement('button');b.type='button';b.dataset.manualQuick='1';b.textContent='Manual técnico';b.onclick=()=>{
    const input=document.querySelector('#ccEngineerChat input[type="text"]');if(!input)return;
    input.value='¿Qué información del Manual técnico tienes sobre ';input.focus();
  };quick.appendChild(b);
}

function activityText(pid){
  try{const s=window.__ccProgramacionControl?.state?.(pid);return Array.isArray(s?.activities)?s.activities.map(a=>`${a.name||''} ${a.equipment||''} ${a.materials||''} ${a.notes||''}`).join(' '):''}catch{return''}
}
function panelHtml(pid){
  const detected=lookup(activityText(pid),5),topics=detected.length?detected:[MANUAL.topics[0],MANUAL.topics[9],MANUAL.topics[2]];
  return `<section class="ccpc-panel cc-manual-panel" data-cc-manual-panel><div class="ccpc-panel-head"><div><h3>Referencia técnica del Manual</h3><p>El seguimiento cruza actividades y recursos con criterios de rendimiento, calidad, materiales y topografía.</p></div><span class="ccpc-badge">150 págs.</span></div><div class="cc-manual-grid">${topics.map(t=>`<article class="cc-manual-card"><b>${H(t.title)}</b><span>Págs. ${H(t.pages)}</span><p>${H(t.summary)}</p></article>`).join('')}</div><div class="cc-manual-warning"><b>Uso normativo responsable.</b> ${H(MANUAL.jurisdictionNote)}</div></section>`;
}
function injectPanel(){
  document.querySelectorAll('[data-ccpc-root]').forEach(root=>{if(root.querySelector('[data-cc-manual-panel]'))return;const pid=root.getAttribute('data-ccpc-root')||'';root.insertAdjacentHTML('beforeend',panelHtml(pid))});
}
let queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;bindManualButton();bindChatQuick();injectPanel()})}
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('cc:data-changed',schedule);
setTimeout(schedule,180);
window.openEngineeringManual=manualModal;
})();
