const CACHE="measymate-caption-studio-v2.13.39";
const CORE=["./","./index.html"];
self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith("measymate-caption-studio-")&&k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  event.respondWith((async()=>{
    try{
      const fresh=await fetch(event.request);
      if(fresh&&fresh.ok){
        const cache=await caches.open(CACHE);
        cache.put(event.request,fresh.clone()).catch(()=>{});
      }
      return fresh;
    }catch(err){
      const cached=await caches.match(event.request,{ignoreSearch:true});
      if(cached)return cached;
      if(event.request.mode==="navigate"){
        return (await caches.match("./"))||(await caches.match("./index.html"));
      }
      throw err;
    }
  })());
});
