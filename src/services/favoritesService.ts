import { toast } from '@/hooks/use-toast';
import { firebaseService } from '@/integrations/firebase';
import { YouTubeVideo } from './youtubeService';
import { getSongById } from '@/integrations/firebase/database';

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
    
    // Fetch full song data for each liked song
    const fullSongs: YouTubeVideo[] = [];
    for (const likedSong of likedSongs) {
      try {
        const songData = await getSongById(likedSong.songId);
        if (songData) {
          fullSongs.push({
            id: songData.id,
            title: songData.title,
            thumbnailUrl: songData.thumbnailUrl,
            channelTitle: songData.channelTitle,
            publishedAt: songData.createdAt?.toDate?.() ? songData.createdAt.toDate().toISOString() : new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error(`Error fetching song data for ${likedSong.songId}:`, error);
        // Continue with other songs even if one fails
      }
    }
    
    return fullSongs;
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
};
