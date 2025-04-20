
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { YouTubeVideo } from '@/services/youtubeService';
import { toast } from '@/components/ui/use-toast';

interface PlayerContextType {
  currentTrack: YouTubeVideo | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  recentlyPlayed: YouTubeVideo[];
  queue: YouTubeVideo[];
  playTrack: (track: YouTubeVideo) => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (volume: number) => void;
  addToQueue: (track: YouTubeVideo) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<YouTubeVideo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [recentlyPlayed, setRecentlyPlayed] = useState<YouTubeVideo[]>([]);
  const [queue, setQueue] = useState<YouTubeVideo[]>([]);

  // In a real app, you would use a YouTube Player library
  // This is a simplified implementation
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      // Update progress as the track plays
      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          const currentProgress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
          setProgress(isNaN(currentProgress) ? 0 : currentProgress);
        }
      });
      
      // When track ends, play next track
      audioRef.current.addEventListener('ended', () => {
        nextTrack();
      });
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Update audio source when currentTrack changes
  useEffect(() => {
    if (currentTrack && audioRef.current) {
      // In a real app, you would use the YouTube API to get the audio stream
      // For demonstration, we'll simulate with a placeholder
      // audioRef.current.src = `https://example.com/audio/${currentTrack.id}.mp3`;
      
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error('Failed to play:', error);
          toast({
            title: "Demo Mode",
            description: "This is a demo application. In a real app, you would connect to YouTube's IFrame API for actual playback.",
            variant: "default"
          });
        });
      }
    }
  }, [currentTrack]);

  // Update playing state
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error('Failed to play:', error);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const playTrack = (track: YouTubeVideo) => {
    // Add current track to recently played if it exists
    if (currentTrack) {
      setRecentlyPlayed(prev => {
        // Filter out this track if it's already in the list
        const filtered = prev.filter(item => item.id !== currentTrack.id);
        // Add it to the beginning and limit to 20 items
        return [currentTrack, ...filtered].slice(0, 20);
      });
    }
    
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    if (queue.length > 0) {
      // Play the next track in the queue
      const nextUp = queue[0];
      setQueue(prev => prev.slice(1));
      playTrack(nextUp);
    } else {
      // No more tracks in queue
      setIsPlaying(false);
    }
  };

  const prevTrack = () => {
    if (recentlyPlayed.length > 0) {
      // Play the previous track from history
      const prevTrack = recentlyPlayed[0];
      setRecentlyPlayed(prev => prev.slice(1));
      // Add current track to the beginning of the queue if it exists
      if (currentTrack) {
        setQueue(prev => [currentTrack, ...prev]);
      }
      setCurrentTrack(prevTrack);
      setIsPlaying(true);
    }
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
  };

  const addToQueue = (track: YouTubeVideo) => {
    setQueue(prev => [...prev, track]);
    toast({
      title: "Added to Queue",
      description: `"${track.title}" added to your queue.`,
    });
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        progress,
        volume,
        recentlyPlayed,
        queue,
        playTrack,
        togglePlayPause,
        nextTrack,
        prevTrack,
        setVolume,
        addToQueue,
      }}
    >
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
