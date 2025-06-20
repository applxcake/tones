
import React from 'react';
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
import Settings from '@/pages/Settings';
import Playlists from '@/pages/Playlists';
import PlaylistDetails from '@/pages/PlaylistDetails';
import UserProfile from '@/pages/UserProfile';
import Favorites from '@/pages/Favorites';
import Downloads from '@/pages/Downloads';
import Library from '@/pages/Library';

// Components
import CleanLayout from '@/components/CleanLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import SupabaseInitializer from '@/components/SupabaseInitializer';
import MiniPlayer from '@/components/MiniPlayer';
import SongQueueDrawer from '@/components/SongQueueDrawer';
import YTPlayer from '@/components/YTPlayer';

// Context providers
import { PlayerProvider } from '@/contexts/PlayerContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Create a client outside of the component
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <PlayerProvider>
            <BrowserRouter>
              <SupabaseInitializer />
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
                  <Route path="/library" element={<Library />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/downloads" element={<Downloads />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/playlists" element={<Playlists />} />
                  <Route path="/playlists/:id" element={<PlaylistDetails />} />
                  <Route path="/users/:id" element={<UserProfile />} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
              <MiniPlayer />
              <SongQueueDrawer />
              <YTPlayer />
            </BrowserRouter>
            <Toaster />
          </PlayerProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
