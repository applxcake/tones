
import { motion } from 'framer-motion';
import { Play, Pause, SkipForward, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayer } from '@/contexts/PlayerContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const MiniPlayer = () => {
  const { currentTrack, isPlaying, togglePlayPause, nextTrack } = usePlayer();
  const isMobile = useIsMobile();

  if (!currentTrack || !isMobile) {
    return null;
  }

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800/50 md:hidden"
    >
      <div className="flex items-center justify-between px-4 py-2">
        {/* Track Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <img
            src={currentTrack.thumbnailUrl}
            alt={currentTrack.title}
            className={cn(
              "w-10 h-10 rounded-md object-cover",
              isPlaying && "animate-pulse-soft"
            )}
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-white font-medium text-sm truncate">
              {currentTrack.title}
            </h4>
            <p className="text-zinc-400 text-xs truncate">
              {currentTrack.channelTitle}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="w-8 h-8 text-zinc-400"
          >
            <Heart className="w-4 h-4" />
          </Button>
          
          <Button
            size="icon"
            onClick={togglePlayPause}
            className="w-10 h-10 bg-white hover:bg-white/90 text-black rounded-full"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </Button>
          
          <Button
            size="icon"
            variant="ghost"
            onClick={nextTrack}
            className="w-8 h-8 text-zinc-400"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default MiniPlayer;
