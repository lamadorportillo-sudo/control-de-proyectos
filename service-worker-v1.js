const CACHE='cc-static-v1-20260901-control-centers-v6-alerts-audit';
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

  // Stale-while-revalidate: la interfaz abre rápido y comprueba en segundo plano
  // si existe una versión más reciente. El cambio de CACHE fuerza la renovación
  // de los recursos visuales sin alterar datos, autenticación ni sesiones.
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const cached=await cache.match(request);
    const network=fetch(request,{cache:'no-cache'}).then(response=>{
      if(response.ok)event.waitUntil(cache.put(request,response.clone()));
      return response;
    }).catch(()=>null);

    if(cached){
      event.waitUntil(network);
      return cached;
    }
    const response=await network;
    return response||new Response('Recurso no disponible sin conexión.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
  })());
});
