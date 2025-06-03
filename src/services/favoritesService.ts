import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { YouTubeVideo } from './youtubeService';
import { v4 as uuidv4 } from 'uuid';

export interface FavoriteItem {
  id: string;
  userId: string;
  songId: string;
  song: YouTubeVideo;
  createdAt: string;
}

// Add song to favorites
export const addToFavorites = async (song: YouTubeVideo, userId?: string): Promise<boolean> => {
  if (!userId) {
    toast({
      title: "Error",
      description: "You must be logged in to add favorites.",
      variant: "destructive"
    });
    return false;
  }

  try {
    // Check if already in favorites
    const { data: existing } = await supabase
      .from('liked_songs')
      .select('*')
      .eq('user_id', userId)
      .eq('song_id', song.id)
      .maybeSingle();

    if (existing) {
      toast({
        title: "Already Favorited",
        description: "This song is already in your favorites.",
      });
      return true;
    }

    // Add to favorites
    const { error } = await supabase
      .from('liked_songs')
      .insert({
        id: uuidv4(),
        user_id: userId,
        song_id: song.id,
        created_at: new Date().toISOString()
      });

    if (error) throw error;

    toast({
      title: "Added to Favorites",
      description: `${song.title} has been added to your favorites.`,
      variant: "success"
    });

    return true;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    toast({
      title: "Error",
      description: "Could not add to favorites. Please try again.",
      variant: "destructive"
    });
    return false;
  }
};

// Remove from favorites
export const removeFromFavorites = async (songId: string, userId?: string): Promise<boolean> => {
  if (!userId) return false;

  try {
    const { error } = await supabase
      .from('liked_songs')
      .delete()
      .eq('user_id', userId)
      .eq('song_id', songId);

    if (error) throw error;

    toast({
      title: "Removed from Favorites",
      description: "Song removed from your favorites.",
    });

    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return false;
  }
};

// Get user favorites
export const getUserFavorites = async (userId?: string): Promise<YouTubeVideo[]> => {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('liked_songs')
      .select(`
        *,
        songs:song_id (*)
      `)
      .eq('user_id', userId);

    if (error) throw error;

    return data?.map(item => ({
      id: item.songs.id,
      title: item.songs.title,
      thumbnailUrl: item.songs.thumbnail_url,
      channelTitle: item.songs.channel_title || '',
      publishedAt: item.liked_at,
    })) || [];
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
};
