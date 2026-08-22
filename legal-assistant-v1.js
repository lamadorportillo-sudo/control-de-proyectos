/* ===== RECUPERACIÓN NORMATIVA LOCAL V1 ===== */
(()=>{
'use strict';
if(window.__ccLegalKnowledge)return;
const data=window.__CC_LAW_KNOWLEDGE__||{sources:[],records:[]};
const stop=new Set('a al algo ante bajo con contra cual cuando de del desde donde el ella en entre es esta este esto ha hasta la las lo los más o para pero por que se sin sobre su sus un una y ya'.split(' '));
const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9ñ]+/g,' ').trim();
const tokens=value=>[...new Set(norm(value).split(/\s+/).filter(word=>word.length>2&&!stop.has(word)))];
const sourceMap=Object.fromEntries((data.sources||[]).map(source=>[source.id,source]));
function search(query,limit=3){
  const q=norm(query),words=tokens(query),article=(q.match(/articulo\s+(\d+(?:-[a-z])?)/)||[])[1];
  if(!words.length&&!article)return[];
  return(data.records||[]).map(record=>{
    const hay=norm(record.text),title=norm(sourceMap[record.source]?.title);
    let score=words.reduce((sum,word)=>sum+(hay.includes(word)?1:0)+(title.includes(word)?1.5:0),0);
    if(article&&String(record.article).toLowerCase()===article)score+=12;
    if(q.length>8&&hay.includes(q))score+=8;
    return{...record,score,sourceInfo:sourceMap[record.source]};
  }).filter(item=>item.score>0).sort((a,b)=>b.score-a.score||a.text.length-b.text.length).slice(0,limit);
}
function excerpt(text,query,max=620){
  const clean=String(text||'').replace(/\s+/g,' ').trim(),words=tokens(query);let at=0;
  for(const word of words){const pos=norm(clean).indexOf(word);if(pos>=0){at=pos;break}}
  const start=Math.max(0,at-90),end=Math.min(clean.length,start+max);
  return`${start?'…':''}${clean.slice(start,end).trim()}${end<clean.length?'…':''}`;
}
function answer(query){
  const found=search(query,3);
  if(!found.length)return'No encontré un artículo suficientemente relacionado en las tres normas cargadas. Reformula la consulta indicando el tema o el número de artículo. No completaré la respuesta con datos no respaldados.';
  const blocks=found.map(item=>{const source=item.sourceInfo||{};return`${source.title||item.source} (${source.instrument||''}), artículo ${item.article}, pág. PDF ${item.page}:\n${excerpt(item.text,query)}`});
  return`Encontré estas disposiciones relacionadas:\n\n${blocks.join('\n\n')}\n\nOrientación informativa basada en los documentos cargados; confirma el texto completo y su vigencia antes de tomar una decisión jurídica o contractual.`;
}
window.__ccLegalKnowledge={data,search,answer,norm};
})();
