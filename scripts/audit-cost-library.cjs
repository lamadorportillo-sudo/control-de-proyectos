const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(process.argv[2] || '.');
const context = { window: null };
context.window = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'fhis-cost-data-v1.js'), 'utf8'), context);
vm.runInContext(fs.readFileSync(path.join(root, 'assets/cost-knowledge/index.js'), 'utf8'), context);
const base = context.__ccFhisCostData;
const knowledge = context.__ccCostKnowledge;
const normalize = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const finite = (value) => Number.isFinite(Number(value));

const prices = new Map();
for (const ficha of base.fichas) for (const resource of ficha.resources || []) {
  const price = Number(resource.unitCost || (resource.total && resource.quantity ? resource.total / resource.quantity : 0));
  if (price > 0 && resource.code && !prices.has(normalize(resource.code))) prices.set(normalize(resource.code), price);
}

const chunkItems = new Map();
const findings = { missingChunks: [], missingIndexItems: [], invalidFichas: [], invalidResources: [], emptyFichas: [], zeroPriceResources: [], duplicateIds: [] };
for (let chunk = 0; chunk < knowledge.stats.chunks; chunk += 1) {
  const file = path.join(root, 'assets/cost-knowledge', `fichas-${String(chunk).padStart(3, '0')}.json`);
  if (!fs.existsSync(file)) { findings.missingChunks.push(chunk); continue; }
  for (const ficha of JSON.parse(fs.readFileSync(file, 'utf8'))) chunkItems.set(ficha.id, ficha);
}

const ids = new Set();
for (const meta of knowledge.index) {
  if (ids.has(meta.id)) findings.duplicateIds.push(meta.id);
  ids.add(meta.id);
  const ficha = chunkItems.get(meta.id);
  if (!ficha) { findings.missingIndexItems.push(meta.id); continue; }
  if (!String(ficha.code || '').trim() || !String(ficha.description || '').trim() || !String(ficha.unit || '').trim()) findings.invalidFichas.push(meta.id);
  if (!Array.isArray(ficha.resources) || ficha.resources.length === 0) findings.emptyFichas.push(meta.id);
  for (let index = 0; index < (ficha.resources || []).length; index += 1) {
    const resource = ficha.resources[index];
    if (!String(resource.description || '').trim() || !String(resource.unit || '').trim() || !finite(resource.quantity) || Number(resource.quantity) <= 0) findings.invalidResources.push(`${meta.id}:${index}`);
    if (!prices.has(normalize(resource.code))) findings.zeroPriceResources.push(`${meta.id}:${resource.code || index}`);
  }
}

const baseSeenCodes = new Set(), baseSeenNames = new Set();
const canonicalBase = [...base.fichas].sort((a, b) => (b.resources?.length || 0) - (a.resources?.length || 0)).filter((ficha) => {
  const code = normalize(ficha.code), name = `${normalize(ficha.description)}|${normalize(ficha.unit)}`;
  if ((code && baseSeenCodes.has(code)) || baseSeenNames.has(name)) return false;
  if (code) baseSeenCodes.add(code); baseSeenNames.add(name); return true;
});
const canonicalBaseCodes = new Set(canonicalBase.map((ficha) => normalize(ficha.code)).filter(Boolean));
const canonicalBaseNames = new Set(canonicalBase.map((ficha) => `${normalize(ficha.description)}|${normalize(ficha.unit)}`));
const canonicalSeenCodes = new Set(), canonicalSeenNames = new Set();
const canonicalMeta = [...knowledge.index].sort((a, b) => (/^F/i.test(b.code) ? 1 : 0) - (/^F/i.test(a.code) ? 1 : 0) || (a.sourcePage || 0) - (b.sourcePage || 0)).filter((ficha) => {
  const code = normalize(ficha.code), name = `${normalize(ficha.description)}|${normalize(ficha.unit)}`;
  if ((code && canonicalBaseCodes.has(code)) || canonicalBaseNames.has(name) || (code && canonicalSeenCodes.has(code)) || canonicalSeenNames.has(name)) return false;
  if (code) canonicalSeenCodes.add(code); canonicalSeenNames.add(name); return true;
});
const canonicalFichas = [...canonicalBase, ...canonicalMeta.map((meta) => chunkItems.get(meta.id))];
const functionalFailures = [];
let pendingDefinitions = 0;
for (const ficha of canonicalFichas) {
  const resources = ficha.resources?.length ? ficha.resources : [{ code: `PEND-${ficha.code}`, description: 'Recurso y precio pendientes de definir', unit: ficha.unit || 'UND', quantity: 1, unitCost: 0 }];
  if (!ficha.resources?.length) pendingDefinitions += 1;
  const total = resources.reduce((sum, resource) => sum + Number(resource.quantity || 1) * Number(prices.get(normalize(resource.code)) || resource.unitCost || 0), 0);
  const clone = JSON.parse(JSON.stringify({ ...ficha, resources }));
  const groups = { material: [], labor: [], equipment: [] };
  for (const resource of clone.resources) {
    if (resource.type === 'Mano de obra') groups.labor.push(resource);
    else if (resource.type === 'Equipo') groups.equipment.push(resource);
    else groups.material.push(resource);
  }
  const budgetTotal = 1 * 1 * total;
  if (!clone.code || !clone.description || !clone.unit || !clone.resources.length || !Number.isFinite(total) || !Number.isFinite(budgetTotal) || Object.values(groups).flat().length !== clone.resources.length) functionalFailures.push(ficha.id);
}

const report = {
  stats: {
    indexedFichas: knowledge.index.length,
    loadedFichas: chunkItems.size,
    resources: [...chunkItems.values()].reduce((sum, ficha) => sum + (ficha.resources || []).length, 0),
    pricedResourceCodes: prices.size,
    emptyFichas: findings.emptyFichas.length,
    zeroPriceResources: findings.zeroPriceResources.length
    ,canonicalFichas: canonicalFichas.length
    ,functionalFichas: canonicalFichas.length - functionalFailures.length
    ,pendingDefinitions
  },
  failures: { ...Object.fromEntries(Object.entries(findings).filter(([key]) => !['emptyFichas', 'zeroPriceResources'].includes(key)).map(([key, values]) => [key, values.length])), functionalFailures: functionalFailures.length },
  samples: { emptyFichas: findings.emptyFichas.slice(0, 20), zeroPriceResources: findings.zeroPriceResources.slice(0, 20), invalidResources: findings.invalidResources.slice(0, 20) }
};
console.log(JSON.stringify(report, null, 2));
if (Object.values(report.failures).some(Boolean)) process.exitCode = 1;
