/* ===== CONTROL CONTRACTUAL · CORRECCIÓN INSTITUCIONAL DE FORMATOS ===== */
(()=>{
'use strict';
if(window.__CC_OFFICIAL_CONTRACT_FORMAT_V1__)return;
window.__CC_OFFICIAL_CONTRACT_FORMAT_V1__=true;

const CORRECT_PHONE='9864-2006';
const WRONG_PHONES=['9865-2258','9865 - 2258','9865 2258','98652258'];
const JSZIP_URL='https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
let patched=false;

function replaceLogicalText(xml,from,to){
  if(!xml||!from)return xml;
  try{
    const parser=new DOMParser(),serializer=new XMLSerializer(),doc=parser.parseFromString(xml,'application/xml');
    if(doc.querySelector('parsererror'))return String(xml).split(from).join(to);
    let nodes=[...doc.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main','t')];
    let joined=nodes.map(n=>n.textContent||'').join(''),pos=joined.indexOf(from);
    while(pos>=0){
      const end=pos+from.length;let cursor=0,startNode=null,endNode=null,startOffset=0,endOffset=0;
      for(const node of nodes){
        const len=(node.textContent||'').length,next=cursor+len;
        if(startNode===null&&pos>=cursor&&pos<next){startNode=node;startOffset=pos-cursor}
        if(end>cursor&&end<=next){endNode=node;endOffset=end-cursor;break}
        cursor=next;
      }
      if(!startNode||!endNode)break;
      if(startNode===endNode){
        startNode.textContent=(startNode.textContent||'').slice(0,startOffset)+to+(startNode.textContent||'').slice(endOffset);
      }else{
        let clearing=false;
        for(const node of nodes){
          if(node===startNode){node.textContent=(node.textContent||'').slice(0,startOffset)+to;clearing=true;continue}
          if(!clearing)continue;
          if(node===endNode){node.textContent=(node.textContent||'').slice(endOffset);break}
          node.textContent='';
        }
      }
      nodes=[...doc.getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main','t')];
      joined=nodes.map(n=>n.textContent||'').join('');
      pos=joined.indexOf(from,pos+to.length);
    }
    return serializer.serializeToString(doc);
  }catch{
    return String(xml).split(from).join(to);
  }
}

function fixXml(xml){
  let out=String(xml||'');
  for(const wrong of WRONG_PHONES)out=replaceLogicalText(out,wrong,wrong==='98652258'?'98642006':CORRECT_PHONE);
  out=out.split('9865-2258').join(CORRECT_PHONE)
         .split('9865 - 2258').join(CORRECT_PHONE)
         .split('9865 2258').join(CORRECT_PHONE)
         .split('98652258').join('98642006');
  return out;
}

async function fixZip(zip){
  const names=Object.keys(zip?.files||{}).filter(name=>/^word\/.+\.xml$/i.test(name)&&!zip.files[name].dir);
  for(const name of names){
    const file=zip.file(name);if(!file)continue;
    try{
      const xml=await file.async('text'),fixed=fixXml(xml);
      if(fixed!==xml)zip.file(name,fixed);
    }catch(err){console.warn('No se pudo revisar teléfono en',name,err)}
  }
  return zip;
}

function patchJSZip(){
  if(patched||!window.JSZip?.loadAsync)return !!patched;
  const original=window.JSZip.loadAsync.bind(window.JSZip);
  if(original.__ccMunicipalPhoneFix){patched=true;return true}
  const wrapped=async function(){const zip=await original(...arguments);return fixZip(zip)};
  wrapped.__ccMunicipalPhoneFix=true;
  window.JSZip.loadAsync=wrapped;
  patched=true;
  console.info('Formatos contractuales: teléfono municipal fijado en',CORRECT_PHONE);
  return true;
}

function ensureJSZip(){
  if(patchJSZip())return;
  const existing=[...document.scripts].find(s=>/jszip@3\.10\.1\/dist\/jszip\.min\.js/i.test(s.src||''));
  if(existing){existing.addEventListener('load',patchJSZip,{once:true});return}
  const s=document.createElement('script');s.src=JSZIP_URL;s.async=true;s.onload=patchJSZip;s.onerror=()=>console.warn('No se pudo preparar la corrección de teléfono en los formatos.');document.head.appendChild(s);
}

window.ccMunicipalFormatData=Object.assign({},window.ccMunicipalFormatData||{},{phone:CORRECT_PHONE});
ensureJSZip();
let tries=0;const timer=setInterval(()=>{tries++;if(patchJSZip()||tries>80)clearInterval(timer)},100);
})();
