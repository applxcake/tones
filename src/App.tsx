
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Search from "@/pages/Search";
import Playlists from "@/pages/Playlists";
import PlaylistDetails from "@/pages/PlaylistDetails";
import Profile from "@/pages/Profile";
import Auth from "@/pages/Auth";
import Explore from "@/pages/Explore";
import UserProfile from "@/pages/UserProfile";
import Settings from "@/pages/Settings";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <PlayerProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Auth routes */}
              <Route path="/login" element={<Auth />} />
              <Route path="/signup" element={<Auth />} />
              
              {/* Protected routes */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="search" element={<Search />} />
                <Route path="playlists">
                  <Route index element={<ProtectedRoute><Playlists /></ProtectedRoute>} />
                  <Route path=":id" element={<ProtectedRoute><PlaylistDetails /></ProtectedRoute>} />
                </Route>
                <Route path="explore" element={<Explore />} />
                <Route path="users/:id" element={<UserProfile />} />
                <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </PlayerProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
