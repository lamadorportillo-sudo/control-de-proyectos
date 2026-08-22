const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const context={
  window:null,console,URLSearchParams,AbortController,setTimeout,clearTimeout,
  fetch:async()=>({
    ok:true,
    json:async()=>({query:{pages:{1:{
      index:1,
      title:'Contratación pública',
      extract:'Información general recuperada desde una fuente web abierta.',
      canonicalurl:'https://es.wikipedia.org/wiki/Contratación_pública'
    }}}})
  })
};
context.window=context;
vm.createContext(context);
vm.runInContext(fs.readFileSync('web-knowledge-v2.js','utf8'),context,{filename:'web-knowledge-v2.js'});

(async()=>{
  const result=await context.__ccWebKnowledge.answer('contratación pública');
  assert.match(result,/CONOCIMIENTO DE LA RED — NO ES LEY/,'distingue la información web');
  assert.match(result,/Fuente:/,'muestra la procedencia');
  assert.match(result,/https:\/\/es\.wikipedia\.org/,'incluye enlace verificable');
  console.log('web-knowledge: 3 verificaciones superadas');
})().catch(error=>{console.error(error);process.exitCode=1});
