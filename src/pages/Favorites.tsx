import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SongTile from '@/components/SongTile';
import { YouTubeVideo, getMultipleVideoDetails } from '@/services/youtubeService';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayer } from '@/contexts/PlayerContext';
import { Heart, RefreshCw, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

const Favorites = () => {
  const { user } = useAuth();
  const { likedSongs, setLikedSongs, toggleLike } = usePlayer();
  const [loading, setLoading] = useState(false);
  const [fullLikedSongs, setFullLikedSongs] = useState<YouTubeVideo[]>([]);

  useEffect(() => {
    const fetchFullLikedSongs = async () => {
      if (likedSongs.length > 0) {
        setLoading(true);
        const ids = likedSongs.map(song => song.id);
        const songObjects = await getMultipleVideoDetails(ids);
        setFullLikedSongs(songObjects.filter(Boolean) as YouTubeVideo[]);
        setLoading(false);
      } else {
        setFullLikedSongs([]);
      }
    };
    fetchFullLikedSongs();
  }, [likedSongs]);

  const handleRemoveLiked = async (song: YouTubeVideo) => {
    try {
      await toggleLike(song);
      toast({
        title: "Removed from Liked Songs",
        description: `${song.title} has been removed from your liked songs.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove song from liked songs.",
        variant: "destructive"
      });
    }
  };

  const clearAllLiked = () => {
    setLikedSongs([]);
    toast({
      title: "Cleared All Liked Songs",
      description: "All liked songs have been removed.",
    });
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2 text-white">Sign in to view favorites</h2>
            <p className="text-gray-400">
              Create an account to save your favorite songs and access them anytime.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Heart className="h-8 w-8 text-red-500" />
          <div>
            <h1 className="text-3xl font-bold text-white">Liked Songs</h1>
            <p className="text-gray-400">
              {fullLikedSongs.length} {fullLikedSongs.length === 1 ? 'song' : 'songs'} in your collection
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {likedSongs.length > 0 && (
            <Button 
              variant="outline" 
              onClick={clearAllLiked}
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
          <Button variant="outline" onClick={() => setLoading(!loading)} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {fullLikedSongs.length === 0 ? (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2 text-white">No liked songs yet</h2>
            <p className="text-gray-400 mb-4">
              Start building your collection by liking songs you love.
            </p>
            <Button onClick={() => window.history.back()}>
              Discover Music
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {fullLikedSongs.map((song, index) => (
            <motion.div
              key={song.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative group"
            >
              <SongTile 
                song={song} 
                showFavoriteButton
                isFavorited={true}
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleRemoveLiked(song)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/80 hover:bg-red-600 text-white"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
