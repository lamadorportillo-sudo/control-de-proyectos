const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const context={
  console,window:null,setTimeout(fn){fn()},crypto:{randomUUID:()=>`id-${Date.now()}`},saveDB(){},
  localStorage:{getItem(){return null},setItem(){},removeItem(){}},
  db:{projects:[{id:'p1',code:'P-001',name:'Pavimento calle central'}],contracts:[],visits:[]},view:{screen:'project',projectId:'p1',tab:'summary'},
  document:{readyState:'loading',addEventListener(){},querySelector(){return null}},
  renderProject(){context.rendered=(context.rendered||0)+1},renderApp(){}
};
context.window=context;
vm.createContext(context);
vm.runInContext(fs.readFileSync('adaptive-chat-learning-v1.js','utf8'),context,{filename:'adaptive-chat-learning-v1.js'});
context.__ccEngineeringManual={context(query){return /concreto/i.test(query)?'MANUAL: controlar curado y vibrado. Normativa peruana solo como referencia; prevalece Honduras.':''}};
vm.runInContext(fs.readFileSync('engineer-chatbot-v3.js','utf8'),context,{filename:'engineer-chatbot-v3.js'});
const bot=context.__ccEngineerChat;

assert.match(bot.answer('¿Dónde estoy?'),/P-001/,'reconoce el expediente activo');
assert.match(bot.answer('abre pagos'),/Abrí Pagos/,'abre la pestaña solicitada');
assert.equal(context.view.tab,'estimates');
assert.equal(context.rendered,1,'renderiza el expediente al navegar');
assert.match(bot.answer('¿Cómo se relacionan los módulos?'),/usan el mismo expediente/,'explica la sincronización');
assert.match(bot.answer('recuerda que el acarreo del tramo norte quedó pendiente'),/Anotado/i,'acepta memoria explícita');
assert.match(bot.answer('qué recuerdas del tramo norte'),/acarreo del tramo norte/i,'retoma recuerdos compartidos');
assert.match(bot.answer('recuerda temporalmente que hoy revisaremos la portada'),/solo en este hilo/i,'acepta memoria temporal controlada');
assert.match(bot.answer('recuerda que el monto del contrato es L 2,000,000.00'),/Antes de usarlo.*confirma/i,'solicita confirmación para datos contractuales importantes');
assert.match(bot.answer('confirmo el monto del contrato es L 2,000,000.00'),/Confirmado/i,'confirma una memoria contractual pendiente');
assert.match(bot.answer('mi token es abc1234567890'),/información sensible/i,'rechaza credenciales antes de agregarlas al hilo');
assert.equal(bot.conversation.history.some(turn=>/abc1234567890/.test(turn.text)),false,'no conserva credenciales en el historial conversacional');
assert.match(bot.answer('eres una inteligencia artificial'),/asistente digital/i,'mantiene transparencia cuando se le pregunta directamente');
assert.match(bot.answer('voy a registrar una visita'),/abierta la visita/i,'activa el modo de visita en el proyecto actual');
assert.match(bot.answer('avance físico de 35 por ciento, hay 12 trabajadores y el clima está nublado'),/Anotado/i,'captura una observación dictada en campo');
assert.match(bot.answer('resumen'),/avance 35\.00%.*12 personas.*Nublado/i,'resume los datos estructurados de la visita');
assert.match(bot.answer('guardar visita'),/Visita N.º 1 guardada/i,'guarda la bitácora en el módulo de visitas');
assert.equal(context.db.visits.length,1,'crea una visita vinculada al expediente');
assert.ok(fs.statSync('engineer-assistant-avatar.png').size>1000,'el avatar del ingeniero existe');

const legacy=fs.readFileSync('engineer-chatbot-v3.js','utf8');
const zordonCore=fs.readFileSync('zordon-continuous-runtime-v1.js','utf8');
const zordonChat=fs.readFileSync('zordon-chat-ui-v1.js','utf8');
assert.match(zordonCore,/ZORDON · Ingeniero Civil/,'la identidad visible actual debe ser ZORDON');
assert.match(zordonCore,/Conversación personal o informal/,'el contexto personal debe separarse del contexto técnico');
assert.match(zordonCore,/personalFallback/,'debe existir respaldo conversacional sin regresar a menús técnicos');
assert.doesNotMatch(zordonCore,/Lo relaciono con lo que ya tengo en contexto:/,'no debe reaparecer el fallback robótico observado en producción');
assert.match(zordonChat,/por que te ries|porque te ries/,'el chat debe reconocer cuando el usuario cuestiona un emoji o una risa');
assert.match(zordonChat,/No me estoy riendo de ti/,'el chat debe corregir una risa fuera de contexto');
assert.match(legacy,/data-q="¿Qué puedes controlar\?">Controlar página/,'mantiene la acción rápida de control de página del motor técnico');
assert.match(legacy,/data-q="Ponte aquí">Colocar avatar/,'mantiene la acción para colocar el avatar');
assert.match(legacy,/haluCloudContext\(q\)/,'el motor técnico conserva el contexto relacionado para consultas de obra');
assert.match(bot.haluCloudContext('acarreo tramo norte'),/MEMORIA ZORDON APLICABLE/,'inyecta únicamente la memoria pertinente en el contexto técnico');
assert.match(legacy,/no lo guardaré ni lo enviaré al servicio de IA/i,'bloquea secretos antes de llamar a la IA en la nube');

console.log('engineer-chatbot: motor técnico protegido y capa conversacional ZORDON verificadas');
