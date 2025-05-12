
import { toast } from '@/components/ui/use-toast';
import { YouTubeVideo } from './youtubeService';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Updated interfaces for playlists and playlist songs to use string IDs
export interface Playlist {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  songs: YouTubeVideo[];
  createdAt: string;
  userId: string;
}

// Generate a unique ID (using uuid)
export function generateId(): string {
  return uuidv4();
}

// Get all playlists for a user
export const getUserPlaylists = async (userId?: string): Promise<Playlist[]> => {
  if (!userId) return [];

  try {
    // Get playlists from Supabase
    const { data: playlists, error: playlistsError } = await supabase
      .from('playlists')
      .select('*')
      .eq('user_id', userId);
    
    if (playlistsError) throw playlistsError;
    
    if (!playlists || playlists.length === 0) {
      return [];
    }
    
    // Get songs for each playlist
    const playlistsWithSongs = await Promise.all(playlists.map(async (playlist) => {
      try {
        // Get playlist songs using join
        const { data: playlistSongsData, error: songsError } = await supabase
          .from('playlist_songs')
          .select(`
            *,
            songs:song_id (*)
          `)
          .eq('playlist_id', playlist.id);
        
        if (songsError) throw songsError;
        
        // Transform the songs into the expected format
        const songs = playlistSongsData?.map(item => ({
          id: item.songs.id,
          title: item.songs.title,
          thumbnailUrl: item.songs.thumbnail_url,
          channelTitle: item.songs.channel_title || '',
          publishedAt: item.added_at || new Date().toISOString(),
        })) || [];
        
        return {
          id: playlist.id,
          name: playlist.name,
          description: playlist.description || '',
          songs,
          createdAt: playlist.created_at,
          userId: playlist.user_id,
        };
      } catch (error) {
        console.error(`Error fetching songs for playlist ${playlist.id}:`, error);
        return {
          id: playlist.id,
          name: playlist.name,
          description: playlist.description || '',
          songs: [],
          createdAt: playlist.created_at,
          userId: playlist.user_id,
        };
      }
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
    const newPlaylist = {
      id: generateId(),
      name,
      description,
      user_id: userId,
      created_at: new Date().toISOString()
    };
    
    // Insert a new playlist into Supabase
    const { data, error } = await supabase
      .from('playlists')
      .insert([newPlaylist])
      .select();
    
    if (error) throw error;
    
    toast({
      title: "Playlist Created",
      description: `'${name}' has been created.`,
    });
    
    // Return the newly created playlist
    return {
      id: data[0].id,
      name,
      description,
      songs: [],
      createdAt: data[0].created_at,
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
    // Verify the playlist exists and belongs to the user
    const { data: playlist, error: playlistError } = await supabase
      .from('playlists')
      .select('*')
      .eq('id', playlistId)
      .eq('user_id', userId)
      .single();
    
    if (playlistError) throw playlistError;
    
    if (!playlist) {
      toast({
        title: "Error adding song",
        description: "You don't have permission to add to this playlist.",
        variant: "destructive"
      });
      return false;
    }
    
    // Check if the song exists in the songs table, if not, add it
    const { data: existingSong, error: songCheckError } = await supabase
      .from('songs')
      .select('*')
      .eq('id', song.id)
      .maybeSingle();
    
    if (songCheckError) throw songCheckError;
    
    if (!existingSong) {
      // Add the song to the songs table
      const { error: songInsertError } = await supabase
        .from('songs')
        .insert([{
          id: song.id,
          title: song.title,
          channel_title: song.channelTitle,
          thumbnail_url: song.thumbnailUrl
        }]);
      
      if (songInsertError) throw songInsertError;
    }
    
    // Check if the song is already in the playlist
    const { data: existingPlaylistSong, error: playlistSongCheckError } = await supabase
      .from('playlist_songs')
      .select('*')
      .eq('playlist_id', playlistId)
      .eq('song_id', song.id)
      .maybeSingle();
    
    if (playlistSongCheckError) throw playlistSongCheckError;
    
    if (existingPlaylistSong) {
      toast({
        title: "Already Added",
        description: "This song is already in the playlist.",
      });
      return true;
    }
    
    // Add the song to the playlist
    const { error: playlistSongInsertError } = await supabase
      .from('playlist_songs')
      .insert({
        id: generateId(),
        playlist_id: playlistId,
        song_id: song.id,
        added_at: new Date().toISOString()
      });
    
    if (playlistSongInsertError) throw playlistSongInsertError;
    
    toast({
      title: "Song Added",
      description: `Added to ${playlist.name}`,
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
    const { error } = await supabase
      .from('playlist_songs')
      .delete()
      .eq('playlist_id', playlistId)
      .eq('song_id', songId);
    
    if (error) throw error;
    
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
export const deletePlaylist = async (playlistId: string): Promise<boolean> => {
  try {
    // First delete all playlist songs
    const { error: songsDeleteError } = await supabase
      .from('playlist_songs')
      .delete()
      .eq('playlist_id', playlistId);
    
    if (songsDeleteError) throw songsDeleteError;
    
    // Then delete the playlist itself
    const { error: playlistDeleteError } = await supabase
      .from('playlists')
      .delete()
      .eq('id', playlistId);
    
    if (playlistDeleteError) throw playlistDeleteError;
    
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
export const getPlaylistById = async (playlistId: string): Promise<Playlist | null> => {
  try {
    // Get the playlist
    const { data: playlist, error: playlistError } = await supabase
      .from('playlists')
      .select('*')
      .eq('id', playlistId)
      .single();
    
    if (playlistError) throw playlistError;
    
    // Get playlist songs
    const { data: playlistSongsData, error: songsError } = await supabase
      .from('playlist_songs')
      .select(`
        *,
        songs:song_id (*)
      `)
      .eq('playlist_id', playlistId);
    
    if (songsError) throw songsError;
    
    // Transform the songs into the expected format
    const songs = playlistSongsData.map(item => ({
      id: item.songs.id,
      title: item.songs.title,
      thumbnailUrl: item.songs.thumbnail_url,
      channelTitle: item.songs.channel_title || '',
      publishedAt: item.added_at || new Date().toISOString(),
    }));
    
    return {
      id: playlist.id,
      name: playlist.name,
      description: playlist.description || '',
      songs,
      createdAt: playlist.created_at,
      userId: playlist.user_id,
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
