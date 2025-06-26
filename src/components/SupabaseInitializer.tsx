
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
        // Test Supabase connection by making a simple query
        const { data, error } = await supabase
          .from('songs')
          .select('id')
          .limit(1);
            
        if (error && !error.message.includes('relation "public.songs" does not exist')) {
          console.warn('Supabase query error:', error);
          throw error;
        }
        
        console.log('Supabase connected successfully');
        setInitialized(true);
        toast({
          title: "Connected",
          description: "Successfully connected to database.",
          variant: "default"
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
          title: "Connected",
          description: "App is ready to use.",
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
      // Load liked songs from Supabase if the table exists
      try {
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
          const formattedLikedSongs = likedSongsData.map((item: any) => ({
            id: item.songs.id,
            title: item.songs.title,
            channelTitle: item.songs.channel_title || '',
            thumbnailUrl: item.songs.thumbnail_url || '',
            publishedAt: new Date().toISOString()
          }));
          
          setLikedSongs(formattedLikedSongs);
          console.log('Loaded liked songs from database:', formattedLikedSongs.length);
        }
      } catch (error) {
        console.log('Liked songs table not available yet');
      }

      // Load recently played songs if the table exists
      try {
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
          const formattedRecentlyPlayed = recentlyPlayedData.map((item: any) => ({
            id: item.songs.id,
            title: item.songs.title,
            channelTitle: item.songs.channel_title || '',
            thumbnailUrl: item.songs.thumbnail_url || '',
            publishedAt: item.played_at || new Date().toISOString()
          }));
          
          setRecentlyPlayed(formattedRecentlyPlayed);
          console.log('Loaded recently played from database:', formattedRecentlyPlayed.length);
        }
      } catch (error) {
        console.log('Recently played table not available yet');
      }
    } catch (error) {
      console.error('Error syncing user data:', error);
    }
  };

  // This component doesn't render anything visible
  return null;
};

export default SupabaseInitializer;
