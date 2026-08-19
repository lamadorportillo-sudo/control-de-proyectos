(()=>{
  renderReports=function(p,c,est,gs){
    const type=view.reportType||'final',allEst=c?db.estimates.filter(e=>e.contractId===c.id).sort((a,b)=>a.number-b.number):[];
    if(type==='estimacion'&&!view.reportEstimateId&&allEst.length)view.reportEstimateId=allEst.at(-1).id;
    const cards=[
      ['adjudicacion','Informe de adjudicación','Ofertas, comparación, sugerencia y decisión final.'],
      ['anticipo','Informe de anticipo','Solicitud, garantía, pago y recuperación del anticipo.'],
      ['estimacion','Informe de estimación','Detalle de una estimación, deducciones y neto a pagar.'],
      ['calidad','Informe de calidad de obra','Visitas, observaciones, retenciones y cierre técnico.'],
      ['final','Informe final del proyecto','Expediente integral técnico, financiero y contractual.'],
      ['financiero','Informe financiero','Resumen financiero, estimado, pagado, deducciones y saldos.'],
      ['contractual','Informe contractual','Contrato, plazos, cláusulas, modificaciones y controles.'],
      ['garantias','Informe de garantías y vigencias','Garantías, ampliaciones, vencimientos y alertas.'],
      ['visitas','Informe de visitas y observaciones','Visitas de campo, hallazgos, instrucciones y seguimiento.']
    ];
    const estimateSelector=type==='estimacion'?`<label class="field report-estimate-selector"><span>Estimación a informar</span><select id="reportEstimate">${allEst.length?allEst.map(e=>`<option value="${e.id}">Estimación N.º ${e.number} · ${dmy(e.start)} - ${dmy(e.end)}</option>`).join(''):'<option value="">No hay estimaciones</option>'}</select></label>`:'';
    $('#tabBody').innerHTML=`${projectContext(p,c)}<div class="panel-head"><div><h2>Informes profesionales</h2><p class="muted">Todos los informes del expediente permanecen disponibles. Selecciona el documento que necesitas.</p></div></div><div class="report-type-grid">${cards.map(x=>`<button class="report-type-card ${type===x[0]?'active':''}" data-report-kind="${x[0]}"><b>${x[1]}</b><small>${x[2]}</small></button>`).join('')}</div><div class="report-toolbar">${estimateSelector}<label class="field"><span>Seleccionar informe</span><select id="reportType"><option value="final">Informe final del proyecto</option><option value="adjudicacion">Informe de adjudicación</option><option value="anticipo">Informe de anticipo</option><option value="estimacion">Informe de estimación</option><option value="calidad">Informe de calidad de obra</option><option value="financiero">Informe financiero</option><option value="contractual">Informe contractual</option><option value="garantias">Informe de garantías y vigencias</option><option value="visitas">Informe de visitas y observaciones</option></select></label><button class="btn" id="refreshReport">Actualizar</button><button class="btn primary" id="printReport">Imprimir / Guardar PDF</button><button class="btn" id="downloadReport">Exportar HTML</button></div><div class="alert info">Los datos del proyecto, contrato, oferentes, estimaciones, garantías, visitas y pagos se toman del expediente vinculado. Los importes en Lempiras se presentan en número y letras.</div><div id="reportPreview">${buildProjectReport(p,c,type)}</div>`;
    $('#reportType').value=type;
    $$('[data-report-kind]').forEach(b=>b.onclick=()=>{view.reportType=b.dataset.reportKind;if(view.reportType==='estimacion'&&!view.reportEstimateId&&allEst.length)view.reportEstimateId=allEst.at(-1).id;renderReports(p,c,est,gs)});
    $('#reportType').onchange=e=>{view.reportType=e.target.value;if(view.reportType==='estimacion'&&!view.reportEstimateId&&allEst.length)view.reportEstimateId=allEst.at(-1).id;renderReports(p,c,est,gs)};
    if($('#reportEstimate')){$('#reportEstimate').value=view.reportEstimateId||'';$('#reportEstimate').onchange=e=>{view.reportEstimateId=e.target.value;renderReports(p,c,est,gs)}}
    $('#refreshReport').onclick=()=>renderReports(p,c,est,gs);
    $('#printReport').onclick=()=>{document.body.classList.add('print-report');setTimeout(()=>{window.print();setTimeout(()=>document.body.classList.remove('print-report'),250)},50)};
    $('#downloadReport').onclick=()=>downloadCurrentReport(p,c,view.reportType||'final');
  };
})();
