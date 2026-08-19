const fs=require('fs');
const zlib=require('zlib');
const files=Array.from({length:12},(_,i)=>`bundle-${String(i+1).padStart(2,'0')}.js`);
let b64='';
for(const file of files){
  const src=fs.readFileSync(file,'utf8');
  const m=src.match(/\+\s*'([^']*)'/s);
  if(!m) throw new Error(`No se pudo leer ${file}`);
  b64+=m[1];
}
b64=b64.replace(/[^A-Za-z0-9+/=]/g,'');
b64=b64.replace(/=+$/,'');
b64+='='.repeat((4-(b64.length%4))%4);
if(!b64.startsWith('H4sI')) throw new Error('Paquete Base64/GZIP inválido');
const html=zlib.gunzipSync(Buffer.from(b64,'base64')).toString('utf8');
if(!html.includes('</body>')) throw new Error('HTML base incompleto');
fs.rmSync('_site',{recursive:true,force:true});
fs.mkdirSync('_site',{recursive:true});
fs.writeFileSync('_site/index.html',html,'utf8');
fs.writeFileSync('_site/.nojekyll','');
console.log(`Sitio generado correctamente: ${html.length} caracteres; Base64: ${b64.length}.`);
