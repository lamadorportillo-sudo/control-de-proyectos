import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.0";

const U=Deno.env.get("SUPABASE_URL")??"";
const K=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")??"";
const db=createClient(U,K,{auth:{persistSession:false,autoRefreshToken:false}});
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const esc=(v:string)=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]||m));
const baseHeaders={"cache-control":"no-store, max-age=0","pragma":"no-cache","x-content-type-options":"nosniff","referrer-policy":"no-referrer"};
const json=(b:any,s=200)=>new Response(JSON.stringify(b),{status:s,headers:{...baseHeaders,"content-type":"application/json; charset=utf-8"}});
const text=(body:string,status:number)=>new Response(body,{status,headers:{...baseHeaders,"content-type":"text/plain; charset=utf-8"}});
const fileName=(value:string)=>String(value||"documento").replace(/[\\/:*?"<>|\r\n]+/g,"_").trim()||"documento";

Deno.serve(async(req:Request)=>{
  try{
    if(req.method!=="GET")return json({error:"method"},405);
    const url=new URL(req.url),token=(url.searchParams.get("t")||"").trim();
    if(!token)return json({ok:true,service:"document-public",version:"1.1-qr-hardened"});
    if(!uuid.test(token))return json({error:"invalid token"},400);
    const {data:r,error}=await db.from("generated_reports").select("id,project_id,title,report_type,format,storage_path,mime_type,file_name,created_at,public_access_enabled,public_access_expires_at,lifecycle_status,public_view_count").eq("public_token",token).maybeSingle();
    if(error)throw error;
    if(!r||!r.public_access_enabled||String(r.lifecycle_status||"").toLowerCase()==="voided")return text("Documento no disponible",404);
    if(r.public_access_expires_at&&new Date(r.public_access_expires_at).getTime()<Date.now())return text("El acceso público a este documento ha vencido",410);
    await db.from("generated_reports").update({public_view_count:Number(r.public_view_count||0)+1,last_public_view_at:new Date().toISOString()}).eq("id",r.id);
    const {data:blob,error:de}=await db.storage.from("project-files").download(r.storage_path);
    if(de||!blob)return text("Archivo no disponible",404);
    const mime=String(r.mime_type||"application/octet-stream"),isHtml=mime.toLowerCase().startsWith("text/html"),inline=/^(application\/pdf|image\/)/i.test(mime),forceDownload=url.searchParams.get("download")==="1"||isHtml;
    const bytes=await blob.arrayBuffer();
    const htmlSecurity=isHtml?{
      "content-security-policy":"sandbox; default-src 'none'; style-src 'unsafe-inline'; img-src data: https:; font-src data:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
      "x-frame-options":"DENY",
    }:{};
    return new Response(bytes,{headers:{...baseHeaders,"content-type":mime,"content-disposition":`${!forceDownload&&inline?"inline":"attachment"}; filename*=UTF-8''${encodeURIComponent(fileName(r.file_name||"documento"))}`,...htmlSecurity}});
  }catch(e){console.error("document-public",e instanceof Error?e.message:"internal");return json({error:"internal"},500)}
});
