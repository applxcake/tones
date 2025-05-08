
// We'll use HTTP API for NeonDB access rather than direct PostgreSQL connection
import { v4 as uuidv4 } from 'uuid';

// Database connection - Note: This should not be exposed in a production app
// Instead this should be handled through a serverless function or backend service
const API_ENDPOINT = "https://data.neon.tech/api/v2";
const connectionString = "postgresql://tones_owner:npg_0O4TqSpaCmoc@ep-wild-smoke-a1vutw0y-pooler.ap-southeast-1.aws.neon.tech/tones?sslmode=require";

// Mock implementation for database operations
// In a real application, these would connect to the database via API or serverless functions
export async function initializeTables() {
  // Log that we're mocking the functionality
  console.log('Database initialization mocked for browser compatibility');
  
  // Return mock success
  return Promise.resolve({
    success: true,
    message: 'Tables initialized (mock)'
  });
}

// Generate a unique ID (using uuid)
export function generateId(): string {
  return uuidv4();
}

// Mock query execution
export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<T> {
  console.log(`Mock query execution: ${query}`);
  console.log('With parameters:', params);
  
  // Return empty array as default mock response
  return [] as unknown as T;
}

// Mock data operations for front-end development
export const mockData = {
  // User data
  users: [
    {
      id: '1',
      username: 'johndoe',
      email: 'john@example.com',
      bio: 'Music lover and playlist creator',
      avatar: 'https://i.pravatar.cc/300?img=1',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      username: 'janedoe',
      email: 'jane@example.com',
      bio: 'Indie music enthusiast',
      avatar: 'https://i.pravatar.cc/300?img=2',
      created_at: new Date().toISOString()
    }
  ],
  
  // Songs data
  songs: [
    {
      id: 'dQw4w9WgXcQ',
      title: 'Rick Astley - Never Gonna Give You Up',
      thumbnail_url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
      channel_title: 'Rick Astley',
      duration_seconds: 213
    },
    {
      id: 'yPYZpwSpKmA',
      title: 'Rick Astley - Together Forever',
      thumbnail_url: 'https://i.ytimg.com/vi/yPYZpwSpKmA/mqdefault.jpg',
      channel_title: 'Rick Astley',
      duration_seconds: 205
    }
  ],
  
  // Playlists data
  playlists: [
    {
      id: '1',
      name: '80s Hits',
      description: 'Best songs from the 80s',
      image_url: 'https://i.pravatar.cc/300?img=3',
      user_id: '1',
      created_at: new Date().toISOString()
    }
  ],
  
  // Playlist songs data
  playlistSongs: [
    {
      id: '1',
      playlist_id: '1',
      song_id: 'dQw4w9WgXcQ',
      position: 0,
      added_at: new Date().toISOString()
    }
  ],
  
  // Liked songs data
  likedSongs: [
    {
      id: '1',
      user_id: '1',
      song_id: 'dQw4w9WgXcQ',
      liked_at: new Date().toISOString()
    }
  ],
  
  // Follows data
  follows: [
    {
      id: '1',
      follower_id: '1',
      following_id: '2',
      created_at: new Date().toISOString()
    }
  ],
  
  // Recently played data
  recentlyPlayed: [
    {
      id: '1',
      user_id: '1',
      song_id: 'dQw4w9WgXcQ',
      played_at: new Date().toISOString()
    }
  ],
  
  // User profiles data
  userProfiles: [
    {
      user_id: '1',
      profile_picture_url: 'https://i.pravatar.cc/300?img=1',
      theme_preference: 'dark',
      language_preference: 'en',
      last_login: new Date().toISOString()
    }
  ]
};

// Mock database operations using the mock data
export const mockDatabase = {
  getUser: (userId: string) => {
    return mockData.users.find(user => user.id === userId);
  },
  
  getUserPlaylists: (userId: string) => {
    return mockData.playlists.filter(playlist => playlist.user_id === userId);
  },
  
  getPlaylistSongs: (playlistId: string) => {
    const playlistSongIds = mockData.playlistSongs
      .filter(ps => ps.playlist_id === playlistId)
      .map(ps => ps.song_id);
      
    return mockData.songs.filter(song => playlistSongIds.includes(song.id));
  },
  
  getUserLikedSongs: (userId: string) => {
    const likedSongIds = mockData.likedSongs
      .filter(ls => ls.user_id === userId)
      .map(ls => ls.song_id);
      
    return mockData.songs.filter(song => likedSongIds.includes(song.id));
  },
  
  getFollowers: (userId: string) => {
    const followerIds = mockData.follows
      .filter(follow => follow.following_id === userId)
      .map(follow => follow.follower_id);
      
    return mockData.users.filter(user => followerIds.includes(user.id));
  },
  
  getFollowing: (userId: string) => {
    const followingIds = mockData.follows
      .filter(follow => follow.follower_id === userId)
      .map(follow => follow.following_id);
      
    return mockData.users.filter(user => followingIds.includes(user.id));
  }
};
