
import React, { useRef, useEffect, useState } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX, 
  Heart, ListPlus, AudioWaveform, Sparkle
} from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { usePlayer } from '@/contexts/PlayerContext';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

// Add a container for the invisible YouTube player
const YouTubePlayerContainer = () => {
  return <div id="youtube-player-container"></div>;
};

const MusicPlayer = () => {
  const { 
    currentTrack, 
    isPlaying, 
    progress, 
    volume, 
    togglePlayPause, 
    nextTrack, 
    prevTrack,
    setVolume,
    addToQueue,
    toggleLike,
    isLiked,
    seekToPosition,
    duration
  } = usePlayer();
  
  const progressBarRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [showVisualizer, setShowVisualizer] = useState(false);
  
  // Show nothing if no track is selected
  if (!currentTrack) {
    return <YouTubePlayerContainer />;
  }
  
  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  // Calculate current time based on progress percentage
  const currentTime = progress * duration / 100;

  // Handle progress bar clicks for seeking
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickPosition = (e.clientX - rect.left) / rect.width;
      const newProgress = clickPosition * 100;
      seekToPosition(newProgress);
    }
  };

  // Generate visualizer bars based on isPlaying
  const visualizerBars = () => {
    if (!isPlaying) return Array(10).fill(0);
    
    // Generate random heights that change every second
    const now = Math.floor(Date.now() / 200); // More frequent updates
    const seed = now + (currentTrack?.id || '').charCodeAt(0);
    const randomHeights = Array.from({ length: 15 }, (_, i) => { // More bars
      // Use seed + index to create pseudo-random but deterministic heights
      const val = Math.sin(seed + i) * 0.5 + 0.5;
      return Math.max(3, val * 20); // Taller max height
    });
    
    return randomHeights;
  };

  // Toggle audio visualizer
  const toggleVisualizer = () => {
    setShowVisualizer(prev => !prev);
    toast({
      title: showVisualizer ? "Visualizer disabled" : "Audio visualizer enabled",
      description: showVisualizer ? 
        "Standard wave visualizer mode" : 
        "Enhanced audio visualization active",
      variant: "default",
    });
  };

  return (
    <>
      <YouTubePlayerContainer />
      <div className="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-lg glass-panel border-t border-white/10 z-50 h-20 animate-slide-in">
        {/* Animated background gradient */}
        <div className="absolute inset-0 opacity-30 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/30 via-neon-pink/20 to-neon-blue/30 animate-pulse-soft"></div>
          {/* Animated circles */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-20"
              style={{
                width: `${Math.random() * 80 + 50}px`,
                height: `${Math.random() * 80 + 50}px`,
                left: `${i * 33}%`,
                top: `${Math.random() * 100}%`,
                background: `radial-gradient(circle, 
                  ${i === 0 ? '#9b87f5' : i === 1 ? '#D946EF' : '#0EA5E9'} 0%, 
                  rgba(0,0,0,0) 70%)`,
                transform: `scale(${Math.random() * 0.5 + 0.5})`,
                animation: `float ${Math.random() * 5 + 3}s ease-in-out infinite`,
                animationDelay: `${i * 0.5}s`
              }}
            />
          ))}
        </div>

        <div className="container mx-auto h-full flex items-center justify-between px-4 relative z-10">
          <div className="flex items-center gap-3 w-1/4 min-w-[200px] animate-fade-in">
            <div className="relative w-12 h-12 rounded overflow-hidden neon-border hover-scale group">
              <img 
                src={currentTrack.thumbnailUrl} 
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent animate-pulse"></div>
              {/* Sparkle effect on hover */}
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Sparkle size={12} className="text-white animate-pulse" />
              </div>
            </div>
            <div className="truncate">
              <h4 className="text-sm font-medium truncate animate-fade-in" style={{animationDelay: '0.1s'}}>{currentTrack.title}</h4>
              <p className="text-xs text-gray-400 truncate animate-fade-in" style={{animationDelay: '0.2s'}}>{currentTrack.channelTitle}</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center w-2/4 animate-fade-in" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center gap-4">
              <Button 
                size="icon" 
                variant="ghost" 
                className="text-gray-400 hover:text-white hover-scale"
                onClick={prevTrack}
              >
                <SkipBack className="h-5 w-5" />
              </Button>
              
              <Button 
                size="icon" 
                variant="secondary"
                onClick={togglePlayPause}
                className="rounded-full bg-neon-purple/80 hover:bg-neon-purple text-white neon-glow-purple hover-scale transform transition-all hover:scale-110"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 animate-pulse" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" />
                )}
              </Button>
              
              <Button 
                size="icon" 
                variant="ghost" 
                className="text-gray-400 hover:text-white hover-scale"
                onClick={nextTrack}
              >
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>

            <div 
              className="w-full max-w-md mt-1 px-4 flex items-center gap-2 cursor-pointer"
              ref={progressBarRef}
              onClick={handleProgressClick}
            >
              <span className="text-xs text-gray-400 animate-fade-in" style={{animationDelay: '0.3s'}}>{formatTime(currentTime)}</span>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden relative">
                {/* Pulsing glow under progress bar */}
                <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/20 via-neon-pink/20 to-neon-purple/20 animate-pulse"></div>
                <div 
                  className="h-full bg-gradient-to-r from-neon-purple to-neon-pink rounded-full absolute top-0 left-0 transition-all duration-300 ease-in-out"
                  style={{ width: `${progress}%` }}
                />
                <div 
                  className="absolute top-0 left-0 right-0 bottom-0 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Progress value={progress} className="h-2" />
                </div>
                <div 
                  className="absolute top-1/2 transform -translate-y-1/2 bg-white rounded-full w-3 h-3 shadow-glow transition-all duration-300 ease-in-out"
                  style={{ left: `${progress}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-400 animate-fade-in" style={{animationDelay: '0.4s'}}>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 w-1/4 justify-end animate-fade-in" style={{animationDelay: '0.2s'}}>
            <Button 
              size="icon" 
              variant="ghost" 
              className={cn(
                "text-gray-400 hover:text-white transition-all hover-scale", 
                isLiked(currentTrack.id) && "text-neon-pink neon-glow-pink"
              )}
              onClick={() => toggleLike(currentTrack)}
            >
              <Heart 
                className={cn(
                  "h-5 w-5 transform transition-transform duration-300", 
                  isLiked(currentTrack.id) ? "fill-neon-pink scale-110" : "scale-100"
                )}
              />
            </Button>
            
            <Button 
              size="icon" 
              variant="ghost" 
              className="text-gray-400 hover:text-white hover-scale"
              onClick={() => {
                addToQueue(currentTrack);
                toast({
                  title: "Added to queue",
                  description: `${currentTrack.title} has been added to your queue`,
                  variant: "default",
                });
              }}
            >
              <ListPlus className="h-5 w-5" />
            </Button>

            <Button 
              size="icon" 
              variant="ghost" 
              className={cn(
                "text-gray-400 hover:text-white hover-scale transition-all",
                showVisualizer && "text-neon-blue neon-glow-blue"
              )}
              onClick={toggleVisualizer}
            >
              <AudioWaveform className={cn(
                "h-5 w-5", 
                showVisualizer && "animate-pulse"
              )} />
            </Button>
            
            <div className="flex items-center gap-2">
              <Button 
                size="icon" 
                variant="ghost" 
                className="text-gray-400 hover:text-white hover-scale"
                onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
              >
                {volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : volume < 0.5 ? (
                  <Volume1 className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              
              <div className="w-20">
                <Slider
                  value={[volume * 100]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(values) => setVolume(values[0] / 100)}
                  className="h-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced audio visualizer waves with conditional rendering based on showVisualizer */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center h-0.5">
          <div className="flex items-end gap-[2px]">
            {visualizerBars().map((height, i) => (
              <div
                key={i}
                className={`w-[2px] rounded-full animate-wave transition-all duration-150 ease-in-out`}
                style={{
                  height: `${isPlaying ? height : 1}px`,
                  animationDelay: `${i * 0.05}s`,
                  backgroundColor: showVisualizer 
                    ? (i % 5 === 0 ? '#9b87f5' : 
                       i % 3 === 0 ? '#D946EF' : 
                       i % 2 === 0 ? '#0EA5E9' : '#9370DB')
                    : (i % 3 === 0 ? '#8A2BE2' : i % 2 === 0 ? '#6A5ACD' : '#9370DB'),
                  boxShadow: isPlaying 
                    ? (showVisualizer 
                        ? `0 0 8px ${i % 5 === 0 ? 'rgba(155, 135, 245, 0.8)' : 
                           i % 3 === 0 ? 'rgba(217, 70, 239, 0.8)' : 'rgba(14, 165, 233, 0.8)'}`
                        : '0 0 5px rgba(138, 43, 226, 0.7)')
                    : 'none'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default MusicPlayer;
