
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from '@/hooks/use-debounce-value';
import { searchVideos } from '@/services/youtubeService';
import { toast } from '@/hooks/use-toast';
import SearchBar from '@/components/SearchBar';
import SongTile from '@/components/SongTile';
import EnhancedSearchFilters, { SearchFilters } from '@/components/EnhancedSearchFilters';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search as SearchIcon, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [hasSearched, setHasSearched] = useState(false);
  
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery && urlQuery !== query) {
      setQuery(urlQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    if (debouncedQuery) {
      handleSearch(debouncedQuery, true);
    }
  }, [debouncedQuery, filters]);

  const buildSearchQuery = (baseQuery: string, searchFilters: SearchFilters) => {
    let enhancedQuery = baseQuery;
    
    if (searchFilters.genre) {
      enhancedQuery += ` ${searchFilters.genre} music`;
    }
    
    if (searchFilters.duration) {
      const durationMap = {
        short: 'short',
        medium: 'medium', 
        long: 'long'
      };
      enhancedQuery += ` ${durationMap[searchFilters.duration]} duration`;
    }
    
    return enhancedQuery;
  };

  const handleSearch = async (searchQuery: string, isNewSearch = false) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setHasSearched(true);
    
    try {
      const enhancedQuery = buildSearchQuery(searchQuery, filters);
      const pageToken = isNewSearch ? undefined : nextPageToken;
      
      const response = await searchVideos(enhancedQuery, pageToken);
      
      if (isNewSearch) {
        setResults(response.items);
        setSearchParams({ q: searchQuery });
      } else {
        setResults(prev => [...prev, ...response.items]);
      }
      
      setNextPageToken(response.nextPageToken);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search for videos. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (nextPageToken && !loading) {
      handleSearch(query, false);
    }
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <SearchBar 
          onSearch={(searchQuery) => {
            setQuery(searchQuery);
            handleSearch(searchQuery, true);
          }}
          placeholder="Search for songs, artists, or albums..."
          defaultValue={query}
        />
        
        <EnhancedSearchFilters 
          onFiltersChange={handleFiltersChange}
          className="w-full"
        />
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <SearchIcon className="h-6 w-6" />
              Search Results
              {query && (
                <span className="text-muted-foreground font-normal">
                  for "{query}"
                </span>
              )}
            </h2>
            {results.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {results.length} results
              </span>
            )}
          </div>

          {loading && results.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-square rounded-lg" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <SearchIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filters
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {results.map((song, index) => (
                  <motion.div
                    key={song.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <SongTile song={song} showFavoriteButton />
                  </motion.div>
                ))}
              </div>
              
              {nextPageToken && (
                <div className="text-center pt-6">
                  <Button 
                    onClick={handleLoadMore}
                    disabled={loading}
                    variant="outline"
                    size="lg"
                  >
                    {loading ? 'Loading...' : 'Load More Results'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {!hasSearched && (
        <div className="text-center py-12">
          <SearchIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Start your search</h3>
          <p className="text-muted-foreground">
            Enter a song, artist, or album name to find music
          </p>
        </div>
      )}
    </div>
  );
};

export default Search;
