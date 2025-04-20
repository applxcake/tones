
import { useState, useEffect } from 'react';
import { User, Settings, Clock, Heart, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import SongTile from '@/components/SongTile';
import { getCurrentUser } from '@/services/userService';
import { YouTubeVideo } from '@/services/youtubeService';

const Profile = () => {
  const { recentlyPlayed, likedSongs } = usePlayer();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Convert YouTubeVideoBasic to YouTubeVideo for SongTile
  const convertToFullVideo = (basicVideo: any): YouTubeVideo => ({
    ...basicVideo,
    description: '',
    channelTitle: basicVideo.channelTitle || 'Unknown',
    thumbnailUrl: basicVideo.thumbnail,
  });

  const refreshUserData = async () => {
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

  useEffect(() => {
    refreshUserData();
  }, [user]);

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

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="pt-6 pb-24 animate-slide-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => navigate('/settings')}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button 
            variant="destructive" 
            className="flex items-center gap-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
      
      <div className="glass-panel rounded-lg p-6 mb-8 flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-full glass-panel flex items-center justify-center neon-glow-blue">
          <User className="w-12 h-12 text-white/70" />
        </div>
        
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold mb-1">{user?.username || 'User'}</h2>
          <p className="text-gray-400 mb-2">{user?.email}</p>
          {currentUserData?.bio && (
            <p className="text-gray-300 mb-4 italic">{currentUserData.bio}</p>
          )}
          
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <div className="text-center">
              <p className="text-xl font-bold">{currentUserData?.followers?.length || 0}</p>
              <p className="text-sm text-gray-400">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">{currentUserData?.following?.length || 0}</p>
              <p className="text-sm text-gray-400">Following</p>
            </div>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="history" className="w-full">
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
        
        <TabsContent value="history">
          {recentlyPlayed && recentlyPlayed.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {recentlyPlayed.map((song) => (
                <SongTile 
                  key={song.id} 
                  song={convertToFullVideo(song)} 
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center glass-panel rounded-lg">
              <p className="text-gray-400">Your listening history will appear here</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="liked">
          {likedSongs && likedSongs.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {likedSongs.map((song) => (
                <SongTile 
                  key={song.id} 
                  song={convertToFullVideo(song)} 
                />
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
