const assert=require('node:assert/strict');
const fs=require('node:fs');

const audit=fs.readFileSync('scripts/audit-system-1000.cjs','utf8');
const workflow=fs.readFileSync('.github/workflows/responsive-audit.yml','utf8');
const accessibility=fs.readFileSync('tests/accessibility-responsive.spec.cjs','utf8');

assert.doesNotMatch(audit,/for\s*\(let\s+cycle\s*=\s*1\s*;\s*cycle\s*<=\s*100/,'la auditoría no debe inflar el conteo repitiendo el mismo bloque 100 veces');
assert.match(audit,/const labels=new Set\(\)/,'cada comprobación debe poder identificarse de manera única');
assert.match(audit,/Cobertura insuficiente/,'la auditoría debe mantener un umbral mínimo de cobertura real');
assert.match(audit,/SUPABASE_SERVICE_ROLE_KEY/,'la auditoría debe revisar exposición accidental de service-role en cliente');
assert.match(audit,/PRIVATE KEY/,'la auditoría debe buscar claves privadas embebidas');
assert.match(workflow,/node scripts\/audit-system-1000\.cjs/,'los PR deben ejecutar la auditoría integral antes de Playwright');
assert.match(accessibility,/\['serious','critical'\]\.includes\(v\.impact\)/,'WCAG debe bloquear hallazgos serios y críticos');
assert.match(accessibility,/wcag22aa/,'WCAG 2.2 AA debe formar parte de la matriz');

console.log('audit-integrity: auditoría real, seguridad básica y WCAG severo protegidos contra regresión');
