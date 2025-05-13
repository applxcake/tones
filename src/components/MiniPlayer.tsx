
import { useState, useEffect } from 'react';
import { Maximize2, Minimize2, Play, Pause } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MiniPlayerProps {
  className?: string;
}

const MiniPlayer = ({ className }: MiniPlayerProps) => {
  const { currentTrack, isPlaying, togglePlayPause } = usePlayer();
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(false);

  // Only show mini player when we're scrolled away from the main player
  useEffect(() => {
    const handleScroll = () => {
      // Show mini player when scrolled more than 300px from the bottom
      const isScrolledFromBottom = window.innerHeight + window.scrollY < document.body.scrollHeight - 300;
      setVisible(isScrolledFromBottom && !!currentTrack);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [currentTrack]);

  // Don't render if no track is playing or mini player isn't visible
  if (!currentTrack || !visible) return null;

  return (
    <div 
      className={cn(
        "fixed bottom-24 right-4 z-40 transition-all duration-300 glass-panel rounded-lg shadow-lg",
        expanded ? "w-80 h-auto" : "w-16 h-16",
        !visible && "translate-y-20 opacity-0",
        visible && "translate-y-0 opacity-100",
        className
      )}
    >
      {/* Mini collapsed view */}
      {!expanded && (
        <div 
          className="w-full h-full flex items-center justify-center cursor-pointer"
          onClick={() => setExpanded(true)}
        >
          <div className="relative w-12 h-12 rounded-full overflow-hidden">
            <img 
              src={currentTrack.thumbnailUrl} 
              alt={currentTrack.title}
              className="w-full h-full object-cover animate-spin-slow"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/30 transition-colors">
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white ml-1" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Expanded view */}
      {expanded && (
        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium truncate">Now Playing</h4>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-6 w-6" 
              onClick={() => setExpanded(false)}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-3">
            <div className="w-14 h-14 rounded overflow-hidden">
              <img 
                src={currentTrack.thumbnailUrl} 
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate" title={currentTrack.title}>
                {currentTrack.title}
              </h3>
              <p className="text-xs text-gray-400 truncate" title={currentTrack.channelTitle}>
                {currentTrack.channelTitle}
              </p>
              
              <div className="flex items-center gap-3 mt-3">
                <Button 
                  size="icon" 
                  variant="secondary"
                  className="rounded-full h-8 w-8 bg-neon-purple/80 hover:bg-neon-purple text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlayPause();
                  }}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4 ml-0.5" />
                  )}
                </Button>
                
                <div className="flex-1 bg-gray-700 h-1 rounded-full overflow-hidden">
                  <div className="bg-neon-purple h-full animate-progress"></div>
                </div>
                
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8" 
                  onClick={() => setExpanded(true)}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiniPlayer;
