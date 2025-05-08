
import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';

// TiDB Connection Pool Configuration
const config = {
  host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: '3yYS8LUTvavTJ9C.root',
  password: 'seNv1GQN8dmFCDJH',
  database: 'test',
  ssl: {
    rejectUnauthorized: true,
  },
  connectionLimit: 10,
};

// Create a connection pool
let pool: mysql.Pool | null = null;

// Initialize the TiDB pool
export const initPool = async (): Promise<mysql.Pool> => {
  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';
  
  if (isBrowser) {
    console.log('Running in browser, using mock implementation');
    return null as any;
  }
  
  try {
    if (!pool) {
      pool = mysql.createPool(config);
      console.log('TiDB pool initialized');
    }
    return pool;
  } catch (error) {
    console.error('Failed to initialize TiDB pool:', error);
    throw error;
  }
};

// Execute SQL query with parameters
export async function executeQuery<T>(sql: string, params: any[] = []): Promise<T> {
  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';
  
  if (isBrowser) {
    // Use mock implementation for browser
    return mockExecuteQuery(sql, params) as T;
  }
  
  try {
    if (!pool) {
      pool = await initPool();
    }
    
    const [rows] = await pool.execute(sql, params);
    return rows as T;
  } catch (error) {
    console.error('Error executing query:', error, 'SQL:', sql, 'Params:', params);
    throw error;
  }
}

// Generate a unique ID (UUID)
export function generateId(): string {
  return uuidv4();
}

// In-memory storage for browser-side mock data
const mockDb = {
  users: new Map(),
  songs: new Map(),
  likedSongs: new Map<string, Set<string>>(),
  playlists: new Map(),
  playlistSongs: new Map<number, Map<string, Date>>(),
  listeningHistory: new Map<string, Array<{songId: string, playedAt: Date}>>()
};

// Mock implementation for browser environment
function mockExecuteQuery(sql: string, params: any[] = []): any {
  console.log('Mock query:', sql, params);
  
  // Handle different types of queries
  if (sql.includes('INSERT INTO liked_songs')) {
    const [userId, songId] = params;
    if (!mockDb.likedSongs.has(userId)) {
      mockDb.likedSongs.set(userId, new Set());
    }
    mockDb.likedSongs.get(userId)!.add(songId);
    return { affectedRows: 1 };
  }
  
  else if (sql.includes('DELETE FROM liked_songs')) {
    const [userId, songId] = params;
    if (mockDb.likedSongs.has(userId)) {
      mockDb.likedSongs.get(userId)!.delete(songId);
    }
    return { affectedRows: 1 };
  }
  
  else if (sql.includes('SELECT * FROM liked_songs')) {
    const userId = params[0];
    if (!mockDb.likedSongs.has(userId)) return [];
    
    return Array.from(mockDb.likedSongs.get(userId)!).map(songId => ({
      user_id: userId,
      song_id: songId,
      liked_at: new Date().toISOString()
    }));
  }
  
  else if (sql.includes('INSERT INTO playlists')) {
    const [userId, name] = params;
    const id = mockDb.playlists.size + 1;
    const playlist = {
      id,
      user_id: userId,
      name,
      created_at: new Date().toISOString()
    };
    mockDb.playlists.set(id, playlist);
    return { insertId: id };
  }
  
  else if (sql.includes('DELETE FROM playlists')) {
    const playlistId = parseInt(params[0]);
    mockDb.playlists.delete(playlistId);
    
    // Also delete associated playlist songs
    if (mockDb.playlistSongs.has(playlistId)) {
      mockDb.playlistSongs.delete(playlistId);
    }
    return { affectedRows: 1 };
  }
  
  else if (sql.includes('SELECT * FROM playlists WHERE user_id')) {
    const userId = params[0];
    const userPlaylists = Array.from(mockDb.playlists.values())
      .filter(p => p.user_id === userId);
    return userPlaylists;
  }
  
  else if (sql.includes('SELECT * FROM playlists WHERE id')) {
    const playlistId = parseInt(params[0]);
    const playlist = mockDb.playlists.get(playlistId);
    return playlist ? [playlist] : [];
  }
  
  else if (sql.includes('INSERT INTO playlist_songs')) {
    const [playlistId, songId] = params;
    if (!mockDb.playlistSongs.has(playlistId)) {
      mockDb.playlistSongs.set(playlistId, new Map());
    }
    mockDb.playlistSongs.get(playlistId)!.set(songId, new Date());
    return { affectedRows: 1 };
  }
  
  else if (sql.includes('DELETE FROM playlist_songs')) {
    const [playlistId, songId] = params;
    if (mockDb.playlistSongs.has(playlistId)) {
      mockDb.playlistSongs.get(playlistId)!.delete(songId);
    }
    return { affectedRows: 1 };
  }
  
  else if (sql.includes('SELECT * FROM playlist_songs')) {
    const playlistId = parseInt(params[0]);
    if (!mockDb.playlistSongs.has(playlistId)) return [];
    
    return Array.from(mockDb.playlistSongs.get(playlistId)!.entries()).map(([songId, addedAt]) => ({
      playlist_id: playlistId,
      song_id: songId,
      added_at: addedAt.toISOString()
    }));
  }
  
  else if (sql.includes('INSERT INTO listening_history')) {
    const [userId, songId] = params;
    if (!mockDb.listeningHistory.has(userId)) {
      mockDb.listeningHistory.set(userId, []);
    }
    mockDb.listeningHistory.get(userId)!.unshift({
      songId,
      playedAt: new Date()
    });
    return { affectedRows: 1 };
  }
  
  else if (sql.includes('SELECT * FROM listening_history')) {
    const userId = params[0];
    if (!mockDb.listeningHistory.has(userId)) return [];
    
    return mockDb.listeningHistory.get(userId)!.map(entry => ({
      user_id: userId,
      song_id: entry.songId,
      played_at: entry.playedAt.toISOString()
    }));
  }
  
  return [];
}

// Initialize the database tables
export const initializeTables = async (): Promise<void> => {
  const isBrowser = typeof window !== 'undefined';
  if (isBrowser) {
    console.log('Running in browser, skipping table initialization');
    return;
  }
  
  try {
    // Check if tables exist and create them if they don't
    const tables = [
      `CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS songs (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255),
        artist VARCHAR(255),
        thumbnail_url TEXT,
        duration INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS liked_songs (
        user_id VARCHAR(255),
        song_id VARCHAR(255),
        liked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, song_id)
      )`,
      `CREATE TABLE IF NOT EXISTS playlists (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255),
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS playlist_songs (
        playlist_id INT,
        song_id VARCHAR(255),
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (playlist_id, song_id)
      )`,
      `CREATE TABLE IF NOT EXISTS listening_history (
        user_id VARCHAR(255),
        song_id VARCHAR(255),
        played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, song_id, played_at)
      )`
    ];
    
    for (const tableQuery of tables) {
      await executeQuery(tableQuery);
    }
    
    console.log('TiDB tables initialized successfully');
  } catch (error) {
    console.error('Error initializing TiDB tables:', error);
    throw error;
  }
};
