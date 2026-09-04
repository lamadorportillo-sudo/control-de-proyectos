import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.0";

const allowedOrigins=new Set(["https://lamadorportillo-sudo.github.io","http://localhost:8000","http://127.0.0.1:8000","http://localhost:4173","http://127.0.0.1:4173"]);
function cors(req:Request){const o=req.headers.get("origin")||"";return{"Access-Control-Allow-Origin":allowedOrigins.has(o)?o:"https://lamadorportillo-sudo.github.io","Vary":"Origin","Access-Control-Allow-Headers":"authorization, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"}}
const headers={"Cache-Control":"no-store","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer"};
const json=(req:Request,body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors(req),...headers,"Content-Type":"application/json; charset=utf-8"}});
const clean=(v:unknown,n:number)=>String(v??"").replace(/[\u0000-\u001f\u007f]/g," ").trim().slice(0,n);
const norm=(v:string)=>v.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9ñ]+/g," ").trim();
function outputText(data:any){if(typeof data?.output_text==="string")return data.output_text.trim();return(Array.isArray(data?.output)?data.output:[]).flatMap((x:any)=>Array.isArray(x?.content)?x.content:[]).filter((x:any)=>x?.type==="output_text"&&typeof x?.text==="string").map((x:any)=>x.text.trim()).filter(Boolean).join("\n")}
function parseJson(text:string){const t=text.trim().replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/i,"");try{return JSON.parse(t)}catch{const a=t.indexOf("{"),b=t.lastIndexOf("}");if(a>=0&&b>a)return JSON.parse(t.slice(a,b+1));throw new Error("invalid_json")}}
function extFor(mime:string){if(mime.includes("ogg"))return"ogg";if(mime.includes("mp4"))return"m4a";if(mime.includes("mpeg"))return"mp3";if(mime.includes("wav"))return"wav";return"webm"}
function priority(v:unknown){const x=String(v||"Normal");return["Alta","Normal","Baja"].includes(x)?x:"Normal"}
function validDate(v:unknown){return /^\d{4}-\d{2}-\d{2}$/.test(String(v||""))?String(v):null}
function validTime(v:unknown){return /^([01]\d|2[0-3]):[0-5]\d$/.test(String(v||""))?String(v):null}
const arr=(v:any)=>Array.isArray(v)?v.map(x=>clean(x,1000)).filter(Boolean):[];

Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:{...cors(req),...headers}});
 if(req.method!=="POST")return json(req,{error:"Método no permitido."},405);
 const origin=req.headers.get("origin");if(origin&&!allowedOrigins.has(origin))return json(req,{error:"Origen no autorizado."},403);
 const apiKey=Deno.env.get("OPENAI_API_KEY");if(!apiKey)return json(req,{error:"El servicio de IA no está habilitado."},503);
 const url=Deno.env.get("SUPABASE_URL")||"",service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
 const token=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");
 const admin=createClient(url,service,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:auth,error:authError}=await admin.auth.getUser(token);if(authError||!auth.user)return json(req,{error:"Sesión no válida."},401);
 try{
   const body=await req.json();const meetingId=clean(body?.meeting_id,80);if(!/^[0-9a-f-]{36}$/i.test(meetingId))return json(req,{error:"Reunión no válida."},400);
   const {data:meeting,error:meetingError}=await admin.from("meeting_records").select("*").eq("id",meetingId).eq("user_id",auth.user.id).maybeSingle();
   if(meetingError||!meeting)return json(req,{error:"No se encontró la reunión."},404);
   if(!meeting.audio_path)return json(req,{error:"Esta reunión no tiene audio sincronizado."},400);
   const {data:audio,error:audioError}=await admin.storage.from("meeting-audio").download(meeting.audio_path);if(audioError||!audio)return json(req,{error:"No se pudo leer el audio."},400);
   if(audio.size>25*1024*1024)return json(req,{error:"El audio supera 25 MB. Divide la reunión en segmentos más pequeños."},413);
   const mime=meeting.audio_mime||audio.type||"audio/webm",form=new FormData();
   form.append("file",audio,`reunion.${extFor(mime)}`);form.append("model",Deno.env.get("OPENAI_TRANSCRIBE_MODEL")||"gpt-4o-mini-transcribe");form.append("language","es");
   const tr=await fetch("https://api.openai.com/v1/audio/transcriptions",{method:"POST",headers:{Authorization:`Bearer ${apiKey}`},body:form});
   const trData=await tr.json();if(!tr.ok){console.error("transcription_error",tr.status,trData?.error?.code||"unknown");return json(req,{error:"No se pudo transcribir el audio."},502)}
   const transcript=clean(trData?.text,120000);if(!transcript)return json(req,{error:"La transcripción llegó vacía."},502);
   const meetingDate=String(meeting.meeting_date||meeting.created_at||"").slice(0,10),summaryType=clean(meeting.summary_type,30)||"executive",summaryLevel=clean(meeting.summary_level,30)||"medium";
   const prompt=`Analiza completamente esta grabación de reunión en español. La persona usuaria NO quiere llenar formularios: debes extraer del contenido todo lo que razonablemente pueda determinarse.\n\nREGLAS IMPORTANTES:\n- No inventes personas, cargos, fechas, horas, montos, proyectos ni acuerdos.\n- suggested_title sí puede ser un título breve redactado por ti que describa fielmente el contenido aunque nadie haya dicho literalmente ese título.\n- project_or_topic puede inferirse solo si el tema/proyecto es claro; si no, devuelve cadena vacía.\n- participants: incluye únicamente nombres o roles que realmente se puedan identificar por lo dicho. No inventes nombres de hablantes.\n- Convierte referencias relativas como hoy, mañana, el viernes o la próxima semana usando como fecha base ${meetingDate}.\n- Si una tarea no tiene fecha u hora clara, usa null.\n- Extrae también información administrativa/técnica útil: montos, lugares, documentos, problemas, riesgos, preguntas abiertas y datos relevantes.\n- El resumen solicitado es ${summaryType}, detalle ${summaryLevel}.\n\nDevuelve SOLO JSON válido con esta estructura exacta:\n{\n "suggested_title":"título breve y fiel",\n "project_or_topic":"proyecto o tema principal, o cadena vacía",\n "summary":"resumen solicitado",\n "executive_conclusion":"conclusión de 1 a 3 frases",\n "topics":["tema"],\n "participants":["nombre o rol identificable"],\n "organizations":["institución/empresa mencionada"],\n "places":["lugar mencionado"],\n "agreements":["acuerdo"],\n "decisions":["decisión"],\n "problems":["problema u observación"],\n "risks":["riesgo"],\n "amounts":["monto exactamente mencionado"],\n "documents":["documento, informe, contrato, presupuesto, acta u otro mencionado"],\n "dates_mentioned":["fecha o referencia temporal relevante"],\n "open_questions":["pregunta o asunto sin resolver"],\n "key_facts":["dato concreto importante"],\n "assignments":[{\"title\":\"actividad concreta\",\"responsible\":\"nombre/rol o Sin responsable\",\"due_date\":\"YYYY-MM-DD o null\",\"due_time\":\"HH:MM o null\",\"priority\":\"Alta|Normal|Baja\",\"source_text\":\"frase breve que sustenta la asignación\"}]\n}\n\nTítulo previo automático: ${clean(meeting.title,300)}\nProyecto previo: ${clean(meeting.project_name,300)}\nFecha base: ${meetingDate}\n\nTRANSCRIPCIÓN:\n${transcript.slice(0,90000)}`;
   const ai=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({model:Deno.env.get("OPENAI_MODEL")||"gpt-5.4",store:false,max_output_tokens:4200,instructions:"Eres un analista profesional de reuniones. Debes transformar una grabación en información estructurada y accionable, con precisión y sin inventar datos. Devuelve únicamente JSON válido.",input:prompt})});
   const aiData=await ai.json();if(!ai.ok){console.error("analysis_error",ai.status,aiData?.error?.code||"unknown");return json(req,{error:"La transcripción se completó, pero el análisis de IA falló.",transcript},502)}
   const parsed=parseJson(outputText(aiData));const assignments=Array.isArray(parsed?.assignments)?parsed.assignments.slice(0,50):[];
   const analysis={
     topics:arr(parsed?.topics),participants:arr(parsed?.participants),organizations:arr(parsed?.organizations),places:arr(parsed?.places),agreements:arr(parsed?.agreements),decisions:arr(parsed?.decisions),problems:arr(parsed?.problems),risks:arr(parsed?.risks),amounts:arr(parsed?.amounts),documents:arr(parsed?.documents),dates_mentioned:arr(parsed?.dates_mentioned),open_questions:arr(parsed?.open_questions),key_facts:arr(parsed?.key_facts),executive_conclusion:clean(parsed?.executive_conclusion,4000),assignments
   };
   const summary=clean(parsed?.summary,30000),suggestedTitle=clean(parsed?.suggested_title,300),projectOrTopic=clean(parsed?.project_or_topic,300);
   const changes:any={transcript,summary_text:summary,analysis,updated_at:new Date().toISOString()};
   if(suggestedTitle)changes.title=suggestedTitle;
   if(projectOrTopic)changes.project_name=projectOrTopic;
   const {error:updateError}=await admin.from("meeting_records").update(changes).eq("id",meetingId).eq("user_id",auth.user.id);if(updateError)throw updateError;
   const {data:existing}=await admin.from("meeting_tasks").select("title,responsible,due_date").eq("meeting_id",meetingId).eq("user_id",auth.user.id);
   const keys=new Set((existing||[]).map((x:any)=>`${norm(x.title||"")}|${norm(x.responsible||"")}|${x.due_date||""}`));
   const rows:any[]=[];for(const a of assignments){const title=clean(a?.title,500);if(!title)continue;const responsible=clean(a?.responsible,200)||"Sin responsable",due_date=validDate(a?.due_date),due_time=validTime(a?.due_time),key=`${norm(title)}|${norm(responsible)}|${due_date||""}`;if(keys.has(key))continue;keys.add(key);rows.push({user_id:auth.user.id,meeting_id:meetingId,title,responsible,due_date,due_time,priority:priority(a?.priority),status:"Pendiente",source_text:clean(a?.source_text,1000)})}
   if(rows.length){const {error:taskError}=await admin.from("meeting_tasks").insert(rows);if(taskError)throw taskError}
   return json(req,{ok:true,meeting_id:meetingId,title:suggestedTitle,project_or_topic:projectOrTopic,transcript,summary,analysis,tasks_created:rows.length});
 }catch(e){console.error("meeting-transcribe",e instanceof Error?e.message:"unknown");return json(req,{error:"No se pudo procesar la reunión completa."},500)}
});