
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedBackgroundProps {
  className?: string;
  density?: number;
  speed?: 'slow' | 'medium' | 'fast';
  colorScheme?: 'purple' | 'blue' | 'rainbow';
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  className,
  density = 15,
  speed = 'medium',
  colorScheme = 'purple',
}) => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; delay: number; color: string }[]>([]);
  
  // Define speed values in seconds
  const speedValues = {
    slow: 25,
    medium: 18,
    fast: 12,
  };
  
  // Define color schemes
  const colorSchemes = {
    purple: ['rgba(155, 135, 245, 0.4)', 'rgba(217, 70, 239, 0.4)'],
    blue: ['rgba(14, 165, 233, 0.4)', 'rgba(99, 102, 241, 0.4)'],
    rainbow: ['rgba(155, 135, 245, 0.3)', 'rgba(217, 70, 239, 0.3)', 'rgba(14, 165, 233, 0.3)', 'rgba(236, 72, 153, 0.3)'],
  };
  
  useEffect(() => {
    const selectedColors = colorSchemes[colorScheme];
    
    // Generate random particles
    const newParticles = Array.from({ length: density }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 150 + 50,
      delay: Math.random() * 5,
      color: selectedColors[Math.floor(Math.random() * selectedColors.length)],
    }));
    
    setParticles(newParticles);
  }, [density, colorScheme]);
  
  return (
    <div className={cn("fixed inset-0 overflow-hidden pointer-events-none z-0", className)}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full blur-xl"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            width: particle.size,
            height: particle.size,
          }}
          initial={{ opacity: 0.1, scale: 0.8 }}
          animate={{
            x: [0, 50, -30, 20, 0],
            y: [0, -30, 50, -20, 0],
            opacity: [0.3, 0.5, 0.3, 0.6, 0.3],
            scale: [0.8, 1.2, 0.9, 1.1, 0.8],
          }}
          transition={{
            duration: speedValues[speed],
            ease: "easeInOut",
            repeat: Infinity,
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground;
