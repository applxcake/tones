
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
  const [highlight, setHighlight] = useState(false);
  
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

  // Random highlights on the vinyl surface
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setHighlight(prev => !prev);
      }, 2000 + Math.random() * 3000);
      
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  return (
    <div className={cn("relative group", className)}>
      {/* Light reflection effect */}
      <div 
        className={cn(
          "absolute inset-0 rounded-full bg-white/10 z-20 opacity-0 group-hover:opacity-100 transition-opacity",
          highlight && isPlaying && "opacity-10"
        )} 
        style={{ 
          background: 'linear-gradient(45deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%)',
          animation: highlight && isPlaying ? 'vinylHighlight 1s ease-in-out' : 'none'
        }}
      ></div>
      
      {/* Vinyl record */}
      <div 
        className="absolute inset-0 rounded-full bg-black z-10 shadow-xl vinyl-container"
        style={{ 
          transform: `rotate(${rotation}deg)`,
          transition: isPlaying ? 'none' : 'transform 0.5s ease-out'
        }}
      >
        {/* Vinyl grooves */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div 
            key={i} 
            className="absolute rounded-full border border-gray-800/80"
            style={{
              inset: `${i * 10}%`,
              opacity: 0.7 - i * 0.05
            }}
          ></div>
        ))}
        
        {/* Random light reflections */}
        {isPlaying && Array.from({ length: 3 }).map((_, i) => (
          <div 
            key={`reflection-${i}`}
            className="absolute rounded-full bg-white/5"
            style={{
              width: `${Math.random() * 20 + 5}px`,
              height: `${Math.random() * 20 + 5}px`,
              left: `${Math.random() * 80 + 10}%`,
              top: `${Math.random() * 80 + 10}%`,
              opacity: Math.random() * 0.2,
              animation: `vinylSparkle ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          ></div>
        ))}
        
        {/* Label in the center */}
        <div className="absolute inset-0 m-auto w-2/5 h-2/5 rounded-full bg-white z-20 flex items-center justify-center p-1 shadow-md">
          <div className="w-full h-full rounded-full overflow-hidden relative group">
            <img 
              src={thumbnailUrl} 
              alt={title}
              className="w-full h-full object-cover"
            />
            {/* Overlay gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>
        
        {/* Center hole */}
        <div className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-gray-900 z-30 shadow-inner"></div>
        
        {/* Spinning animation indicators */}
        {isPlaying && (
          <>
            <div className="absolute top-[48%] left-[48%] w-4 h-4 rounded-full bg-white/5 animate-ping-slow z-5"></div>
            <div className="absolute top-[46%] left-[46%] w-8 h-8 rounded-full bg-white/5 animate-ping-slower z-5" style={{animationDelay: "0.5s"}}></div>
          </>
        )}
      </div>
      
      {/* Album art underneath/behind the vinyl */}
      <div className="rounded-full overflow-hidden shadow-glow">
        <img 
          src={thumbnailUrl} 
          alt={title}
          className="w-full h-full object-cover opacity-40"
        />
        {/* Pulsing overlay based on playing state */}
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-br from-neon-purple/20 to-transparent",
            isPlaying && "animate-pulse-soft"
          )}
        ></div>
      </div>
    </div>
  );
};

export default VinylRecordDisplay;
