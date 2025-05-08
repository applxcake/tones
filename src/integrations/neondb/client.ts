
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

// Database connection
const connectionString = "postgresql://tones_owner:npg_0O4TqSpaCmoc@ep-wild-smoke-a1vutw0y-pooler.ap-southeast-1.aws.neon.tech/tones?sslmode=require";

const pool = new Pool({
  connectionString,
});

// Initialize tables
export async function initializeTables() {
  try {
    const client = await pool.connect();
    
    try {
      // Create users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(255) PRIMARY KEY,
          username VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          bio TEXT,
          avatar VARCHAR(1024),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create songs table
      await client.query(`
        CREATE TABLE IF NOT EXISTS songs (
          id VARCHAR(255) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          thumbnail_url VARCHAR(1024),
          channel_title VARCHAR(255),
          duration_seconds INT
        )
      `);
      
      // Create playlists table
      await client.query(`
        CREATE TABLE IF NOT EXISTS playlists (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          image_url VARCHAR(1024),
          user_id VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create playlist_songs table
      await client.query(`
        CREATE TABLE IF NOT EXISTS playlist_songs (
          id VARCHAR(255) PRIMARY KEY,
          playlist_id VARCHAR(255) NOT NULL,
          song_id VARCHAR(255) NOT NULL,
          position INT NOT NULL,
          added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE (playlist_id, song_id)
        )
      `);
      
      // Create liked_songs table
      await client.query(`
        CREATE TABLE IF NOT EXISTS liked_songs (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          song_id VARCHAR(255) NOT NULL,
          liked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE (user_id, song_id)
        )
      `);
      
      // Create follows table
      await client.query(`
        CREATE TABLE IF NOT EXISTS follows (
          id VARCHAR(255) PRIMARY KEY,
          follower_id VARCHAR(255) NOT NULL,
          following_id VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE (follower_id, following_id)
        )
      `);
      
      // Create recently_played table
      await client.query(`
        CREATE TABLE IF NOT EXISTS recently_played (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          song_id VARCHAR(255) NOT NULL,
          played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE (user_id, song_id)
        )
      `);
      
      // Create user_profiles table
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_profiles (
          user_id VARCHAR(255) PRIMARY KEY,
          profile_picture_url VARCHAR(1024),
          theme_preference VARCHAR(50) DEFAULT 'dark',
          language_preference VARCHAR(10) DEFAULT 'en',
          last_login TIMESTAMP
        )
      `);
      
      console.log('Database tables initialized successfully');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error initializing database tables:', error);
  }
}

// Generate a unique ID (using uuid)
export function generateId(): string {
  return uuidv4();
}

// Execute a query with parameters
export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<T> {
  const client = await pool.connect();
  
  try {
    const result = await client.query(query, params);
    return result.rows as T;
  } finally {
    client.release();
  }
}

// Call initialization at the appropriate time
// This can be imported and called at app startup
