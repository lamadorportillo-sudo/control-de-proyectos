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

// Corrige una inserción antigua del escáner que quedó dentro del template
// usado para exportar informes. El escáner ya existe como script independiente
// al final de la aplicación, por lo que aquí solo se elimina la copia incrustada.
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
