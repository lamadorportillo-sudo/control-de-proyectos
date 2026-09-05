import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.0";
import QRCode from "npm:qrcode@1.5.4";

const U=Deno.env.get("SUPABASE_URL")??"";
const K=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")??"";
const A=Deno.env.get("SUPABASE_ANON_KEY")??"";
const svc=createClient(U,K,{auth:{persistSession:false,autoRefreshToken:false}});
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const allowedOrigins=new Set([
  "https://lamadorportillo-sudo.github.io",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
]);

function cors(origin:string|null){
  const safeOrigin=origin&&allowedOrigins.has(origin)?origin:"https://lamadorportillo-sudo.github.io";
  return {
    "Access-Control-Allow-Origin":safeOrigin,
    "Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods":"POST, OPTIONS",
    "Vary":"Origin",
  };
}
function json(b:any,s=200,origin:string|null=null){
  return new Response(JSON.stringify(b),{status:s,headers:{...cors(origin),"content-type":"application/json; charset=utf-8","cache-control":"no-store, max-age=0","pragma":"no-cache","x-content-type-options":"nosniff","referrer-policy":"no-referrer"}});
}
const clean=(v:any,n=300)=>String(v??"").replace(/[\u0000-\u001f\u007f]/g," ").trim().slice(0,n);
const safe=(v:string)=>clean(v,100).normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9._-]+/g,"_").replace(/^_+|_+$/g,"")||"documento";
const today=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"America/Tegucigalpa",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());

function jwtClaims(token:string){
  try{
    const part=token.split(".")[1]||"";
    if(!part)return{};
    const normalized=part.replace(/-/g,"+").replace(/_/g,"/").padEnd(Math.ceil(part.length/4)*4,"=");
    return JSON.parse(atob(normalized));
  }catch{return{}}
}

Deno.serve(async(req:Request)=>{
  const origin=req.headers.get("origin");
  try{
    if(req.method==="OPTIONS")return new Response("ok",{headers:cors(origin)});
    if(req.method!=="POST")return json({error:"method"},405,origin);
    if(origin&&!allowedOrigins.has(origin))return json({error:"forbidden origin"},403,origin);
    if(Number(req.headers.get("content-length")||0)>10_000_000)return json({error:"request too large"},413,origin);

    const auth=req.headers.get("authorization")||"";
    if(!auth.toLowerCase().startsWith("bearer "))return json({error:"unauthorized"},401,origin);
    const accessToken=auth.slice(7).trim();
    const client=createClient(U,A,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:auth}}});
    const {data:ud,error:ue}=await client.auth.getUser();
    if(ue||!ud?.user)return json({error:"unauthorized"},401,origin);

    const b=await req.json().catch(()=>({}));
    const projectId=clean(b.project_id,80),reportType=clean(b.report_type,80)||"informe",title=clean(b.title,220)||"Informe digital",sourceHtml=String(b.html||"");
    if(!uuid.test(projectId)||!sourceHtml||sourceHtml.length>2_500_000)return json({error:"invalid request"},400,origin);

    const {data:p,error:pe}=await svc.from("projects").select("id,workspace_id,code,name").eq("id",projectId).maybeSingle();
    if(pe)throw pe;
    if(!p)return json({error:"project not found"},404,origin);

    const [{data:m,error:me},{data:profile,error:pre}]=await Promise.all([
      svc.from("workspace_members").select("role,active").eq("workspace_id",p.workspace_id).eq("user_id",ud.user.id).eq("active",true).maybeSingle(),
      svc.from("profiles").select("active,security_force_reauth,security_valid_after,must_change_password,temporary_password_expires_at,mfa_required_after").eq("user_id",ud.user.id).maybeSingle(),
    ]);
    if(me||pre)throw me||pre;
    const role=String(m?.role||"").toLowerCase();
    if(!m?.active||!['admin','editor'].includes(role))return json({error:"forbidden"},403,origin);
    if(!profile?.active||profile.security_force_reauth===true)return json({error:"reauthentication required"},403,origin);
    if(profile.must_change_password&&profile.temporary_password_expires_at&&Date.now()>=new Date(profile.temporary_password_expires_at).getTime())return json({error:"password change required"},403,origin);

    const claims:any=jwtClaims(accessToken),issuedAt=Number(claims?.iat||0)*1000;
    if(profile.security_valid_after&&(!issuedAt||issuedAt<new Date(profile.security_valid_after).getTime()))return json({error:"reauthentication required"},403,origin);

    const aalResult=await client.auth.mfa.getAuthenticatorAssuranceLevel(accessToken);
    if(aalResult.error)return json({error:"security verification unavailable"},503,origin);
    const currentAal=aalResult.data?.currentLevel||String(claims?.aal||"aal1");
    const nextAal=aalResult.data?.nextLevel||currentAal;
    if(nextAal==="aal2"&&currentAal!=="aal2")return json({error:"mfa required"},403,origin);
    if(role==="admin"&&profile.mfa_required_after&&Date.now()>=new Date(profile.mfa_required_after).getTime()&&currentAal!=="aal2")return json({error:"mfa required"},403,origin);

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
    return json({ok:true,report_id:reportId,public_url:publicUrl,qr_data_url:qrData,file_name:file},200,origin);
  }catch(e){
    console.error("document-publisher",e instanceof Error?e.message:"internal");
    return json({ok:false,error:"internal"},500,origin);
  }
});
