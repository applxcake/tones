import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
  setDoc
} from 'firebase/firestore';
import { db } from './config';

// Types for Firestore documents
export interface FirestoreSong {
  id: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  videoId: string;
  duration?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestorePlaylist {
  id: string;
  name: string;
  description?: string;
  userId: string;
  songs: string[]; // Array of song IDs
  isPublic: boolean;
  shareToken?: string;
  imageUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreUserProfile {
  id: string;
  email: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreLikedSong {
  id: string;
  userId: string;
  songId: string;
  createdAt: Timestamp;
}

export interface FirestoreRecentlyPlayed {
  id: string;
  userId: string;
  songId: string;
  playedAt: Timestamp;
}

// Songs Collection
export const songsCollection = collection(db, 'songs');

// Get all songs
export const getSongs = async (): Promise<FirestoreSong[]> => {
  try {
    const querySnapshot = await getDocs(songsCollection);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestoreSong));
  } catch (error) {
    console.error('Error getting songs:', error);
    return [];
  }
};

// Get song by ID
export const getSongById = async (id: string): Promise<FirestoreSong | null> => {
  try {
    const docRef = doc(db, 'songs', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as FirestoreSong;
    }
    return null;
  } catch (error) {
    console.error('Error getting song:', error);
    return null;
  }
};

// Add song
export const addSong = async (songData: Omit<FirestoreSong, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
  try {
    const docRef = await addDoc(songsCollection, {
      ...songData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding song:', error);
    return null;
  }
};

// Playlists Collection
export const playlistsCollection = collection(db, 'playlists');

// Get user playlists
export const getUserPlaylists = async (userId: string): Promise<FirestorePlaylist[]> => {
  try {
    const q = query(
      playlistsCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestorePlaylist));
  } catch (error) {
    console.error('Error getting user playlists:', error);
    return [];
  }
};

// Get playlist by ID
export const getPlaylistById = async (id: string): Promise<FirestorePlaylist | null> => {
  try {
    const docRef = doc(db, 'playlists', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as FirestorePlaylist;
    }
    return null;
  } catch (error) {
    console.error('Error getting playlist:', error);
    return null;
  }
};

// Get playlist by share token
export const getPlaylistByShareToken = async (shareToken: string): Promise<FirestorePlaylist | null> => {
  try {
    const q = query(playlistsCollection, where('shareToken', '==', shareToken));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as FirestorePlaylist;
    }
    return null;
  } catch (error) {
    console.error('Error getting playlist by share token:', error);
    return null;
  }
};

// Add playlist
export const addPlaylist = async (playlistData: Omit<FirestorePlaylist, 'id' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
  try {
    const docRef = await addDoc(playlistsCollection, {
      ...playlistData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding playlist:', error);
    return null;
  }
};

// Update playlist
export const updatePlaylist = async (id: string, updates: Partial<FirestorePlaylist>): Promise<boolean> => {
  try {
    const docRef = doc(db, 'playlists', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating playlist:', error);
    return false;
  }
};

// Delete playlist
export const deletePlaylist = async (id: string): Promise<boolean> => {
  try {
    const docRef = doc(db, 'playlists', id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting playlist:', error);
    return false;
  }
};

// Add song to playlist
export const addSongToPlaylist = async (playlistId: string, songId: string): Promise<boolean> => {
  try {
    const playlist = await getPlaylistById(playlistId);
    if (!playlist) return false;
    
    const updatedSongs = [...playlist.songs, songId];
    await updatePlaylist(playlistId, { songs: updatedSongs });
    return true;
  } catch (error) {
    console.error('Error adding song to playlist:', error);
    return false;
  }
};

// Remove song from playlist
export const removeSongFromPlaylist = async (playlistId: string, songId: string): Promise<boolean> => {
  try {
    const playlist = await getPlaylistById(playlistId);
    if (!playlist) return false;
    
    const updatedSongs = playlist.songs.filter(id => id !== songId);
    await updatePlaylist(playlistId, { songs: updatedSongs });
    return true;
  } catch (error) {
    console.error('Error removing song from playlist:', error);
    return false;
  }
};

// Liked Songs Collection
export const likedSongsCollection = collection(db, 'likedSongs');

// Get user's liked songs
export const getUserLikedSongs = async (userId: string): Promise<FirestoreLikedSong[]> => {
  try {
    const q = query(
      likedSongsCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestoreLikedSong));
  } catch (error) {
    console.error('Error getting liked songs:', error);
    return [];
  }
};

// Add liked song
export const addLikedSong = async (userId: string, songId: string): Promise<string | null> => {
  try {
    const docRef = await addDoc(likedSongsCollection, {
      userId,
      songId,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding liked song:', error);
    return null;
  }
};

// Remove liked song
export const removeLikedSong = async (userId: string, songId: string): Promise<boolean> => {
  try {
    const q = query(
      likedSongsCollection,
      where('userId', '==', userId),
      where('songId', '==', songId)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = doc(db, 'likedSongs', querySnapshot.docs[0].id);
      await deleteDoc(docRef);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error removing liked song:', error);
    return false;
  }
};

// Check if song is liked
export const isSongLiked = async (userId: string, songId: string): Promise<boolean> => {
  try {
    const q = query(
      likedSongsCollection,
      where('userId', '==', userId),
      where('songId', '==', songId)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking if song is liked:', error);
    return false;
  }
};

// Recently Played Collection
export const recentlyPlayedCollection = collection(db, 'recentlyPlayed');

// Get user's recently played songs
export const getUserRecentlyPlayed = async (userId: string, limitCount: number = 20): Promise<FirestoreRecentlyPlayed[]> => {
  try {
    const q = query(
      recentlyPlayedCollection,
      where('userId', '==', userId),
      orderBy('playedAt', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestoreRecentlyPlayed));
  } catch (error) {
    console.error('Error getting recently played:', error);
    return [];
  }
};

// Add recently played song
export const addRecentlyPlayed = async (userId: string, songId: string): Promise<string | null> => {
  try {
    const docRef = await addDoc(recentlyPlayedCollection, {
      userId,
      songId,
      playedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding recently played:', error);
    return null;
  }
};

// Real-time listeners
export const subscribeToUserPlaylists = (userId: string, callback: (playlists: FirestorePlaylist[]) => void) => {
  const q = query(
    playlistsCollection,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const playlists = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestorePlaylist));
    callback(playlists);
  });
};

export const subscribeToLikedSongs = (userId: string, callback: (likedSongs: FirestoreLikedSong[]) => void) => {
  const q = query(
    likedSongsCollection,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const likedSongs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestoreLikedSong));
    callback(likedSongs);
  });
};

// Batch operations for better performance
export const batchAddSongs = async (songs: Omit<FirestoreSong, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<string[]> => {
  try {
    const batch = writeBatch(db);
    const songIds: string[] = [];
    
    songs.forEach(songData => {
      const docRef = doc(songsCollection);
      batch.set(docRef, {
        ...songData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      songIds.push(docRef.id);
    });
    
    await batch.commit();
    return songIds;
  } catch (error) {
    console.error('Error batch adding songs:', error);
    return [];
  }
};

// User Profiles Collection
export const userProfilesCollection = collection(db, 'userProfiles');

// Get user profile by ID
export const getUserProfile = async (userId: string): Promise<FirestoreUserProfile | null> => {
  try {
    const docRef = doc(db, 'userProfiles', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as FirestoreUserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Create or update user profile
export const setUserProfile = async (userId: string, profile: Partial<FirestoreUserProfile>): Promise<boolean> => {
  try {
    const docRef = doc(db, 'userProfiles', userId);
    await setDoc(docRef, {
      ...profile,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error setting user profile:', error);
    return false;
  }
}; 