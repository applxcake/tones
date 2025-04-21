
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

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

// Components
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import TiDBInitializer from '@/components/TiDBInitializer';

// Context providers
import { PlayerProvider } from '@/contexts/PlayerContext';
import { AuthProvider } from '@/contexts/AuthContext';

function App() {
  // Create a new QueryClient instance within the component
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PlayerProvider>
          <BrowserRouter>
            <TiDBInitializer />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              
              <Route element={<Layout />}>
                <Route path="/home" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/playlists" element={<Playlists />} />
                <Route path="/playlists/:id" element={<PlaylistDetails />} />
                <Route path="/users/:id" element={<UserProfile />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </PlayerProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
