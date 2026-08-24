const CACHE='cc-static-v1-20260823';
const STATIC_EXT=/\.(?:js|css|webp|png|jpg|jpeg|woff2?)(?:\?|$)/i;

self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const names=await caches.keys();
  await Promise.all(names.filter(name=>name.startsWith('cc-static-')&&name!==CACHE).map(name=>caches.delete(name)));
  await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
  const request=event.request;if(request.method!=='GET')return;
  const url=new URL(request.url);if(url.origin!==self.location.origin||!STATIC_EXT.test(url.pathname+url.search))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE),cached=await cache.match(request);
    if(cached)return cached;
    const response=await fetch(request);
    if(response.ok)event.waitUntil(cache.put(request,response.clone()));
    return response;
  })());
});
