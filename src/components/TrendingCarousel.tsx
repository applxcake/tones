
import React, { useState, useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import SongTile from '@/components/SongTile';
import { YouTubeVideo } from '@/services/youtubeService';
import { cn } from '@/lib/utils';
import { Sparkle } from 'lucide-react';

interface TrendingCarouselProps {
  title: string;
  songs: YouTubeVideo[];
  className?: string;
}

const TrendingCarousel = ({ title, songs, className }: TrendingCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [sparkles, setSparkles] = useState<Array<{id: number, x: number, y: number, size: number, delay: number}>>([]);

  // Generate random sparkles when hovering
  useEffect(() => {
    if (isHovering) {
      const newSparkles = Array.from({ length: 5 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 6 + 6,
        delay: Math.random() * 0.5
      }));
      setSparkles(newSparkles);
    }
  }, [isHovering]);
  
  if (songs.length === 0) return null;

  return (
    <div 
      className={cn("mb-10 relative", className)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative">
        <h2 className="text-2xl font-bold mb-6 flex items-center text-gradient animate-fade-in">
          <span>{title}</span>
          <span className="ml-2 relative">
            <Sparkle className="h-5 w-5 text-neon-pink animate-pulse" />
            {/* Floating sparkles on hover */}
            {isHovering && sparkles.map(sparkle => (
              <Sparkle 
                key={sparkle.id}
                className="absolute text-neon-purple opacity-70"
                style={{
                  top: `-${sparkle.y}%`,
                  left: `${sparkle.x}%`,
                  height: `${sparkle.size}px`,
                  width: `${sparkle.size}px`,
                  animation: `float 3s ease-in-out infinite, fade-in 0.5s ease-out forwards`,
                  animationDelay: `${sparkle.delay}s`
                }}
              />
            ))}
          </span>
        </h2>
        
        <div className="relative group">
          {/* Animated gradient backdrop that appears on hover */}
          <div className="absolute inset-0 -m-3 bg-gradient-to-r from-neon-purple/0 via-neon-pink/5 to-neon-blue/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
            onSelect={(index) => {
              // Fix: Properly handle the onSelect callback by using the index parameter
              setActiveIndex(index);
            }}
          >
            <CarouselContent>
              {songs.map((song, index) => (
                <CarouselItem 
                  key={song.id} 
                  className={cn(
                    "md:basis-1/2 lg:basis-1/3 xl:basis-1/4 transition-all duration-500",
                    index === activeIndex && "scale-105 z-10"
                  )}
                >
                  <div 
                    className={cn(
                      "p-1 transition-all duration-300",
                      index === activeIndex ? "opacity-100 scale-100" : "opacity-90 scale-95"
                    )}
                    style={{ 
                      animationDelay: `${index * 0.1}s`,
                      transform: `perspective(1000px) rotateY(${(index - activeIndex) * 5}deg)` 
                    }}
                  >
                    <SongTile 
                      song={song} 
                      className={cn(
                        "w-full h-full transition-all duration-500",
                        index === activeIndex && "shadow-glow animate-pulse-soft"
                      )} 
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Custom navigation arrows with animations */}
            <CarouselPrevious 
              className="left-0 -translate-x-1/2 bg-black/50 hover:bg-black/70 border-neon-purple/30 text-white
                transition-all duration-300 hover:scale-110 hover:border-neon-purple/80 group"
            >
              <span className="absolute inset-0 rounded-full bg-neon-purple/10 scale-0 group-hover:scale-100 group-hover:opacity-0 transition-all duration-700"></span>
            </CarouselPrevious>
            
            <CarouselNext 
              className="right-0 translate-x-1/2 bg-black/50 hover:bg-black/70 border-neon-purple/30 text-white
                transition-all duration-300 hover:scale-110 hover:border-neon-purple/80 group"
            >
              <span className="absolute inset-0 rounded-full bg-neon-purple/10 scale-0 group-hover:scale-100 group-hover:opacity-0 transition-all duration-700"></span>
            </CarouselNext>
          </Carousel>
          
          {/* Progress dots */}
          <div className="flex justify-center mt-4 gap-1.5">
            {songs.slice(0, Math.min(songs.length, 10)).map((_, index) => (
              <div 
                key={index} 
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-300",
                  index === activeIndex % songs.length ? 
                    "bg-neon-purple w-3 shadow-glow" : 
                    "bg-gray-600 hover:bg-gray-400"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingCarousel;
