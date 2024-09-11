self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('stashr-cache').then((cache) => {
        return cache.addAll([
          '/',
          '/index.html',
          '/css/styles.css',
          '/script.js',
          '/images/stashr-logo.png'
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  });
  