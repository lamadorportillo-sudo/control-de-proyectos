const CACHE='cc-static-v1-20260903-recovery-v2';
const STATIC_EXT=/\.(?:js|css|webp|png|jpg|jpeg|woff2?)(?:\?|$)/i;

self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const names=await caches.keys();
  await Promise.all(names.filter(name=>name.startsWith('cc-static-')&&name!==CACHE).map(name=>caches.delete(name)));
  await self.clients.claim();
})()));

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin||!STATIC_EXT.test(url.pathname+url.search))return;

  // Network-first: prioriza siempre la versión publicada más reciente.
  // Solo usa caché como respaldo si la red falla, evitando conservar JS viejo
  // después de una corrección crítica del dashboard.
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    try{
      const response=await fetch(request,{cache:'no-store'});
      if(response&&response.ok)event.waitUntil(cache.put(request,response.clone()));
      return response;
    }catch(error){
      const cached=await cache.match(request);
      if(cached)return cached;
      return new Response('Recurso no disponible sin conexión.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
    }
  })());
});
