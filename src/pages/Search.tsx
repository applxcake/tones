
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { searchVideos, YouTubeVideo } from '@/services/youtubeService';
import { searchUsers } from '@/services/userService';
import SearchBar from '@/components/SearchBar';
import SongTile from '@/components/SongTile';
import UserCard from '@/components/UserCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

const Search = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('songs');
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [searchResults, setSearchResults] = useState<YouTubeVideo[]>([]);
  const [userResults, setUserResults] = useState<any[]>([]);

  // Get search query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) {
      setSearchQuery(q);
    }
  }, [location.search]);

  // Search for videos with proper React Query V5 format
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['searchVideos', searchQuery],
    queryFn: () => searchVideos(searchQuery),
    enabled: searchQuery.length > 0 && activeTab === 'songs',
    meta: {
      onError: () => {
        toast.error("Error fetching search results. Using available content instead.");
      }
    }
  });

  // Update results when data changes
  useEffect(() => {
    if (data) {
      setSearchResults(data.items);
      setNextPageToken(data.nextPageToken);
    }
  }, [data]);

  // Search for users when tab is 'users'
  useEffect(() => {
    if (searchQuery && activeTab === 'users') {
      const fetchUsers = async () => {
        try {
          const results = await searchUsers(searchQuery);
          setUserResults(results);
        } catch (error) {
          console.error("Error searching users:", error);
          toast.error("Couldn't load user search results.");
          setUserResults([]);
        }
      };
      fetchUsers();
    }
  }, [searchQuery, activeTab]);

  // Handle search submission
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Load more results
  const loadMore = async () => {
    if (nextPageToken) {
      try {
        const nextPage = await searchVideos(searchQuery, nextPageToken);
        setSearchResults((prevResults) => [...prevResults, ...nextPage.items]);
        setNextPageToken(nextPage.nextPageToken);
      } catch (error) {
        console.error("Error loading more results:", error);
        toast.error("Couldn't load additional results.");
      }
    }
  };

  // Change active tab
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Show error state if error occurs and no results
  const showError = error && searchResults.length === 0;

  return (
    <div className="pt-6 pb-24 animate-slide-in">
      <div className="flex flex-col items-center justify-center mb-10">
        <h1 className="text-3xl font-bold mb-6 text-center">Find your favorites</h1>
        <SearchBar onSearch={handleSearch} className="w-full max-w-2xl" />
      </div>

      {searchQuery ? (
        <div>
          <Tabs defaultValue="songs" value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="w-full max-w-md mx-auto mb-8">
              <TabsTrigger value="songs" className="flex-1">Songs</TabsTrigger>
              <TabsTrigger value="users" className="flex-1">Users</TabsTrigger>
            </TabsList>
            
            <TabsContent value="songs">
              <h2 className="text-xl font-semibold mb-4">
                Songs matching "{searchQuery}"
              </h2>

              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="glass-panel rounded-lg overflow-hidden">
                      <Skeleton className="aspect-square w-full skeleton" />
                      <div className="p-3">
                        <Skeleton className="h-4 w-full mb-2 skeleton" style={{animationDelay: `${i * 0.05}s`}} />
                        <Skeleton className="h-3 w-3/4 skeleton" style={{animationDelay: `${i * 0.1}s`}} />
                        
                        {/* Add loading shimmer effect bars */}
                        <div className="flex gap-1 mt-2">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Skeleton 
                              key={j} 
                              className="h-2 w-full skeleton" 
                              style={{ 
                                animationDelay: `${j * 0.1 + i * 0.05}s`,
                                height: `${4 + Math.random() * 4}px`
                              }} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : showError ? (
                <div className="py-12 text-center">
                  <p className="text-gray-400 mb-4">Unable to fetch songs for "{searchQuery}"</p>
                  <Button onClick={() => refetch()} variant="outline" className="hover:neon-glow-purple">
                    Try Again
                  </Button>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-gray-400">No songs found for "{searchQuery}"</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 scroll-snap-container">
                    {searchResults.map((video) => (
                      <div className="scroll-snap-item" key={video.id}>
                        <SongTile song={video} />
                      </div>
                    ))}
                  </div>

                  {nextPageToken && (
                    <div className="mt-8 flex justify-center">
                      <Button 
                        onClick={loadMore} 
                        variant="outline" 
                        className="hover:neon-glow-purple animate-pulse-shadow"
                      >
                        Load More
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="users">
              <h2 className="text-xl font-semibold mb-4">
                Users matching "{searchQuery}"
              </h2>

              {userResults.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-gray-400">No users found for "{searchQuery}"</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {userResults.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="py-12 text-center max-w-md mx-auto">
          <p className="text-gray-400">Search for your favorite music or connect with other users</p>
        </div>
      )}
    </div>
  );
};

export default Search;
