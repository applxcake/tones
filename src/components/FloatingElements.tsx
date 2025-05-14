
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Music, Star, HeartPulse, Zap } from 'lucide-react';

interface FloatingElementsProps {
  className?: string;
  count?: number;
  type?: 'music' | 'stars' | 'mixed';
}

const FloatingElements: React.FC<FloatingElementsProps> = ({
  className,
  count = 10,
  type = 'mixed',
}) => {
  const [elements, setElements] = useState<{
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
    icon: string;
    rotation: number;
  }[]>([]);
  
  useEffect(() => {
    const newElements = Array.from({ length: count }).map((_, i) => {
      let icon = 'music';
      
      if (type === 'stars') {
        icon = 'star';
      } else if (type === 'mixed') {
        icon = ['music', 'star', 'heart', 'zap'][Math.floor(Math.random() * 4)];
      }
      
      return {
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 12 + 8,
        duration: Math.random() * 15 + 10,
        delay: Math.random() * 5,
        icon,
        rotation: (Math.random() - 0.5) * 360,
      };
    });
    
    setElements(newElements);
  }, [count, type]);
  
  const getIcon = (iconName: string, size: number) => {
    const props = { 
      size, 
      className: "opacity-20 text-white" 
    };
    
    switch (iconName) {
      case 'music': return <Music {...props} />;
      case 'star': return <Star {...props} />;
      case 'heart': return <HeartPulse {...props} />;
      case 'zap': return <Zap {...props} />;
      default: return <Music {...props} />;
    }
  };
  
  return (
    <div className={cn("fixed inset-0 overflow-hidden pointer-events-none z-0", className)}>
      {elements.map((element) => (
        <motion.div
          key={element.id}
          className="absolute"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
          }}
          initial={{ 
            y: 100, 
            opacity: 0,
            rotate: element.rotation
          }}
          animate={{
            y: -500,
            opacity: [0, 0.7, 0],
            rotate: element.rotation + 360,
          }}
          transition={{
            duration: element.duration,
            repeat: Infinity,
            delay: element.delay,
            ease: "linear"
          }}
        >
          {getIcon(element.icon, element.size)}
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingElements;
