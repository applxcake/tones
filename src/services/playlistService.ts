
import { toast } from '@/components/ui/use-toast';
import { YouTubeVideo } from './youtubeService';
import { executeQuery, generateId } from '@/integrations/tidb/client';

export interface Playlist {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  songs: YouTubeVideo[];
  createdAt: string;
  userId: string;
}

// Get all playlists for the current user
export const getUserPlaylists = async (userId?: string) => {
  if (!userId) return [];

  try {
    const playlists = await executeQuery<any[]>(
      `SELECT * FROM playlists WHERE user_id = ?`,
      [userId]
    );
    
    // Get songs for each playlist
    const playlistsWithSongs = await Promise.all(playlists.map(async (playlist) => {
      const playlistSongs = await executeQuery<any[]>(
        `SELECT s.* FROM songs s 
         JOIN playlist_songs ps ON s.id = ps.song_id 
         WHERE ps.playlist_id = ? 
         ORDER BY ps.position ASC`,
        [playlist.id]
      );
      
      return {
        id: playlist.id,
        name: playlist.name,
        description: playlist.description || '',
        imageUrl: playlist.image_url || undefined,
        songs: playlistSongs?.map(song => ({
          id: song.id,
          title: song.title,
          thumbnailUrl: song.thumbnail_url,
          channelTitle: song.channel_title,
          publishedAt: new Date().toISOString(), // Default value for publishedAt
        })) || [],
        createdAt: playlist.created_at,
        userId: playlist.user_id,
      };
    }));
    
    return playlistsWithSongs;
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
export const createPlaylist = async (name: string, description = '', userId?: string) => {
  if (!userId) {
    toast({
      title: "Error creating playlist",
      description: "You must be logged in to create playlists.",
      variant: "destructive"
    });
    return null;
  }

  try {
    const playlistId = generateId();
    const now = new Date().toISOString();
    
    await executeQuery(
      `INSERT INTO playlists (id, name, description, user_id, created_at) 
       VALUES (?, ?, ?, ?, ?)`,
      [playlistId, name, description, userId, now]
    );
    
    toast({
      title: "Playlist Created",
      description: `'${name}' has been created.`,
    });

    return {
      id: playlistId,
      name,
      description: description || '',
      songs: [],
      createdAt: now,
      userId,
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
export const addSongToPlaylist = async (playlistId: string, song: YouTubeVideo, userId?: string) => {
  if (!userId) return false;
  
  try {
    // First check if the song exists in the songs table
    const existingSong = await executeQuery<any[]>(
      `SELECT * FROM songs WHERE id = ?`,
      [song.id]
    );
    
    // If song doesn't exist, add it
    if (!existingSong.length) {
      await executeQuery(
        `INSERT INTO songs (id, title, thumbnail_url, channel_title) 
         VALUES (?, ?, ?, ?)`,
        [song.id, song.title, song.thumbnailUrl, song.channelTitle]
      );
    }
    
    // Check if song is already in playlist
    const existingPlaylistSong = await executeQuery<any[]>(
      `SELECT * FROM playlist_songs WHERE playlist_id = ? AND song_id = ?`,
      [playlistId, song.id]
    );
      
    if (existingPlaylistSong.length) {
      toast({
        title: "Already Added",
        description: "This song is already in the playlist.",
      });
      return false;
    }
    
    // Get highest position in playlist
    const positionData = await executeQuery<any[]>(
      `SELECT position FROM playlist_songs WHERE playlist_id = ? ORDER BY position DESC LIMIT 1`,
      [playlistId]
    );
      
    const position = positionData.length > 0 ? positionData[0].position + 1 : 0;
    
    // Add song to playlist
    await executeQuery(
      `INSERT INTO playlist_songs (id, playlist_id, song_id, position, added_at) 
       VALUES (?, ?, ?, ?, ?)`,
      [generateId(), playlistId, song.id, position, new Date().toISOString()]
    );
    
    // Get playlist name for toast
    const playlist = await executeQuery<any[]>(
      `SELECT name FROM playlists WHERE id = ?`,
      [playlistId]
    );
    
    toast({
      title: "Song Added",
      description: `Added to ${playlist[0]?.name || 'playlist'}`,
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
export const removeSongFromPlaylist = async (playlistId: string, songId: string) => {
  try {
    await executeQuery(
      `DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?`,
      [playlistId, songId]
    );
    
    toast({
      title: "Song Removed",
      description: "The song has been removed from the playlist.",
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
export const deletePlaylist = async (playlistId: string) => {
  try {
    await executeQuery(
      `DELETE FROM playlists WHERE id = ?`,
      [playlistId]
    );
    
    toast({
      title: "Playlist Deleted",
      description: "The playlist has been deleted.",
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

// Get a single playlist by ID
export const getPlaylistById = async (playlistId: string) => {
  try {
    const playlist = await executeQuery<any[]>(
      `SELECT * FROM playlists WHERE id = ?`,
      [playlistId]
    );
    
    if (!playlist.length) {
      throw new Error('Playlist not found');
    }
    
    // Get songs for the playlist
    const playlistSongs = await executeQuery<any[]>(
      `SELECT s.* FROM songs s 
       JOIN playlist_songs ps ON s.id = ps.song_id 
       WHERE ps.playlist_id = ? 
       ORDER BY ps.position ASC`,
      [playlistId]
    );
      
    return {
      id: playlist[0].id,
      name: playlist[0].name,
      description: playlist[0].description || '',
      imageUrl: playlist[0].image_url || undefined,
      songs: playlistSongs?.map(song => ({
        id: song.id,
        title: song.title,
        thumbnailUrl: song.thumbnail_url,
        channelTitle: song.channel_title,
        publishedAt: new Date().toISOString(), // Default value for publishedAt
      })) || [],
      createdAt: playlist[0].created_at,
      userId: playlist[0].user_id,
    };
  } catch (error) {
    console.error('Error fetching playlist:', error);
    toast({
      title: "Error fetching playlist",
      description: "Please try again later.",
      variant: "destructive"
    });
    return null;
  }
};
