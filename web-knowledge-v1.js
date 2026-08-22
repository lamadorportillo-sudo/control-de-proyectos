/* ===== CONOCIMIENTO WEB ABIERTO V1 ===== */
(()=>{
'use strict';
if(window.__ccWebKnowledge)return;
const clean=value=>String(value||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
const shorten=(value,max=430)=>{const text=clean(value);return text.length<=max?text:`${text.slice(0,max).replace(/\s+\S*$/,'')}…`};
async function search(query){
  const params=new URLSearchParams({action:'query',generator:'search',gsrsearch:String(query||''),gsrlimit:'3',prop:'extracts|info',exintro:'1',explaintext:'1',inprop:'url',format:'json',origin:'*'});
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),9000);
  try{
    const response=await fetch(`https://es.wikipedia.org/w/api.php?${params}`,{signal:controller.signal,headers:{Accept:'application/json'}});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const payload=await response.json();
    return Object.values(payload?.query?.pages||{}).sort((a,b)=>(a.index||99)-(b.index||99)).slice(0,2).map(page=>({title:clean(page.title),extract:shorten(page.extract),url:page.canonicalurl||`https://es.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g,'_'))}`})).filter(item=>item.extract);
  }finally{clearTimeout(timer)}
}
async function answer(query){
  try{
    const results=await search(query);
    if(!results.length)return'CONOCIMIENTO DE LA RED — NO ES LEY\nNo encontré una fuente web abierta suficientemente relacionada. Esto no modifica ni reemplaza la respuesta normativa.';
    const blocks=results.map(item=>`${item.title}: ${item.extract}\nFuente web: ${item.url}`);
    return`CONOCIMIENTO DE LA RED — NO ES LEY\n${blocks.join('\n\n')}\n\nContenido informativo recuperado de la red; puede estar incompleto, desactualizado o no ser aplicable a Honduras.`;
  }catch{
    return'CONOCIMIENTO DE LA RED — NO ES LEY\nLa consulta web no está disponible en este momento. La respuesta legal local sigue funcionando sin conexión.';
  }
}
window.__ccWebKnowledge={search,answer};
})();
