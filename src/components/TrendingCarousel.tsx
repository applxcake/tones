import React, { useState, useEffect, useRef } from 'react';
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
import { Sparkle, Music } from 'lucide-react';
import { type CarouselApi } from "@/components/ui/carousel";
import { useInView } from '@/hooks/useInView';

interface TrendingCarouselProps {
  title: string;
  songs: YouTubeVideo[];
  className?: string;
}

// Removed the duplicate local useInView hook - we'll use the imported one

const TrendingCarousel = ({ title, songs, className }: TrendingCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [sparkles, setSparkles] = useState<Array<{id: number, x: number, y: number, size: number, delay: number}>>([]);
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [isClicked, setIsClicked] = useState(false);
  
  // Animation for scroll-in effect - use the imported hook
  const [containerRef, isContainerInView] = useInView({ threshold: 0.2 });
  const [titleRef, isTitleInView] = useInView({ threshold: 0.5 });
  
  // Set up carousel API and listen for index changes
  useEffect(() => {
    if (!api) return;
    
    const onSelect = () => {
      setActiveIndex(api.selectedScrollSnap());
    };
    
    api.on("select", onSelect);
    
    // Initial position
    onSelect();
    
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

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
  
  // Click animation effect
  const handleClickAnimation = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 500);
  };
  
  if (songs.length === 0) return null;

  return (
    <div 
      className={cn(
        "mb-10 relative transform transition-all duration-700",
        isContainerInView ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0",
        className
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleClickAnimation}
      ref={containerRef as React.RefObject<HTMLDivElement>}
    >
      <div className={cn(
        "relative transform transition-all duration-500 delay-100", 
        isClicked && "scale-[0.98]"
      )}>
        <h2 
          className={cn(
            "text-2xl font-bold mb-6 flex items-center text-gradient",
            isTitleInView ? "animate-fade-in" : "opacity-0"
          )}
          ref={titleRef as React.RefObject<HTMLHeadingElement>}
        >
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
          
          {/* New animations - floating music notes */}
          {isTitleInView && (
            <span className="ml-auto relative">
              {Array.from({ length: 3 }).map((_, i) => (
                <Music 
                  key={`music-${i}`}
                  className="absolute text-neon-blue opacity-60"
                  style={{
                    top: `-${20 + i * 15}px`,
                    right: `${i * 20}px`,
                    height: `${10 + i * 2}px`,
                    width: `${10 + i * 2}px`,
                    animation: `floatUpwards 4s ease-in-out infinite, fade-in 0.5s ease-out forwards`,
                    animationDelay: `${i * 0.7}s`
                  }}
                />
              ))}
            </span>
          )}
        </h2>
        
        <div className="relative group">
          {/* Enhanced animated gradient backdrop with parallax effect */}
          <div className={cn(
            "absolute inset-0 -m-3 bg-gradient-to-r from-neon-purple/10 via-neon-pink/15 to-neon-blue/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700",
            isContainerInView && "animate-pulse-soft"
          )}></div>
          
          {/* Secondary glow effect that appears on hover */}
          <div className="absolute inset-0 -m-3 bg-gradient-to-tr from-neon-blue/5 via-transparent to-neon-purple/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 delay-200"></div>
          
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
            setApi={setApi}
          >
            <CarouselContent>
              {songs.map((song, index) => {
                // Calculate scroll-based animations
                const isVisible = Math.abs(index - activeIndex) <= 3;
                const distance = Math.abs(index - activeIndex);
                const delay = distance * 0.05;
                
                return (
                  <CarouselItem 
                    key={song.id} 
                    className={cn(
                      "md:basis-1/2 lg:basis-1/3 xl:basis-1/4 transition-all duration-500",
                      index === activeIndex && "scale-105 z-10",
                      !isVisible && "opacity-0"
                    )}
                  >
                    <div 
                      className={cn(
                        "p-1 transition-all duration-500",
                        index === activeIndex ? "opacity-100 scale-100" : "opacity-90 scale-95",
                        isContainerInView ? "translate-y-0 animate-fade-in" : "translate-y-10"
                      )}
                      style={{ 
                        animationDelay: `${0.1 + index * 0.1}s`,
                        transform: `perspective(1000px) rotateY(${(index - activeIndex) * 5}deg)`,
                        transitionDelay: `${delay}s`
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
                );
              })}
            </CarouselContent>
            
            {/* Custom navigation arrows with enhanced animations */}
            <CarouselPrevious 
              className="left-0 -translate-x-1/2 bg-black/50 hover:bg-black/70 border-neon-purple/30 text-white
                transition-all duration-300 hover:scale-120 hover:border-neon-purple/80 group"
            >
              <span className="absolute inset-0 rounded-full bg-neon-purple/20 scale-0 group-hover:scale-150 group-hover:opacity-0 transition-all duration-700"></span>
              <span className="absolute inset-0 rounded-full bg-neon-blue/10 scale-0 group-hover:scale-100 group-hover:opacity-0 transition-all duration-500 delay-100"></span>
            </CarouselPrevious>
            
            <CarouselNext 
              className="right-0 translate-x-1/2 bg-black/50 hover:bg-black/70 border-neon-purple/30 text-white
                transition-all duration-300 hover:scale-120 hover:border-neon-purple/80 group"
            >
              <span className="absolute inset-0 rounded-full bg-neon-purple/20 scale-0 group-hover:scale-150 group-hover:opacity-0 transition-all duration-700"></span>
              <span className="absolute inset-0 rounded-full bg-neon-blue/10 scale-0 group-hover:scale-100 group-hover:opacity-0 transition-all duration-500 delay-100"></span>
            </CarouselNext>
          </Carousel>
          
          {/* Progress dots with enhanced animations */}
          <div className="flex justify-center mt-4 gap-1.5">
            {songs.slice(0, Math.min(songs.length, 10)).map((_, index) => (
              <div 
                key={index} 
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-500",
                  index === activeIndex % songs.length ? 
                    "bg-neon-purple w-6 shadow-glow" : 
                    "bg-gray-600 hover:bg-gray-400 group-hover:animate-pulse-soft"
                )}
                style={{
                  transform: index === activeIndex % songs.length ? "scale(1.2)" : "scale(1)",
                  transition: "all 0.3s ease",
                  transitionDelay: `${index * 0.03}s`
                }}
              />
            ))}
          </div>
          
          {/* New feature: Animated ripple effect on container click */}
          {isClicked && (
            <div className="absolute inset-0 pointer-events-none">
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-neon-purple/30 rounded-full animate-ripple"></span>
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-neon-pink/20 rounded-full animate-ripple" style={{ animationDelay: "0.2s" }}></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrendingCarousel;
