const fs=require('fs');
const zlib=require('zlib');
const vm=require('vm');

const files=Array.from({length:12},(_,i)=>`bundle-${String(i+1).padStart(2,'0')}.js`);
let b64='';
for(const file of files){
  const src=fs.readFileSync(file,'utf8');
  const m=src.match(/\+\s*'([^']*)'/s);
  if(!m) throw new Error(`No se pudo leer ${file}`);
  b64+=m[1];
}

b64=b64.replace(/[^A-Za-z0-9+/=]/g,'').replace(/=+$/,'');
b64+='='.repeat((4-(b64.length%4))%4);
if(!b64.startsWith('H4sI')) throw new Error('Paquete Base64/GZIP inválido');

let html=zlib.gunzipSync(Buffer.from(b64,'base64')).toString('utf8');
if(!html.includes('</body>')) throw new Error('HTML base incompleto');

// Corrige el buscador de proyectos: al redibujar la lista, recupera foco y cursor
// para permitir escribir de forma continua sin tener que volver a hacer clic.
const searchOld="$('#projectSearch').oninput=e=>{view.search=e.target.value;renderProjects(k)};";
const searchNew="$('#projectSearch').oninput=e=>{const value=e.target.value,pos=e.target.selectionStart??value.length;view.search=value;renderProjects(k);const input=$('#projectSearch');if(input){input.focus();const caret=Math.min(pos,value.length);try{input.setSelectionRange(caret,caret)}catch{}}};";
if(html.includes(searchOld)){
  html=html.replace(searchOld,searchNew);
  console.log('Buscador corregido: conserva foco y posición del cursor.');
}else if(!html.includes('const value=e.target.value,pos=e.target.selectionStart')){
  throw new Error('No se encontró el manejador esperado del buscador de proyectos.');
}

// Regla de cierre del proyecto:
// 1) avance automático >= 100%; o
// 2) devolución/pago de Garantía de Calidad registrado como Pagado.
// Conserva la opción manual de Estado=Finalizado/Cerrado existente en Editar proyecto.
const progressOld="function syncAllProjectProgress(){(db.projects||[]).forEach(p=>{const c=db.contracts.find(x=>x.projectId===p.id),a=projectAutomaticProgress(p,c);p.physicalProgress=a.physical;p.financialProgress=a.financial})}";
const progressNew="function syncAllProjectProgress(){(db.projects||[]).forEach(p=>{const c=db.contracts.find(x=>x.projectId===p.id),a=projectAutomaticProgress(p,c);p.physicalProgress=a.physical;p.financialProgress=a.financial;const qualityPaid=(db.payments||[]).some(x=>x.projectId===p.id&&x.status==='Pagado'&&/calidad/i.test(x.movementType||''));const complete=a.physical>=100||qualityPaid;if(complete&&!/finaliz|cerrad/i.test(p.status||'')){p.status='Finalizado';p.finalizedAt=p.finalizedAt||iso();p.finalizedReason=a.physical>=100?'Avance de ejecución 100%':'Garantía de calidad pagada/devuelta';if(c&&!/finaliz|cerrad/i.test(c.status||''))c.status='Finalizado'}})}";
if(html.includes(progressOld)){
  html=html.replace(progressOld,progressNew);
  console.log('Regla de finalización automática aplicada.');
}else if(!html.includes("p.finalizedReason=a.physical>=100")){
  throw new Error('No se encontró la función esperada de sincronización de avance.');
}

// Elimina una copia histórica del escáner que quedó dentro del template
// utilizado para exportar informes.
const fnPos=html.indexOf('function downloadCurrentReport');
const badStart='<body>${body}<script>\n/* ===== ESCANER / IMPORTADOR DE ESTIMACIONES V1 ===== */';
const start=fnPos>=0?html.indexOf(badStart,fnPos):-1;
if(start>=0){
  const endMarker='</script>\n</body></html>`;';
  const end=html.indexOf(endMarker,start);
  if(end<0) throw new Error('Se detectó el escáner incrustado, pero no se encontró su cierre.');
  html=html.slice(0,start)+'<body>${body}</body></html>`;'+html.slice(end+endMarker.length);
  console.log('Se eliminó la copia incrustada del escáner dentro del generador de informes.');
}

// Añade el lector documental profundo como una capa independiente.
const deepScanner=fs.readFileSync('estimate-scanner-v1.js','utf8');
if(!deepScanner.includes('LECTOR DOCUMENTAL PROFUNDO V2')) throw new Error('No se encontró el lector documental V2.');
if(!html.includes('LECTOR DOCUMENTAL PROFUNDO V2')){
  const bodyEnd=html.toLowerCase().lastIndexOf('</body>');
  if(bodyEnd<0) throw new Error('No se encontró </body> para insertar el lector V2.');
  html=html.slice(0,bodyEnd)+`<script>\n${deepScanner}\n</script>\n`+html.slice(bodyEnd);
}

// Añade el motor de aprendizaje adaptativo como módulo independiente.
const adaptiveLearning=fs.readFileSync('adaptive-learning-v1.js','utf8');
if(!adaptiveLearning.includes('APRENDIZAJE ADAPTATIVO V1')) throw new Error('No se encontró el motor de aprendizaje adaptativo.');
if(!html.includes('APRENDIZAJE ADAPTATIVO V1')){
  const bodyEnd=html.toLowerCase().lastIndexOf('</body>');
  if(bodyEnd<0) throw new Error('No se encontró </body> para insertar aprendizaje adaptativo.');
  html=html.slice(0,bodyEnd)+`<script>\n${adaptiveLearning}\n</script>\n`+html.slice(bodyEnd);
}

// Validación sintáctica de todos los scripts inline antes de publicar.
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);
if(!scripts.length) throw new Error('No se encontraron scripts en el HTML final.');
for(let i=0;i<scripts.length;i++){
  try{new vm.Script(scripts[i],{filename:`inline-${i+1}.js`});}
  catch(err){throw new Error(`JavaScript inválido en bloque ${i+1}: ${err.message}`)}
}
if(!html.toLowerCase().includes('</html>')) throw new Error('Falta el cierre </html>.');
if(html.includes('window.__CP_B64=')) throw new Error('El HTML final aún contiene el cargador Base64.');

fs.writeFileSync('index.html',html,'utf8');
console.log(`index.html directo generado: ${Buffer.byteLength(html,'utf8')} bytes; ${scripts.length} scripts validados.`);
