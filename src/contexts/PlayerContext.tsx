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
  progress: number; 
  duration: number;
  loopMode: 'none' | 'one' | 'all';
  playTrack: (track: YouTubeVideo) => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  prevTrack: () => void;
  addToQueue: (track: YouTubeVideo) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setVolume: (volume: number) => void;
  toggleLike: (track: YouTubeVideo) => Promise<boolean>;
  isLiked: (trackId: string) => boolean;
  seekToPosition: (progressPercentage: number) => void;
  toggleLoopMode: () => void;
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
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLikeInProgress, setIsLikeInProgress] = useState(false);
  const [loopMode, setLoopMode] = useState<'none' | 'one' | 'all'>('none');
  
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
      const existingContainer = document.getElementById('youtube-player-container');
      if (!existingContainer) {
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
  
  // Initialize YouTube player with fixed error handling
  const initializeYouTubePlayer = () => {
    try {
      if (window.YT && window.YT.Player) {
        if (playerRef.current) {
          // Clean up existing player instance before creating new one
          playerRef.current.destroy();
        }
        
        playerRef.current = new window.YT.Player('youtube-player-container', {
          height: '0',
          width: '0',
          playerVars: {
            autoplay: 0,
            controls: 0,
            enablejsapi: 1,
            origin: window.location.origin,
            rel: 0,
          },
          events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
            onError: (e) => console.error('YouTube player error:', e),
          },
        });
        
        console.log('YouTube player initialized');
      } else {
        console.warn('YouTube API not available yet');
        // Retry initialization after a short delay
        setTimeout(initializeYouTubePlayer, 1000);
      }
    } catch (error) {
      console.error('Error initializing YouTube player:', error);
    }
  };
  
  const onPlayerReady = (event: YT.PlayerEvent) => {
    console.log('Player ready');
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
      // Handle end of track based on loop mode
      if (loopMode === 'one') {
        // Replay the current song
        playerRef.current?.seekTo(0, true);
        playerRef.current?.playVideo();
      } else if (loopMode === 'all') {
        // Play next song or loop back to first if queue is empty
        if (queue.length > 0) {
          nextTrack();
        } else if (currentTrack) {
          // Replay the current song if it's the only one in the loop
          playerRef.current?.seekTo(0, true);
          playerRef.current?.playVideo();
        } else {
          setIsPlaying(false);
          stopProgressTracker();
        }
      } else {
        // Default behavior - play next or stop
        setIsPlaying(false);
        stopProgressTracker();
        nextTrack();
      }
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
  
  // Load and play a video with improved error handling
  const loadVideo = (videoId: string) => {
    try {
      if (playerRef.current && playerRef.current.loadVideoById) {
        console.log('Loading video:', videoId);
        playerRef.current.loadVideoById({
          videoId,
          startSeconds: 0,
        });
      } else {
        console.warn('Player not ready for loading video');
        // If player isn't ready, retry after a short delay
        setTimeout(() => {
          if (playerRef.current && playerRef.current.loadVideoById) {
            playerRef.current.loadVideoById({
              videoId,
              startSeconds: 0,
            });
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error loading video:', error);
      toast({
        title: "Playback Error",
        description: "Could not play this track. Please try again.",
        variant: "destructive"
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
        const likedSongsData = await executeQuery(
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
        const recentlyPlayedData = await executeQuery(
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
      const existingSong = await executeQuery(
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
    console.log('Playing track:', track);
    setCurrentTrack(track);
    
    if (!track.id) {
      console.error('Invalid track ID');
      toast({
        title: "Playback Error",
        description: "Invalid track data",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (playerRef.current && playerRef.current.loadVideoById) {
        loadVideo(track.id);
        setIsPlaying(true);
      } else {
        console.warn('Player reference not available');
        // If YouTube API hasn't loaded yet, try to initialize it
        initializeYouTubePlayer();
        // And retry playing after a delay
        setTimeout(() => {
          if (playerRef.current && playerRef.current.loadVideoById) {
            loadVideo(track.id);
            setIsPlaying(true);
          }
        }, 1500);
      }
      
      recordPlay(track);
    } catch (error) {
      console.error('Error playing track:', error);
      toast({
        title: "Playback Error",
        description: "Could not play this track. Please try again.",
        variant: "destructive"
      });
    }
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
      if (loopMode === 'all' && currentTrack) {
        // Loop back to current track
        playerRef.current?.seekTo(0, true);
        setIsPlaying(true);
        return;
      } else {
        setIsPlaying(false);
        return;
      }
    }
    
    const nextSong = queue[0];
    const newQueue = queue.slice(1);
    
    // If looping all, add current song to end of queue if it exists
    if (loopMode === 'all' && currentTrack) {
      setQueue([...newQueue, currentTrack]);
    } else {
      setQueue(newQueue);
    }
    
    setCurrentTrack(nextSong);
    loadVideo(nextSong.id);
    recordPlay(nextSong);
  };
  
  // Toggle through loop modes: none -> one -> all -> none
  const toggleLoopMode = () => {
    setLoopMode(current => {
      const nextMode = current === 'none' ? 'one' : current === 'one' ? 'all' : 'none';
      
      toast({
        title: `Loop mode: ${nextMode}`,
        description: nextMode === 'none' ? 
          'Loop disabled' : 
          nextMode === 'one' ? 
          'Repeating current song' : 
          'Looping playlist',
        variant: "default",
      });
      
      return nextMode;
    });
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
    
    // Prevent multiple rapid clicks
    if (isLikeInProgress) {
      return isLiked(track.id);
    }
    
    try {
      setIsLikeInProgress(true);
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
        
        setIsLikeInProgress(false);
        return false;
      } else {
        // First, ensure the song exists in the songs table
        const existingSong = await executeQuery(
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
        });
        
        setIsLikeInProgress(false);
        return true;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update your liked songs. Please try again.",
        variant: "destructive"
      });
      setIsLikeInProgress(false);
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
        loopMode,
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
        toggleLoopMode,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
