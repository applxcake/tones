import { useState, useEffect } from 'react';
import { MoreVertical, ListPlus, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayer } from '@/contexts/PlayerContext';
import { getUserPlaylists, addSongToPlaylist } from '@/services/playlistService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { YouTubeVideo } from '@/services/youtubeService';

interface SongOptionsMenuProps {
  song: YouTubeVideo;
}

const SongOptionsMenu = ({ song }: SongOptionsMenuProps) => {
  const { addToQueue, toggleLike, isLiked } = usePlayer();
  const { user } = useAuth();
  const { toast } = useToast();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Check if song is liked when component mounts
  useEffect(() => {
    setLiked(isLiked(song.id));
  }, [song.id, isLiked]);

  // Fetch user playlists when component mounts
  useEffect(() => {
    const fetchPlaylists = async () => {
      if (user && open) {
        try {
          setLoading(true);
          const userPlaylists = await getUserPlaylists(user.id);
          setPlaylists(userPlaylists || []);
        } catch (error) {
          console.error('Error fetching playlists:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchPlaylists();
  }, [user, open]);

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like songs.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLikeLoading(true);
      const isLikedNow = await toggleLike(song);
      setLiked(isLikedNow);
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Like Action Failed",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLikeLoading(false);
    }
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    if (user) {
      try {
        await addSongToPlaylist(playlistId, song, user.id);
      } catch (error) {
        console.error('Error adding song to playlist:', error);
      }
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "h-8 w-8 p-0 bg-black/50 backdrop-blur-sm transition-all",
            open ? "bg-white/20" : "hover:bg-white/10"
          )}
          style={{ opacity: open ? 1 : undefined }}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" className="w-56">
        <DropdownMenuItem onClick={() => addToQueue(song)}>
          <ListPlus className="mr-2 h-4 w-4" />
          Add to Queue
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleLike}
          disabled={likeLoading}
          className={likeLoading ? "opacity-70" : ""}
        >
          <Heart className={cn("mr-2 h-4 w-4", liked && "fill-neon-pink text-neon-pink")} />
          {liked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <ListPlus className="mr-2 h-4 w-4" />
            Add to Playlist
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {loading ? (
              <DropdownMenuLabel className="text-sm text-muted-foreground">
                Loading playlists...
              </DropdownMenuLabel>
            ) : playlists.length > 0 ? (
              playlists.map((playlist) => (
                <DropdownMenuItem 
                  key={playlist.id}
                  onClick={() => handleAddToPlaylist(playlist.id)}
                >
                  {playlist.name}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuLabel className="text-sm text-muted-foreground">
                No playlists found
              </DropdownMenuLabel>
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SongOptionsMenu;
