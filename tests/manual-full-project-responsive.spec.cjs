const { test, expect } = require('@playwright/test');
const fs=require('fs');

const APP_URL=process.env.APP_URL||'http://127.0.0.1:4173/';
const USER_ID='c1111111-1111-4111-8111-111111111111';
const WORKSPACE_ID='c2222222-2222-4222-8222-222222222222';
const STORE='control_contractual_independiente_v3';
const P={
 code:'COT121799-2026',
 name:'CONSTRUCCIÓN DE ALCANTARILLADO SANITARIO Y PAVIMENTO, BARRIO LA ESPERANZA',
 location:'Barrio La Esperanza, Santa María, La Paz',
 budget:1850000,
 description:'Construcción de red de alcantarillado sanitario, pozos de inspección, conexiones domiciliarias, mejoramiento de drenaje y pavimento de concreto hidráulico en calles del Barrio La Esperanza.',
 contractor:'INGENIERÍA HORIZONTE S. DE R.L.',contract:1770000,advance:265500,
 offers:[
  ['CONSTRUCTORA VALLE VERDE S. DE R.L.',1819250.40,1819250.40],
  ['INGENIERÍA HORIZONTE S. DE R.L.',1770000,1770000],
  ['INVERSIONES CAMINO REAL S. DE R.L.',1846380.75,1846010.75]
 ]
};
const EMPTY={users:[],projects:[],contracts:[],estimates:[],guarantees:[],changes:[],payments:[],visits:[],audit:[],durationLearning:[]};

async function mock(page){
 await page.route('https://flethujkrharehjikwgj.supabase.co/**',async r=>{
  const p=new URL(r.request().url()).pathname;let body=[];
  if(p.includes('/functions/v1/secure-login'))body={user:{id:USER_ID,email:'supervisor.prueba@example.com'},access_token:'manual-token',refresh_token:'manual-refresh',expires_in:3600,security_session_id:'manual-session',device_label:'Chrome QA',mfa_required:false,mfa_enrollment_required:false};
  else if(p.includes('/auth/v1/token'))body={user:{id:USER_ID,email:'supervisor.prueba@example.com'},access_token:'manual-token',refresh_token:'manual-refresh',expires_in:3600};
  else if(p.includes('/rest/v1/workspace_members'))body=[{workspace_id:WORKSPACE_ID,role:'admin',active:true}];
  else if(p.includes('/rest/v1/profiles'))body=[{full_name:'Ing. Carlos Mendoza',active:true,must_change_password:false}];
  else if(p.includes('/rest/v1/app_state'))body=[{data:EMPTY,version:1,updated_at:'2026-09-03T20:00:00Z'}];
  else if(p.includes('/rest/v1/rpc/get_control_center'))body={summary:{projects_total:0,projects_execution:0,projects_finalized:0,projects_pre_execution:0,portfolio_amount:0,execution_amount:0,execution_estimated:0,execution_paid:0,paid_total:0,execution_progress_pct:0,active_alerts:0,budget_projects:0,budget_available:0,critical_projects:0},projects:[],alerts:[],attention:[],reconciliation:[],audit:{total_events:0,integrity_ok:0,integrity_failures:0}};
  else if(p.includes('/rest/v1/rpc/save_app_state'))body=[{saved:true,new_version:2}];
  else if(p.includes('/rest/v1/access_requests'))body=[];
  else if(p.includes('/functions/v1/manage-users'))body={ok:true,revoked:false};
  else if(p.includes('/auth/v1/logout'))body={};
  await r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
 });
}
async function fill(page,s,v,m){const x=page.locator(s);await expect(x,`Campo ${s}`).toBeVisible();await x.fill(String(v));m.fields++;}
async function sel(page,s,label,m){const x=page.locator(s);await expect(x,`Selector ${s}`).toBeVisible();await x.selectOption({label}).catch(()=>x.selectOption(label));m.fields++;}
async function click(page,s,m){const x=page.locator(s).first();await expect(x,`Botón ${s}`).toBeVisible();await x.click();m.clicks++;}
async function tab(page,id,m){await click(page,`button[data-tab="${id}"]`,m);await expect(page.locator('#tabBody')).toBeVisible();m.stage=`Pestaña ${id}`;}
async function shot(page,ti,name){await page.screenshot({path:ti.outputPath(`${name}.png`),fullPage:true});}
async function modal(page,name,m){const x=page.locator('.modal').last();await expect(x).toBeVisible();const d=await x.evaluate(el=>{const c=[...el.querySelectorAll('input,select,textarea')].filter(n=>n.type!=='hidden');const box=el.querySelector('.modal-box')||el;return{controls:c.length,required:c.filter(n=>n.required).length,scroll:box.scrollHeight>box.clientHeight+4,scrollHeight:box.scrollHeight,clientHeight:box.clientHeight}});m.modals.push({name,...d});return d;}
function stateFromStorage(){try{return JSON.parse(localStorage.getItem('control_contractual_independiente_v3')||'{}')}catch{return{}}}

test.use({viewport:{width:1366,height:768}});
test('simulación manual integral de un proyecto municipal inventado',async({page},ti)=>{
 test.setTimeout(180000);
 const m={project:P,stage:'inicio',fields:0,clicks:0,modals:[],findings:[],pages:[],errors:[],startedAt:new Date().toISOString()};
 page.on('pageerror',e=>m.errors.push(e.message));
 await mock(page);
 try{
  await page.goto(APP_URL,{waitUntil:'domcontentloaded',timeout:30000});
  await expect(page.locator('#authForm')).toBeVisible();
  await fill(page,'#authEmail','supervisor.prueba@example.com',m);await fill(page,'#authPass','Prueba-Segura-2026!',m);await click(page,'#authSubmit',m);
  await expect(page.locator('#ccSidebar')).toBeVisible({timeout:20000});await shot(page,ti,'01-inicio-sin-proyectos');m.pages.push('Inicio vacío');

  // CREACIÓN DEL PROYECTO
  await click(page,'[data-command="project"],#newProjectBtn',m);m.stage='Nuevo proyecto';await modal(page,'Nuevo proyecto',m);
  await fill(page,'#pCode',P.code,m);await fill(page,'#pName',P.name,m);await fill(page,'#pLocation',P.location,m);await sel(page,'#pType','Obra',m);await fill(page,'#pBudget',P.budget,m);await fill(page,'#pStart','2026-09-01',m);await fill(page,'#pDays','100',m);await sel(page,'#pStatus','Proceso de contratación',m);await fill(page,'#pDescription',P.description,m);await click(page,'#projectForm button.btn.primary',m);
  await expect(page.locator('body')).toContainText(P.code);await shot(page,ti,'02-proyecto-guardado-pero-en-inicio');
  const stillHome=await page.locator('#ccSidebar [data-route="inicio"].active').count();
  if(stillHome){m.findings.push('Al guardar un proyecto nuevo, el sistema permanece en Inicio. Para continuar el expediente hay que entrar otra vez a Proyectos: paso extra innecesario.');}
  await click(page,'#ccSidebar [data-route="proyectos"]',m);await expect(page.locator('#content')).toContainText(P.code);
  await click(page,'#content [data-open],#content [data-ccx-open]',m);await expect(page.locator('#tabBody')).toBeVisible();await shot(page,ti,'03-expediente-nuevo');

  // PROCESO Y OFERTAS
  await tab(page,'procurement',m);await click(page,'#editProcurement',m);await modal(page,'Datos del proceso',m);
  await fill(page,'#prDate','2026-08-20',m);await fill(page,'#prTime','10:00',m);await fill(page,'#prType','Cotización privada',m);await fill(page,'#prCorp','2026-08-24',m);await sel(page,'#prStatus','Pendiente',m);await fill(page,'#prNotes','Proceso inventado para prueba integral. Se recibieron tres ofertas en sobre cerrado.',m);await click(page,'#procForm button.btn.primary',m);
  for(let i=0;i<P.offers.length;i++){
   const [bid,amount,corr]=P.offers[i];await click(page,'#addOffer',m);if(i===0)await modal(page,'Oferente no invitado',m);await fill(page,'#ccOfBidder',bid,m);await fill(page,'#ccOfAmount',amount,m);await fill(page,'#ccOfCorrected',corr,m);await sel(page,'#ccOfTech','Cumple',m);await sel(page,'#ccOfEligible','Sí',m);await fill(page,'#ccOfNotes',i===2?'Corrección aritmética registrada en el monto evaluado.':'Oferta técnica y documentalmente admisible.',m);await click(page,'#ccLinkedOfferForm button.btn.primary',m);
  }
  await expect(page.locator('#tabBody')).toContainText(P.contractor);await click(page,'#editProcurement',m);await fill(page,'#prDecision','2026-08-25',m);await sel(page,'#prStatus','Adjudicado',m);await fill(page,'#prRef','ACTA-CM-0825-2026',m);await page.locator('#prFinal').selectOption({label:P.contractor});m.fields++;await fill(page,'#prDiff','La adjudicación coincide con la oferta elegible de menor monto corregido.',m);await click(page,'#procForm button.btn.primary',m);await shot(page,ti,'04-ofertas-y-adjudicacion');

  // CONTRATO + CONTROL PREVENTIVO DEL PAGO DE ANTICIPO
  await tab(page,'contract',m);await click(page,'#contractBtn',m);await modal(page,'Registrar contrato',m);
  await fill(page,'#cNumber','CONTRATO-COT121799-2026',m);await fill(page,'#cContractor',P.contractor,m);await fill(page,'#cOriginal',P.contract,m);await expect(page.locator('#cCurrent')).toHaveValue(String(P.contract));await expect(page.locator('#cCurrent')).toHaveAttribute('readonly','');await fill(page,'#cSignature','2026-08-28',m);await fill(page,'#cStart','2026-09-01',m);await fill(page,'#cDays','100',m);await sel(page,'#cStatus','Vigente',m);await sel(page,'#cAdvanceStatus','Pagado',m);
  await fill(page,'#cAdvPct','15',m);await fill(page,'#cAdvApproved',P.advance,m);await fill(page,'#cAdvPaid',P.advance,m);await fill(page,'#cAdvDate','2026-08-31',m);await fill(page,'#cRecovery','80',m);await fill(page,'#cNotes','Contrato por precios unitarios. Anticipo del 15% sujeto a garantía y amortización progresiva.',m);
  await click(page,'#contractForm button.btn.primary',m);
  await expect(page.locator('.toast').last()).toContainText(/genera el contrato y la nota de remisión/i);
  await expect(page.locator('#contractForm')).toBeVisible();
  expect(await page.evaluate(()=>Array.isArray(window.db?.contracts)&&window.db.contracts.some(c=>c.number==='CONTRATO-COT121799-2026')),'el intento inseguro no debe crear el contrato como pagado').toBe(false);
  m.findings.push('Control preventivo verificado: el sistema bloquea registrar el anticipo como PAGADO antes de que exista el contrato y se generen contrato/nota de remisión.');
  await sel(page,'#cAdvanceStatus','Aprobado',m);await fill(page,'#cAdvPct','15',m);await fill(page,'#cAdvApproved',P.advance,m);await fill(page,'#cRecovery','80',m);await click(page,'#contractForm button.btn.primary',m);
  await expect(page.locator('#tabBody')).toContainText('CONTRATO-COT121799-2026');await shot(page,ti,'05-contrato-con-anticipo-aprobado');
  await tab(page,'controls',m);const alertText=await page.locator('#tabBody').innerText();
  if(/no se ha registrado la Garantía de Cumplimiento/i.test(alertText))m.findings.push('El contrato vigente sin Garantía de Cumplimiento queda identificado mediante alerta contractual hasta registrar la garantía.');

  // CLÁUSULAS Y CONTROLES
  await click(page,'#editControls',m);const ctl=await modal(page,'Cláusulas y controles',m);if(ctl.controls>=25)m.findings.push(`Cláusulas y controles concentra ${ctl.controls} campos en una sola ventana: demasiada captura de una vez.`);
  await fill(page,'#ctObject',P.description,m);await fill(page,'#ctFinancing','Fondos Municipales 2026',m);await sel(page,'#ctPriceType','Precios unitarios',m);await sel(page,'#ctStartMode','Después del pago/entrega del anticipo',m);await fill(page,'#ctOrderIssued','2026-09-01',m);await fill(page,'#ctOrderReceived','2026-09-01',m);await fill(page,'#ctStartAfterAdvance','1',m);await fill(page,'#ctPenaltyPct','0.18',m);await fill(page,'#ctQualityRetention','5',m);await fill(page,'#ctAdvG','100',m);await fill(page,'#ctPerfG','15',m);await fill(page,'#ctPerfMonths','3',m);await fill(page,'#ctQualG','5',m);await fill(page,'#ctQualDays','365',m);await fill(page,'#ctChangeLimit','10',m);await fill(page,'#ctAccumLimit','25',m);await fill(page,'#ctCureDays','10',m);await fill(page,'#ctSupervisorAuthority','Verificar calidad, cantidades, planos, especificaciones e instrucciones de campo.',m);await fill(page,'#ctLaw','Ley de Contratación del Estado y su Reglamento, según corresponda.',m);await fill(page,'#ctJurisdiction','Santa María, La Paz, Honduras.',m);await fill(page,'#ctDocs','Contrato, oferta, presupuesto, planos, especificaciones, garantías, orden de inicio, estimaciones, cambios y bitácora.',m);await fill(page,'#ctGeneralNotes','Datos inventados para simulación integral.',m);await click(page,'#ctrlForm button.btn.primary',m);await shot(page,ti,'06-controles-contractuales');

  // GARANTÍAS
  await tab(page,'guarantees',m);await click(page,'#newG',m);await modal(page,'Garantía de cumplimiento',m);await sel(page,'#gType','Cumplimiento',m);await fill(page,'#gNumber','FZA-CUMP-99871',m);await fill(page,'#gIssuer','Aseguradora Centroamericana, S.A.',m);await fill(page,'#gBase',P.contract,m);await fill(page,'#gPct','15',m);await fill(page,'#gStart','2026-08-28',m);await fill(page,'#gDays','150',m);await fill(page,'#gDoc','Póliza de cumplimiento FZA-CUMP-99871',m);await fill(page,'#gNotes','Garantía equivalente al 15% del contrato.',m);await click(page,'#gForm button.btn.primary',m);
  await click(page,'#newG',m);await sel(page,'#gType','Anticipo',m);await fill(page,'#gNumber','FZA-ANT-99872',m);await fill(page,'#gIssuer','Aseguradora Centroamericana, S.A.',m);await fill(page,'#gStart','2026-08-31',m);await fill(page,'#gDays','120',m);await fill(page,'#gDoc','Póliza de anticipo FZA-ANT-99872',m);await fill(page,'#gNotes','Garantía por el 100% del anticipo.',m);await click(page,'#gForm button.btn.primary',m);await expect(page.locator('#tabBody')).toContainText('FZA-ANT-99872');await shot(page,ti,'07-garantias');

  // ESTIMACIÓN Y PAGO
  await tab(page,'estimates',m);await click(page,'#newEst',m);const est=await modal(page,'Estimación y pago',m);if(est.controls>=18)m.findings.push(`La captura de estimación/pago reúne ${est.controls} campos y mezcla certificación, deducciones y pago en una sola ventana.`);
  await fill(page,'#eStart','2026-09-01',m);await fill(page,'#eEnd','2026-09-15',m);await fill(page,'#eGross','320000',m);await fill(page,'#eQualityPct','5',m);await fill(page,'#eIsrPct','12.5',m);await fill(page,'#eOther','0',m);await sel(page,'#eStatus','Pagada',m);await fill(page,'#ePaymentDate','2026-09-20',m);await fill(page,'#ePaymentOrder','OP-2026-00451',m);await fill(page,'#eInvoice','FACT-001-001-00000231',m);await fill(page,'#eReceipt','CHK-008921',m);await fill(page,'#eNotes','Primera estimación: excavación, tubería sanitaria, relleno y subrasante.',m);await fill(page,'#ePaymentNotes','Pago inventado. Deducciones calculadas por el sistema.',m);await click(page,'#estForm button.btn.primary',m);await expect(page.locator('#tabBody')).toContainText('OP-2026-00451');await shot(page,ti,'08-estimacion-y-pago');

  // VISITA DE OBRA
  await tab(page,'visits',m);await click(page,'#newVisit',m);const vis=await modal(page,'Visita de obra',m);if(vis.controls>=14)m.findings.push(`La visita de obra contiene ${vis.controls} campos; para uso en campo conviene una captura rápida y luego detalle opcional.`);
  await fill(page,'#vDate','2026-09-18',m);await sel(page,'#vType','Supervisión',m);
  const visitStatus=page.locator('#vStatus');await expect(visitStatus,'El estado de visita debe ser calculado por observaciones, no capturado manualmente').toBeDisabled();await expect(visitStatus).toHaveAttribute('title',/estado se determina por las observaciones/i);
  await fill(page,'#vObjective','Verificar tubería sanitaria, pozos, relleno compactado y preparación para pavimento.',m);await fill(page,'#vPhysical','18',m);await fill(page,'#vPersonnel','14',m);await fill(page,'#vWeather','Soleado, terreno seco',m);await fill(page,'#vContractorRep','Ing. Andrea López',m);await fill(page,'#vSupervisor','Ing. Carlos Mendoza',m);await fill(page,'#vNext','2026-09-25',m);await fill(page,'#vActivities','Excavación, instalación de tubería PVC, pozos, relleno por capas y subrasante.',m);await fill(page,'#vGeneralObs','Un tramo presenta mayor humedad; verificar compactación antes de continuar pavimento.',m);await fill(page,'#vInstructions','Realizar control de compactación y comprobar cotas de invert.',m);await fill(page,'#vCommitments','Contratista presentará controles y corregirá tramos que no cumplan.',m);await click(page,'#visitForm button.btn.primary',m);
  await expect(page.locator('#tabBody')).toContainText('18/09/2026');await expect(page.locator('#tabBody')).toContainText('Supervisión');await expect(page.locator('#tabBody')).toContainText('18.00%');await expect(page.locator('#tabBody')).toContainText('Abierta');await shot(page,ti,'09-visita-de-obra');

  // ORDEN DE CAMBIO
  await tab(page,'changes',m);await click(page,'#newCh',m);await modal(page,'Orden de cambio',m);await fill(page,'#chNumber','OC-01',m);await fill(page,'#chDate','2026-09-22',m);await fill(page,'#chAmount','85000',m);await fill(page,'#chDays','10',m);await sel(page,'#chStatus','Aprobado',m);await fill(page,'#chDocumentRef','ACTA-OC-01-2026 / Resolución de aprobación municipal',m);await fill(page,'#chJust','Tramo adicional de colector y dos pozos por condición encontrada en campo, con revisión técnica municipal.',m);await click(page,'#chForm button.btn.primary',m);await expect(page.locator('#tabBody')).toContainText('OC-01');await shot(page,ti,'10-orden-de-cambio');

  // RESUMEN E INFORME
  await tab(page,'summary',m);await shot(page,ti,'11-resumen-final');await tab(page,'reports',m);const cards=page.locator('.report-type-card');m.reportTypes=await cards.count();if(m.reportTypes){await cards.first().click();m.clicks++;await page.waitForTimeout(250);}if(await page.locator('#reportPreview').count())await expect(page.locator('#reportPreview')).toBeVisible();await shot(page,ti,'12-informe');
  m.stage='completado';
 }catch(e){m.failure=String(e&&e.stack||e);throw e;
 }finally{
  m.finishedAt=new Date().toISOString();
  try{m.stored=await page.evaluate(stateFromStorage);}catch{}
  m.scrollModals=m.modals.filter(x=>x.scroll).length;m.totalModalControls=m.modals.reduce((a,x)=>a+x.controls,0);
  if(m.scrollModals>=4)m.findings.push(`${m.scrollModals} formularios del recorrido necesitan desplazamiento vertical; la captura es pesada.`);
  if(m.fields>70)m.findings.push(`Hasta la etapa alcanzada se realizaron ${m.fields} operaciones de llenado/selección; el expediente exige demasiada captura manual.`);
  m.findings.push('La reutilización automática del proyecto dentro del expediente es positiva: evita volver a escribir el código/nombre en cada módulo.');
  fs.writeFileSync(ti.outputPath('manual-full-project-metrics.json'),JSON.stringify(m,null,2));
 }
});
