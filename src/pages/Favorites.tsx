
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SongTile from '@/components/SongTile';
import { getUserFavorites } from '@/services/favoritesService';
import { YouTubeVideo } from '@/services/youtubeService';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const Favorites = () => {
  const [favorites, setFavorites] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadFavorites = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userFavorites = await getUserFavorites(user.id);
      setFavorites(userFavorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [user]);

  const handleFavoriteChange = (songId: string, isFavorited: boolean) => {
    if (!isFavorited) {
      setFavorites(prev => prev.filter(song => song.id !== songId));
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Sign in to view favorites</h2>
            <p className="text-muted-foreground">
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
            <h1 className="text-3xl font-bold">My Favorites</h1>
            <p className="text-muted-foreground">
              {favorites.length} {favorites.length === 1 ? 'song' : 'songs'} in your collection
            </p>
          </div>
        </div>
        
        <Button variant="outline" onClick={loadFavorites} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-300 rounded-lg aspect-square mb-2" />
              <div className="h-4 bg-gray-300 rounded mb-1" />
              <div className="h-3 bg-gray-300 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">No favorites yet</h2>
            <p className="text-muted-foreground mb-4">
              Start building your collection by adding songs to your favorites.
            </p>
            <Button onClick={() => window.history.back()}>
              Discover Music
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {favorites.map((song, index) => (
            <motion.div
              key={song.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <SongTile 
                song={song} 
                showFavoriteButton
                isFavorited={true}
                onFavoriteChange={(isFavorited) => handleFavoriteChange(song.id, isFavorited)}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
