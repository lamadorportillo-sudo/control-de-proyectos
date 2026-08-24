import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.0";

const allowedOrigins=new Set(["https://lamadorportillo-sudo.github.io","http://localhost:8000","http://127.0.0.1:8000","http://localhost:4173","http://127.0.0.1:4173"]);
const rate=new Map<string,{at:number,count:number}>();
const cors=(origin:string|null)=>({"Access-Control-Allow-Origin":origin&&allowedOrigins.has(origin)?origin:"https://lamadorportillo-sudo.github.io","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Vary":"Origin"});
const securityHeaders={"Cache-Control":"no-store, max-age=0","Pragma":"no-cache","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer","X-Frame-Options":"DENY"};
const json=(body:unknown,status:number,origin:string|null)=>new Response(JSON.stringify(body),{status,headers:{...cors(origin),...securityHeaders,"Content-Type":"application/json; charset=utf-8"}});
const clean=(v:unknown,max=180)=>String(v??"").replace(/[\u0000-\u001f\u007f]/g," ").trim().slice(0,max);
function deviceLabel(ua:string){const s=ua.toLowerCase();const os=/iphone|ipad|ipod/.test(s)?"iOS/iPadOS":/android/.test(s)?"Android":/windows/.test(s)?"Windows":/mac os|macintosh/.test(s)?"macOS":/linux/.test(s)?"Linux":"Dispositivo";const browser=/edg\//.test(s)?"Edge":/opr\//.test(s)?"Opera":/chrome\//.test(s)&&!/edg\//.test(s)?"Chrome":/firefox\//.test(s)?"Firefox":/safari\//.test(s)&&!/chrome\//.test(s)?"Safari":"Navegador";return `${os} · ${browser}`}
function jwtAal(token:string){try{const part=token.split(".")[1]||"",n=part.replace(/-/g,"+").replace(/_/g,"/"),p=n+"=".repeat((4-n.length%4)%4);return JSON.parse(atob(p))?.aal==="aal2"?"aal2":"aal1"}catch{return "aal1"}}
const safeFactor=(f:any)=>({id:String(f?.id||""),factor_type:String(f?.factor_type||""),status:String(f?.status||""),friendly_name:String(f?.friendly_name||"")});

Deno.serve(async(req:Request)=>{
 const origin=req.headers.get("origin");
 if(req.method==="OPTIONS")return new Response("ok",{headers:{...cors(origin),...securityHeaders}});
 if(req.method!=="POST")return json({error:"Método no permitido."},405,origin);
 if(origin&&!allowedOrigins.has(origin))return json({error:"Origen no autorizado."},403,origin);
 if(Number(req.headers.get("content-length")||0)>16000)return json({error:"Solicitud demasiado grande."},413,origin);
 try{
  const url=Deno.env.get("SUPABASE_URL")||"",anonKey=Deno.env.get("SUPABASE_ANON_KEY")||"",serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"",token=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");
  if(!token)return json({error:"Sesión requerida."},401,origin);
  const admin=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:auth,error:authError}=await admin.auth.getUser(token);if(authError||!auth.user)return json({error:"Sesión no válida."},401,origin);
  const key=auth.user.id,nowMs=Date.now(),bucket=rate.get(key);if(!bucket||nowMs-bucket.at>60000)rate.set(key,{at:nowMs,count:1});else{bucket.count++;if(bucket.count>25)return json({error:"Demasiadas verificaciones. Espere un minuto."},429,origin)}
  const body=await req.json(),action=clean(body?.action,50),refreshToken=String(body?.refresh_token||"");
  if(!refreshToken||refreshToken.length>4096)return json({error:"La sesión necesita renovarse. Ingrese nuevamente."},401,origin);
  const {data:membership}=await admin.from("workspace_members").select("workspace_id,role,active").eq("user_id",auth.user.id).eq("active",true).limit(1).maybeSingle();
  const {data:profile}=await admin.from("profiles").select("active,must_change_password,temporary_password_expires_at,security_force_reauth,mfa_required_after").eq("user_id",auth.user.id).maybeSingle();
  if(!membership||profile?.active===false)return json({error:"Acceso no autorizado."},403,origin);
  if(profile?.must_change_password&&(!profile.temporary_password_expires_at||Date.now()>new Date(profile.temporary_password_expires_at).getTime()))return json({error:"La contraseña temporal venció. Solicite una nueva clave."},403,origin);

  const userClient=createClient(url,anonKey,{auth:{persistSession:false,autoRefreshToken:false}});const setResult=await userClient.auth.setSession({access_token:token,refresh_token:refreshToken});if(setResult.error)return json({error:"La sesión no pudo prepararse para 2FA. Ingrese nuevamente."},401,origin);
  const factorsResult=await userClient.auth.mfa.listFactors();if(factorsResult.error)return json({error:"No se pudo consultar la verificación en dos pasos."},400,origin);
  const fd:any=factorsResult.data||{},allFactors=Array.isArray(fd.all)?fd.all:[...(fd.totp||[]),...(fd.phone||[])],verified=allFactors.filter((f:any)=>f?.status==="verified"),currentAal=jwtAal(token);
  const required=membership.role==="admin"&&!!profile?.mfa_required_after,requiredAfter=required?profile.mfa_required_after:null,pastDue=required&&Date.now()>=new Date(requiredAfter).getTime();

  if(action==="status")return json({enabled:verified.length>0,aal:currentAal,factors:verified.map(safeFactor),pending:allFactors.filter((f:any)=>f?.status!=="verified").map(safeFactor),required,required_after:requiredAfter,past_due:pastDue,role:membership.role},200,origin);

  if(action==="verify_login"){
   const factorId=clean(body?.factor_id,80),code=clean(body?.code,12).replace(/\s+/g,"");if(!/^[0-9]{6,10}$/.test(code))return json({error:"Escriba el código de su aplicación autenticadora."},400,origin);
   const factor=verified.find((f:any)=>String(f?.id)===factorId)||verified.find((f:any)=>f?.factor_type==="totp");if(!factor)return json({error:"No se encontró un factor 2FA verificado para esta cuenta."},403,origin);
   const since=new Date(Date.now()-10*60*1000).toISOString();const {count:recentFails}=await admin.from("security_events").select("id",{count:"exact",head:true}).eq("user_id",auth.user.id).eq("event_type","mfa_failure").gte("created_at",since);if((recentFails||0)>=8)return json({error:"Demasiados códigos incorrectos. Espere unos minutos antes de volver a intentar."},429,origin);
   const challenge=await userClient.auth.mfa.challenge({factorId:factor.id});if(challenge.error||!challenge.data?.id)return json({error:"No se pudo iniciar la verificación 2FA."},400,origin);
   const verify=await userClient.auth.mfa.verify({factorId:factor.id,challengeId:challenge.data.id,code});if(verify.error){const ua=clean(req.headers.get("user-agent"),220);await admin.from("security_events").insert({workspace_id:membership.workspace_id,user_id:auth.user.id,email:auth.user.email||null,event_type:"mfa_failure",success:false,severity:"warning",device_label:deviceLabel(ua),user_agent:ua,metadata:{reason:"invalid_totp"}});return json({error:"Código incorrecto o vencido."},401,origin)}
   const {data:sd}=await userClient.auth.getSession(),upgraded=sd.session;if(!upgraded?.access_token||!upgraded.refresh_token)return json({error:"La verificación fue aceptada, pero la sesión no pudo actualizarse."},500,origin);
   const now=new Date().toISOString(),ua=clean(req.headers.get("user-agent"),220),device=deviceLabel(ua);await admin.from("profiles").update({security_force_reauth:false,last_login_at:now,updated_at:now}).eq("user_id",auth.user.id);
   const {data:ss,error:ssErr}=await admin.from("security_sessions").insert({workspace_id:membership.workspace_id,user_id:auth.user.id,email:auth.user.email||null,device_label:device,user_agent:ua,started_at:now,last_seen_at:now}).select("id").single();if(ssErr||!ss)return json({error:"No se pudo registrar la sesión protegida."},500,origin);
   await admin.from("security_events").insert({workspace_id:membership.workspace_id,user_id:auth.user.id,email:auth.user.email||null,event_type:"login_success",success:true,severity:"info",device_label:device,user_agent:ua,session_id:ss.id,metadata:{role:membership.role||"consulta",mfa:true}});
   return json({ok:true,access_token:upgraded.access_token,refresh_token:upgraded.refresh_token,expires_in:upgraded.expires_in,expires_at:upgraded.expires_at,token_type:upgraded.token_type,security_session_id:ss.id,device_label:device},200,origin);
  }

  const enrollmentAction=["enroll","verify_enrollment","cancel_enrollment"].includes(action);
  if(profile?.security_force_reauth===true&&!enrollmentAction)return json({error:"Complete la verificación requerida antes de continuar."},403,origin);
  if(verified.length>0&&currentAal!=="aal2"&&!enrollmentAction)return json({error:"Esta acción requiere verificación en dos pasos."},403,origin);

  if(action==="enroll"){
   const pendingTotp=allFactors.filter((f:any)=>f?.factor_type==="totp"&&f?.status!=="verified");for(const f of pendingTotp){try{await userClient.auth.mfa.unenroll({factorId:f.id})}catch{}}
   const enrolled=await userClient.auth.mfa.enroll({factorType:"totp",friendlyName:"Control Contractual"});if(enrolled.error||!enrolled.data?.id||!enrolled.data?.totp)return json({error:enrolled.error?.message||"No se pudo iniciar la activación 2FA."},400,origin);
   await admin.from("security_events").insert({workspace_id:membership.workspace_id,user_id:auth.user.id,email:auth.user.email||null,event_type:"mfa_enrollment_started",success:true,severity:"info",metadata:{factor_type:"totp",required}});
   return json({factor_id:enrolled.data.id,friendly_name:enrolled.data.friendly_name||"Control Contractual",qr_code:enrolled.data.totp.qr_code,secret:enrolled.data.totp.secret,uri:enrolled.data.totp.uri,required,required_after:requiredAfter},200,origin);
  }

  if(action==="verify_enrollment"){
   const factorId=clean(body?.factor_id,80),code=clean(body?.code,12).replace(/\s+/g,"");if(!factorId||!/^[0-9]{6,10}$/.test(code))return json({error:"Escriba el código generado por la aplicación autenticadora."},400,origin);
   const challenge=await userClient.auth.mfa.challenge({factorId});if(challenge.error||!challenge.data?.id)return json({error:"No se pudo iniciar la comprobación del factor."},400,origin);
   const verify=await userClient.auth.mfa.verify({factorId,challengeId:challenge.data.id,code});if(verify.error)return json({error:"El código no coincide. Revise la aplicación autenticadora."},400,origin);
   const {data:sd}=await userClient.auth.getSession(),upgraded=sd.session;if(!upgraded?.access_token||!upgraded.refresh_token)return json({error:"2FA quedó activado, pero debe ingresar nuevamente."},409,origin);
   const now=new Date().toISOString();await admin.from("profiles").update({security_force_reauth:false,updated_at:now}).eq("user_id",auth.user.id);await admin.from("security_events").insert({workspace_id:membership.workspace_id,user_id:auth.user.id,email:auth.user.email||null,event_type:"mfa_enrolled",success:true,severity:"info",metadata:{factor_type:"totp",required}});
   let securitySessionId="",device="";
   if(body?.complete_login===true){const ua=clean(req.headers.get("user-agent"),220);device=deviceLabel(ua);await admin.from("profiles").update({last_login_at:now,updated_at:now}).eq("user_id",auth.user.id);const {data:ss,error:ssErr}=await admin.from("security_sessions").insert({workspace_id:membership.workspace_id,user_id:auth.user.id,email:auth.user.email||null,device_label:device,user_agent:ua,started_at:now,last_seen_at:now}).select("id").single();if(ssErr||!ss)return json({error:"2FA quedó activo, pero no se pudo abrir la sesión protegida."},500,origin);securitySessionId=ss.id;await admin.from("security_events").insert({workspace_id:membership.workspace_id,user_id:auth.user.id,email:auth.user.email||null,event_type:"login_success",success:true,severity:"info",device_label:device,user_agent:ua,session_id:ss.id,metadata:{role:membership.role||"consulta",mfa:true,enrollment_login:true}})}
   return json({ok:true,access_token:upgraded.access_token,refresh_token:upgraded.refresh_token,expires_in:upgraded.expires_in,expires_at:upgraded.expires_at,token_type:upgraded.token_type,security_session_id:securitySessionId,device_label:device},200,origin);
  }

  if(action==="cancel_enrollment"){const factorId=clean(body?.factor_id,80),factor=allFactors.find((f:any)=>String(f?.id)===factorId&&f?.status!=="verified");if(factor)await userClient.auth.mfa.unenroll({factorId:factor.id});return json({ok:true},200,origin)}

  if(action==="unenroll"){
   const factorId=clean(body?.factor_id,80),factor=verified.find((f:any)=>String(f?.id)===factorId);if(!factor)return json({error:"Factor 2FA no encontrado."},404,origin);
   if(required&&verified.length<=1)return json({error:"Los administradores deben mantener al menos un factor 2FA activo. Si perdió el dispositivo, solicite recuperación a otro administrador."},403,origin);
   const removed=await userClient.auth.mfa.unenroll({factorId});if(removed.error)return json({error:removed.error.message||"No se pudo desactivar el factor."},400,origin);
   await admin.from("security_events").insert({workspace_id:membership.workspace_id,user_id:auth.user.id,email:auth.user.email||null,event_type:"mfa_unenrolled",success:true,severity:"warning",metadata:{factor_type:factor.factor_type}});return json({ok:true},200,origin);
  }
  return json({error:"Operación 2FA no reconocida."},400,origin);
 }catch(error){console.error("secure-mfa",error instanceof Error?error.message:"unknown");return json({error:"No se pudo completar la operación de verificación."},500,origin)}
});
