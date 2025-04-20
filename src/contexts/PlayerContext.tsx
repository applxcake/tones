import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { YouTubeVideo, YouTubeVideoBasic } from '@/services/youtubeService';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PlayerContextType {
  currentTrack: YouTubeVideo | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  recentlyPlayed: YouTubeVideoBasic[];
  queue: YouTubeVideo[];
  likedSongs: YouTubeVideoBasic[];
  playTrack: (track: YouTubeVideo) => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (volume: number) => void;
  addToQueue: (track: YouTubeVideo) => void;
  toggleLike: (track: YouTubeVideo) => Promise<boolean>;
  isLiked: (trackId: string) => boolean;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentTrack, setCurrentTrack] = useState<YouTubeVideo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [recentlyPlayed, setRecentlyPlayed] = useState<YouTubeVideoBasic[]>([]);
  const [queue, setQueue] = useState<YouTubeVideo[]>([]);
  const [likedSongs, setLikedSongs] = useState<YouTubeVideoBasic[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
      
      audioRef.current.addEventListener('ended', () => {
        nextTrack();
      });
      
      audioRef.current.addEventListener('timeupdate', () => {
        const duration = audioRef.current?.duration || 0;
        const currentTime = audioRef.current?.currentTime || 0;
        if (duration > 0) {
          setProgress((currentTime / duration) * 100);
        }
      });
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', () => {});
        audioRef.current.removeEventListener('timeupdate', () => {});
        audioRef.current = null;
      }
    };
  }, []);
  
  useEffect(() => {
    const fetchLikedSongs = async () => {
      if (!user?.id) {
        setLikedSongs([]);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('liked_songs')
          .select('songs(*)')
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        const songs = data?.map(item => ({
          id: item.songs.id,
          title: item.songs.title,
          thumbnail: item.songs.thumbnail_url || '',
          channelTitle: item.songs.channel_title || 'Unknown',
          publishedAt: new Date().toISOString() // Default publishedAt
        })) || [];
        
        setLikedSongs(songs);
      } catch (error) {
        console.error('Error loading liked songs:', error);
      }
    };
    
    fetchLikedSongs();
  }, [user]);
  
  useEffect(() => {
    const fetchRecentlyPlayed = async () => {
      if (!user?.id) {
        setRecentlyPlayed([]);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('recently_played')
          .select('songs(*)')
          .eq('user_id', user.id)
          .order('played_at', { ascending: false })
          .limit(20);
          
        if (error) throw error;
        
        const songs = data?.map(item => ({
          id: item.songs.id,
          title: item.songs.title,
          thumbnail: item.songs.thumbnail_url || '',
          channelTitle: item.songs.channel_title || 'Unknown',
          publishedAt: new Date().toISOString() // Default publishedAt
        })) || [];
        
        setRecentlyPlayed(songs);
      } catch (error) {
        console.error('Error loading recently played:', error);
      }
    };
    
    fetchRecentlyPlayed();
  }, [user]);
  
  useEffect(() => {
    if (currentTrack) {
      if (isPlaying && audioRef.current) {
        const audioUrl = `https://open.spotify.com/embed/track/${currentTrack.id}`;
        
        if (audioRef.current.src !== audioUrl) {
          audioRef.current.src = audioUrl;
        }
        
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
          toast({
            title: "Playback Error",
            description: "Preview not available. Spotify API limitations apply.",
            variant: "destructive"
          });
          nextTrack();
        });
      } else if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [currentTrack, isPlaying]);
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const playTrack = async (track: YouTubeVideo) => {
    if (currentTrack && user?.id) {
      try {
        const { data: existingSong } = await supabase
          .from('songs')
          .select('*')
          .eq('id', currentTrack.id)
          .single();
        
        if (!existingSong) {
          await supabase
            .from('songs')
            .insert([{
              id: currentTrack.id,
              title: currentTrack.title,
              thumbnail_url: currentTrack.thumbnail,
              channel_title: currentTrack.channelTitle,
            }]);
        }
        
        await supabase
          .from('recently_played')
          .upsert(
            {
              user_id: user.id,
              song_id: currentTrack.id,
              played_at: new Date().toISOString()
            },
            {
              onConflict: 'user_id,song_id',
              ignoreDuplicates: false
            }
          );
          
        const updatedRecently = [
          {
            id: currentTrack.id,
            title: currentTrack.title,
            thumbnail: currentTrack.thumbnail,
            channelTitle: currentTrack.channelTitle,
            publishedAt: currentTrack.publishedAt
          },
          ...recentlyPlayed.filter(item => item.id !== currentTrack.id)
        ].slice(0, 20);
        
        setRecentlyPlayed(updatedRecently);
      } catch (error) {
        console.error("Error saving recently played:", error);
      }
    }
    
    if (user?.id) {
      try {
        const { data: existingSong } = await supabase
          .from('songs')
          .select('*')
          .eq('id', track.id)
          .single();
        
        if (!existingSong) {
          await supabase
            .from('songs')
            .insert([{
              id: track.id,
              title: track.title,
              thumbnail_url: track.thumbnail,
              channel_title: track.channelTitle,
            }]);
        }
      } catch (error) {
        console.error("Error saving song:", error);
      }
    }
    
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    if (queue.length > 0) {
      const nextUp = queue[0];
      setQueue(prev => prev.slice(1));
      playTrack(nextUp);
    } else {
      setIsPlaying(false);
    }
  };

  const prevTrack = () => {
    if (recentlyPlayed.length > 0 && currentTrack) {
      const prevTrack = recentlyPlayed[0];
      const prevTrackComplete: YouTubeVideo = {
        ...prevTrack,
        description: '',
        channelTitle: prevTrack.channelTitle || 'Unknown Artist',
      };
      
      setQueue(prev => [currentTrack, ...prev]);
      setCurrentTrack(prevTrackComplete);
      setIsPlaying(true);
      setRecentlyPlayed(prev => prev.slice(1));
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
  
  const toggleLike = async (track: YouTubeVideo) => {
    if (!user?.id) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like songs.",
        variant: "destructive"
      });
      return false;
    }
    
    const isCurrentlyLiked = likedSongs.some(song => song.id === track.id);
    
    try {
      const { data: existingSong } = await supabase
        .from('songs')
        .select('*')
        .eq('id', track.id)
        .single();
      
      if (!existingSong) {
        await supabase
          .from('songs')
          .insert([{
            id: track.id,
            title: track.title,
            thumbnail_url: track.thumbnail,
            channel_title: track.channelTitle,
          }]);
      }
      
      if (isCurrentlyLiked) {
        const { error } = await supabase
          .from('liked_songs')
          .delete()
          .eq('user_id', user.id)
          .eq('song_id', track.id);
          
        if (error) throw error;
        
        setLikedSongs(prev => prev.filter(song => song.id !== track.id));
        
        return false;
      } else {
        const { error } = await supabase
          .from('liked_songs')
          .insert([{
            user_id: user.id,
            song_id: track.id,
          }]);
          
        if (error) throw error;
        
        const newLikedSong = {
          id: track.id,
          title: track.title,
          thumbnail: track.thumbnail,
          channelTitle: track.channelTitle,
          publishedAt: track.publishedAt
        };
        
        setLikedSongs(prev => [...prev, newLikedSong]);
        
        return true;
      }
    } catch (error) {
      console.error("Error toggling liked song:", error);
      toast({
        title: "Error",
        description: "Could not update liked songs.",
        variant: "destructive"
      });
      return isCurrentlyLiked;
    }
  };
  
  const isLiked = (trackId: string) => {
    return likedSongs.some(song => song.id === trackId);
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
        likedSongs,
        playTrack,
        togglePlayPause,
        nextTrack,
        prevTrack,
        setVolume,
        addToQueue,
        toggleLike,
        isLiked,
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
