
import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { YouTubeVideo } from '@/services/youtubeService';
import { executeQuery, generateId } from '@/integrations/tidb/client';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/use-toast';

interface PlayerContextType {
  currentTrack: YouTubeVideo | null;
  queue: YouTubeVideo[];
  isPlaying: boolean;
  volume: number;
  likedSongs: YouTubeVideo[];
  recentlyPlayed: YouTubeVideo[];
  progress: number; // Added for progress tracking
  duration: number; // Added for total duration
  playTrack: (track: YouTubeVideo) => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  prevTrack: () => void; // Alias for previousTrack
  addToQueue: (track: YouTubeVideo) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setVolume: (volume: number) => void;
  toggleLike: (track: YouTubeVideo) => Promise<boolean>;
  isLiked: (trackId: string) => boolean;
  seekToPosition: (progressPercentage: number) => void; // Added for seeking
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

interface PlayerProviderProps {
  children: ReactNode;
}

export const PlayerProvider = ({ children }: PlayerProviderProps) => {
  const { user } = useAuth();
  const [currentTrack, setCurrentTrack] = useState<YouTubeVideo | null>(null);
  const [queue, setQueue] = useState<YouTubeVideo[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8); // Default to 80%
  const [likedSongs, setLikedSongs] = useState<YouTubeVideo[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<YouTubeVideo[]>([]);
  const [progress, setProgress] = useState(0); // Track playback progress (0-100)
  const [duration, setDuration] = useState(0); // Track duration in seconds
  
  // YouTube player reference
  const playerRef = useRef<YT.Player | null>(null);

  // Initialize YouTube API
  useEffect(() => {
    // Create YouTube IFrame API script
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      
      // Create hidden YouTube player container if it doesn't exist
      if (!document.getElementById('youtube-player-container')) {
        const playerContainer = document.createElement('div');
        playerContainer.id = 'youtube-player-container';
        playerContainer.style.position = 'absolute';
        playerContainer.style.visibility = 'hidden';
        playerContainer.style.left = '-9999px';
        playerContainer.style.top = '-9999px';
        document.body.appendChild(playerContainer);
      }
    }
    
    // Initialize player when API is ready
    window.onYouTubeIframeAPIReady = initializeYouTubePlayer;
    
    // If API already loaded, initialize player directly
    if (window.YT && window.YT.Player) {
      initializeYouTubePlayer();
    }
    
    return () => {
      // Cleanup
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, []);
  
  // Initialize YouTube player
  const initializeYouTubePlayer = () => {
    if (window.YT && window.YT.Player) {
      playerRef.current = new window.YT.Player('youtube-player-container', {
        height: '0',
        width: '0',
        playerVars: {
          autoplay: 0,
          controls: 0,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    }
  };
  
  const onPlayerReady = (event: YT.PlayerEvent) => {
    // Set initial volume
    event.target.setVolume(volume * 100);
    
    // Load current track if exists
    if (currentTrack) {
      loadVideo(currentTrack.id);
    }
  };
  
  const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
    // Update playing state based on player state
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      startProgressTracker();
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      setIsPlaying(false);
      stopProgressTracker();
    } else if (event.data === window.YT.PlayerState.ENDED) {
      // Auto play next song
      setIsPlaying(false);
      stopProgressTracker();
      nextTrack();
    }
  };
  
  // Progress tracking
  const progressIntervalRef = useRef<number | null>(null);
  
  const startProgressTracker = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    progressIntervalRef.current = window.setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime && playerRef.current.getDuration) {
        const currentTime = playerRef.current.getCurrentTime() || 0;
        const totalDuration = playerRef.current.getDuration() || 0;
        
        setProgress((currentTime / totalDuration) * 100);
        setDuration(totalDuration);
      }
    }, 1000);
  };
  
  const stopProgressTracker = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };
  
  // Load and play a video
  const loadVideo = (videoId: string) => {
    if (playerRef.current && playerRef.current.loadVideoById) {
      playerRef.current.loadVideoById({
        videoId,
        startSeconds: 0,
      });
    }
  };
  
  // Fetch liked songs when user changes
  useEffect(() => {
    const fetchLikedSongs = async () => {
      if (!user?.id) {
        setLikedSongs([]);
        return;
      }
      
      try {
        // Get liked song IDs from the database
        const likedSongsData = await executeQuery<any[]>(
          `SELECT s.* FROM songs s 
           JOIN liked_songs ls ON s.id = ls.song_id 
           WHERE ls.user_id = ?
           ORDER BY ls.liked_at DESC`,
          [user.id]
        );
        
        if (likedSongsData && likedSongsData.length > 0) {
          const songs = likedSongsData.map(song => ({
            id: song.id,
            title: song.title,
            thumbnailUrl: song.thumbnail_url,
            channelTitle: song.artist || '',
            publishedAt: song.created_at || new Date().toISOString(),
          }));
          
          setLikedSongs(songs);
        } else {
          setLikedSongs([]);
        }
      } catch (error) {
        console.error('Error fetching liked songs:', error);
        setLikedSongs([]);
      }
    };
    
    fetchLikedSongs();
  }, [user]);
  
  // Fetch recently played songs
  useEffect(() => {
    const fetchRecentlyPlayed = async () => {
      if (!user?.id) {
        setRecentlyPlayed([]);
        return;
      }
      
      try {
        const recentlyPlayedData = await executeQuery<any[]>(
          `SELECT s.* FROM songs s 
           JOIN listening_history lh ON s.id = lh.song_id 
           WHERE lh.user_id = ? 
           ORDER BY lh.played_at DESC 
           LIMIT 20`,
          [user.id]
        );
        
        if (recentlyPlayedData && recentlyPlayedData.length > 0) {
          const songs = recentlyPlayedData.map(song => ({
            id: song.id,
            title: song.title,
            thumbnailUrl: song.thumbnail_url,
            channelTitle: song.artist || '',
            publishedAt: song.created_at || new Date().toISOString(),
          }));
          
          setRecentlyPlayed(songs);
        }
      } catch (error) {
        console.error('Error fetching recently played:', error);
      }
    };
    
    fetchRecentlyPlayed();
  }, [user]);
  
  // Record song play in listening history
  const recordPlay = async (track: YouTubeVideo) => {
    if (!user?.id || !track?.id) return;
    
    try {
      // First, ensure the song exists in the songs table
      const existingSong = await executeQuery<any[]>(
        `SELECT * FROM songs WHERE id = ?`,
        [track.id]
      );
      
      if (!existingSong.length) {
        await executeQuery(
          `INSERT INTO songs (id, title, artist, thumbnail_url) 
           VALUES (?, ?, ?, ?)`,
          [track.id, track.title, track.channelTitle, track.thumbnailUrl]
        );
      }
      
      // Add to listening history
      await executeQuery(
        `INSERT INTO listening_history (user_id, song_id) 
         VALUES (?, ?)`,
        [user.id, track.id]
      );
      
      // Update recently played state
      const updatedRecentlyPlayed = [track, ...recentlyPlayed.filter(s => s.id !== track.id)].slice(0, 20);
      setRecentlyPlayed(updatedRecentlyPlayed);
    } catch (error) {
      console.error('Error recording play:', error);
    }
  };
  
  const playTrack = (track: YouTubeVideo) => {
    setCurrentTrack(track);
    
    if (playerRef.current && playerRef.current.loadVideoById) {
      loadVideo(track.id);
      setIsPlaying(true);
    }
    
    recordPlay(track);
  };
  
  const togglePlayPause = () => {
    if (!playerRef.current) return;
    
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const nextTrack = () => {
    if (queue.length === 0) {
      setIsPlaying(false);
      return;
    }
    
    const nextSong = queue[0];
    const newQueue = queue.slice(1);
    
    setCurrentTrack(nextSong);
    setQueue(newQueue);
    loadVideo(nextSong.id);
    recordPlay(nextSong);
  };
  
  const previousTrack = () => {
    if (!playerRef.current) return;
    
    // For simplicity, just restart the current track
    playerRef.current.seekTo(0, true);
    setIsPlaying(true);
  };
  
  // Alias for previousTrack to fix the build error
  const prevTrack = previousTrack;
  
  const seekToPosition = (progressPercentage: number) => {
    if (!playerRef.current || !duration) return;
    
    const seekTime = (progressPercentage / 100) * duration;
    playerRef.current.seekTo(seekTime, true);
    setProgress(progressPercentage);
  };
  
  const handleVolumeChange = (newVolume: number) => {
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume * 100);
    }
    
    setVolume(newVolume);
  };
  
  const addToQueue = (track: YouTubeVideo) => {
    setQueue([...queue, track]);
    toast({
      title: "Added to Queue",
      description: `${track.title} has been added to your queue.`,
    });
  };
  
  const removeFromQueue = (index: number) => {
    const newQueue = [...queue];
    newQueue.splice(index, 1);
    setQueue(newQueue);
  };
  
  const clearQueue = () => {
    setQueue([]);
  };
  
  const isLiked = (trackId: string) => {
    return likedSongs.some(song => song.id === trackId);
  };
  
  const toggleLike = async (track: YouTubeVideo): Promise<boolean> => {
    if (!user?.id) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like songs.",
        variant: "destructive"
      });
      return false;
    }
    
    try {
      const isCurrentlyLiked = isLiked(track.id);
      
      if (isCurrentlyLiked) {
        // Unlike the song
        await executeQuery(
          `DELETE FROM liked_songs WHERE user_id = ? AND song_id = ?`,
          [user.id, track.id]
        );
        
        setLikedSongs(prev => prev.filter(song => song.id !== track.id));
        
        toast({
          title: "Removed from Liked Songs",
          description: `${track.title} has been removed from your liked songs.`,
        });
        
        return false;
      } else {
        // First, ensure the song exists in the songs table
        const existingSong = await executeQuery<any[]>(
          `SELECT * FROM songs WHERE id = ?`,
          [track.id]
        );
        
        if (!existingSong.length) {
          await executeQuery(
            `INSERT INTO songs (id, title, artist, thumbnail_url) 
             VALUES (?, ?, ?, ?)`,
            [track.id, track.title, track.channelTitle, track.thumbnailUrl]
          );
        }
        
        // Like the song
        await executeQuery(
          `INSERT INTO liked_songs (user_id, song_id) 
           VALUES (?, ?)`,
          [user.id, track.id]
        );
        
        setLikedSongs(prev => [track, ...prev]);
        
        toast({
          title: "Added to Liked Songs",
          description: `${track.title} has been added to your liked songs.`,
          className: "animate-bounce"
        });
        
        return true;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update your liked songs. Please try again.",
        variant: "destructive"
      });
      return isLiked(track.id);
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        queue,
        isPlaying,
        volume,
        likedSongs,
        recentlyPlayed,
        progress,
        duration,
        playTrack,
        togglePlayPause,
        nextTrack,
        previousTrack,
        prevTrack,
        addToQueue,
        removeFromQueue,
        clearQueue,
        setVolume: handleVolumeChange,
        toggleLike,
        isLiked,
        seekToPosition,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
