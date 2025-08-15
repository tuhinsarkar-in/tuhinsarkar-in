// Service Worker for Tuhin Sarkar's Website
// Handles caching and offline functionality

const CACHE_NAME = 'tuhinsarkar-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/aboutme.html',
  '/portfolio.html',
  '/legacy.html',
  '/contact.html',
  '/privacy-policy.html',
  '/cookie-policy.html',
  '/terms-conditions.html',
  '/css/main.css',
  '/css/dark-mode-fixes.css',
  '/css/cookie-consent.css',
  '/js/main.min.js',
  '/js/cookie-consent.js',
  '/js/site-enhancements.js',
  '/images/profile.png',
  '/images/headshot.jpg',
  '/images/favicon.ico'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache if available
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 