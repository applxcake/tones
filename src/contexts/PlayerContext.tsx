import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { YouTubeVideo } from '@/services/youtubeService';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';
import { getUserFavorites, addToFavorites, removeFromFavorites } from '@/services/favoritesService';

// Define the types
type Song = YouTubeVideo;
type LoopMode = 'none' | 'all' | 'one';

interface PlayerContextType {
  currentTrack: Song | null;
  isPlaying: boolean;
  queue: Song[];
  volume: number;
  playbackRate: number;
  recentlyPlayed: Song[];
  likedSongs: Song[];
  likedSongsLoading: boolean;
  progress: number; 
  duration: number; 
  loopMode: LoopMode; 
  shuffleMode: boolean;
  showQueue: boolean;
  autoPlayEnabled: boolean;
  isCurrentSong: (songId: string) => boolean;
  setLikedSongs: React.Dispatch<React.SetStateAction<Song[]>>;
  setRecentlyPlayed: React.Dispatch<React.SetStateAction<Song[]>>;
  playTrack: (song: Song) => void;
  togglePlayPause: () => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (songId: string) => void;
  clearQueue: () => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (playbackRate: number) => void;
  isLiked: (songId: string) => boolean;
  toggleLike: (song: Song) => Promise<boolean>;
  nextTrack: () => void;
  prevTrack: () => void;
  previousTrack: () => void;
  seekToPosition: (position: number) => void;
  toggleLoopMode: () => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  setDuration: (duration: number) => void;
  setShowQueue: (show: boolean) => void;
  setAutoPlayEnabled: (enabled: boolean) => void;
  playPlaylist: (songs: Song[], shuffle: boolean) => void;
  refreshLikedSongs: () => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [likedSongsLoading, setLikedSongsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loopMode, setLoopMode] = useState<LoopMode>('none');
  const [shuffleMode, setShuffleMode] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const playWhenReady = useRef(false);
  const isYTPlayerReady = useRef(false);
  const { user } = useAuth();

  // Helper function to check if a song is currently playing
  const isCurrentSong = useCallback((songId: string): boolean => {
    return currentTrack?.id === songId;
  }, [currentTrack]);

  const nextTrack = () => {
    console.log('[PlayerContext] nextTrack called', {
      queueLength: queue.length,
      autoPlayEnabled,
      recentlyPlayedLength: recentlyPlayed.length,
      currentTrackId: currentTrack?.id
    });
    
    if (queue.length > 0) {
      let nextSong;
      
      if (shuffleMode) {
        // Shuffle the queue and pick a random song
        const shuffledQueue = [...queue].sort(() => Math.random() - 0.5);
        nextSong = shuffledQueue[0];
        setQueue(prev => prev.filter(song => song.id !== nextSong.id));
      } else {
        // Normal queue behavior
        nextSong = queue[0];
        setQueue(prev => prev.slice(1));
      }
      
      console.log('[PlayerContext] Playing next song from queue:', nextSong.title);
      playTrack(nextSong);
    } else {
      // No more songs in queue, stop playback
      console.log('[PlayerContext] No more songs in queue, stopping playback');
      setIsPlaying(false);
    }
  };

  const seekToPosition = (newProgress: number) => {
    setProgress(newProgress);
    // Also seek the YouTube player
    if (typeof window !== 'undefined' && (window as any)._ytPlayerRef?.current) {
      const ytPlayerRef = (window as any)._ytPlayerRef.current;
      if (ytPlayerRef && ytPlayerRef.seekTo && duration) {
        const seconds = (newProgress / 100) * duration;
        ytPlayerRef.seekTo(seconds);
      }
    }
  };

  // Progress tracking with proper time handling
  useEffect(() => {
    if (!isPlaying || !currentTrack) return;
    
    // Expose updateProgress function globally for YTPlayer to use
    if (typeof window !== 'undefined') {
      (window as any)._updatePlayerProgress = (newProgress: number) => {
        setProgress(newProgress);
        
        // Auto-skip when song ends (progress >= 100)
        if (newProgress >= 100) {
          if (loopMode === 'one') {
            seekToPosition(0);
            setIsPlaying(true);
          } else if (loopMode === 'all' || autoPlayEnabled) {
            nextTrack();
          } else {
            setIsPlaying(false);
          }
        }
      };
    }
    
    // Fallback interval-based progress tracking (less reliable in background)
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / duration);
        
        // Auto-skip when song ends
        if (newProgress >= 100) {
          if (loopMode === 'one') {
            seekToPosition(0);
            setIsPlaying(true);
            return 0;
          } else if (loopMode === 'all' || autoPlayEnabled) {
            nextTrack();
            return 0;
          } else {
            setIsPlaying(false);
            return 100;
          }
        }
        
        return Math.min(newProgress, 100);
      });
    }, 1000);
    
    return () => {
      clearInterval(interval);
      // Clean up global function
      if (typeof window !== 'undefined') {
        delete (window as any)._updatePlayerProgress;
      }
    };
  }, [isPlaying, currentTrack, duration, loopMode, autoPlayEnabled, seekToPosition, nextTrack]);

  const playTrack = useCallback((song: Song) => {
    console.log('[PlayerContext] playTrack called:', {
      songTitle: song.title,
      songId: song.id,
      isPlaying,
      currentTrackId: currentTrack?.id
    });
    
    setCurrentTrack(song);
    setIsPlaying(true);
    setProgress(0);
    setDuration(180); // Default 3 minutes
    setRecentlyPlayed(prev => {
      const newRecentlyPlayed = [song, ...prev.filter(s => s.id !== song.id)].slice(0, 20);
      return newRecentlyPlayed;
    });
    // If player is not ready, set flag to play when ready
    if (!isYTPlayerReady.current) {
      playWhenReady.current = true;
    }
  }, []);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const addToQueue = (song: Song) => {
    setQueue(prev => [...prev, song]);
    toast({
      title: "Added to Queue",
      description: `${song.title} has been added to your queue.`,
    });
  };

  const removeFromQueue = (songId: string) => {
    setQueue(prev => prev.filter(song => song.id !== songId));
  };

  const clearQueue = () => {
    setQueue([]);
    toast({
      title: "Queue Cleared",
      description: "All songs have been removed from the queue.",
    });
  };

  const setVolumeValue = (volume: number) => {
    setVolume(volume);
  };

  const setPlaybackRateValue = (playbackRate: number) => {
    setPlaybackRate(playbackRate);
  };

  const isLiked = useCallback((songId: string): boolean => {
    return likedSongs.some(song => song.id === songId);
  }, [likedSongs]);

  const prevTrack = () => {
    if (recentlyPlayed.length > 1) {
      const prevSong = recentlyPlayed[1];
      playTrack(prevSong);
    }
  };

  const previousTrack = prevTrack;
  
  const toggleLoopMode = () => {
    setLoopMode(current => {
      if (current === 'none') return 'one';
      if (current === 'one') return 'all';
      return 'none';
    });
  };

  const toggleLoop = toggleLoopMode;

  const toggleShuffle = () => {
    setShuffleMode(!shuffleMode);
  };

  // Play a playlist with optional shuffle
  const playPlaylist = (songs: Song[], shuffle: boolean = false) => {
    if (songs.length === 0) return;
    
    let songsToPlay = [...songs];
    
    if (shuffle) {
      // Shuffle the songs
      songsToPlay = songsToPlay.sort(() => Math.random() - 0.5);
    }
    
    // Play the first song
    playTrack(songsToPlay[0]);
    
    // Add the rest to queue
    songsToPlay.slice(1).forEach((song: Song) => {
      addToQueue(song);
    });
    
    toast({
      title: shuffle ? "Shuffle Play" : "Play All",
      description: `Playing ${songs.length} songs${shuffle ? ' in shuffle mode' : ''}.`,
    });
  };

  const toggleLike = async (song: Song): Promise<boolean> => {
    try {
      const isCurrentlyLiked = isLiked(song.id);
      if (user && user.id) {
        if (isCurrentlyLiked) {
          await removeFromFavorites(song.id, user.id);
          setLikedSongs(prev => prev.filter(s => s.id !== song.id));
          toast({
            title: "Removed from Liked Songs",
            description: `${song.title} has been removed from your liked songs.`,
          });
          return false;
        } else {
          await addToFavorites(song, user.id);
          setLikedSongs(prev => [...prev, song]);
          toast({
            title: "Added to Liked Songs",
            description: `${song.title} has been added to your liked songs.`,
          });
          return true;
        }
      } else {
        toast({
          title: "Error",
          description: "You must be logged in to like songs.",
          variant: "destructive"
        });
        return isLiked(song.id);
      }
    } catch (error) {
      console.error('Error toggling song like:', error);
      return isLiked(song.id);
    }
  };

  // Function to refresh liked songs
  const refreshLikedSongs = async () => {
    if (!user?.id) {
      setLikedSongs([]);
      return;
    }
    
    setLikedSongsLoading(true);
    try {
      console.log('[PlayerContext] Refreshing liked songs for user:', user.id);
      const favorites = await getUserFavorites(user.id);
      console.log('[PlayerContext] Fetched favorites:', favorites.length, 'songs');
      setLikedSongs(favorites);
    } catch (error) {
      console.error('Error refreshing liked songs:', error);
      // Don't clear existing liked songs on error
    } finally {
      setLikedSongsLoading(false);
    }
  };

  // Load liked songs from Firestore on mount and when user changes
  useEffect(() => {
    refreshLikedSongs();
  }, [user]);

  const contextValue = {
    currentTrack,
    isPlaying,
    queue,
    volume,
    playbackRate,
    recentlyPlayed,
    likedSongs,
    likedSongsLoading,
    progress,
    duration,
    loopMode,
    shuffleMode,
    showQueue,
    autoPlayEnabled,
    isCurrentSong,
    setLikedSongs,
    setRecentlyPlayed,
    playTrack,
    togglePlayPause,
    addToQueue,
    removeFromQueue,
    clearQueue,
    setVolume: setVolumeValue,
    setPlaybackRate: setPlaybackRateValue,
    isLiked,
    toggleLike,
    nextTrack,
    prevTrack,
    previousTrack,
    seekToPosition,
    toggleLoopMode,
    toggleLoop,
    toggleShuffle,
    setDuration,
    setShowQueue,
    setAutoPlayEnabled,
    playPlaylist,
    refreshLikedSongs
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
