import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.0";

const U=Deno.env.get("SUPABASE_URL")??"";
const K=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")??"";
const db=createClient(U,K,{auth:{persistSession:false,autoRefreshToken:false}});
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const esc=(v:string)=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]||m));
const json=(b:any,s=200)=>new Response(JSON.stringify(b),{status:s,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});

Deno.serve(async(req:Request)=>{
  try{
    if(req.method!=="GET")return json({error:"method"},405);
    const url=new URL(req.url),token=(url.searchParams.get("t")||"").trim();
    if(!token)return json({ok:true,service:"document-public",version:"1.0-qr"});
    if(!uuid.test(token))return json({error:"invalid token"},400);
    const {data:r,error}=await db.from("generated_reports").select("id,project_id,title,report_type,format,storage_path,mime_type,file_name,created_at,public_access_enabled,public_access_expires_at,lifecycle_status,public_view_count").eq("public_token",token).maybeSingle();
    if(error)throw error;
    if(!r||!r.public_access_enabled||String(r.lifecycle_status||"").toLowerCase()==="voided")return new Response("Documento no disponible",{status:404,headers:{"content-type":"text/plain; charset=utf-8"}});
    if(r.public_access_expires_at&&new Date(r.public_access_expires_at).getTime()<Date.now())return new Response("El acceso público a este documento ha vencido",{status:410,headers:{"content-type":"text/plain; charset=utf-8"}});
    await db.from("generated_reports").update({public_view_count:Number(r.public_view_count||0)+1,last_public_view_at:new Date().toISOString()}).eq("id",r.id);
    const raw=url.searchParams.get("raw")==="1";
    if(!raw){
      const {data:p}=await db.from("projects").select("code,name").eq("id",r.project_id).maybeSingle();
      const open=`${U}/functions/v1/document-public?t=${encodeURIComponent(token)}&raw=1`;
      const pdf=/pdf/i.test(r.mime_type||"");
      const html=`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(r.title||"Documento digital")}</title><style>body{margin:0;background:#07101c;color:#eef4fb;font-family:Inter,Arial,sans-serif}.wrap{max-width:1050px;margin:auto;padding:28px 18px}.card{background:#0e1927;border:1px solid #27415e;border-radius:18px;padding:20px;box-shadow:0 18px 60px rgba(0,0,0,.3)}.ey{font-size:11px;letter-spacing:.12em;color:#83b7ef;font-weight:800}.title{font-size:24px;margin:6px 0 4px}.meta{color:#9db0c4;font-size:13px}.btn{display:inline-block;margin-top:15px;background:#2563eb;color:white;text-decoration:none;padding:11px 16px;border-radius:11px;font-weight:800}.viewer{margin-top:16px;width:100%;height:75vh;border:0;border-radius:12px;background:white}@media(max-width:700px){.title{font-size:20px}.viewer{height:68vh}}</style></head><body><main class="wrap"><section class="card"><div class="ey">DOCUMENTO DIGITAL VERIFICADO</div><div class="title">${esc(r.title||"Informe")}</div><div class="meta">${esc(p?.code||"")} ${p?.name?`· ${esc(p.name)}`:""}<br>${esc(r.file_name||"")}</div><a class="btn" href="${open}" target="_blank" rel="noopener">Abrir documento digital</a>${pdf?`<iframe class="viewer" src="${open}" title="Documento digital"></iframe>`:""}</section></main></body></html>`;
      return new Response(html,{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff","content-security-policy":"default-src 'none'; style-src 'unsafe-inline'; frame-src 'self' https://*.supabase.co; img-src data:; connect-src 'none'; base-uri 'none'; form-action 'none'"}});
    }
    const {data:blob,error:de}=await db.storage.from("project-files").download(r.storage_path);
    if(de||!blob)return new Response("Archivo no disponible",{status:404,headers:{"content-type":"text/plain; charset=utf-8"}});
    const inline=/^(application\/pdf|text\/html|image\/)/i.test(r.mime_type||"");
    const bytes=await blob.arrayBuffer();
    return new Response(bytes,{headers:{"content-type":r.mime_type||"application/octet-stream","content-disposition":`${inline?"inline":"attachment"}; filename*=UTF-8''${encodeURIComponent(r.file_name||"documento")}`,"cache-control":"private, no-store","x-content-type-options":"nosniff",...(String(r.mime_type||"").startsWith("text/html")?{"content-security-policy":"default-src 'none'; style-src 'unsafe-inline'; img-src data: https:; font-src data:; base-uri 'none'; form-action 'none'"}:{})}});
  }catch(e){console.error("document-public",e);return json({error:"internal"},500)}
});