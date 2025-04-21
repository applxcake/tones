
import React, { useState } from 'react';
import { Music } from 'lucide-react';
import { searchYouTubeVideos, YouTubeVideo } from '@/services/youtubeService';
import SongTile from '@/components/SongTile';

interface Genre {
  id: string;
  name: string;
  color: string;
}

const genres: Genre[] = [
  { id: 'rock', name: 'Rock', color: 'from-red-500 to-orange-500' },
  { id: 'pop', name: 'Pop', color: 'from-pink-500 to-purple-500' },
  { id: 'hiphop', name: 'Hip Hop', color: 'from-blue-500 to-cyan-500' },
  { id: 'jazz', name: 'Jazz', color: 'from-amber-500 to-yellow-500' },
  { id: 'classical', name: 'Classical', color: 'from-green-500 to-emerald-500' },
  { id: 'electronic', name: 'Electronic', color: 'from-violet-500 to-fuchsia-500' },
  { id: 'country', name: 'Country', color: 'from-orange-500 to-amber-500' },
  { id: 'rnb', name: 'R&B', color: 'from-purple-500 to-indigo-500' }
];

const GenreExplorer = () => {
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [genreSongs, setGenreSongs] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenreClick = async (genre: Genre) => {
    setLoading(true);
    setSelectedGenre(genre);
    
    try {
      const results = await searchYouTubeVideos(`best ${genre.name} music`);
      setGenreSongs(results.slice(0, 10)); // Take the first 10 songs
    } catch (error) {
      console.error('Error fetching genre songs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold mb-6">Browse by Genre</h2>
      
      {!selectedGenre ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {genres.map((genre) => (
            <div
              key={genre.id}
              className={`bg-gradient-to-br ${genre.color} rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover-scale transition-all h-32 animate-scale-in`}
              onClick={() => handleGenreClick(genre)}
            >
              <Music className="h-8 w-8 mb-2" />
              <h3 className="text-lg font-semibold text-white">{genre.name}</h3>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">
              Top <span className={`text-gradient-${selectedGenre.id}`}>{selectedGenre.name}</span> Songs
            </h3>
            <button 
              className="text-sm text-gray-400 hover:text-white"
              onClick={() => setSelectedGenre(null)}
            >
              ← Back to Genres
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
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
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-fade-in">
              {genreSongs.map((song) => (
                <SongTile key={song.id} song={song} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GenreExplorer;
