// Service Worker for Background Audio Playback
const CACHE_NAME = 'tones-audio-v1';

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.webmanifest',
        '/favicon.ico',
        '/music-note.svg'
      ]);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Background sync for audio playback
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-audio') {
    event.waitUntil(handleBackgroundAudio());
  }
});

// Handle background audio sync
async function handleBackgroundAudio() {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'BACKGROUND_AUDIO_SYNC',
      timestamp: Date.now()
    });
  });
}

// Handle push notifications for audio controls
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Music is playing in the background',
      icon: '/music-note.svg',
      badge: '/music-note.svg',
      tag: 'audio-playback',
      requireInteraction: false,
      actions: [
        {
          action: 'play',
          title: 'Play',
          icon: '/music-note.svg'
        },
        {
          action: 'pause',
          title: 'Pause',
          icon: '/music-note.svg'
        },
        {
          action: 'next',
          title: 'Next',
          icon: '/music-note.svg'
        },
        {
          action: 'previous',
          title: 'Previous',
          icon: '/music-note.svg'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification('Tones Music Player', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const action = event.action;
  const clients = self.clients.matchAll();
  
  event.waitUntil(
    clients.then((clientList) => {
      if (clientList.length > 0) {
        const client = clientList[0];
        client.focus();
        client.postMessage({
          type: 'NOTIFICATION_ACTION',
          action: action
        });
      } else {
        self.clients.openWindow('/');
      }
    })
  );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'UPDATE_MEDIA_SESSION':
      updateMediaSession(data);
      break;
    case 'REGISTER_BACKGROUND_SYNC':
      registerBackgroundSync();
      break;
    case 'SHOW_AUDIO_NOTIFICATION':
      showAudioNotification(data);
      break;
  }
});

// Update media session metadata
function updateMediaSession(metadata) {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: metadata.title || 'Unknown Track',
      artist: metadata.artist || 'Unknown Artist',
      album: metadata.album || 'Unknown Album',
      artwork: metadata.artwork ? [
        { src: metadata.artwork, sizes: '512x512', type: 'image/png' }
      ] : []
    });

    // Set up media session action handlers
    navigator.mediaSession.setActionHandler('play', () => {
      postMessageToClients({ type: 'MEDIA_SESSION_ACTION', action: 'play' });
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      postMessageToClients({ type: 'MEDIA_SESSION_ACTION', action: 'pause' });
    });

    navigator.mediaSession.setActionHandler('previoustrack', () => {
      postMessageToClients({ type: 'MEDIA_SESSION_ACTION', action: 'previous' });
    });

    navigator.mediaSession.setActionHandler('nexttrack', () => {
      postMessageToClients({ type: 'MEDIA_SESSION_ACTION', action: 'next' });
    });

    navigator.mediaSession.setActionHandler('seekto', (details) => {
      postMessageToClients({ 
        type: 'MEDIA_SESSION_ACTION', 
        action: 'seekto', 
        seekTime: details.seekTime 
      });
    });
  }
}

// Register background sync
async function registerBackgroundSync() {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('background-audio');
    } catch (error) {
      console.error('Background sync registration failed:', error);
    }
  }
}

// Show audio notification
async function showAudioNotification(data) {
  const options = {
    body: `Now playing: ${data.title}`,
    icon: data.artwork || '/music-note.svg',
    badge: '/music-note.svg',
    tag: 'audio-playback',
    requireInteraction: false,
    silent: true,
    actions: [
      { action: 'play', title: 'Play', icon: '/music-note.svg' },
      { action: 'pause', title: 'Pause', icon: '/music-note.svg' },
      { action: 'next', title: 'Next', icon: '/music-note.svg' }
    ]
  };

  await self.registration.showNotification('Tones Music Player', options);
}

// Post message to all clients
async function postMessageToClients(message) {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage(message);
  });
}

// Keep service worker alive for audio playback
self.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
});

// Handle audio focus and interruptions
self.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    // App went to background, ensure audio continues
    postMessageToClients({ type: 'APP_BACKGROUND' });
  } else {
    // App came to foreground
    postMessageToClients({ type: 'APP_FOREGROUND' });
  }
}); 