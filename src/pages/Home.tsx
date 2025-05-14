import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import ScrollableRow from '@/components/ScrollableRow';
import SongTile from '@/components/SongTile';
import UserCard from '@/components/UserCard';
import { searchYouTubeVideos, getTrendingMusic } from '@/services/youtubeService';
import { getAllUsers } from '@/services/userService';
import GenreExplorer from '@/components/GenreExplorer';
import SearchBar from '@/components/SearchBar';
import TrendingCarousel from '@/components/TrendingCarousel';
import { Sparkle, Music, Volume2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import VisualVolumePeaks from '@/components/VisualVolumePeaks';
import { motion } from 'framer-motion';

const Home = () => {
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBackground, setActiveBackground] = useState(0);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(true);
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // Background animation cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBackground((prev) => (prev + 1) % 5);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // After initial animations, hide welcome animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcomeAnimation(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // First get trending songs (most important data)
        try {
          const trending = await getTrendingMusic();
          if (trending && trending.length > 0) {
            setTrendingSongs(trending);
            console.log("Successfully loaded trending songs:", trending.length);
          } else {
            throw new Error("No trending songs returned");
          }
        } catch (trendingError) {
          console.error('Error fetching trending songs:', trendingError);
          toast({
            title: "Couldn't load trending music",
            description: "Using backup content instead",
            variant: "destructive",
          });
          setTrendingSongs(getMockTrendingSongs());
        }
        
        // Then try to get new releases
        try {
          const releases = await searchYouTubeVideos('new music releases 2025');
          if (releases && releases.length > 0) {
            setNewReleases(releases);
            console.log("Successfully loaded new releases:", releases.length);
          } else {
            throw new Error("No new releases returned");
          }
        } catch (releaseError) {
          console.error('Error fetching new releases:', releaseError);
          toast({
            title: "Couldn't load new releases",
            description: "Using backup content instead",
            variant: "destructive",
          });
          setNewReleases(getMockNewReleases());
        }
        
        // Finally try to get users (less critical)
        try {
          const users = await getAllUsers();
          setRecommendedUsers(users);
        } catch (userError) {
          console.error('Error fetching users:', userError);
          // No toast for users as it's less critical
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

  // Animated background patterns
  const backgroundPatterns = [
    "radial-gradient(circle at 10% 20%, rgba(155, 135, 245, 0.2) 0%, rgba(0, 0, 0, 0) 80%)",
    "radial-gradient(circle at 90% 50%, rgba(217, 70, 239, 0.2) 0%, rgba(0, 0, 0, 0) 70%)",
    "radial-gradient(circle at 50% 80%, rgba(14, 165, 233, 0.2) 0%, rgba(0, 0, 0, 0) 60%)",
    "radial-gradient(circle at 80% 10%, rgba(155, 135, 245, 0.15) 0%, rgba(0, 0, 0, 0) 50%)",
    "radial-gradient(circle at 20% 70%, rgba(217, 70, 239, 0.15) 0%, rgba(0, 0, 0, 0) 60%)",
  ];

  // Animation variants for welcome message
  const welcomeVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: -50,
      transition: {
        duration: 0.5,
        ease: "easeIn"
      }
    }
  };

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2,
        delay: showWelcomeAnimation ? 2.5 : 0
      }
    }
  };

  // Item animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  // Floating music notes animation
  const FloatingMusicNotes = () => {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <div 
            key={i}
            className="absolute text-neon-purple/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 20 + 10}px`,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          >
            {Math.random() > 0.5 ? '♪' : '♫'}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="pt-6 pb-24 animate-slide-in relative">
        {/* Animated loading background */}
        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 to-neon-blue/5 animate-pulse-slow"></div>
        
        {/* Floating music notes in the background */}
        <FloatingMusicNotes />
        
        {/* Loading skeleton with pulsing effect */}
        <div className="mb-8 relative z-10">
          <Skeleton className="h-10 w-full max-w-md mb-6 animate-pulse-glow" />
          <Skeleton className="h-20 w-full mb-8 rounded-lg animate-pulse-glow" 
            style={{ animationDelay: "0.2s" }} />
        </div>
        
        {/* Loading skeleton for trending carousel */}
        <div className="mb-10 relative z-10">
          <Skeleton className="h-6 w-48 mb-4 animate-pulse-glow" 
            style={{ animationDelay: "0.3s" }} />
          <div className="flex overflow-hidden gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton 
                key={i} 
                className="h-40 w-64 rounded-lg flex-shrink-0 animate-pulse-glow" 
                style={{ animationDelay: `${0.4 + i * 0.1}s` }} 
              />
            ))}
          </div>
        </div>
        
        {/* Loading skeleton for new releases */}
        <div className="mb-10 relative z-10">
          <Skeleton className="h-6 w-48 mb-4 animate-pulse-glow"
            style={{ animationDelay: "0.9s" }} />
          <div className="flex overflow-hidden gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton 
                key={i} 
                className="h-40 w-40 rounded-lg flex-shrink-0 animate-pulse-glow" 
                style={{ animationDelay: `${1.0 + i * 0.1}s` }} 
              />
            ))}
          </div>
        </div>
        
        {/* Visual volume peaks during loading */}
        <VisualVolumePeaks position="center" barCount={10} className="opacity-50" />
      </div>
    );
  }

  return (
    <motion.div 
      className="pt-6 pb-24 relative overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      ref={containerRef}
    >
      {/* Animated background patterns */}
      {backgroundPatterns.map((pattern, index) => (
        <div 
          key={index}
          className="absolute inset-0 transition-opacity duration-2000"
          style={{ 
            background: pattern,
            opacity: activeBackground === index ? 0.5 : 0,
          }}
        />
      ))}
      
      {/* Floating music notes in the background */}
      <FloatingMusicNotes />
      
      {/* Welcome animation overlay */}
      {showWelcomeAnimation && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={welcomeVariants}
        >
          <div className="text-center">
            <motion.div 
              className="text-5xl font-bold mb-4 text-neon-purple"
              animate={{ 
                scale: [1, 1.2, 1],
                textShadow: [
                  "0 0 10px rgba(155, 135, 245, 0.5)",
                  "0 0 20px rgba(155, 135, 245, 0.8)",
                  "0 0 10px rgba(155, 135, 245, 0.5)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-neon-purple">T</span>
              <span className="text-neon-pink">o</span>
              <span className="text-neon-blue">n</span>
              <span className="text-neon-purple">e</span>
              <span className="text-neon-pink">s</span>
            </motion.div>
            <motion.p 
              className="text-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              Your musical journey begins...
            </motion.p>
            <motion.div className="mt-4 flex justify-center gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <motion.div 
                  key={i}
                  className="h-2 w-2 rounded-full bg-neon-purple"
                  animate={{
                    y: [0, -10, 0],
                    backgroundColor: [
                      "rgb(155, 135, 245)", // neon-purple
                      "rgb(217, 70, 239)",  // neon-pink
                      "rgb(14, 165, 233)",  // neon-blue
                      "rgb(155, 135, 245)"  // neon-purple
                    ]
                  }}
                  transition={{ 
                    duration: 1,
                    repeat: Infinity, 
                    delay: i * 0.15,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}

      <div className="mb-8">
        <motion.div variants={itemVariants}>
          <SearchBar onSearch={handleSearch} className="mb-8" />
        </motion.div>
        
        <motion.h1 
          className="text-3xl font-bold flex items-center"
          variants={itemVariants}
        >
          Welcome to Tones 
          <Sparkle className="h-6 w-6 ml-2 text-neon-purple animate-pulse" />
        </motion.h1>
        
        {/* Enhanced graphic design under welcome message */}
        <motion.div 
          className="mt-4 mb-8 rounded-lg overflow-hidden glass-panel relative"
          variants={itemVariants}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/30 to-neon-pink/30 z-0"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/10 to-transparent bg-opacity-30 z-0 animate-pulse-slow"></div>
          
          <div className="relative z-10 p-6 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0 md:w-1/2">
              <h2 className="text-2xl font-bold mb-2">Discover Your Sound</h2>
              <p className="text-gray-300 mb-4">
                Explore trending tracks, create custom playlists, and find your perfect musical rhythm.
              </p>
              <div className="flex gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <motion.div 
                    key={i}
                    className={`h-1 rounded-full ${
                      i === 0 ? "bg-neon-purple w-12" : 
                      i === 1 ? "bg-neon-blue w-8" : 
                      "bg-neon-pink w-16"
                    }`}
                    animate={{ scaleX: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      delay: i * 0.3,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <motion.div 
                className="grid grid-cols-3 gap-2"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              >
                {Array.from({ length: 9 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-8 h-8 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center hover-scale"
                    whileHover={{ scale: 1.2, boxShadow: "0 0 15px rgba(155, 135, 245, 0.8)" }}
                    style={{ 
                      boxShadow: i % 3 === 0 ? '0 0 8px rgba(138, 43, 226, 0.6)' : 
                                i % 3 === 1 ? '0 0 8px rgba(0, 191, 255, 0.6)' : 
                                             '0 0 8px rgba(255, 0, 128, 0.6)'
                    }}
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 3,
                      delay: i * 0.2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <motion.div 
                      className={`w-2 h-2 rounded-full ${
                        i % 3 === 0 ? 'bg-neon-purple' : 
                        i % 3 === 1 ? 'bg-neon-blue' : 
                                     'bg-neon-pink'
                      }`}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{
                        duration: 2,
                        delay: i * 0.3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-neon-purple via-neon-blue to-neon-pink"></div>
          
          {/* New: Animated sound wave effect */}
          <div className="absolute bottom-0 left-0 right-0 h-10 overflow-hidden opacity-30">
            <div className="flex justify-around items-end h-full">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-white rounded-t"
                  animate={{ height: [5, 20, 5] }}
                  transition={{
                    duration: 1 + Math.random() * 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: Math.random()
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      
      <motion.section 
        className="mb-10"
        variants={itemVariants}
      >
        <TrendingCarousel title="Trending Now" songs={trendingSongs} />
      </motion.section>
      
      <motion.section 
        className="mb-10"
        variants={itemVariants}
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <span>New Releases</span>
          <motion.div
            className="ml-2"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-5 h-5 rounded-full bg-neon-blue/50 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-neon-blue"></div>
            </div>
          </motion.div>
        </h2>
        <ScrollableRow title="New Releases">
          {newReleases.map((song) => (
            <SongTile key={song.id} song={song} className="min-w-[200px] max-w-[200px]" />
          ))}
        </ScrollableRow>
      </motion.section>
      
      {recommendedUsers.length > 0 && (
        <motion.section 
          className="mb-10"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-bold mb-6">People to Follow</h2>
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedUsers.slice(0, 6).map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <UserCard user={user} />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      )}
      
      <motion.section 
        className="mb-10"
        variants={itemVariants}
      >
        <GenreExplorer />
      </motion.section>

      {/* Audio visualization element */}
      <motion.div 
        className="fixed bottom-20 left-0 w-full h-10 pointer-events-none opacity-20 z-10"
        variants={itemVariants}
      >
        <div className="flex justify-around items-end h-full px-4">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-neon-purple rounded-t"
              animate={{ height: [2, 20, 2] }}
              transition={{
                duration: 1 + Math.random() * 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random()
              }}
              style={{
                backgroundColor: i % 3 === 0 ? '#9b87f5' : i % 3 === 1 ? '#D946EF' : '#0EA5E9',
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Home;
