/**
 * Spectra PWA Service Worker
 * Provides offline support, background sync, and push notifications
 */

const CACHE_NAME = 'spectra-v1.0.0';
const RUNTIME_CACHE = 'spectra-runtime';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add other static assets as needed
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Service Worker installed');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Cache failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Serve from cache
          return cachedResponse;
        }

        // Clone the request for cache storage
        const fetchRequest = request.clone();

        return fetch(fetchRequest)
          .then((response) => {
            // Check if response is valid
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for cache storage
            const responseToCache = response.clone();

            // Cache the response
            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Network failed, try to serve offline fallback
            if (request.destination === 'document') {
              return caches.match('/offline.html') || caches.match('/index.html');
            }
            
            // For API requests, return offline response
            if (url.pathname.startsWith('/api/')) {
              return new Response(
                JSON.stringify({
                  error: 'Offline',
                  message: 'No internet connection. Some features may be limited.'
                }),
                {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            }
          });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync:', event.tag);
  
  if (event.tag === 'memory-sync') {
    event.waitUntil(syncMemories());
  }
  
  if (event.tag === 'voice-upload') {
    event.waitUntil(syncVoiceData());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('📨 Push notification received');
  
  const options = {
    body: 'Spectra has something to share with you',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open Spectra',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/close.png'
      }
    ]
  };

  if (event.data) {
    const payload = event.data.json();
    options.body = payload.body || options.body;
    options.data = { ...options.data, ...payload.data };
  }

  event.waitUntil(
    self.registration.showNotification('Spectra', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification click:', event.action);
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then((clientList) => {
          for (const client of clientList) {
            if (client.url === '/' && 'focus' in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow('/');
          }
        })
    );
  }
});

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('💬 Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Helper functions for background sync
async function syncMemories() {
  try {
    console.log('🧠 Syncing memories...');
    
    // Get offline memories from IndexedDB or localStorage
    const offlineMemories = await getOfflineMemories();
    
    if (offlineMemories.length === 0) {
      console.log('✅ No memories to sync');
      return;
    }

    // Attempt to sync each memory
    for (const memory of offlineMemories) {
      try {
        const response = await fetch('/api/memory/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(memory)
        });

        if (response.ok) {
          await removeOfflineMemory(memory.id);
          console.log('✅ Memory synced:', memory.id);
        }
      } catch (error) {
        console.error('❌ Failed to sync memory:', memory.id, error);
      }
    }
    
    // Notify the main thread about sync completion
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'MEMORY_SYNC_COMPLETE',
        syncedCount: offlineMemories.length
      });
    });
    
  } catch (error) {
    console.error('❌ Memory sync failed:', error);
  }
}

async function syncVoiceData() {
  try {
    console.log('🎤 Syncing voice data...');
    
    // Implementation for syncing voice training data
    // This would handle offline voice samples and training data
    
    console.log('✅ Voice data sync complete');
  } catch (error) {
    console.error('❌ Voice sync failed:', error);
  }
}

// IndexedDB helpers for offline storage
async function getOfflineMemories() {
  // This would interact with IndexedDB to get offline memories
  // For now, return empty array as placeholder
  return [];
}

async function removeOfflineMemory(memoryId) {
  // This would remove synced memory from IndexedDB
  console.log('Removing offline memory:', memoryId);
}

// Periodic background sync
self.addEventListener('periodicsync', (event) => {
  console.log('⏰ Periodic sync:', event.tag);
  
  if (event.tag === 'memory-cleanup') {
    event.waitUntil(cleanupOldMemories());
  }
});

async function cleanupOldMemories() {
  try {
    // Clean up old cached memories and data
    const cache = await caches.open(RUNTIME_CACHE);
    const requests = await cache.keys();
    
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const dateHeader = response.headers.get('date');
        if (dateHeader) {
          const responseDate = new Date(dateHeader).getTime();
          if (now - responseDate > maxAge) {
            await cache.delete(request);
            console.log('🗑️ Cleaned up old cache entry:', request.url);
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Cache cleanup failed:', error);
  }
}

console.log('🔮 Spectra Service Worker loaded');