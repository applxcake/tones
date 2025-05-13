
import { useState, useEffect } from 'react';
import { Maximize2, Minimize2, Play, Pause, SkipForward, SkipBack, Volume, VolumeX } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import VisualVolumePeaks from './VisualVolumePeaks';

interface MiniPlayerProps {
  className?: string;
}

const MiniPlayer = ({ className }: MiniPlayerProps) => {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlayPause,
    progress,
    volume,
    setVolume,
    nextTrack,
    prevTrack,
    duration
  } = usePlayer();
  
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showVolumeControl, setShowVolumeControl] = useState(false);

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

  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Calculate current time based on progress percentage
  const currentTime = progress * duration / 100;

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
          className="w-full h-full flex items-center justify-center cursor-pointer relative overflow-hidden"
          onClick={() => setExpanded(true)}
        >
          {/* Background album art blur */}
          <div className="absolute inset-0 z-0 blur-sm opacity-30">
            <img 
              src={currentTrack.thumbnailUrl} 
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="relative w-12 h-12 rounded-full overflow-hidden z-10">
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
          
          {/* Thin progress bar at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-1">
            <div 
              className="h-full bg-neon-purple"
              style={{ width: `${progress}%` }}
            ></div>
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
          
          <div className="flex flex-col gap-4">
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
              </div>
            </div>
            
            {/* Progress bar with time indicators */}
            <div className="space-y-1">
              <div className="relative w-full h-1 bg-gray-700 rounded-full overflow-hidden group">
                <div 
                  className="absolute inset-y-0 left-0 bg-neon-purple rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
                
                {/* Clickable progress bar overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100">
                  <Progress value={progress} className="h-2" />
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 rounded-full"
                  onClick={prevTrack}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                
                <Button 
                  size="icon" 
                  variant="secondary"
                  className="h-8 w-8 rounded-full bg-neon-purple/80 hover:bg-neon-purple text-white"
                  onClick={togglePlayPause}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4 ml-0.5" />
                  )}
                </Button>
                
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 rounded-full"
                  onClick={nextTrack}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="relative">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setShowVolumeControl(!showVolumeControl)}
                >
                  {volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume className="h-4 w-4" />
                  )}
                </Button>
                
                {/* Volume slider popover */}
                {showVolumeControl && (
                  <div className="absolute bottom-full right-0 mb-2 p-3 rounded-lg glass-panel shadow-lg">
                    <div className="h-24 flex flex-col items-center gap-2">
                      <Slider
                        orientation="vertical"
                        value={[volume * 100]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(values) => setVolume(values[0] / 100)}
                        className="h-full"
                      />
                      
                      <span className="text-xs">{Math.round(volume * 100)}%</span>
                    </div>
                  </div>
                )}
                
                {/* Volume visualizer */}
                {isPlaying && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-2 h-2 bg-neon-purple rounded-full animate-ping-slow"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiniPlayer;
