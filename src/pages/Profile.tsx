import { useState, useEffect } from 'react';
import { User, Settings, Clock, Heart, LogOut, ListMusic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import SongTile from '@/components/SongTile';
import { getUserPlaylists } from '@/services/playlistService';
import { fetchUserProfile } from '@/services/userService';
import { FirestoreUserProfile } from '@/integrations/firebase/database';
import { useIsMobile } from '@/hooks/use-mobile';

const Profile = () => {
  const { recentlyPlayed, likedSongs } = usePlayer();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [userProfile, setUserProfile] = useState<FirestoreUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        setLoading(true);
        try {
          // Fetch the user's playlists from Firebase
          const playlists = await getUserPlaylists(user.id);
          setUserPlaylists(playlists);
          
          // Fetch user profile from Firestore
          const profile = await fetchUserProfile(user.id);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="pt-6 pb-24 animate-slide-in">
        <div className="flex justify-center py-12">
          <div className="glass-panel p-8 rounded-xl shadow-lg">
            <p className="text-gray-400 text-sm">Please sign in to view your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pt-6 pb-24 animate-slide-in">
        <div className="flex justify-center py-12">
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div 
                key={i}
                className="w-2 h-2 bg-neon-purple rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Use profile data or fallback to auth user data
  const displayName = userProfile?.displayName || user.username || user.email?.split('@')[0] || 'User';
  const avatarUrl = userProfile?.avatarUrl || user.avatarUrl;
  const bio = userProfile?.bio || '';

  return (
    <div className="pt-6 pb-24 animate-slide-in">
      {/* Header section with responsive design */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold animate-fade-in">Profile</h1>
        <div className="flex gap-2 mt-4 md:mt-0 animate-fade-in">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 hover-scale group"
            onClick={() => navigate('/settings')}
          >
            <Settings className="h-4 w-4 group-hover:text-neon-purple transition-colors" />
            Settings
          </Button>
          <Button 
            variant="destructive" 
            className="flex items-center gap-2 hover-scale group"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 group-hover:text-white transition-colors" />
            Logout
          </Button>
        </div>
      </div>
      
      {/* User Info Card */}
      <div className="glass-card rounded-lg p-6 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-neon-pink/5 z-0"></div>
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10 animate-scale-in">
          <div className="relative">
            <div className="w-24 h-24 rounded-full glass-panel flex items-center justify-center neon-glow-blue hover-scale">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={displayName}
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white/70"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                    }
                  }}
                />
              ) : (
                <User className="w-12 h-12 text-white/70" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-background border border-white/10 flex items-center justify-center hover:bg-neon-purple/20 cursor-pointer transition-colors">
              <Settings className="w-4 h-4 text-white/70" />
            </div>
          </div>
          <div className="flex flex-col items-center md:items-start gap-2">
            <h2 className="text-xl font-bold text-white">{displayName}</h2>
            <p className="text-gray-400 text-sm">{user.email}</p>
            {bio && (
              <p className="text-gray-300 text-sm max-w-md text-center md:text-left">{bio}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Playlists Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Your Playlists</h3>
        {userPlaylists.length === 0 ? (
          <p className="text-gray-400">No playlists yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userPlaylists.map((playlist: any) => (
              <div key={playlist.id} className="glass-panel p-4 rounded-lg">
                <h4 className="font-semibold text-white mb-2">{playlist.name}</h4>
                <p className="text-gray-400 text-sm mb-2">{playlist.description}</p>
                <div className="flex flex-wrap gap-2">
                  {playlist.songs && playlist.songs.length > 0 ? (
                    playlist.songs.slice(0, 3).map((song: any, index: number) => (
                      <span key={song.id || `song-${index}`} className="bg-purple-700/20 text-purple-300 px-2 py-1 rounded text-xs">
                        {song.title}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-xs">No songs</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Liked Songs Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Liked Songs</h3>
        {likedSongs.length === 0 ? (
          <p className="text-gray-400">No liked songs yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {likedSongs.map((song: any) => (
              <SongTile key={song.id} song={song} />
            ))}
          </div>
        )}
      </div>
      
      {/* Recently Played Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Recently Played</h3>
        {recentlyPlayed.length === 0 ? (
          <p className="text-gray-400">No recently played songs yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentlyPlayed.map((song: any) => (
              <SongTile key={song.id} song={song} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
