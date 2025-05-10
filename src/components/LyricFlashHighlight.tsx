
import React, { useState, useEffect } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LyricFlashHighlightProps {
  className?: string;
}

// This is a simplified demonstration - in a real application,
// you would sync this with actual lyrics and timestamps
const LyricFlashHighlight: React.FC<LyricFlashHighlightProps> = ({ className }) => {
  const { currentTrack, isPlaying, progress } = usePlayer();
  const [currentLyric, setCurrentLyric] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [enabled, setEnabled] = useState(true);
  
  // Demo lyrics with timestamps (percentages of song progress)
  const demoLyrics = [
    { text: "♪ Just a small town girl...", timestamp: 10 },
    { text: "♪ Living in a lonely world...", timestamp: 25 },
    { text: "♪ She took the midnight train...", timestamp: 40 },
    { text: "♪ Going anywhere...", timestamp: 55 },
    { text: "♪ Don't stop believin'...", timestamp: 70 },
    { text: "♪ Hold on to that feeling...", timestamp: 85 },
  ];
  
  // Monitor progress and display lyrics
  useEffect(() => {
    if (!isPlaying || !enabled) {
      setCurrentLyric(null);
      return;
    }
    
    // Find the current lyric based on song progress
    const currentLine = demoLyrics.find(line => {
      const threshold = 2; // percentage points threshold
      return Math.abs(progress - line.timestamp) < threshold;
    });
    
    if (currentLine && currentLine.text !== currentLyric) {
      setCurrentLyric(currentLine.text);
      setIsFlashing(true);
      
      // Reset flashing state after animation
      const timer = setTimeout(() => {
        setIsFlashing(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [progress, isPlaying, enabled, currentLyric]);
  
  // Clear lyric when track changes
  useEffect(() => {
    setCurrentLyric(null);
    setIsFlashing(false);
  }, [currentTrack]);
  
  const toggleEnabled = () => {
    setEnabled(prev => !prev);
  };
  
  if (!isPlaying || !enabled) return null;
  
  return (
    <div className={cn(
      "fixed top-24 left-0 right-0 flex justify-center pointer-events-none z-50",
      className
    )}>
      {currentLyric && (
        <div className={cn(
          "bg-black/70 backdrop-blur-sm px-6 py-3 rounded-lg border border-white/10 shadow-xl",
          "transition-all duration-500 max-w-md text-center",
          isFlashing ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}>
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb size={16} className="text-yellow-300 animate-pulse" />
            <p className="text-xs text-yellow-200">Lyric Highlight</p>
          </div>
          <p className={cn(
            "text-lg font-medium",
            isFlashing && "animate-text-scramble text-gradient-gold"
          )}>
            {currentLyric}
          </p>
        </div>
      )}
      
      {/* Toggle button */}
      <button
        onClick={toggleEnabled}
        className={cn(
          "fixed top-24 right-4 pointer-events-auto",
          "w-8 h-8 rounded-full flex items-center justify-center",
          "bg-black/50 border border-white/20 z-50",
          enabled && "bg-yellow-500/20 border-yellow-300"
        )}
      >
        <Lightbulb 
          size={16} 
          className={cn(
            "transition-colors", 
            enabled ? "text-yellow-300" : "text-gray-400"
          )} 
        />
      </button>
    </div>
  );
};

export default LyricFlashHighlight;
