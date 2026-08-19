(()=>{
function projectModal(p=null){const x=p||{code:'',name:'',location:'',type:'Obra',budget:0,status:'Planificación',start:'',executionDays:0,end:'',description:''};let manual=!!x.durationManual;const suggestion=learnedExecutionDays(x.budget,x.type,p?.id||null);const m=openModal(p?'Editar proyecto':'Nuevo proyecto',`<form id="projectForm" class="form-grid"><label class="field"><span>Código</span><input id="pCode" required value="${esc(x.code||'')}"></label><label class="field"><span>Nombre del proyecto</span><input id="pName" required value="${esc(x.name||'')}"></label><label class="field"><span>Ubicación</span><input id="pLocation" value="${esc(x.location||'')}"></label><label class="field"><span>Tipo de contratación</span><select id="pType"><option value="Obra">Obra</option><option value="Consultoria">Consultoría</option><option value="BienesServicios">Bienes / Servicios</option></select></label><label class="field"><span>Presupuesto estimado</span><input id="pBudget" type="number" min="0" step="0.01" required value="${x.budget||''}"><small id="pBudgetWords"></small></label><label class="field"><span>Modalidad sugerida</span><input id="pMode" readonly></label><label class="field"><span>Fecha de inicio</span><input id="pStart" type="date" value="${x.start||''}"></label><label class="field"><span>Días de ejecución</span><input id="pDays" type="number" min="1" step="1" value="${x.executionDays||suggestion.days}"><small id="pDaysHint"></small></label><label class="field"><span>Fecha final calculada</span><input id="pEnd" type="date" value="${x.end||''}"></label><label class="field"><span>Estado</span><select id="pStatus">${['Planificación','Proceso de contratación','Adjudicado','En ejecución','Suspendido','Finalizado','Cerrado'].map(v=>`<option>${v}</option>`).join('')}</select></label><label class="field wide"><span>Descripción</span><textarea id="pDescription" rows="3">${esc(x.description||'')}</textarea></label><div class="modal-actions"><button type="button" class="btn cancel">Cancelar</button><button class="btn primary">Guardar proyecto</button></div></form>`);$('#pType').value=x.type||'Obra';$('#pStatus').value=x.status||'Planificación';let syncing=false;const refresh=()=>{const sg=learnedExecutionDays($('#pBudget').value,$('#pType').value,p?.id||null);$('#pMode').value=procurementMode($('#pType').value,$('#pBudget').value);$('#pBudgetWords').textContent=amountWords($('#pBudget').value||0);if(!manual){$('#pDays').value=sg.days}$('#pDaysHint').textContent=`Sugerencia adaptativa: ${sg.days} días · ${sg.count?sg.count+' referencia(s) histórica(s)':'sin referencias aún'}`;if($('#pStart').value&&$('#pDays').value&&!syncing){syncing=true;$('#pEnd').value=addExecutionDays($('#pStart').value,$('#pDays').value);syncing=false}};$('#pBudget').oninput=()=>{if(!p)manual=false;refresh()};$('#pType').onchange=()=>{if(!p)manual=false;refresh()};$('#pStart').oninput=refresh;$('#pDays').oninput=()=>{manual=true;if($('#pStart').value){syncing=true;$('#pEnd').value=addExecutionDays($('#pStart').value,$('#pDays').value);syncing=false}};$('#pEnd').oninput=()=>{if(syncing||!$('#pStart').value||!$('#pEnd').value)return;manual=true;$('#pDays').value=daysBetween($('#pStart').value,$('#pEnd').value)};refresh();if(x.end)$('#pEnd').value=x.end;m.querySelector('.cancel').onclick=()=>m.remove();$('#projectForm').onsubmit=e=>{e.preventDefault();if($('#pEnd').value&&$('#pStart').value&&$('#pEnd').value<$('#pStart').value)return toast('La fecha final no puede ser anterior a la inicial.');const sg=learnedExecutionDays($('#pBudget').value,$('#pType').value,p?.id||null),data={code:$('#pCode').value.trim(),name:$('#pName').value.trim(),location:$('#pLocation').value.trim(),type:$('#pType').value,budget:round2($('#pBudget').value),status:$('#pStatus').value,start:$('#pStart').value,executionDays:Math.max(1,Math.trunc(Number($('#pDays').value)||sg.days)),end:$('#pEnd').value||addExecutionDays($('#pStart').value,$('#pDays').value),durationSuggested:sg.days,durationManual:manual,description:$('#pDescription').value.trim(),updatedAt:iso()};if(p){Object.assign(p,data);audit('EDITAR','Proyecto',p.id,data);rememberExecutionDuration(p.id,data.budget,data.type,data.executionDays,'proyecto')}else{const np={id:uid(),...data,procurement:projectProcurement({}),closeoutEvaluation:projectCloseout({}),deletedAt:null,createdAt:iso()};db.projects.push(np);audit('CREAR','Proyecto',np.id,data);rememberExecutionDuration(np.id,data.budget,data.type,data.executionDays,'proyecto')}saveDB();m.remove();renderApp();toast('Proyecto guardado y sincronizado.')}}
function installProjectActionSafety(){
  if(window.__projectActionSafetyInstalled)return;
  window.__projectActionSafetyInstalled=true;
  document.addEventListener('click',function(ev){
    const edit=ev.target.closest?.('[data-edit-project]');
    if(edit){
      ev.preventDefault();ev.stopImmediatePropagation();
      const p=db.projects.find(x=>x.id===edit.dataset.editProject);
      if(!p)return toast('No se encontró el proyecto para editar.');
      return projectModal(p);
    }
    const del=ev.target.closest?.('[data-trash]');
    if(del){
      ev.preventDefault();ev.stopImmediatePropagation();
      const p=db.projects.find(x=>x.id===del.dataset.trash);
      if(!p)return toast('No se encontró el proyecto para eliminar.');
      if(confirm(`¿Mover ${p.name} a la Papelera?`)){
        p.deletedAt=iso();
        audit('ELIMINAR','Proyecto',p.id,{code:p.code,name:p.name});
        saveDB();
        renderApp();
        toast('Proyecto movido a la Papelera.');
      }
      return;
    }
    const open=ev.target.closest?.('[data-open]');
    if(open){
      ev.preventDefault();ev.stopImmediatePropagation();
      view.projectId=open.dataset.open;
      view.screen='project';
      view.tab='summary';
      renderApp();
    }
  },true);
}
installProjectActionSafety();

})();
