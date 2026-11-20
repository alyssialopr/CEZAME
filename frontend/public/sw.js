const CACHE_NAME = 'cezame-cache-v2';

const APP_SHELL_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.png',
  '/logo.png',
  '/apple-touch-icon.png',
];

// Installation : mise en cache de l'App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        APP_SHELL_ASSETS.map((asset) => cache.add(asset))
      );
    })
  );

  // Active immédiatement lors de la toute première installation
  if (!self.registration.active) {
    self.skipWaiting();
  }
});

// Activation : nettoyage des anciens caches et prise de contrôle
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Écoute des messages depuis l'app (bouton de mise à jour dans les paramètres)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Stratégies réseau
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Ignorer les schémas non HTTP(S) et les requêtes cross-origin (Supabase, analytics, etc.)
  if (url.origin !== self.location.origin) return;

  // Ne jamais mettre en cache le service worker lui-même
  if (url.pathname === '/sw.js') return;

  // Navigations HTML (SPA Expo Router) : Network-First avec fallback sur le cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put('/', responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          const cached =
            (await caches.match(request)) || (await caches.match('/'));
          return cached || Response.error();
        })
    );
    return;
  }

  // Assets statiques same-origin (_expo, assets, images, polices) : Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
