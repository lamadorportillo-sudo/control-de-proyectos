/* ===== APRENDIZAJE SUPERVISADO DEL CHAT V1 ===== */
(()=>{
'use strict';
if(window.__ccChatLearning)return;
const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9ñ]+/g,' ').trim();
const words=value=>new Set(norm(value).split(/\s+/).filter(word=>word.length>2).map(word=>word.length>5?word.slice(0,5):word));
const legalRx=/\b(ley|decreto|reglamento|art[ií]culo|legal|licitaci[oó]n|garant[ií]a|sanci[oó]n|contrataci[oó]n)\b/i;
function memory(){try{if(!db.chatLearning||typeof db.chatLearning!=='object')db.chatLearning={examples:[],feedback:[],updatedAt:null};if(!Array.isArray(db.chatLearning.examples))db.chatLearning.examples=[];if(!Array.isArray(db.chatLearning.feedback))db.chatLearning.feedback=[];return db.chatLearning}catch{return{examples:[],feedback:[]}}}
function similarity(a,b){const x=words(a),y=words(b);if(!x.size||!y.size)return 0;let common=0;x.forEach(word=>{if(y.has(word))common+=1});return common/Math.max(x.size,y.size)}
function find(query){if(legalRx.test(query))return null;return memory().examples.map(item=>({...item,score:similarity(query,item.query)})).filter(item=>item.approved!==false&&item.answer&&item.score>=.72).sort((a,b)=>b.score-a.score||String(b.updatedAt).localeCompare(String(a.updatedAt)))[0]||null}
function answer(query){const item=find(query);return item?`${item.answer}\n\nEsta respuesta fue mejorada con una corrección aprobada por personas de este espacio de trabajo.`:null}
function persist(){try{db.chatLearning.updatedAt=new Date().toISOString();saveDB()}catch{}}
function record(query,response,helpful,correction=''){
  const store=memory(),event={id:(crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`),query:String(query||'').slice(0,500),helpful:!!helpful,createdAt:new Date().toISOString()};store.feedback.push(event);store.feedback=store.feedback.slice(-300);
  if(correction&&!legalRx.test(query)){const key=norm(query),existing=store.examples.find(item=>norm(item.query)===key),learned={query:String(query).slice(0,500),answer:String(correction).slice(0,1200),approved:true,updatedAt:new Date().toISOString()};if(existing)Object.assign(existing,learned);else store.examples.push({id:event.id,...learned});store.examples=store.examples.slice(-150)}
  persist();return{learned:!!correction&&!legalRx.test(query),legalProtected:!!correction&&legalRx.test(query)};
}
function stats(){const store=memory();return{examples:store.examples.length,feedback:store.feedback.length,updatedAt:store.updatedAt||null}}
window.__ccChatLearning={memory,find,answer,record,stats,similarity};
})();
