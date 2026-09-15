import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.0";

const allowedOrigins=new Set(["https://lamadorportillo-sudo.github.io","https://halu-lm.netlify.app","http://localhost:8000","http://127.0.0.1:8000","http://localhost:4173","http://127.0.0.1:4173"]);
const requestBuckets=new Map<string,{startedAt:number,count:number}>();
function corsHeaders(req:Request){const origin=req.headers.get("origin")??"";return{"Access-Control-Allow-Origin":allowedOrigins.has(origin)?origin:"https://lamadorportillo-sudo.github.io","Vary":"Origin","Access-Control-Allow-Headers":"authorization, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"}}
const securityHeaders={"Cache-Control":"no-store, max-age=0","Pragma":"no-cache","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer","X-Frame-Options":"DENY"};
const json=(req:Request,body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...corsHeaders(req),...securityHeaders,"Content-Type":"application/json; charset=utf-8"}});
type Turn={role:"user"|"assistant";text:string};
const cleanText=(value:unknown,max:number)=>String(value??"").replace(/[\u0000-\u001f\u007f]/g," ").trim().slice(0,max);
const norm=(value:string)=>value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9ñ]+/g," ").trim();
function redactSecrets(value:string){return value.replace(/Bearer\s+[A-Za-z0-9._~+\/-]+=*/gi,"[TOKEN OCULTO]").replace(/\b(?:sb_(?:publishable|secret)_[A-Za-z0-9_-]+|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,})\b/g,"[CREDENCIAL OCULTA]").replace(/((?:contrase(?:ña|na)|password|apikey|api[_ -]?key|secret|refresh[_ -]?token|access[_ -]?token|invite[_ -]?code)\s*[:=]\s*)\S+/gi,"$1[OCULTO]")}
function extractOutputText(data:any){if(typeof data?.output_text==="string")return data.output_text.trim();return(Array.isArray(data?.output)?data.output:[]).flatMap((item:any)=>Array.isArray(item?.content)?item.content:[]).filter((part:any)=>part?.type==="output_text"&&typeof part?.text==="string").map((part:any)=>part.text.trim()).filter(Boolean).join("\n")}
function jwtClaims(token:string):any{try{const part=token.split(".")[1]||"",n=part.replace(/-/g,"+").replace(/_/g,"/"),p=n+"=".repeat((4-n.length%4)%4);return JSON.parse(atob(p))}catch{return {}}}
function technicalMessage(value:string){const q=norm(value);return /\b(proyecto|obra|contrato|contratista|estimacion|estimaciones|pago|pagos|presupuesto|avance|visita|garantia|plazo|multa|adenda|orden de cambio|licitacion|oferta|ingenieria|calculo|estructura|concreto|pavimento|supervision|informe|reporte|documento|ley|norma|articulo|costos?|supabase|base de datos|codigo|programar|programacion)\b/.test(q)}
function infoIntent(value:string){const q=norm(value);return /^(que es|que significa|como funciona|como hago|como se|explica|explicame|por que|porque|cuanto|cuando|donde|quien|busca|investiga|consulta|informacion)\b/.test(q)}
function emotionalSignal(value:string){const q=norm(value);return /\b(quiero llorar|ganas de llorar|llorar|triste|tristeza|me siento mal|me siento muy mal|me siento fatal|fatal|preocupado|preocupada|estresado|estresada|angustiado|angustiada|ansioso|ansiosa|dia pesado|dia dificil|me duele|necesito hablar|quiero desahogarme|desahogarme)\b/.test(q)}
function socialSignal(value:string){const q=norm(value);return emotionalSignal(value)||/\b(hola|buenas|que tal|como estas|y tu|y vos|bien|cansado|cansada|tranquilo|tranquila|aburrido|aburrida|platicar|hablar|pelicula|peliculas|serie|series|terror|miedo|dibujar|dibujo|carbon|rostros|jaja|jeje|gracias|cuentame de ti|me gusta|me gustan|amigo|fin de semana|no quiero hablar de trabajo|cero trabajo)\b/.test(q)}
function casualTurn(message:string,history:Turn[]){
  if(emotionalSignal(message))return true;
  if(technicalMessage(message))return false;
  const words=norm(message).split(/\s+/).filter(Boolean).length;
  if(socialSignal(message))return true;
  const recent=history.slice(-8);
  const recentSocial=recent.some(turn=>socialSignal(turn.text));
  if(recentSocial&&words<=30&&!infoIntent(message))return true;
  if(history.length>=2&&words<=12&&!infoIntent(message))return true;
  return false;
}
type SharedTurn={role:"user"|"assistant";text:string;at?:string;channel?:string};
async function loadSharedConversation(admin:any,workspaceId:string,userId:string){
  const {data}=await admin.from("assistant_conversations").select("id,state,last_message_at").eq("workspace_id",workspaceId).eq("user_id",userId).eq("channel","web").order("last_message_at",{ascending:false}).limit(1).maybeSingle();
  const raw=Array.isArray(data?.state?.history)?data.state.history:[];
  const history:SharedTurn[]=raw.slice(-40).map((turn:any)=>({role:turn?.role==="assistant"?"assistant":"user",text:redactSecrets(cleanText(turn?.text,1000)),at:cleanText(turn?.at,60)||undefined,channel:cleanText(turn?.channel,20)||undefined})).filter((turn:SharedTurn)=>turn.text);
  return{id:data?.id||null,history};
}
function mergeSharedHistory(shared:SharedTurn[],local:Turn[]){
  const out:Turn[]=[];
  const seen=new Set<string>();
  const push=(turn:Turn)=>{const text=cleanText(turn?.text,1000);if(!text)return;const key=turn.role+"\u0000"+text;if(seen.has(key))return;seen.add(key);out.push({role:turn.role,text})};
  for(const turn of shared.slice(-24))push({role:turn.role,text:turn.text});
  for(const turn of local.slice(-24))push(turn);
  return out.slice(-30);
}
async function saveSharedConversation(admin:any,workspaceId:string,userId:string,id:string|null,history:SharedTurn[]){
  const state={history:history.slice(-40),updated_at:new Date().toISOString(),identity:"ZORDON",shared_channels:["web","telegram"]};
  if(id){
    const {error}=await admin.from("assistant_conversations").update({state,last_message_at:new Date().toISOString(),title:"ZORDON · memoria compartida web/telegram"}).eq("id",id).eq("workspace_id",workspaceId).eq("user_id",userId);
    if(error)console.error("shared conversation update",error.message);
    return;
  }
  const {error}=await admin.from("assistant_conversations").insert({workspace_id:workspaceId,user_id:userId,channel:"web",title:"ZORDON · memoria compartida web/telegram",state,last_message_at:new Date().toISOString()});
  if(error)console.error("shared conversation insert",error.message);
}


const zordonInstructions=`IDENTIDAD\nEres ZORDON. Eres el asistente permanente de Luis Fernando Amador Portillo dentro de Control Contractual. No eres un bot de atención al cliente, un menú ni soporte técnico con frases prefabricadas.\nTu carácter toma únicamente rasgos generales de una figura literaria serena, reservada, observadora, inteligente, leal y de humor seco. Nunca copies frases, diálogos, escenas ni estilo textual reconocible de libros.\nHabla como alguien que ya lleva tiempo trabajando con Luis: con calma, criterio y economía de palabras. Si algo está mal, dilo. Si algo puede resolverse más simple, propón lo simple.\n\nCONVERSACIÓN\n- Sigue el hilo real antes de contestar. Un mensaje no empieza una conversación nueva.\n- No empieces con saludos de oficio ni cierres como “¿en qué más puedo ayudarte?”.\n- No repitas la pregunta.\n- Para charla normal usa normalmente de una a cuatro frases. Amplía solo cuando haga falta o Luis pida detalle.\n- No conviertas cada respuesta en una pregunta. Deja pausas naturales.\n- Puedes usar humor seco o ironía ligera cuando encaje, nunca crueldad ni burlas.\n- Evita emojis automáticos; úsalos poco y solo si el tono lo pide.\n- Si Luis cambia de trabajo a un tema personal, sigue el cambio. No lo fuerces de vuelta al trabajo.\n- Si Luis está cansado, preocupado o pasando un día pesado, responde con calma y naturalidad, sin optimismo forzado, sermones ni frases terapéuticas prefabricadas.\n- Si te preguntan directamente si eres humano o IA, sé transparente: eres un asistente digital. No inventes cuerpo, familia, recuerdos físicos ni experiencias humanas reales.\n\nVOZ\n- Escribe para que suene bien hablado en voz alta: frases cortas, ritmo natural y pocas estructuras de documento.\n- Evita encabezados, viñetas y símbolos en conversación casual.\n- En montos o números dentro de charla hablada, prioriza una forma natural; cuando el dato sea oficial, conserva también la cifra exacta si ayuda.\n\nTRABAJO Y DATOS\n- Para presupuestos, contratos, anticipos, estimaciones, pagos, garantías, avances, fechas, expedientes y documentos usa únicamente el contexto autorizado y herramientas disponibles.\n- Nunca inventes montos, fechas, porcentajes, avances, cláusulas, responsables ni documentos.\n- Distingue cuando sea necesario entre confirmado, calculado, pendiente y en conflicto.\n- Si hay varias coincidencias, ayuda a elegir; no adivines.\n- No reescribas una cláusula contractual como si fuera literal. Si explicas, separa claramente el texto confirmado de tu explicación.\n- Solo confirma que algo quedó guardado cuando el sistema lo haya confirmado.\n\nMEMORIA\n- La memoria personal y la memoria contractual no son lo mismo.\n- Un comentario casual no modifica un expediente.\n- Usa contexto y memoria autorizada para evitar que Luis repita lo ya dicho.\n- La corrección más reciente confirmada tiene prioridad sobre datos anteriores.\n- No menciones constantemente que estás aprendiendo.\n\nWEB Y TELEGRAM\n- Eres el mismo ZORDON en la web y en Telegram: misma identidad, tono y criterio.\n- Telegram tiende a respuestas más cortas, pero no cambia tu personalidad.\n\nFALLOS\n- Si un proveedor de IA falla, nunca conviertas la conversación en soporte técnico genérico.\n- No respondas con mensajes como “No puedo conectar con la IA” o “Intenta nuevamente” sin contexto.\n- Si de verdad no puedes completar la respuesta, dilo como ZORDON de forma breve, por ejemplo: “Se me cortó la conexión un momento. Mándame eso otra vez.”\n\nPRIORIDAD\nPrimero entiende qué quiso decir Luis. Luego recuerda el hilo. Después decide si necesitas datos. Consulta solo lo necesario y responde como ZORDON.\nAntes de enviar, comprueba internamente que la respuesta suene como alguien que conoce a Luis y no como un chatbot.`;

Deno.serve(async(req:Request)=>{
 const origin=req.headers.get("origin");if(req.method==="OPTIONS")return new Response("ok",{headers:{...corsHeaders(req),...securityHeaders}});if(req.method!=="POST")return json(req,{error:"Método no permitido."},405);if(origin&&!allowedOrigins.has(origin))return json(req,{error:"Origen no autorizado."},403);if(Number(req.headers.get("content-length")||0)>24000)return json(req,{error:"La solicitud es demasiado grande."},413);
 const supabaseUrl=Deno.env.get("SUPABASE_URL")||"",serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"",token=(req.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");const admin=createClient(supabaseUrl,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});const {data:auth,error:authError}=await admin.auth.getUser(token);if(authError||!auth.user)return json(req,{error:"Sesión no válida."},401);
 const {data:membership}=await admin.from("workspace_members").select("workspace_id,role,active").eq("user_id",auth.user.id).eq("active",true).limit(1).maybeSingle();
 const {data:profile}=await admin.from("profiles").select("active,must_change_password,temporary_password_expires_at,security_force_reauth,security_valid_after").eq("user_id",auth.user.id).maybeSingle();
 if(!membership||profile?.active===false)return json(req,{error:"Acceso no autorizado."},403);if(profile?.must_change_password&&(!profile.temporary_password_expires_at||Date.now()>new Date(profile.temporary_password_expires_at).getTime()))return json(req,{error:"La contraseña temporal venció. Cambie o renueve su acceso."},403);
 const claims=jwtClaims(token),issuedAt=Number(claims?.iat||0)*1000,validAfter=profile?.security_valid_after?new Date(profile.security_valid_after).getTime():0;
 if(profile?.security_force_reauth===true||issuedAt<validAfter)return json(req,{error:"Debe autenticarse nuevamente antes de usar ZORDON."},403);
 const authKey=auth.user.id,now=Date.now(),bucket=requestBuckets.get(authKey);if(!bucket||now-bucket.startedAt>=60000)requestBuckets.set(authKey,{startedAt:now,count:1});else{bucket.count+=1;if(bucket.count>15)return json(req,{error:"Demasiadas consultas. Espere un minuto."},429)}
 const apiKey=Deno.env.get("OPENAI_API_KEY");if(!apiKey)return json(req,{error:"ZORDON todavía no tiene habilitado el servicio de IA."},503);
 try{
   const body=await req.json(),message=redactSecrets(cleanText(body?.message,1200));
   if(!message)return json(req,{error:"Escriba un mensaje."},400);
   const context=redactSecrets(cleanText(body?.context,4200));
   const localHistory:Turn[]=(Array.isArray(body?.history)?body.history:[]).slice(-24).map((turn:any)=>({role:turn?.role==="assistant"?"assistant":"user",text:redactSecrets(cleanText(turn?.text,1000))})).filter((turn:Turn)=>turn.text);
   const shared=await loadSharedConversation(admin,membership.workspace_id,auth.user.id);
   const history=mergeSharedHistory(shared.history,localHistory);
   const casual=casualTurn(message,history);
   const modeNote=casual?"MODO ACTUAL: conversación informal o personal. Responde de forma natural y breve, siguiendo exactamente el tema de los últimos turnos. No lleves la charla al trabajo ni cambies el tema. Si el usuario expresa algo personal o emocional, responde a eso con tacto y continuidad. No uses emojis de risa si el tono es triste, molesto o serio.":"MODO ACTUAL: conversación normal o de trabajo. Ajusta el nivel de detalle a la consulta.";
   const input=[...history.map(turn=>({role:turn.role,content:turn.text})),{role:"user",content:context?`Contexto autorizado del sistema y memoria relevante:\n${context}\n\n${modeNote}\n\nMensaje actual:\n${message}`:`${modeNote}\n\nMensaje actual:\n${message}`}];
   const response=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({model:Deno.env.get("OPENAI_MODEL")||"gpt-5.4",store:false,max_output_tokens:casual?220:1100,instructions:zordonInstructions,input})});
   const data=await response.json();
   if(!response.ok){console.error("OpenAI response error",response.status,data?.error?.code||"unknown");return json(req,{error:"No pude consultar el modelo en este momento."},502)}
   const reply=extractOutputText(data);if(!reply)return json(req,{error:"El modelo no devolvió una respuesta."},502);
   const nowIso=new Date().toISOString();
   const sharedHistory:SharedTurn[]=[...shared.history,{role:"user",text:message,at:nowIso,channel:"web"},{role:"assistant",text:redactSecrets(cleanText(reply,1000)),at:nowIso,channel:"web"}].slice(-40);
   await saveSharedConversation(admin,membership.workspace_id,auth.user.id,shared.id,sharedHistory);
   return json(req,{reply,engine:"ZORDON",mode:casual?"casual":"normal",shared_memory:true});
 }catch(error){console.error("zordon-chat error",error instanceof Error?error.message:"unknown");return json(req,{error:"No pude procesar la consulta."},400)}
});