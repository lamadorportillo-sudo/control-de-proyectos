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
assert.match(bot.answer('ayuda'),/Reviso normativa/i,'ofrece ayuda legal y funcional con voz de Halu');
assert.match(bot.answer('consulta desconocida'),/¿Hablamos del control/i,'responde sin inventar contenido');
assert.match(bot.answer('bien y tu'),/Me alegra saberlo/i,'responde a una continuación social');
assert.match(bot.answer('necesito ayuda'),/qué tienes trabado/i,'invita a explicar la necesidad');
assert.match(bot.answer('hola'),/¿Cómo estás tú\?/i,'reinicia una conversación cordial');
assert.match(bot.answer('pues aquí tranquilo y tu'),/pendiente de la obra/i,'comprende una frase social natural');
assert.match(bot.answer('me llamo Luis'),/Mucho gusto, Luis/i,'recuerda el nombre durante la conversación');
assert.match(bot.answer('gracias'),/A la orden/i,'responde con cortesía');
assert.match(bot.answer('recuerda que el acarreo del tramo norte quedó pendiente'),/Anotado/i,'acepta memoria explícita');
assert.match(bot.answer('qué recuerdas del tramo norte'),/acarreo del tramo norte/i,'retoma recuerdos compartidos');
assert.match(bot.answer('eres una inteligencia artificial'),/asistente digital/i,'mantiene transparencia cuando se le pregunta directamente');
assert.match(bot.answer('a que bueno espero me ayudes a llevar un buen control'),/lo contratado, lo ejecutado y lo pagado/i,'responde de inmediato a compromisos conversacionales');
assert.match(bot.answer('voy a registrar una visita'),/abierta la visita/i,'activa el modo de visita en el proyecto actual');
assert.match(bot.answer('avance físico de 35 por ciento, hay 12 trabajadores y el clima está nublado'),/Anotado/i,'captura una observación dictada en campo');
assert.match(bot.answer('resumen'),/avance 35\.00%.*12 personas.*Nublado/i,'resume los datos estructurados de la visita');
assert.match(bot.answer('guardar visita'),/Visita N.º 1 guardada/i,'guarda la bitácora en el módulo de visitas');
assert.equal(context.db.visits.length,1,'crea una visita vinculada al expediente');
assert.ok(fs.statSync('engineer-assistant-avatar.png').size>1000,'el avatar del ingeniero existe');
assert.match(fs.readFileSync('engineer-chatbot-v3.js','utf8'),/Halu · Ingeniero Civil/,'presenta la identidad profesional de Halu');
assert.match(fs.readFileSync('engineer-chatbot-v3.js','utf8'),/data-q="Camina por la pantalla">Caminar/,'muestra la opcion rapida para caminar');
assert.match(fs.readFileSync('engineer-chatbot-v3.js','utf8'),/data-q="Ponte aquí">Colocar avatar/,'muestra la opcion para colocar el avatar');

assert.match(fs.readFileSync('engineer-chatbot-v3.js','utf8'),/haluCloudContext\(q\)/,'envía a Halu el contexto técnico relacionado con la consulta');

console.log('engineer-chatbot: 27 verificaciones superadas');
