import { useState, useEffect } from 'react';
import { getAllUsers, searchUsers } from '@/services/userService';
import { getTrendingMusic } from '@/services/youtubeService';
import UserCard from '@/components/UserCard';
import SongTile from '@/components/SongTile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SearchBar from '@/components/SearchBar';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Explore = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [trendingMusic, setTrendingMusic] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const navigate = useNavigate();

  useEffect(() => {
    const loadExploreData = async () => {
      try {
        setLoading(true);
        // Get users
        const usersList = await getAllUsers();
        setUsers(usersList);

        // Get trending music
        const music = await getTrendingMusic();
        setTrendingMusic(music);
      } catch (error) {
        console.error('Failed to load explore data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExploreData();
  }, []);

  useEffect(() => {
    // Search for users when query changes
    const performSearch = async () => {
      if (searchQuery) {
        setLoading(true);
        try {
          const results = await searchUsers(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error('Search failed:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    };

    performSearch();
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  // Determine which users to display based on search
  const displayUsers = searchQuery ? searchResults : users;

  return (
    <div className="pt-6 pb-24 animate-slide-in">
      <div className="flex flex-col items-center justify-center mb-10">
        <h1 className="text-3xl font-bold mb-6 text-center">Explore</h1>
        <SearchBar onSearch={handleSearch} className="w-full max-w-2xl" />
      </div>

      {searchQuery ? (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Search Results for "{searchQuery}"</h2>
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
          ) : displayUsers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayUsers.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center glass-panel">
              <p className="text-gray-400">No users found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      ) : (
        // Only show a minimal message or nothing if not searching
        <div className="text-center text-gray-400 py-12">
          Use the search bar above to find music or users.
        </div>
      )}
    </div>
  );
};

export default Explore;
