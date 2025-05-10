
import React, { useState, useEffect } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { HeartPulse } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BPMPulserProps {
  className?: string;
  estimatedBPM?: number; // Default BPM if not detected
  children?: React.ReactNode;
}

const BPMPulser: React.FC<BPMPulserProps> = ({ 
  className, 
  estimatedBPM = 120,
  children 
}) => {
  const { currentTrack, isPlaying } = usePlayer();
  const [bpm, setBpm] = useState(estimatedBPM);
  const [isEnabled, setIsEnabled] = useState(true);
  
  // Estimate BPM based on track (in a real app, you'd get this from metadata)
  useEffect(() => {
    if (currentTrack) {
      // This is a simple simulation - in a real app you'd use audio analysis
      // or fetch the BPM from metadata
      const trackId = currentTrack.id;
      // Generate a consistent pseudo-random BPM between 60-180 based on track ID
      const hash = trackId.split('').reduce((acc, char) => {
        return acc + char.charCodeAt(0);
      }, 0);
      
      const newBpm = (hash % 120) + 60; // 60-180 BPM range
      setBpm(newBpm);
    }
  }, [currentTrack]);

  // Calculate animation duration from BPM
  const animationDuration = 60 / bpm; // seconds per beat
  
  const togglePulser = () => {
    setIsEnabled(prev => !prev);
  };
  
  return (
    <div className={cn("relative", className)}>
      {/* Visualize the BPM */}
      <div 
        className={cn(
          "absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black/70 px-3 py-1 rounded-full",
          "flex items-center gap-2 text-sm transition-opacity duration-300",
          isEnabled ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <HeartPulse size={16} className="text-neon-pink" />
        <span>{Math.round(bpm)} BPM</span>
      </div>
      
      {/* Toggle button */}
      <button
        onClick={togglePulser}
        className={cn(
          "absolute -top-10 right-0 w-8 h-8 rounded-full flex items-center justify-center",
          "bg-black/50 border border-white/20 transition-all duration-300",
          isEnabled && "bg-neon-pink/20 border-neon-pink"
        )}
      >
        <HeartPulse 
          size={16} 
          className={cn(
            "transition-colors", 
            isEnabled ? "text-neon-pink" : "text-gray-400"
          )} 
        />
      </button>
      
      {/* Pulsing container */}
      <div
        className={cn(
          "relative transition-all",
          isEnabled && isPlaying && "animate-bpm-pulse"
        )}
        style={{ 
          animationDuration: `${animationDuration}s`,
          animationPlayState: isPlaying && isEnabled ? 'running' : 'paused'
        }}
      >
        {children}
        
        {/* Pulse ring */}
        {isEnabled && isPlaying && (
          <div 
            className="absolute inset-0 pointer-events-none rounded-lg border border-neon-pink/0 opacity-0 animate-bpm-ring"
            style={{ 
              animationDuration: `${animationDuration}s`
            }}
          />
        )}
      </div>
    </div>
  );
};

export default BPMPulser;
