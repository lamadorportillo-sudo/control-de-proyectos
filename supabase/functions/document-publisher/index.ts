import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.0";
import QRCode from "npm:qrcode@1.5.4";

const U=Deno.env.get("SUPABASE_URL")??"";
const K=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")??"";
const A=Deno.env.get("SUPABASE_ANON_KEY")??"";
const svc=createClient(U,K,{auth:{persistSession:false,autoRefreshToken:false}});
const json=(b:any,s=200)=>new Response(JSON.stringify(b),{status:s,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});
const clean=(v:any,n=300)=>String(v??"").replace(/[\u0000-\u001f\u007f]/g," ").trim().slice(0,n);
const safe=(v:string)=>clean(v,100).normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9._-]+/g,"_").replace(/^_+|_+$/g,"")||"documento";
const today=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"America/Tegucigalpa",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());

Deno.serve(async(req:Request)=>{
  try{
    if(req.method!=="POST")return json({error:"method"},405);
    const auth=req.headers.get("authorization")||"";
    if(!auth.toLowerCase().startsWith("bearer "))return json({error:"unauthorized"},401);
    const client=createClient(U,A,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:auth}}});
    const {data:ud,error:ue}=await client.auth.getUser();
    if(ue||!ud?.user)return json({error:"unauthorized"},401);
    const b=await req.json().catch(()=>({}));
    const projectId=clean(b.project_id,80),reportType=clean(b.report_type,80)||"informe",title=clean(b.title,220)||"Informe digital",sourceHtml=String(b.html||"");
    if(!projectId||!sourceHtml||sourceHtml.length>2_500_000)return json({error:"invalid request"},400);
    const {data:p,error:pe}=await svc.from("projects").select("id,workspace_id,code,name").eq("id",projectId).maybeSingle();
    if(pe)throw pe;if(!p)return json({error:"project not found"},404);
    const {data:m}=await svc.from("workspace_members").select("role,active").eq("workspace_id",p.workspace_id).eq("user_id",ud.user.id).eq("active",true).maybeSingle();
    if(!m)return json({error:"forbidden"},403);
    const reportId=crypto.randomUUID(),token=crypto.randomUUID();
    const publicUrl=`${U}/functions/v1/document-public?t=${token}`;
    const qrData=await QRCode.toDataURL(publicUrl,{width:240,margin:1,errorCorrectionLevel:"M",color:{dark:"#0B1728",light:"#FFFFFF"}});
    const qrBlock=`<section class="cc-document-qr" style="margin:24px 0 0;padding:14px;border:1px solid #d7e1eb;border-radius:12px;display:flex;gap:14px;align-items:center;break-inside:avoid;background:#fff;color:#172033"><img src="${qrData}" alt="Código QR del documento digital" width="112" height="112" style="width:112px;height:112px;object-fit:contain"><div><div style="font-size:10px;font-weight:800;letter-spacing:.08em;color:#48647c">VERSIÓN DIGITAL</div><div style="font-size:14px;font-weight:800;margin:4px 0">Escanee el código QR para consultar este informe en digital.</div><div style="font-size:9px;color:#65798d;overflow-wrap:anywhere">ID documental: ${reportId}</div></div></section>`;
    const finalHtml=/<\/body>/i.test(sourceHtml)?sourceHtml.replace(/<\/body>/i,`${qrBlock}</body>`):`${sourceHtml}${qrBlock}`;
    const bytes=new TextEncoder().encode(finalHtml),file=`informe-${safe(reportType)}-${safe(p.code||"proyecto")}-${today()}-${reportId.slice(0,8)}.html`;
    const path=`${p.workspace_id}/${p.id}/reports/digital/${today()}/${reportId}_${file}`;
    const up=await svc.storage.from("project-files").upload(path,bytes,{contentType:"text/html; charset=utf-8",upsert:false});
    if(up.error)throw up.error;
    const {error:ie}=await svc.from("generated_reports").insert({id:reportId,workspace_id:p.workspace_id,project_id:p.id,requested_by:ud.user.id,report_type:reportType,title,format:"html",storage_path:path,mime_type:"text/html",file_name:file,size_bytes:bytes.byteLength,evidence_count:0,public_token:token,public_access_enabled:true,metadata:{source:"web_report",digital_qr:true,public_url:publicUrl,project_code:p.code||null}});
    if(ie){await svc.storage.from("project-files").remove([path]);throw ie}
    return json({ok:true,report_id:reportId,public_url:publicUrl,qr_data_url:qrData,file_name:file});
  }catch(e){console.error("document-publisher",e);return json({ok:false,error:clean(e instanceof Error?e.message:e,500)},500)}
});