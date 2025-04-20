
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTrendingMusic } from '@/services/youtubeService';
import SongTile from '@/components/SongTile';
import ScrollableRow from '@/components/ScrollableRow';
import SearchBar from '@/components/SearchBar';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '@/contexts/PlayerContext';

const Home = () => {
  const navigate = useNavigate();
  const { recentlyPlayed } = usePlayer();

  const { data: trendingMusic, isLoading, isError } = useQuery({
    queryKey: ['trendingMusic'],
    queryFn: getTrendingMusic,
  });

  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="pt-6 pb-24 animate-slide-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Home</h1>
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-xl mb-8 glass-panel neon-border">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,_transparent_25%,_#000_100%)]" />
        
        <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center">
          <div className="mb-6 md:mb-0 md:mr-8 max-w-md">
            <h2 className="text-2xl md:text-4xl font-bold mb-2">Discover New Music</h2>
            <p className="text-gray-300 mb-4">
              Explore the latest trending tracks and discover your next favorite song.
            </p>
            <button 
              className="px-6 py-2 bg-neon-purple rounded-full text-white font-medium neon-glow-purple hover:bg-neon-purple/80 transition-all"
              onClick={() => navigate('/search')}
            >
              Explore Now
            </button>
          </div>
          
          <div className="flex-shrink-0 w-full md:w-64 h-64 relative">
            <div className="absolute inset-0 rounded-lg rotate-12 bg-gradient-to-r from-neon-pink to-neon-blue opacity-70 animate-pulse-glow" />
            <div className="absolute inset-0 rounded-lg rotate-6 bg-gradient-to-r from-neon-purple to-neon-blue opacity-70 animate-pulse-glow" style={{ animationDelay: '0.5s' }} />
            <div className="absolute inset-0 rounded-lg bg-[url('https://source.unsplash.com/random/800x800/?concert')] bg-cover bg-center" />
          </div>
        </div>
      </div>

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <ScrollableRow title="Recently Played">
          {recentlyPlayed.map((song) => (
            <SongTile key={song.id} song={song} className="w-48" />
          ))}
        </ScrollableRow>
      )}

      {/* Trending Music */}
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
          <p className="text-gray-400">There was an error loading the trending music.</p>
        </div>
      ) : trendingMusic && trendingMusic.length > 0 ? (
        <ScrollableRow title="Trending">
          {trendingMusic.map((song) => (
            <SongTile key={song.id} song={song} className="w-48" />
          ))}
        </ScrollableRow>
      ) : null}

      {/* Genres */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Browse by Genre</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {genres.map((genre) => (
            <div 
              key={genre.name} 
              className="relative overflow-hidden rounded-lg aspect-square hover-scale glass-panel cursor-pointer"
              style={{
                background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${genre.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-lg font-bold">{genre.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Sample genre data
const genres = [
  { name: "Pop", image: "https://source.unsplash.com/random/400x400/?pop-music" },
  { name: "Rock", image: "https://source.unsplash.com/random/400x400/?rock-music" },
  { name: "Hip Hop", image: "https://source.unsplash.com/random/400x400/?hiphop" },
  { name: "Electronic", image: "https://source.unsplash.com/random/400x400/?electronic-music" },
  { name: "Jazz", image: "https://source.unsplash.com/random/400x400/?jazz" },
  { name: "Classical", image: "https://source.unsplash.com/random/400x400/?classical-music" },
];

export default Home;
