import React, { useState, useRef } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { YouTubeVideo } from '@/services/youtubeService';
import { Magnet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface MagneticDragQueueProps {
  song: YouTubeVideo;
  className?: string;
}

const MagneticDragQueue: React.FC<MagneticDragQueueProps> = ({ song, className }) => {
  const { addToQueue } = usePlayer();
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isNearQueue, setIsNearQueue] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const initialPosition = useRef<{ x: number, y: number } | null>(null);
  
  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!elementRef.current) return;
    
    // Get the initial position of the element
    const rect = elementRef.current.getBoundingClientRect();
    initialPosition.current = { 
      x: rect.left,
      y: rect.top
    };
    
    setIsDragging(true);
    setDragPosition({ x: e.clientX, y: e.clientY });
    
    // Add event listeners for drag and end
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  // Handle dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !initialPosition.current) return;
    
    const newPosition = { x: e.clientX, y: e.clientY };
    setDragPosition(newPosition);
    
    // Check if near the queue (bottom right corner)
    const isNear = e.clientX > window.innerWidth - 150 && e.clientY > window.innerHeight - 150;
    setIsNearQueue(isNear);
  };
  
  // Handle drag end
  const handleMouseUp = (e: MouseEvent) => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    // If near queue area, add to queue
    if (isNearQueue) {
      addToQueue(song);
      toast({
        title: "Queued!",
        duration: 1500
      });
    }
    
    // Reset position
    initialPosition.current = null;
    setIsNearQueue(false);
  };
  
  // Calculate transform for the dragged element
  const dragStyle = isDragging ? {
    position: 'fixed' as const,
    left: `${dragPosition.x - 25}px`,
    top: `${dragPosition.y - 25}px`,
    width: '50px',
    height: '50px',
    transform: isNearQueue ? 'scale(1.2)' : 'scale(1)',
    zIndex: 1000,
    transition: isNearQueue ? 'transform 0.2s ease-out' : '',
    boxShadow: isNearQueue ? '0 0 15px rgba(155, 135, 245, 0.7)' : '0 0 5px rgba(0, 0, 0, 0.3)'
  } : {};
  
  return (
    <div className={className}>
      <div
        ref={elementRef}
        className={cn(
          "flex items-center justify-center cursor-grab active:cursor-grabbing",
          isDragging && "opacity-0"
        )}
        onMouseDown={handleMouseDown}
      >
        <Magnet size={20} className="mr-2 text-neon-purple animate-pulse-slow" />
        <span className="text-sm">Drag to Queue</span>
      </div>
      
      {/* Draggable element */}
      {isDragging && (
        <div
          style={dragStyle}
          className={cn(
            "rounded-full bg-black/80 border border-neon-purple flex items-center justify-center",
            isNearQueue && "border-2 animate-pulse"
          )}
        >
          <Magnet
            size={24}
            className={cn(
              "text-neon-purple",
              isNearQueue && "animate-pulse"
            )}
          />
          
          {/* Magnetic pull effect animation */}
          {isNearQueue && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-neon-purple/50 animate-ping-slow"></div>
              <div className="absolute inset-0 rounded-full border border-neon-purple/30 animate-ping-slower"></div>
            </>
          )}
        </div>
      )}
      
      {/* Queue target indicator - only shown during drag */}
      {isDragging && (
        <div className="fixed bottom-20 right-10 w-12 h-12 rounded-full bg-black/50 border border-neon-purple/50 flex items-center justify-center z-50">
          <div className={cn(
            "w-8 h-8 rounded-full bg-neon-purple/20 flex items-center justify-center transition-all",
            isNearQueue && "w-10 h-10 bg-neon-purple/40"
          )}>
            <Magnet size={isNearQueue ? 20 : 16} className={cn(
              "text-neon-purple transition-all",
              isNearQueue && "animate-pulse"
            )} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MagneticDragQueue;
