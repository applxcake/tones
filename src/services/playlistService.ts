
import { toast } from '@/components/ui/use-toast';
import { YouTubeVideo } from './youtubeService';

export interface Playlist {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  songs: YouTubeVideo[];
  createdAt: string;
  userId: string;
}

// Mock data storage - in a real app, this would be in a database
let playlists: Playlist[] = [
  {
    id: '1',
    name: 'Chill Vibes',
    description: 'Perfect for relaxing and focusing',
    songs: [],
    createdAt: new Date().toISOString(),
    userId: 'current-user',
  },
  {
    id: '2',
    name: 'Workout Mix',
    description: 'High energy tracks for exercise',
    songs: [],
    createdAt: new Date().toISOString(),
    userId: 'current-user',
  },
];

// Get all playlists for the current user
export const getUserPlaylists = () => {
  return playlists.filter(playlist => playlist.userId === 'current-user');
};

// Create a new playlist
export const createPlaylist = (name: string, description = '') => {
  const newPlaylist: Playlist = {
    id: Date.now().toString(),
    name,
    description,
    songs: [],
    createdAt: new Date().toISOString(),
    userId: 'current-user',
  };

  playlists = [...playlists, newPlaylist];
  toast({
    title: "Playlist Created",
    description: `'${name}' has been created.`,
  });

  return newPlaylist;
};

// Add a song to a playlist
export const addSongToPlaylist = (playlistId: string, song: YouTubeVideo) => {
  const playlistIndex = playlists.findIndex(p => p.id === playlistId);
  
  if (playlistIndex === -1) {
    toast({
      title: "Error",
      description: "Playlist not found.",
      variant: "destructive"
    });
    return false;
  }

  // Check if song is already in playlist
  const songExists = playlists[playlistIndex].songs.some(s => s.id === song.id);
  if (songExists) {
    toast({
      title: "Already Added",
      description: "This song is already in the playlist.",
    });
    return false;
  }

  // Add the song to the playlist
  playlists = playlists.map((playlist, index) => {
    if (index === playlistIndex) {
      return {
        ...playlist,
        songs: [...playlist.songs, song]
      };
    }
    return playlist;
  });

  toast({
    title: "Song Added",
    description: `Added to ${playlists[playlistIndex].name}`,
  });
  
  return true;
};

// Remove a song from a playlist
export const removeSongFromPlaylist = (playlistId: string, songId: string) => {
  const playlistIndex = playlists.findIndex(p => p.id === playlistId);
  
  if (playlistIndex === -1) {
    toast({
      title: "Error",
      description: "Playlist not found.",
      variant: "destructive"
    });
    return false;
  }

  playlists = playlists.map((playlist, index) => {
    if (index === playlistIndex) {
      return {
        ...playlist,
        songs: playlist.songs.filter(song => song.id !== songId)
      };
    }
    return playlist;
  });

  toast({
    title: "Song Removed",
    description: "The song has been removed from the playlist.",
  });
  
  return true;
};

// Delete a playlist
export const deletePlaylist = (playlistId: string) => {
  playlists = playlists.filter(playlist => playlist.id !== playlistId);
  toast({
    title: "Playlist Deleted",
    description: "The playlist has been deleted.",
  });
};

// Get a single playlist by ID
export const getPlaylistById = (playlistId: string) => {
  return playlists.find(playlist => playlist.id === playlistId);
};
