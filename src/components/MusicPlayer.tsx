
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Volume2, 
  Heart,
  List,
  VolumeX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { usePlayer } from '@/contexts/PlayerContext';

const MusicPlayer = () => {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlayPause, 
    previousTrack, 
    nextTrack,
    volume,
    setVolume,
    shuffleMode,
    toggleShuffle,
    loopMode,
    toggleLoop,
    progress,
    duration,
    seekToPosition
  } = usePlayer();
  
  const [currentTime, setCurrentTime] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);

  // Update current time based on progress
  useEffect(() => {
    setCurrentTime((progress / 100) * duration);
  }, [progress, duration]);

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle volume mute/unmute
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

  // Handle like toggle
  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  // Handle progress bar changes
  const handleProgressChange = ([value]: number[]) => {
    seekToPosition(value);
  };

  if (!currentTrack) {
    return null;
  }

  return (
    <>
      {/* Music Player Bar */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800/50"
      >
        <div className="flex items-center justify-between px-4 py-3 max-w-screen-2xl mx-auto">
          {/* Left Section - Track Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative">
              <motion.img
                src={currentTrack.thumbnailUrl}
                alt={currentTrack.title}
                className={cn(
                  "w-14 h-14 rounded-lg object-cover",
                  isPlaying && "animate-pulse-soft"
                )}
                animate={isPlaying ? { rotate: 360 } : {}}
                transition={{ 
                  duration: 30, 
                  repeat: isPlaying ? Infinity : 0, 
                  ease: "linear" 
                }}
              />
              {isPlaying && (
                <motion.div 
                  className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div 
                    className="w-2 h-2 bg-green-500 rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                </motion.div>
              )}
            </div>
            
            <div className="min-w-0 flex-1">
              <h4 className="text-white font-medium text-sm truncate max-w-[200px]">
                {currentTrack.title}
              </h4>
              <p className="text-zinc-400 text-xs truncate">
                {currentTrack.channelTitle}
              </p>
            </div>

            <Button
              size="icon"
              variant="ghost"
              onClick={toggleLike}
              className={cn(
                "w-8 h-8 text-zinc-400 hover:text-white transition-colors",
                isLiked && "text-red-500 hover:text-red-400"
              )}
            >
              <motion.div
                whileTap={{ scale: 1.3 }}
                transition={{ duration: 0.1 }}
              >
                <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
              </motion.div>
            </Button>
          </div>

          {/* Center Section - Controls */}
          <div className="flex flex-col items-center gap-2 flex-1 max-w-md">
            {/* Main Controls */}
            <div className="flex items-center gap-4">
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleShuffle}
                className={cn(
                  "w-8 h-8 text-zinc-400 hover:text-white transition-colors",
                  shuffleMode && "text-green-500"
                )}
              >
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Shuffle className="w-4 h-4" />
                </motion.div>
              </Button>

              <Button
                size="icon"
                variant="ghost"
                onClick={previousTrack}
                className="w-8 h-8 text-zinc-400 hover:text-white transition-colors"
              >
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <SkipBack className="w-4 h-4" />
                </motion.div>
              </Button>

              <Button
                size="icon"
                onClick={togglePlayPause}
                className="w-10 h-10 bg-white hover:bg-white/90 text-black rounded-full transition-all duration-200 hover:scale-105"
              >
                <AnimatePresence mode="wait">
                  {isPlaying ? (
                    <motion.div
                      key="pause"
                      initial={{ scale: 0, rotate: 180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: -180 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Pause className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="play"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ duration: 0.2 }}
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
                className="w-8 h-8 text-zinc-400 hover:text-white transition-colors"
              >
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <SkipForward className="w-4 h-4" />
                </motion.div>
              </Button>

              <Button
                size="icon"
                variant="ghost"
                onClick={toggleLoop}
                className={cn(
                  "w-8 h-8 text-zinc-400 hover:text-white transition-colors",
                  loopMode !== 'none' && "text-green-500"
                )}
              >
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Repeat className="w-4 h-4" />
                </motion.div>
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-2 w-full">
              <span className="text-xs text-zinc-400 min-w-[35px]">
                {formatTime(currentTime)}
              </span>
              
              <div className="flex-1 group">
                <Slider
                  value={[progress]}
                  onValueChange={handleProgressChange}
                  max={100}
                  step={0.1}
                  className="w-full"
                />
              </div>
              
              <span className="text-xs text-zinc-400 min-w-[35px]">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right Section - Volume & Queue */}
          <div className="flex items-center gap-3 flex-1 justify-end">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowQueue(!showQueue)}
              className="w-8 h-8 text-zinc-400 hover:text-white transition-colors"
            >
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <List className="w-4 h-4" />
              </motion.div>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleMute}
                className="w-8 h-8 text-zinc-400 hover:text-white transition-colors"
              >
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </motion.div>
              </Button>
              
              <div className="w-24 group">
                <Slider
                  value={[volume * 100]}
                  onValueChange={([value]) => {
                    setVolume(value / 100);
                    if (value > 0 && isMuted) {
                      setIsMuted(false);
                    }
                  }}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Queue Panel */}
      <AnimatePresence>
        {showQueue && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 w-80 h-full bg-zinc-950/95 backdrop-blur-md border-l border-zinc-800/50 z-40"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Up Next</h3>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowQueue(false)}
                  className="w-8 h-8"
                >
                  ×
                </Button>
              </div>
              <div className="space-y-2">
                <p className="text-zinc-400 text-sm">Queue is empty</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MusicPlayer;
