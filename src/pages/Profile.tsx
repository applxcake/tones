
import { useState, useEffect } from 'react';
import { User, Settings, Clock, Heart, LogOut, ListMusic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import SongTile from '@/components/SongTile';
import { getCurrentUser } from '@/services/userService';
import { executeQuery } from '@/integrations/tidb/client';
import { getUserPlaylists } from '@/services/playlistService';

const Profile = () => {
  const { recentlyPlayed, likedSongs } = usePlayer();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [currentUserData, setCurrentUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPlaylists, setUserPlaylists] = useState([]);

  // Fetch current user data when the component mounts or user changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          setLoading(true);
          
          // Get user profile from TiDB database
          const userData = await executeQuery(
            'SELECT * FROM users WHERE id = ?',
            [user.id]
          );
          
          if (!userData || userData.length === 0) {
            // Fall back to local data
            const localUserData = await getCurrentUser(user.id);
            setCurrentUserData(localUserData);
          } else {
            // Use database data
            setCurrentUserData({
              ...userData[0],
              email: user.email,
              username: userData[0].username || user.username || user.email?.split('@')[0],
              bio: userData[0].bio || ''
            });
          }
          
          // Fetch the user's playlists
          const playlists = await getUserPlaylists(user.id);
          setUserPlaylists(playlists);
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Try to get user data from the service as fallback
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

  return (
    <div className="pt-6 pb-24 animate-slide-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold animate-fade-in">Profile</h1>
        <div className="flex gap-2 mt-4 md:mt-0 animate-fade-in">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 hover-scale"
            onClick={() => navigate('/settings')}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button 
            variant="destructive" 
            className="flex items-center gap-2 hover-scale"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
      
      {/* User Info */}
      <div className="glass-panel rounded-lg p-6 mb-8 flex flex-col md:flex-row items-center gap-6 animate-scale-in">
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
        
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold mb-1">{currentUserData?.username || 'User'}</h2>
          <p className="text-gray-400 mb-1">{user?.email}</p>
          {currentUserData?.bio && (
            <p className="text-gray-300 mb-4">{currentUserData.bio}</p>
          )}
          
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <div className="text-center hover-scale animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <p className="text-xl font-bold">{userPlaylists?.length || 0}</p>
              <p className="text-sm text-gray-400">Playlists</p>
            </div>
            <div className="text-center hover-scale animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <p className="text-xl font-bold">{currentUserData?.followers?.length || 0}</p>
              <p className="text-sm text-gray-400">Followers</p>
            </div>
            <div className="text-center hover-scale animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <p className="text-xl font-bold">{currentUserData?.following?.length || 0}</p>
              <p className="text-sm text-gray-400">Following</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* User Activity */}
      <Tabs defaultValue="history" className="w-full animate-fade-in">
        <TabsList className="mb-4">
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" /> 
            Listening History
          </TabsTrigger>
          <TabsTrigger value="liked" className="flex items-center gap-2">
            <Heart className="h-4 w-4" /> 
            Liked Songs
          </TabsTrigger>
          <TabsTrigger value="playlists" className="flex items-center gap-2">
            <ListMusic className="h-4 w-4" /> 
            Playlists
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="history" className="animate-slide-in">
          {recentlyPlayed.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {recentlyPlayed.map((song) => (
                <SongTile key={song.id} song={song as any} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center glass-panel rounded-lg">
              <p className="text-gray-400">Your listening history will appear here</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="liked" className="animate-slide-in">
          {likedSongs.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {likedSongs.map((song) => (
                <SongTile key={song.id} song={song as any} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center glass-panel rounded-lg">
              <p className="text-gray-400">Your liked songs will appear here</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="playlists" className="animate-slide-in">
          {userPlaylists.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {userPlaylists.map((playlist) => (
                <Link 
                  to={`/playlists/${playlist.id}`} 
                  key={playlist.id}
                  className="glass-panel rounded-lg p-4 hover-scale transition-all animate-fade-in"
                >
                  <div className="aspect-square rounded-md bg-gray-800/50 mb-3 flex items-center justify-center">
                    <ListMusic className="w-12 h-12 text-neon-purple opacity-70" />
                  </div>
                  <h3 className="font-medium truncate">{playlist.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {playlist.songs.length} song{playlist.songs.length !== 1 ? 's' : ''}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center glass-panel rounded-lg">
              <p className="text-gray-400">
                You don't have any playlists yet. Create some on the 
                <Link to="/playlists" className="text-neon-purple hover:underline mx-1">
                  playlists page
                </Link>!
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
