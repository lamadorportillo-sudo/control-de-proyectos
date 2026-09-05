import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.0";

const allowedOrigins=new Set(["https://lamadorportillo-sudo.github.io","http://localhost:8000","http://127.0.0.1:8000","http://localhost:4173","http://127.0.0.1:4173"]);
function cors(req:Request){const origin=req.headers.get("origin")||"";return{"Access-Control-Allow-Origin":allowedOrigins.has(origin)?origin:"https://lamadorportillo-sudo.github.io","Vary":"Origin","Access-Control-Allow-Headers":"authorization, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"}}
const json=(req:Request,body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors(req),"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
const clean=(v:unknown,n=5000)=>String(v??"").replace(/[\u0000-\u001f\u007f]/g," ").trim().slice(0,n);
function outputText(data:any){if(typeof data?.output_text==="string")return data.output_text.trim();return(Array.isArray(data?.output)?data.output:[]).flatMap((x:any)=>Array.isArray(x?.content)?x.content:[]).filter((x:any)=>x?.type==="output_text"&&typeof x.text==="string").map((x:any)=>x.text.trim()).filter(Boolean).join("\n")}
function b64(buf:ArrayBuffer){const bytes=new Uint8Array(buf);let out="";const chunk=0x8000;for(let i=0;i<bytes.length;i+=chunk){out+=String.fromCharCode(...bytes.subarray(i,Math.min(i+chunk,bytes.length)))}return btoa(out)}
function parseJson(text:string){let t=text.trim();if(t.startsWith("```")){t=t.replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/i,"")}try{return JSON.parse(t)}catch{const a=t.indexOf("{"),b=t.lastIndexOf("}");if(a>=0&&b>a)return JSON.parse(t.slice(a,b+1));throw new Error("La IA no devolvió JSON válido.")}}

const categoryLabels:Record<string,string>={signed_contract:"Contrato firmado",signed_start_order:"Orden de inicio firmada",payment_order:"Orden de pago",payment_summary:"Resumen de pago",advance_guarantee:"Garantía de anticipo",maintenance_guarantee:"Garantía de mantenimiento",performance_guarantee:"Garantía de cumplimiento",quality_guarantee:"Garantía de calidad",provisional_acceptance:"Acta de recepción provisional",final_acceptance:"Acta de recepción definitiva"};

Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS")return new Response("ok",{headers:cors(req)});
  if(req.method!=="POST")return json(req,{error:"Método no permitido."},405);
  const origin=req.headers.get("origin");if(origin&&!allowedOrigins.has(origin))return json(req,{error:"Origen no autorizado."},403);
  const supabaseUrl=Deno.env.get("SUPABASE_URL")||"",serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"",apiKey=Deno.env.get("OPENAI_API_KEY")||"";
  if(!apiKey)return json(req,{error:"El análisis inteligente no está habilitado."},503);
  const token=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");
  const admin=createClient(supabaseUrl,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:auth,error:authErr}=await admin.auth.getUser(token);if(authErr||!auth.user)return json(req,{error:"Sesión no válida."},401);
  const {data:member}=await admin.from("workspace_members").select("workspace_id,role,active").eq("user_id",auth.user.id).eq("active",true).limit(1).maybeSingle();
  if(!member)return json(req,{error:"No hay espacio de trabajo autorizado."},403);
  try{
    const body=await req.json();
    const storagePath=clean(body?.storagePath,1200),category=clean(body?.category,80),filename=clean(body?.filename,180),mime=clean(body?.mime,120),project=body?.project||{},payment=body?.payment||null;
    if(!storagePath||!filename)return json(req,{error:"Falta identificar el archivo."},400);
    if(!storagePath.startsWith(`${member.workspace_id}/contracts/`))return json(req,{error:"El archivo no pertenece a este espacio de trabajo."},403);
    const {data:file,error:fileErr}=await admin.storage.from("project-files").download(storagePath);if(fileErr||!file)return json(req,{error:"No se pudo leer el archivo almacenado."},404);
    if(file.size>20*1024*1024)return json(req,{error:"El archivo es demasiado grande para análisis automático. Queda archivado, pero debe revisarse manualmente."},413);
    const base64=b64(await file.arrayBuffer()),label=categoryLabels[category]||category||"Documento contractual";
    const context={projectCode:clean(project?.code,120),projectName:clean(project?.name,300),contractNumber:clean(project?.contractNumber,120),contractor:clean(project?.contractor,240),contractAmount:Number(project?.contractAmount)||null,payment:payment?{id:clean(payment.id,120),number:Number(payment.number)||null,start:clean(payment.start,30),end:clean(payment.end,30),gross:Number(payment.gross)||null,net:Number(payment.net)||null,paymentDate:clean(payment.paymentDate,30),paymentOrder:clean(payment.paymentOrder,120)}:null};
    const prompt=`Analiza este archivo como respaldo de CONTROL CONTRACTUAL. Tipo esperado: ${label}.\nContexto registrado: ${JSON.stringify(context)}\n\nDevuelve SOLO un objeto JSON válido, sin markdown. No inventes datos ni completes por conocimiento externo. Si algo no es legible usa null. Extrae todo dato útil para alimentar una base de datos contractual. Esquema:\n{\n"document_type":"",\n"summary":"",\n"confidence":0,\n"document_number":null,\n"document_date":null,\n"project_code":null,\n"project_name":null,\n"contract_number":null,\n"contractor":null,\n"issuer":null,\n"beneficiary":null,\n"amount":null,\n"gross_amount":null,\n"net_amount":null,\n"period_start":null,\n"period_end":null,\n"payment_number":null,\n"payment_date":null,\n"invoice_number":null,\n"receipt_number":null,\n"guarantee_number":null,\n"guarantee_type":null,\n"guarantee_percentage":null,\n"guarantee_amount":null,\n"valid_from":null,\n"valid_to":null,\n"deductions":{"advance":null,"quality":null,"isr":null,"other":null,"total":null},\n"parties":[],\n"key_facts":[],\n"warnings":[],\n"discrepancies":[]\n}\nCompara contra el contexto registrado. En discrepancies indica diferencias entre documento y sistema, sin cambiar silenciosamente los datos. Fechas en YYYY-MM-DD y montos como número sin símbolos.`;
    const content:any[]=[{type:"input_text",text:prompt}];
    if(/^image\//i.test(mime||file.type)){content.push({type:"input_image",image_url:`data:${mime||file.type||"image/jpeg"};base64,${base64}`,detail:"high"})}
    else content.push({type:"input_file",filename,file_data:base64});
    const response=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({model:Deno.env.get("OPENAI_MODEL")||"gpt-5.4",store:false,max_output_tokens:1800,input:[{role:"user",content}]})});
    const data=await response.json();if(!response.ok){console.error("contract-document-analyzer OpenAI",response.status,data?.error?.code||data?.error?.message||"unknown");return json(req,{error:"El archivo quedó guardado, pero no pudo analizarse automáticamente en este momento."},502)}
    const text=outputText(data);if(!text)return json(req,{error:"El archivo quedó guardado, pero el análisis no devolvió información."},502);
    const analysis=parseJson(text);analysis.analyzedAt=new Date().toISOString();analysis.engine="ZORDON Document Intelligence";return json(req,{analysis});
  }catch(err){console.error("contract-document-analyzer",err instanceof Error?err.message:String(err));return json(req,{error:"El archivo quedó guardado, pero no se pudo completar el análisis automático."},400)}
});