
import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import SongTile from '@/components/SongTile';
import { executeQuery } from '@/integrations/tidb/client';
import { YouTubeVideo } from '@/services/youtubeService';

const TrendingSongs = () => {
  const [trending, setTrending] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getTrending = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, we would get trending songs from:
        // 1. Most played songs in our database
        // 2. External API for trending songs
        
        // For now, we'll use some songs from our mock data
        const songs = await executeQuery<any[]>('SELECT * FROM songs LIMIT 10');
        
        const trendingSongs = songs.map(song => ({
          id: song.id,
          title: song.title,
          thumbnailUrl: song.thumbnail_url,
          channelTitle: song.channel_title,
          publishedAt: new Date().toISOString(),
        }));
        
        // Shuffle to simulate different trending songs
        const shuffled = [...trendingSongs].sort(() => Math.random() - 0.5);
        
        setTrending(shuffled);
      } catch (error) {
        console.error('Error fetching trending songs:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getTrending();
  }, []);
  
  if (loading) {
    return (
      <div className="w-full animate-pulse">
        <div className="flex items-center mb-4">
          <div className="h-5 w-32 bg-gray-700 rounded"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass-panel rounded-lg overflow-hidden">
              <div className="h-28 bg-gray-700"></div>
              <div className="p-2">
                <div className="h-4 w-full bg-gray-700 rounded mb-2"></div>
                <div className="h-3 w-2/3 bg-gray-800 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (trending.length === 0) {
    return null;
  }
  
  return (
    <div className="w-full mb-8 animate-fade-in">
      <div className="flex items-center mb-4">
        <TrendingUp className="h-5 w-5 text-neon-pink mr-2" />
        <h2 className="text-xl font-semibold">Trending Now</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {trending.slice(0, 5).map((song) => (
          <SongTile key={song.id} song={song} />
        ))}
      </div>
    </div>
  );
};

export default TrendingSongs;
