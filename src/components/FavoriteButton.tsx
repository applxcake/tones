
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addToFavorites, removeFromFavorites } from '@/services/favoritesService';
import { YouTubeVideo } from '@/services/youtubeService';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

interface FavoriteButtonProps {
  song: YouTubeVideo;
  isFavorited?: boolean;
  onFavoriteChange?: (isFavorited: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
}

const FavoriteButton = ({ song, isFavorited = false, onFavoriteChange, size = 'md' }: FavoriteButtonProps) => {
  const [favorited, setFavorited] = useState(isFavorited);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setFavorited(isFavorited);
  }, [isFavorited]);

  const handleToggleFavorite = async () => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      if (favorited) {
        const success = await removeFromFavorites(song.id, user?.id);
        if (success) {
          setFavorited(false);
          onFavoriteChange?.(false);
        }
      } else {
        const success = await addToFavorites(song, user?.id);
        if (success) {
          setFavorited(true);
          onFavoriteChange?.(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20
  };

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <Button
        variant="ghost"
        size="icon"
        className={`${sizeClasses[size]} ${favorited ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'} transition-colors`}
        onClick={handleToggleFavorite}
        disabled={loading}
      >
        <motion.div
          animate={{ 
            scale: favorited ? [1, 1.3, 1] : 1,
            rotate: favorited ? [0, 10, -10, 0] : 0
          }}
          transition={{ duration: 0.3 }}
        >
          <Heart 
            size={iconSizes[size]} 
            fill={favorited ? 'currentColor' : 'none'}
            className={loading ? 'animate-pulse' : ''}
          />
        </motion.div>
      </Button>
    </motion.div>
  );
};

export default FavoriteButton;
