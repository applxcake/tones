
import { useEffect } from 'react';
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

// Components
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import TiDBInitializer from '@/components/TiDBInitializer';

// Context providers
import { PlayerProvider } from '@/contexts/PlayerContext';
import { AuthProvider } from '@/contexts/AuthContext';

const queryClient = new QueryClient();

function App() {
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
                <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
                <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/playlists" element={<ProtectedRoute><Playlists /></ProtectedRoute>} />
                <Route path="/playlists/:id" element={<ProtectedRoute><PlaylistDetails /></ProtectedRoute>} />
                <Route path="/users/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
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
