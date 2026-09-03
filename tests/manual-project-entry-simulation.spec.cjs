const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const APP_URL = process.env.APP_URL || 'http://127.0.0.1:4173/';
const USER_ID = 'b1111111-1111-4111-8111-111111111111';
const WORKSPACE_ID = 'b2222222-2222-4222-8222-222222222222';

const invented = {
  code: 'COT121799-2026',
  name: 'CONSTRUCCIÓN DE ALCANTARILLADO SANITARIO Y PAVIMENTO, BARRIO LA ESPERANZA',
  location: 'Barrio La Esperanza, Santa María, La Paz',
  budget: 1850000.00,
  description: 'Construcción de red de alcantarillado sanitario, pozos de inspección, conexiones domiciliarias, mejoramiento de drenaje y pavimento de concreto hidráulico en calles del Barrio La Esperanza.',
  offers: [
    { bidder: 'CONSTRUCTORA VALLE VERDE S. DE R.L.', amount: 1819250.40, corrected: 1819250.40 },
    { bidder: 'INGENIERÍA HORIZONTE S. DE R.L.', amount: 1770000.00, corrected: 1770000.00 },
    { bidder: 'INVERSIONES CAMINO REAL S. DE R.L.', amount: 1846380.75, corrected: 1846010.75 },
  ],
  contractNumber: 'CONTRATO-COT121799-2026',
  contractor: 'INGENIERÍA HORIZONTE S. DE R.L.',
  contractAmount: 1770000.00,
  advance: 265500.00,
};

const emptyState = { users: [], projects: [], contracts: [], estimates: [], guarantees: [], changes: [], payments: [], visits: [], audit: [], durationLearning: [] };

function emptyControlCenter(){
  return {summary:{projects_total:0,projects_execution:0,projects_finalized:0,projects_pre_execution:0,portfolio_amount:0,execution_amount:0,execution_estimated:0,execution_paid:0,paid_total:0,execution_progress_pct:0,active_alerts:0,budget_projects:0,budget_available:0,critical_projects:0},projects:[],alerts:[],attention:[],reconciliation:[],audit:{total_events:0,integrity_ok:0,integrity_failures:0}};
}

async function mockBackend(page){
  await page.route('https://flethujkrharehjikwgj.supabase.co/**', async route => {
    const req = route.request();
    const url = new URL(req.url());
    const p = url.pathname;
    let body = [];
    if (p.includes('/functions/v1/secure-login')) body = {user:{id:USER_ID,email:'supervisor.prueba@example.com'},access_token:'manual-test-token',refresh_token:'manual-refresh-token',expires_in:3600,security_session_id:'manual-security-session',device_label:'Chrome manual',mfa_required:false,mfa_enrollment_required:false};
    else if (p.includes('/auth/v1/token')) body = {user:{id:USER_ID,email:'supervisor.prueba@example.com'},access_token:'manual-test-token',refresh_token:'manual-refresh-token',expires_in:3600};
    else if (p.includes('/rest/v1/workspace_members')) body = [{workspace_id:WORKSPACE_ID,role:'admin',active:true}];
    else if (p.includes('/rest/v1/profiles')) body = [{full_name:'Ing. Carlos Mendoza',active:true,must_change_password:false}];
    else if (p.includes('/rest/v1/app_state')) body = [{data:emptyState,version:1,updated_at:'2026-09-03T20:00:00Z'}];
    else if (p.includes('/rest/v1/rpc/get_control_center')) body = emptyControlCenter();
    else if (p.includes('/rest/v1/rpc/save_app_state')) body = [{saved:true,new_version:2}];
    else if (p.includes('/rest/v1/access_requests')) body = [];
    else if (p.includes('/functions/v1/manage-users')) body = {ok:true,revoked:false};
    else if (p.includes('/auth/v1/logout')) body = {};
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
  });
}

async function fill(page, selector, value){
  const el = page.locator(selector);
  await expect(el).toBeVisible({timeout:10000});
  await el.fill(String(value));
}
async function select(page, selector, value){
  const el = page.locator(selector);
  await expect(el).toBeVisible({timeout:10000});
  await el.selectOption({label:value}).catch(async()=>el.selectOption(value));
}
async function modalMetric(page, name, metrics){
  const m = page.locator('.modal').last();
  await expect(m).toBeVisible();
  const data = await m.evaluate(el => {
    const body=el.querySelector('.modal-body')||el;
    const controls=[...el.querySelectorAll('input,select,textarea')].filter(x=>x.type!=='hidden');
    const required=controls.filter(x=>x.required).length;
    return {controls:controls.length,required,scrollHeight:el.scrollHeight,clientHeight:el.clientHeight,scrollNeeded:el.scrollHeight>el.clientHeight+4,bodyTextLength:(body.innerText||'').length};
  });
  metrics.modals.push({name,...data});
  return data;
}
async function screenshot(page, testInfo, name){
  await page.screenshot({path:testInfo.outputPath(`${name}.png`),fullPage:true});
}
async function clickTab(page, id){
  const tab=page.locator(`button[data-tab="${id}"]`);
  await expect(tab).toBeVisible({timeout:10000});
  await tab.click();
  await expect(page.locator('#tabBody')).toBeVisible();
}

for (const vp of [
  {name:'desktop',width:1366,height:768},
  {name:'tablet',width:1024,height:768},
]) {
  test.describe(`simulación manual completa ${vp.name}`,()=>{
    test.use({viewport:{width:vp.width,height:vp.height}});

    test('crea y opera un proyecto inventado desde cero, campo por campo', async({page},testInfo)=>{
      test.setTimeout(180000);
      const metrics={viewport:vp,project:invented,startedAt:new Date().toISOString(),modals:[],observations:[],screens:[],fieldOperations:0,clickOperations:0};
      const pageErrors=[];
      page.on('pageerror',e=>pageErrors.push(e.message));
      await mockBackend(page);
      await page.goto(APP_URL,{waitUntil:'domcontentloaded',timeout:30000});

      // 1) Ingreso real desde pantalla de acceso.
      await expect(page.locator('#authForm')).toBeVisible({timeout:12000});
      await fill(page,'#authEmail','supervisor.prueba@example.com'); metrics.fieldOperations++;
      await fill(page,'#authPass','Prueba-Segura-2026!'); metrics.fieldOperations++;
      await page.locator('#authSubmit').click(); metrics.clickOperations++;
      await expect(page.locator('#ccSidebar')).toBeVisible({timeout:20000});
      await screenshot(page,testInfo,'01-inicio-vacio');
      metrics.screens.push('Inicio vacío');

      // 2) Crear proyecto manualmente.
      const newProject=page.locator('#newProjectBtn').or(page.locator('[data-command="project"]')).first();
      await expect(newProject).toBeVisible(); await newProject.click(); metrics.clickOperations++;
      const pm=await modalMetric(page,'Nuevo proyecto',metrics);
      if(pm.scrollNeeded)metrics.observations.push('El formulario de proyecto requiere desplazamiento vertical en esta resolución.');
      await fill(page,'#pCode',invented.code); metrics.fieldOperations++;
      await fill(page,'#pName',invented.name); metrics.fieldOperations++;
      await fill(page,'#pLocation',invented.location); metrics.fieldOperations++;
      await select(page,'#pType','Obra'); metrics.fieldOperations++;
      await fill(page,'#pBudget',invented.budget); metrics.fieldOperations++;
      await fill(page,'#pStart','2026-09-01'); metrics.fieldOperations++;
      await fill(page,'#pDays','100'); metrics.fieldOperations++;
      await select(page,'#pStatus','Proceso de contratación'); metrics.fieldOperations++;
      await fill(page,'#pDescription',invented.description); metrics.fieldOperations++;
      await page.locator('#projectForm button.btn.primary').click(); metrics.clickOperations++;
      await expect(page.locator('#content')).toContainText(invented.code,{timeout:10000});
      await screenshot(page,testInfo,'02-proyecto-creado');

      // Abrir expediente por la tarjeta creada.
      const card=page.locator('.project-card-premium,.project-v3,.card').filter({hasText:invented.code}).first();
      await expect(card).toBeVisible();
      await card.locator('[data-open],[data-ccx-open]').first().click(); metrics.clickOperations++;
      await expect(page.locator('#tabBody')).toBeVisible({timeout:10000});
      await screenshot(page,testInfo,'03-expediente-vacio');

      // 3) Proceso de contratación: datos y tres ofertas.
      await clickTab(page,'procurement'); metrics.clickOperations++;
      await page.locator('#editProcurement').click(); metrics.clickOperations++;
      const procM=await modalMetric(page,'Datos del proceso',metrics);
      if(procM.scrollNeeded)metrics.observations.push('Datos del proceso de contratación requieren desplazamiento vertical.');
      await fill(page,'#prDate','2026-08-20'); metrics.fieldOperations++;
      await fill(page,'#prTime','10:00'); metrics.fieldOperations++;
      await fill(page,'#prType','Cotización privada'); metrics.fieldOperations++;
      await fill(page,'#prCorp','2026-08-24'); metrics.fieldOperations++;
      await select(page,'#prStatus','Pendiente'); metrics.fieldOperations++;
      await fill(page,'#prNotes','Proceso inventado para prueba integral del sistema. Se recibieron tres ofertas en sobre cerrado.'); metrics.fieldOperations++;
      await page.locator('#procForm button.btn.primary').click(); metrics.clickOperations++;

      for(let i=0;i<invented.offers.length;i++){
        const o=invented.offers[i];
        await page.locator('#addOffer').click(); metrics.clickOperations++;
        if(i===0){const om=await modalMetric(page,'Agregar oferta',metrics);if(om.scrollNeeded)metrics.observations.push('El formulario de oferta requiere desplazamiento vertical.');}
        await fill(page,'#ofBidder',o.bidder); metrics.fieldOperations++;
        await fill(page,'#ofAmount',o.amount); metrics.fieldOperations++;
        await fill(page,'#ofCorrected',o.corrected); metrics.fieldOperations++;
        await select(page,'#ofTech','Cumple'); metrics.fieldOperations++;
        await select(page,'#ofEligible','Sí'); metrics.fieldOperations++;
        await fill(page,'#ofNotes',i===2?'Se registró una corrección aritmética en el monto evaluado.':'Oferta técnica y documentalmente admisible.'); metrics.fieldOperations++;
        await page.locator('#offerForm button.btn.primary').click(); metrics.clickOperations++;
      }
      await expect(page.locator('#tabBody')).toContainText('INGENIERÍA HORIZONTE S. DE R.L.');
      await page.locator('#editProcurement').click(); metrics.clickOperations++;
      await fill(page,'#prDecision','2026-08-25'); metrics.fieldOperations++;
      await select(page,'#prStatus','Adjudicado'); metrics.fieldOperations++;
      await fill(page,'#prRef','ACTA-CM-0825-2026'); metrics.fieldOperations++;
      await page.locator('#prFinal').selectOption({label:invented.contractor}); metrics.fieldOperations++;
      await fill(page,'#prDiff','La adjudicación coincide con la oferta elegible de menor monto corregido.'); metrics.fieldOperations++;
      await page.locator('#procForm button.btn.primary').click(); metrics.clickOperations++;
      await screenshot(page,testInfo,'04-ofertas-y-adjudicacion');

      // 4) Contrato completo con anticipo pagado. Se guarda antes de las garantías para ver el comportamiento real.
      await clickTab(page,'contract'); metrics.clickOperations++;
      await page.locator('#contractBtn').click(); metrics.clickOperations++;
      const cm=await modalMetric(page,'Registrar contrato',metrics);
      if(cm.scrollNeeded)metrics.observations.push('El formulario de contrato requiere desplazamiento vertical.');
      await fill(page,'#cNumber',invented.contractNumber); metrics.fieldOperations++;
      await fill(page,'#cContractor',invented.contractor); metrics.fieldOperations++;
      await fill(page,'#cOriginal',invented.contractAmount); metrics.fieldOperations++;
      await fill(page,'#cCurrent',invented.contractAmount); metrics.fieldOperations++;
      await fill(page,'#cSignature','2026-08-28'); metrics.fieldOperations++;
      await fill(page,'#cStart','2026-09-01'); metrics.fieldOperations++;
      await fill(page,'#cDays','100'); metrics.fieldOperations++;
      await select(page,'#cStatus','Vigente'); metrics.fieldOperations++;
      await select(page,'#cAdvanceStatus','Pagado'); metrics.fieldOperations++;
      await expect(page.locator('#cAdvPct')).toBeVisible();
      await fill(page,'#cAdvPct','15'); metrics.fieldOperations++;
      await fill(page,'#cAdvApproved',invented.advance); metrics.fieldOperations++;
      await fill(page,'#cAdvPaid',invented.advance); metrics.fieldOperations++;
      await fill(page,'#cAdvDate','2026-08-31'); metrics.fieldOperations++;
      await fill(page,'#cRecovery','80'); metrics.fieldOperations++;
      await fill(page,'#cNotes','Contrato de obra por precios unitarios. Anticipo equivalente al 15% sujeto a garantía y amortización progresiva.'); metrics.fieldOperations++;
      await page.locator('#contractForm button.btn.primary').click(); metrics.clickOperations++;
      await expect(page.locator('#tabBody')).toContainText(invented.contractNumber);
      await screenshot(page,testInfo,'05-contrato-guardado');

      // Revisar alertas contractuales inmediatamente después: el sistema permite pagar anticipo sin garantía y solo alerta luego.
      await clickTab(page,'controls'); metrics.clickOperations++;
      const controlsBefore=(await page.locator('#tabBody').innerText());
      if(/anticipo pagado.*no se ha registrado/i.test(controlsBefore))metrics.observations.push('El sistema permite guardar el anticipo como PAGADO sin registrar previamente la Garantía de Anticipo; la inconsistencia se advierte después, no se bloquea.');
      if(/no se ha registrado la Garantía de Cumplimiento/i.test(controlsBefore))metrics.observations.push('La Garantía de Cumplimiento se controla mediante alerta posterior, no como requisito previo para activar el contrato.');

      // 5) Cláusulas y controles: ingreso manual de datos contractuales.
      await page.locator('#editControls').click(); metrics.clickOperations++;
      const ctrlM=await modalMetric(page,'Cláusulas y controles',metrics);
      if(ctrlM.controls>=25)metrics.observations.push(`El formulario de cláusulas concentra ${ctrlM.controls} controles en una sola ventana; es demasiado extenso para captura cotidiana.`);
      if(ctrlM.scrollNeeded)metrics.observations.push('El formulario de cláusulas obliga a desplazarse ampliamente antes de llegar a Guardar.');
      await fill(page,'#ctObject',invented.description); metrics.fieldOperations++;
      await fill(page,'#ctFinancing','Fondos Municipales 2026'); metrics.fieldOperations++;
      await select(page,'#ctPriceType','Precios unitarios'); metrics.fieldOperations++;
      await select(page,'#ctStartMode','Después del pago/entrega del anticipo'); metrics.fieldOperations++;
      await fill(page,'#ctOrderIssued','2026-09-01'); metrics.fieldOperations++;
      await fill(page,'#ctOrderReceived','2026-09-01'); metrics.fieldOperations++;
      await fill(page,'#ctStartAfterAdvance','1'); metrics.fieldOperations++;
      await fill(page,'#ctPenaltyPct','0.18'); metrics.fieldOperations++;
      await fill(page,'#ctQualityRetention','5'); metrics.fieldOperations++;
      await fill(page,'#ctAdvG','100'); metrics.fieldOperations++;
      await fill(page,'#ctPerfG','15'); metrics.fieldOperations++;
      await fill(page,'#ctPerfMonths','3'); metrics.fieldOperations++;
      await fill(page,'#ctQualG','5'); metrics.fieldOperations++;
      await fill(page,'#ctQualDays','365'); metrics.fieldOperations++;
      await fill(page,'#ctChangeLimit','10'); metrics.fieldOperations++;
      await fill(page,'#ctAccumLimit','25'); metrics.fieldOperations++;
      await fill(page,'#ctCureDays','10'); metrics.fieldOperations++;
      await fill(page,'#ctSupervisorAuthority','Verificar calidad, cantidades ejecutadas, cumplimiento de planos y especificaciones; emitir instrucciones de campo y recomendar medidas contractuales.'); metrics.fieldOperations++;
      await fill(page,'#ctLaw','Ley de Contratación del Estado y su Reglamento, según corresponda.'); metrics.fieldOperations++;
      await fill(page,'#ctJurisdiction','Santa María, La Paz, Honduras; agotamiento de mecanismos administrativos previstos en el contrato.'); metrics.fieldOperations++;
      await fill(page,'#ctDocs','Contrato, oferta adjudicada, presupuesto, planos, especificaciones técnicas, garantías, orden de inicio, estimaciones, órdenes de cambio y bitácora.'); metrics.fieldOperations++;
      await fill(page,'#ctGeneralNotes','Datos completamente inventados para prueba operativa manual del sistema.'); metrics.fieldOperations++;
      await page.locator('#ctrlForm button.btn.primary').click(); metrics.clickOperations++;
      await screenshot(page,testInfo,'06-controles-contractuales');

      // 6) Garantía de cumplimiento.
      await clickTab(page,'guarantees'); metrics.clickOperations++;
      await page.locator('#newG').click(); metrics.clickOperations++;
      const gm=await modalMetric(page,'Garantía de cumplimiento',metrics);
      if(gm.scrollNeeded)metrics.observations.push('El formulario de garantía requiere desplazamiento vertical.');
      await select(page,'#gType','Cumplimiento'); metrics.fieldOperations++;
      await fill(page,'#gNumber','FZA-CUMP-99871'); metrics.fieldOperations++;
      await fill(page,'#gIssuer','Aseguradora Centroamericana, S.A.'); metrics.fieldOperations++;
      await fill(page,'#gBase',invented.contractAmount); metrics.fieldOperations++;
      await fill(page,'#gPct','15'); metrics.fieldOperations++;
      await fill(page,'#gStart','2026-08-28'); metrics.fieldOperations++;
      await fill(page,'#gDays','150'); metrics.fieldOperations++;
      await fill(page,'#gDoc','Póliza de cumplimiento FZA-CUMP-99871'); metrics.fieldOperations++;
      await fill(page,'#gNotes','Garantía inventada equivalente al 15% del monto contractual.'); metrics.fieldOperations++;
      await page.locator('#gForm button.btn.primary').click(); metrics.clickOperations++;

      // Garantía de anticipo.
      await page.locator('#newG').click(); metrics.clickOperations++;
      await select(page,'#gType','Anticipo'); metrics.fieldOperations++;
      await fill(page,'#gNumber','FZA-ANT-99872'); metrics.fieldOperations++;
      await fill(page,'#gIssuer','Aseguradora Centroamericana, S.A.'); metrics.fieldOperations++;
      await fill(page,'#gStart','2026-08-31'); metrics.fieldOperations++;
      await fill(page,'#gDays','120'); metrics.fieldOperations++;
      await fill(page,'#gDoc','Póliza de anticipo FZA-ANT-99872'); metrics.fieldOperations++;
      await fill(page,'#gNotes','Garantía inventada por el 100% del anticipo pagado.'); metrics.fieldOperations++;
      await page.locator('#gForm button.btn.primary').click(); metrics.clickOperations++;
      await expect(page.locator('#tabBody')).toContainText('FZA-ANT-99872');
      await screenshot(page,testInfo,'07-garantias');

      // 7) Primera estimación y pago.
      await clickTab(page,'estimates'); metrics.clickOperations++;
      await page.locator('#newEst').click(); metrics.clickOperations++;
      const em=await modalMetric(page,'Estimación y pago',metrics);
      if(em.controls>=18)metrics.observations.push(`La estimación reúne ${em.controls} controles en una sola captura; mezcla certificación, deducciones y pago en la misma ventana.`);
      if(em.scrollNeeded)metrics.observations.push('La captura de estimación/pago requiere desplazamiento vertical considerable.');
      await fill(page,'#eStart','2026-09-01'); metrics.fieldOperations++;
      await fill(page,'#eEnd','2026-09-15'); metrics.fieldOperations++;
      await fill(page,'#eGross','320000'); metrics.fieldOperations++;
      await fill(page,'#eQualityPct','5'); metrics.fieldOperations++;
      await fill(page,'#eIsrPct','12.5'); metrics.fieldOperations++;
      await fill(page,'#eOther','0'); metrics.fieldOperations++;
      await select(page,'#eStatus','Pagada'); metrics.fieldOperations++;
      await fill(page,'#ePaymentDate','2026-09-20'); metrics.fieldOperations++;
      await fill(page,'#ePaymentOrder','OP-2026-00451'); metrics.fieldOperations++;
      await fill(page,'#eInvoice','FACT-001-001-00000231'); metrics.fieldOperations++;
      await fill(page,'#eReceipt','CHK-008921'); metrics.fieldOperations++;
      await fill(page,'#eNotes','Primera estimación: excavación, instalación parcial de tubería sanitaria, relleno y preparación de subrasante.'); metrics.fieldOperations++;
      await fill(page,'#ePaymentNotes','Pago inventado para prueba. Deducciones calculadas por el sistema.'); metrics.fieldOperations++;
      await page.locator('#estForm button.btn.primary').click(); metrics.clickOperations++;
      await expect(page.locator('#tabBody')).toContainText('OP-2026-00451');
      await screenshot(page,testInfo,'08-estimacion-pago');

      // 8) Visita de obra.
      await clickTab(page,'visits'); metrics.clickOperations++;
      await page.locator('#newVisit').click(); metrics.clickOperations++;
      const vm=await modalMetric(page,'Visita de obra',metrics);
      if(vm.controls>=14)metrics.observations.push(`La visita contiene ${vm.controls} controles; para una visita desde celular conviene separar captura rápida y edición detallada.`);
      if(vm.scrollNeeded)metrics.observations.push('La visita de obra obliga a desplazarse bastante para guardar; en campo esto aumenta fricción.');
      await fill(page,'#vDate','2026-09-18'); metrics.fieldOperations++;
      await select(page,'#vType','Supervisión'); metrics.fieldOperations++;
      await select(page,'#vStatus','Con observaciones'); metrics.fieldOperations++;
      await fill(page,'#vObjective','Verificar instalación de tubería sanitaria, niveles de pozos, relleno compactado y preparación para pavimento.'); metrics.fieldOperations++;
      await fill(page,'#vPhysical','18'); metrics.fieldOperations++;
      await fill(page,'#vPersonnel','14'); metrics.fieldOperations++;
      await fill(page,'#vWeather','Soleado, terreno seco'); metrics.fieldOperations++;
      await fill(page,'#vContractorRep','Ing. Andrea López'); metrics.fieldOperations++;
      await fill(page,'#vSupervisor','Ing. Carlos Mendoza'); metrics.fieldOperations++;
      await fill(page,'#vNext','2026-09-25'); metrics.fieldOperations++;
      await fill(page,'#vActivities','Excavación de zanja, instalación de tubería PVC sanitaria, construcción de pozos de inspección, relleno por capas y conformación de subrasante.'); metrics.fieldOperations++;
      await fill(page,'#vGeneralObs','Se observó avance continuo. En un tramo el material de relleno presenta humedad superior al resto y debe verificarse compactación antes de continuar con la estructura de pavimento.'); metrics.fieldOperations++;
      await fill(page,'#vInstructions','Realizar control de compactación en el tramo observado y comprobar cotas de invert de los pozos antes de cerrar completamente la zanja.'); metrics.fieldOperations++;
      await fill(page,'#vCommitments','Contratista presentará resultados de control de compactación y corregirá cualquier tramo que no cumpla.'); metrics.fieldOperations++;
      await page.locator('#visitForm button.btn.primary').click(); metrics.clickOperations++;
      await expect(page.locator('#tabBody')).toContainText('Ing. Andrea López');
      await screenshot(page,testInfo,'09-visita-obra');

      // 9) Orden de cambio.
      await clickTab(page,'changes'); metrics.clickOperations++;
      await page.locator('#newCh').click(); metrics.clickOperations++;
      const chm=await modalMetric(page,'Orden de cambio',metrics);
      if(chm.scrollNeeded)metrics.observations.push('La orden de cambio requiere desplazamiento vertical.');
      await fill(page,'#chNumber','OC-01'); metrics.fieldOperations++;
      await fill(page,'#chDate','2026-09-22'); metrics.fieldOperations++;
      await fill(page,'#chAmount','85000'); metrics.fieldOperations++;
      await fill(page,'#chDays','10'); metrics.fieldOperations++;
      await select(page,'#chStatus','Aprobado'); metrics.fieldOperations++;
      await fill(page,'#chJust','Se incorpora un tramo adicional de colector sanitario y dos pozos de inspección por condición encontrada en campo, previa revisión técnica y autorización municipal.'); metrics.fieldOperations++;
      await page.locator('#chForm button.btn.primary').click(); metrics.clickOperations++;
      await expect(page.locator('#tabBody')).toContainText('OC-01');
      await screenshot(page,testInfo,'10-orden-cambio');

      // 10) Resumen y reportes.
      await clickTab(page,'summary'); metrics.clickOperations++;
      const summaryText=await page.locator('#tabBody').innerText();
      await screenshot(page,testInfo,'11-resumen-final');
      await clickTab(page,'reports'); metrics.clickOperations++;
      const reportCards=page.locator('.report-type-card');
      const reportCount=await reportCards.count();
      metrics.reportTypes=reportCount;
      if(reportCount>0){await reportCards.first().click(); metrics.clickOperations++; await page.waitForTimeout(300);}
      if(await page.locator('#reportPreview').count())await expect(page.locator('#reportPreview')).toBeVisible();
      await screenshot(page,testInfo,'12-informe-generado');

      // Estado final real creado por la interfaz, no inyectado.
      const finalState=await page.evaluate(()=>({
        projects:(db.projects||[]).map(p=>({id:p.id,code:p.code,name:p.name,budget:p.budget,status:p.status,procurement:p.procurement})),
        contracts:(db.contracts||[]).map(c=>({number:c.number,contractor:c.contractor,originalAmount:c.originalAmount,currentAmount:c.currentAmount,advanceStatus:c.advanceStatus,advancePaid:c.advancePaid,controls:c.controls})),
        estimates:(db.estimates||[]).map(e=>({number:e.number,gross:e.gross,advanceApplied:e.advanceApplied,qualityApplied:e.qualityApplied,isrApplied:e.isrApplied,totalDeductions:e.totalDeductions,net:e.net,status:e.status,paymentDate:e.paymentDate})),
        guarantees:(db.guarantees||[]).map(g=>({type:g.type,number:g.number,base:g.base,percentage:g.percentage,applied:g.applied,start:g.start,end:g.end})),
        changes:(db.changes||[]).map(c=>({number:c.number,type:c.type,amountDelta:c.amountDelta,daysDelta:c.daysDelta,status:c.status})),
        visits:(db.visits||[]).map(v=>({number:v.number,date:v.date,physical:v.physical,personnel:v.personnel,status:v.status,activities:v.activities,generalObservations:v.generalObservations})),
        auditCount:(db.audit||[]).length
      }));
      metrics.finalState=finalState;
      metrics.summaryText=summaryText;
      metrics.pageErrors=pageErrors;
      metrics.finishedAt=new Date().toISOString();

      // Hallazgos derivados de la cantidad de captura.
      const totalControls=metrics.modals.reduce((s,m)=>s+m.controls,0);
      const scrollModals=metrics.modals.filter(m=>m.scrollNeeded).length;
      metrics.totalModalControlsObserved=totalControls;
      metrics.scrollModals=scrollModals;
      if(scrollModals>=4)metrics.observations.push(`${scrollModals} formularios del recorrido necesitan desplazamiento vertical; la aplicación es funcional, pero la captura completa es pesada.`);
      if(metrics.fieldOperations>70)metrics.observations.push(`El escenario requirió ${metrics.fieldOperations} operaciones de llenado/selección para completar un solo expediente básico; conviene introducir flujos por etapa, autocompletado y plantillas.`);
      metrics.observations.push('Código, nombre y contrato sí se reutilizan automáticamente dentro del expediente, lo cual evita repetir esos datos en ofertas, contrato, estimaciones, garantías y visitas.');

      const out=testInfo.outputPath(`manual-simulation-${vp.name}.json`);
      fs.writeFileSync(out,JSON.stringify(metrics,null,2));

      expect(finalState.projects).toHaveLength(1);
      expect(finalState.contracts).toHaveLength(1);
      expect(finalState.estimates).toHaveLength(1);
      expect(finalState.guarantees).toHaveLength(2);
      expect(finalState.changes).toHaveLength(1);
      expect(finalState.visits).toHaveLength(1);
      expect(finalState.projects[0].procurement.offers).toHaveLength(3);
      expect(pageErrors,`Errores JavaScript: ${pageErrors.join(' | ')}`).toEqual([]);
    });
  });
}
