// Main Firebase service exports
export * from './config';
export * from './auth';
export * from './database';

// Re-export types for convenience
export type {
  FirestoreSong,
  FirestorePlaylist,
  FirestoreUserProfile,
  FirestoreLikedSong,
  FirestoreRecentlyPlayed
} from './database';

// Firebase service initialization
import { auth, db } from './config';
import { onAuthStateChange, getCurrentUser } from './auth';
import {
  getSongs,
  getUserPlaylists,
  getPlaylistById,
  addPlaylist,
  updatePlaylist,
  deletePlaylist,
  getUserLikedSongs,
  addLikedSong,
  removeLikedSong,
  isSongLiked,
  getUserRecentlyPlayed,
  addRecentlyPlayed,
  subscribeToUserPlaylists,
  subscribeToLikedSongs
} from './database';

// Unified Firebase service
export const firebaseService = {
  // Auth
  auth,
  onAuthStateChange,
  getCurrentUser,
  
  // Database
  db,
  getSongs,
  getUserPlaylists,
  getPlaylistById,
  addPlaylist,
  updatePlaylist,
  deletePlaylist,
  getUserLikedSongs,
  addLikedSong,
  removeLikedSong,
  isSongLiked,
  getUserRecentlyPlayed,
  addRecentlyPlayed,
  subscribeToUserPlaylists,
  subscribeToLikedSongs,
};

export default firebaseService; 