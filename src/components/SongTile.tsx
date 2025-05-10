
import { useState, useEffect } from 'react';
import { Play, Pause, Sparkle } from 'lucide-react';
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
  const [isClicked, setIsClicked] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  
  const isCurrentTrack = currentTrack?.id === song.id;
  
  // Click animation
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);
  };
  
  const handlePlayClick = (e: React.MouseEvent) => {
    handleClick(e);
    
    if (isCurrentTrack) {
      togglePlayPause();
    } else {
      playTrack(song);
    }
  };

  // Animation when component appears in view
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !hasAnimated) {
        setHasAnimated(true);
      }
    }, { threshold: 0.2 });
    
    const element = document.getElementById(`song-${song.id}`);
    if (element) observer.observe(element);
    
    return () => {
      if (element) observer.unobserve(element);
    };
  }, [song.id, hasAnimated]);
  
  return (
    <div 
      id={`song-${song.id}`}
      className={cn(
        "glass-panel rounded-lg overflow-hidden relative hover-scale animate-fade-in",
        className,
        isClicked && "scale-95",
        hasAnimated ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
        isCurrentTrack && "ring-2 ring-neon-purple ring-opacity-60"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      style={{
        transition: "all 0.3s ease-out, transform 0.15s ease-out",
      }}
    >
      <div className="aspect-square relative">
        <img 
          src={song.thumbnailUrl} 
          alt={song.title}
          className={cn(
            "w-full h-full object-cover transition-transform duration-700",
            isHovered && "scale-105"
          )}
          loading="lazy"
        />
        <div 
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-black/60 transition-all duration-300",
            (isHovered || isCurrentTrack) ? "opacity-100" : "opacity-0"
          )}
        >
          <Button 
            size="icon" 
            variant="secondary" 
            className={cn(
              "rounded-full bg-neon-purple/80 hover:bg-neon-purple text-white neon-glow-purple h-12 w-12 animate-scale-in transition-all duration-300",
              isClicked && "scale-90"
            )}
            onClick={handlePlayClick}
          >
            {(isCurrentTrack && isPlaying) ? (
              <Pause className="h-6 w-6 animate-pulse-soft" />
            ) : (
              <Play className="h-6 w-6 ml-1" />
            )}
            
            {/* Ripple effect on button click */}
            {isClicked && (
              <span className="absolute inset-0 bg-white/30 rounded-full animate-ripple"></span>
            )}
          </Button>
        </div>
        
        {/* Animated corner indicators for current track */}
        {isCurrentTrack && (
          <>
            <div className="absolute top-2 left-2 w-3 h-3 bg-neon-pink rounded-full animate-pulse"></div>
            <div className="absolute bottom-2 right-2 w-3 h-3 bg-neon-blue rounded-full animate-pulse" style={{ animationDelay: "0.5s" }}></div>
          </>
        )}
        
        <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
          <SongOptionsMenu song={song} />
        </div>
        
        {/* Animated sparkle effects on hover */}
        {isHovered && (
          <>
            <Sparkle 
              className="absolute top-1/4 left-1/4 text-neon-purple w-4 h-4 animate-float opacity-70" 
              style={{ animationDelay: "0.2s" }}
            />
            <Sparkle 
              className="absolute bottom-1/4 right-1/4 text-neon-pink w-3 h-3 animate-float opacity-70" 
              style={{ animationDelay: "0.5s" }}
            />
          </>
        )}
      </div>
      <div className={cn(
        "p-3 transition-all duration-300",
        isHovered && "bg-black/40"
      )}>
        <h3 className="font-medium truncate" title={song.title}>
          {song.title}
        </h3>
        <p className="text-sm text-gray-400 truncate" title={song.channelTitle}>
          {song.channelTitle}
        </p>
        
        {/* Animated progress indicator for current track */}
        {isCurrentTrack && (
          <div className="mt-1 h-0.5 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full w-full bg-gradient-to-r from-neon-purple to-neon-pink animate-progress"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SongTile;
