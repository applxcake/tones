
import { useState, useEffect } from 'react';
import { Heart, History, ListMusic, User, PlayCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { executeQuery } from '@/integrations/tidb/client';
import { useNavigate } from 'react-router-dom';
import SongTile from '@/components/SongTile';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from '@/components/ui/button';
import { getUserPlaylists } from '@/services/playlistService';
import MusicRecommendations from '@/components/MusicRecommendations';
import TrendingSongs from '@/components/TrendingSongs';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { recentlyPlayed, likedSongs } = usePlayer();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          setLoading(true);
          const userPlaylists = await getUserPlaylists(user.id);
          setPlaylists(userPlaylists || []);
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  return (
    <div className="pt-6 pb-24 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8 animate-fade-in">
        {user ? `Welcome back, ${user.username || 'Music Lover'}!` : 'Discover Music'}
      </h1>
      
      <MusicRecommendations userId={user?.id} />
      
      <TrendingSongs />
      
      {user && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Recently Played */}
          <div className="glass-panel rounded-lg p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <History className="text-neon-blue mr-2 h-5 w-5" />
                <h2 className="text-xl font-semibold">Recently Played</h2>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-sm"
                onClick={() => navigate('/profile')}
              >
                View All
              </Button>
            </div>
            {recentlyPlayed.length > 0 ? (
              <div className="space-y-2">
                {recentlyPlayed.slice(0, 3).map((song, index) => (
                  <div 
                    key={song.id} 
                    className="flex items-center p-2 rounded-md hover:bg-white/5 transition-all cursor-pointer"
                    onClick={() => navigate('/profile')}
                  >
                    <div className="font-mono text-gray-400 w-6 text-center">
                      {index + 1}
                    </div>
                    <img 
                      src={song.thumbnailUrl}
                      alt={song.title}
                      className="w-10 h-10 rounded object-cover mx-2"
                    />
                    <div className="truncate flex-1 min-w-0">
                      <p className="truncate font-medium">{song.title}</p>
                      <p className="text-sm text-gray-400 truncate">{song.channelTitle}</p>
                    </div>
                    <PlayCircle className="h-5 w-5 ml-2 text-gray-400 hover:text-white" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>Your recently played tracks will appear here</p>
              </div>
            )}
          </div>
          
          {/* Liked Songs */}
          <div className="glass-panel rounded-lg p-6 animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Heart className="text-neon-pink mr-2 h-5 w-5" />
                <h2 className="text-xl font-semibold">Liked Songs</h2>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-sm"
                onClick={() => navigate('/profile')}
              >
                View All
              </Button>
            </div>
            {likedSongs.length > 0 ? (
              <div className="space-y-2">
                {likedSongs.slice(0, 3).map((song, index) => (
                  <div 
                    key={song.id} 
                    className="flex items-center p-2 rounded-md hover:bg-white/5 transition-all cursor-pointer"
                    onClick={() => navigate('/profile')}
                  >
                    <div className="font-mono text-gray-400 w-6 text-center">
                      {index + 1}
                    </div>
                    <img 
                      src={song.thumbnailUrl}
                      alt={song.title}
                      className="w-10 h-10 rounded object-cover mx-2"
                    />
                    <div className="truncate flex-1 min-w-0">
                      <p className="truncate font-medium">{song.title}</p>
                      <p className="text-sm text-gray-400 truncate">{song.channelTitle}</p>
                    </div>
                    <Heart className="h-5 w-5 ml-2 text-neon-pink fill-neon-pink" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>Your liked songs will appear here</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Your Playlists */}
      {user && (
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <ListMusic className="text-neon-purple mr-2 h-5 w-5" />
              <h2 className="text-xl font-semibold">Your Playlists</h2>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-sm"
              onClick={() => navigate('/playlists')}
            >
              View All
            </Button>
          </div>
          
          {playlists.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {playlists.slice(0, 5).map((playlist) => (
                <div 
                  key={playlist.id}
                  className="glass-panel rounded-lg overflow-hidden hover-scale cursor-pointer"
                  onClick={() => navigate(`/playlists/${playlist.id}`)}
                >
                  <div className="h-28 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                    <ListMusic className="h-10 w-10 text-white/60" />
                  </div>
                  <div className="p-3">
                    <p className="font-medium truncate">{playlist.name}</p>
                    <p className="text-xs text-gray-400">{playlist.songs.length} songs</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 glass-panel rounded-lg">
              <p className="text-gray-400 mb-4">You haven't created any playlists yet</p>
              <Button onClick={() => navigate('/playlists')}>Create Playlist</Button>
            </div>
          )}
        </div>
      )}
      
      {!user && (
        <div className="glass-panel rounded-lg p-8 text-center mb-8 animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <User className="h-10 w-10 mx-auto mb-4 text-neon-purple" />
          <h2 className="text-2xl font-bold mb-2">Sign In to Get Started</h2>
          <p className="text-gray-400 mb-4">Create playlists, save your favorite songs, and get personalized recommendations.</p>
          <div className="flex justify-center gap-4">
            <Button 
              onClick={() => navigate('/login')}
              variant="outline"
              className="hover-scale"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => navigate('/signup')}
              className="bg-neon-purple hover:bg-neon-purple/80 hover-scale"
            >
              Sign Up
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
