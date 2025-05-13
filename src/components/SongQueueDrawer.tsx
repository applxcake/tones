
import { useState, useEffect } from 'react';
import { Grip, X, ListMusic, Music } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SongQueueDrawerProps {
  className?: string;
}

const SongQueueDrawer: React.FC<SongQueueDrawerProps> = ({ className }) => {
  const { queue, removeFromQueue, clearQueue, playTrack } = usePlayer();
  const [isOpen, setIsOpen] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [localQueue, setLocalQueue] = useState(queue);
  
  // Update local queue when the actual queue changes
  useEffect(() => {
    setLocalQueue(queue);
  }, [queue]);

  // Handle drag start
  const handleDragStart = (index: number) => {
    setDraggingIndex(index);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Handle drop to reorder
  const handleDrop = (targetIndex: number) => {
    if (draggingIndex === null) return;
    
    const newQueue = [...localQueue];
    const [draggedItem] = newQueue.splice(draggingIndex, 1);
    newQueue.splice(targetIndex, 0, draggedItem);
    
    // Update local state (real implementation would update context)
    setLocalQueue(newQueue);
    setDraggingIndex(null);
  };

  // Toggle the drawer
  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Toggle button */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleDrawer}
        className={cn(
          "fixed right-4 top-1/2 transform -translate-y-1/2 z-40",
          "rounded-full h-12 w-12 bg-black/40 hover:bg-black/60 backdrop-blur-sm",
          "border border-white/10 transition-all duration-300",
          isOpen && "opacity-0 pointer-events-none"
        )}
      >
        <ListMusic className="h-5 w-5 text-white" />
      </Button>

      {/* Queue Drawer */}
      <div 
        className={cn(
          "fixed top-0 bottom-24 right-0 z-50 w-80 glass-panel border-l border-white/10",
          "transform transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full",
          className
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center">
            <ListMusic className="h-5 w-5 mr-2 text-neon-purple" />
            <h3 className="font-bold">Play Queue</h3>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearQueue}
              disabled={localQueue.length === 0}
              className="text-xs hover:text-red-400"
            >
              Clear
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleDrawer} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-2 overflow-y-auto h-full pb-16">
          {localQueue.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <Music className="h-10 w-10 mb-2 opacity-30" />
              <p>Your queue is empty</p>
              <p className="text-xs mt-1">Add songs to your queue</p>
            </div>
          ) : (
            <ul className="space-y-1">
              {localQueue.map((song, index) => (
                <li 
                  key={`${song.id}-${index}`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(index)}
                  className={cn(
                    "flex items-center p-2 rounded-lg hover:bg-white/5 transition-colors",
                    "cursor-grab active:cursor-grabbing",
                    draggingIndex === index && "opacity-50 bg-white/10"
                  )}
                >
                  <div className="flex items-center mr-2">
                    <Grip className="h-4 w-4 text-gray-400" />
                  </div>
                  <div 
                    className="w-10 h-10 rounded overflow-hidden flex-shrink-0 mr-3"
                    onClick={() => playTrack(song)}
                  >
                    <img 
                      src={song.thumbnailUrl} 
                      alt={song.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{song.title}</p>
                    <p className="text-xs text-gray-400 truncate">{song.channelTitle}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeFromQueue(song.id)}
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Backdrop for closing when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={toggleDrawer}
        />
      )}
    </>
  );
};

export default SongQueueDrawer;
