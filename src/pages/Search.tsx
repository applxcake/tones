
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchVideos, YouTubeVideo } from '@/services/youtubeService';
import SearchBar from '@/components/SearchBar';
import SongTile from '@/components/SongTile';
import { Button } from '@/components/ui/button';

const Search = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [searchResults, setSearchResults] = useState<YouTubeVideo[]>([]);

  // Get search query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) {
      setSearchQuery(q);
    }
  }, [location.search]);

  // Search for videos
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['searchVideos', searchQuery],
    queryFn: () => searchVideos(searchQuery),
    enabled: searchQuery.length > 0,
  });

  // Update results when data changes
  useEffect(() => {
    if (data) {
      setSearchResults(data.items);
      setNextPageToken(data.nextPageToken);
    }
  }, [data]);

  // Handle search submission
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Load more results
  const loadMore = async () => {
    if (nextPageToken) {
      const nextPage = await searchVideos(searchQuery, nextPageToken);
      setSearchResults((prevResults) => [...prevResults, ...nextPage.items]);
      setNextPageToken(nextPage.nextPageToken);
    }
  };

  return (
    <div className="pt-6 pb-24 animate-slide-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Search</h1>
        <SearchBar onSearch={handleSearch} className="w-full md:w-auto" />
      </div>

      {searchQuery ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Results for "{searchQuery}"
          </h2>

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
              <p className="text-gray-400">An error occurred while searching. Please try again.</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-400">No results found for "{searchQuery}"</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {searchResults.map((video) => (
                  <SongTile key={video.id} song={video} />
                ))}
              </div>

              {nextPageToken && (
                <div className="mt-8 flex justify-center">
                  <Button 
                    onClick={loadMore} 
                    variant="outline" 
                    className="hover:neon-glow-purple"
                  >
                    Load More
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-gray-400">Search for your favorite music</p>
        </div>
      )}
    </div>
  );
};

export default Search;
