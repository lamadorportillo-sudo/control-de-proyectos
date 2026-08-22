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
assert.match(bot.answer('¿Cómo se relacionan los módulos?'),/misma información relacionada/,'explica la sincronización');
assert.match(bot.answer('ayuda'),/Puedo indicarte/,'ofrece ayuda funcional');
assert.match(bot.answer('consulta desconocida'),/Puedo ayudarte/,'responde sin inventar contenido');
assert.ok(fs.statSync('engineer-assistant-avatar.png').size>1000,'el avatar del ingeniero existe');

console.log('engineer-chatbot: 8 verificaciones superadas');
