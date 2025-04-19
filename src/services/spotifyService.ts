
// Constants
const CLIENT_ID = '8c71f1ef70c94d81b3e75ee61d5739af';
const CLIENT_SECRET = '0468bb6bcff24db3b6b87431f305f369';
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const SEARCH_ENDPOINT = 'https://api.spotify.com/v1/search';
const RECOMMENDATIONS_ENDPOINT = 'https://api.spotify.com/v1/recommendations';
const NEW_RELEASES_ENDPOINT = 'https://api.spotify.com/v1/browse/new-releases';

// Track interfaces
export interface SpotifyTrackBasic {
  id: string;
  title: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt?: string; // Optional in basic, required in full track
}

export interface SpotifyTrack extends SpotifyTrackBasic {
  publishedAt: string;
}

// Cache the token and its expiration time
let tokenData: {
  access_token: string;
  expires_at: number;
} | null = null;

// Get Spotify API token
const getToken = async (): Promise<string> => {
  // Return cached token if it's still valid (with 60s buffer)
  if (tokenData && tokenData.expires_at > Date.now() + 60000) {
    return tokenData.access_token;
  }

  try {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      throw new Error(`Failed to get Spotify token: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Cache the token with expiration time
    tokenData = {
      access_token: data.access_token,
      expires_at: Date.now() + (data.expires_in * 1000)
    };

    return data.access_token;
  } catch (error) {
    console.error('Error getting Spotify token:', error);
    throw error;
  }
};

// Convert Spotify track to our app's format
const convertSpotifyTrack = (item: any): SpotifyTrack => {
  return {
    id: item.id,
    title: item.name,
    thumbnailUrl: item.album?.images?.[0]?.url || 'https://via.placeholder.com/300',
    channelTitle: item.artists?.[0]?.name || 'Unknown Artist',
    publishedAt: item.album?.release_date || new Date().toISOString(),
  };
};

// Search for tracks
export const searchTracks = async (query: string): Promise<SpotifyTrack[]> => {
  if (!query?.trim()) {
    return [];
  }

  try {
    const token = await getToken();
    const response = await fetch(
      `${SEARCH_ENDPOINT}?q=${encodeURIComponent(query)}&type=track&limit=20`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Spotify search failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.tracks.items.map(convertSpotifyTrack);
  } catch (error) {
    console.error('Error searching Spotify tracks:', error);
    return [];
  }
};

// Get trending music (based on popularity)
export const getTrendingMusic = async (): Promise<SpotifyTrack[]> => {
  try {
    const token = await getToken();
    const response = await fetch(
      `${RECOMMENDATIONS_ENDPOINT}?limit=20&seed_genres=pop,hip-hop,rock`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get trending music: ${response.statusText}`);
    }

    const data = await response.json();
    return data.tracks.map(convertSpotifyTrack);
  } catch (error) {
    console.error('Error fetching trending music:', error);
    return [];
  }
};

// Get trending music by genre
export const getTrendingByGenre = async (genre: string): Promise<SpotifyTrack[]> => {
  // Normalize the genre name for Spotify API
  const normalizedGenre = genre.toLowerCase().replace(/\s+/g, '-');
  
  try {
    const token = await getToken();
    const response = await fetch(
      `${RECOMMENDATIONS_ENDPOINT}?limit=30&seed_genres=${normalizedGenre}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get ${genre} music: ${response.statusText}`);
    }

    const data = await response.json();
    return data.tracks.map(convertSpotifyTrack);
  } catch (error) {
    console.error(`Error fetching ${genre} music:`, error);
    return [];
  }
};

// Get new releases
export const getNewReleases = async (): Promise<SpotifyTrack[]> => {
  try {
    const token = await getToken();
    const response = await fetch(
      `${NEW_RELEASES_ENDPOINT}?limit=20`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get new releases: ${response.statusText}`);
    }

    const data = await response.json();
    return data.albums.items.map((item: any) => ({
      id: item.id,
      title: item.name,
      thumbnailUrl: item.images?.[0]?.url || 'https://via.placeholder.com/300',
      channelTitle: item.artists?.[0]?.name || 'Unknown Artist',
      publishedAt: item.release_date || new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching new releases:', error);
    return [];
  }
};

// Get recommendations based on track IDs
export const getRecommendations = async (trackIds: string[]): Promise<SpotifyTrack[]> => {
  if (!trackIds.length) {
    return [];
  }

  // Use at most 5 seed tracks (Spotify API limitation)
  const seedTracks = trackIds.slice(0, 5).join(',');

  try {
    const token = await getToken();
    const response = await fetch(
      `${RECOMMENDATIONS_ENDPOINT}?limit=20&seed_tracks=${seedTracks}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get recommendations: ${response.statusText}`);
    }

    const data = await response.json();
    return data.tracks.map(convertSpotifyTrack);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
};
