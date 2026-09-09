const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const read=file=>fs.readFileSync(file,'utf8');

test('modo campo conserva una copia completa y sincroniza con control de versión',()=>{
  const core=read('offline-core-v1.js');
  new vm.Script(core,{filename:'offline-core-v1.js'});
  assert.match(core,/indexedDB\.open\(IDB_NAME/);
  assert.match(core,/const SNAPSHOTS='snapshots'/);
  assert.match(core,/save_app_state/);
  assert.match(core,/threeWayMerge/);
  assert.match(core,/stateVersion/);
  assert.match(core,/baseState/);
  assert.match(core,/__CC_OFFLINE_BOOT__/);
  assert.match(core,/window\.ccOffline=/);
});

test('service worker abre la aplicación y sus recursos sin conexión',()=>{
  const worker=read('service-worker-v1.js');
  new vm.Script(worker,{filename:'service-worker-v1.js'});
  assert.match(worker,/request\.method!==['"]GET['"]/);
  assert.match(worker,/url\.origin!==self\.location\.origin/);
  assert.match(worker,/request\.mode===['"]navigate['"]/);
  assert.match(worker,/\.\/index\.html/);
  assert.match(worker,/manifest\.webmanifest/);
});

test('pipeline publica el núcleo offline antes del render inicial',()=>{
  const patch=read('patch-offline-field.cjs');
  const netlify=read('netlify.toml');
  const ui=read('offline-field-v1.js');
  const manifest=JSON.parse(read('manifest.webmanifest'));
  new vm.Script(ui,{filename:'offline-field-v1.js'});
  assert.match(patch,/window\.ccHydrateCanonicalState=hydrateCanonicalState/);
  assert.match(patch,/offlineCore/);
  assert.match(patch,/manifest\.webmanifest/);
  assert.match(netlify,/patch-offline-field\.cjs/);
  assert.equal(manifest.start_url,'./');
  assert.equal(manifest.scope,'./');
  assert.equal(manifest.display,'standalone');
  assert.match(ui,/Sincronizar ahora/);
});
