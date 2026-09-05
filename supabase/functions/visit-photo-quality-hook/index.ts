import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.0";
import jpeg from "npm:jpeg-js@0.4.4";

const U=Deno.env.get("SUPABASE_URL")??"";
const K=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")??"";
const T=Deno.env.get("TELEGRAM_BOT_TOKEN")??"";
const db=createClient(U,K,{auth:{persistSession:false,autoRefreshToken:false}});
const clean=(v:any,n=600)=>String(v??"").replace(/[\u0000-\u001f\u007f]/g," ").trim().slice(0,n);
const json=(b:any,s=200)=>new Response(JSON.stringify(b),{status:s,headers:{"content-type":"application/json","cache-control":"no-store"}});
async function tg(method:string,body:any){const r=await fetch(`https://api.telegram.org/bot${T}/${method}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)}),d=await r.json().catch(()=>({}));if(!r.ok||d?.ok===false)throw new Error(d?.description||`Telegram ${r.status}`);return d}
const send=(chat:any,text:string)=>tg("sendMessage",{chat_id:chat,text:clean(text,3900),disable_web_page_preview:true});
async function expectedSecret(){const {data,error}=await db.from("internal_hook_secrets").select("secret").eq("name","visit_photo_quality").maybeSingle();if(error)throw error;return String(data?.secret||"")}
async function downloadTG(fileId:string){const meta=await tg("getFile",{file_id:fileId}),path=meta?.result?.file_path;if(!path)throw new Error("Telegram no devolvió file_path");const r=await fetch(`https://api.telegram.org/file/bot${T}/${path}`);if(!r.ok)throw new Error(`No se pudo descargar la fotografía (${r.status})`);const b=new Uint8Array(await r.arrayBuffer());if(b.byteLength>15*1024*1024)throw new Error("La fotografía supera 15 MB");return b}
function completeJpeg(b:Uint8Array){return b.length>1200&&b[0]===0xff&&b[1]===0xd8&&b[b.length-2]===0xff&&b[b.length-1]===0xd9}
function suspiciousGray(decoded:any){const w=Number(decoded?.width||0),h=Number(decoded?.height||0),d=decoded?.data;if(!w||!h||!d)return true;const xs=Math.max(1,Math.floor(w/160)),ys=Math.max(1,Math.floor(h/120));let total=0,neutral=0,run=0,maxRun=0;for(let y=Math.floor(h*.10);y<h;y+=ys){let row=0,rowNeutral=0;for(let x=0;x<w;x+=xs){const i=(y*w+x)*4,r=d[i],g=d[i+1],b=d[i+2];row++;total++;const n=Math.abs(r-g)<=3&&Math.abs(g-b)<=3&&r>=116&&r<=142;if(n){rowNeutral++;neutral++}}const ratio=row?rowNeutral/row:0;if(ratio>=.82){run++;maxRun=Math.max(maxRun,run)}else run=0}return(total?neutral/total:1)>.28||maxRun*ys>=Math.max(10,Math.floor(h*.08))}
function validate(bytes:Uint8Array){if(!completeJpeg(bytes))return{valid:false,reason:"archivo JPEG incompleto o truncado"};try{const dec=jpeg.decode(bytes,{useTArray:true,formatAsRGBA:true,tolerantDecoding:false,maxResolutionInMP:35,maxMemoryUsageInMB:512} as any);const w=Number(dec?.width||0),h=Number(dec?.height||0);if(!w||!h)return{valid:false,reason:"no se pudo decodificar la imagen"};if(w<320||h<240)return{valid:false,reason:`resolución demasiado baja (${w}×${h})`,width:w,height:h};if(suspiciousGray(dec))return{valid:false,reason:"se detectaron bloques grises o datos dañados",width:w,height:h};return{valid:true,width:w,height:h,size:bytes.byteLength}}catch(e){return{valid:false,reason:clean(e instanceof Error?e.message:e,220)||"error de decodificación"}}}

Deno.serve(async req=>{try{
  if(req.method==="GET")return json({ok:true,service:"visit-photo-quality-hook",version:"1.1-secret-store"});
  if(req.method!=="POST")return json({error:"method"},405);
  const expected=await expectedSecret();
  const supplied=req.headers.get("x-visit-photo-hook-secret")??"";
  if(!expected||supplied!==expected)return json({error:"unauthorized"},401);
  const b=await req.json().catch(()=>({})),evidenceId=clean(b.evidence_id,100);
  if(!evidenceId)return json({error:"evidence_id required"},400);
  const {data:e,error:ee}=await db.from("project_evidence").select("id,workspace_id,project_id,inbox_id,visit_session_id,evidence_type,telegram_file_unique_id").eq("id",evidenceId).maybeSingle();
  if(ee)throw ee;
  if(!e||e.evidence_type!=="photo"||!e.visit_session_id)return json({ok:true,skipped:true});
  const {data:i,error:ie}=await db.from("assistant_inbox").select("telegram_file_id,telegram_chat_id,telegram_message_id").eq("id",e.inbox_id).maybeSingle();
  if(ie)throw ie;
  if(!i?.telegram_file_id)throw new Error("No hay archivo de Telegram disponible para validar");
  const bytes=await downloadTG(i.telegram_file_id),v=validate(bytes);
  if(v.valid){await db.from("project_evidence").update({verification_status:"observed"}).eq("id",e.id);return json({ok:true,valid:true,width:v.width,height:v.height,size:v.size})}
  await db.from("project_evidence").update({visit_session_id:null,visit_id:null,verification_status:"needs_verification",analysis:{quality_rejected:true,quality_reason:v.reason,summary:"Fotografía rechazada por control de integridad en el momento de la visita"}}).eq("id",e.id);
  if(i.telegram_chat_id)await send(i.telegram_chat_id,`⚠️ FOTOGRAFÍA NO VÁLIDA\n\nLa imagen que acabas de enviar no pasó la verificación de calidad: ${v.reason}.\n\nNo la agregaré a la visita ni al informe. Vuelve a enviarla y la revisaré inmediatamente.`);
  return json({ok:true,valid:false,rejected:true,reason:v.reason});
}catch(e){console.error("visit-photo-quality-hook",e);return json({ok:false,error:clean(e instanceof Error?e.message:e,700)},500)}});