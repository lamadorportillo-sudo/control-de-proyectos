const fs = require('fs');
const path = require('path');

const root = process.argv[2];
const output = process.argv[3];
if (!root || !output) throw new Error('Uso: node inspect-paged-cost-workbook.cjs <xlsx-extraido> <salida-json>');

const decode = (value) => String(value ?? '')
  .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
  .replace(/\s+/g, ' ').trim();
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');

const shared = [];
for (const match of read('xl/sharedStrings.xml').matchAll(/<si>([\s\S]*?)<\/si>/g)) {
  shared.push(decode([...match[1].matchAll(/<t(?: [^>]*)?>([\s\S]*?)<\/t>/g)].map((item) => item[1]).join('')));
}

function readSheet(index) {
  const file = path.join(root, 'xl', 'worksheets', `sheet${index}.xml`);
  const source = fs.readFileSync(file, 'utf8');
  const rows = [];
  for (const rowMatch of source.matchAll(/<row\s+[^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g)) {
    const cells = {};
    for (const cellMatch of rowMatch[2].matchAll(/<c\s+([^>]*\br="([A-Z]+)\d+"[^>]*)>([\s\S]*?)<\/c>/g)) {
      const attrs = cellMatch[1];
      const body = cellMatch[3];
      const type = (attrs.match(/\bt="([^"]+)"/) || [])[1] || '';
      const raw = (body.match(/<v>([\s\S]*?)<\/v>/) || [])[1] || '';
      let value = decode(raw);
      if (type === 's') value = shared[Number(value)] ?? value;
      else if (value !== '' && Number.isFinite(Number(value))) value = Number(value);
      cells[cellMatch[2]] = value;
    }
    const values = Object.entries(cells).sort().map(([column, value]) => ({ column, value }));
    if (values.some((entry) => String(entry.value).trim())) rows.push({ row: Number(rowMatch[1]), values });
  }
  return rows;
}

const workbook = read('xl/workbook.xml');
const count = [...workbook.matchAll(/<sheet\s/g)].length;
const requestedIndexes = process.argv.slice(4).map(Number).filter(Number.isFinite);
const sampleIndexes = [...new Set(requestedIndexes.length ? requestedIndexes : [1, 2, 3, 10, 50, 100, 500, 1000, 5000, 10000, count])].filter((n) => n <= count);
const samples = sampleIndexes.map((index) => ({ index, rows: readSheet(index) }));
fs.writeFileSync(output, JSON.stringify({ count, sharedCount: shared.length, shared: shared.slice(0, 100), samples }, null, 2));
console.log(JSON.stringify({ count, sharedCount: shared.length, samples: sampleIndexes }));
