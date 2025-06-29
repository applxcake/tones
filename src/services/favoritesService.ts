import { toast } from '@/hooks/use-toast';
import { firebaseService } from '@/integrations/firebase';
import { YouTubeVideo } from './youtubeService';
import { getSongById, addSong } from '@/integrations/firebase/database';

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
    const alreadyLiked = await firebaseService.isSongLiked(userId, song.id);
    if (alreadyLiked) {
      toast({
        title: "Already Liked!",
        duration: 1500
      });
      return true;
    }

    // First, ensure the song exists in the songs collection
    const existingSong = await getSongById(song.id);
    if (!existingSong) {
      // Add the song to the songs collection if it doesn't exist
      await addSong({
        title: song.title,
        channelTitle: song.channelTitle,
        thumbnailUrl: song.thumbnailUrl,
        videoId: song.id,
      });
    }

    // Then add to liked songs
    await firebaseService.addLikedSong(userId, song.id);
    toast({
      title: "Liked!",
      duration: 1500,
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
    await firebaseService.removeLikedSong(userId, songId);
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
    const likedSongs = await firebaseService.getUserLikedSongs(userId);
    
    if (likedSongs.length === 0) {
      return [];
    }
    
    // Fetch full song data for each liked song in parallel
    const songPromises = likedSongs.map(async (likedSong) => {
      try {
        const songData = await getSongById(likedSong.songId);
        if (songData) {
          return {
            id: songData.id,
            title: songData.title,
            thumbnailUrl: songData.thumbnailUrl,
            channelTitle: songData.channelTitle,
            publishedAt: songData.createdAt?.toDate?.() ? songData.createdAt.toDate().toISOString() : new Date().toISOString(),
          } as YouTubeVideo;
        }
        
        // Fallback: create a minimal song object if the song data is not found
        // This can happen if the song was liked before we started storing full song data
        console.warn(`Song data not found for ${likedSong.songId}, creating fallback object`);
        return {
          id: likedSong.songId,
          title: `Song ${likedSong.songId.slice(0, 8)}...`,
          thumbnailUrl: 'https://via.placeholder.com/120x90/1f2937/ffffff?text=Song',
          channelTitle: 'Unknown Artist',
          publishedAt: likedSong.createdAt?.toDate?.() ? likedSong.createdAt.toDate().toISOString() : new Date().toISOString(),
        } as YouTubeVideo;
      } catch (error) {
        console.error(`Error fetching song data for ${likedSong.songId}:`, error);
        return null;
      }
    });
    
    const results = await Promise.all(songPromises);
    const validSongs = results.filter((song): song is YouTubeVideo => song !== null);
    
    return validSongs;
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
};
