
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayer } from '@/contexts/PlayerContext';

const SongQueueDrawer = () => {
  const { queue, showQueue, setShowQueue, playTrack, currentTrack } = usePlayer();

  return (
    <AnimatePresence>
      {showQueue && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowQueue(false)}
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 w-96 h-full bg-zinc-950/95 backdrop-blur-md border-l border-zinc-800/50 z-50"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-zinc-800/50">
                <h3 className="text-white font-semibold text-lg">Queue</h3>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowQueue(false)}
                  className="w-8 h-8 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Queue Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {queue.length > 0 ? (
                  <div className="space-y-2">
                    {queue.map((song, index) => (
                      <div
                        key={`${song.id}-${index}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors group"
                      >
                        <div className="relative">
                          <img
                            src={song.thumbnailUrl}
                            alt={song.title}
                            className="w-12 h-12 rounded-md object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center rounded-md">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => playTrack(song)}
                            >
                              <Play className="w-4 h-4 text-white" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-white text-sm font-medium truncate">
                            {song.title}
                          </h4>
                          <p className="text-zinc-400 text-xs truncate">
                            {song.channelTitle}
                          </p>
                        </div>

                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="w-4 h-4 text-zinc-400" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-zinc-400">Queue is empty</p>
                    <p className="text-zinc-500 text-sm mt-1">
                      Add songs to see them here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SongQueueDrawer;
