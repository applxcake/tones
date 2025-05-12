
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { YouTubeVideo } from '@/services/youtubeService';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  progress: number; 
  duration: number; 
  loopMode: LoopMode; 
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
  seekToPosition: (position: number) => void;
  toggleLoopMode: () => void;
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
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loopMode, setLoopMode] = useState<LoopMode>('none');

  const playTrack = useCallback(async (song: Song) => {
    setCurrentTrack(song);
    setIsPlaying(true);

    // Update recently played list locally
    setRecentlyPlayed(prev => {
      const newRecentlyPlayed = [song, ...prev.filter(s => s.id !== song.id)].slice(0, 20);
      return newRecentlyPlayed;
    });

    // Save to Supabase if user is logged in
    try {
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // First ensure the song exists in the songs table
        const { data: songExists } = await supabase
          .from('songs')
          .select('id')
          .eq('id', song.id)
          .maybeSingle();
          
        if (!songExists) {
          // Add song to songs table
          await supabase.from('songs').insert({
            id: song.id,
            title: song.title,
            channel_title: song.channelTitle,
            thumbnail_url: song.thumbnailUrl,
          });
        }
        
        // Add to recently_played
        await supabase.from('recently_played').insert({
          user_id: user.id,
          song_id: song.id,
          played_at: new Date().toISOString()
        });
        
        console.log('Saved song to recently played in Supabase');
      }
    } catch (error) {
      console.error('Error saving recently played song:', error);
      // Continue without interrupting user experience
    }
  }, []);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const addToQueue = (song: Song) => {
    setQueue(prev => [...prev, song]);
  };

  const removeFromQueue = (songId: string) => {
    setQueue(prev => prev.filter(song => song.id !== songId));
  };

  const clearQueue = () => {
    setQueue([]);
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

  // Add new functions for player navigation
  const nextTrack = () => {
    // If queue is empty, do nothing
    if (queue.length === 0) return;
    
    // Play the next song in queue
    const nextSong = queue[0];
    setQueue(prev => prev.slice(1));
    playTrack(nextSong);
  };
  
  const prevTrack = () => {
    // If no recent tracks, do nothing
    if (recentlyPlayed.length <= 1) return;
    
    // Play the previous song from recently played
    const prevSong = recentlyPlayed[1]; // Current track is at index 0
    playTrack(prevSong);
  };
  
  // Add function to seek to a position in the current track
  const seekToPosition = (newProgress: number) => {
    setProgress(newProgress);
    // Here we would also need to update the actual player position
    // This would interact with the YouTube player API in a real implementation
  };
  
  // Add function to toggle loop mode
  const toggleLoopMode = () => {
    setLoopMode(current => {
      if (current === 'none') return 'all';
      if (current === 'all') return 'one';
      return 'none';
    });
  };

  // Modified toggleLike function to sync with Supabase
  const toggleLike = async (song: Song): Promise<boolean> => {
    try {
      const isCurrentlyLiked = isLiked(song.id);
      
      if (isCurrentlyLiked) {
        // Remove from liked songs locally
        setLikedSongs(prev => prev.filter(s => s.id !== song.id));
        
        // Remove from Supabase if user is logged in
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('liked_songs')
            .delete()
            .eq('user_id', user.id)
            .eq('song_id', song.id);
            
          console.log('Removed song from liked songs in Supabase');
        }
        
        return false;
      } else {
        // First, ensure the song exists in the songs table
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Check if song exists
          const { data: songExists } = await supabase
            .from('songs')
            .select('id')
            .eq('id', song.id)
            .maybeSingle();
            
          if (!songExists) {
            // Add song to songs table
            await supabase.from('songs').insert({
              id: song.id,
              title: song.title,
              channel_title: song.channelTitle,
              thumbnail_url: song.thumbnailUrl,
            });
          }
          
          // Add to liked_songs
          await supabase.from('liked_songs').insert({
            user_id: user.id,
            song_id: song.id,
            liked_at: new Date().toISOString()
          });
          
          console.log('Added song to liked songs in Supabase');
        }
        
        // Add to liked songs locally
        setLikedSongs(prev => [...prev, song]);
        return true;
      }
    } catch (error) {
      console.error('Error toggling song like:', error);
      return isLiked(song.id); // Return current state if error
    }
  };

  // Make setLikedSongs available to the SupabaseInitializer
  const contextValue = {
    currentTrack,
    isPlaying,
    queue,
    volume,
    playbackRate,
    recentlyPlayed,
    likedSongs,
    progress,
    duration,
    loopMode,
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
    seekToPosition,
    toggleLoopMode,
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
