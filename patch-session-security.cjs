const fs=require('fs');

const path='index.html';
let html=fs.readFileSync(path,'utf8');

const oldSession="session={userId:d.user?.id||session.userId,email:d.user?.email||session.email,accessToken:d.access_token,refreshToken:d.refresh_token||session.refreshToken,expiresAt:Date.now()+(d.expires_in||3600)*1000};";
const newSession="const priorSession=session||{};session={userId:d.user?.id||priorSession.userId,email:d.user?.email||priorSession.email,accessToken:d.access_token,refreshToken:d.refresh_token||priorSession.refreshToken,expiresAt:Date.now()+(d.expires_in||3600)*1000,securitySessionId:priorSession.securitySessionId||'',deviceLabel:priorSession.deviceLabel||''};";

if(!html.includes(newSession)){
  if(!html.includes(oldSession))throw new Error('No se encontró el bloque de renovación de sesión esperado.');
  html=html.replace(oldSession,newSession);
}

const oldApiFetch="fetch(SUPABASE_URL+path,{method,headers,body:body==null?undefined:JSON.stringify(body)})";
const newApiFetch="fetch(SUPABASE_URL+path,{method,headers,body:body==null?undefined:JSON.stringify(body),cache:'no-store'})";
if(!html.includes(newApiFetch)){
  if(!html.includes(oldApiFetch))throw new Error('No se encontró sbFetch para activar no-store.');
  html=html.replace(oldApiFetch,newApiFetch);
}

const oldRefreshFetch="fetch(SUPABASE_URL+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{'apikey':SUPABASE_KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:session.refreshToken})})";
const newRefreshFetch="fetch(SUPABASE_URL+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{'apikey':SUPABASE_KEY,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:session.refreshToken}),cache:'no-store'})";
if(!html.includes(newRefreshFetch)){
  if(!html.includes(oldRefreshFetch))throw new Error('No se encontró refreshCloudSession para activar no-store.');
  html=html.replace(oldRefreshFetch,newRefreshFetch);
}

/* El núcleo histórico tenía un MutationObserver global que llama decorate() tras
   cualquier inserción. Dentro de decorate se reasignaba textContent aunque el
   valor ya fuera idéntico; esa reasignación vuelve a generar childList y el
   observador se alimentaba a sí mismo. El problema se hacía crítico al abrir
   Contrato porque varios módulos añaden tarjetas después del render inicial. */
const oldProgressDecoration="if(label)label.textContent=a.physicalAvailable?'Avance físico observado · última visita':'Avance físico sin registrar';if(val)val.textContent=a.physicalAvailable?`${a.physical.toFixed(2)}%`:'—';if(fill)fill.style.width=`${a.physicalAvailable?a.physical:0}%`;";
const newProgressDecoration="if(label){const nextLabel=a.physicalAvailable?'Avance físico observado · última visita':'Avance físico sin registrar';if(label.textContent!==nextLabel)label.textContent=nextLabel}if(val){const nextValue=a.physicalAvailable?`${a.physical.toFixed(2)}%`:'—';if(val.textContent!==nextValue)val.textContent=nextValue}if(fill){const nextWidth=`${a.physicalAvailable?a.physical:0}%`;if(fill.style.width!==nextWidth)fill.style.width=nextWidth}";
if(!html.includes(newProgressDecoration)){
  if(!html.includes(oldProgressDecoration))throw new Error('No se encontró la decoración histórica de avance para hacerla idempotente.');
  html=html.replace(oldProgressDecoration,newProgressDecoration);
}

const oldDecorationObserver="new MutationObserver(()=>setTimeout(decorate,0)).observe(document.documentElement,{subtree:true,childList:true});";
const newDecorationObserver="let ccDecorateQueued=false;new MutationObserver(()=>{if(ccDecorateQueued)return;ccDecorateQueued=true;const run=()=>{ccDecorateQueued=false;decorate()};if(typeof requestAnimationFrame==='function')requestAnimationFrame(run);else setTimeout(run,0)}).observe(document.documentElement,{subtree:true,childList:true});";
if(!html.includes(newDecorationObserver)){
  if(!html.includes(oldDecorationObserver))throw new Error('No se encontró el observador histórico de decoración para estabilizarlo.');
  html=html.replace(oldDecorationObserver,newDecorationObserver);
}

if(!html.includes("securitySessionId:priorSession.securitySessionId||''"))throw new Error('La renovación todavía perdería el identificador de seguridad.');
if(!html.includes("deviceLabel:priorSession.deviceLabel||''"))throw new Error('La renovación todavía perdería la identificación del dispositivo.');
if(html.includes(oldProgressDecoration))throw new Error('La decoración de avance todavía reescribe el mismo texto y puede crear un bucle de MutationObserver.');
if(html.includes(oldDecorationObserver))throw new Error('El observador de decoración todavía agenda trabajo ilimitado por cada mutación.');

fs.writeFileSync(path,html,'utf8');
console.log('Renovación de token endurecida y observador del núcleo estabilizado sin reescrituras recursivas.');
