
import { useEffect, useState } from 'react';
import ScrollableRow from '@/components/ScrollableRow';
import SongTile from '@/components/SongTile';
import UserCard from '@/components/UserCard';
import { searchYouTubeVideos } from '@/services/youtubeService';
import { getAllUsers } from '@/services/userService';
import GenreExplorer from '@/components/GenreExplorer';

const Home = () => {
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch trending songs
        const trending = await searchYouTubeVideos('music trending');
        setTrendingSongs(trending);
        
        // Fetch new releases
        const releases = await searchYouTubeVideos('new music releases');
        setNewReleases(releases);
        
        // Fetch recommended users
        const users = await getAllUsers();
        setRecommendedUsers(users);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

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
      <h1 className="text-3xl font-bold mb-8 animate-fade-in">Welcome to Tones</h1>
      
      <section className="mb-10 animate-slide-in">
        <h2 className="text-2xl font-bold mb-6">Trending Now</h2>
        <ScrollableRow title="Trending Songs">
          {trendingSongs.map((song) => (
            <SongTile key={song.id} song={song} className="min-w-[200px] max-w-[200px]" />
          ))}
        </ScrollableRow>
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
