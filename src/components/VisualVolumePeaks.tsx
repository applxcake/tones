
import { useState, useEffect } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { cn } from '@/lib/utils';

interface VisualVolumePeaksProps {
  position?: 'left' | 'right' | 'center';
  barCount?: number;
  className?: string;
}

const VisualVolumePeaks = ({ 
  position = 'right', 
  barCount = 8,
  className 
}: VisualVolumePeaksProps) => {
  const { volume, isPlaying } = usePlayer();
  const [peaks, setPeaks] = useState<number[]>([]);
  
  // Generate new peaks on volume change or when playing status changes
  useEffect(() => {
    const generatePeaks = () => {
      if (!isPlaying) {
        return Array(barCount).fill(1); // Minimal height when not playing
      }
      
      // Generate random heights influenced by volume level
      const maxHeight = volume * 30;
      return Array.from({ length: barCount }, () => {
        const baseHeight = Math.random() * maxHeight;
        // Make some bars taller to create visual interest
        return Math.max(1, Math.min(30, baseHeight + (Math.random() > 0.7 ? 5 : 0)));
      });
    };
    
    // Update peaks regularly while playing
    const interval = setInterval(() => {
      if (isPlaying) {
        setPeaks(generatePeaks());
      }
    }, 150);
    
    // Initial generation
    setPeaks(generatePeaks());
    
    return () => clearInterval(interval);
  }, [volume, isPlaying, barCount]);
  
  const positionClasses = {
    left: "left-4 top-1/2 -translate-y-1/2",
    right: "right-4 top-1/2 -translate-y-1/2",
    center: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
  };
  
  return (
    <div className={cn(
      "fixed z-40 flex items-end gap-[1px]",
      positionClasses[position],
      className
    )}>
      {peaks.map((height, i) => (
        <div
          key={i}
          className="w-1 rounded-full animate-pulse"
          style={{
            height: `${height}px`,
            animationDelay: `${i * 0.05}s`,
            backgroundColor: i % 3 === 0 ? '#9b87f5' : i % 3 === 1 ? '#D946EF' : '#0EA5E9',
            opacity: 0.8
          }}
        />
      ))}
    </div>
  );
};

export default VisualVolumePeaks;
