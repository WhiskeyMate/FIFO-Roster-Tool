const CACHE_NAME = ‘fifo-roster-v2’;

// Install event - skip caching, just activate immediately
self.addEventListener(‘install’, event => {
self.skipWaiting();
});

// Activate event - claim clients immediately
self.addEventListener(‘activate’, event => {
event.waitUntil(
caches.keys().then(cacheNames => {
return Promise.all(
cacheNames.map(cacheName => caches.delete(cacheName))
);
}).then(() => self.clients.claim())
);
});

// Fetch event - network first, then cache
self.addEventListener(‘fetch’, event => {
event.respondWith(
fetch(event.request)
.then(response => {
// Clone and cache successful responses
if (response && response.status === 200) {
const responseClone = response.clone();
caches.open(CACHE_NAME).then(cache => {
cache.put(event.request, responseClone);
});
}
return response;
})
.catch(() => {
// If network fails, try cache
return caches.match(event.request);
})
);
});
