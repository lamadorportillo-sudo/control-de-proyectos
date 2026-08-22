/* ===== APRENDIZAJE SUPERVISADO DEL CHAT V1 ===== */
(()=>{
'use strict';
if(window.__ccChatLearning)return;
const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9ñ]+/g,' ').trim();
const words=value=>new Set(norm(value).split(/\s+/).filter(word=>word.length>2).map(word=>word.length>5?word.slice(0,5):word));
const legalRx=/\b(ley|decreto|reglamento|art[ií]culo|legal|licitaci[oó]n|garant[ií]a|sanci[oó]n|contrataci[oó]n)\b/i;
function memory(){try{if(!db.chatLearning||typeof db.chatLearning!=='object')db.chatLearning={examples:[],feedback:[],facts:[],style:{samples:0,totalWords:0,markers:{}},updatedAt:null};if(!Array.isArray(db.chatLearning.examples))db.chatLearning.examples=[];if(!Array.isArray(db.chatLearning.feedback))db.chatLearning.feedback=[];if(!Array.isArray(db.chatLearning.facts))db.chatLearning.facts=[];if(!db.chatLearning.style||typeof db.chatLearning.style!=='object')db.chatLearning.style={samples:0,totalWords:0,markers:{}};if(!db.chatLearning.style.markers)db.chatLearning.style.markers={};return db.chatLearning}catch{return{examples:[],feedback:[],facts:[],style:{samples:0,totalWords:0,markers:{}}}}}
function similarity(a,b){const x=words(a),y=words(b);if(!x.size||!y.size)return 0;let common=0;x.forEach(word=>{if(y.has(word))common+=1});return common/Math.max(x.size,y.size)}
function find(query){if(legalRx.test(query))return null;return memory().examples.map(item=>({...item,score:similarity(query,item.query)})).filter(item=>item.approved!==false&&item.answer&&item.score>=.72).sort((a,b)=>b.score-a.score||String(b.updatedAt).localeCompare(String(a.updatedAt)))[0]||null}
function answer(query){const item=find(query);return item?`${item.answer}\n\nEsta respuesta fue mejorada con una corrección aprobada por personas de este espacio de trabajo.`:null}
function persist(){try{db.chatLearning.updatedAt=new Date().toISOString();saveDB()}catch{}}
function observeStyle(text){const store=memory(),clean=String(text||'').trim();if(!clean)return;const style=store.style,tokens=clean.split(/\s+/);style.samples=(style.samples||0)+1;style.totalWords=(style.totalWords||0)+tokens.length;['mira','pues','la verdad','fijate','caray','compa','ingeniero','chequea','revisemos'].forEach(marker=>{if(norm(clean).includes(norm(marker)))style.markers[marker]=(style.markers[marker]||0)+1});if(style.samples%5===0)persist()}
const sensitiveRx=/(contraseñ|password|token|secret|clave privada|service.role|tarjeta|cvv|pin|access.token)/i;
function rememberFact(fact){const clean=String(fact||'').replace(/\s+/g,' ').trim().slice(0,500);if(!clean)return{saved:false,reason:'empty'};if(sensitiveRx.test(clean))return{saved:false,reason:'sensitive'};const store=memory(),key=norm(clean),existing=store.facts.find(item=>norm(item.text)===key);if(existing)existing.updatedAt=new Date().toISOString();else store.facts.push({id:(crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`),text:clean,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});store.facts=store.facts.slice(-120);persist();return{saved:true,text:clean}}
function recall(query='',limit=3){const store=memory(),q=norm(query);if(!q)return store.facts.slice(-limit).reverse();return store.facts.map(item=>({...item,score:similarity(q,item.text)})).filter(item=>item.score>=.25).sort((a,b)=>b.score-a.score).slice(0,limit)}
function forget(query){const store=memory(),before=store.facts.length,q=norm(query);store.facts=store.facts.filter(item=>similarity(q,item.text)<.25);const removed=before-store.facts.length;if(removed)persist();return removed}
function styleProfile(){const style=memory().style||{},markers=Object.entries(style.markers||{}).sort((a,b)=>b[1]-a[1]);return{samples:style.samples||0,averageWords:style.samples?Math.round(style.totalWords/style.samples):0,preferredMarker:markers[0]?.[0]||'mira'}}
function record(query,response,helpful,correction=''){
  const store=memory(),event={id:(crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`),query:String(query||'').slice(0,500),helpful:!!helpful,createdAt:new Date().toISOString()};store.feedback.push(event);store.feedback=store.feedback.slice(-300);
  if(correction&&!legalRx.test(query)){const key=norm(query),existing=store.examples.find(item=>norm(item.query)===key),learned={query:String(query).slice(0,500),answer:String(correction).slice(0,1200),approved:true,updatedAt:new Date().toISOString()};if(existing)Object.assign(existing,learned);else store.examples.push({id:event.id,...learned});store.examples=store.examples.slice(-150)}
  persist();return{learned:!!correction&&!legalRx.test(query),legalProtected:!!correction&&legalRx.test(query)};
}
function stats(){const store=memory();return{examples:store.examples.length,feedback:store.feedback.length,facts:store.facts.length,styleSamples:store.style.samples||0,updatedAt:store.updatedAt||null}}
window.__ccChatLearning={memory,find,answer,record,stats,similarity,observeStyle,rememberFact,recall,forget,styleProfile};
})();
