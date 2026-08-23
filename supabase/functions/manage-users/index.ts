import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.0";

const origins=new Set(["https://lamadorportillo-sudo.github.io","http://localhost:8000","http://127.0.0.1:8000","http://localhost:4173","http://127.0.0.1:4173"]);
const rate=new Map<string,{at:number,count:number}>();
const cors=(origin:string|null)=>({"Access-Control-Allow-Origin":origin&&origins.has(origin)?origin:"https://lamadorportillo-sudo.github.io","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Vary":"Origin"});
const securityHeaders={"Cache-Control":"no-store, max-age=0","Pragma":"no-cache","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer","X-Frame-Options":"DENY"};
const json=(body:unknown,status:number,origin:string|null)=>new Response(JSON.stringify(body),{status,headers:{...cors(origin),...securityHeaders,"Content-Type":"application/json; charset=utf-8"}});

function strongPassword(value:unknown){
 const p=String(value||"");
 if(p.length<12||p.length>128)return "Use una contraseña de 12 a 128 caracteres.";
 let groups=0;if(/[a-z]/.test(p))groups++;if(/[A-Z]/.test(p))groups++;if(/[0-9]/.test(p))groups++;if(/[^A-Za-z0-9]/.test(p))groups++;
 if(groups<3)return "Combine al menos tres tipos: mayúsculas, minúsculas, números o símbolos.";
 if(/^(123456|password|contrase|qwerty|admin|letmein)/i.test(p))return "La contraseña es demasiado predecible.";
 return "";
}

Deno.serve(async(req:Request)=>{
 const origin=req.headers.get("origin");
 if(req.method==="OPTIONS")return new Response("ok",{headers:{...cors(origin),...securityHeaders}});
 if(req.method!=="POST")return json({error:"Método no permitido."},405,origin);
 if(origin&&!origins.has(origin))return json({error:"Origen no autorizado."},403,origin);
 const length=Number(req.headers.get("content-length")||0);if(length>16000)return json({error:"Solicitud demasiado grande."},413,origin);
 try{
  const url=Deno.env.get("SUPABASE_URL")||"",service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"",token=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");
  const admin=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:auth,error:authError}=await admin.auth.getUser(token);if(authError||!auth.user)return json({error:"Sesión no válida."},401,origin);
  const key=auth.user.id,now=Date.now(),bucket=rate.get(key);if(!bucket||now-bucket.at>60000)rate.set(key,{at:now,count:1});else{bucket.count++;if(bucket.count>30)return json({error:"Demasiadas operaciones. Espere un minuto."},429,origin)}
  const body=await req.json(),action=String(body.action||"");
  const {data:membership}=await admin.from("workspace_members").select("workspace_id,role,active").eq("user_id",auth.user.id).eq("active",true).limit(1).maybeSingle();if(!membership)return json({error:"No pertenece a un espacio activo."},403,origin);
  const {data:profile}=await admin.from("profiles").select("active,must_change_password,temporary_password_expires_at").eq("user_id",auth.user.id).maybeSingle();
  if(profile?.active===false)return json({error:"Esta cuenta está desactivada."},403,origin);

  if(action==="complete_password_change")return json({error:"Flujo de seguridad obsoleto. Use el cambio protegido de contraseña."},400,origin);
  if(action==="change_password"){
   const password=String(body.password||"");const weakness=strongPassword(password);if(weakness)return json({error:weakness},400,origin);
   const {error:updateAuthError}=await admin.auth.admin.updateUserById(auth.user.id,{password});if(updateAuthError)return json({error:"No se pudo actualizar la contraseña."},400,origin);
   const {error:updateProfileError}=await admin.from("profiles").update({must_change_password:false,temporary_password_expires_at:null,updated_at:new Date().toISOString()}).eq("user_id",auth.user.id);if(updateProfileError)throw updateProfileError;
   return json({ok:true},200,origin);
  }

  if(membership.role!=="admin")return json({error:"Solo un administrador puede gestionar usuarios."},403,origin);

  if(action==="list"){
   const {data:members,error}=await admin.from("workspace_members").select("user_id,role,active,created_at").eq("workspace_id",membership.workspace_id).order("created_at");if(error)throw error;
   const memberIds=(members||[]).map((m:any)=>m.user_id);const {data:profiles,error:profileListError}=memberIds.length?await admin.from("profiles").select("user_id,full_name,active,must_change_password,temporary_password_expires_at").in("user_id",memberIds):{data:[],error:null};if(profileListError)throw profileListError;const profileById=new Map((profiles||[]).map((p:any)=>[p.user_id,p]));
   const {data:authUsers,error:userError}=await admin.auth.admin.listUsers({page:1,perPage:1000});if(userError)throw userError;const emails=new Map(authUsers.users.map(u=>[u.id,u.email]));
   return json({users:(members||[]).map((m:any)=>{const p:any=profileById.get(m.user_id)||{};return{user_id:m.user_id,email:emails.get(m.user_id)||"",role:m.role,active:m.active!==false&&p.active!==false,full_name:p.full_name||"",must_change_password:!!p.must_change_password,temporary_password_expires_at:p.temporary_password_expires_at||null}})},200,origin);
  }

  if(action==="set_active"){
   const target=String(body.user_id||""),active=body.active===true;if(!target)return json({error:"Usuario no válido."},400,origin);if(target===auth.user.id&&!active)return json({error:"No puede desactivar su propia cuenta."},400,origin);
   const {data:targetMember}=await admin.from("workspace_members").select("role,active").eq("workspace_id",membership.workspace_id).eq("user_id",target).maybeSingle();if(!targetMember)return json({error:"Usuario fuera de este espacio de trabajo."},404,origin);
   if(!active&&targetMember.role==="admin"){const {count}=await admin.from("workspace_members").select("user_id",{count:"exact",head:true}).eq("workspace_id",membership.workspace_id).eq("role","admin").eq("active",true);if((count||0)<=1)return json({error:"No se puede desactivar al último administrador activo."},400,origin)}
   const {error:mErr}=await admin.from("workspace_members").update({active}).eq("workspace_id",membership.workspace_id).eq("user_id",target);if(mErr)throw mErr;
   const {error:pErr}=await admin.from("profiles").update({active,updated_at:new Date().toISOString()}).eq("user_id",target);if(pErr)throw pErr;
   return json({ok:true,active},200,origin);
  }

  if(action==="reset_password"){
   const target=String(body.user_id||""),password=String(body.password||""),hours=Math.min(168,Math.max(1,Number(body.expires_in_hours)||24));const weakness=strongPassword(password);if(!target)return json({error:"Usuario no válido."},400,origin);if(weakness)return json({error:`Contraseña temporal: ${weakness}`},400,origin);
   const {data:targetMember}=await admin.from("workspace_members").select("user_id").eq("workspace_id",membership.workspace_id).eq("user_id",target).maybeSingle();if(!targetMember)return json({error:"Usuario fuera de este espacio de trabajo."},404,origin);
   const {error:aErr}=await admin.auth.admin.updateUserById(target,{password});if(aErr)return json({error:"No se pudo establecer la contraseña temporal."},400,origin);
   const expiresAt=new Date(Date.now()+hours*3600000).toISOString();const {error:pErr}=await admin.from("profiles").update({must_change_password:true,temporary_password_expires_at:expiresAt,updated_at:new Date().toISOString()}).eq("user_id",target);if(pErr)throw pErr;
   return json({ok:true,expires_at:expiresAt},200,origin);
  }

  if(action!=="create")return json({error:"Acción no válida."},400,origin);
  const fullName=String(body.full_name||"").trim(),email=String(body.email||"").trim().toLowerCase(),password=String(body.password||""),role=["admin","editor","consulta"].includes(body.role)?body.role:"consulta",hours=Math.min(168,Math.max(1,Number(body.expires_in_hours)||24));
  if(fullName.length<3||fullName.length>120)return json({error:"Nombre no válido."},400,origin);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>180)return json({error:"Correo no válido."},400,origin);const weakness=strongPassword(password);if(weakness)return json({error:`Contraseña temporal: ${weakness}`},400,origin);
  const {data:created,error:createError}=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{full_name:fullName},app_metadata:{created_by_admin:true}});if(createError||!created.user)return json({error:createError?.message||"No se pudo crear la cuenta."},400,origin);
  const expiresAt=new Date(Date.now()+hours*3600000).toISOString();
  const {error:profileError}=await admin.from("profiles").upsert({user_id:created.user.id,full_name:fullName,active:true,must_change_password:true,temporary_password_expires_at:expiresAt,updated_at:new Date().toISOString()});
  const {error:memberError}=await admin.from("workspace_members").upsert({workspace_id:membership.workspace_id,user_id:created.user.id,role,active:true});
  if(profileError||memberError){await admin.auth.admin.deleteUser(created.user.id);throw profileError||memberError}
  return json({ok:true,user_id:created.user.id,expires_at:expiresAt},201,origin);
 }catch(error){console.error(error);return json({error:"No se pudo procesar la administración de usuarios."},500,origin)}
});
