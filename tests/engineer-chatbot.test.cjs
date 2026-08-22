const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const context={
  console,window:null,setTimeout(fn){fn()},
  db:{projects:[{id:'p1',code:'P-001'}]},view:{screen:'project',projectId:'p1',tab:'summary'},
  document:{readyState:'loading',addEventListener(){},querySelector(){return null}},
  renderProject(){context.rendered=(context.rendered||0)+1},renderApp(){}
};
context.window=context;
vm.createContext(context);
vm.runInContext(fs.readFileSync('engineer-chatbot-v1.js','utf8'),context,{filename:'engineer-chatbot-v1.js'});
const bot=context.__ccEngineerChat;

assert.match(bot.answer('¿Dónde estoy?'),/P-001/,'reconoce el expediente activo');
assert.match(bot.answer('abre pagos'),/Abrí Pagos/,'abre la pestaña solicitada');
assert.equal(context.view.tab,'estimates');
assert.equal(context.rendered,1,'renderiza el expediente al navegar');
assert.match(bot.answer('¿Cómo se relacionan los módulos?'),/misma información del expediente/,'explica la sincronización');
assert.match(bot.answer('ayuda'),/Puedo buscar disposiciones/,'ofrece ayuda legal y funcional');
assert.match(bot.answer('consulta desconocida'),/Puedo ayudarte/,'responde sin inventar contenido');
assert.match(bot.answer('bien y tu'),/Me alegra saberlo/i,'responde a una continuación social');
assert.match(bot.answer('necesito ayuda'),/cuenta conmigo/i,'invita a explicar la necesidad');
assert.match(bot.answer('hola'),/¿Cómo estás tú\?/i,'reinicia una conversación cordial');
assert.match(bot.answer('pues aquí tranquilo y tu'),/me alegra que estés tranquilo/i,'comprende una frase social natural');
assert.match(bot.answer('me llamo Luis'),/Mucho gusto, Luis/i,'recuerda el nombre durante la conversación');
assert.match(bot.answer('gracias'),/Con gusto/i,'responde con cortesía');
assert.ok(fs.statSync('engineer-assistant-avatar.png').size>1000,'el avatar del ingeniero existe');

console.log('engineer-chatbot: 14 verificaciones superadas');
