
import React, { useRef } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX, 
  Heart, ListPlus, AudioWaveform
} from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { usePlayer } from '@/contexts/PlayerContext';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

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
  
  // Show nothing if no track is selected
  if (!currentTrack) {
    return null;
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
    const now = Math.floor(Date.now() / 1000);
    const seed = now + (currentTrack?.id || '').charCodeAt(0);
    const randomHeights = Array.from({ length: 10 }, (_, i) => {
      // Use seed + index to create pseudo-random but deterministic heights
      const val = Math.sin(seed + i) * 0.5 + 0.5;
      return Math.max(3, val * 15);
    });
    
    return randomHeights;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-lg glass-panel border-t border-white/10 z-50 h-20 animate-slide-in">
      <div className="container mx-auto h-full flex items-center justify-between px-4">
        <div className="flex items-center gap-3 w-1/4 min-w-[200px] animate-fade-in">
          <div className="relative w-12 h-12 rounded overflow-hidden neon-border hover-scale">
            <img 
              src={currentTrack.thumbnailUrl} 
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="truncate">
            <h4 className="text-sm font-medium truncate">{currentTrack.title}</h4>
            <p className="text-xs text-gray-400 truncate">{currentTrack.channelTitle}</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center w-2/4 animate-fade-in">
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
              className="rounded-full bg-neon-purple/80 hover:bg-neon-purple text-white neon-glow-purple hover-scale"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
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
            <span className="text-xs text-gray-400">{formatTime(currentTime)}</span>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-neon-purple rounded-full absolute top-0 left-0"
                style={{ width: `${progress}%` }}
              />
              <div 
                className="absolute top-0 left-0 right-0 bottom-0 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Progress value={progress} className="h-2" />
              </div>
            </div>
            <span className="text-xs text-gray-400">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 w-1/4 justify-end animate-fade-in">
          <Button 
            size="icon" 
            variant="ghost" 
            className={cn(
              "text-gray-400 hover:text-white transition-all hover-scale", 
              isLiked(currentTrack.id) && "text-neon-pink neon-glow-pink"
            )}
            onClick={() => toggleLike(currentTrack)}
          >
            <Heart className={cn("h-5 w-5", isLiked(currentTrack.id) && "fill-neon-pink")} />
          </Button>
          
          <Button 
            size="icon" 
            variant="ghost" 
            className="text-gray-400 hover:text-white hover-scale"
            onClick={() => currentTrack && addToQueue(currentTrack)}
          >
            <ListPlus className="h-5 w-5" />
          </Button>

          <Button 
            size="icon" 
            variant="ghost" 
            className="text-gray-400 hover:text-white hover-scale"
          >
            <AudioWaveform className="h-5 w-5" />
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

      {/* Audio visualizer waves */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center h-0.5">
        <div className="flex items-end gap-0.5">
          {isPlaying && visualizerBars().map((height, i) => (
            <div
              key={i}
              className="w-0.5 bg-neon-purple rounded-full animate-wave"
              style={{
                height: `${height}px`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
