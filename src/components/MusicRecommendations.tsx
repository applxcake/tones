
import { useEffect, useState } from 'react';
import { Music, TrendingUp, Sparkles } from 'lucide-react';
import SongTile from '@/components/SongTile';
import { executeQuery } from '@/integrations/tidb/client';
import { toast } from '@/components/ui/use-toast';
import { YouTubeVideo } from '@/services/youtubeService';

interface MusicRecommendationsProps {
  userId?: string;
}

const MusicRecommendations = ({ userId }: MusicRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRecommendations = async () => {
      try {
        setLoading(true);
        
        // For a real implementation, we would use an algorithm that considers:
        // 1. User's listening history
        // 2. User's liked songs
        // 3. Similar artists/genres to what they listen to
        // 4. Trending songs in their region
        
        // For now, we'll show random songs from our mock database
        const songs = await executeQuery<any[]>('SELECT * FROM songs LIMIT 10');
        
        // Map to expected YouTubeVideo format
        const recommendedSongs = songs.map(song => ({
          id: song.id,
          title: song.title,
          thumbnailUrl: song.thumbnail_url,
          channelTitle: song.channel_title,
          publishedAt: new Date().toISOString(),
        }));
        
        setRecommendations(recommendedSongs);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        toast({
          title: "Couldn't load recommendations",
          description: "We'll keep working on your personalized suggestions.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    getRecommendations();
  }, [userId]);
  
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
  
  if (recommendations.length === 0) {
    return null;
  }
  
  return (
    <div className="w-full mb-8 animate-fade-in">
      <div className="flex items-center mb-4">
        <Sparkles className="h-5 w-5 text-neon-purple mr-2" />
        <h2 className="text-xl font-semibold">Recommended for You</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {recommendations.slice(0, 5).map((song) => (
          <SongTile key={song.id} song={song} />
        ))}
      </div>
    </div>
  );
};

export default MusicRecommendations;
