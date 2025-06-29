import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, ArrowLeft, Share2, Copy, Heart, ListPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { copyPlaylistShareUrl } from '@/services/playlistService';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for a moment
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

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
        <h2 className="text-xl font-bold mb-2">Shared Playlists Coming Soon!</h2>
        <p className="text-gray-400 mb-4">
          We're working on implementing shared playlists with Firebase. 
          For now, you can create and manage your own playlists.
        </p>
        <div className="flex gap-2 justify-center">
          <Button 
            onClick={() => navigate('/playlists')}
            className="bg-neon-purple hover:bg-neon-purple/80"
          >
            View My Playlists
          </Button>
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
          >
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SharedPlaylist; 