
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface MinimalistTileProps {
  title: string;
  subtitle?: string;
  imageUrl: string;
  isPlaying?: boolean;
  onPlay?: () => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const MinimalistTile = ({ 
  title, 
  subtitle, 
  imageUrl, 
  isPlaying, 
  onPlay, 
  className,
  size = 'medium' 
}: MinimalistTileProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const sizeClasses = {
    small: 'w-32 h-32',
    medium: 'w-40 h-40',
    large: 'w-48 h-48'
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group cursor-pointer bg-zinc-900/50 hover:bg-zinc-800/70 rounded-lg p-4 transition-all duration-300",
        "border border-zinc-800/50 hover:border-zinc-700/70 backdrop-blur-sm",
        className
      )}
    >
      {/* Image Container */}
      <div className={cn("relative rounded-md overflow-hidden mb-3", sizeClasses[size])}>
        <img
          src={imageUrl}
          alt={title}
          className={cn(
            "w-full h-full object-cover transition-all duration-300",
            imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105",
            "group-hover:scale-105"
          )}
          onLoad={() => setImageLoaded(true)}
        />
        
        {!imageLoaded && (
          <div className="absolute inset-0 bg-zinc-800 animate-pulse" />
        )}

        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ opacity: 1, scale: 1 }}
            className={cn(
              "w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200",
              "opacity-0 group-hover:opacity-100 hover:scale-110",
              isPlaying && "opacity-100"
            )}
            onClick={onPlay}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-black ml-0" />
            ) : (
              <Play className="w-5 h-5 text-black ml-0.5" />
            )}
          </motion.button>
        </div>

        {/* Now Playing Indicator */}
        {isPlaying && (
          <div className="absolute bottom-2 left-2">
            <div className="flex space-x-1">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-white rounded-full animate-pulse"
                  style={{
                    height: Math.random() * 12 + 4,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Text Content */}
      <div className="space-y-1">
        <h3 className="font-medium text-white text-sm line-clamp-2 group-hover:text-zinc-100 transition-colors">
          {title}
        </h3>
        {subtitle && (
          <p className="text-zinc-400 text-xs line-clamp-1 group-hover:text-zinc-300 transition-colors">
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default MinimalistTile;
