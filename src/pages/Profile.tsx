import { useState, useEffect } from 'react';
import { User, Settings, Clock, Heart, LogOut, ListMusic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import SongTile from '@/components/SongTile';
import { getCurrentUser } from '@/services/userService';
import { getUserPlaylists } from '@/services/playlistService';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';

const Profile = () => {
  const { recentlyPlayed, likedSongs } = usePlayer();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [currentUserData, setCurrentUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const isMobile = useIsMobile();
  
  // Fetch current user data when the component mounts or user changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          setLoading(true);
          // Fetch user profile from Supabase
          const { data: userData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          if (!userData || error) {
            // Fall back to local data if not found
            const localUserData = await getCurrentUser(user.id);
            setCurrentUserData(localUserData);
          } else {
            setCurrentUserData({
              ...userData,
              email: user.email,
              username: userData.username,
              bio: userData.bio,
              avatar: userData.avatar_url
            });
          }
          // Fetch the user's playlists
          const playlists = await getUserPlaylists(user.id);
          setUserPlaylists(playlists);
        } catch (error) {
          console.error('Error fetching user data:', error);
          try {
            const fallbackUserData = await getCurrentUser(user.id);
            setCurrentUserData(fallbackUserData);
          } catch (fallbackError) {
            console.error('Error getting fallback user data:', fallbackError);
          }
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

  if (loading) {
    return (
      <div className="pt-6 pb-24 animate-slide-in">
        <div className="flex justify-center py-12">
          <div className="glass-panel p-8 rounded-xl shadow-lg">
            <div className="flex gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div 
                  key={i}
                  className="w-3 h-3 bg-neon-purple rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <p className="mt-4 text-gray-400 text-sm">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

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
      
      {/* User Info Card with enhanced visuals */}
      <div className="glass-card rounded-lg p-6 mb-8 relative overflow-hidden">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-neon-pink/5 z-0"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10 animate-scale-in">
          {/* Profile Avatar with glow effect */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full glass-panel flex items-center justify-center neon-glow-blue hover-scale">
              {currentUserData?.avatar ? (
                <img 
                  src={currentUserData.avatar} 
                  alt={currentUserData.username}
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
          
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold mb-1 text-gradient">{currentUserData?.username || 'User'}</h2>
            <p className="text-gray-400 mb-2">{user?.email}</p>
            {currentUserData?.bio && (
              <p className="text-gray-300 mb-4 max-w-md">{currentUserData.bio}</p>
            )}
            
            <div className="flex flex-wrap gap-4 justify-center md:justify-start mt-4">
              <div className="glass-card-hover p-3 w-24 text-center hover-scale animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <p className="text-xl font-bold">{userPlaylists?.length || 0}</p>
                <p className="text-xs text-gray-400">Playlists</p>
              </div>
              <div className="glass-card-hover p-3 w-24 text-center hover-scale animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <p className="text-xl font-bold">{currentUserData?.followers?.length || 0}</p>
                <p className="text-xs text-gray-400">Followers</p>
              </div>
              <div className="glass-card-hover p-3 w-24 text-center hover-scale animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <p className="text-xl font-bold">{currentUserData?.following?.length || 0}</p>
                <p className="text-xs text-gray-400">Following</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* User Activity Tabs with improved mobile responsiveness */}
      <Tabs defaultValue="history" className="w-full animate-fade-in">
        <TabsList className="mb-4 w-full md:w-auto overflow-x-auto flex whitespace-nowrap">
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" /> 
            {!isMobile && "Listening History"}
            {isMobile && "History"}
          </TabsTrigger>
          <TabsTrigger value="liked" className="flex items-center gap-2">
            <Heart className="h-4 w-4" /> 
            {!isMobile && "Liked Songs"}
            {isMobile && "Liked"}
          </TabsTrigger>
          <TabsTrigger value="playlists" className="flex items-center gap-2">
            <ListMusic className="h-4 w-4" /> 
            Playlists
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="history" className="animate-slide-in">
          {recentlyPlayed.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {recentlyPlayed.map((song) => (
                <SongTile key={song.id} song={song as any} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center glass-card relative overflow-hidden">
              <div className="shimmer absolute inset-0"></div>
              <div className="relative z-10">
                <Clock className="w-10 h-10 mx-auto mb-4 text-gray-500" />
                <p className="text-gray-400">Your listening history will appear here</p>
                <Button 
                  variant="outline"
                  className="mt-4 border-neon-purple/40 hover:bg-neon-purple/20"
                  onClick={() => navigate('/home')}
                >
                  Start listening
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="liked" className="animate-slide-in">
          {likedSongs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {likedSongs.map((song) => (
                <SongTile key={song.id} song={song as any} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center glass-card relative overflow-hidden">
              <div className="shimmer absolute inset-0"></div>
              <div className="relative z-10">
                <Heart className="w-10 h-10 mx-auto mb-4 text-gray-500" />
                <p className="text-gray-400">Your liked songs will appear here</p>
                <Button 
                  variant="outline"
                  className="mt-4 border-neon-purple/40 hover:bg-neon-purple/20"
                  onClick={() => navigate('/home')}
                >
                  Discover music
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="playlists" className="animate-slide-in">
          {userPlaylists.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {userPlaylists.map((playlist) => (
                <Link 
                  to={`/playlists/${playlist.id}`} 
                  key={playlist.id}
                  className="glass-card-hover p-4 transition-all animate-fade-in group"
                >
                  <div className="aspect-square rounded-md bg-gradient-to-br from-gray-800/50 to-black/50 mb-3 flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(155,135,245,0.2)] transition-shadow">
                    <ListMusic className="w-12 h-12 text-neon-purple opacity-70 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="font-medium truncate group-hover:text-neon-purple transition-colors">{playlist.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {playlist.songs.length} song{playlist.songs.length !== 1 ? 's' : ''}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center glass-card relative overflow-hidden">
              <div className="shimmer absolute inset-0"></div>
              <div className="relative z-10">
                <ListMusic className="w-10 h-10 mx-auto mb-4 text-gray-500" />
                <p className="text-gray-400">
                  You don't have any playlists yet
                </p>
                <Link to="/playlists" className="inline-block mt-4">
                  <Button 
                    variant="default"
                    className="bg-neon-purple hover:bg-neon-purple/80"
                  >
                    Create playlist
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
