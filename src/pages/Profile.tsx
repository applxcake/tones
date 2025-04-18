
import { useState, useEffect } from 'react';
import { User, Settings, Clock, Heart, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import SongTile from '@/components/SongTile';
import { getCurrentUser } from '@/services/userService';

const Profile = () => {
  const { recentlyPlayed, likedSongs } = usePlayer();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Fetch current user data when the component mounts or user changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userData = await getCurrentUser(user.id);
        setCurrentUser(userData);
      }
    };
    
    fetchUserData();
  }, [user]);

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
      
      {/* User Info */}
      <div className="glass-panel rounded-lg p-6 mb-8 flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-full glass-panel flex items-center justify-center neon-glow-blue">
          <User className="w-12 h-12 text-white/70" />
        </div>
        
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold mb-1">{user?.username || 'User'}</h2>
          <p className="text-gray-400 mb-4">{user?.email}</p>
          
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <div className="text-center">
              <p className="text-xl font-bold">2</p>
              <p className="text-sm text-gray-400">Playlists</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">{currentUser?.followers?.length || 0}</p>
              <p className="text-sm text-gray-400">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">{currentUser?.following?.length || 0}</p>
              <p className="text-sm text-gray-400">Following</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* User Activity */}
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
          {recentlyPlayed.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {recentlyPlayed.map((song) => (
                <SongTile key={song.id} song={song} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center glass-panel rounded-lg">
              <p className="text-gray-400">Your listening history will appear here</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="liked">
          {likedSongs.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {likedSongs.map((song) => (
                <SongTile key={song.id} song={song} />
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
