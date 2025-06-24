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
        // Add a timeout to the fetch request to avoid hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        // Test Supabase connection by fetching from a table that we know exists
        const { data, error } = await supabase
          .from('songs')
          .select('id')
          .limit(1)
          .abortSignal(controller.signal);
            
        clearTimeout(timeoutId);
        
        if (error) {
          console.warn('Supabase query error:', error);
          throw error; // Throw the original error instead of creating a new one
        }
        
        console.log('Supabase connected successfully');
        setInitialized(true);
        toast({
          title: "Database Connected",
          description: "Successfully connected to Supabase database.",
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
        
        // Provide more specific error messaging based on error type
        let errorMessage = "Using mock data for preview. All features are functional with sample data.";
        let errorTitle = "Database Notice";
        
        // Check for different error types more accurately
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            errorMessage = "Database connection timed out. Using offline mode with sample data.";
            errorTitle = "Connection Timeout";
          } else if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
            errorMessage = "Unable to connect to database. Please check your internet connection. Using sample data for now.";
            errorTitle = "Connection Failed";
          } else if (error.message.includes('CORS')) {
            errorMessage = "Database access blocked by browser security. Using sample data for preview.";
            errorTitle = "Access Restricted";
          }
        } else if (typeof error === 'object' && error !== null) {
          // Handle Supabase-specific errors
          const supabaseError = error as any;
          if (supabaseError.code || supabaseError.message) {
            errorMessage = "Database service temporarily unavailable. Using sample data for preview.";
            errorTitle = "Service Unavailable";
          }
        }
        
        toast({
          title: errorTitle,
          description: errorMessage,
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
      // Add timeout for user data sync as well
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

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
        .eq('user_id', userId)
        .abortSignal(controller.signal);

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
        .limit(20)
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

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
      // Don't show toast for sync errors to avoid spam, but log for debugging
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('User data sync timed out');
      }
    }
  };

  // This component doesn't render anything visible
  return null;
};

export default SupabaseInitializer;