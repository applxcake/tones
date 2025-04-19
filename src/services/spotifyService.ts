
import { toast } from '@/components/ui/use-toast';

// Define SpotifyTrack type to replace YouTubeVideo
export interface SpotifyTrack {
  id: string;
  title: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: string;
  uri?: string;
  artistId?: string;
}

// Basic track type for database interactions
export interface SpotifyTrackBasic {
  id: string;
  title: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt?: string;
  uri?: string;
}

// Spotify API credentials
const CLIENT_ID = '8c71f1ef70c94d81b3e75ee61d5739af';
const CLIENT_SECRET = '0468bb6bcff24db3b6b87431f305f369';

// Token management
let accessToken: string | null = null;
let tokenExpiry: number = 0;

// Get Spotify access token
const getAccessToken = async (): Promise<string> => {
  // Check if we have a valid token
  if (accessToken && tokenExpiry > Date.now()) {
    return accessToken;
  }
  
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`
      },
      body: 'grant_type=client_credentials'
    });
    
    const data = await response.json();
    if (data.access_token) {
      accessToken = data.access_token;
      // Set expiry time (subtract 60 seconds as buffer)
      tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
      return accessToken;
    } else {
      throw new Error('Failed to get access token');
    }
  } catch (error) {
    console.error('Error getting Spotify access token:', error);
    throw error;
  }
};

// Search tracks
export const searchTracks = async (query: string): Promise<SpotifyTrack[]> => {
  if (!query) return [];
  
  try {
    const token = await getAccessToken();
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    const data = await response.json();
    
    if (data.tracks && data.tracks.items) {
      return data.tracks.items.map((track: any) => ({
        id: track.id,
        title: track.name,
        uri: track.uri,
        thumbnailUrl: track.album.images[0]?.url || '',
        channelTitle: track.artists[0]?.name || 'Unknown Artist',
        artistId: track.artists[0]?.id || '',
        publishedAt: track.album.release_date || new Date().toISOString()
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error searching Spotify tracks:', error);
    toast({
      title: "Error",
      description: "Could not search for tracks. Please try again.",
      variant: "destructive"
    });
    return [];
  }
};

// Get trending music (featured playlists tracks)
export const getTrendingMusic = async (): Promise<SpotifyTrack[]> => {
  try {
    const token = await getAccessToken();
    
    // Get featured playlists
    const featuredResponse = await fetch(
      'https://api.spotify.com/v1/browse/featured-playlists?limit=1',
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    const featuredData = await featuredResponse.json();
    
    if (!featuredData.playlists || !featuredData.playlists.items.length) {
      return [];
    }
    
    // Get tracks from the first featured playlist
    const playlistId = featuredData.playlists.items[0].id;
    const tracksResponse = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=20`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    const tracksData = await tracksResponse.json();
    
    if (tracksData.items) {
      return tracksData.items.map((item: any) => {
        const track = item.track;
        return {
          id: track.id,
          title: track.name,
          uri: track.uri,
          thumbnailUrl: track.album.images[0]?.url || '',
          channelTitle: track.artists[0]?.name || 'Unknown Artist',
          artistId: track.artists[0]?.id || '',
          publishedAt: track.album.release_date || new Date().toISOString()
        };
      });
    }
    
    return [];
  } catch (error) {
    console.error('Error getting trending music:', error);
    toast({
      title: "Error",
      description: "Could not fetch trending music. Please try again.",
      variant: "destructive"
    });
    return [];
  }
};

// Get new releases
export const getNewReleases = async (): Promise<SpotifyTrack[]> => {
  try {
    const token = await getAccessToken();
    const response = await fetch(
      'https://api.spotify.com/v1/browse/new-releases?limit=20',
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    const data = await response.json();
    
    if (data.albums && data.albums.items) {
      return data.albums.items.map((album: any) => ({
        id: album.id,
        title: album.name,
        uri: album.uri,
        thumbnailUrl: album.images[0]?.url || '',
        channelTitle: album.artists[0]?.name || 'Unknown Artist',
        artistId: album.artists[0]?.id || '',
        publishedAt: album.release_date || new Date().toISOString()
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error getting new releases:', error);
    toast({
      title: "Error",
      description: "Could not fetch new releases. Please try again.",
      variant: "destructive"
    });
    return [];
  }
};

// Get recommendations based on a seed track
export const getRecommendations = async (trackId: string): Promise<SpotifyTrack[]> => {
  try {
    const token = await getAccessToken();
    const response = await fetch(
      `https://api.spotify.com/v1/recommendations?seed_tracks=${trackId}&limit=20`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    const data = await response.json();
    
    if (data.tracks) {
      return data.tracks.map((track: any) => ({
        id: track.id,
        title: track.name,
        uri: track.uri,
        thumbnailUrl: track.album.images[0]?.url || '',
        channelTitle: track.artists[0]?.name || 'Unknown Artist',
        artistId: track.artists[0]?.id || '',
        publishedAt: track.album.release_date || new Date().toISOString()
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error getting recommendations:', error);
    toast({
      title: "Error",
      description: "Could not fetch recommendations. Please try again.",
      variant: "destructive"
    });
    return [];
  }
};

// Get artist's top tracks
export const getArtistTopTracks = async (artistId: string): Promise<SpotifyTrack[]> => {
  try {
    const token = await getAccessToken();
    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    const data = await response.json();
    
    if (data.tracks) {
      return data.tracks.map((track: any) => ({
        id: track.id,
        title: track.name,
        uri: track.uri,
        thumbnailUrl: track.album.images[0]?.url || '',
        channelTitle: track.artists[0]?.name || 'Unknown Artist',
        artistId: track.artists[0]?.id || '',
        publishedAt: track.album.release_date || new Date().toISOString()
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error getting artist top tracks:', error);
    toast({
      title: "Error",
      description: "Could not fetch artist's top tracks. Please try again.",
      variant: "destructive"
    });
    return [];
  }
};
