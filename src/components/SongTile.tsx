
import { useState } from 'react';
import { Play, Pause, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { YouTubeVideo } from '@/services/youtubeService';
import { usePlayer } from '@/contexts/PlayerContext';

interface SongTileProps {
  song: YouTubeVideo;
  className?: string;
}

const SongTile = ({ song, className }: SongTileProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { playTrack, currentTrack, isPlaying, togglePlayPause, addToQueue } = usePlayer();
  
  const isCurrentTrack = currentTrack?.id === song.id;
  
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentTrack) {
      togglePlayPause();
    } else {
      playTrack(song);
    }
  };
  
  const handleAddToQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToQueue(song);
  };

  return (
    <div 
      className={cn(
        "relative group rounded-lg overflow-hidden hover-scale bg-gray-900/50 glass-panel",
        isCurrentTrack && "neon-border",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePlayClick}
    >
      <div className="aspect-square relative overflow-hidden">
        <img 
          src={song.thumbnailUrl} 
          alt={song.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Play button */}
        <button
          className={cn(
            "absolute bottom-3 right-3 rounded-full p-2.5 transition-all duration-300",
            "bg-neon-purple text-white shadow-lg neon-glow-purple",
            "opacity-0 group-hover:opacity-100 hover:scale-105",
            isCurrentTrack && isPlaying && "opacity-100"
          )}
          onClick={handlePlayClick}
        >
          {isCurrentTrack && isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5" />
          )}
        </button>
        
        {/* Add to playlist button */}
        <button
          className="absolute top-3 right-3 rounded-full p-1.5 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          onClick={handleAddToQueue}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      
      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-1">{song.title}</h3>
        <p className="text-xs text-gray-400">{song.channelTitle}</p>
      </div>
      
      {/* Playing indicator */}
      {isCurrentTrack && (
        <div className="absolute top-2 left-2 flex gap-0.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div 
              key={i}
              className={cn(
                "w-0.5 h-2 bg-neon-purple rounded-full",
                isPlaying ? "animate-wave" : ""
              )}
              style={{
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SongTile;
