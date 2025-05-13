
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ScrollableRow from '@/components/ScrollableRow';
import SongTile from '@/components/SongTile';
import UserCard from '@/components/UserCard';
import { searchYouTubeVideos, getTrendingMusic } from '@/services/youtubeService';
import { getAllUsers } from '@/services/userService';
import GenreExplorer from '@/components/GenreExplorer';
import SearchBar from '@/components/SearchBar';
import TrendingCarousel from '@/components/TrendingCarousel';
import { Sparkle } from 'lucide-react';

const Home = () => {
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Use getTrendingMusic instead of searchYouTubeVideos for trending songs
        // This will automatically return mock data if API fails
        const trending = await getTrendingMusic();
        setTrendingSongs(trending);
        
        // Fetch new releases
        const releases = await searchYouTubeVideos('new music releases');
        setNewReleases(releases);
        
        // Fetch recommended users
        const users = await getAllUsers();
        setRecommendedUsers(users);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Show toast notification
        toast.error("Couldn't fetch all music data. Using available content instead.");
        
        // Ensure we have some data even if the API fails
        if (trendingSongs.length === 0) {
          setTrendingSongs(getMockTrendingSongs());
        }
        if (newReleases.length === 0) {
          setNewReleases(getMockNewReleases());
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  // Mock data to use when API fails
  const getMockTrendingSongs = () => {
    return [
      {
        id: 'trending1',
        title: 'Top Hit - Currently Trending',
        thumbnailUrl: 'https://i.pravatar.cc/300?img=10',
        channelTitle: 'Trending Music',
        publishedAt: new Date().toISOString(),
      },
      {
        id: 'trending2',
        title: 'Popular Music Video',
        thumbnailUrl: 'https://i.pravatar.cc/300?img=11',
        channelTitle: 'Music Channel',
        publishedAt: new Date().toISOString(),
      },
      {
        id: 'trending3',
        title: 'Viral Song of the Week',
        thumbnailUrl: 'https://i.pravatar.cc/300?img=12',
        channelTitle: 'Viral Hits',
        publishedAt: new Date().toISOString(),
      },
      {
        id: 'trending4',
        title: 'New Release - Hot Track',
        thumbnailUrl: 'https://i.pravatar.cc/300?img=13',
        channelTitle: 'New Releases',
        publishedAt: new Date().toISOString(),
      },
    ];
  };

  const getMockNewReleases = () => {
    return [
      {
        id: 'release1',
        title: 'Brand New Single - Just Released',
        thumbnailUrl: 'https://i.pravatar.cc/300?img=20',
        channelTitle: 'Music Now',
        publishedAt: new Date().toISOString(),
      },
      {
        id: 'release2',
        title: 'Fresh Music Video - This Week',
        thumbnailUrl: 'https://i.pravatar.cc/300?img=21',
        channelTitle: 'New Music Channel',
        publishedAt: new Date().toISOString(),
      },
      {
        id: 'release3',
        title: 'Latest Album Track - Out Now',
        thumbnailUrl: 'https://i.pravatar.cc/300?img=22',
        channelTitle: 'Album Releases',
        publishedAt: new Date().toISOString(),
      },
      {
        id: 'release4',
        title: 'New Collaboration - Just Dropped',
        thumbnailUrl: 'https://i.pravatar.cc/300?img=23',
        channelTitle: 'Collabs Channel',
        publishedAt: new Date().toISOString(),
      },
    ];
  };

  if (loading) {
    return (
      <div className="pt-6 pb-24 animate-slide-in">
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
      </div>
    );
  }

  return (
    <div className="pt-6 pb-24">
      <div className="mb-8 animate-fade-in">
        <SearchBar onSearch={handleSearch} className="mb-8" />
        <h1 className="text-3xl font-bold flex items-center">
          Welcome to Tones 
          <Sparkle className="h-6 w-6 ml-2 text-neon-purple animate-pulse" />
        </h1>
        
        {/* Graphic design under welcome message */}
        <div className="mt-4 mb-8 rounded-lg overflow-hidden glass-panel relative">
          <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/30 to-neon-pink/30 z-0"></div>
          <div className="relative z-10 p-6 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0 md:w-1/2">
              <h2 className="text-2xl font-bold mb-2">Discover Your Sound</h2>
              <p className="text-gray-300 mb-4">
                Explore trending tracks, create custom playlists, and find your perfect musical rhythm.
              </p>
              <div className="flex gap-3">
                <div className="h-1 w-12 bg-neon-purple rounded-full animate-pulse"></div>
                <div className="h-1 w-8 bg-neon-blue rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="h-1 w-16 bg-neon-pink rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center hover-scale"
                    style={{ 
                      animationDelay: `${i * 0.1}s`,
                      boxShadow: i % 3 === 0 ? '0 0 8px rgba(138, 43, 226, 0.6)' : 
                                i % 3 === 1 ? '0 0 8px rgba(0, 191, 255, 0.6)' : 
                                             '0 0 8px rgba(255, 0, 128, 0.6)'
                    }}
                  >
                    <div 
                      className={`w-2 h-2 rounded-full ${
                        i % 3 === 0 ? 'bg-neon-purple' : 
                        i % 3 === 1 ? 'bg-neon-blue' : 
                                     'bg-neon-pink'
                      } animate-pulse`}
                      style={{ animationDelay: `${i * 0.15}s` }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-neon-purple via-neon-blue to-neon-pink"></div>
        </div>
      </div>
      
      <section className="mb-10 animate-slide-in">
        <TrendingCarousel title="Trending Now" songs={trendingSongs} />
      </section>
      
      <section className="mb-10 animate-slide-in">
        <h2 className="text-2xl font-bold mb-6">New Releases</h2>
        <ScrollableRow title="New Releases">
          {newReleases.map((song) => (
            <SongTile key={song.id} song={song} className="min-w-[200px] max-w-[200px]" />
          ))}
        </ScrollableRow>
      </section>
      
      {recommendedUsers.length > 0 && (
        <section className="mb-10 animate-slide-in">
          <h2 className="text-2xl font-bold mb-6">People to Follow</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedUsers.slice(0, 6).map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        </section>
      )}
      
      <section className="mb-10">
        <GenreExplorer />
      </section>
    </div>
  );
};

export default Home;
