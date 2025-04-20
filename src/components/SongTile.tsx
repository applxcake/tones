
import { useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from '@/components/ui/button';
import SongOptionsMenu from '@/components/SongOptionsMenu';
import { YouTubeVideo } from '@/services/youtubeService';

interface SongTileProps {
  song: YouTubeVideo;
  className?: string;
}

const SongTile = ({ song, className }: SongTileProps) => {
  const { currentTrack, isPlaying, playTrack, togglePlayPause } = usePlayer();
  const [isHovered, setIsHovered] = useState(false);
  
  const isCurrentTrack = currentTrack?.id === song.id;
  
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isCurrentTrack) {
      togglePlayPause();
    } else {
      playTrack(song);
    }
  };
  
  return (
    <div 
      className={cn(
        "glass-panel rounded-lg overflow-hidden relative hover-scale",
        className
      )} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-square relative">
        <img 
          src={song.thumbnailUrl} 
          alt={song.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div 
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-black/60 transition-opacity",
            (isHovered || isCurrentTrack) ? "opacity-100" : "opacity-0"
          )}
        >
          <Button 
            size="icon" 
            variant="secondary" 
            className="rounded-full bg-neon-purple/80 hover:bg-neon-purple text-white neon-glow-purple h-12 w-12"
            onClick={handlePlayClick}
          >
            {(isCurrentTrack && isPlaying) ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-1" />
            )}
          </Button>
        </div>
        
        {isHovered && (
          <div className="absolute top-2 right-2">
            <SongOptionsMenu song={song} />
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium truncate" title={song.title}>
          {song.title}
        </h3>
        <p className="text-sm text-gray-400 truncate" title={song.channelTitle}>
          {song.channelTitle}
        </p>
      </div>
    </div>
  );
};

export default SongTile;
