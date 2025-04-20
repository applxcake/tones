import { toast } from '@/components/ui/use-toast';
import { YouTubeVideo, YouTubeVideoBasic } from './youtubeService';
import { supabase } from '@/integrations/supabase/client';

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
    const { data: playlists, error } = await supabase
      .from('playlists')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    // Get songs for each playlist
    const playlistsWithSongs = await Promise.all(playlists.map(async (playlist) => {
      const { data: playlistSongs, error } = await supabase
        .from('playlist_songs')
        .select('songs(*)')
        .eq('playlist_id', playlist.id)
        .order('position', { ascending: true });
        
      if (error) throw error;
      
      // Transform database records to match YouTubeVideo interface
      const songs = playlistSongs?.map(item => ({
        id: item.songs.id,
        title: item.songs.title,
        thumbnailUrl: item.songs.thumbnail_url || '',
        channelTitle: item.songs.channel_title || 'Unknown',
        publishedAt: new Date().toISOString() // Add default publishedAt
      })) || [];
      
      return {
        id: playlist.id,
        name: playlist.name,
        description: playlist.description || '',
        imageUrl: playlist.image_url || undefined,
        songs: songs,
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
    const { data, error } = await supabase
      .from('playlists')
      .insert([
        { name, description, user_id: userId }
      ])
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Playlist Created",
      description: `'${name}' has been created.`,
    });

    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      songs: [],
      createdAt: data.created_at,
      userId: data.user_id,
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
    let { data: existingSong } = await supabase
      .from('songs')
      .select('*')
      .eq('id', song.id)
      .single();
    
    // If song doesn't exist, add it
    if (!existingSong) {
      const { error: addSongError } = await supabase
        .from('songs')
        .insert([{
          id: song.id,
          title: song.title,
          thumbnail_url: song.thumbnail,
          channel_title: song.channelTitle,
        }]);
        
      if (addSongError) throw addSongError;
    }
    
    // Check if song is already in playlist
    const { data: existingPlaylistSong } = await supabase
      .from('playlist_songs')
      .select('*')
      .eq('playlist_id', playlistId)
      .eq('song_id', song.id)
      .single();
      
    if (existingPlaylistSong) {
      toast({
        title: "Already Added",
        description: "This song is already in the playlist.",
      });
      return false;
    }
    
    // Get highest position in playlist
    const { data: positionData } = await supabase
      .from('playlist_songs')
      .select('position')
      .eq('playlist_id', playlistId)
      .order('position', { ascending: false })
      .limit(1);
      
    const position = positionData && positionData.length > 0 ? positionData[0].position + 1 : 0;
    
    // Add song to playlist
    const { error } = await supabase
      .from('playlist_songs')
      .insert([{
        playlist_id: playlistId,
        song_id: song.id,
        position: position,
      }]);
    
    if (error) throw error;
    
    // Get playlist name for toast
    const { data: playlist } = await supabase
      .from('playlists')
      .select('name')
      .eq('id', playlistId)
      .single();
    
    toast({
      title: "Song Added",
      description: `Added to ${playlist?.name || 'playlist'}`,
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
export const deletePlaylist = async (playlistId: string) => {
  try {
    // First delete all playlist songs to avoid foreign key errors
    const { error: deletePlaylistSongsError } = await supabase
      .from('playlist_songs')
      .delete()
      .eq('playlist_id', playlistId);

    if (deletePlaylistSongsError) throw deletePlaylistSongsError;
    
    // Then delete the playlist itself
    const { error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', playlistId);
    
    if (error) throw error;
    
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
    const { data: playlist, error } = await supabase
      .from('playlists')
      .select('*')
      .eq('id', playlistId)
      .single();
    
    if (error) throw error;
    
    // Get songs for the playlist
    const { data: playlistSongs, error: songsError } = await supabase
      .from('playlist_songs')
      .select('songs(*)')
      .eq('playlist_id', playlistId)
      .order('position', { ascending: true });
      
    if (songsError) throw songsError;
    
    // Transform database records to match YouTubeVideo interface
    const songs = playlistSongs?.map(item => ({
      id: item.songs.id,
      title: item.songs.title,
      thumbnailUrl: item.songs.thumbnail_url || '',
      channelTitle: item.songs.channel_title || 'Unknown',
      publishedAt: new Date().toISOString() // Add default publishedAt
    })) || [];
    
    return {
      id: playlist.id,
      name: playlist.name,
      description: playlist.description || '',
      imageUrl: playlist.image_url || undefined,
      songs: songs,
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
