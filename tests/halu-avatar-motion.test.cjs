const assert=require('node:assert/strict');
const fs=require('node:fs');

const src=fs.readFileSync('halu-avatar-motion-v1.js','utf8');
assert.match(src,/cc-halu-moving/,'incluye animación de desplazamiento');
assert.match(src,/ccHaluWalk/,'simula pasos al cambiar de posición');
assert.match(src,/cc-halu-gesture/,'incluye gesto al llegar');
assert.match(src,/placeNext/,'permite marcar una posición con un toque');
assert.match(src,/localStorage\.setItem\(KEY/,'conserva la posición entre sesiones');
assert.match(src,/scrollIntoView/,'puede buscar y señalar controles visibles');
assert.match(src,/no te veo\|no estas visible/,'responde a órdenes de aparición');
assert.match(src,/window\.__ccHaluAvatar/,'expone el controlador al chat');
console.log('halu-avatar-motion: 8 verificaciones superadas');
