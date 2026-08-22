/* ===== CICLO CONTRACTUAL LCE/RLCE V1 ===== */
(()=>{
  if(window.__CP_LIFECYCLE_V1__) return;
  window.__CP_LIFECYCLE_V1__=true;

  const css=`
  .lc-wrap{display:grid;gap:14px}.lc-hero{border:1px solid rgba(96,165,250,.18);border-radius:18px;background:linear-gradient(150deg,rgba(18,34,55,.98),rgba(8,15,25,.98));padding:17px}.lc-hero-top{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.lc-hero h3{font-size:18px;margin:2px 0 5px}.lc-hero p{font-size:10px;line-height:1.5;color:#8297ae;margin:0}.lc-total{min-width:88px;text-align:right}.lc-total b{display:block;font-size:24px;color:#eaf2ff}.lc-total small{color:#7390ad;font-size:9px}.lc-bar{height:8px;border-radius:99px;background:#06101a;border:1px solid #17263a;overflow:hidden;margin-top:12px}.lc-bar i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#2563eb,#38bdf8)}
  .lc-legal-note{padding:10px 12px;border:1px solid rgba(245,158,11,.18);background:rgba(245,158,11,.06);border-radius:12px;color:#d8c58e;font-size:9px;line-height:1.5}.lc-phase-list{display:grid;gap:10px}.lc-phase{border:1px solid rgba(148,163,184,.11);background:linear-gradient(155deg,rgba(14,23,36,.98),rgba(7,13,22,.98));border-radius:16px;overflow:hidden}.lc-phase-head{display:grid;grid-template-columns:38px minmax(0,1fr) auto auto;gap:11px;align-items:center;padding:12px 13px;border-bottom:1px solid rgba(148,163,184,.08);cursor:pointer;user-select:none;transition:background .15s ease}.lc-phase-head:hover{background:rgba(59,130,246,.045)}.lc-num{width:38px;height:38px;display:grid;place-items:center;border-radius:12px;background:rgba(59,130,246,.1);border:1px solid rgba(96,165,250,.15);color:#bfdbfe;font-weight:900}.lc-phase-head h4{margin:0 0 2px;font-size:13px}.lc-phase-head p{margin:0;color:#72879d;font-size:9px}.lc-phase-pct{font-size:10px;color:#9fc1ff;font-weight:900}.lc-toggle{width:28px;height:28px;border:1px solid rgba(148,163,184,.12);border-radius:9px;background:#08111b;color:#9fc1ff;display:grid;place-items:center;font-size:14px;font-weight:900;transition:transform .18s ease,background .15s ease}.lc-phase.open .lc-toggle{transform:rotate(180deg);background:rgba(37,99,235,.12)}.lc-phase-body{display:none}.lc-phase.open .lc-phase-body{display:block}.lc-items{display:grid}.lc-item{display:grid;grid-template-columns:24px minmax(180px,1.2fr) minmax(140px,.7fr) minmax(180px,1fr);gap:9px;align-items:center;padding:9px 12px;border-bottom:1px solid rgba(148,163,184,.06)}.lc-item:last-child{border-bottom:0}.lc-check{width:18px;height:18px;accent-color:#3b82f6}.lc-name b{display:block;font-size:10px}.lc-name small{display:block;color:#6f849b;font-size:8px;margin-top:2px}.lc-date,.lc-note{min-height:34px!important;padding:7px 8px!important;border-radius:9px!important;font-size:9px!important}.lc-detected{display:inline-flex;margin-top:4px;padding:3px 6px;border-radius:999px;border:1px solid rgba(34,197,94,.15);background:rgba(34,197,94,.06);color:#a7f3d0;font-size:7px;font-weight:850}.lc-detected.warn{border-color:rgba(245,158,11,.18);background:rgba(245,158,11,.06);color:#fde68a}.lc-footer{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:11px 12px;border-top:1px solid rgba(148,163,184,.08);background:rgba(2,8,15,.28)}.lc-footer span{font-size:8px;color:#71869d}.lc-footer b{font-size:9px;color:#dce9f8}.lc-current{color:#a7f3d0!important}
  @media(max-width:900px){.lc-item{grid-template-columns:24px minmax(0,1fr) 135px}.lc-note{grid-column:2/-1}.lc-hero-top{display:block}.lc-total{text-align:left;margin-top:10px}}
  @media(max-width:620px){.lc-phase-head{grid-template-columns:34px 1fr auto}.lc-phase-pct{grid-column:2}.lc-toggle{grid-column:3;grid-row:1/3}.lc-item{grid-template-columns:24px 1fr}.lc-date,.lc-note{grid-column:2/-1}.lc-footer{display:block}.lc-footer b{display:block;margin-top:4px}}
  `;
  const style=document.createElement('style');style.id='contract-lifecycle-v1-css';style.textContent=css;document.head.appendChild(style);

  const phases=[
    {id:'planning',title:'Planificación y requisitos previos',subtitle:'Base técnica, presupuestaria, ambiental y de disponibilidad física del proyecto.',items:[
      ['studies','Estudios y diseños','Estudios, planos, diseños y especificaciones técnicas concluidos.'],
      ['budget','Presupuesto base','Presupuesto estimado y programación física definidos.'],
      ['funding','Disponibilidad presupuestaria','Partida y asignación presupuestaria identificadas.'],
      ['environment','Permisos y gestión ambiental','Licencias, permisos o instrumentos ambientales que correspondan.'],
      ['land','Terrenos, servidumbres y derecho de vía','Disponibilidad física y legal necesaria para ejecutar la obra.'],
      ['pliego','Pliego / bases del proceso','Pliego de condiciones o bases preparado y aprobado.']
    ]},
    {id:'selection',title:'Selección y adjudicación',subtitle:'Competencia, recepción, evaluación y decisión de adjudicación.',items:[
      ['method','Modalidad de contratación','Modalidad definida de acuerdo con monto, objeto y normativa aplicable.'],
      ['prequal','Precalificación, cuando aplique','Verificación previa de capacidad técnica, legal y financiera.'],
      ['notice','Convocatoria / invitación','Publicidad o invitación realizada según la modalidad aplicable.'],
      ['opening','Recepción y apertura de ofertas','Acta y documentación del acto de recepción/apertura.'],
      ['evaluation','Evaluación técnica y económica','Análisis y recomendación de la comisión evaluadora.'],
      ['award','Resolución de adjudicación','Decisión motivada y notificada conforme al procedimiento.']
    ]},
    {id:'formalization',title:'Formalización y perfeccionamiento',subtitle:'Del acto de adjudicación al contrato listo para ejecución.',items:[
      ['contract','Contrato suscrito','Documento contractual firmado por las partes.'],
      ['approval','Aprobación del órgano competente','Aprobación o ratificación superior cuando corresponda.'],
      ['registration','Registro y control','Registro administrativo, presupuestario y de fiscalización aplicable.'],
      ['compliance','Garantía de cumplimiento','Garantía constituida conforme al contrato y normativa aplicable.']
    ]},
    {id:'execution',title:'Ejecución contractual',subtitle:'Inicio, supervisión, avance físico-financiero, pagos y modificaciones.',items:[
      ['workplan','Plan de trabajo / cronograma','Programa de ejecución, personal técnico y recursos definidos.'],
      ['startorder','Orden de inicio','Notificación formal para comenzar la obra.'],
      ['supervision','Supervisión e inspección','Seguimiento técnico documentado durante la ejecución.'],
      ['estimates','Estimaciones y pagos parciales','Mediciones, aprobación y trámite de pagos de obra ejecutada.'],
      ['changes','Modificaciones contractuales','Órdenes de cambio, ampliaciones o adendas debidamente justificadas.'],
      ['timecontrol','Control de plazo y avance','Comparación continua de tiempo contractual contra avance ejecutado.']
    ]},
    {id:'closeout',title:'Recepción, liquidación y cierre',subtitle:'Recepciones, correcciones, calidad, liquidación y finiquito.',items:[
      ['provisional','Recepción provisional','Inspección de terminación y acta con pendientes, si los hay.'],
      ['corrections','Subsanación de pendientes','Correcciones o trabajos pendientes verificados.'],
      ['definitive','Recepción definitiva','Acta final de recepción y aceptación de la obra.'],
      ['quality','Garantía de calidad','Garantía de calidad constituida y controlada durante su vigencia.'],
      ['liquidation','Liquidación final','Ajuste económico final, saldos, retenciones y cuentas.'],
      ['finiquito','Finiquito y cierre del expediente','Cierre administrativo y documental del contrato.']
    ]}
  ];

  const ensureData=p=>{if(!p.contractLifecycle||typeof p.contractLifecycle!=='object')p.contractLifecycle={};if(!p.contractLifecycle.items)p.contractLifecycle.items={};return p.contractLifecycle};
  const key=(phase,item)=>phase+'.'+item;
  const getEntry=(p,phase,item)=>ensureData(p).items[key(phase,item)]||{};
  const setEntry=(p,phase,item,patch)=>{const lc=ensureData(p),k=key(phase,item);lc.items[k]={...(lc.items[k]||{}),...patch,updatedAt:iso()};p.updatedAt=iso();audit('ACTUALIZAR','Proceso contractual',p.id,{fase:phase,requisito:item,...patch});saveDB()};

  function detected(p,c,phase,item){
    const gs=(db.guarantees||[]).filter(g=>g.projectId===p.id),ests=(db.estimates||[]).filter(e=>e.projectId===p.id||(c&&e.contractId===c.id)),vis=(db.visits||[]).filter(v=>v.projectId===p.id),chs=(db.changes||[]).filter(x=>x.projectId===p.id||(c&&x.contractId===c.id));
    if(phase==='formalization'&&item==='contract'&&c)return 'Contrato registrado en el expediente';
    if(phase==='formalization'&&item==='compliance'&&gs.some(g=>/cumplimiento/i.test(g.type||'')))return 'Garantía de cumplimiento registrada';
    if(phase==='execution'&&item==='supervision'&&vis.length)return `${vis.length} visita${vis.length===1?'':'s'} de supervisión registrada${vis.length===1?'':'s'}`;
    if(phase==='execution'&&item==='estimates'&&ests.length)return `${ests.length} estimación${ests.length===1?'':'es'} registrada${ests.length===1?'':'s'}`;
    if(phase==='execution'&&item==='changes'&&chs.length)return `${chs.length} modificación${chs.length===1?'':'es'} registrada${chs.length===1?'':'s'}`;
    if(phase==='closeout'&&item==='quality'&&gs.some(g=>/calidad/i.test(g.type||'')))return 'Garantía de calidad registrada';
    if(phase==='selection'&&item==='award'&&/adjudic|contrat|ejecuci|finaliz|cerrad/i.test(p.status||''))return 'El estado del proyecto indica avance posterior a adjudicación';
    if(phase==='execution'&&item==='startorder'&&((c?.start)||p.start))return 'Fecha de inicio registrada en el expediente';
    return '';
  }

  function stats(p){let done=0,total=0;const per={};phases.forEach(ph=>{let d=0,t=0,na=0;ph.items.forEach(([id])=>{const e=getEntry(p,ph.id,id);if(e.notApplicable){na++;return}total++;t++;if(e.done){done++;d++}});per[ph.id]={done:d,total:t,na,pct:t?Math.round(d/t*100):100}});return{done,total,pct:total?Math.round(done/total*100):100,per}};
  function currentPhase(s){for(const ph of phases)if(s.per[ph.id].pct<100)return ph;return phases[phases.length-1]}
  const openKey=p=>`cp_lifecycle_open_${p.id}`;
  function getOpenPhases(p,cur){try{const raw=JSON.parse(localStorage.getItem(openKey(p))||'null');if(Array.isArray(raw))return new Set(raw)}catch{}return new Set([cur.id])}
  function saveOpenPhases(p,set){localStorage.setItem(openKey(p),JSON.stringify([...set]))}

  window.renderContractLifecycle=function(p,c){
    const root=document.getElementById('tabBody');if(!root)return;
    const s=stats(p),cur=currentPhase(s),can=typeof roleCanEdit==='function'?roleCanEdit():true,openPhases=getOpenPhases(p,cur);
    root.innerHTML=`<div class="lc-wrap"><section class="lc-hero"><div class="lc-hero-top"><div><p class="eyebrow">RUTA CONTRACTUAL DE OBRA PÚBLICA</p><h3>Proceso de contratación y ejecución</h3><p>Control por cinco fases del expediente. Marca cada requisito únicamente cuando exista respaldo documental suficiente.</p></div><div class="lc-total"><b>${s.pct}%</b><small>${s.done} de ${s.total} controles</small></div></div><div class="lc-bar"><i style="width:${s.pct}%"></i></div></section><div class="lc-legal-note"><b>Criterio de control:</b> esta ruta organiza el expediente con base en la LCE/RLCE y el procedimiento de obra pública. Los plazos, porcentajes, publicaciones, garantías y límites específicos deben validarse según la modalidad, el pliego, el contrato y la normativa vigente aplicable al caso concreto.</div><div class="lc-phase-list">${phases.map((ph,idx)=>{const ps=s.per[ph.id],isOpen=openPhases.has(ph.id);return `<section class="lc-phase ${isOpen?'open':''}" data-lc-phase="${ph.id}"><div class="lc-phase-head" data-lc-toggle="${ph.id}" role="button" tabindex="0" aria-expanded="${isOpen?'true':'false'}"><span class="lc-num">${idx+1}</span><div><h4>${ph.title}</h4><p>${ph.subtitle}</p></div><span class="lc-phase-pct ${cur.id===ph.id?'lc-current':''}">${ps.pct}%</span><span class="lc-toggle" aria-hidden="true">⌄</span></div><div class="lc-phase-body"><div class="lc-items">${ph.items.map(([id,name,desc])=>{const e=getEntry(p,ph.id,id),det=detected(p,c,ph.id,id);return `<label class="lc-item"><input class="lc-check" type="checkbox" data-lc-check="${ph.id}|${id}" ${e.done?'checked':''} ${can?'':'disabled'}><span class="lc-name"><b>${name}</b><small>${desc}</small>${det?`<span class="lc-detected">${esc(det)}</span>`:''}</span><input class="lc-date" type="date" data-lc-date="${ph.id}|${id}" value="${esc(e.date||'')}" ${can?'':'disabled'}><input class="lc-note" type="text" data-lc-note="${ph.id}|${id}" value="${esc(e.note||'')}" placeholder="Documento, acta, resolución u observación" ${can?'':'disabled'}></label>`}).join('')}</div><div class="lc-footer"><span>${ps.done} de ${ps.total} requisitos marcados</span><b>${ps.pct===100?'Fase completada':cur.id===ph.id?'Fase actual / pendiente de completar':'Pendiente'}</b></div></div></section>`}).join('')}</div></div>`;
    root.querySelectorAll('[data-lc-toggle]').forEach(el=>{
      const toggle=()=>{const id=el.dataset.lcToggle,section=root.querySelector(`[data-lc-phase="${id}"]`);if(!section)return;section.classList.toggle('open');const isOpen=section.classList.contains('open');el.setAttribute('aria-expanded',isOpen?'true':'false');if(isOpen)openPhases.add(id);else openPhases.delete(id);saveOpenPhases(p,openPhases)};
      el.onclick=toggle;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle()}};
    });
    root.querySelectorAll('[data-lc-check]').forEach(el=>el.onchange=()=>{const [ph,it]=el.dataset.lcCheck.split('|');setEntry(p,ph,it,{done:el.checked,notApplicable:false,date:el.checked?(getEntry(p,ph,it).date||today()):getEntry(p,ph,it).date||''});renderContractLifecycle(p,c)});
    root.querySelectorAll('[data-lc-date]').forEach(el=>el.onchange=()=>{const [ph,it]=el.dataset.lcDate.split('|');setEntry(p,ph,it,{date:el.value})});
    root.querySelectorAll('[data-lc-note]').forEach(el=>el.onchange=()=>{const [ph,it]=el.dataset.lcNote.split('|');setEntry(p,ph,it,{note:el.value.trim()})});
  };

  if(typeof renderProject==='function'){
    const baseRenderProject=renderProject;
    renderProject=function(){
      baseRenderProject();
      const p=db.projects.find(x=>x.id===view.projectId&&!x.deletedAt);if(!p)return;
      const c=db.contracts.find(x=>x.projectId===p.id);
      const nav=document.querySelector('nav.tabs');
      if(nav&&!nav.querySelector('[data-tab="lifecycle"]')){
        const b=document.createElement('button');b.dataset.tab='lifecycle';b.textContent='Proceso contractual';b.className=view.tab==='lifecycle'?'active':'';b.onclick=()=>{view.tab='lifecycle';renderProject()};nav.appendChild(b);
      }
      if(nav)nav.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===view.tab));
      if(view.tab==='lifecycle')window.renderContractLifecycle(p,c);
    };
  }
})();
