const assert=require('node:assert/strict');
const fs=require('node:fs');
const {retiredModules,preAuthModules,supplementalModules}=require('../authenticated-module-manifest-v1.cjs');

const html=fs.readFileSync('index.html','utf8');
const esc=s=>String(s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');

for(const [moduleFile,version] of preAuthModules){
  const re=new RegExp('<script\\s+[^>]*src=["\\\']'+esc(moduleFile)+'\\?v='+esc(version)+'["\\\'][^>]*><\\/script>','i');
  assert.match(html,re,'El módulo previo a autenticación '+moduleFile+' no usa la versión canónica '+version);
}

for(const [moduleFile,version] of supplementalModules){
  const re=new RegExp('data-src=["\\\']'+esc(moduleFile)+'\\?v='+esc(version)+'["\\\']','gi');
  const matches=html.match(re)||[];
  assert.equal(matches.length,1,'El plan autenticado debe contener exactamente una copia canónica de '+moduleFile+'?v='+version+'; encontradas: '+matches.length);
}

for(const moduleFile of retiredModules){
  assert.ok(!html.includes(moduleFile),'El artefacto reactivó un módulo retirado: '+moduleFile);
}

console.log('Manifiesto autenticado validado: '+preAuthModules.length+' previos + '+supplementalModules.length+' autenticados; '+retiredModules.length+' retirados ausentes.');
