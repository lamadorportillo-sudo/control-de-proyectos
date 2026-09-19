const assert=require('node:assert/strict');
const fs=require('node:fs');
const {supplementalModules}=require('../authenticated-module-manifest-v1.cjs');

const css=fs.readFileSync('stitch-design-system-v1.css','utf8');
const adapter=fs.readFileSync('stitch-ui-adapter-v1.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const sw=fs.readFileSync('service-worker-v1.js','utf8');

assert.match(css,/--st-canvas:#0B1118/);
assert.match(css,/--st-nav:#101720/);
assert.match(css,/--st-card:#151E29/);
assert.match(css,/--st-blue:#356AE6/);
assert.match(css,/--st-gold:#C5A367/);
assert.match(css,/#ccSidebar \.cc-side-btn\.active/);
assert.match(css,/@media\(max-width:860px\)/);
assert.match(css,/\.auth-card/);

assert.match(adapter,/stitch-design-system-v1\.css\?v=20260916-stitch1/);
assert.match(adapter,/normalizeActiveNav/);
assert.match(adapter,/removeRawIconNames/);

assert.ok(supplementalModules.some(([file,version])=>file==='stitch-ui-adapter-v1.js'&&version==='20260916-stitch1'));
assert.match(index,/id="ccStitchDesignCss"/);
assert.match(sw,/cc-static-v1-20260916-stitch1/);
assert.match(sw,/stitch-design-system-v1\.css/);

console.log('Stitch design integration contract: OK');
