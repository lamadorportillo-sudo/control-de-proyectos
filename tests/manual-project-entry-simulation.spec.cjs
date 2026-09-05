const { test, expect } = require('@playwright/test');
const fs = require('fs');

const APP_URL = process.env.APP_URL || 'http://127.0.0.1:4173/';
const USER_ID = 'b1111111-1111-4111-8111-111111111111';
const WORKSPACE_ID = 'b2222222-2222-4222-8222-222222222222';

const invented = {
  code: 'COT121799-2026',
  name: 'CONSTRUCCIÓN DE ALCANTARILLADO SANITARIO Y PAVIMENTO, BARRIO LA ESPERANZA',
  location: 'Barrio La Esperanza, Santa María, La Paz',
  budget: 1850000,
  description: 'Construcción de red de alcantarillado sanitario, pozos de inspección, conexiones domiciliarias, mejoramiento de drenaje y pavimento de concreto hidráulico en calles del Barrio La Esperanza.',
  contractor: 'INGENIERÍA HORIZONTE S. DE R.L.',
  contractNumber: 'CONTRATO-COT121799-2026',
  contractAmount: 1770000,
  advance: 265500,
  offers: [
    ['CONSTRUCTORA VALLE VERDE S. DE R.L.',1819250.40,1819250.40],
    ['INGENIERÍA HORIZONTE S. DE R.L.',1770000,1770000],
    ['INVERSIONES CAMINO REAL S. DE R.L.',1846380.75,1846010.75],
  ],
};

const emptyState={users:[],projects:[],contracts:[],estimates:[],guarantees:[],changes:[],payments:[],visits:[],audit:[],durationLearning:[]};

function emptyControlCenter(){
  return {summary:{projects_total:0,projects_execution:0,projects_finalized:0,projects_pre_execution:0,portfolio_amount:0,execution_amount:0,execution_estimated:0,execution_paid:0,paid_total:0,execution_progress_pct:0,active_alerts:0,budget_projects:0,budget_available:0,critical_projects:0},projects:[],alerts:[],attention:[],reconciliation:[],audit:{total_events:0,integrity_ok:0,integrity_failures:0}};
}

async function mockBackend(page){
  await page.route('https://flethujkrharehjikwgj.supabase.co/**',async route=>{
    const p=new URL(route.request().url()).pathname;let body=[];
    if(p.includes('/functions/v1/secure-login'))body={user:{id:USER_ID,email:'supervisor.prueba@example.com'},access_token:'manual-test-token',refresh_token:'manual-refresh-token',expires_in:3600,security_session_id:'manual-security-session',device_label:'Chrome manual',mfa_required:false,mfa_enrollment_required:false};
    else if(p.includes('/auth/v1/token'))body={user:{id:USER_ID,email:'supervisor.prueba@example.com'},access_token:'manual-test-token',refresh_token:'manual-refresh-token',expires_in:3600};
    else if(p.includes('/rest/v1/workspace_members'))body=[{workspace_id:WORKSPACE_ID,role:'admin',active:true}];
    else if(p.includes('/rest/v1/profiles'))body=[{full_name:'Ing. Carlos Mendoza',active:true,must_change_password:false}];
    else if(p.includes('/rest/v1/app_state'))body=[{data:emptyState,version:1,updated_at:'2026-09-03T20:00:00Z'}];
    else if(p.includes('/rest/v1/rpc/get_control_center'))body=emptyControlCenter();
    else if(p.includes('/rest/v1/rpc/save_app_state'))body=[{saved:true,new_version:2}];
    else if(p.includes('/rest/v1/access_requests'))body=[];
    else if(p.includes('/functions/v1/manage-users'))body={ok:true,revoked:false};
    else if(p.includes('/auth/v1/logout'))body={};
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
  });
}

async function fill(page,selector,value,metrics){const el=page.locator(selector);await expect(el,`Campo ${selector}`).toBeVisible({timeout:12000});await el.fill(String(value));metrics.fields++;}
async function sel(page,selector,label,metrics){const el=page.locator(selector);await expect(el,`Selector ${selector}`).toBeVisible({timeout:12000});await el.selectOption({label}).catch(()=>el.selectOption(label));metrics.fields++;}
async function click(page,selector,metrics){const el=page.locator(selector).first();await expect(el,`Botón ${selector}`).toBeVisible({timeout:12000});await el.click();metrics.clicks++;}
async function tab(page,id,metrics){await click(page,`button[data-tab="${id}"]`,metrics);await expect(page.locator('#tabBody')).toBeVisible({timeout:12000});metrics.stage=`Pestaña ${id}`;}
async function shot(page,ti,name){await page.screenshot({path:ti.outputPath(`${name}.png`),fullPage:true});}
async function modalMetric(page,name,metrics){const el=page.locator('.modal').last();await expect(el).toBeVisible({timeout:12000});const d=await el.evaluate(node=>{const controls=[...node.querySelectorAll('input,select,textarea')].filter(x=>x.type!=='hidden');return{controls:controls.length,required:controls.filter(x=>x.required).length,scrollNeeded:node.scrollHeight>node.clientHeight+4}});metrics.modals.push({name,...d});return d;}
async function ensureProjectOpen(page,metrics){
  if(await page.locator('#tabBody').isVisible().catch(()=>false)){
    await expect(page.locator('body')).toContainText(invented.code);
    return;
  }
  const projectsRoute=page.locator('#ccSidebar [data-route="proyectos"]');
  if(await projectsRoute.count())await click(page,'#ccSidebar [data-route="proyectos"]',metrics);
  await expect(page.locator('#content')).toContainText(invented.code,{timeout:12000});
  await click(page,'#content [data-open],#content [data-ccx-open]',metrics);
  await expect(page.locator('#tabBody')).toBeVisible({timeout:12000});
}

for(const vp of [{name:'desktop',width:1366,height:768},{name:'tablet',width:1024,height:768}]){
  test.describe(`simulación manual completa ${vp.name}`,()=>{
    test.use({viewport:{width:vp.width,height:vp.height}});
    test('crea y opera un proyecto inventado desde cero, campo por campo',async({page},testInfo)=>{
      test.setTimeout(180000);
      const metrics={viewport:vp,stage:'inicio',fields:0,clicks:0,modals:[],observations:[],errors:[],startedAt:new Date().toISOString()};
      page.on('pageerror',e=>metrics.errors.push(e.message));
      await mockBackend(page);

      await page.goto(APP_URL,{waitUntil:'domcontentloaded',timeout:30000});
      await expect(page.locator('#authForm')).toBeVisible();
      await fill(page,'#authEmail','supervisor.prueba@example.com',metrics);await fill(page,'#authPass','Prueba-Segura-2026!',metrics);await click(page,'#authSubmit',metrics);
      await expect(page.locator('#ccSidebar')).toBeVisible({timeout:20000});

      await click(page,'[data-command="project"],#newProjectBtn',metrics);await modalMetric(page,'Nuevo proyecto',metrics);
      await fill(page,'#pCode',invented.code,metrics);await fill(page,'#pName',invented.name,metrics);await fill(page,'#pLocation',invented.location,metrics);await sel(page,'#pType','Obra',metrics);await fill(page,'#pBudget',invented.budget,metrics);await fill(page,'#pStart','2026-09-01',metrics);await fill(page,'#pDays','100',metrics);await sel(page,'#pStatus','Proceso de contratación',metrics);await fill(page,'#pDescription',invented.description,metrics);await click(page,'#projectForm button.btn.primary',metrics);
      await ensureProjectOpen(page,metrics);await shot(page,testInfo,'01-expediente-creado');

      await tab(page,'procurement',metrics);await click(page,'#editProcurement',metrics);await modalMetric(page,'Datos del proceso',metrics);
      await fill(page,'#prDate','2026-08-20',metrics);await fill(page,'#prTime','10:00',metrics);await fill(page,'#prType','Cotización privada',metrics);await fill(page,'#prCorp','2026-08-24',metrics);await sel(page,'#prStatus','Pendiente',metrics);await fill(page,'#prNotes','Proceso inventado para prueba integral. Se recibieron tres ofertas en sobre cerrado.',metrics);await click(page,'#procForm button.btn.primary',metrics);
      for(let i=0;i<invented.offers.length;i++){
        const [bid,amount,corrected]=invented.offers[i];await click(page,'#addOffer',metrics);if(i===0)await modalMetric(page,'Oferta',metrics);await fill(page,'#ccOfBidder',bid,metrics);await fill(page,'#ccOfAmount',amount,metrics);await fill(page,'#ccOfCorrected',corrected,metrics);await sel(page,'#ccOfTech','Cumple',metrics);await sel(page,'#ccOfEligible','Sí',metrics);await fill(page,'#ccOfNotes',i===2?'Corrección aritmética registrada en el monto evaluado.':'Oferta técnica y documentalmente admisible.',metrics);await click(page,'#ccLinkedOfferForm button.btn.primary',metrics);
      }
      await expect(page.locator('#tabBody')).toContainText(invented.contractor);await click(page,'#editProcurement',metrics);await fill(page,'#prDecision','2026-08-25',metrics);await sel(page,'#prStatus','Adjudicado',metrics);await fill(page,'#prRef','ACTA-CM-0825-2026',metrics);await page.locator('#prFinal').selectOption({label:invented.contractor});metrics.fields++;await fill(page,'#prDiff','La adjudicación coincide con la oferta elegible de menor monto corregido.',metrics);await click(page,'#procForm button.btn.primary',metrics);

      await tab(page,'contract',metrics);await click(page,'#contractBtn',metrics);await modalMetric(page,'Registrar contrato',metrics);
      await fill(page,'#cNumber',invented.contractNumber,metrics);await fill(page,'#cContractor',invented.contractor,metrics);await fill(page,'#cOriginal',invented.contractAmount,metrics);await expect(page.locator('#cCurrent')).toHaveValue(String(invented.contractAmount));await expect(page.locator('#cCurrent')).toHaveAttribute('readonly','');await fill(page,'#cSignature','2026-08-28',metrics);await fill(page,'#cStart','2026-09-01',metrics);await fill(page,'#cDays','100',metrics);await sel(page,'#cStatus','Vigente',metrics);await sel(page,'#cAdvanceStatus','Pagado',metrics);await fill(page,'#cAdvPct','15',metrics);await fill(page,'#cAdvApproved',invented.advance,metrics);await fill(page,'#cAdvPaid',invented.advance,metrics);await fill(page,'#cAdvDate','2026-08-31',metrics);await fill(page,'#cRecovery','80',metrics);await fill(page,'#cNotes','Contrato por precios unitarios. Anticipo del 15% sujeto a garantía y amortización progresiva.',metrics);await click(page,'#contractForm button.btn.primary',metrics);
      await expect(page.locator('.toast').last()).toContainText(/genera el contrato y la nota de remisión/i);await expect(page.locator('#contractForm')).toBeVisible();
      expect(await page.evaluate(n=>Array.isArray(window.db?.contracts)&&window.db.contracts.some(c=>c.number===n),invented.contractNumber)).toBe(false);
      metrics.observations.push('El pago inseguro del anticipo fue bloqueado antes de crear el contrato.');
      await sel(page,'#cAdvanceStatus','Aprobado',metrics);await fill(page,'#cAdvPct','15',metrics);await fill(page,'#cAdvApproved',invented.advance,metrics);await fill(page,'#cRecovery','80',metrics);await click(page,'#contractForm button.btn.primary',metrics);await expect(page.locator('#tabBody')).toContainText(invented.contractNumber);

      await tab(page,'controls',metrics);await click(page,'#editControls',metrics);await modalMetric(page,'Cláusulas y controles',metrics);
      await fill(page,'#ctObject',invented.description,metrics);await fill(page,'#ctFinancing','Fondos Municipales 2026',metrics);await sel(page,'#ctPriceType','Precios unitarios',metrics);await sel(page,'#ctStartMode','Después del pago/entrega del anticipo',metrics);await fill(page,'#ctOrderIssued','2026-09-01',metrics);await fill(page,'#ctOrderReceived','2026-09-01',metrics);await fill(page,'#ctStartAfterAdvance','1',metrics);await fill(page,'#ctPenaltyPct','0.18',metrics);await fill(page,'#ctQualityRetention','5',metrics);await fill(page,'#ctAdvG','100',metrics);await fill(page,'#ctPerfG','15',metrics);await fill(page,'#ctPerfMonths','3',metrics);await fill(page,'#ctQualG','5',metrics);await fill(page,'#ctQualDays','365',metrics);await fill(page,'#ctChangeLimit','10',metrics);await fill(page,'#ctAccumLimit','25',metrics);await fill(page,'#ctCureDays','10',metrics);await fill(page,'#ctSupervisorAuthority','Verificar calidad, cantidades, planos, especificaciones e instrucciones de campo.',metrics);await fill(page,'#ctLaw','Ley de Contratación del Estado y su Reglamento, según corresponda.',metrics);await fill(page,'#ctJurisdiction','Santa María, La Paz, Honduras.',metrics);await fill(page,'#ctDocs','Contrato, oferta, presupuesto, planos, especificaciones, garantías, orden de inicio, estimaciones, cambios y bitácora.',metrics);await fill(page,'#ctGeneralNotes','Datos inventados para simulación integral.',metrics);await click(page,'#ctrlForm button.btn.primary',metrics);

      await tab(page,'guarantees',metrics);await click(page,'#newG',metrics);await modalMetric(page,'Garantía',metrics);await sel(page,'#gType','Cumplimiento',metrics);await fill(page,'#gNumber','FZA-CUMP-99871',metrics);await fill(page,'#gIssuer','Aseguradora Centroamericana, S.A.',metrics);await fill(page,'#gBase',invented.contractAmount,metrics);await fill(page,'#gPct','15',metrics);await fill(page,'#gStart','2026-08-28',metrics);await fill(page,'#gDays','150',metrics);await fill(page,'#gDoc','Póliza de cumplimiento FZA-CUMP-99871',metrics);await fill(page,'#gNotes','Garantía equivalente al 15% del contrato.',metrics);await click(page,'#gForm button.btn.primary',metrics);
      await click(page,'#newG',metrics);await sel(page,'#gType','Anticipo',metrics);await fill(page,'#gNumber','FZA-ANT-99872',metrics);await fill(page,'#gIssuer','Aseguradora Centroamericana, S.A.',metrics);await fill(page,'#gStart','2026-08-31',metrics);await fill(page,'#gDays','120',metrics);await fill(page,'#gDoc','Póliza de anticipo FZA-ANT-99872',metrics);await fill(page,'#gNotes','Garantía por el 100% del anticipo.',metrics);await click(page,'#gForm button.btn.primary',metrics);await expect(page.locator('#tabBody')).toContainText('FZA-ANT-99872');

      await tab(page,'estimates',metrics);await click(page,'#newEst',metrics);await modalMetric(page,'Estimación y pago',metrics);await fill(page,'#eStart','2026-09-01',metrics);await fill(page,'#eEnd','2026-09-15',metrics);await fill(page,'#eGross','320000',metrics);await fill(page,'#eQualityPct','5',metrics);await fill(page,'#eIsrPct','12.5',metrics);await fill(page,'#eOther','0',metrics);await sel(page,'#eStatus','Pagada',metrics);await fill(page,'#ePaymentDate','2026-09-20',metrics);await fill(page,'#ePaymentOrder','OP-2026-00451',metrics);await fill(page,'#eInvoice','FACT-001-001-00000231',metrics);await fill(page,'#eReceipt','CHK-008921',metrics);await fill(page,'#eNotes','Primera estimación: excavación, tubería sanitaria, relleno y subrasante.',metrics);await fill(page,'#ePaymentNotes','Pago inventado. Deducciones calculadas por el sistema.',metrics);await click(page,'#estForm button.btn.primary',metrics);await expect(page.locator('#tabBody')).toContainText('OP-2026-00451');

      await tab(page,'visits',metrics);await click(page,'#newVisit',metrics);await modalMetric(page,'Visita de obra',metrics);await fill(page,'#vDate','2026-09-18',metrics);await sel(page,'#vType','Supervisión',metrics);const visitStatus=page.locator('#vStatus');await expect(visitStatus).toBeDisabled();await expect(visitStatus).toHaveAttribute('title',/estado se determina por las observaciones/i);await fill(page,'#vObjective','Verificar tubería sanitaria, pozos, relleno compactado y preparación para pavimento.',metrics);await fill(page,'#vPhysical','18',metrics);await fill(page,'#vPersonnel','14',metrics);await fill(page,'#vWeather','Soleado, terreno seco',metrics);await fill(page,'#vContractorRep','Ing. Andrea López',metrics);await fill(page,'#vSupervisor','Ing. Carlos Mendoza',metrics);await fill(page,'#vNext','2026-09-25',metrics);await fill(page,'#vActivities','Excavación, instalación de tubería PVC, pozos, relleno por capas y subrasante.',metrics);await fill(page,'#vGeneralObs','Un tramo presenta mayor humedad; verificar compactación antes de continuar pavimento.',metrics);await fill(page,'#vInstructions','Realizar control de compactación y comprobar cotas de invert.',metrics);await fill(page,'#vCommitments','Contratista presentará controles y corregirá tramos que no cumplan.',metrics);await click(page,'#visitForm button.btn.primary',metrics);await expect(page.locator('#tabBody')).toContainText('18/09/2026');await expect(page.locator('#tabBody')).toContainText('Abierta');

      await tab(page,'changes',metrics);await click(page,'#newCh',metrics);await modalMetric(page,'Orden de cambio',metrics);await fill(page,'#chNumber','OC-01',metrics);await fill(page,'#chDate','2026-09-22',metrics);await fill(page,'#chAmount','85000',metrics);await fill(page,'#chDays','10',metrics);await sel(page,'#chStatus','Aprobado',metrics);await fill(page,'#chDocumentRef','ACTA-OC-01-2026 / Resolución de aprobación municipal',metrics);await fill(page,'#chJust','Tramo adicional de colector y dos pozos por condición encontrada en campo, con revisión técnica municipal.',metrics);await click(page,'#chForm button.btn.primary',metrics);await expect(page.locator('#tabBody')).toContainText('OC-01');

      await tab(page,'summary',metrics);await tab(page,'reports',metrics);const cards=page.locator('.report-type-card');metrics.reportTypes=await cards.count();if(metrics.reportTypes){await cards.first().click();metrics.clicks++;await page.waitForTimeout(250);}if(await page.locator('#reportPreview').count())await expect(page.locator('#reportPreview')).toBeVisible();await shot(page,testInfo,'02-informe-final');

      const finalState=await page.evaluate(()=>({projects:(db.projects||[]).length,contracts:(db.contracts||[]).length,estimates:(db.estimates||[]).length,guarantees:(db.guarantees||[]).length,changes:(db.changes||[]).length,visits:(db.visits||[]).length,offers:(db.projects||[])[0]?.procurement?.offers?.length||0}));
      expect(finalState).toEqual({projects:1,contracts:1,estimates:1,guarantees:2,changes:1,visits:1,offers:3});
      expect(metrics.errors,`Errores JavaScript: ${metrics.errors.join(' | ')}`).toEqual([]);
      metrics.finalState=finalState;metrics.finishedAt=new Date().toISOString();metrics.scrollModals=metrics.modals.filter(x=>x.scrollNeeded).length;
      fs.writeFileSync(testInfo.outputPath(`manual-simulation-${vp.name}.json`),JSON.stringify(metrics,null,2));
    });
  });
}
