const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
let sequence=0;
const context={window:null,console,crypto:{randomUUID:()=>`id-${++sequence}`},session:{userId:'luis-user'},view:{screen:'project',projectId:'p1'},db:{projects:[{id:'p1',code:'P-001',name:'Puente Norte'},{id:'p2',code:'P-002',name:'Centro Comunitario'}]},saveDB(){context.saved=(context.saved||0)+1}};context.window=context;
vm.createContext(context);
vm.runInContext(fs.readFileSync('adaptive-chat-learning-v1.js','utf8'),context,{filename:'adaptive-chat-learning-v1.js'});
const learning=context.__ccChatLearning;
assert.equal(learning.answer('cómo genero un informe'),null,'no inventa memoria inicial');
assert.equal(learning.record('cómo genero un informe','respuesta anterior',false,'Abre el expediente y entra en Informes.').learned,true,'acepta corrección supervisada');
assert.match(learning.answer('como puedo generar un informe'),/entra en Informes/,'recupera una corrección similar');
assert.equal(learning.record('qué dice la ley de garantías','respuesta legal',false,'La ley dice otra cosa').legalProtected,true,'protege la fuente legal');
assert.equal(learning.stats().examples,1,'no aprende correcciones legales como hechos');
assert.equal(learning.stats().feedback,2,'conserva las valoraciones');
assert.ok(context.saved>=2,'sincroniza la memoria mediante el guardado existente');
assert.equal(learning.rememberFact('El tramo norte quedó suspendido por lluvia.').saved,true,'guarda un recuerdo aprobado');
assert.match(learning.recall('tramo norte')[0].text,/suspendido por lluvia/,'recupera contexto entre consultas');
assert.equal(learning.rememberFact('La contraseña es secreta').reason,'sensitive','rechaza secretos y contraseñas');
learning.observeStyle('Mira, pues revisemos el frente de obra.');
assert.equal(learning.styleProfile().preferredMarker,'mira','adapta patrones de estilo sin guardar el mensaje completo');
assert.equal(learning.forget('tramo norte'),1,'permite eliminar recuerdos');

const casual=learning.captureInteraction('Qué calor hace hoy.','Sí, está fuerte.',{projectId:'p1'});
assert.equal(casual.items.length,0,'un comentario casual no se convierte en preferencia permanente');
const preference=learning.captureInteraction('Prefiero que los informes usen un tono directo.','Entendido.',{});
assert.equal(preference.items[0].type,'personal','clasifica una preferencia de conversación como memoria personal');
assert.equal(preference.items[0].source.actor,'Luis','registra el origen de la memoria');
assert.ok(preference.items[0].confidence>=.9,'registra el nivel de confianza');
context.session.userId='otro-usuario';
assert.equal(learning.recall('tono directo',3,{}).length,0,'no mezcla memoria personal entre usuarios');
context.session.userId='luis-user';

learning.rememberFact('En la obra P-001 el acarreo está pendiente.',{projectId:'p1',confirmed:true});
assert.equal(learning.recall('acarreo pendiente',3,{projectId:'p2'}).length,0,'no mezcla recuerdos entre proyectos');
assert.match(learning.recall('acarreo pendiente',3,{projectId:'p1'})[0].text,/P-001/,'recupera el recuerdo dentro de su proyecto');

const official=learning.rememberFact('El monto del contrato P-001 ahora es L 1,250,000.00',{projectId:'p1'});
assert.equal(official.needsConfirmation,true,'mantiene pendiente un dato oficial de alto impacto');
assert.equal(learning.recall('monto contrato',3,{projectId:'p1'}).some(item=>/1,250,000/.test(item.text)),false,'no aplica datos oficiales sin confirmar');
assert.equal(learning.confirm('monto contrato P-001').confirmed,true,'permite confirmar una memoria oficial');
assert.match(learning.recall('monto contrato P-001',3,{projectId:'p1'})[0].text,/1,250,000/,'aplica el dato después de confirmarlo');

learning.rememberFact('Prefiero informes con portada verde.',{type:'professional',confirmed:true});
const replaced=learning.replaceFact('portada verde','Prefiero informes con portada azul.',{confirmed:true});
assert.equal(replaced.saved,true,'permite actualizar un recuerdo');
assert.equal(learning.memory().items.find(item=>item.id===replaced.item.replaces).status,'replaced','marca como reemplazada la memoria anterior');
assert.match(learning.contextFor('portada de informes'),/portada azul/i,'utiliza la corrección más reciente en el contexto futuro');

const temporary=learning.rememberFact('Usar una tabla corta únicamente en esta conversación.',{temporary:true});
assert.equal(temporary.persistent,false,'la memoria temporal no se vuelve permanente');
assert.match(learning.recall('tabla corta')[0].text,/esta conversación/,'la memoria temporal permanece disponible en el hilo actual');
assert.equal(learning.clearTemporary(),1,'el cierre del hilo elimina la memoria temporal');
assert.equal(learning.recall('tabla corta').length,0,'la memoria temporal no sobrevive a una conversación nueva');

learning.captureInteraction('La Municipalidad de Santa María usa siempre el encabezado verde aprobado.','Entendido.',{});
learning.captureInteraction('La Municipalidad de La Paz usa siempre el encabezado azul aprobado.','Entendido.',{});
const institutional=learning.recall('encabezado de la Municipalidad de La Paz',4,{institutionId:'la paz'});
assert.ok(institutional.length>0&&institutional.every(item=>item.institutionId==='la paz'),'no mezcla criterios entre instituciones');

const rejected=learning.record('¿Uso portada roja?','Propuse portada roja.',false,'Usa portada blanca.');
assert.equal(rejected.disposition,'modified','distingue una recomendación modificada');
assert.equal(learning.record('¿Mantengo este formato?','Sí.',true).disposition,'accepted','distingue una recomendación aceptada');
assert.equal(learning.rememberFact('Mi API key es sk-1234567890abcdefghijklmnop').reason,'sensitive','rechaza claves API y secretos');
const sensitiveFeedback=learning.record('Mi token es abc1234567890','No debo guardarlo.',false,'Usa el token secreto');
assert.equal(sensitiveFeedback.sensitive,true,'omite consultas sensibles también en la retroalimentación');
assert.equal(learning.memory().feedback.at(-1).query,'[consulta sensible omitida]','no conserva el texto sensible en el historial de aprendizaje');
assert.equal(learning.stats().engine,'ZORDON','expone la identidad del núcleo de aprendizaje');
assert.equal(learning.stats().version,2,'migra la memoria al esquema versionado');
console.log('adaptive-chat-learning: 39 verificaciones superadas');
