import React, { useRef } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Pages
import Index from '@/pages/Index';
import Home from '@/pages/Home';
import Search from '@/pages/Search';
import Profile from '@/pages/Profile';
import Auth from '@/pages/Auth';
import NotFound from '@/pages/NotFound';
import Explore from '@/pages/Explore';
import { Settings } from '@/pages/Settings';
import Playlists from '@/pages/Playlists';
import PlaylistDetails from '@/pages/PlaylistDetails';
import SharedPlaylist from '@/pages/SharedPlaylist';
import UserProfile from '@/pages/UserProfile';
import Favorites from '@/pages/Favorites';

// Components
import CleanLayout from '@/components/CleanLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseInitializer } from '@/components/FirebaseInitializer';
import MiniPlayer from '@/components/MiniPlayer';
import SongQueueDrawer from '@/components/SongQueueDrawer';
import YTPlayer from '@/components/YTPlayer';

// Context providers
import { PlayerProvider } from '@/contexts/PlayerContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { usePlayer } from '@/contexts/PlayerContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { currentTrack } = usePlayer();
  const ytPlayerRef = useRef<any>(null);

  // Provide the ref to PlayerContext via window for now (simple global, can be improved)
  if (typeof window !== 'undefined') {
    (window as any)._ytPlayerRef = ytPlayerRef;
  }

  return (
    <BrowserRouter>
      <FirebaseInitializer>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Auth />} /> 
          <Route path="/signup" element={<Auth defaultTab="signup" />} />
          
          <Route element={<CleanLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/playlists/:id" element={<PlaylistDetails />} />
            <Route path="/shared/:shareToken" element={<SharedPlaylist />} />
            <Route path="/users/:id" element={<UserProfile />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <MiniPlayer />
        <SongQueueDrawer />
        {currentTrack && <YTPlayer ref={ytPlayerRef} />}
      </FirebaseInitializer>
    </BrowserRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <PlayerProvider>
            <AppContent />
            <Toaster />
          </PlayerProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;