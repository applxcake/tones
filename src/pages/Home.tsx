
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import SectionHeader from '@/components/SectionHeader';
import TileGrid from '@/components/TileGrid';
import EnhancedSongTile from '@/components/EnhancedSongTile';
import MinimalistTile from '@/components/MinimalistTile';
import SearchBar from '@/components/SearchBar';
import { searchYouTubeVideos, getTrendingMusic } from '@/services/youtubeService';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const Home = () => {
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get trending songs
        try {
          const trending = await getTrendingMusic();
          if (trending && trending.length > 0) {
            setTrendingSongs(trending);
          } else {
            setTrendingSongs(getMockTrendingSongs());
          }
        } catch (error) {
          console.error('Error fetching trending songs:', error);
          setTrendingSongs(getMockTrendingSongs());
        }
        
        // Get new releases
        try {
          const releases = await searchYouTubeVideos('new music releases 2025');
          if (releases && releases.length > 0) {
            setNewReleases(releases);
          } else {
            setNewReleases(getMockNewReleases());
          }
        } catch (error) {
          console.error('Error fetching new releases:', error);
          setNewReleases(getMockNewReleases());
        }
      } catch (error) {
        console.error('Error in main fetch routine:', error);
        toast({
          title: "Content loading issue",
          description: "Please check your connection and try again",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const getMockTrendingSongs = () => {
    return [
      {
        id: 'trending1',
        title: 'Top Hit - Currently Trending',
        thumbnailUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        channelTitle: 'Trending Music',
        publishedAt: new Date().toISOString(),
      },
      {
        id: 'trending2',
        title: 'Popular Music Video',
        thumbnailUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop',
        channelTitle: 'Music Channel',
        publishedAt: new Date().toISOString(),
      },
      {
        id: 'trending3',
        title: 'Viral Song of the Week',
        thumbnailUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        channelTitle: 'Viral Hits',
        publishedAt: new Date().toISOString(),
      },
      {
        id: 'trending4',
        title: 'New Release - Hot Track',
        thumbnailUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop',
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
        thumbnailUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        channelTitle: 'Music Now',
        publishedAt: new Date().toISOString(),
      },
      {
        id: 'release2',
        title: 'Fresh Music Video - This Week',
        thumbnailUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop',
        channelTitle: 'New Music Channel',
        publishedAt: new Date().toISOString(),
      },
      {
        id: 'release3',
        title: 'Latest Album Track - Out Now',
        thumbnailUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
        channelTitle: 'Album Releases',
        publishedAt: new Date().toISOString(),
      },
      {
        id: 'release4',
        title: 'New Collaboration - Just Dropped',
        thumbnailUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop',
        channelTitle: 'Collabs Channel',
        publishedAt: new Date().toISOString(),
      },
    ];
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="mb-8">
          <Skeleton className="h-12 w-full max-w-2xl mb-6 bg-zinc-800" />
        </div>
        
        <div className="space-y-6">
          <Skeleton className="h-8 w-48 bg-zinc-800" />
          <TileGrid>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-lg bg-zinc-800" />
                <Skeleton className="h-4 w-full bg-zinc-800" />
                <Skeleton className="h-3 w-3/4 bg-zinc-800" />
              </div>
            ))}
          </TileGrid>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Search Bar */}
      <div className="mb-8">
        <SearchBar onSearch={handleSearch} className="max-w-2xl" />
      </div>
      
      {/* Welcome Message */}
      <div className="mb-12">
        <motion.h1 
          className="text-4xl font-bold text-white mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {getGreeting()}{user?.username && `, ${user.username}`}
        </motion.h1>
        <motion.p 
          className="text-zinc-400 text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          What would you like to listen to?
        </motion.p>
      </div>

      {/* Trending Section */}
      <section>
        <SectionHeader 
          title="Trending Now" 
          subtitle="Popular tracks everyone's listening to"
          showViewAll 
          onViewAll={() => navigate('/explore')}
        />
        <TileGrid columns={5}>
          {trendingSongs.slice(0, 10).map((song, index) => (
            <motion.div
              key={song.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <EnhancedSongTile song={song} showFavoriteButton />
            </motion.div>
          ))}
        </TileGrid>
      </section>

      {/* New Releases Section */}
      <section>
        <SectionHeader 
          title="New Releases" 
          subtitle="Fresh music just for you"
          showViewAll 
          onViewAll={() => navigate('/explore')}
        />
        <TileGrid columns={6}>
          {newReleases.slice(0, 12).map((song, index) => (
            <motion.div
              key={song.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <MinimalistTile
                title={song.title}
                subtitle={song.channelTitle}
                imageUrl={song.thumbnailUrl}
                size="small"
              />
            </motion.div>
          ))}
        </TileGrid>
      </section>
    </motion.div>
  );
};

export default Home;
