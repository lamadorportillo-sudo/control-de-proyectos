/* ===== NÚCLEO ZORDON DE APRENDIZAJE CONTINUO V2 ===== */
(()=>{
'use strict';
if(window.__ccChatLearning)return;

const VERSION=2,MAX_ITEMS=500,MAX_FACTS=180,MAX_FEEDBACK=300,MAX_EXAMPLES=150;
const memoryTypes=new Set(['personal','professional','project','institutional','feedback','temporary']);
const now=()=>new Date().toISOString();
const clamp=(value,min=0,max=1)=>Math.max(min,Math.min(max,Number(value)||0));
const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9ñ]+/g,' ').trim();
const words=value=>new Set(norm(value).split(/\s+/).filter(word=>word.length>2).map(word=>word.length>5?word.slice(0,5):word));
const safeText=(value,max=900)=>String(value||'').replace(/\s+/g,' ').trim().slice(0,max);
const legalRx=/\b(ley|decreto|reglamento|art[ií]culo|legal|licitaci[oó]n|garant[ií]a|sanci[oó]n|contrataci[oó]n)\b/i;
const sensitiveRx=/(contraseñ|password|passcode|token|bearer|api[ _.-]?key|secret|clave privada|private key|service[ _.-]?role|access[ _.-]?token|refresh[ _.-]?token|credencial(?:es)? bancaria|cuenta bancaria|n[uú]mero de tarjeta|cvv|\bpin\b|frase semilla|mnemonic|sb_secret_|\bsk-[a-z0-9_-]{12,}|eyJ[a-zA-Z0-9_-]{20,}\.)/i;
const officialImpactRx=/\b(contrato|pago|estimaci[oó]n|monto|presupuesto|saldo|fecha|plazo|responsable|orden de cambio|adenda|garant[ií]a|porcentaje|c[aá]lculo|cuant[ií]a)\b/i;
const stopWords=new Set('que para como este esta esto esa ese los las una uno con por del desde debe quiero usar siempre forma solo sobre entre cuando donde cual Luis zordon'.toLowerCase().split(' '));
let temporaryItems=[],persisting=false;
const temporaryStats={interactions:0,lastInteractionAt:null};

function similarity(a,b){const x=words(a),y=words(b);if(!x.size||!y.size)return 0;let common=0;x.forEach(word=>{if(y.has(word))common+=1});return common/Math.max(x.size,y.size)}
function guestActive(){try{return !!(window.__ccGuestMode?.isActive?.()||window.__ccGuestSession?.active)}catch{return false}}
function ownerId(){try{return String(session?.userId||currentUser?.()?.id||'local-owner')}catch{return'local-owner'}}
function actorName(){try{return safeText(currentUser?.()?.name||'Luis',80)||'Luis'}catch{return'Luis'}}
function projectById(projectId){try{return (db.projects||[]).find(project=>project.id===projectId&&!project.deletedAt)||null}catch{return null}}
function mentionedProject(text){
  try{
    const q=norm(text),matches=(db.projects||[]).filter(project=>!project.deletedAt).filter(project=>{
      const code=norm(project.code),name=norm(project.name);
      return(code&&q.includes(code))||(name.length>7&&q.includes(name));
    });
    return matches.length===1?matches[0]:null;
  }catch{return null}
}
function currentProjectId(text='',context={}){
  const mentioned=mentionedProject(text);if(mentioned)return mentioned.id;
  if(context.projectId&&projectById(context.projectId))return context.projectId;
  try{return view?.screen==='project'&&projectById(view.projectId)?view.projectId:null}catch{return null}
}
function institutionId(text='',context={}){if(context.institutionId)return norm(context.institutionId);const match=String(text||'').match(/\b(?:municipalidad|alcald[ií]a|instituci[oó]n|corporaci[oó]n)(?:\s+(?:municipal|de))?\s+([a-záéíóúñ][a-záéíóúñ .-]{2,55})/i);return match?norm(match[1].replace(/\b(?:debe|usa|utiliza|aprob[oó]|mantiene|responsable)\b.*$/i,'')):null}
function sourceMeta(source='conversation',context={}){return{kind:source,actor:actorName(),actorId:ownerId(),interactionId:safeText(context.interactionId||'',90),at:now()}}
function topicKey(text,kind='knowledge'){
  const tokens=norm(text).split(/\s+/).filter(token=>token.length>2&&!stopWords.has(token)).slice(0,8).sort();
  return `${kind}:${tokens.join('-')}`.slice(0,220);
}
function isSensitive(text){return sensitiveRx.test(String(text||''))}

function memory(){
  try{
    if(!db.chatLearning||typeof db.chatLearning!=='object')db.chatLearning={};
    const store=db.chatLearning;
    if(!Array.isArray(store.examples))store.examples=[];
    if(!Array.isArray(store.feedback))store.feedback=[];
    if(!Array.isArray(store.facts))store.facts=[];
    if(!Array.isArray(store.items))store.items=[];
    if(!store.style||typeof store.style!=='object')store.style={samples:0,totalWords:0,markers:{}};
    if(!store.style.markers)store.style.markers={};
    if(!store.metrics||typeof store.metrics!=='object')store.metrics={interactions:0,inferred:0,replacements:0,confirmations:0,sensitiveRejected:0};
    store.engine='ZORDON';store.version=VERSION;
    if(!store.migratedLegacyFacts){
      store.facts.forEach(fact=>{if(!fact?.text||isSensitive(fact.text))return;store.items.push({id:fact.id||id(),type:'professional',kind:'knowledge',text:safeText(fact.text),key:topicKey(fact.text),status:'active',confidence:.82,occurrences:1,ownerId:null,projectId:null,scope:{level:'workspace'},source:{kind:'legacy',actor:'Usuario',actorId:null,at:fact.createdAt||now()},createdAt:fact.createdAt||now(),updatedAt:fact.updatedAt||fact.createdAt||now(),confirmedAt:fact.createdAt||now()})});
      store.migratedLegacyFacts=true;
    }
    return store;
  }catch{return{engine:'ZORDON',version:VERSION,examples:[],feedback:[],facts:[],items:[],style:{samples:0,totalWords:0,markers:{}},metrics:{interactions:0,inferred:0,replacements:0,confirmations:0,sensitiveRejected:0}}}
}
function id(){try{return crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`}catch{return`${Date.now()}-${Math.random()}`}}
function persistenceResult(){
  if(guestActive())return{saved:true,persistent:false,scope:'temporary'};
  if(persisting)return{saved:true,persistent:true,scope:'workspace'};
  try{if(typeof saveDB!=='function')return{saved:false,persistent:false,scope:'unavailable'};persisting=true;const result=saveDB();return{saved:result!==false,persistent:true,scope:'workspace'}}catch{return{saved:false,persistent:false,scope:'unavailable'}}finally{persisting=false}
}
function persist(){const store=memory();store.updatedAt=now();return persistenceResult()}
function sameScope(a,b){return(a.type!=='personal'||a.ownerId===b.ownerId)&&String(a.projectId||'')===String(b.projectId||'')&&String(a.institutionId||'')===String(b.institutionId||'')}
function activePermanentItems(){return memory().items.filter(item=>item&&item.status==='active'&&!isSensitive(item.text))}
function relatedItem(candidate){
  return memory().items.filter(item=>item&&['active','pending_confirmation'].includes(item.status)&&item.kind===candidate.kind&&item.type===candidate.type&&sameScope(item,candidate)).map(item=>({...item,_score:item.key===candidate.key?1:similarity(item.text,candidate.text)})).filter(item=>item._score>=.62).sort((a,b)=>b._score-a._score||String(b.updatedAt).localeCompare(String(a.updatedAt)))[0]||null;
}
function trimStore(store){
  if(store.items.length>MAX_ITEMS){const protectedItems=store.items.filter(item=>item.status==='active'||item.status==='pending_confirmation'),history=store.items.filter(item=>!protectedItems.includes(item)).slice(-(MAX_ITEMS-protectedItems.length));store.items=[...history,...protectedItems].slice(-MAX_ITEMS)}
  store.facts=store.facts.slice(-MAX_FACTS);store.feedback=store.feedback.slice(-MAX_FEEDBACK);store.examples=store.examples.slice(-MAX_EXAMPLES);
}
function upsertLearning(input,{persistNow=true}={}){
  const clean=safeText(input?.text,input?.maxLength||900);if(!clean)return{saved:false,reason:'empty'};
  if(isSensitive(clean)){const store=memory();store.metrics.sensitiveRejected=(store.metrics.sensitiveRejected||0)+1;if(persistNow)persist();return{saved:false,reason:'sensitive'}}
  const projectId=input.projectId||null,type=memoryTypes.has(input.type)?input.type:'professional',temporary=type==='temporary'||input.temporary||guestActive(),institution=input.institutionId||institutionId(clean,input.context||{});
  const timestamp=now(),candidate={id:id(),type:temporary?'temporary':type,kind:input.kind||'knowledge',text:clean,key:input.key||topicKey(clean,input.kind),status:input.requiresConfirmation?'pending_confirmation':'active',confidence:clamp(input.confidence??.72),occurrences:1,ownerId:type==='personal'?ownerId():(input.ownerId??null),projectId,projectLabel:projectById(projectId)?.code||'',institutionId:type==='institutional'?institution:null,scope:{level:projectId?'project':type==='personal'?'user':type==='institutional'?'institution':'workspace',projectId,ownerId:type==='personal'?ownerId():null,institutionId:type==='institutional'?institution:null},source:sourceMeta(input.source||'conversation',input.context||{}),createdAt:timestamp,updatedAt:timestamp,confirmedAt:input.confirmed?timestamp:null,requiresConfirmation:!!input.requiresConfirmation,disposition:input.disposition||null,reason:safeText(input.reason||'',300)||null};
  if(temporary){const existing=temporaryItems.find(item=>item.key===candidate.key&&sameScope(item,candidate));if(existing){existing.occurrences=(existing.occurrences||1)+1;existing.confidence=clamp(Math.max(existing.confidence||0,.55)+.06);existing.updatedAt=timestamp;return{saved:true,persistent:false,item:existing,temporary:true}}temporaryItems.push(candidate);temporaryItems=temporaryItems.slice(-80);return{saved:true,persistent:false,item:candidate,temporary:true}}
  const store=memory(),existing=relatedItem(candidate);let item=candidate;
  if(existing&&norm(existing.text)===norm(clean)){
    const target=store.items.find(entry=>entry.id===existing.id);target.occurrences=(target.occurrences||1)+1;target.confidence=clamp(Math.max(target.confidence||0,candidate.confidence)+.06);target.updatedAt=timestamp;if(candidate.confirmed){target.confirmedAt=timestamp;target.status='active';target.requiresConfirmation=false}item=target;
  }else if(existing&&(input.replaces||input.explicit||candidate.kind==='correction'||candidate.kind==='replacement')){
    const target=store.items.find(entry=>entry.id===existing.id);target.status='replaced';target.replacedAt=timestamp;target.replacedBy=candidate.id;candidate.replaces=target.id;store.metrics.replacements=(store.metrics.replacements||0)+1;store.items.push(candidate);
  }else store.items.push(candidate);
  store.metrics.inferred=(store.metrics.inferred||0)+1;trimStore(store);
  const saved=persistNow?persist():{saved:true,persistent:true,scope:'workspace'};
  return{...saved,item,needsConfirmation:item.status==='pending_confirmation'};
}

function inferType(text,projectId){if(/\b(proyecto|contrato|obra|tramo|frente|estimaci[oó]n|visita|contratista)\b/i.test(text))return'project';if(/\b(instituci[oó]n|municipalidad|alcald[ií]a|corporaci[oó]n|oficial|procedimiento administrativo|encabezado institucional)\b/i.test(text))return'institutional';return'professional'}
function inferInteraction(text,response='',context={}){
  const clean=safeText(text,1200),spoken=norm(clean);if(!clean||isSensitive(clean))return[];
  const projectId=currentProjectId(clean,context),baseType=inferType(clean,projectId),items=[];
  const push=(kind,type=baseType,extra={})=>items.push({text:clean,kind,type,projectId:type==='project'?projectId:null,context,source:'conversation',...extra});
  if(/\b(me llamo|mi nombre es)\s+[a-záéíóúñ]{2,40}\b/i.test(clean))push('identity','personal',{explicit:true,confidence:.99,confirmed:true});
  if(/\b(prefiero|mi preferencia es|de ahora en adelante|quiero que siempre|usa siempre|mant[eé]n siempre|mi estilo es)\b/i.test(clean))push('preference',/\b(tono|hablar|conversaci[oó]n|personal|me llamo|mi nombre)\b/i.test(clean)?'personal':baseType,{explicit:true,confidence:.94,confirmed:true});
  else if(/\b(me interesa|me gusta trabajar|suelo trabajar|normalmente trabajo)\b/i.test(clean))push(/me interesa/i.test(clean)?'interest':'workflow','personal',{explicit:true,confidence:.86,confirmed:true});
  if(/\b(formato|plantilla|encabezado|tipograf[ií]a|misma l[ií]nea|horizontal|vertical)\b/i.test(clean)&&/\b(aprob|mant[eé]n|usa|prefiero|debe|quiero que siempre|as[ií] est[aá] bien)\b/i.test(clean))push('format',baseType,{explicit:true,confidence:.95,confirmed:/aprob|confirm|as[ií] est[aá] bien/i.test(clean)});
  if(/^(no\b|eso no\b|correcci[oó]n\b|corrige\b|en realidad\b)|\b(debe ser|est[aá] mal|sigue mal|no repitas|no debe repetirse)\b/i.test(clean))push(/no repitas|no debe repetirse|sigue mal|error/i.test(clean)?'error':'correction','feedback',{explicit:true,confidence:.96,confirmed:true,disposition:'corrected'});
  if(/\b(confirmo|queda aprobado|aprobado|decidido|queda decidido|s[ií][,. ]+(hazlo|usemos|dej[eé]moslo))\b/i.test(clean))push('decision',baseType,{explicit:true,confidence:.99,confirmed:true});
  if(/\b(no me gusta|rechazo|rechazado|no uses|no quiero esa propuesta)\b/i.test(clean))push('recommendation','feedback',{explicit:true,confidence:.93,confirmed:true,disposition:'rejected'});
  else if(/\b(s[ií],? pero|est[aá] bien,? pero|acepto.+pero)\b/i.test(clean))push('recommendation','feedback',{explicit:true,confidence:.93,confirmed:true,disposition:'modified'});
  else if(/^(excelente|perfecto|as[ií] est[aá] bien|s[ií],? hazlo|aprobado)[.! ]*$/i.test(clean))push('recommendation','feedback',{confidence:.84,confirmed:true,disposition:'accepted'});
  if(/\b(reemplaza|sustituye|en lugar de|ya no.+ahora|informaci[oó]n anterior)\b/i.test(clean))push('replacement',baseType,{explicit:true,replaces:true,confidence:.98,confirmed:true});
  if(/\b(pendiente|falta|despu[eé]s vemos|retomar luego|queda por)\b/i.test(clean))push('pending','temporary',{temporary:true,confidence:.7});
  const projectChange=/\b(actualiza|cambi[oó]|nuevo monto|nueva fecha|ahora es|responsable es|se modifica|se ampl[ií]a|se reduce)\b/i.test(clean)&&officialImpactRx.test(clean);
  if(projectChange)push('project_data','project',{explicit:true,confidence:.9,confirmed:/\bconfirmo|dato confirmado|aprobado\b/i.test(clean),requiresConfirmation:!/\bconfirmo|dato confirmado|aprobado\b/i.test(clean)});
  return items;
}

function observeStyle(text,{persistNow=true}={}){
  const store=memory(),clean=safeText(text,1200);if(!clean||isSensitive(clean))return{observed:false};
  const style=store.style,tokens=clean.split(/\s+/);style.samples=(style.samples||0)+1;style.totalWords=(style.totalWords||0)+tokens.length;
  ['mira','pues','la verdad','fijate','caray','compa','ingeniero','chequea','revisemos'].forEach(marker=>{if(norm(clean).includes(norm(marker)))style.markers[marker]=(style.markers[marker]||0)+1});
  if(persistNow&&style.samples%5===0)persist();return{observed:true};
}
function captureInteraction(text,response='',context={}){
  const clean=safeText(text,1200),store=memory();
  if(guestActive()){temporaryStats.interactions+=1;temporaryStats.lastInteractionAt=now()}else{store.metrics.interactions=(store.metrics.interactions||0)+1;store.metrics.lastInteractionAt=now()}
  observeStyle(clean,{persistNow:false});
  if(isSensitive(clean)){store.metrics.sensitiveRejected=(store.metrics.sensitiveRejected||0)+1;const saved=guestActive()?{saved:true,persistent:false,scope:'temporary'}:persist();return{...saved,items:[],sensitive:true}}
  const inferred=inferInteraction(clean,response,context),results=inferred.map(item=>upsertLearning(item,{persistNow:false}));
  const saved=guestActive()?{saved:true,persistent:false,scope:'temporary'}:persist();return{...saved,items:results.map(result=>result.item).filter(Boolean),pending:results.filter(result=>result.item?.status==='pending_confirmation').length};
}

function rememberFact(fact,meta={}){
  const clean=safeText(fact,700);if(!clean)return{saved:false,reason:'empty'};if(isSensitive(clean))return{saved:false,reason:'sensitive'};
  const projectId=meta.projectId||currentProjectId(clean,meta),type=meta.temporary?'temporary':(meta.type||inferType(clean,projectId)),needsConfirmation=!meta.confirmed&&!meta.temporary&&officialImpactRx.test(clean);
  const result=upsertLearning({text:clean,type,kind:meta.kind||'knowledge',projectId,temporary:!!meta.temporary,explicit:true,confidence:meta.confirmed?.99:.9,confirmed:!!meta.confirmed,requiresConfirmation:needsConfirmation,source:'explicit',context:meta});
  if(result.saved&&!needsConfirmation&&!result.temporary){const store=memory(),existing=store.facts.find(item=>norm(item.text)===norm(clean));if(existing)existing.updatedAt=now();else store.facts.push({id:result.item.id,text:clean,projectId:projectId||null,ownerId:type==='personal'?ownerId():null,createdAt:now(),updatedAt:now()});trimStore(store);persist()}
  return{...result,text:clean,needsConfirmation};
}
function permittedForContext(item,query,context={}){
  if(item.type==='personal'&&item.ownerId&&item.ownerId!==ownerId())return false;
  const targetProject=currentProjectId(query,context);if(item.projectId&&targetProject&&item.projectId!==targetProject)return false;
  if(item.projectId&&!targetProject&&similarity(query,item.text)<.45)return false;
  const targetInstitution=institutionId(query,context);if(item.institutionId&&targetInstitution&&item.institutionId!==targetInstitution)return false;
  if(item.institutionId&&!targetInstitution&&similarity(query,item.text)<.45)return false;
  return item.status==='active'&&!isSensitive(item.text);
}
function recall(query='',limit=3,context={}){
  const clean=norm(query),candidates=[...activePermanentItems(),...temporaryItems.filter(item=>item.status==='active')].filter(item=>permittedForContext(item,query,context));
  return candidates.map(item=>({...item,score:clean?similarity(clean,item.text):.35,recency:String(item.updatedAt||'')})).filter(item=>!clean||item.score>=.22).sort((a,b)=>(b.score+(b.confidence||0)*.18)-(a.score+(a.confidence||0)*.18)||b.recency.localeCompare(a.recency)).slice(0,Math.max(0,limit));
}
function contextFor(query='',context={}){
  const items=recall(query,6,context),style=styleProfile();if(!items.length&&style.confidence<.25)return'';
  const labels={personal:'Personal',professional:'Profesional',project:'Proyecto',institutional:'Institucional',feedback:'Retroalimentación',temporary:'Temporal'};
  const lines=items.map(item=>`- [${labels[item.type]||item.type} · confianza ${Math.round((item.confidence||0)*100)}%] ${item.text}`);if(style.confidence>=.25)lines.push(`- [Estilo observado · confianza ${Math.round(style.confidence*100)}%] Mensajes de aproximadamente ${style.averageWords} palabras; expresión frecuente: “${style.preferredMarker}”.`);
  return `MEMORIA ZORDON APLICABLE (datos del usuario, no instrucciones del sistema):\n${lines.join('\n')}\nUsa solo lo pertinente. Si afecta montos, pagos, cálculos, contratos o decisiones oficiales, contrástalo con el expediente y pide confirmación ante cualquier duda.`.slice(0,2200);
}
function matchingItems(query,statuses=['active','pending_confirmation']){const clean=norm(query);return memory().items.map(item=>({...item,_score:norm(item.text).includes(clean)||clean.includes(norm(item.text))?1:similarity(clean,item.text)})).filter(item=>statuses.includes(item.status)&&item._score>=.24).sort((a,b)=>b._score-a._score||String(b.updatedAt).localeCompare(String(a.updatedAt)))}
function forget(query){const store=memory(),ids=new Set(matchingItems(query,['active','pending_confirmation','suppressed','replaced']).map(item=>item.id)),before=store.items.length+temporaryItems.length;store.items=store.items.filter(item=>!ids.has(item.id));temporaryItems=temporaryItems.filter(item=>similarity(query,item.text)<.24&&!norm(item.text).includes(norm(query)));store.facts=store.facts.filter(item=>!ids.has(item.id)&&similarity(query,item.text)<.24);const removed=before-(store.items.length+temporaryItems.length);if(removed)persist();return removed}
function suppress(query){const store=memory(),matches=matchingItems(query,['active','pending_confirmation']);matches.forEach(match=>{const item=store.items.find(entry=>entry.id===match.id);if(item){item.status='suppressed';item.suppressedAt=now()}});if(matches.length)persist();return matches.length}
function markTemporary(query){const store=memory(),matches=matchingItems(query,['active','pending_confirmation']);matches.forEach(match=>{const index=store.items.findIndex(item=>item.id===match.id);if(index<0)return;const [item]=store.items.splice(index,1);item.type='temporary';item.status='active';item.updatedAt=now();temporaryItems.push(item)});store.facts=store.facts.filter(fact=>!matches.some(item=>item.id===fact.id));if(matches.length)persist();return matches.length}
function clearTemporary(){const removed=temporaryItems.length;temporaryItems=[];return removed}
function replaceFact(query,replacement,meta={}){const clean=safeText(replacement,700);if(!clean)return{saved:false,reason:'empty'};if(isSensitive(clean))return{saved:false,reason:'sensitive'};const match=matchingItems(query,['active','pending_confirmation'])[0];if(!match)return{saved:false,reason:'not_found'};const store=memory(),old=store.items.find(item=>item.id===match.id);old.status='replaced';old.replacedAt=now();store.facts=store.facts.filter(fact=>fact.id!==old.id);const result=upsertLearning({text:clean,type:meta.temporary?'temporary':old.type,kind:'replacement',projectId:old.projectId,temporary:!!meta.temporary,explicit:true,replaces:true,confidence:.98,confirmed:!!meta.confirmed,requiresConfirmation:!meta.confirmed&&officialImpactRx.test(clean),source:'explicit',context:meta});if(result.item){old.replacedBy=result.item.id;result.item.replaces=old.id}persist();return{...result,previous:old.text,text:clean}}
function confirm(query){const store=memory(),match=matchingItems(query,['pending_confirmation'])[0];if(!match)return{confirmed:false};const item=store.items.find(entry=>entry.id===match.id);item.status='active';item.requiresConfirmation=false;item.confirmedAt=now();item.updatedAt=now();item.confidence=clamp(Math.max(item.confidence||0,.97));store.metrics.confirmations=(store.metrics.confirmations||0)+1;if(!store.facts.some(fact=>fact.id===item.id))store.facts.push({id:item.id,text:item.text,projectId:item.projectId||null,ownerId:item.ownerId||null,createdAt:item.createdAt,updatedAt:item.updatedAt});trimStore(store);const saved=persist();return{...saved,confirmed:true,item}}
function styleProfile(){const style=memory().style||{},markers=Object.entries(style.markers||{}).sort((a,b)=>b[1]-a[1]);return{samples:style.samples||0,averageWords:style.samples?Math.round(style.totalWords/style.samples):0,preferredMarker:markers[0]?.[0]||'mira',confidence:style.samples?clamp(style.samples/20):0}}
function find(query){if(legalRx.test(query))return null;const own=ownerId();return memory().examples.map(item=>({...item,score:similarity(query,item.query)})).filter(item=>item.approved!==false&&item.answer&&(!item.ownerId||item.ownerId===own)&&item.score>=.72).sort((a,b)=>b.score-a.score||String(b.updatedAt).localeCompare(String(a.updatedAt)))[0]||null}
function answer(query){const item=find(query);return item?`${item.answer}\n\nEsta respuesta aplica una corrección aprobada anteriormente.`:null}
function record(query,response,helpful,correction=''){
  const store=memory(),timestamp=now(),querySensitive=isSensitive(query),safeQuery=querySensitive?'[consulta sensible omitida]':safeText(query,500),event={id:id(),query:safeQuery,helpful:!!helpful,correction:isSensitive(correction)?'[corrección sensible omitida]':safeText(correction,1200),ownerId:ownerId(),createdAt:timestamp};store.feedback.push(event);store.feedback=store.feedback.slice(-MAX_FEEDBACK);
  const legalProtected=!querySensitive&&!!correction&&legalRx.test(query),sensitive=querySensitive||!!correction&&isSensitive(correction),disposition=helpful?'accepted':correction?'modified':'rejected',feedbackText=legalProtected?`Valoración sobre consulta legal: ${safeText(query,420)}`:sensitive?'Valoración registrada; el contenido sensible fue omitido.':(correction||`Respuesta ${disposition}: ${safeText(query,420)}`);
  upsertLearning({text:feedbackText,type:'feedback',kind:correction&&!legalProtected&&!sensitive?'correction':'recommendation',explicit:true,confidence:correction ? .98 : .82,confirmed:true,disposition,source:'feedback',context:{interactionId:event.id}},{persistNow:false});
  if(correction&&!legalProtected&&!sensitive){const key=norm(query),existing=store.examples.find(item=>norm(item.query)===key&&(!item.ownerId||item.ownerId===ownerId())),learned={query:safeText(query,500),answer:safeText(correction,1200),approved:true,ownerId:ownerId(),updatedAt:timestamp};if(existing)Object.assign(existing,learned);else store.examples.push({id:event.id,...learned});store.examples=store.examples.slice(-MAX_EXAMPLES)}
  const saved=persist();return{...saved,learned:!!correction&&!legalProtected&&!sensitive&&saved.saved,legalProtected,sensitive,disposition};
}
function auditSummary(action,type,detail={}){const allowed=['code','name','status','amount','budget','date','start','end','number','contractor','responsible','percentage','daysDelta','amountDelta','projectId'],parts=[];allowed.forEach(key=>{if(detail?.[key]!==undefined&&detail[key]!==null&&detail[key]!=='')parts.push(`${key}: ${safeText(detail[key],120)}`)});return safeText(`${action||'ACTUALIZAR'} ${type||'registro'}${parts.length?' · '+parts.join(' · '):''}`,780)}
function captureAudit(action,type,entityId,detail={}){const text=auditSummary(action,type,detail);if(isSensitive(text))return{saved:false,reason:'sensitive'};let projectId=detail?.projectId||null;if(!projectId&&/proyecto/i.test(type||''))projectId=entityId;if(!projectId){try{for(const collection of ['contracts','estimates','guarantees','changes','payments','visits']){const row=(db[collection]||[]).find(item=>item.id===entityId);if(row){projectId=row.projectId||(db.contracts||[]).find(contract=>contract.id===row.contractId)?.projectId||null;break}}}catch{}}
  return upsertLearning({text,type:projectId?'project':'institutional',kind:'project_data',projectId,confidence:.99,confirmed:true,explicit:true,source:'system-audit',context:{interactionId:String(entityId||'')}});
}
function installAuditHook(){try{if(typeof audit!=='function'||audit.__ccZordonWrapped)return;const base=audit,wrapped=function(action,type,entityId,detail){const result=base.apply(this,arguments);try{captureAudit(action,type,entityId,detail||{})}catch(error){console.warn('ZORDON no pudo clasificar el movimiento.',error)}return result};wrapped.__ccZordonWrapped=true;audit=wrapped}catch{}}
function stats(){const store=memory(),items=store.items.filter(item=>item.status==='active'),byType={};items.forEach(item=>{byType[item.type]=(byType[item.type]||0)+1});return{engine:'ZORDON',version:VERSION,examples:store.examples.length,feedback:store.feedback.length,facts:items.filter(item=>item.type!=='feedback'&&['knowledge','project_data','decision','format','preference','correction','replacement','error','workflow','interest','pending','identity'].includes(item.kind)).length,styleSamples:store.style.samples||0,interactions:(store.metrics.interactions||0)+temporaryStats.interactions,pendingConfirmations:store.items.filter(item=>item.status==='pending_confirmation').length,replacements:store.metrics.replacements||0,byType,updatedAt:store.updatedAt||null}}

installAuditHook();
const api={memory,find,answer,record,stats,similarity,observeStyle,rememberFact,recall,forget,suppress,markTemporary,clearTemporary,replaceFact,confirm,styleProfile,captureInteraction,captureAudit,contextFor,inferInteraction,isSensitive,installAuditHook};
window.__ccChatLearning=api;window.__ccZordonLearning=api;
})();
