
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTrendingMusicByGenre } from '@/services/youtubeService';
import SongTile from '@/components/SongTile';
import { Link } from 'react-router-dom';

const GenreExplore = () => {
  const { genre } = useParams();
  const decodedGenre = genre ? decodeURIComponent(genre) : '';
  
  const { data: songs, isLoading, isError } = useQuery({
    queryKey: ['genre', decodedGenre],
    queryFn: () => getTrendingMusicByGenre(decodedGenre),
  });

  // Generate a gradient based on genre name
  const getGenreGradient = (genreName: string) => {
    const gradients = {
      'Pop': 'bg-gradient-to-r from-neon-pink to-neon-purple',
      'Rock': 'bg-gradient-to-r from-red-600 to-orange-400',
      'Hip Hop': 'bg-gradient-to-r from-amber-500 to-pink-500',
      'Electronic': 'bg-gradient-to-r from-neon-blue to-teal-400',
      'Jazz': 'bg-gradient-to-r from-amber-600 to-amber-900',
      'Classical': 'bg-gradient-to-r from-slate-300 to-slate-500',
      // Default gradient
      'default': 'bg-gradient-to-r from-neon-blue to-neon-purple'
    };
    
    return gradients[genreName as keyof typeof gradients] || gradients.default;
  };

  return (
    <div className="pt-6 pb-24 animate-fade-in">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{decodedGenre} Music</h1>
      </div>

      {/* Hero Banner */}
      <div className={`relative overflow-hidden rounded-xl mb-8 glass-panel neon-border`}>
        <div className={`absolute inset-0 ${getGenreGradient(decodedGenre)} opacity-20`} />
        <div className="absolute inset-0 bg-[radial-gradient(circle,_transparent_25%,_#000_100%)]" />
        
        <div className="relative p-8 md:p-12 flex flex-col">
          <h2 className="text-2xl md:text-4xl font-bold mb-2">Explore {decodedGenre} Tracks</h2>
          <p className="text-gray-300 mb-4 max-w-lg">
            Discover the best {decodedGenre} music trending right now. 
            From chart-toppers to hidden gems, find your next favorite {decodedGenre} track.
          </p>
        </div>
      </div>
      
      {/* Songs Grid */}
      <div className="mt-8">
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div 
                  key={i}
                  className="w-2 h-2 bg-neon-purple rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        ) : isError ? (
          <div className="py-12 text-center">
            <p className="text-gray-400">There was an error loading the {decodedGenre} music.</p>
          </div>
        ) : songs && songs.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {songs.map((song) => (
              <SongTile key={song.id} song={song} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-400">No {decodedGenre} music found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenreExplore;
