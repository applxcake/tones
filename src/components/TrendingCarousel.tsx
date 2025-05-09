
import React from 'react';
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

interface TrendingCarouselProps {
  title: string;
  songs: YouTubeVideo[];
  className?: string;
}

const TrendingCarousel = ({ title, songs, className }: TrendingCarouselProps) => {
  if (songs.length === 0) return null;

  return (
    <div className={cn("mb-10", className)}>
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="relative">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {songs.map((song) => (
              <CarouselItem key={song.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <div className="p-1">
                  <SongTile song={song} className="w-full h-full" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0 -translate-x-1/2 bg-black/50 hover:bg-black/70 border-neon-purple/30 text-white" />
          <CarouselNext className="right-0 translate-x-1/2 bg-black/50 hover:bg-black/70 border-neon-purple/30 text-white" />
        </Carousel>
      </div>
    </div>
  );
};

export default TrendingCarousel;
