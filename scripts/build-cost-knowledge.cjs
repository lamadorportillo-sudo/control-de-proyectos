const fs = require('fs');
const path = require('path');

const root = process.argv[2];
const outDir = process.argv[3];
if (!root || !outDir) throw new Error('Uso: node build-cost-knowledge.cjs <xlsx-extraido> <directorio-salida>');

const decode = (value) => String(value ?? '')
  .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
  .replace(/\s+/g, ' ').trim();
const fixText = (value) => {
  let text = decode(value);
  if (/[ÃÂ]/.test(text)) {
    const fixed = Buffer.from(text, 'latin1').toString('utf8');
    if (!fixed.includes('�')) text = fixed;
  }
  return text;
};
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const shared = [];
for (const match of read('xl/sharedStrings.xml').matchAll(/<si>([\s\S]*?)<\/si>/g)) {
  shared.push(fixText([...match[1].matchAll(/<t(?: [^>]*)?>([\s\S]*?)<\/t>/g)].map((item) => item[1]).join('')));
}
const workbook = read('xl/workbook.xml');
const sheetCount = [...workbook.matchAll(/<sheet\s/g)].length;

function cells(index) {
  const source = read(`xl/worksheets/sheet${index}.xml`);
  const result = {};
  for (const match of source.matchAll(/<c\s+([^>]*\br="([A-Z]+\d+)"[^>]*?)(?<!\/)>([\s\S]*?)<\/c>/g)) {
    const attrs = match[1];
    const body = match[3];
    const type = (attrs.match(/\bt="([^"]+)"/) || [])[1] || '';
    const raw = (body.match(/<v>([\s\S]*?)<\/v>/) || [])[1] || '';
    let value = fixText(raw);
    if (type === 's') value = shared[Number(value)] ?? value;
    else if (value !== '' && Number.isFinite(Number(value))) value = Number(value);
    result[match[2]] = value;
  }
  return result;
}
const value = (map, address) => map[address] ?? '';
const text = (v) => fixText(v);
const number = (v) => Number.isFinite(Number(v)) ? Number(v) : 0;
const activityPattern = /^Actividad\s+([^\s]+)\s+(.+?)\s+Unidad\s+(.+)$/i;
const fichas = [];
const resources = new Map();

for (let index = 1; index <= sheetCount; index += 1) {
  const map = cells(index);
  const heading = text(value(map, 'A3'));
  const match = heading.match(activityPattern);
  if (!match) continue;
  const code = match[1].toUpperCase();
  const description = match[2].trim();
  const unit = match[3].trim();
  const rows = [];
  let type = 'Material';
  for (let row = 5; row <= 80; row += 1) {
    const a = text(value(map, `A${row}`));
    const b = text(value(map, `B${row}`));
    const c = text(value(map, `C${row}`));
    const marker = `${a} ${b}`.toUpperCase();
    if (/MATERIA/.test(marker) && !b) { type = 'Material'; continue; }
    if (/MANO DE OBRA/.test(marker)) { type = 'Mano de obra'; continue; }
    if (/HERRAMIENTA|EQUIPO/.test(marker)) { type = 'Equipo'; continue; }
    if (!a || !b || /TOTAL|RENDIMIENTO|DESPERDICIO/.test(marker)) continue;
    const quantity = number(value(map, `D${row}`));
    const waste = number(value(map, `E${row}`));
    if (!quantity && !waste) continue;
    const item = { type, code: a, description: b, unit: c, quantity, waste };
    rows.push(item);
    const old = resources.get(a) || { code: a, description: b, unit: c, type, uses: 0 };
    old.uses += 1;
    resources.set(a, old);
  }
  fichas.push({ id: `DOC-${code}-${index}`, code, description, unit, sourcePage: index, resources: rows });
  if (index % 1000 === 0) process.stdout.write(`\r${index}/${sheetCount}`);
}

fs.mkdirSync(outDir, { recursive: true });
const chunkSize = 250;
const index = [];
for (let offset = 0; offset < fichas.length; offset += chunkSize) {
  const chunk = Math.floor(offset / chunkSize);
  const items = fichas.slice(offset, offset + chunkSize);
  const file = `fichas-${String(chunk).padStart(3, '0')}.json`;
  fs.writeFileSync(path.join(outDir, file), JSON.stringify(items));
  for (const ficha of items) index.push({ id: ficha.id, code: ficha.code, description: ficha.description, unit: ficha.unit, sourcePage: ficha.sourcePage, chunk });
}
const data = {
  version: 1,
  importedAt: '2026-08-23',
  source: 'FICHAS 17102013.xlsx / PDF',
  stats: { sheets: sheetCount, fichas: fichas.length, resources: fichas.reduce((sum, ficha) => sum + ficha.resources.length, 0), uniqueResources: resources.size, chunks: Math.ceil(fichas.length / chunkSize) },
  index,
  resources: [...resources.values()].sort((a, b) => b.uses - a.uses)
};
fs.writeFileSync(path.join(outDir, 'index.js'), `window.__ccCostKnowledge=${JSON.stringify(data)};\n`);
console.log(`\n${JSON.stringify(data.stats)}`);
