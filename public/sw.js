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
  try {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_AUDIO_SYNC',
        timestamp: Date.now()
      });
    });
    console.log('Background audio sync completed');
  } catch (error) {
    console.error('Background audio sync failed:', error);
  }
}

// Handle push notifications for audio controls
self.addEventListener('push', (event) => {
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body || 'Music is playing in the background',
        icon: '/music-note.svg',
        badge: '/music-note.svg',
        tag: 'audio-playback',
        requireInteraction: false,
        silent: true,
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
    } catch (error) {
      console.error('Push notification error:', error);
    }
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const action = event.action;
  
  event.waitUntil(
    self.clients.matchAll().then((clientList) => {
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
    case 'BACKGROUND_PLAYBACK_ENABLED':
      console.log('Background playback enabled in service worker');
      // Ensure the service worker stays active for background audio
      break;
  }
});

// Update media session metadata
function updateMediaSession(metadata) {
  if ('mediaSession' in navigator) {
    try {
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

      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        postMessageToClients({ 
          type: 'MEDIA_SESSION_ACTION', 
          action: 'seekbackward', 
          seekOffset: details.seekOffset 
        });
      });

      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        postMessageToClients({ 
          type: 'MEDIA_SESSION_ACTION', 
          action: 'seekforward', 
          seekOffset: details.seekOffset 
        });
      });

      console.log('Media session updated successfully');
    } catch (error) {
      console.error('Failed to update media session:', error);
    }
  }
}

// Register background sync
async function registerBackgroundSync() {
  try {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('background-audio');
      console.log('Background sync registered successfully');
    } else {
      console.warn('Background sync not supported');
    }
  } catch (error) {
    console.error('Background sync registration failed:', error);
  }
}

// Show audio notification
async function showAudioNotification(data) {
  try {
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
  } catch (error) {
    console.error('Failed to show audio notification:', error);
  }
}

// Post message to all clients
async function postMessageToClients(message) {
  try {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage(message);
    });
  } catch (error) {
    console.error('Failed to post message to clients:', error);
  }
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

// Periodic background sync for audio playback
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'background-audio-sync') {
    event.waitUntil(handleBackgroundAudio());
  }
}); 