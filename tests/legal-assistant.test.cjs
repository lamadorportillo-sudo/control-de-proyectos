const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const context={window:null,console};context.window=context;
vm.createContext(context);
vm.runInContext(fs.readFileSync('law-knowledge-v1.js','utf8'),context,{filename:'law-knowledge-v1.js'});
vm.runInContext(fs.readFileSync('legal-assistant-v1.js','utf8'),context,{filename:'legal-assistant-v1.js'});
const legal=context.__ccLegalKnowledge;

assert.equal(legal.data.sources.length,3,'incluye las tres normas suministradas');
assert.ok(legal.data.records.length>=700,'indexa el articulado completo extraído');
assert.ok(legal.data.records.some(x=>x.source==='D62-2026'),'incluye Decreto 62-2026');
assert.ok(legal.data.records.some(x=>x.source==='LCE'),'incluye Ley de Contratación');
assert.ok(legal.data.records.some(x=>x.source==='RLCE'),'incluye Reglamento');
assert.match(legal.answer('garantía de cumplimiento'),/artículo/i,'responde con artículos');
assert.match(legal.answer('garantía de cumplimiento'),/pág\. PDF/i,'incluye página de origen');
assert.match(legal.answer('artículo 5 de la Ley'),/Ley de Contratación del Estado/i,'recupera por artículo y fuente');
assert.match(legal.answer('garantía de cumplimiento'),/En términos sencillos/i,'explica con lenguaje claro');
assert.match(legal.answer('garantía de cumplimiento'),/Si quieres/i,'ofrece continuar la conversación');
assert.match(legal.answer('xyzqv inexistente'),/no encontré/i,'no inventa cuando no hay respaldo');

console.log('legal-assistant: 11 verificaciones superadas');
