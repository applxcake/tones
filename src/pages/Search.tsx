
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchVideos, YouTubeVideo } from '@/services/youtubeService';
import { searchUsers } from '@/services/userService';
import SearchBar from '@/components/SearchBar';
import SongTile from '@/components/SongTile';
import UserCard from '@/components/UserCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Search = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('songs');
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [searchResults, setSearchResults] = useState<YouTubeVideo[]>([]);
  const [userResults, setUserResults] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Get search query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) {
      setSearchQuery(q);
    }
  }, [location.search]);

  // Search for videos
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['searchVideos', searchQuery],
    queryFn: () => searchVideos(searchQuery),
    enabled: searchQuery.length > 0 && activeTab === 'songs',
  });

  // Update results when data changes
  useEffect(() => {
    if (data) {
      setSearchResults(data);
      setNextPageToken(undefined); // Reset next page token as Spotify doesn't use it
    }
  }, [data]);

  // Search for users when tab is 'users'
  useEffect(() => {
    const fetchUsers = async () => {
      if (searchQuery && activeTab === 'users') {
        setIsLoadingUsers(true);
        try {
          const results = await searchUsers(searchQuery);
          setUserResults(results);
        } catch (error) {
          console.error('Error searching users:', error);
        } finally {
          setIsLoadingUsers(false);
        }
      }
    };
    
    fetchUsers();
  }, [searchQuery, activeTab]);

  // Handle search submission
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Load more results - this is a placeholder since Spotify doesn't use pagination the same way
  const loadMore = async () => {
    // Placeholder for future pagination implementation
    console.log('Load more requested, but not implemented for Spotify API');
  };

  // Change active tab
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

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
              ) : searchResults.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-gray-400">No songs found for "{searchQuery}"</p>
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
            </TabsContent>
            
            <TabsContent value="users">
              <h2 className="text-xl font-semibold mb-4">
                Users matching "{searchQuery}"
              </h2>

              {isLoadingUsers ? (
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
              ) : userResults.length === 0 ? (
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
