const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const clicks=[];
const storage=new Map();
const elements={
  '#ccCostProgramLazyBtn':{style:{},getAttribute(){return null},click(){clicks.push('costs')}},
  '[data-ccx="projects"]':{style:{},getAttribute(){return null},click(){clicks.push('projects')}}
};
const context={
  console,Date,window:null,
  localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},
  document:{querySelector(selector){return elements[selector]||null},querySelectorAll(){return[]}},
  db:{projects:[{id:'p1',code:'P-001',name:'Pavimento calle central'}]},
  view:{screen:'home',projectId:null,tab:null},
  renderApp(){clicks.push('renderApp')},renderProject(){clicks.push('renderProject')}
};
context.window=context;
vm.createContext(context);
vm.runInContext(fs.readFileSync('halu-page-controller-v1.js','utf8'),context,{filename:'halu-page-controller-v1.js'});
const controller=context.__ccHaluPageController;

assert.equal(controller.isEnabled(),true,'el control inicia disponible');
assert.match(controller.handle('abre programa de costos').message,/Abrí Programa de costos/);
assert.deepEqual(clicks,['costs']);
assert.match(controller.handle('abre proyecto P-001').message,/Abrí el expediente P-001/);
assert.equal(context.view.projectId,'p1');
assert.equal(context.view.tab,'summary');
assert.match(controller.handle('elimina el proyecto').message,/No eliminaré información/,'bloquea eliminaciones ambiguas');
assert.match(controller.handle('desactiva el control de página').message,/desactivado/);
assert.equal(controller.isEnabled(),false);
assert.equal(controller.handle('abre programa de costos').handled,false,'no controla la pagina cuando esta desactivado');
assert.match(controller.handle('activa el control de página').message,/activado/);
assert.match(controller.capabilities(),/Programa de costos/);

console.log('halu-page-controller: control opcional, navegación y seguridad verificados');
