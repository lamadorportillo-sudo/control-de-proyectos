/* ===== INVITACIONES PREVIAS A COTIZACION / LICITACION V1 ===== */
(()=>{
'use strict';
if(window.__CC_PROC_INVITATIONS_V1__)return;
window.__CC_PROC_INVITATIONS_V1__=true;

const JSZIP_SRC='https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
const A=v=>Array.isArray(v)?v:[];
const H=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const X=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
const U=v=>String(v??'').trim().toUpperCase();
const say=m=>{try{toast(m)}catch{console.log(m)}};
const nowDate=()=>{try{return typeof today==='function'?today():new Date().toISOString().slice(0,10)}catch{return new Date().toISOString().slice(0,10)}};
const uid2=()=>{try{return typeof uid==='function'?uid():crypto.randomUUID()}catch{return String(Date.now())+Math.random()}};

function currentProject(){try{return A(db?.projects).find(p=>p.id===view?.projectId&&!p.deletedAt)||null}catch{return null}}
function procOf(p){p.procurement=p.procurement&&typeof p.procurement==='object'?p.procurement:{};p.procurement.offers=A(p.procurement.offers);p.procurement.invitees=A(p.procurement.invitees);return p.procurement}
function codeCandidates(){
  const out=[];
  A(db?.projects).forEach(p=>{
    [p?.code,p?.procurement?.invitationCode,p?.procurement?.processCode].filter(Boolean).forEach(code=>{
      const m=String(code).trim().match(/^COT(\d+)-(\d{4})$/i);if(m)out.push({n:Number(m[1]),year:Number(m[2]),len:m[1].length});
    });
  });
  return out;
}
function suggestedCode(){
  const yr=new Date().getFullYear(),list=codeCandidates().filter(x=>x.year===yr);
  if(!list.length)return `COT121709-${yr}`;
  const top=list.sort((a,b)=>b.n-a.n)[0];return `COT${String(top.n+1).padStart(top.len,'0')}-${top.year}`;
}
function longDate(s){
  if(!s)return'';const d=new Date(`${s}T12:00:00`);if(Number.isNaN(+d))return s;
  const days=['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  const months=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${days[d.getDay()]} ${String(d.getDate()).padStart(2,'0')} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
}
function receptionDate(s){
  if(!s)return'';const d=new Date(`${s}T12:00:00`);if(Number.isNaN(+d))return U(s);
  const months=['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
  return `${String(d.getDate()).padStart(2,'0')} DE ${months[d.getMonth()]} ${d.getFullYear()}`;
}
function time12(t){
  if(!t)return'';const m=String(t).match(/^(\d{1,2}):(\d{2})/);if(!m)return t;let h=Number(m[1]);const ap=h>=12?'PM':'AM';h=h%12||12;return `${String(h).padStart(2,'0')}:${m[2]} ${ap}`;
}
function processKind(v){return /licit/i.test(String(v||''))?'LICITACIÓN':'COTIZACIÓN'}
function formalTreatment(v){return ['Señor','Señora','Señores'].includes(v)?v:'Señor'}
function greeting(t){return t==='Señora'?'Estimada Señora:':t==='Señores'?'Estimados Señores:':'Estimado Señor:'}
function fileSafe(v){return String(v||'invitacion').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,90)||'invitacion'}

function defaultSettings(p,proc){
  const saved=proc.invitationSettings||{};
  let inferred=proc.processType||proc.modality||'';
  try{if(!inferred&&typeof procurementMode==='function')inferred=procurementMode(p.type,p.budget)}catch{}
  const kind=/licit/i.test(inferred)?'Licitación':'Cotización';
  return {
    processType:saved.processType||kind,
    invitationCode:saved.invitationCode||proc.invitationCode||suggestedCode(),
    invitationDate:saved.invitationDate||nowDate(),
    availabilityDate:saved.availabilityDate||saved.invitationDate||nowDate(),
    receiptDate:saved.receiptDate||proc.receiptDate||'',
    receiptTime:saved.receiptTime||proc.receiptTime||'',
    financing:saved.financing||'Fondos Municipales',
    receptionPlace:saved.receptionPlace||'salón de sesiones de la municipalidad de Santa María',
    signatory:saved.signatory||proc.noticeSettings?.signatory||'Edwin alberto Nicolas Morales',
    position:saved.position||proc.noticeSettings?.position||'Alcalde municipal'
  };
}

function css(){if(document.getElementById('cc-proc-invite-style'))return;const s=document.createElement('style');s.id='cc-proc-invite-style';s.textContent=`
.cc-invite-btn{white-space:nowrap}.cc-invite-head{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:12px}.cc-invite-head h3{margin:0}.cc-invite-note{font-size:10px;color:#687f95;line-height:1.45}.cc-invite-list{display:grid;gap:8px;margin-top:10px}.cc-invite-row{display:grid;grid-template-columns:140px minmax(220px,1fr) 120px 34px;gap:7px;align-items:end;padding:9px;border:1px solid #d9e3ec;border-radius:10px;background:#f8fafc}.cc-invite-row label{display:grid;gap:4px;font-size:9px;color:#64788b}.cc-invite-row input,.cc-invite-row select{width:100%}.cc-invite-remove{height:34px;border:1px solid #f0c8ca;background:#fff3f4;color:#b4232f;border-radius:8px;font-weight:900}.cc-invite-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.cc-invite-preview{max-height:55vh;overflow:auto;border:1px solid #d8e2eb;border-radius:12px;background:#fff;padding:15px}.cc-invite-paper{max-width:750px;margin:0 auto 18px;padding:38px 46px;border:1px solid #cbd5df;background:#fff;color:#111;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.45}.cc-invite-paper h2{text-align:center;font-size:16px;margin:0 0 28px}.cc-invite-paper .date{text-align:right;font-weight:700;margin-bottom:25px}.cc-invite-paper .project{font-weight:700;text-align:center;margin:8px 0 18px}.cc-invite-paper p{text-align:justify}.cc-invite-paper .sign{text-align:center;margin-top:55px}.cc-invite-paper .sign b{display:block}.cc-invite-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0}.cc-invite-summary div{padding:9px;border:1px solid #d9e3ec;border-radius:10px;background:#f8fafc}.cc-invite-summary small{display:block;color:#70849a;font-size:8px;text-transform:uppercase}.cc-invite-summary b{font-size:10px}.cc-invite-required{color:#b4232f;font-weight:700}
@media(max-width:700px){.cc-invite-row{grid-template-columns:1fr 1fr}.cc-invite-remove{grid-column:2}.cc-invite-summary{grid-template-columns:1fr}.cc-invite-paper{padding:24px 18px}}
`;document.head.appendChild(s)}

function inviteBody(p,settings,person){
  const kind=processKind(settings.processType),t=formalTreatment(person.treatment),code=U(settings.invitationCode),project=U(`${p.name}${code?', '+code:''}`);
  return {
    title:`INVITACIÓN A ${kind}`,
    date:`Santa María, La Paz, ${longDate(settings.invitationDate)}`,
    treatment:`${t}:`,
    name:person.name,
    office:person.office||'Su oficina',
    ref:'REF.: Invitación a presentar propuesta para proyecto.',
    project,
    greeting:greeting(t),
    p1:`La Municipalidad de Santa María, Departamento de la Paz, le invita a participar en la ${kind} del proyecto: en referencia”, el que será financiado por ${settings.financing}. En esta ${kind} participan personas naturales y/o jurídicas debidamente calificados por esta Municipalidad e inscritos en el registro de Contratistas de la Misma.`,
    p2:`Los documentos de ${kind} estarán disponibles en el portal www.honducompras.hn, a partir del día ${longDate(settings.availabilityDate)}. Todos los formatos brindados en el documento base deben estar llenos.`,
    p3:`La Recepción de las propuestas técnicas y económicas se recibirá el día ${receptionDate(settings.receiptDate)}. En el ${settings.receptionPlace}, a las ${time12(settings.receiptTime)}, para ser evaluadas y analizadas por una comisión que nombrará El Alcalde Municipal, donde se emitirá la respectiva aprobación y luego iniciar con el proceso de contratación.`,
    signatory:settings.signatory,position:settings.position
  };
}
function previewHtml(d){return `<article class="cc-invite-paper"><h2>${H(d.title)}</h2><div class="date">${H(d.date)}</div><div>${H(d.treatment)}<br><b>${H(d.name)}</b><br>${H(d.office)}</div><p><b>${H(d.ref)}</b></p><div>PROYECTO:</div><div class="project">${H(d.project)}</div><p><b>${H(d.greeting)}</b></p><p>${H(d.p1)}</p><p>${H(d.p2)}</p><p>${H(d.p3)}</p><p>Atentamente.</p><div class="sign"><b>${H(d.signatory)}</b><span>${H(d.position)}</span></div></article>`}

function loadJSZip(){if(window.JSZip)return Promise.resolve(window.JSZip);return new Promise((resolve,reject)=>{let old=document.querySelector('script[data-cc-invite-jszip]');if(old){old.addEventListener('load',()=>resolve(window.JSZip),{once:true});return}const s=document.createElement('script');s.src=JSZIP_SRC;s.async=true;s.dataset.ccInviteJszip='1';s.onload=()=>window.JSZip?resolve(window.JSZip):reject(Error('No se pudo cargar Word'));s.onerror=reject;document.head.appendChild(s)})}
function r(text,bold=false){return{text:String(text??''),bold}}
function p(runs,opt={}){return{runs:Array.isArray(runs)?runs:[r(runs)],align:opt.align||'left',after:opt.after??100,before:opt.before??0}}
function rx(a){return `<w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>${a.bold?'<w:b/>':''}<w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr><w:t xml:space="preserve">${X(a.text)}</w:t></w:r>`}
function px(a){const jc=a.align==='right'?'right':a.align==='center'?'center':a.align==='both'?'both':'left';return `<w:p><w:pPr><w:spacing w:before="${a.before}" w:after="${a.after}" w:line="276" w:lineRule="auto"/><w:jc w:val="${jc}"/></w:pPr>${a.runs.map(rx).join('')}</w:p>`}
function inviteParagraphs(d){return [
  p([r(d.title,true)],{align:'center',after:320}),p([r(d.date,true)],{align:'right',after:260}),
  p(d.treatment,{after:0}),p([r(U(d.name),true)],{after:0}),p(d.office,{after:160}),
  p([r(d.ref,true)],{after:130}),p('PROYECTO:',{after:0}),p([r(d.project,true)],{align:'center',after:220}),p([r(d.greeting,true)],{after:160}),
  p(d.p1,{align:'both',after:160}),p(d.p2,{align:'both',after:160}),p(d.p3,{align:'both',after:180}),p('Atentamente.',{after:0}),
  p('',{after:0}),p('',{after:0}),p('',{after:0}),p('',{after:0}),p([r(d.signatory,true)],{align:'center',after:0}),p([r(d.position,true)],{align:'center',after:0})
]}
function docXml(docs){let body='';docs.forEach((d,i)=>{body+=inviteParagraphs(d).map(px).join('');if(i<docs.length-1)body+='<w:p><w:r><w:br w:type="page"/></w:r></w:p>'});return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="900" w:right="1200" w:bottom="900" w:left="1200"/></w:sectPr></w:body></w:document>`}
async function makeDocx(docs){const JSZip=await loadJSZip(),z=new JSZip();z.file('[Content_Types].xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');z.folder('_rels').file('.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');z.folder('word').file('document.xml',docXml(docs));z.folder('word').folder('_rels').file('document.xml.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>');return z.generateAsync({type:'blob',mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',compression:'DEFLATE'})}
function downloadBlob(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1200)}

function openGenerator(){
  css();const pjt=currentProject();if(!pjt)return say('No se encontró el proyecto.');const proc=procOf(pjt),settings=defaultSettings(pjt,proc),people=A(proc.invitees).map(x=>({...x}));
  let m;
  const body=`<div class="cc-invite-head"><div><h3>Invitaciones previas al proceso</h3><div class="cc-invite-note">Registra primero los oferentes que serán invitados. El código, la fecha y hora de recepción son obligatorios antes de generar las invitaciones.</div></div></div>
  <form id="ccInviteForm" class="form-grid">
   <label class="field"><span>Tipo de proceso</span><select id="ccInvType" required><option>Cotización</option><option>Licitación</option></select></label>
   <label class="field"><span>Código del proceso <b class="cc-invite-required">*</b></span><input id="ccInvCode" required value="${H(settings.invitationCode)}"><small>Sugerido automáticamente según el último COT registrado.</small></label>
   <label class="field"><span>Fecha de invitación</span><input id="ccInvDate" type="date" required value="${H(settings.invitationDate)}"></label>
   <label class="field"><span>Documentos disponibles desde</span><input id="ccInvAvail" type="date" required value="${H(settings.availabilityDate)}"></label>
   <label class="field"><span>Fecha de recepción <b class="cc-invite-required">*</b></span><input id="ccInvReceipt" type="date" required value="${H(settings.receiptDate)}"></label>
   <label class="field"><span>Hora de recepción <b class="cc-invite-required">*</b></span><input id="ccInvTime" type="time" required value="${H(settings.receiptTime)}"></label>
   <label class="field"><span>Financiamiento</span><input id="ccInvFin" value="${H(settings.financing)}"></label>
   <label class="field"><span>Lugar de recepción</span><input id="ccInvPlace" value="${H(settings.receptionPlace)}"></label>
   <label class="field"><span>Firma</span><input id="ccInvSign" value="${H(settings.signatory)}"></label>
   <label class="field"><span>Cargo</span><input id="ccInvPos" value="${H(settings.position)}"></label>
  </form>
  <hr style="border:0;border-top:1px solid #d9e3ec;margin:14px 0"><div class="cc-invite-head"><div><h3>Oferentes a invitar</h3><div class="cc-invite-note">Usa <b>Señor</b>, <b>Señora</b> o <b>Señores</b> para empresas.</div></div><button type="button" class="btn" id="ccAddInvitee">+ Agregar oferente</button></div>
  <div class="cc-invite-list" id="ccInvitees"></div>
  <div class="cc-invite-actions"><button type="button" class="btn" id="ccSaveInv">Guardar datos</button><button type="button" class="btn primary" id="ccPreviewInv">Guardar y generar invitaciones</button></div>`;
  try{m=openModal('Invitaciones a cotizar / licitar',body)}catch(e){console.error(e);return say('No se pudo abrir el módulo de invitaciones.')}
  const q=s=>m.querySelector(s),list=q('#ccInvitees');q('#ccInvType').value=/licit/i.test(settings.processType)?'Licitación':'Cotización';
  const draw=()=>{list.innerHTML=people.length?people.map((x,i)=>`<div class="cc-invite-row" data-idx="${i}"><label><span>Tratamiento</span><select data-k="treatment"><option>Señor</option><option>Señora</option><option>Señores</option></select></label><label><span>Nombre / empresa</span><input data-k="name" value="${H(x.name||'')}" placeholder="Nombre del oferente"></label><label><span>Destino</span><input data-k="office" value="${H(x.office||'Su oficina')}"></label><button type="button" class="cc-invite-remove" title="Eliminar">×</button></div>`).join(''):'<div class="empty">Agrega al menos un oferente para generar las invitaciones.</div>';[...list.querySelectorAll('.cc-invite-row')].forEach((row,i)=>{const sel=row.querySelector('[data-k="treatment"]');sel.value=formalTreatment(people[i].treatment);sel.onchange=()=>people[i].treatment=sel.value;row.querySelector('[data-k="name"]').oninput=e=>people[i].name=e.target.value;row.querySelector('[data-k="office"]').oninput=e=>people[i].office=e.target.value;row.querySelector('.cc-invite-remove').onclick=()=>{people.splice(i,1);draw()}})};draw();
  q('#ccAddInvitee').onclick=()=>{people.push({id:uid2(),treatment:'Señor',name:'',office:'Su oficina'});draw()};
  const collect=()=>{
    const data={processType:q('#ccInvType').value,invitationCode:q('#ccInvCode').value.trim().toUpperCase(),invitationDate:q('#ccInvDate').value,availabilityDate:q('#ccInvAvail').value,receiptDate:q('#ccInvReceipt').value,receiptTime:q('#ccInvTime').value,financing:q('#ccInvFin').value.trim()||'Fondos Municipales',receptionPlace:q('#ccInvPlace').value.trim()||'salón de sesiones de la municipalidad de Santa María',signatory:q('#ccInvSign').value.trim(),position:q('#ccInvPos').value.trim()};
    if(!data.invitationCode)return say('Debes ingresar el código del proceso.'),null;if(!data.receiptDate)return say('Debes ingresar la fecha de recepción de ofertas.'),null;if(!data.receiptTime)return say('Debes ingresar la hora de recepción de ofertas.'),null;
    const clean=people.map(x=>({...x,name:String(x.name||'').trim(),treatment:formalTreatment(x.treatment),office:String(x.office||'Su oficina').trim()||'Su oficina'})).filter(x=>x.name);if(!clean.length)return say('Debes registrar al menos un oferente a invitar.'),null;
    return{data,clean};
  };
  const persist=()=>{const x=collect();if(!x)return null;proc.invitationSettings={...x.data,updatedAt:new Date().toISOString()};proc.invitationCode=x.data.invitationCode;proc.processType=x.data.processType;proc.receiptDate=x.data.receiptDate;proc.receiptTime=x.data.receiptTime;proc.invitees=x.clean;proc.updatedAt=new Date().toISOString();pjt.updatedAt=new Date().toISOString();try{if(typeof audit==='function')audit('ACTUALIZAR','Invitaciones de proceso',pjt.id,{projectId:pjt.id,code:x.data.invitationCode,processType:x.data.processType,invitees:x.clean.length,receiptDate:x.data.receiptDate,receiptTime:x.data.receiptTime});if(typeof saveDB==='function')saveDB()}catch(e){console.error(e)}return x};
  q('#ccSaveInv').onclick=()=>{if(persist())say('Datos de invitación guardados.')};
  q('#ccPreviewInv').onclick=()=>{const x=persist();if(!x)return;m.remove();openPreview(pjt,x.data,x.clean)};
}

function openPreview(pjt,settings,people){const docs=people.map(person=>({person,data:inviteBody(pjt,settings,person)}));const body=`<div class="cc-invite-summary"><div><small>Proceso</small><b>${H(processKind(settings.processType))}</b></div><div><small>Código</small><b>${H(settings.invitationCode)}</b></div><div><small>Recepción</small><b>${H(receptionDate(settings.receiptDate))} · ${H(time12(settings.receiptTime))}</b></div></div><div class="cc-invite-actions"><button class="btn primary" id="ccDownloadAllInv">Descargar todas en Word</button><button class="btn" id="ccEditInv">Editar datos / oferentes</button></div><div class="cc-invite-preview">${docs.map(x=>`<div><div class="cc-invite-actions" style="justify-content:flex-end"><button class="btn" data-download-invite="${H(x.person.id)}">Word · ${H(x.person.name)}</button></div>${previewHtml(x.data)}</div>`).join('')}</div>`;let m;try{m=openModal('Vista previa · Invitaciones',body)}catch{return}m.querySelector('#ccEditInv').onclick=()=>{m.remove();openGenerator()};m.querySelector('#ccDownloadAllInv').onclick=async()=>{try{const blob=await makeDocx(docs.map(x=>x.data));downloadBlob(blob,`Invitaciones-${fileSafe(settings.invitationCode)}.docx`);say('Invitaciones generadas en Word.')}catch(e){console.error(e);say('No se pudo generar el archivo Word.')}};m.querySelectorAll('[data-download-invite]').forEach(b=>b.onclick=async()=>{const x=docs.find(z=>String(z.person.id)===String(b.dataset.downloadInvite));if(!x)return;try{const blob=await makeDocx([x.data]);downloadBlob(blob,`Invitacion-${fileSafe(x.person.name)}-${fileSafe(settings.invitationCode)}.docx`)}catch(e){console.error(e);say('No se pudo generar el archivo Word.')}})}

function isProcurementScreen(){const body=document.getElementById('tabBody');if(!body)return false;const text=(body.textContent||'').toLowerCase();return text.includes('agregar oferta')||text.includes('ofertas y adjudicación')||text.includes('ofertas y adjudicacion')}
function decorate(){css();if(!isProcurementScreen())return;const body=document.getElementById('tabBody');if(!body||body.querySelector('[data-cc-proc-invitations]'))return;const buttons=[...body.querySelectorAll('button')];const anchor=buttons.find(b=>/agregar oferta/i.test(b.textContent||''))||buttons.find(b=>/datos del proceso/i.test(b.textContent||''));if(!anchor)return;const b=document.createElement('button');b.type='button';b.className='btn cc-invite-btn';b.dataset.ccProcInvitations='1';b.textContent='Invitaciones';b.title='Registrar oferentes y generar invitaciones antes de recibir ofertas';b.onclick=e=>{e.preventDefault();openGenerator()};anchor.parentElement?.insertBefore(b,anchor)}
new MutationObserver(()=>queueMicrotask(decorate)).observe(document.documentElement,{subtree:true,childList:true});document.addEventListener('click',()=>setTimeout(decorate,0),true);setTimeout(decorate,0);setTimeout(decorate,800);window.openProcurementInvitations=openGenerator;
})();