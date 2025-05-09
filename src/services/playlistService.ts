
import { toast } from '@/components/ui/use-toast';
import { YouTubeVideo } from './youtubeService';
import { executeQuery, generateId } from '@/integrations/tidb/client';

// Create interfaces for playlists and playlist songs
export interface Playlist {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  songs: YouTubeVideo[];
  createdAt: string;
  userId: string;
}

// Get all playlists for a user
export const getUserPlaylists = async (userId?: string): Promise<Playlist[]> => {
  if (!userId) return [];

  try {
    // Get playlists from the database
    const playlists = await executeQuery(
      'SELECT * FROM playlists WHERE user_id = ?',
      [userId]
    );
    
    // Get songs for each playlist
    const playlistsWithSongs = await Promise.all(playlists.map(async (playlist) => {
      // Get playlist songs
      const playlistSongsQuery = await executeQuery(
        `SELECT ps.*, s.* FROM playlist_songs ps
         JOIN songs s ON ps.song_id = s.id
         WHERE ps.playlist_id = ?
         ORDER BY ps.added_at DESC`,
        [playlist.id]
      );
      
      // Transform the songs into the expected format
      const songs = playlistSongsQuery.map(row => ({
        id: row.song_id,
        title: row.title,
        thumbnailUrl: row.thumbnail_url,
        channelTitle: row.artist || '',
        publishedAt: row.created_at || new Date().toISOString(),
      }));
      
      return {
        id: playlist.id,
        name: playlist.name,
        description: '',
        songs,
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
export const createPlaylist = async (name: string, description = '', userId?: string): Promise<Playlist | null> => {
  if (!userId) {
    toast({
      title: "Error creating playlist",
      description: "You must be logged in to create playlists.",
      variant: "destructive"
    });
    return null;
  }

  try {
    // Insert a new playlist into the database
    const result = await executeQuery(
      'INSERT INTO playlists (user_id, name) VALUES (?, ?)',
      [userId, name]
    );
    
    const playlistId = result.insertId;
    
    toast({
      title: "Playlist Created",
      description: `'${name}' has been created.`,
    });
    
    // Return the newly created playlist
    return {
      id: playlistId,
      name,
      description,
      songs: [],
      createdAt: new Date().toISOString(),
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
export const addSongToPlaylist = async (playlistId: string | number, song: YouTubeVideo, userId?: string): Promise<boolean> => {
  if (!userId) {
    toast({
      title: "Error adding song",
      description: "You must be logged in to add songs to playlists.",
      variant: "destructive"
    });
    return false;
  }
  
  try {
    // Verify the playlist exists and belongs to the user
    const playlist = await executeQuery(
      'SELECT * FROM playlists WHERE id = ? AND user_id = ?',
      [playlistId, userId]
    );
    
    if (!playlist || playlist.length === 0) {
      toast({
        title: "Error adding song",
        description: "You don't have permission to add to this playlist.",
        variant: "destructive"
      });
      return false;
    }
    
    // Check if the song exists in the songs table, if not, add it
    const existingSong = await executeQuery(
      'SELECT * FROM songs WHERE id = ?',
      [song.id]
    );
    
    if (!existingSong || existingSong.length === 0) {
      // Add the song to the songs table
      await executeQuery(
        'INSERT INTO songs (id, title, artist, thumbnail_url) VALUES (?, ?, ?, ?)',
        [song.id, song.title, song.channelTitle, song.thumbnailUrl]
      );
    }
    
    // Check if the song is already in the playlist
    const existingPlaylistSong = await executeQuery(
      'SELECT * FROM playlist_songs WHERE playlist_id = ? AND song_id = ?',
      [playlistId, song.id]
    );
    
    if (existingPlaylistSong && existingPlaylistSong.length > 0) {
      toast({
        title: "Already Added",
        description: "This song is already in the playlist.",
      });
      return true;
    }
    
    // Add the song to the playlist
    await executeQuery(
      'INSERT INTO playlist_songs (playlist_id, song_id) VALUES (?, ?)',
      [playlistId, song.id]
    );
    
    toast({
      title: "Song Added",
      description: `Added to ${playlist[0].name}`,
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
export const removeSongFromPlaylist = async (playlistId: string | number, songId: string): Promise<boolean> => {
  try {
    await executeQuery(
      'DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?',
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
export const deletePlaylist = async (playlistId: string | number): Promise<boolean> => {
  try {
    // First delete all playlist songs
    await executeQuery(
      'DELETE FROM playlist_songs WHERE playlist_id = ?',
      [playlistId]
    );
    
    // Then delete the playlist itself
    await executeQuery(
      'DELETE FROM playlists WHERE id = ?',
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

// Get a playlist by ID
export const getPlaylistById = async (playlistId: string | number): Promise<Playlist | null> => {
  try {
    // Get the playlist
    const playlist = await executeQuery(
      'SELECT * FROM playlists WHERE id = ?',
      [playlistId]
    );
    
    if (!playlist || playlist.length === 0) {
      return null;
    }
    
    // Get playlist songs
    const playlistSongsQuery = await executeQuery(
      `SELECT ps.*, s.* FROM playlist_songs ps
       JOIN songs s ON ps.song_id = s.id
       WHERE ps.playlist_id = ?
       ORDER BY ps.added_at DESC`,
      [playlistId]
    );
    
    // Transform the songs into the expected format
    const songs = playlistSongsQuery.map(row => ({
      id: row.song_id,
      title: row.title,
      thumbnailUrl: row.thumbnail_url,
      channelTitle: row.artist || '',
      publishedAt: row.created_at || new Date().toISOString(),
    }));
    
    return {
      id: playlist[0].id,
      name: playlist[0].name,
      description: '',
      songs,
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
