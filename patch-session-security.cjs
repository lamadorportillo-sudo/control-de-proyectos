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

if(!html.includes("securitySessionId:priorSession.securitySessionId||''"))throw new Error('La renovación todavía perdería el identificador de seguridad.');
if(!html.includes("deviceLabel:priorSession.deviceLabel||''"))throw new Error('La renovación todavía perdería la identificación del dispositivo.');

fs.writeFileSync(path,html,'utf8');
console.log('Renovación de token endurecida: sesión de seguridad preservada y respuestas autenticadas sin caché.');
