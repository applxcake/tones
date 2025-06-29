import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayCircle, ArrowLeft, Share2, Copy, ListMusic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPlaylistByShareToken, getPlaylistShareUrl, copyPlaylistShareUrl } from '@/services/playlistService';
import { getMultipleVideoDetails } from '@/services/youtubeService';
import { usePlayer } from '@/contexts/PlayerContext';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

const SharedPlaylist = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const navigate = useNavigate();
  const { playPlaylist } = usePlayer();
  const [loading, setLoading] = useState(true);
  const [playlist, setPlaylist] = useState<any>(null);
  const [songs, setSongs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaylist = async () => {
      setLoading(true);
      setError(null);
      if (!shareToken) {
        setError('No share token provided.');
        setLoading(false);
        return;
      }
      const pl = await getPlaylistByShareToken(shareToken);
      if (!pl || !pl.isPublic) {
        setError('This playlist is private or does not exist.');
        setLoading(false);
        return;
      }
      setPlaylist(pl);
      if (pl.songs && pl.songs.length > 0) {
        const songObjs = await getMultipleVideoDetails(pl.songs);
        setSongs(songObjs.filter(Boolean));
      } else {
        setSongs([]);
      }
      setLoading(false);
    };
    fetchPlaylist();
  }, [shareToken]);

  const handleCopyLink = () => {
    if (playlist?.shareToken) {
      copyPlaylistShareUrl(playlist.shareToken);
      toast({ title: 'Link copied!', description: 'Playlist share link copied to clipboard.' });
    }
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playPlaylist(songs, false);
    }
  };

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
          <div className="text-neon-purple mb-4">
            <Share2 className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-bold mb-2">Unable to load playlist</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={() => navigate('/playlists')} className="bg-neon-purple hover:bg-neon-purple/80">View My Playlists</Button>
        </div>
      </div>
    );
  }

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

      <div className="max-w-2xl mx-auto glass-panel rounded-lg p-6 animate-fade-in">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-neon-purple/20 rounded-lg p-3">
            <ListMusic className="h-10 w-10 text-neon-purple" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">{playlist?.name}</h2>
            <p className="text-gray-400 text-sm mb-1">{playlist?.description}</p>
            <div className="flex gap-2 items-center">
              <Button size="sm" variant="outline" onClick={handleCopyLink} className="flex items-center gap-1">
                <Copy className="h-4 w-4" /> Copy Link
              </Button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <Button onClick={handlePlayAll} disabled={songs.length === 0} className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5" /> Play All
          </Button>
          <span className="text-gray-400 text-sm">{songs.length} {songs.length === 1 ? 'song' : 'songs'}</span>
        </div>
        {songs.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No songs in this playlist.</div>
        ) : (
          <div className="space-y-2">
            {songs.map((song, idx) => (
              <div key={song.id} className="flex items-center justify-between p-3 rounded-lg glass-card hover:neon-glow-purple animate-fade-in">
                <div className="flex items-center gap-3">
                  <img src={song.thumbnailUrl} alt={song.title} className="w-12 h-12 rounded-md object-cover" />
                  <div>
                    <div className="font-semibold text-white truncate max-w-xs" title={song.title}>{song.title}</div>
                    <div className="text-xs text-gray-400">{song.channelTitle}</div>
                  </div>
                </div>
                {/* No remove/like/add buttons for shared view */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedPlaylist; 