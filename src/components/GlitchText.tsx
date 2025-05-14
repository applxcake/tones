
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface GlitchTextProps {
  text: string;
  className?: string;
  glitchInterval?: number;
  glitchDuration?: number;
  font?: string;
}

const GlitchText: React.FC<GlitchTextProps> = ({
  text,
  className,
  glitchInterval = 5000,
  glitchDuration = 200,
  font = 'font-bold',
}) => {
  const [glitching, setGlitching] = useState(false);
  
  useEffect(() => {
    // Set up glitching at intervals
    const intervalId = setInterval(() => {
      setGlitching(true);
      
      // Turn off glitching after duration
      setTimeout(() => setGlitching(false), glitchDuration);
    }, glitchInterval);
    
    return () => clearInterval(intervalId);
  }, [glitchInterval, glitchDuration]);
  
  return (
    <div 
      className={cn(
        "relative inline-block overflow-hidden",
        font,
        className
      )}
    >
      {/* Main text */}
      <span className={cn(
        "relative inline-block z-10 transition-all",
        glitching && "animate-shake"
      )}>
        {text}
      </span>
      
      {/* Glitch effects that show during glitching */}
      {glitching && (
        <>
          <span className="absolute inset-0 text-neon-blue opacity-70 -translate-x-1 translate-y-1 z-20">
            {text}
          </span>
          <span className="absolute inset-0 text-neon-pink opacity-70 translate-x-1 -translate-y-1 z-20">
            {text}
          </span>
          <span className="absolute inset-0 text-white opacity-20 translate-x-1 translate-y-1 z-20">
            {text}
          </span>
        </>
      )}
    </div>
  );
};

export default GlitchText;
