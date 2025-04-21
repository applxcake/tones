
// Mock data for browser environment
const mockSongs = [
  {
    id: 'song1',
    title: 'Summertime',
    thumbnail_url: 'https://i.ytimg.com/vi/sample1/default.jpg',
    channel_title: 'Jazz Classics',
    duration_seconds: 180
  },
  {
    id: 'song2',
    title: 'Autumn Leaves',
    thumbnail_url: 'https://i.ytimg.com/vi/sample2/default.jpg',
    channel_title: 'Jazz Standards',
    duration_seconds: 240
  },
  {
    id: 'song3',
    title: 'Winter Wonderland',
    thumbnail_url: 'https://i.ytimg.com/vi/sample3/default.jpg',
    channel_title: 'Holiday Hits',
    duration_seconds: 195
  }
];

const mockUsers = [
  {
    id: 'user1',
    username: 'MusicLover',
    email: 'music@example.com',
    avatar: 'https://i.pravatar.cc/150?u=musiclover',
    bio: 'I love all kinds of music!',
    created_at: new Date().toISOString()
  },
  {
    id: 'user2',
    username: 'JazzMaster',
    avatar: 'https://i.pravatar.cc/150?u=jazzmaster',
    bio: 'Jazz enthusiast and trumpet player',
    created_at: new Date().toISOString()
  },
  {
    id: 'user3',
    username: 'ClassicalVibes',
    avatar: 'https://i.pravatar.cc/150?u=classical',
    bio: 'Piano and orchestra lover',
    created_at: new Date().toISOString()
  },
  {
    id: 'user4',
    username: 'RockStar',
    avatar: 'https://i.pravatar.cc/150?u=rockstar',
    bio: 'Living on the edge with rock music',
    created_at: new Date().toISOString()
  }
];

const mockPlaylists = [
  {
    id: 'playlist1',
    name: 'My Favorites',
    description: 'All my favorite songs',
    image_url: null,
    user_id: 'user1',
    created_at: new Date().toISOString()
  }
];

const mockPlaylistSongs = [
  {
    id: 'plsong1',
    playlist_id: 'playlist1',
    song_id: 'song1',
    position: 0,
    added_at: new Date().toISOString()
  },
  {
    id: 'plsong2',
    playlist_id: 'playlist1',
    song_id: 'song2',
    position: 1,
    added_at: new Date().toISOString()
  }
];

const mockLikedSongs = [
  {
    id: 'like1',
    user_id: 'user1',
    song_id: 'song1',
    liked_at: new Date().toISOString()
  }
];

const mockFollows = [
  {
    id: 'follow1',
    follower_id: 'user1',
    following_id: 'user2',
    created_at: new Date().toISOString()
  }
];

const mockRecentlyPlayed = [
  {
    id: 'recent1',
    user_id: 'user1',
    song_id: 'song2',
    played_at: new Date().toISOString()
  }
];

// In-memory database for browser environment
const mockDb = {
  songs: [...mockSongs],
  users: [...mockUsers],
  playlists: [...mockPlaylists],
  playlist_songs: [...mockPlaylistSongs],
  liked_songs: [...mockLikedSongs],
  follows: [...mockFollows],
  recently_played: [...mockRecentlyPlayed]
};

// Mock TiDB functions for browser environment
export const getTiDBPool = async () => {
  console.log('Using mock TiDB functionality in browser environment');
  return null;
};

// Helper function to execute queries against mock data
export const executeQuery = async <T>(
  query: string, 
  params: any[] = []
): Promise<T> => {
  console.log('Mock query execution:', query, params);
  
  // Basic query parser for mock data
  // This is a simplified version that handles basic SELECT, INSERT, UPDATE, DELETE operations
  try {
    if (query.toLowerCase().includes('select * from songs')) {
      return mockDb.songs as unknown as T;
    }
    
    if (query.toLowerCase().includes('select * from users')) {
      if (params.length > 0) {
        const userId = params[0];
        const user = mockDb.users.find(u => u.id === userId);
        return user ? [user] as unknown as T : [] as unknown as T;
      }
      return mockDb.users as unknown as T;
    }
    
    if (query.toLowerCase().includes('select * from playlists where user_id')) {
      const userId = params[0];
      const userPlaylists = mockDb.playlists.filter(p => p.user_id === userId);
      return userPlaylists as unknown as T;
    }
    
    if (query.toLowerCase().includes('select * from playlists where id')) {
      const playlistId = params[0];
      const playlist = mockDb.playlists.find(p => p.id === playlistId);
      return playlist ? [playlist] as unknown as T : [] as unknown as T;
    }
    
    if (query.toLowerCase().includes('select s.* from songs s join playlist_songs ps')) {
      const playlistId = params[0];
      const playlistSongIds = mockDb.playlist_songs
        .filter(ps => ps.playlist_id === playlistId)
        .map(ps => ps.song_id);
      
      const songs = mockDb.songs.filter(s => playlistSongIds.includes(s.id));
      return songs as unknown as T;
    }
    
    if (query.toLowerCase().includes('insert into')) {
      // Mock insert operation
      if (query.toLowerCase().includes('insert into songs')) {
        const newSong = {
          id: params[0],
          title: params[1],
          thumbnail_url: params[2],
          channel_title: params[3],
          duration_seconds: params[4] || null
        };
        mockDb.songs.push(newSong);
      } else if (query.toLowerCase().includes('insert into playlists')) {
        const newPlaylist = {
          id: params[0],
          name: params[1],
          description: params[2],
          user_id: params[3],
          created_at: params[4],
          image_url: null
        };
        mockDb.playlists.push(newPlaylist);
      } else if (query.toLowerCase().includes('insert into playlist_songs')) {
        const newPlaylistSong = {
          id: params[0],
          playlist_id: params[1],
          song_id: params[2],
          position: params[3],
          added_at: params[4]
        };
        mockDb.playlist_songs.push(newPlaylistSong);
      } else if (query.toLowerCase().includes('insert into liked_songs')) {
        const newLike = {
          id: params[0],
          user_id: params[1],
          song_id: params[2],
          liked_at: params[3]
        };
        mockDb.liked_songs.push(newLike);
      } else if (query.toLowerCase().includes('insert into follows')) {
        const newFollow = {
          id: params[0],
          follower_id: params[1],
          following_id: params[2],
          created_at: params[3]
        };
        mockDb.follows.push(newFollow);
      } else if (query.toLowerCase().includes('insert into recently_played')) {
        const newRecent = {
          id: params[0],
          user_id: params[1],
          song_id: params[2],
          played_at: params[3]
        };
        mockDb.recently_played.push(newRecent);
      } else if (query.toLowerCase().includes('insert into users')) {
        const newUser = {
          id: params[0],
          username: params[1],
          email: null,
          avatar: params[2] || null,
          bio: params[3] || null,
          created_at: params[4] || new Date().toISOString()
        };
        mockDb.users.push(newUser);
      }
      return { affectedRows: 1 } as unknown as T;
    }
    
    if (query.toLowerCase().includes('delete from')) {
      if (query.toLowerCase().includes('delete from playlist_songs')) {
        const playlistId = params[0];
        const songId = params[1];
        mockDb.playlist_songs = mockDb.playlist_songs.filter(
          ps => !(ps.playlist_id === playlistId && ps.song_id === songId)
        );
      } else if (query.toLowerCase().includes('delete from playlists')) {
        const playlistId = params[0];
        mockDb.playlists = mockDb.playlists.filter(p => p.id !== playlistId);
        mockDb.playlist_songs = mockDb.playlist_songs.filter(ps => ps.playlist_id !== playlistId);
      } else if (query.toLowerCase().includes('delete from follows')) {
        const followerId = params[0];
        const followingId = params[1];
        mockDb.follows = mockDb.follows.filter(
          f => !(f.follower_id === followerId && f.following_id === followingId)
        );
      } else if (query.toLowerCase().includes('delete from liked_songs')) {
        const userId = params[0];
        const songId = params[1];
        mockDb.liked_songs = mockDb.liked_songs.filter(
          ls => !(ls.user_id === userId && ls.song_id === songId)
        );
      }
      return { affectedRows: 1 } as unknown as T;
    }
    
    if (query.toLowerCase().includes('select * from liked_songs')) {
      if (params.length >= 2) {
        const userId = params[0];
        const songId = params[1];
        const likes = mockDb.liked_songs.filter(
          ls => ls.user_id === userId && ls.song_id === songId
        );
        return likes as unknown as T;
      } else if (params.length === 1) {
        const userId = params[0];
        const likes = mockDb.liked_songs.filter(ls => ls.user_id === userId);
        return likes as unknown as T;
      }
      return mockDb.liked_songs as unknown as T;
    }
    
    if (query.toLowerCase().includes('select follower_id from follows')) {
      const userId = params[0];
      const followers = mockDb.follows
        .filter(f => f.following_id === userId)
        .map(f => ({ follower_id: f.follower_id }));
      return followers as unknown as T;
    }
    
    if (query.toLowerCase().includes('select following_id from follows')) {
      const userId = params[0];
      const following = mockDb.follows
        .filter(f => f.follower_id === userId)
        .map(f => ({ following_id: f.following_id }));
      return following as unknown as T;
    }
    
    if (query.toLowerCase().includes('select * from follows')) {
      if (params.length >= 2) {
        const followerId = params[0];
        const followingId = params[1];
        const follows = mockDb.follows.filter(
          f => f.follower_id === followerId && f.following_id === followingId
        );
        return follows as unknown as T;
      }
      return mockDb.follows as unknown as T;
    }
    
    if (query.toLowerCase().includes('update users')) {
      const username = params[0];
      const bio = params[1];
      const avatar = params[2];
      const userId = params[3];
      
      const userIndex = mockDb.users.findIndex(u => u.id === userId);
      if (userIndex >= 0) {
        mockDb.users[userIndex] = {
          ...mockDb.users[userIndex],
          username: username || mockDb.users[userIndex].username,
          bio: bio || mockDb.users[userIndex].bio,
          avatar: avatar || mockDb.users[userIndex].avatar
        };
      }
      return { affectedRows: 1 } as unknown as T;
    }
    
    // Default return empty array for unhandled queries
    return [] as unknown as T;
  } catch (error) {
    console.error('Error in mock query execution:', error);
    throw error;
  }
};

// Initialize TiDB tables (mocked in browser)
export const initializeTables = async () => {
  console.log('Mock TiDB tables initialized');
  // In a real environment, this would create tables if they don't exist
  return true;
};

// Generate a unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};
