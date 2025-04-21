
import mysql from 'mysql2/promise';

// TiDB connection configuration
const tidbConfig = {
  host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: '3yYS8LUTvavTJ9C.root',
  password: 'CQyw8NwsMyMVnyGw',
  database: 'test',
  ssl: {
    ca: '/etc/ssl/cert.pem'
  }
};

// Create a connection pool
let pool: mysql.Pool;

export const getTiDBPool = async () => {
  if (!pool) {
    try {
      pool = mysql.createPool(tidbConfig);
      console.log('TiDB connection pool created');
    } catch (error) {
      console.error('Error creating TiDB connection pool:', error);
      throw error;
    }
  }
  return pool;
};

// Helper function to execute queries
export const executeQuery = async <T>(
  query: string, 
  params: any[] = []
): Promise<T> => {
  try {
    const pool = await getTiDBPool();
    const [rows] = await pool.execute(query, params);
    return rows as T;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
};

// Initialize TiDB tables if they don't exist
export const initializeTables = async () => {
  try {
    const pool = await getTiDBPool();
    
    // Create songs table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS songs (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        thumbnail_url VARCHAR(1024),
        channel_title VARCHAR(255),
        duration_seconds INT
      )
    `);
    
    // Create users table (basic implementation)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        avatar VARCHAR(1024),
        bio TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create follows table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS follows (
        id VARCHAR(255) PRIMARY KEY,
        follower_id VARCHAR(255) NOT NULL,
        following_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Create liked_songs table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS liked_songs (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        song_id VARCHAR(255) NOT NULL,
        liked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
      )
    `);
    
    // Create playlists table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS playlists (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(1024),
        user_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Create playlist_songs table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS playlist_songs (
        id VARCHAR(255) PRIMARY KEY,
        playlist_id VARCHAR(255) NOT NULL,
        song_id VARCHAR(255) NOT NULL,
        position INT NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
        FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
      )
    `);
    
    // Create recently_played table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS recently_played (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        song_id VARCHAR(255) NOT NULL,
        played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
      )
    `);
    
    console.log('TiDB tables initialized');
  } catch (error) {
    console.error('Error initializing tables:', error);
    throw error;
  }
};

// Generate a unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};
