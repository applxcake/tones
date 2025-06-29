import { toast } from '@/hooks/use-toast';
import { firebaseService } from '@/integrations/firebase';
import { YouTubeVideo } from './youtubeService';

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
    // Map Firestore liked songs to YouTubeVideo format
    return likedSongs.map((item: any) => ({
      id: item.songId || item.song_id || item.song?.id,
      title: item.song?.title || '',
      thumbnailUrl: item.song?.thumbnailUrl || '',
      channelTitle: item.song?.channelTitle || '',
      publishedAt: item.createdAt?.toDate?.() ? item.createdAt.toDate().toISOString() : (item.createdAt || new Date().toISOString()),
    }));
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
};
