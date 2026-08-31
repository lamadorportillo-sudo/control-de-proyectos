const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'contract-payment-documents-v1.js'), 'utf8');
const phoneFix = fs.readFileSync(path.join(root, 'contract-official-format-v1.js'), 'utf8');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const loader = fs.readFileSync(path.join(root, 'project-tabs-complete-v1.js'), 'utf8');

test('la página y el cargador global conservan el módulo contractual', () => {
  assert.match(loader, /contract-payment-documents-v1\.js\?v=20260831-advance-docs3/);
  assert.match(loader, /contract-official-format-v1\.js\?v=20260831-phone3/);
  const modules = loader.match(/const modules=\[(.*?)\];const current/s)?.[1] || '';
  assert.ok(modules.lastIndexOf('contract-payment-documents-v1.js') > modules.lastIndexOf('zordon-chat-ui-v1.js'));
  assert.ok(modules.lastIndexOf('contract-payment-documents-v1.js') > modules.lastIndexOf('contract-official-format-v1.js'));
  const direct = index.lastIndexOf('contract-payment-documents-v1.js');
  if (direct >= 0) assert.ok(direct > index.lastIndexOf('zordon-chat-ui-v1.js'));
});

test('los tres formatos Word base existen y son DOCX válidos', () => {
  for (const file of [
    'templates/contrato-infraestructura-base.docx',
    'templates/nota-remision-anticipo-base.docx',
    'templates/orden-inicio-base.docx',
  ]) {
    const bytes = fs.readFileSync(path.join(root, file));
    assert.equal(bytes.subarray(0, 2).toString(), 'PK');
    assert.ok(bytes.length > 50_000, `${file} debe conservar membrete y formato`);
  }
});

test('el flujo genera los tres documentos y protege el pago del anticipo', () => {
  assert.match(source, /EXPEDIENTE CONTRACTUAL/);
  assert.match(source, /Generar contrato Word/);
  assert.match(source, /Generar nota Word/);
  assert.match(source, /Generar orden de inicio Word/);
  assert.match(source, /Generar expediente/);
  assert.match(source, /Contrato, nota de remisión y orden de inicio generados/);
  assert.match(source, /Primero genera el contrato y la nota de remisión actualizados/);
  assert.match(source, /ready:contract&&remittance/);
  assert.match(source, /status!==['"]Pagado['"]/);
  assert.match(source, /e\.stopImmediatePropagation\(\)/);
});

test('los documentos se invalidan cuando cambian sus datos fuente', () => {
  assert.match(source, /function fingerprint\(p,c\)/);
  assert.match(source, /paymentDocuments\[kind\]/);
  assert.match(source, /docs\[DOC_CONTRACT\]\?\.fingerprint===fp/);
  assert.match(source, /docs\[DOC_REMITTANCE\]\?\.fingerprint===fp/);
  assert.match(source, /docs\[DOC_START_ORDER\]\?\.fingerprint===fp/);
  assert.match(source, /c\?\.start,c\?\.end/);
});

test('la orden de inicio compacta el espacio de firmas para evitar una segunda página vacía', () => {
  assert.match(source, /signatureTable/);
  assert.match(source, /includes\('ALCALDE MUNICIPAL'\)/);
  assert.match(source, /removed<4/);
});

test('todos los documentos contractuales corrigen el teléfono municipal antes de descargarse', () => {
  assert.match(phoneFix, /const CORRECT_PHONE=['"]9864-2006['"]/);
  assert.match(phoneFix, /9865-2258/);
  assert.match(phoneFix, /word\\\/\.\+\\\.xml/);
  assert.match(phoneFix, /window\.JSZip\.loadAsync=wrapped/);
  assert.match(phoneFix, /ccMunicipalFormatData/);
  assert.ok(loader.indexOf('contract-official-format-v1.js') < loader.indexOf('contract-payment-documents-v1.js'));
});
