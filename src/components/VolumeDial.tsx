
import React, { useState, useRef, useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlayer } from '@/contexts/PlayerContext';

interface VolumeDialProps {
  className?: string;
}

const VolumeDial: React.FC<VolumeDialProps> = ({ className }) => {
  const { volume, setVolume } = usePlayer();
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState(volume * 270); // 0-270 degrees
  const dialRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);

  // Calculate initial rotation based on volume
  useEffect(() => {
    if (!isDragging) {
      setRotation(volume * 270);
    }
  }, [volume, isDragging]);

  // Handle mouse events for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !dialRef.current) return;
    
    const dial = dialRef.current.getBoundingClientRect();
    const dialCenterX = dial.left + dial.width / 2;
    const dialCenterY = dial.top + dial.height / 2;
    
    // Calculate angle between center of dial and mouse position
    const angle = Math.atan2(e.clientY - dialCenterY, e.clientX - dialCenterX) * (180 / Math.PI);
    
    // Adjust angle to make it start from the top (270 degrees) and only go clockwise 270 degrees
    let adjustedAngle = angle + 90; // Rotate so 0 is at the top
    if (adjustedAngle < 0) adjustedAngle += 360;
    if (adjustedAngle > 270) adjustedAngle = 270;
    
    // Set rotation and update volume
    setRotation(adjustedAngle);
    const newVolume = adjustedAngle / 270;
    setVolume(newVolume);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Convert volume to a hue value (0-120, blue to red)
  const volumeToColor = () => {
    // From blue (240) to purple (270) to red (0)
    const hue = 240 - (volume * 240);
    return `hsl(${hue}, 100%, 60%)`;
  };

  return (
    <div 
      className={cn(
        "relative w-20 h-20 select-none", 
        className
      )}
      ref={dialRef}
    >
      {/* Dial background with glowing track */}
      <div className="absolute inset-0 rounded-full bg-black/50 shadow-inner">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] rounded-full"
          style={{
            background: `conic-gradient(${volumeToColor()} ${rotation / 360 * 100}%, rgba(50, 50, 50, 0.3) ${rotation / 360 * 100}%)`
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full bg-black/60" />
      </div>
      
      {/* Knob */}
      <div
        ref={knobRef}
        className={cn(
          "absolute w-6 h-6 bg-white rounded-full cursor-pointer shadow-glow transition-transform",
          isDragging && "scale-110"
        )}
        style={{
          top: '50%',
          left: '50%',
          transform: `rotate(${rotation}deg) translate(32px) rotate(-${rotation}deg)`,
          backgroundColor: volumeToColor(),
          boxShadow: `0 0 10px ${volumeToColor()}`
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/80 rounded-full" />
      </div>
      
      {/* Volume indicator in center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
        <Volume2 className="h-4 w-4 text-white/70" />
        <span className="text-xs font-bold text-white/80 mt-0.5">{Math.round(volume * 100)}%</span>
      </div>
      
      {/* Glowing effect when active */}
      <div className={cn(
        "absolute inset-0 rounded-full transition-opacity duration-300",
        isDragging ? "opacity-100" : "opacity-0"
      )}
      style={{
        boxShadow: `0 0 20px ${volumeToColor()}, inset 0 0 10px ${volumeToColor()}`,
      }} />
    </div>
  );
};

export default VolumeDial;
