
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { usePlayer } from '@/contexts/PlayerContext';

interface VinylRecordDisplayProps {
  thumbnailUrl: string;
  title: string;
  className?: string;
}

const VinylRecordDisplay = ({ thumbnailUrl, title, className }: VinylRecordDisplayProps) => {
  const { isPlaying } = usePlayer();
  const [rotation, setRotation] = useState(0);
  
  // Vinyl record rotation animation
  useEffect(() => {
    let animationFrame: number;
    let lastTime = 0;
    
    const animate = (time: number) => {
      if (lastTime === 0) {
        lastTime = time;
      }
      
      const delta = time - lastTime;
      
      if (isPlaying) {
        // Rotate at 33 1/3 RPM (approx 198 degrees per second)
        setRotation(prev => (prev + delta * 0.0333) % 360);
      }
      
      lastTime = time;
      animationFrame = requestAnimationFrame(animate);
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isPlaying]);

  return (
    <div className={cn("relative", className)}>
      {/* Vinyl record */}
      <div 
        className="absolute inset-0 rounded-full bg-black z-10 shadow-xl"
        style={{ 
          transform: `rotate(${rotation}deg)`,
          transition: isPlaying ? 'none' : 'transform 0.5s ease-out'
        }}
      >
        {/* Vinyl grooves */}
        <div className="absolute inset-4 rounded-full border-4 border-gray-800"></div>
        <div className="absolute inset-8 rounded-full border-2 border-gray-800"></div>
        <div className="absolute inset-12 rounded-full border border-gray-800"></div>
        <div className="absolute inset-16 rounded-full border border-gray-800"></div>
        
        {/* Label in the center */}
        <div className="absolute inset-0 m-auto w-2/5 h-2/5 rounded-full bg-white z-20 flex items-center justify-center p-1">
          <div className="w-full h-full rounded-full overflow-hidden">
            <img 
              src={thumbnailUrl} 
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/* Center hole */}
        <div className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-gray-900 z-30"></div>
      </div>
      
      {/* Album art underneath/behind the vinyl */}
      <div className="rounded-full overflow-hidden">
        <img 
          src={thumbnailUrl} 
          alt={title}
          className="w-full h-full object-cover opacity-40"
        />
      </div>
    </div>
  );
};

export default VinylRecordDisplay;
