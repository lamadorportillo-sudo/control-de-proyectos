/* ===== CONTROL CONTRACTUAL · NOTAS DE ADJUDICACIÓN EN WORD V1 ===== */
(()=>{
'use strict';
if(window.__CC_AWARD_NOTICES_V1__)return;
window.__CC_AWARD_NOTICES_V1__=true;

const JSZIP_SRC='https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
const E=v=>typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const X=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
const R=v=>Math.round((Number(v)||0)*100)/100;
const money=v=>typeof fmt==='function'?fmt(v):`L. ${R(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const upper=v=>String(v??'').trim().toUpperCase();
const fileSafe=v=>String(v||'documento').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,90)||'documento';

function dateLong(s){
  if(!s)return'';
  const d=new Date(s+'T12:00:00');
  if(Number.isNaN(+d))return s;
  const days=['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  const months=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${days[d.getDay()]} ${String(d.getDate()).padStart(2,'0')} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
}
function amountNotice(v){
  const c=Math.abs(Math.round((Number(v)||0)*100)),whole=Math.floor(c/100),dec=c%100;
  const words=typeof numberWords==='function'?numberWords(whole):String(whole);
  const unit=whole===1?'LEMPIRA':'LEMPIRAS';
  return `${words} ${String(dec).padStart(2,'0')}/100 ${unit} (${money(v)})`;
}
function processLabel(proc){
  const s=String(proc?.processType||proc?.modality||'').toUpperCase();
  if(/LICITACI/.test(s))return'LICITACIÓN';
  if(/CONCURSO/.test(s))return'CONCURSO';
  if(/COTIZ/.test(s))return'COTIZACIÓN';
  if(/PROPUESTA/.test(s))return'PROCESO DE CONTRATACIÓN';
  return'COTIZACIÓN';
}
function projectLabel(p){return upper([p?.name,p?.code].filter(Boolean).join(', '))}
function loadJSZip(){
  if(window.JSZip)return Promise.resolve(window.JSZip);
  return new Promise((resolve,reject)=>{
    const old=document.querySelector('script[data-cc-jszip]');
    if(old){old.addEventListener('load',()=>resolve(window.JSZip),{once:true});old.addEventListener('error',reject,{once:true});return;}
    const s=document.createElement('script');s.src=JSZIP_SRC;s.async=true;s.dataset.ccJszip='1';
    s.onload=()=>window.JSZip?resolve(window.JSZip):reject(new Error('JSZip no quedó disponible.'));
    s.onerror=()=>reject(new Error('No se pudo cargar el generador Word.'));
    document.head.appendChild(s);
  });
}

const run=(text,opt={})=>({text:String(text??''),bold:!!opt.bold,underline:!!opt.underline,italic:!!opt.italic});
const para=(runs,opt={})=>({runs:Array.isArray(runs)?runs:[run(runs)],align:opt.align||'left',after:opt.after??90,before:opt.before??0,line:opt.line??276,blank:!!opt.blank});
const blank=(n=1)=>Array.from({length:n},()=>para('',{after:0,line:240,blank:true}));

function signBlock(settings){
  return [
    para('Atentamente;',{after:0}),
    ...blank(5),
    para([run(settings.signatory,{bold:true})],{align:'center',after:0,line:240}),
    para([run(settings.position,{bold:true})],{align:'center',after:0,line:240})
  ];
}
function headerDate(settings){return para([run(`Santa María, La Paz ${dateLong(settings.noticeDate)}`,{bold:true})],{align:'right',after:180,line:240})}
function recipient(name){return [para('Señor(a):',{after:0}),para([run(upper(name),{bold:true})],{after:0}),para('Su Oficina',{after:160}),para('Estimado(a);',{after:160})]}
function noteAward(p,proc,awarded,settings){
  const type=processLabel(proc),project=projectLabel(p),total=Number(awarded.correctedAmount??awarded.amount??proc.finalAwardAmount??0);
  return {key:'adjudicacion',title:`Nota de adjudicación · ${awarded.bidder}`,file:`Nota-Adjudicacion-${fileSafe(awarded.bidder)}-${fileSafe(p.code)}`,
    paragraphs:[...blank(8),headerDate(settings),...recipient(awarded.bidder),
      para([run('Por este medio, me dirijo a usted, con referencia a la '),run(type),run(' '),run(project,{bold:true}),run('.')],{align:'both',after:150}),
      para([run('Al respecto, me permito comunicarle que la '),run(type,{bold:true}),run(' en mención le ha sido adjudicada por acuerdo y decisión de la corporación municipal tomada en sesión ordinaria de '),run(dateLong(settings.sessionDate)),run(' amparado en el Dictamen de la Comisión de Evaluación nombrada para tal efecto, por un monto evaluado de '),run(amountNotice(total),{bold:true}),run(' por lo anterior solicito a usted, pasar por las oficinas de la '),run('MUNICIPALIDAD DE SANTA MARÍA',{bold:true}),run(', para recibir la respectiva Solicitud para el trámite de la garantía de Cumplimiento y anticipo.')],{align:'both',after:220}),
      para('Una vez entregadas las respectivas garantías se procederá a la firma del Contrato.',{align:'both',after:200}),
      ...signBlock(settings)]};
}
function guaranteeCommon(p,proc,awarded,settings,kind){
  const isAdvance=kind==='anticipo',pct=isAdvance?settings.advancePct:settings.compliancePct,total=Number(awarded.correctedAmount??awarded.amount??proc.finalAwardAmount??0),guarantee=R(total*pct/100),project=projectLabel(p);
  const title=isAdvance?'SOLICITUD DE GARANTÍA DE ANTICIPO':'SOLICITUD DE GARANTÍA DE CUMPLIMIENTO DE CONTRATO';
  const first=isAdvance?'El motivo de la presente es para solicitarle el trámite de la garantía de anticipo del PROYECTO ':'El motivo de la presente es para solicitarle el trámite de la garantía de cumplimiento de contrato de la ';
  const purpose=isAdvance?'asegurar el anticipo del contrato':'asegurar el cumplimiento del contrato';
  return {key:kind,title:`${title} · ${awarded.bidder}`,file:`${isAdvance?'Garantia-Anticipo':'Garantia-Cumplimiento'}-${fileSafe(awarded.bidder)}-${fileSafe(p.code)}`,
    paragraphs:[headerDate(settings),para([run(title,{bold:true,underline:true})],{align:'center',after:150,line:240}),...recipient(awarded.bidder),
      para('Reciba un cordial y respetuoso saludo deseándole muchos éxitos en sus labores diarias.',{align:'both',after:150}),
      para([run(first),run(project,{bold:true}),run('.')],{align:'both',after:150}),
      para([run(`Esto con el objetivo de ${purpose} del proyecto antes mencionado, por un valor de `),run(amountNotice(guarantee),{bold:true}),run(' equivalente al '),run(`${R(pct).toFixed(2).replace(/\.00$/,'')}%`,{bold:true}),run(' del valor total del proyecto el cual asciende a '),run(amountNotice(total),{bold:true}),run('.')],{align:'both',after:60}),
      para([run('Todos los documentos de garantía deberán contener la siguiente cláusula obligatoria. '),run('"LA PRESENTE GARANTÍA SERA EJECUTADA A SIMPLE REQUERIMIENTO DE LA MUNICIPALIDAD DE SANTA MARÍA, ACOMPAÑADA DE UN CERTIFICADO DE INCUMPLIMIENTO"',{bold:true}),run(' Este Certificado de Incumplimiento será emitido por LA MUNICIPALIDAD.')],{align:'both',after:100}),
      para([run(`LA GARANTÍA DEBERÁ TENER UNA VIGENCIA DE ${typeof numberWords==='function'?numberWords(settings.validityDays):settings.validityDays} (${settings.validityDays}) DÍAS A PARTIR DE LA FECHA DE EMISIÓN.`,{bold:true})],{align:'both',after:100}),
      ...signBlock(settings)]};
}
function noteRejected(p,proc,awarded,loser,settings){
  const type=processLabel(proc),project=projectLabel(p),total=Number(awarded.correctedAmount??awarded.amount??proc.finalAwardAmount??0);
  return {key:`no-${loser.id}`,title:`Nota de no adjudicación · ${loser.bidder}`,file:`Nota-No-Adjudicacion-${fileSafe(loser.bidder)}-${fileSafe(p.code)}`,
    paragraphs:[headerDate(settings),...recipient(loser.bidder),
      para([run('Por este medio, me dirijo a usted, con referencia a la '),run(project,{bold:true}),run('.')],{align:'both',after:150}),
      para([run('Al respecto, me permito comunicarle que la '),run(type,{bold:true}),run(' en mención le ha sido adjudicada a '),run(upper(awarded.bidder),{bold:true}),run(' por acuerdo y decisión de la corporación municipal tomada en sesión ordinaria en '),run(dateLong(settings.sessionDate)),run(' amparados en el Dictamen de la Comisión de Evaluación nombrada para tal efecto, por un monto evaluado de '),run(amountNotice(total),{bold:true}),run(' dicha evaluación se realizó en base a criterios de elegibilidad, experiencia, comprobantes legales, capacidad financiera, disposición de equipo adecuado entre otras, por lo tanto, su oferta no fue la mejor evaluada, agradeciendo así mismo su participación en el proceso.')],{align:'both',after:180}),
      ...signBlock(settings)]};
}
function buildNotes(p,proc,settings){
  const offers=Array.isArray(proc.offers)?proc.offers:[],awarded=offers.find(o=>o.id===proc.finalAwardOfferId)||null;
  if(!awarded)return[];
  const notes=[noteAward(p,proc,awarded,settings),guaranteeCommon(p,proc,awarded,settings,'cumplimiento')];
  if(settings.includeAdvance)notes.push(guaranteeCommon(p,proc,awarded,settings,'anticipo'));
  offers.filter(o=>o.id!==awarded.id).forEach(o=>notes.push(noteRejected(p,proc,awarded,o,settings)));
  return notes;
}

function runXml(r){
  const props=[`<w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>`,r.bold?'<w:b/>':'',r.underline?'<w:u w:val="single"/>':'',r.italic?'<w:i/>':'','<w:sz w:val="24"/><w:szCs w:val="24"/>'].join('');
  return `<w:r><w:rPr>${props}</w:rPr><w:t xml:space="preserve">${X(r.text)}</w:t></w:r>`;
}
function paraXml(p){
  const jc=p.align==='both'?'both':p.align==='center'?'center':p.align==='right'?'right':'left';
  return `<w:p><w:pPr><w:spacing w:before="${p.before||0}" w:after="${p.after||0}" w:line="${p.line||276}" w:lineRule="auto"/><w:jc w:val="${jc}"/></w:pPr>${p.runs.map(runXml).join('')}</w:p>`;
}
function documentXml(notes){
  const blocks=[];
  notes.forEach((n,i)=>{n.paragraphs.forEach(p=>blocks.push(paraXml(p)));if(i<notes.length-1)blocks.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>')});
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>${blocks.join('')}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="743" w:right="1696" w:bottom="568" w:left="1701" w:header="720" w:footer="720" w:gutter="0"/><w:pgBorders w:offsetFrom="page"><w:top w:val="single" w:sz="4" w:space="24" w:color="auto"/><w:left w:val="single" w:sz="4" w:space="24" w:color="auto"/><w:bottom w:val="single" w:sz="4" w:space="24" w:color="auto"/><w:right w:val="single" w:sz="4" w:space="24" w:color="auto"/></w:pgBorders></w:sectPr></w:body></w:document>`;
}
function stylesXml(){return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/><w:sz w:val="24"/><w:szCs w:val="24"/><w:lang w:val="es-HN"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style></w:styles>`}
async function makeDocx(notes){
  const JSZip=await loadJSZip(),zip=new JSZip(),created=new Date().toISOString();
  zip.file('[Content_Types].xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`);
  zip.folder('_rels').file('.rels',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`);
  zip.folder('word').file('document.xml',documentXml(notes));
  zip.folder('word').file('styles.xml',stylesXml());
  zip.folder('word').folder('_rels').file('document.xml.rels',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`);
  zip.folder('docProps').file('core.xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>Notas de adjudicación</dc:title><dc:creator>Control Contractual</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${created}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${created}</dcterms:modified></cp:coreProperties>`);
  zip.folder('docProps').file('app.xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>Microsoft Office Word</Application></Properties>`);
  return zip.generateAsync({type:'blob',mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',compression:'DEFLATE'});
}
function downloadBlob(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name.endsWith('.docx')?name:name+'.docx';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1500)}

function previewHtml(note){
  const pHtml=note.paragraphs.map(p=>{const align=p.align==='both'?'justify':p.align;const content=p.runs.map(r=>`<span style="${r.bold?'font-weight:700;':''}${r.underline?'text-decoration:underline;':''}${r.italic?'font-style:italic;':''}">${E(r.text)}</span>`).join('')||'&nbsp;';return `<p style="text-align:${align};margin:0 0 ${Math.max(0,(p.after||0)/20)}pt;line-height:${(p.line||276)/240}">${content}</p>`}).join('');
  return `<div style="background:#eef2f6;padding:18px;overflow:auto"><article style="width:min(8.5in,100%);min-height:11in;margin:auto;background:white;color:#111;border:1px solid #333;padding:.52in 1.18in .42in;box-sizing:border-box;font-family:Arial,sans-serif;font-size:12pt">${pHtml}</article></div>`;
}

function settingsFromForm(m,proc){
  return {noticeDate:m.querySelector('#anNoticeDate')?.value||today(),sessionDate:m.querySelector('#anSessionDate')?.value||proc.decisionDate||today(),compliancePct:R(m.querySelector('#anCompliance')?.value||15),advancePct:R(m.querySelector('#anAdvance')?.value||15),validityDays:Math.max(1,Math.trunc(Number(m.querySelector('#anValidity')?.value)||180)),includeAdvance:m.querySelector('#anIncludeAdvance')?.value!=='0',signatory:(m.querySelector('#anSignatory')?.value||'Edwin alberto nicolas Morales').trim(),position:(m.querySelector('#anPosition')?.value||'Alcalde Municipal').trim()};
}
function openNotesModal(p,c){
  const proc=projectProcurement(p),offers=Array.isArray(proc.offers)?proc.offers:[],awarded=offers.find(o=>o.id===proc.finalAwardOfferId)||null;
  if(!awarded||proc.decisionStatus!=='Adjudicado')return toast('Primero registra la adjudicación final del proceso.');
  const saved=proc.noticeSettings||{},losers=offers.filter(o=>o.id!==awarded.id);
  const defComp=Number(saved.compliancePct??c?.controls?.performanceGuaranteePct??15),defAdv=Number(saved.advancePct??((Number(c?.advanceRequestedPct)>0)?c.advanceRequestedPct:15));
  const m=openModal('Notas posteriores a la adjudicación',`<div class="alert info"><b>Formatos institucionales cargados.</b> Se generará 1 nota de adjudicación, las solicitudes de garantías y <b>${losers.length} nota${losers.length===1?'':'s'} de no adjudicación</b>, una por cada oferente no seleccionado.</div><form id="awardNotesForm" class="form-grid"><label class="field"><span>Fecha de las notas</span><input id="anNoticeDate" type="date" value="${saved.noticeDate||today()}"></label><label class="field"><span>Fecha de sesión / decisión</span><input id="anSessionDate" type="date" value="${saved.sessionDate||proc.decisionDate||today()}"></label><label class="field"><span>Garantía de cumplimiento (%)</span><input id="anCompliance" type="number" min="0" step="0.01" value="${defComp}"></label><label class="field"><span>Garantía de anticipo (%)</span><input id="anAdvance" type="number" min="0" step="0.01" value="${defAdv}"></label><label class="field"><span>Vigencia de garantías (días)</span><input id="anValidity" type="number" min="1" step="1" value="${saved.validityDays||180}"></label><label class="field"><span>Incluir solicitud de anticipo</span><select id="anIncludeAdvance"><option value="1">Sí</option><option value="0">No</option></select></label><label class="field"><span>Firma</span><input id="anSignatory" value="${E(saved.signatory||'Edwin alberto nicolas Morales')}"></label><label class="field"><span>Cargo</span><input id="anPosition" value="${E(saved.position||'Alcalde Municipal')}"></label></form><div class="panel" style="margin-top:12px"><div class="panel-head"><div><h3>Documentos a generar</h3><p class="muted">Los nombres, proyecto, código, adjudicatario y montos se toman automáticamente del expediente.</p></div><button class="btn primary" type="button" id="anDownloadAll">Descargar todo en Word</button></div><div id="awardNotesList"></div></div><div class="modal-actions"><button type="button" class="btn" id="anSave">Guardar datos</button><button type="button" class="btn cancel">Cerrar</button></div>`);
  const inc=m.querySelector('#anIncludeAdvance');inc.value=saved.includeAdvance===false?'0':'1';
  const persist=()=>{const s=settingsFromForm(m,proc);proc.noticeSettings={...s,updatedAt:iso()};p.updatedAt=iso();saveDB();return s};
  const notesNow=()=>buildNotes(p,proc,settingsFromForm(m,proc));
  const draw=()=>{const notes=notesNow(),box=m.querySelector('#awardNotesList');if(!box)return;box.innerHTML=`<div class="table-wrap"><table class="table"><thead><tr><th>N.º</th><th>Documento</th><th>Destinatario / detalle</th><th></th></tr></thead><tbody>${notes.map((n,i)=>`<tr><td>${i+1}</td><td><b>${E(n.title.split(' · ')[0])}</b></td><td>${E(n.title.split(' · ').slice(1).join(' · ')||'Expediente')}</td><td><button type="button" class="btn" data-an-preview="${i}">Vista previa</button> <button type="button" class="btn primary" data-an-word="${i}">Word</button></td></tr>`).join('')}</tbody></table></div>`;
    box.querySelectorAll('[data-an-preview]').forEach(b=>b.onclick=()=>{const n=notesNow()[Number(b.dataset.anPreview)];if(!n)return;persist();openModal(n.title,previewHtml(n))});
    box.querySelectorAll('[data-an-word]').forEach(b=>b.onclick=async()=>{const n=notesNow()[Number(b.dataset.anWord)];if(!n)return;persist();b.disabled=true;try{downloadBlob(await makeDocx([n]),n.file+'.docx');toast('Documento Word generado.')}catch(err){console.error(err);toast('No se pudo generar el Word. Verifica la conexión e inténtalo de nuevo.')}finally{b.disabled=false}});
  };
  m.querySelectorAll('#awardNotesForm input,#awardNotesForm select').forEach(el=>el.addEventListener('input',draw));
  m.querySelector('#anSave').onclick=()=>{persist();toast('Datos de las notas guardados.')};
  m.querySelector('#anDownloadAll').onclick=async()=>{const b=m.querySelector('#anDownloadAll'),notes=notesNow();persist();b.disabled=true;try{downloadBlob(await makeDocx(notes),`Notas-Adjudicacion-${fileSafe(p.code)}.docx`);toast(`${notes.length} documentos generados en un solo archivo Word.`)}catch(err){console.error(err);toast('No se pudo generar el archivo Word. Verifica la conexión e inténtalo de nuevo.')}finally{b.disabled=false}};
  m.querySelector('.cancel').onclick=()=>m.remove();draw();
}

function decorate(p,c){
  const proc=projectProcurement(p),offers=Array.isArray(proc.offers)?proc.offers:[],awarded=offers.find(o=>o.id===proc.finalAwardOfferId)||null;
  if(!awarded||proc.decisionStatus!=='Adjudicado')return;
  const actions=document.querySelector('#tabBody .panel-head .actions');if(!actions||actions.querySelector('#awardNoticesBtn'))return;
  const b=document.createElement('button');b.id='awardNoticesBtn';b.type='button';b.className='btn primary';b.textContent='Notas de adjudicación · Word';b.title='Generar adjudicación, garantías y notas de no adjudicación';b.onclick=()=>openNotesModal(p,c);actions.prepend(b);
}
if(typeof renderProcurement==='function'&&!renderProcurement.__awardNotices){
  const base=renderProcurement;
  const wrapped=function(p,c){const r=base.apply(this,arguments);setTimeout(()=>decorate(p,c),0);return r};
  wrapped.__awardNotices=true;renderProcurement=wrapped;
}
})();
