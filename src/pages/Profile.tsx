
import { useState, useEffect } from 'react';
import { User, Settings, Clock, Heart, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import SongTile from '@/components/SongTile';
import { getCurrentUser } from '@/services/userService';
import { YouTubeVideoBasic } from '@/services/youtubeService';

const Profile = () => {
  const { recentlyPlayed, likedSongs } = usePlayer();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user data when the component mounts or user changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          setLoading(true);
          const userData = await getCurrentUser(user.id);
          setCurrentUserData(userData);
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
          <User className="w-12 h-12 text-white/70" />
        </div>
        
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold mb-1">{currentUserData?.username || 'User'}</h2>
          <p className="text-gray-400 mb-1">{user?.email}</p>
          {currentUserData?.bio && (
            <p className="text-gray-300 mb-4">{currentUserData.bio}</p>
          )}
          
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <div className="text-center hover-scale">
              <p className="text-xl font-bold">2</p>
              <p className="text-sm text-gray-400">Playlists</p>
            </div>
            <div className="text-center hover-scale">
              <p className="text-xl font-bold">{currentUserData?.followers?.length || 0}</p>
              <p className="text-sm text-gray-400">Followers</p>
            </div>
            <div className="text-center hover-scale">
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
      </Tabs>
    </div>
  );
};

export default Profile;
