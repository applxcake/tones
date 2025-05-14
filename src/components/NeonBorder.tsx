
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface NeonBorderProps {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
  pulsate?: boolean;
  color?: 'purple' | 'pink' | 'blue' | 'rainbow';
}

const NeonBorder: React.FC<NeonBorderProps> = ({
  children,
  className,
  active = true,
  pulsate = true,
  color = 'purple',
}) => {
  const [gradientPosition, setGradientPosition] = useState(0);
  
  // Moving gradient effect for rainbow
  useEffect(() => {
    if (!active || color !== 'rainbow' || !pulsate) return;
    
    const intervalId = setInterval(() => {
      setGradientPosition(prev => (prev + 1) % 360);
    }, 50);
    
    return () => clearInterval(intervalId);
  }, [active, color, pulsate]);
  
  const getBorderColor = () => {
    switch (color) {
      case 'purple': return 'border-neon-purple';
      case 'pink': return 'border-neon-pink';
      case 'blue': return 'border-neon-blue';
      case 'rainbow': return 'border-transparent';
      default: return 'border-neon-purple';
    }
  };
  
  const getShadowColor = () => {
    switch (color) {
      case 'purple': return 'shadow-[0_0_15px_rgba(155,135,245,0.5)]';
      case 'pink': return 'shadow-[0_0_15px_rgba(217,70,239,0.5)]';
      case 'blue': return 'shadow-[0_0_15px_rgba(14,165,233,0.5)]';
      case 'rainbow': return 'shadow-[0_0_25px_rgba(155,135,245,0.3)]';
      default: return 'shadow-[0_0_15px_rgba(155,135,245,0.5)]';
    }
  };
  
  return (
    <div 
      className={cn(
        "border relative rounded-md overflow-hidden",
        active && "transition-all",
        active && getBorderColor(),
        active && pulsate && (color !== 'rainbow' ? "animate-border-glow" : ""),
        active && getShadowColor(),
        className
      )}
      style={
        color === 'rainbow' && active
          ? {
              background: 'transparent',
              backgroundClip: 'padding-box',
              border: '1px solid transparent',
              position: 'relative',
            }
          : {}
      }
    >
      {color === 'rainbow' && active && (
        <div 
          className="absolute inset-0 -z-10 rounded-md"
          style={{
            background: `linear-gradient(${gradientPosition}deg, #9b87f5, #D946EF, #0EA5E9, #9b87f5)`,
            backgroundSize: '300% 300%',
            margin: '-1px',
          }}
        />
      )}
      {children}
    </div>
  );
};

export default NeonBorder;
