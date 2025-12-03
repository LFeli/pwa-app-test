const CACHE_NAME = "infohub-v1"
const ASSETS_TO_CACHE = ["/", "/index.html", "/styles.css", "/app.js", "/manifest.json", "/public/example.mov"]

// Install Event
self.addEventListener("install", (event) => {
  console.log("[v0] Service Worker installing...")

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[v0] Caching assets")
        return cache.addAll(ASSETS_TO_CACHE)
      })
      .catch((err) => console.error("[v0] Cache failed:", err)),
  )

  self.skipWaiting()
})

// Activate Event
self.addEventListener("activate", (event) => {
  console.log("[v0] Service Worker activating...")

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[v0] Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )

  self.clients.claim()
})

// Fetch Event - Network-first strategy
self.addEventListener("fetch", (event) => {
  const { request } = event

  // Skip non-GET requests
  if (request.method !== "GET") {
    return
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response && response.status === 200) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone)
          })
        }
        return response
      })
      .catch(() => {
        // Return cached version if network fails
        return caches.match(request).then((cachedResponse) => {
          return (
            cachedResponse ||
            new Response("Offline - Resource not cached", {
              status: 503,
              statusText: "Service Unavailable",
            })
          )
        })
      }),
  )
})

// Handle messages from client
self.addEventListener("message", (event) => {
  if (event.data.type === "CLEAR_CACHE") {
    caches.delete(CACHE_NAME).then(() => {
      console.log("[v0] Cache cleared")
    })
  }
})
