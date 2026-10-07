// Meowsaic offline support. Online: always fetch the newest files, bypassing the browser cache. Offline: serve the last saved copy.
const CACHE="meowsaic-20261008-000336";
const FILES=["./","index.html","manifest.webmanifest","icon-180.png","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:"reload"})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const own=new URL(e.request.url).origin===location.origin;
  e.respondWith(fetch(own?new Request(e.request.url,{cache:"no-store"}):e.request).then(r=>{
    if(r.ok&&own&&!e.request.url.includes("version.txt")){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}
    return r;
  }).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(m=>m||caches.match("index.html"))));
});
