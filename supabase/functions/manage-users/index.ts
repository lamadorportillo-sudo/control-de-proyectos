import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.0";

const origins=new Set(["https://lamadorportillo-sudo.github.io","http://localhost:8000","http://127.0.0.1:8000"]);
const cors=(origin:string|null)=>({"Access-Control-Allow-Origin":origin&&origins.has(origin)?origin:"https://lamadorportillo-sudo.github.io","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Vary":"Origin"});
const json=(body:unknown,status:number,origin:string|null)=>new Response(JSON.stringify(body),{status,headers:{...cors(origin),"Content-Type":"application/json; charset=utf-8"}});

Deno.serve(async(req:Request)=>{
 const origin=req.headers.get("origin");if(req.method==="OPTIONS")return new Response("ok",{headers:cors(origin)});if(req.method!=="POST")return json({error:"Metodo no permitido."},405,origin);if(origin&&!origins.has(origin))return json({error:"Origen no autorizado."},403,origin);
 try{
  const url=Deno.env.get("SUPABASE_URL")||"",service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"",token=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");
  const admin=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});const {data:auth,error:authError}=await admin.auth.getUser(token);if(authError||!auth.user)return json({error:"Sesion no valida."},401,origin);
  const body=await req.json(),action=String(body.action||"");
  const {data:membership}=await admin.from("workspace_members").select("workspace_id,role,active").eq("user_id",auth.user.id).eq("active",true).limit(1).maybeSingle();if(!membership)return json({error:"No pertenece a un espacio activo."},403,origin);
  if(action==="complete_password_change"){const {error}=await admin.from("profiles").update({must_change_password:false,temporary_password_expires_at:null,updated_at:new Date().toISOString()}).eq("user_id",auth.user.id);if(error)throw error;return json({ok:true},200,origin)}
  if(membership.role!=="admin")return json({error:"Solo un administrador puede gestionar usuarios."},403,origin);
  if(action==="list"){
   const {data:members,error}=await admin.from("workspace_members").select("user_id,role,active,profiles(full_name,must_change_password,temporary_password_expires_at)").eq("workspace_id",membership.workspace_id).order("created_at");if(error)throw error;
   const {data:authUsers,error:userError}=await admin.auth.admin.listUsers({page:1,perPage:1000});if(userError)throw userError;const emails=new Map(authUsers.users.map(u=>[u.id,u.email]));
   return json({users:(members||[]).map((m:any)=>({user_id:m.user_id,email:emails.get(m.user_id)||"",role:m.role,active:m.active,full_name:m.profiles?.full_name||"",must_change_password:!!m.profiles?.must_change_password,temporary_password_expires_at:m.profiles?.temporary_password_expires_at||null}))},200,origin);
  }
  if(action!=="create")return json({error:"Accion no valida."},400,origin);
  const fullName=String(body.full_name||"").trim(),email=String(body.email||"").trim().toLowerCase(),password=String(body.password||""),role=["admin","editor","consulta"].includes(body.role)?body.role:"consulta",hours=Math.min(168,Math.max(1,Number(body.expires_in_hours)||24));
  if(fullName.length<3||fullName.length>120)return json({error:"Nombre no valido."},400,origin);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return json({error:"Correo no valido."},400,origin);if(password.length<8)return json({error:"La contrasena temporal debe tener al menos 8 caracteres."},400,origin);
  const {data:created,error:createError}=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{full_name:fullName},app_metadata:{created_by_admin:true}});if(createError||!created.user)return json({error:createError?.message||"No se pudo crear la cuenta."},400,origin);
  const expiresAt=new Date(Date.now()+hours*3600000).toISOString();
  const {error:profileError}=await admin.from("profiles").upsert({user_id:created.user.id,full_name:fullName,active:true,must_change_password:true,temporary_password_expires_at:expiresAt,updated_at:new Date().toISOString()});
  const {error:memberError}=await admin.from("workspace_members").upsert({workspace_id:membership.workspace_id,user_id:created.user.id,role,active:true});
  if(profileError||memberError){await admin.auth.admin.deleteUser(created.user.id);throw profileError||memberError}
  return json({ok:true,user_id:created.user.id,expires_at:expiresAt},201,origin);
 }catch(error){console.error(error);return json({error:"No se pudo procesar la administracion de usuarios."},500,origin)}
});
