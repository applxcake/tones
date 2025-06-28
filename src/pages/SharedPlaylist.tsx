import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, ArrowLeft, Share2, Copy, Heart, ListPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSharedPlaylist, copyPlaylistShareUrl } from '@/services/playlistService';
import { usePlayer } from '@/contexts/PlayerContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import SocialShareButton from '@/components/SocialShareButton';

const SharedPlaylist = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const navigate = useNavigate();
  const { playTrack, addToQueue, isPlaying, currentTrack, playPlaylist } = usePlayer();
  const { user } = useAuth();
  const [playlist, setPlaylist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSharedPlaylist = async () => {
      if (shareToken) {
        setLoading(true);
        try {
          const playlistData = await getSharedPlaylist(shareToken);
          if (playlistData) {
            setPlaylist(playlistData);
          } else {
            setError('Playlist not found or no longer available');
          }
        } catch (error) {
          console.error('Error fetching shared playlist:', error);
          setError('Failed to load playlist');
        } finally {
          setLoading(false);
        }
      }
    };

    loadSharedPlaylist();
  }, [shareToken]);

  useEffect(() => {
    if (!loading && !playlist && !error) {
      navigate('/');
    }
  }, [playlist, navigate, loading, error]);

  if (loading) {
    return (
      <div className="pt-6 pb-24 animate-slide-in">
        <div className="flex justify-center py-12">
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div 
                key={i}
                className="w-2 h-2 bg-neon-purple rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-6 pb-24 animate-slide-in">
        <Button 
          variant="ghost" 
          className="flex items-center mb-6 animate-fade-in"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="py-12 text-center glass-panel rounded-lg animate-fade-in">
          <div className="text-red-400 mb-4">
            <Share2 className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-bold mb-2">Playlist Not Found</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button 
            onClick={() => navigate('/')}
            className="bg-neon-purple hover:bg-neon-purple/80"
          >
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return null;
  }

  const handlePlaySong = (song: any) => {
    playTrack(song);
  };

  const handlePlayAll = () => {
    if (playlist.songs.length > 0) {
      playPlaylist(playlist.songs, false);
    }
  };

  const handleShufflePlay = () => {
    if (playlist.songs.length > 0) {
      playPlaylist(playlist.songs, true);
    }
  };

  const handleCopyLink = async () => {
    if (playlist.shareToken) {
      await copyPlaylistShareUrl(playlist.shareToken);
    }
  };

  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <div className="pt-6 pb-24 animate-slide-in">
      <Button 
        variant="ghost" 
        className="flex items-center mb-6 animate-fade-in"
        onClick={handleBackClick}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>

      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div className="animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">{playlist.name}</h1>
              <div className="flex items-center gap-1 text-neon-purple">
                <Share2 className="h-4 w-4" />
                <span className="text-sm">Shared</span>
              </div>
            </div>
            {playlist.description && (
              <p className="mt-2 text-gray-400">{playlist.description}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              {playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'}
            </p>
          </div>

          <div className="flex space-x-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Button 
              onClick={handlePlayAll}
              disabled={playlist.songs.length === 0}
              className="flex items-center gap-2 hover-scale"
            >
              <Play className="h-4 w-4" />
              Play All
            </Button>

            <Button 
              onClick={handleShufflePlay}
              disabled={playlist.songs.length === 0}
              variant="outline"
              className="flex items-center gap-2 hover-scale"
            >
              <Play className="h-4 w-4" />
              Shuffle
            </Button>

            <Button 
              onClick={handleCopyLink}
              variant="outline"
              className="flex items-center gap-2 hover-scale"
            >
              <Copy className="h-4 w-4" />
              Copy Link
            </Button>

            <SocialShareButton
              url={window.location.href}
              title={playlist.name}
              description={`Check out this awesome playlist: ${playlist.name}`}
            />
          </div>
        </div>
      </div>

      {playlist.songs.length > 0 ? (
        <div className="space-y-2">
          {playlist.songs.map((song: any, index: number) => (
            <div 
              key={song.id} 
              className={cn(
                "flex items-center justify-between p-3 rounded-lg glass-panel hover:neon-glow-purple animate-fade-in",
                { "neon-glow-blue": currentTrack?.id === song.id && isPlaying }
              )}
              style={{ animationDelay: `${0.1 * (index % 10)}s` }}
            >
              <div className="flex items-center flex-1 min-w-0">
                <span className="text-sm text-gray-400 mr-3 w-6 text-center">
                  {index + 1}
                </span>
                <img 
                  src={song.thumbnailUrl} 
                  alt={song.title}
                  className="h-12 w-12 object-cover rounded mr-3"
                />
                <div className="min-w-0">
                  <h3 className="font-medium truncate">{song.title}</h3>
                  <p className="text-sm text-gray-400 truncate">{song.channelTitle}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => handlePlaySong(song)}
                  className="hover-scale"
                >
                  <Play className="h-4 w-4" />
                </Button>
                
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => addToQueue(song)}
                  className="hover-scale"
                >
                  <ListPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center glass-panel rounded-lg animate-fade-in">
          <p className="text-gray-400">This shared playlist is empty.</p>
        </div>
      )}
    </div>
  );
};

export default SharedPlaylist; 