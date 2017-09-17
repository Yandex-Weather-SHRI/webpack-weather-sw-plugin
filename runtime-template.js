const CACHE_VERSION = '<%= version %>'
const ASSETS = [
  <%= assets %>
]

self.addEventListener('install', (event) => {
  const promise = Promise.all([
    preCacheAllAssets(),
  ])
    .then(() => self.skipWaiting())
    .then(() => console.log('[ServiceWorker] Installed!'))

  event.waitUntil(promise)
})

self.addEventListener('activate', (event) => {
  const promise = deleteObsoleteCaches()
    .then(() => {
      self.clients.claim()
      console.log('[ServiceWorker] Activated!')
    })

  event.waitUntil(promise)
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  const cacheKey = url.origin + url.pathname + url.search
  const response = fetchAndPutToCache(cacheKey, event.request)
  event.respondWith(response)
})

function preCacheAllAssets() {
  return caches.open(CACHE_VERSION)
    .then(cache => cache.addAll(ASSETS))
}

function deleteObsoleteCaches() {
  return caches.keys()
    .then((names) => {
      const list = names
        .filter(name => name !== CACHE_VERSION)
        .map(name => caches.delete(name))
      return Promise.all(list)
    })
}

function fetchAndPutToCache(cacheKey, request) {
  return fetch(request)
    .then((response) => {
      return caches.open(CACHE_VERSION)
        .then((cache) => {
          cache.put(cacheKey, response.clone())
        })
        .then(() => response)
    })
    .catch((error) => {
      console.error('[ServiceWorker] Fetch error: ', error)
      return caches.match(cacheKey)
    })
}
