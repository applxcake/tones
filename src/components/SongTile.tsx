
import { useState } from 'react';
import { Play, Pause, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FavoriteButton from '@/components/FavoriteButton';
import SocialShareButton from '@/components/SocialShareButton';
import SongOptionsMenu from '@/components/SongOptionsMenu';
import { cn } from '@/lib/utils';
import { usePlayer } from '@/contexts/PlayerContext';
import { YouTubeVideo } from '@/services/youtubeService';
import { motion } from 'framer-motion';

interface SongTileProps {
  song: YouTubeVideo;
  className?: string;
  showFavoriteButton?: boolean;
  isFavorited?: boolean;
  onFavoriteChange?: (isFavorited: boolean) => void;
}

const SongTile = ({ 
  song, 
  className, 
  showFavoriteButton = true, 
  isFavorited = false,
  onFavoriteChange 
}: SongTileProps) => {
  const { currentSong, isPlaying, playSong, pauseSong } = usePlayer();
  const [imageLoaded, setImageLoaded] = useState(false);
  const isCurrentSong = currentSong?.id === song.id;

  const handlePlayPause = () => {
    if (isCurrentSong && isPlaying) {
      pauseSong();
    } else {
      playSong(song);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative bg-card rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300",
        "border border-border/50 hover:border-primary/30",
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-square bg-muted">
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
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/20 animate-pulse" />
        )}

        {/* Play/Pause Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
          <Button
            size="icon"
            variant="secondary"
            className={cn(
              "opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100",
              "bg-white/90 hover:bg-white text-black shadow-lg",
              isCurrentSong && isPlaying && "opacity-100 scale-100"
            )}
            onClick={handlePlayPause}
          >
            {isCurrentSong && isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </Button>
        </div>

        {/* Action Buttons Overlay */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {showFavoriteButton && (
            <FavoriteButton 
              song={song} 
              size="sm" 
              isFavorited={isFavorited}
              onFavoriteChange={onFavoriteChange}
            />
          )}
          <SocialShareButton song={song} />
          <SongOptionsMenu song={song}>
            <Button variant="ghost" size="icon" className="h-6 w-6 bg-black/50 hover:bg-black/70">
              <MoreVertical size={12} className="text-white" />
            </Button>
          </SongOptionsMenu>
        </div>

        {/* Now Playing Indicator */}
        {isCurrentSong && (
          <div className="absolute bottom-2 left-2">
            <div className="flex items-center gap-1 bg-primary/90 text-primary-foreground px-2 py-1 rounded-full text-xs">
              <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
              Now Playing
            </div>
          </div>
        )}
      </div>

      {/* Song Info */}
      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
          {song.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-1">
          {song.channelTitle}
        </p>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );
};

export default SongTile;
