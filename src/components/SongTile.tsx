
import { useState } from 'react';
import { Play, Pause, Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FavoriteButton from '@/components/FavoriteButton';
import { cn } from '@/lib/utils';
import { usePlayer } from '@/contexts/PlayerContext';
import { YouTubeVideo } from '@/services/youtubeService';
import { motion } from 'framer-motion';
import { downloadSong, isDownloaded } from '@/services/downloadService';

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
  const { currentTrack, isPlaying, playTrack, togglePlayPause, isCurrentSong, addToQueue } = usePlayer();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const isCurrentlyPlaying = isCurrentSong(song.id);
  const songIsDownloaded = isDownloaded(song.id);

  const handlePlayPause = () => {
    if (isCurrentlyPlaying && isPlaying) {
      togglePlayPause();
    } else {
      playTrack(song);
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDownloading(true);
    await downloadSong(song);
    setIsDownloading(false);
  };

  const handleAddToQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToQueue(song);
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative bg-card rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300",
        "border border-border/50 hover:border-primary/30",
        isCurrentlyPlaying && "ring-2 ring-green-500 border-green-500/50 shadow-green-500/20",
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
            "group-hover:scale-105",
            isCurrentlyPlaying && isPlaying && "animate-pulse"
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
              isCurrentlyPlaying && "opacity-100 scale-100 bg-green-500 hover:bg-green-600 text-white"
            )}
            onClick={handlePlayPause}
          >
            {isCurrentlyPlaying && isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </Button>
        </div>

        {/* Action Buttons Overlay */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            disabled={isDownloading || songIsDownloaded}
            className="h-6 w-6 bg-black/50 hover:bg-black/70 text-white"
          >
            <Download size={12} className={cn(songIsDownloaded && "text-green-500")} />
          </Button>
          
          {showFavoriteButton && (
            <FavoriteButton 
              song={song} 
              size="sm" 
              isFavorited={isFavorited}
              onFavoriteChange={onFavoriteChange}
            />
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleAddToQueue}
            className="h-6 w-6 bg-black/50 hover:bg-black/70 text-white"
          >
            <Plus size={12} />
          </Button>
        </div>

        {/* Downloaded Badge */}
        {songIsDownloaded && (
          <div className="absolute bottom-2 left-2">
            <div className="bg-green-500/90 text-white px-2 py-1 rounded-full text-xs">
              Downloaded
            </div>
          </div>
        )}

        {/* Now Playing Indicator */}
        {isCurrentlyPlaying && (
          <div className="absolute bottom-2 right-2">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 bg-green-500/90 text-white px-2 py-1 rounded-full text-xs"
            >
              <motion.div 
                className="w-2 h-2 bg-current rounded-full"
                animate={isPlaying ? { scale: [1, 1.5, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
              {isPlaying ? 'Playing' : 'Paused'}
            </motion.div>
          </div>
        )}
      </div>

      {/* Song Info */}
      <div className="p-3">
        <h3 className={cn(
          "font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors",
          isCurrentlyPlaying && "text-green-500"
        )}>
          {song.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-1">
          {song.channelTitle}
        </p>
      </div>

      {/* Hover Glow Effect */}
      <div className={cn(
        "absolute inset-0 rounded-lg bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
        isCurrentlyPlaying && "from-green-500/0 via-green-500/10 to-green-500/0 opacity-50"
      )} />
    </motion.div>
  );
};

export default SongTile;
