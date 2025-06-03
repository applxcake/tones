
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Heart, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePlayer } from '@/contexts/PlayerContext';
import { YouTubeVideo } from '@/services/youtubeService';

interface EnhancedSongTileProps {
  song: YouTubeVideo;
  className?: string;
  showFavoriteButton?: boolean;
  isFavorited?: boolean;
  onFavoriteChange?: (isFavorited: boolean) => void;
}

const EnhancedSongTile = ({ 
  song, 
  className, 
  showFavoriteButton = true, 
  isFavorited = false,
  onFavoriteChange 
}: EnhancedSongTileProps) => {
  const { currentTrack, isPlaying, playTrack, togglePlayPause } = usePlayer();
  const [imageLoaded, setImageLoaded] = useState(false);
  const isCurrentSong = currentTrack?.id === song.id;

  const handlePlayPause = () => {
    if (isCurrentSong && isPlaying) {
      togglePlayPause();
    } else {
      playTrack(song);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group bg-zinc-900/30 hover:bg-zinc-800/50 rounded-lg p-3 transition-all duration-300",
        "border border-zinc-800/30 hover:border-zinc-700/50 backdrop-blur-sm",
        className
      )}
    >
      {/* Image and Play Button */}
      <div className="relative aspect-square rounded-md overflow-hidden mb-3">
        <img
          src={song.thumbnailUrl}
          alt={song.title}
          className={cn(
            "w-full h-full object-cover transition-all duration-300",
            imageLoaded ? "opacity-100" : "opacity-0",
            "group-hover:scale-105"
          )}
          onLoad={() => setImageLoaded(true)}
        />
        
        {!imageLoaded && (
          <div className="absolute inset-0 bg-zinc-800 animate-pulse" />
        )}

        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "w-10 h-10 bg-white/90 hover:bg-white text-black rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300",
              isCurrentSong && isPlaying && "opacity-100"
            )}
            onClick={handlePlayPause}
          >
            {isCurrentSong && isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 ml-0.5" />
            )}
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {showFavoriteButton && (
            <Button
              size="icon"
              variant="ghost"
              className="w-6 h-6 bg-black/50 hover:bg-black/70 text-white"
              onClick={(e) => {
                e.stopPropagation();
                onFavoriteChange?.(!isFavorited);
              }}
            >
              <Heart className={cn("w-3 h-3", isFavorited && "fill-current text-red-500")} />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="w-6 h-6 bg-black/50 hover:bg-black/70 text-white"
          >
            <MoreHorizontal className="w-3 h-3" />
          </Button>
        </div>

        {/* Now Playing Indicator */}
        {isCurrentSong && isPlaying && (
          <div className="absolute bottom-2 left-2">
            <div className="flex items-center gap-1 bg-green-500/90 text-white px-2 py-1 rounded-full text-xs">
              <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
              Playing
            </div>
          </div>
        )}
      </div>

      {/* Song Info */}
      <div className="space-y-1">
        <h3 className="font-medium text-white text-sm line-clamp-2 group-hover:text-zinc-100 transition-colors">
          {song.title}
        </h3>
        <p className="text-zinc-400 text-xs line-clamp-1 group-hover:text-zinc-300 transition-colors">
          {song.channelTitle}
        </p>
      </div>
    </motion.div>
  );
};

export default EnhancedSongTile;
