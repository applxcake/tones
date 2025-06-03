
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SongTile from '@/components/SongTile';
import { YouTubeVideo } from '@/services/youtubeService';
import { getUserFavorites } from '@/services/favoritesService';
import { searchYouTubeVideos } from '@/services/youtubeService';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, RefreshCw, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface RecommendationEngineProps {
  className?: string;
}

const RecommendationEngine = ({ className }: RecommendationEngineProps) => {
  const [recommendations, setRecommendations] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [recommendationType, setRecommendationType] = useState<'favorites' | 'trending' | 'discovery'>('favorites');
  const { user } = useAuth();

  const generateRecommendations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let newRecommendations: YouTubeVideo[] = [];

      switch (recommendationType) {
        case 'favorites':
          const favorites = await getUserFavorites(user.id);
          if (favorites.length > 0) {
            // Use favorite artists/channels to find similar content
            const randomFavorite = favorites[Math.floor(Math.random() * favorites.length)];
            const similar = await searchYouTubeVideos(`${randomFavorite.channelTitle} similar music`);
            newRecommendations = similar.slice(0, 6);
          } else {
            newRecommendations = await searchYouTubeVideos('popular music 2024');
          }
          break;
          
        case 'trending':
          newRecommendations = await searchYouTubeVideos('trending music this week');
          break;
          
        case 'discovery':
          const genres = ['indie', 'alternative', 'underground', 'emerging artists'];
          const randomGenre = genres[Math.floor(Math.random() * genres.length)];
          newRecommendations = await searchYouTubeVideos(`${randomGenre} music discovery`);
          break;
      }

      setRecommendations(newRecommendations.slice(0, 8));
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      generateRecommendations();
    }
  }, [user, recommendationType]);

  const recommendationTypes = [
    { key: 'favorites', label: 'Based on Favorites', icon: Sparkles },
    { key: 'trending', label: 'Trending Now', icon: TrendingUp },
    { key: 'discovery', label: 'Discover New', icon: RefreshCw },
  ];

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Sign in to get personalized recommendations</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-neon-purple" />
            Recommendations
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={generateRecommendations}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {recommendationTypes.map(({ key, label, icon: Icon }) => (
            <Badge
              key={key}
              variant={recommendationType === key ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setRecommendationType(key as any)}
            >
              <Icon className="h-3 w-3 mr-1" />
              {label}
            </Badge>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 rounded-lg aspect-square mb-2" />
                <div className="h-4 bg-gray-300 rounded mb-1" />
                <div className="h-3 bg-gray-300 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommendations.map((song, index) => (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <SongTile song={song} className="h-full" />
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendationEngine;
