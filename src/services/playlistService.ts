import { toast } from '@/components/ui/use-toast';
import { YouTubeVideo } from './youtubeService';
import { v4 as uuidv4 } from 'uuid';
import { firebaseService } from '@/integrations/firebase';

// Updated interfaces for playlists and playlist songs to use string IDs
export interface Playlist {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  songs: string[]; // Store as string IDs from Firestore
  createdAt: string;
  userId: string;
  isPublic: boolean;
  shareToken: string | null;
}

// Generate a unique ID (using uuid)
export function generateId(): string {
  return uuidv4();
}

// Get all playlists for a user
export const getUserPlaylists = async (userId?: string): Promise<Playlist[]> => {
  if (!userId) return [];
  try {
    const playlists = await firebaseService.getUserPlaylists(userId);
    // Fetch songs for each playlist (if needed, or store song IDs in playlist)
    // Here, we assume songs are stored as IDs in Firestore, so you may need to fetch song details separately if needed
    return playlists.map((pl: any) => ({
      id: pl.id,
      name: pl.name,
      description: pl.description || '',
      imageUrl: pl.imageUrl || '',
      songs: pl.songs || [],
      createdAt: pl.createdAt?.toDate?.() ? pl.createdAt.toDate().toISOString() : (pl.createdAt || new Date().toISOString()),
      userId: pl.userId,
      isPublic: pl.isPublic || false,
      shareToken: pl.shareToken || null,
    }));
  } catch (error) {
    console.error('Error fetching playlists:', error);
    toast({
      title: "Error fetching playlists",
      description: "Please try again later.",
      variant: "destructive"
    });
    return [];
  }
};

// Create a new playlist
export const createPlaylist = async (name: string, description = '', userId?: string, imageUrl = ''): Promise<Playlist | null> => {
  if (!userId) {
    toast({
      title: "Error creating playlist",
      description: "You must be logged in to create playlists.",
      variant: "destructive"
    });
    return null;
  }
  try {
    const playlistId = await firebaseService.addPlaylist({
      name,
      description,
      userId,
      songs: [],
      isPublic: false,
      imageUrl,
    });
    if (!playlistId) throw new Error('Failed to create playlist');
    toast({
      title: "Playlist Created",
      description: `'${name}' has been created.`,
    });
    return {
      id: playlistId,
      name,
      description,
      imageUrl,
      songs: [],
      createdAt: new Date().toISOString(),
      userId,
      isPublic: false,
      shareToken: null,
    };
  } catch (error) {
    console.error('Error creating playlist:', error);
    toast({
      title: "Error creating playlist",
      description: "Please try again later.",
      variant: "destructive"
    });
    return null;
  }
};

// Add a song to a playlist
export const addSongToPlaylist = async (playlistId: string, song: YouTubeVideo, userId?: string): Promise<boolean> => {
  if (!userId) {
    toast({
      title: "Error adding song",
      description: "You must be logged in to add songs to playlists.",
      variant: "destructive"
    });
    return false;
  }
  try {
    const playlist = await firebaseService.getPlaylistById(playlistId);
    if (!playlist) throw new Error('Playlist not found');
    // Prevent duplicate song IDs
    const alreadyInPlaylist = (playlist.songs || []).includes(song.id);
    if (alreadyInPlaylist) {
      toast({
        title: "Song Already in Playlist",
        description: `This song is already in the playlist!`,
        variant: "destructive"
      });
      return false;
    }
    const updatedSongs = [...(playlist.songs || []), song.id];
    await firebaseService.updatePlaylist(playlistId, { songs: updatedSongs });
    toast({
      title: "Song Added",
      description: `Song added to playlist!`,
    });
    return true;
  } catch (error) {
    console.error('Error adding song to playlist:', error);
    toast({
      title: "Error adding song",
      description: "Please try again later.",
      variant: "destructive"
    });
    return false;
  }
};

// Remove a song from a playlist
export const removeSongFromPlaylist = async (playlistId: string, songId: string): Promise<boolean> => {
  try {
    const playlist = await firebaseService.getPlaylistById(playlistId);
    if (!playlist) throw new Error('Playlist not found');
    const updatedSongs = (playlist.songs || []).filter((id: string) => id !== songId);
    await firebaseService.updatePlaylist(playlistId, { songs: updatedSongs });
    toast({
      title: "Song Removed",
      description: `Song removed from playlist!`,
    });
    return true;
  } catch (error) {
    console.error('Error removing song from playlist:', error);
    toast({
      title: "Error removing song",
      description: "Please try again later.",
      variant: "destructive"
    });
    return false;
  }
};

// Delete a playlist
export const deletePlaylist = async (playlistId: string): Promise<boolean> => {
  try {
    await firebaseService.deletePlaylist(playlistId);
    toast({
      title: "Playlist Deleted",
      description: `Playlist deleted successfully!`,
    });
    return true;
  } catch (error) {
    console.error('Error deleting playlist:', error);
    toast({
      title: "Error deleting playlist",
      description: "Please try again later.",
      variant: "destructive"
    });
    return false;
  }
};

// Get a playlist by ID
export const getPlaylistById = async (playlistId: string): Promise<Playlist | null> => {
  try {
    const playlist = await firebaseService.getPlaylistById(playlistId);
    if (!playlist) return null;
    
    // Handle Timestamp conversion properly
    let createdAt: string;
    if (playlist.createdAt && typeof playlist.createdAt === 'object' && 'toDate' in playlist.createdAt) {
      createdAt = playlist.createdAt.toDate().toISOString();
    } else if (typeof playlist.createdAt === 'string') {
      createdAt = playlist.createdAt;
    } else {
      createdAt = new Date().toISOString();
    }
    
    return {
      id: playlist.id,
      name: playlist.name,
      description: playlist.description || '',
      imageUrl: playlist.imageUrl || '',
      songs: playlist.songs || [],
      createdAt,
      userId: playlist.userId,
      isPublic: playlist.isPublic || false,
      shareToken: playlist.shareToken || null,
    };
  } catch (error) {
    console.error('Error fetching playlist:', error);
    return null;
  }
};

// Toggle playlist sharing
export const togglePlaylistSharing = async (playlistId: string, isPublic: boolean): Promise<boolean> => {
  try {
    const shareToken = isPublic ? generateId() : null;
    
    const success = await firebaseService.updatePlaylist(playlistId, { 
      isPublic: isPublic,
      shareToken: shareToken,
    });
    
    if (!success) throw new Error('Failed to update playlist');
    
    toast({
      title: isPublic ? "Playlist Shared" : "Playlist Unshared",
      description: isPublic 
        ? "Your playlist is now public and can be shared!" 
        : "Your playlist is now private.",
    });
    
    return true;
  } catch (error) {
    console.error('Error toggling playlist sharing:', error);
    toast({
      title: "Error updating playlist",
      description: "Please try again later.",
      variant: "destructive"
    });
    return false;
  }
};

// Get share URL for a playlist
export const getPlaylistShareUrl = (shareToken: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/shared/${shareToken}`;
};

// Copy playlist share URL to clipboard
export const copyPlaylistShareUrl = async (shareToken: string): Promise<boolean> => {
  try {
    const shareUrl = getPlaylistShareUrl(shareToken);
    await navigator.clipboard.writeText(shareUrl);
    
    toast({
      title: "Link Copied!",
      description: "Playlist link has been copied to your clipboard.",
    });
    
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    toast({
      title: "Error copying link",
      description: "Please try again.",
      variant: "destructive"
    });
    return false;
  }
};

export const getPlaylistByShareToken = firebaseService.getPlaylistByShareToken;
