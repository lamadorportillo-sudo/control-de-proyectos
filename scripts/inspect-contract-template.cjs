const fs=require('node:fs');
const {execFileSync}=require('node:child_process');

function decode(s){return s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'");}
function plain(file){
  const xml=execFileSync('unzip',['-p',file,'word/document.xml'],{encoding:'utf8',maxBuffer:20*1024*1024});
  return decode(xml
    .replace(/<w:tab\/?\s*>/g,'\t')
    .replace(/<w:br\/?\s*>/g,'\n')
    .replace(/<\/w:p>/g,'\n')
    .replace(/<\/w:tr>/g,'\n')
    .replace(/<[^>]+>/g,'')
    .replace(/[ \t]+/g,' ')
    .replace(/\n{3,}/g,'\n\n'));
}
const files=['templates/contrato-infraestructura-base.docx','templates/nota-remision-anticipo-base.docx','templates/orden-inicio-base.docx'];
let out='';
for(const file of files){out+=`===== ${file} =====\n${plain(file)}\n\n`;}
fs.writeFileSync('template-contract-diagnostic.txt',out,'utf8');
console.log('Diagnóstico textual de plantillas generado.');
