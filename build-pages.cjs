const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const bundleFiles = Array.from({ length: 12 }, (_, i) => `bundle-${String(i + 1).padStart(2, '0')}.js`);
let b64 = '';

for (const file of bundleFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const match = source.match(/\+\s*'([^']*)'\s*;?\s*$/s);
  if (!match) throw new Error(`No se pudo leer el contenido de ${file}`);
  b64 += match[1];
}

b64 = b64.replace(/[^A-Za-z0-9+/=]/g, '');
if (!b64.startsWith('H4sI')) throw new Error('El paquete base no parece ser GZIP en Base64.');

const compressed = Buffer.from(b64, 'base64');
let html = zlib.gunzipSync(compressed).toString('utf8');

const enhancements = [
  'core-functions-fix.js',
  'project-actions-fix.js',
  'dashboard-enhancements.js',
  'progress-fix.js',
  'adjudication-report.js',
  'reports-menu-fix.js',
  'reports-render-fix.js',
  'dashboard-redesign-v3.js',
  'project-summary-redesign.js',
  'review-issues-v1.js',
  'estimate-scanner-v1.js'
];

for (const file of enhancements) {
  if (!fs.existsSync(file)) throw new Error(`Falta el módulo requerido: ${file}`);
}

const tags = enhancements.map(file => `<script src="${file}"></script>`).join('');
if (!html.includes('</body>')) throw new Error('El HTML base no contiene cierre </body>.');
html = html.replace('</body>', `${tags}</body>`);

fs.rmSync('_site', { recursive: true, force: true });
fs.mkdirSync('_site', { recursive: true });
fs.writeFileSync('_site/index.html', html, 'utf8');
fs.writeFileSync('_site/.nojekyll', '', 'utf8');
for (const file of enhancements) fs.copyFileSync(file, path.join('_site', file));

console.log(`Sitio generado correctamente: ${html.length} caracteres.`);
console.log(`Base64: ${b64.length} caracteres; GZIP: ${compressed.length} bytes.`);
