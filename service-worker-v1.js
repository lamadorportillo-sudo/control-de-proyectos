const CACHE='cc-static-v1-20260908-field1';
const STATIC_EXT=/\.(?:js|css|webp|png|jpg|jpeg|svg|woff2?|webmanifest)(?:\?|$)/i;
const SHELL=['./','./index.html','./manifest.webmanifest','./performance-runtime-v1.js','./private-access-v1.js','./password-recovery-v1.js'];

function scoped(raw){return new URL(raw,self.registration.scope).href}
async function cacheOne(cache,raw){
  const url=new URL(raw,self.registration.scope);
  if(url.origin!==self.location.origin)return false;
  try{
    const request=new Request(url.href,{credentials:'same-origin',cache:'reload'});
    const response=await fetch(request);
    if(response&&response.ok){await cache.put(request,response.clone());return true}
  }catch(error){console.warn('No se pudo precargar',url.pathname,error?.message||error)}
  return false;
}

self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await Promise.allSettled(SHELL.map(url=>cacheOne(cache,url)));
  await self.skipWaiting();
})()));

self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const names=await caches.keys();
  await Promise.all(names.filter(name=>name.startsWith('cc-static-')&&name!==CACHE).map(name=>caches.delete(name)));
  await self.clients.claim();
})()));

self.addEventListener('message',event=>{
  if(event.data?.type!=='CC_CACHE_URLS'||!Array.isArray(event.data.urls))return;
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await Promise.allSettled(event.data.urls.slice(0,180).map(url=>cacheOne(cache,url)));
  })());
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  const navigation=request.mode==='navigate'||request.destination==='document';
  if(!navigation&&!STATIC_EXT.test(url.pathname+url.search))return;

  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    try{
      const response=await fetch(request,{cache:'no-store'});
      if(response&&response.ok)event.waitUntil(cache.put(request,response.clone()));
      return response;
    }catch(error){
      const cached=await cache.match(request)||await cache.match(request,{ignoreSearch:true});
      if(cached)return cached;
      if(navigation){
        const shell=await cache.match(scoped('./index.html'),{ignoreSearch:true})||await cache.match(scoped('./'),{ignoreSearch:true});
        if(shell)return shell;
      }
      return new Response('Recurso no disponible sin conexión.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
    }
  })());
});
