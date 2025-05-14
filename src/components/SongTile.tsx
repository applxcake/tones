
import { useState, useEffect } from 'react';
import { Play, Pause, Sparkle, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from '@/components/ui/button';
import SongOptionsMenu from '@/components/SongOptionsMenu';
import { YouTubeVideo } from '@/services/youtubeService';
import { motion, AnimatePresence } from 'framer-motion';
import NeonBorder from './NeonBorder';
import PulseDot from './PulseDot';

interface SongTileProps {
  song: YouTubeVideo;
  className?: string;
}

const SongTile = ({ song, className }: SongTileProps) => {
  const { currentTrack, isPlaying, playTrack, togglePlayPause } = usePlayer();
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [showMusicNotes, setShowMusicNotes] = useState(false);
  
  const isCurrentTrack = currentTrack?.id === song.id;
  
  // Enhanced click animation
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsClicked(true);
    setShowMusicNotes(true);
    
    setTimeout(() => {
      setIsClicked(false);
      setTimeout(() => setShowMusicNotes(false), 1000);
    }, 300);
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
  
  // Music note explosion effect
  const MusicNotes = () => {
    if (!showMusicNotes) return null;
    
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-white"
            initial={{ 
              x: "50%", 
              y: "50%", 
              scale: 0.5,
              opacity: 0.8 
            }}
            animate={{ 
              x: `${50 + (Math.random() * 100 - 50)}%`,
              y: `${50 + (Math.random() * 100 - 50)}%`,
              scale: 0,
              opacity: 0
            }}
            transition={{ 
              duration: 0.8 + Math.random() * 0.5,
              ease: "easeOut"
            }}
          >
            <Music size={16} />
          </motion.div>
        ))}
      </div>
    );
  };
  
  return (
    <motion.div 
      id={`song-${song.id}`}
      className={cn(
        "overflow-hidden relative hover-scale animate-fade-in rounded-lg",
        className,
        isClicked && "scale-95",
        "hover:transform hover:perspective-600 hover:rotate-y-2 hover:shadow-xl",
        "transition-all duration-300"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      style={{
        transition: "all 0.3s ease-out, transform 0.15s ease-out",
        transformStyle: "preserve-3d", // Enable 3D space for the element
      }}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ 
        opacity: hasAnimated ? 1 : 0,
        y: hasAnimated ? 0 : 20,
        scale: hasAnimated ? 1 : 0.95 
      }}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <NeonBorder 
        active={isCurrentTrack} 
        color={isCurrentTrack ? "rainbow" : "purple"}
        className="glass-panel overflow-hidden"
        pulsate={isCurrentTrack && isPlaying}
      >
        <div className="aspect-square relative">
          <img 
            src={song.thumbnailUrl} 
            alt={song.title}
            className={cn(
              "w-full h-full object-cover transition-transform duration-700",
              isHovered && "scale-105 filter brightness-110"
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
                isClicked && "scale-90",
                "group relative overflow-hidden" // Add group for hover effects
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
          
          {/* Music notes explosion effect */}
          <MusicNotes />
          
          {/* Animated corner indicators for current track */}
          <AnimatePresence>
            {isCurrentTrack && (
              <>
                <motion.div 
                  className="absolute top-2 left-2"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <PulseDot color="pink" />
                </motion.div>
                <motion.div 
                  className="absolute bottom-2 right-2"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <PulseDot color="blue" />
                </motion.div>
              </>
            )}
          </AnimatePresence>
          
          <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
            <SongOptionsMenu song={song} />
          </div>
          
          {/* Enhanced sparkle effects on hover */}
          <AnimatePresence>
            {isHovered && (
              <>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 0.7, scale: 1, rotate: [0, 180] }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute top-1/4 left-1/4"
                >
                  <Sparkle className="text-neon-purple w-4 h-4" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 0.7, scale: 1, rotate: [0, -180] }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="absolute bottom-1/4 right-1/4"
                >
                  <Sparkle className="text-neon-pink w-3 h-3" />
                </motion.div>
              </>
            )}
          </AnimatePresence>
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
              <motion.div 
                className="h-full bg-gradient-to-r from-neon-purple to-neon-pink relative"
                initial={{ width: "0%" }}
                animate={{ 
                  width: "100%",
                  transition: { 
                    duration: 30, 
                    ease: "linear", 
                    repeat: Infinity 
                  }
                }}
              >
                {/* Pulsing effect on progress bar */}
                <div className="absolute inset-0 animate-pulse-progress bg-white opacity-50"></div>
              </motion.div>
            </div>
          )}
        </div>
      </NeonBorder>
    </motion.div>
  );
};

export default SongTile;
