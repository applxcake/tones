
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  Volume2, 
  Heart,
  VolumeX,
  Shuffle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { usePlayer } from '@/contexts/PlayerContext';

const EnhancedMiniPlayer = () => {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlayPause, 
    previousTrack, 
    nextTrack,
    volume,
    setVolume,
    loopMode,
    toggleLoop,
    progress,
    duration,
    seekToPosition,
    isLiked,
    toggleLike,
    shuffleMode,
    toggleShuffle
  } = usePlayer();
  
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);
  const [isLikedSong, setIsLikedSong] = useState(false);

  useEffect(() => {
    setCurrentTime((progress / 100) * duration);
  }, [progress, duration]);

  useEffect(() => {
    if (currentTrack) {
      setIsLikedSong(isLiked(currentTrack.id));
    }
  }, [currentTrack, isLiked]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handleLike = async () => {
    if (currentTrack) {
      const newLikedState = await toggleLike(currentTrack);
      setIsLikedSong(newLikedState);
    }
  };

  const handleProgressChange = ([value]: number[]) => {
    const newTime = (value / 100) * duration;
    setCurrentTime(newTime);
    seekToPosition(value);
  };

  if (!currentTrack) {
    return null;
  }

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-t border-white/10"
    >
      <div className="flex items-center justify-between px-4 py-3 max-w-screen-2xl mx-auto">
        {/* Track Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <motion.img
            src={currentTrack.thumbnailUrl}
            alt={currentTrack.title}
            className="w-12 h-12 rounded-lg object-cover"
            whileHover={{ scale: 1.05 }}
          />
          
          <div className="min-w-0 flex-1">
            <h4 className="text-white font-medium text-sm truncate max-w-[200px]">
              {currentTrack.title}
            </h4>
            <p className="text-gray-400 text-xs truncate">
              {currentTrack.channelTitle}
            </p>
          </div>

          <Button
            size="icon"
            variant="ghost"
            onClick={handleLike}
            className={cn(
              "w-8 h-8 text-gray-400 hover:text-white",
              isLikedSong && "text-red-500 hover:text-red-400"
            )}
          >
            <Heart className={cn("w-4 h-4", isLikedSong && "fill-current")} />
          </Button>
        </div>

        {/* Center Controls */}
        <div className="flex flex-col items-center gap-2 flex-1 max-w-md">
          <div className="flex items-center gap-4">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleShuffle}
              className={cn(
                "w-8 h-8 text-gray-400 hover:text-white",
                shuffleMode && "text-purple-400"
              )}
            >
              <Shuffle className="w-4 h-4" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={previousTrack}
              className="w-8 h-8 text-gray-400 hover:text-white"
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            <Button
              size="icon"
              onClick={togglePlayPause}
              className="w-10 h-10 bg-white hover:bg-gray-200 text-black rounded-full"
            >
              <AnimatePresence mode="wait">
                {isPlaying ? (
                  <motion.div
                    key="pause"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Pause className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="play"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Play className="w-5 h-5 ml-0.5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={nextTrack}
              className="w-8 h-8 text-gray-400 hover:text-white"
            >
              <SkipForward className="w-4 h-4" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              onClick={toggleLoop}
              className={cn(
                "w-8 h-8 text-gray-400 hover:text-white",
                loopMode !== 'none' && "text-purple-400"
              )}
            >
              <Repeat className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2 w-full">
            <span className="text-xs text-gray-400 min-w-[35px]">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[progress]}
              onValueChange={handleProgressChange}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-gray-400 min-w-[35px]">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleMute}
            className="w-8 h-8 text-gray-400 hover:text-white"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          <Slider
            value={[volume * 100]}
            onValueChange={([value]) => setVolume(value / 100)}
            max={100}
            className="w-24"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedMiniPlayer;
