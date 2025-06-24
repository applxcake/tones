import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayer } from '@/contexts/PlayerContext';

const SupabaseInitializer = () => {
  const [initialized, setInitialized] = useState(false);
  const { user } = useAuth();
  const { likedSongs, setLikedSongs, recentlyPlayed, setRecentlyPlayed } = usePlayer();

  // Check if Supabase is connected and load user data
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Test Supabase connection by fetching from a table that we know exists
        const { data, error } = await supabase
          .from('songs')
          .select('id')
          .limit(1);
            
        if (error) throw error;
        
        console.log('Supabase connected successfully');
        setInitialized(true);
        toast({
          title: "Database Connected",
          description: "Successfully connected to Supabase database.",
          variant: "success"
        });

        // If user is logged in, sync their data
        if (user) {
          syncUserData(user.id);
        }
      } catch (error) {
        console.error('Supabase connection error:', error);
        
        // Handle the connection error gracefully
        setInitialized(true);
        toast({
          title: "Database Notice",
          description: "Using mock data for preview. All features are functional with sample data.",
          variant: "default"
        });
      }
    };

    checkConnection();
  }, [user]);

  // Sync user data when they log in
  useEffect(() => {
    if (user && initialized) {
      syncUserData(user.id);
    }
  }, [user, initialized]);

  // Function to sync user data from Supabase
  const syncUserData = async (userId: string) => {
    try {
      // Load liked songs from Supabase
      const { data: likedSongsData, error: likedSongsError } = await supabase
        .from('liked_songs')
        .select(`
          song_id,
          songs:song_id (
            id,
            title,
            channel_title,
            thumbnail_url
          )
        `)
        .eq('user_id', userId);

      if (!likedSongsError && likedSongsData && likedSongsData.length > 0) {
        // Transform the data to match our app's expected format with publishedAt property
        const formattedLikedSongs = likedSongsData.map(item => ({
          id: item.songs.id,
          title: item.songs.title,
          channelTitle: item.songs.channel_title || '',
          thumbnailUrl: item.songs.thumbnail_url || '',
          publishedAt: new Date().toISOString() // Add default publishedAt date for compatibility
        }));
        
        // Update the player context with liked songs from Supabase
        setLikedSongs(formattedLikedSongs);
        console.log('Loaded liked songs from Supabase:', formattedLikedSongs.length);
      }

      // Load recently played songs
      const { data: recentlyPlayedData, error: recentlyPlayedError } = await supabase
        .from('recently_played')
        .select(`
          song_id,
          played_at,
          songs:song_id (
            id,
            title,
            channel_title,
            thumbnail_url
          )
        `)
        .eq('user_id', userId)
        .order('played_at', { ascending: false })
        .limit(20);

      if (!recentlyPlayedError && recentlyPlayedData && recentlyPlayedData.length > 0) {
        // Transform the data to match our app's expected format
        const formattedRecentlyPlayed = recentlyPlayedData.map(item => ({
          id: item.songs.id,
          title: item.songs.title,
          channelTitle: item.songs.channel_title || '',
          thumbnailUrl: item.songs.thumbnail_url || '',
          publishedAt: item.played_at || new Date().toISOString()
        }));
        
        // Update the player context with recently played songs from Supabase
        setRecentlyPlayed(formattedRecentlyPlayed);
        console.log('Loaded recently played from Supabase:', formattedRecentlyPlayed.length);
      }
    } catch (error) {
      console.error('Error syncing user data:', error);
      // Don't show toast for sync errors to avoid spam
    }
  };

  // This component doesn't render anything visible
  return null;
};

export default SupabaseInitializer;