
import React from 'react';
import { cn } from '@/lib/utils';

interface PulseDotProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'purple' | 'pink' | 'blue';
}

const PulseDot: React.FC<PulseDotProps> = ({
  className,
  size = 'md',
  color = 'purple',
}) => {
  const sizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2.5 h-2.5', 
    lg: 'w-3.5 h-3.5',
  };
  
  const colorClasses = {
    purple: 'bg-neon-purple',
    pink: 'bg-neon-pink',
    blue: 'bg-neon-blue',
  };
  
  return (
    <span className={cn("relative flex", className)}>
      <span className={cn(
        "animate-ping-slower absolute inline-flex h-full w-full rounded-full opacity-75",
        colorClasses[color]
      )}></span>
      <span className={cn(
        "relative inline-flex rounded-full",
        sizeClasses[size],
        colorClasses[color]
      )}></span>
    </span>
  );
};

export default PulseDot;
