// Service Worker for notification page caching and performance
const CACHE_NAME = 'notifications-v1';
const CACHE_URLS = [
    '/notifications.html',
    '/js/include-navbar.js',
    '/socket.io/socket.io.js',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching resources...');
                return cache.addAll(CACHE_URLS);
            })
            .then(() => {
                console.log('Service Worker installed successfully');
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker activated');
            return self.clients.claim();
        })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    console.log('Serving from cache:', event.request.url);
                    return cachedResponse;
                }

                console.log('Fetching from network:', event.request.url);
                return fetch(event.request)
                    .then((response) => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response for caching
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch((error) => {
                        console.error('Fetch failed:', error);
                        // Return a custom offline page for navigation requests
                        if (event.request.destination === 'document') {
                            return caches.match('/notifications.html');
                        }
                        throw error;
                    });
            })
    );
});

// Handle background sync for notifications
self.addEventListener('sync', (event) => {
    if (event.tag === 'notification-sync') {
        console.log('Background sync for notifications');
        event.waitUntil(
            // Sync notifications in background
            fetch('/api/notifications')
                .then((response) => response.json())
                .then((data) => {
                    // Store in IndexedDB or send to main thread
                    self.clients.matchAll().then((clients) => {
                        clients.forEach((client) => {
                            client.postMessage({
                                type: 'NOTIFICATIONS_SYNC',
                                data: data
                            });
                        });
                    });
                })
                .catch((error) => {
                    console.error('Background sync failed:', error);
                })
        );
    }
});

// Handle push notifications
self.addEventListener('push', (event) => {
    console.log('Push notification received');
    
    const options = {
        body: 'You have a new notification',
        icon: '/img/logo.png',
        badge: '/img/logo.png',
        tag: 'notification',
        requireInteraction: true,
        actions: [
            {
                action: 'view',
                title: 'View Notifications'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ]
    };

    if (event.data) {
        const data = event.data.json();
        options.body = data.message || options.body;
        options.title = data.title || 'New Notification';
    }

    event.waitUntil(
        self.registration.showNotification('MBAPE GLOBAL', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event.action);
    
    event.notification.close();

    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/notifications.html')
        );
    }
});
