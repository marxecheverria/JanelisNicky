// Service Worker para control de caché en GitHub Pages
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `album-cache-${CACHE_VERSION}`;

// Archivos a cachear inmediatamente
const STATIC_ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './audio/videoplayback.m4a'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
    console.log('[SW] Instalando Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Archivos en caché');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activación y limpieza de cachés antiguos
self.addEventListener('activate', (event) => {
    console.log('[SW] Activando Service Worker...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[SW] Eliminando caché antigua:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Estrategia de caché: Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Solo cachear recursos del mismo origen
    if (url.origin !== location.origin) {
        return;
    }
    
    event.respondWith(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.match(request)
                    .then((cachedResponse) => {
                        // Si está en caché, devolver y actualizar en segundo plano
                        const fetchPromise = fetch(request)
                            .then((networkResponse) => {
                                // Solo cachear respuestas exitosas
                                if (networkResponse && networkResponse.status === 200) {
                                    // Para imágenes, usar estrategia de caché más agresiva
                                    if (request.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
                                        cache.put(request, networkResponse.clone());
                                    } else if (request.url.match(/\.(css|js)$/i)) {
                                        // CSS y JS con caché controlado
                                        cache.put(request, networkResponse.clone());
                                    }
                                }
                                return networkResponse;
                            })
                            .catch(() => {
                                // Si falla la red, devolver desde caché
                                return cachedResponse;
                            });
                        
                        // Devolver caché primero para velocidad
                        return cachedResponse || fetchPromise;
                    });
            })
    );
});

// Mensajes del Service Worker
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            })
        );
    }
});

console.log('[SW] Service Worker cargado - Versión:', CACHE_VERSION);

