import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { usePlayer } from '@/contexts/PlayerContext';

interface VisualVolumePeaksProps {
  position?: 'left' | 'right';
  className?: string;
  barCount?: number;
}

const VisualVolumePeaks: React.FC<VisualVolumePeaksProps> = ({
  position = 'right',
  className,
  barCount = 40
}) => {
  const { isPlaying } = usePlayer();
  const [peaks, setPeaks] = useState<number[]>([]);
  const animationRef = useRef<number>();

  // Generate random peaks based on playing state
  useEffect(() => {
    const generatePeaks = () => {
      if (!isPlaying) {
        // When paused, all bars are low
        setPeaks(Array(barCount).fill(0).map(() => Math.random() * 0.15));
        return;
      }

      // Create random peaks with some coherence
      const newPeaks = [...(peaks.length ? peaks : Array(barCount).fill(0.1))];
      
      for (let i = 0; i < barCount; i++) {
        // More variation in the middle, less at the edges
        const distFromCenter = Math.abs(i - barCount / 2) / (barCount / 2);
        const variationFactor = 1 - distFromCenter * 0.7; // Higher in center
        
        // Randomly adjust each peak with some momentum
        let newValue = newPeaks[i] + (Math.random() - 0.5) * 0.2 * variationFactor;
        
        // Add occasional spikes
        if (Math.random() < 0.05 * variationFactor) {
          newValue = Math.random() * 0.6 + 0.4;
        }
        
        // Keep within bounds
        newPeaks[i] = Math.max(0.05, Math.min(1, newValue));
      }
      
      // Smooth the transitions between adjacent bars
      for (let i = 1; i < barCount - 1; i++) {
        newPeaks[i] = (newPeaks[i-1] + newPeaks[i] * 2 + newPeaks[i+1]) / 4;
      }
      
      setPeaks(newPeaks);
    };

    // Animate peaks
    const animate = () => {
      generatePeaks();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, barCount, peaks]);

  return (
    <div 
      className={cn(
        "fixed top-0 bottom-0 w-3 flex flex-col justify-evenly z-50",
        position === 'left' ? "left-0" : "right-0",
        className
      )}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm -z-10" />
      
      {peaks.map((peak, index) => (
        <div
          key={index}
          className="w-full h-1 flex items-center justify-center"
        >
          <div 
            className={cn(
              "h-[2px] rounded-full transition-all duration-100 ease-out",
              isPlaying ? "bg-neon-purple" : "bg-gray-500"
            )}
            style={{ 
              width: `${peak * 100}%`,
              opacity: isPlaying ? 0.7 + (peak * 0.3) : 0.3,
              boxShadow: isPlaying 
                ? `0 0 ${Math.round(peak * 5)}px ${Math.round(peak * 2)}px rgba(155,135,245,${peak * 0.5})` 
                : 'none'
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default VisualVolumePeaks;
