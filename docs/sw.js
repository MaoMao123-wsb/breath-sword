'use strict';
const PREFIX='breath-sword:'+new URL(self.registration.scope).pathname+':';
const CACHE=PREFIX+'38818bf1e686';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',event=>{event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(ASSETS.map(path=>new Request(new URL(path,self.registration.scope),{cache:'reload'})));await self.skipWaiting();})());});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{await Promise.all((await caches.keys()).filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key)));await self.clients.claim();})());});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
 if(request.mode==='navigate'){
  event.respondWith((async()=>{
   const cache=await caches.open(CACHE),controller=new AbortController(),timer=setTimeout(()=>controller.abort(),3000);
   try{const response=await fetch(request,{signal:controller.signal});if(response.ok&&response.headers.get('content-type')?.includes('text/html')){await cache.put(new URL('./index.html',self.registration.scope),response.clone());return response;}const saved=await cache.match('./index.html');return saved||response;}
   catch{return(await cache.match('./index.html'))||new Response('首次打开需要联网，请联网后重试。',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});}
   finally{clearTimeout(timer);}
  })());
 }else if(ASSETS.some(path=>new URL(path,self.registration.scope).href===url.href)){
  event.respondWith((async()=>{const cache=await caches.open(CACHE),saved=await cache.match(request);if(saved)return saved;const response=await fetch(request);if(response.ok)await cache.put(request,response.clone());return response;})());
 }
});
