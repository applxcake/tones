
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { usePlayer } from '@/contexts/PlayerContext';

interface RetroTapeDeckProps {
  className?: string;
  width?: number;
  height?: number;
}

const RetroTapeDeck: React.FC<RetroTapeDeckProps> = ({
  className,
  width = 300,
  height = 200,
}) => {
  const { isPlaying, currentTrack, progress } = usePlayer();
  const [spoolRotation, setSpoolRotation] = useState({ left: 0, right: 0 });
  const [tapeBalance, setTapeBalance] = useState(0.5); // 0 = all on left, 1 = all on right
  const animationRef = useRef<number>();
  
  // Update tape balance based on song progress
  useEffect(() => {
    setTapeBalance(progress / 100);
  }, [progress]);
  
  // Animate tape spools
  useEffect(() => {
    let lastTime = 0;
    
    const animate = (time: number) => {
      if (lastTime === 0) {
        lastTime = time;
      }
      
      const delta = time - lastTime;
      lastTime = time;
      
      if (isPlaying) {
        const rotationSpeed = 0.1; // base rotation speed
        
        // Calculate how much tape is on each spool
        const leftAmount = 1 - tapeBalance;
        const rightAmount = tapeBalance;
        
        // Rotation speeds are inversely proportional to the amount of tape on the spool
        // (a nearly empty spool rotates faster)
        const leftRotationSpeed = rotationSpeed / (0.1 + leftAmount * 0.9);
        const rightRotationSpeed = rotationSpeed / (0.1 + rightAmount * 0.9);
        
        setSpoolRotation(prev => ({
          left: prev.left + delta * leftRotationSpeed,
          right: prev.right + delta * rightRotationSpeed,
        }));
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, tapeBalance]);

  // Get cassette label from current track
  const getLabel = () => {
    if (!currentTrack) return 'No Track Selected';
    
    // Shorten track title if needed
    let title = currentTrack.title;
    if (title.length > 20) {
      title = title.substring(0, 17) + '...';
    }
    
    return title;
  };

  return (
    <div 
      className={cn(
        "relative overflow-hidden",
        className
      )}
      style={{ width, height }}
    >
      {/* Cassette deck body */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg shadow-xl">
        {/* Metallic edges */}
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-gray-600 via-gray-400 to-gray-600" />
        <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-gray-600 via-gray-400 to-gray-600" />
        <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-b from-gray-600 via-gray-400 to-gray-600" />
        <div className="absolute inset-y-0 right-0 w-2 bg-gradient-to-b from-gray-600 via-gray-400 to-gray-600" />
      </div>
      
      {/* Cassette window */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-3/4 h-2/5 bg-black/60 rounded-md border border-gray-700">
        {/* Cassette body */}
        <div className="absolute inset-2 bg-gray-900 rounded border border-gray-800 flex flex-col">
          {/* Label */}
          <div className="flex-1 m-2 bg-white/90 rounded flex items-center justify-center">
            <div className="text-xs font-mono text-black font-bold px-2 truncate">
              {getLabel()}
            </div>
          </div>
          
          {/* Tape reels */}
          <div className="h-1/2 flex items-center justify-between px-4 pb-2">
            {/* Left spool */}
            <div className="relative w-10 h-10">
              <div 
                className="absolute inset-0 bg-black rounded-full border-4 border-gray-800"
                style={{
                  transform: `rotate(${spoolRotation.left}deg)`,
                }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-4 bg-gray-700" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-1 bg-gray-700" />
              </div>
              
              {/* Tape amount on left spool */}
              <div 
                className="absolute inset-1 bg-gradient-to-r from-gray-900 to-gray-800 rounded-full border border-gray-700"
                style={{
                  opacity: 1 - tapeBalance,
                  transform: `scale(${0.3 + (1 - tapeBalance) * 0.7})`,
                }}
              />
            </div>
            
            {/* Right spool */}
            <div className="relative w-10 h-10">
              <div 
                className="absolute inset-0 bg-black rounded-full border-4 border-gray-800"
                style={{
                  transform: `rotate(${spoolRotation.right}deg)`,
                }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-4 bg-gray-700" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-1 bg-gray-700" />
              </div>
              
              {/* Tape amount on right spool */}
              <div 
                className="absolute inset-1 bg-gradient-to-r from-gray-900 to-gray-800 rounded-full border border-gray-700"
                style={{
                  opacity: tapeBalance,
                  transform: `scale(${0.3 + tapeBalance * 0.7})`,
                }}
              />
            </div>
          </div>
          
          {/* Tape path between spools */}
          <div className="absolute top-3/4 left-0 right-0 h-px">
            <div className="absolute left-[calc(20%-5px)] right-[calc(20%-5px)] h-[2px] bg-black" />
            {/* Left vertical */}
            <div className="absolute left-[calc(20%-5px)] top-0 w-[2px] h-4 bg-black" />
            {/* Right vertical */}
            <div className="absolute right-[calc(20%-5px)] top-0 w-[2px] h-4 bg-black" />
          </div>
        </div>
      </div>
      
      {/* Deck controls */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
        {/* Transport controls */}
        <button 
          className={cn(
            "w-8 h-8 rounded-sm border border-gray-600 flex items-center justify-center shadow-inner",
            isPlaying ? "bg-gradient-to-br from-neon-purple to-neon-blue" : "bg-gray-700"
          )}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          <div className={isPlaying ? "w-3 h-3 bg-white rounded-sm" : "w-0 h-0 border-t-5 border-t-transparent border-l-8 border-l-white border-b-5 border-b-transparent ml-1"} />
        </button>
        
        {/* Stop button */}
        <button 
          className="w-8 h-8 bg-gray-700 rounded-sm border border-gray-600 flex items-center justify-center shadow-inner"
          aria-label="Stop"
        >
          <div className="w-3 h-3 bg-white rounded-sm" />
        </button>
        
        {/* Fast forward */}
        <button 
          className="w-8 h-8 bg-gray-700 rounded-sm border border-gray-600 flex items-center justify-center shadow-inner"
          aria-label="Fast Forward"
        >
          <div className="flex">
            <div className="w-0 h-0 border-t-3 border-t-transparent border-l-5 border-l-white border-b-3 border-b-transparent" />
            <div className="w-0 h-0 border-t-3 border-t-transparent border-l-5 border-l-white border-b-3 border-b-transparent -ml-1" />
          </div>
        </button>
        
        {/* Rewind */}
        <button 
          className="w-8 h-8 bg-gray-700 rounded-sm border border-gray-600 flex items-center justify-center shadow-inner"
          aria-label="Rewind"
        >
          <div className="flex">
            <div className="w-0 h-0 border-t-3 border-t-transparent border-r-5 border-r-white border-b-3 border-b-transparent" />
            <div className="w-0 h-0 border-t-3 border-t-transparent border-r-5 border-r-white border-b-3 border-b-transparent -mr-1" />
          </div>
        </button>
      </div>
      
      {/* VU meters */}
      <div className="absolute top-2 right-4 flex gap-2">
        <div className={cn(
          "w-4 h-16 bg-gray-900 border border-gray-600 rounded-sm overflow-hidden",
          isPlaying ? "animate-pulse-slow" : ""
        )}>
          <div 
            className="w-full bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 transition-height duration-200"
            style={{ 
              height: isPlaying ? `${30 + Math.random() * 60}%` : '5%',
              transition: isPlaying ? 'height 0.1s ease-in-out' : 'height 0.5s ease-in-out'
            }}
          />
        </div>
        <div className={cn(
          "w-4 h-16 bg-gray-900 border border-gray-600 rounded-sm overflow-hidden",
          isPlaying ? "animate-pulse-slow" : ""
        )}>
          <div 
            className="w-full bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 transition-height duration-200"
            style={{ 
              height: isPlaying ? `${30 + Math.random() * 60}%` : '5%',
              transition: isPlaying ? 'height 0.1s ease-in-out' : 'height 0.5s ease-in-out'
            }}
          />
        </div>
      </div>
      
      {/* Small brand logo */}
      <div className="absolute bottom-1 left-2 text-[8px] font-bold text-gray-400 font-mono">
        NEON AUDIO
      </div>
    </div>
  );
};

export default RetroTapeDeck;
