
import React, { useState } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX, 
  Heart, ListPlus
} from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { usePlayer } from '@/contexts/PlayerContext';
import { cn } from '@/lib/utils';

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
    addToQueue
  } = usePlayer();
  
  const [liked, setLiked] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
  };

  // Show nothing if no track is selected
  if (!currentTrack) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-lg glass-panel border-t border-white/10 z-50 h-20">
      <div className="container mx-auto h-full flex items-center justify-between px-4">
        <div className="flex items-center gap-3 w-1/4 min-w-[200px]">
          <div className="relative w-12 h-12 rounded overflow-hidden neon-border">
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

        <div className="flex flex-col items-center justify-center w-2/4">
          <div className="flex items-center gap-4">
            <Button 
              size="icon" 
              variant="ghost" 
              className="text-gray-400 hover:text-white"
              onClick={prevTrack}
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            
            <Button 
              size="icon" 
              variant="secondary"
              onClick={togglePlayPause}
              className="rounded-full bg-neon-purple/80 hover:bg-neon-purple text-white neon-glow-purple"
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
              className="text-gray-400 hover:text-white"
              onClick={nextTrack}
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          <div className="w-full max-w-md mt-1 px-4 flex items-center gap-2">
            <span className="text-xs text-gray-400">0:00</span>
            <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-neon-purple rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-gray-400">3:45</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 w-1/4 justify-end">
          <Button 
            size="icon" 
            variant="ghost" 
            className={cn(
              "text-gray-400 hover:text-white transition-all", 
              liked && "text-neon-pink neon-glow-pink"
            )}
            onClick={handleLike}
          >
            <Heart className={cn("h-5 w-5", liked && "fill-neon-pink")} />
          </Button>
          
          <Button 
            size="icon" 
            variant="ghost" 
            className="text-gray-400 hover:text-white"
            onClick={() => currentTrack && addToQueue(currentTrack)}
          >
            <ListPlus className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Button 
              size="icon" 
              variant="ghost" 
              className="text-gray-400 hover:text-white"
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
          {isPlaying && Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="w-0.5 bg-neon-purple rounded-full animate-wave"
              style={{
                height: `${Math.max(3, Math.random() * 15)}px`,
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
