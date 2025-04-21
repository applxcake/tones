
import React, { useState, useEffect } from 'react';
import { MoreVertical, ListPlus, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayer } from '@/contexts/PlayerContext';
import { getUserPlaylists, addSongToPlaylist } from '@/services/playlistService';
import { useAuth } from '@/contexts/AuthContext';
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
import { toast } from '@/components/ui/use-toast';

interface SongOptionsMenuProps {
  song: YouTubeVideo;
}

const SongOptionsMenu = ({ song }: SongOptionsMenuProps) => {
  const { addToQueue, toggleLike, isLiked } = usePlayer();
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Check if song is liked when component mounts or when isOpen changes
  useEffect(() => {
    if (isOpen) {
      setLiked(isLiked(song.id));
    }
  }, [song.id, isLiked, isOpen]);

  // Fetch user playlists when dropdown is opened
  useEffect(() => {
    const fetchPlaylists = async () => {
      if (user && isOpen) {
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
  }, [user, isOpen]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const isLikedNow = await toggleLike(song);
      setLiked(isLikedNow);
      setIsOpen(false); // Close the menu after action
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    if (user) {
      try {
        const result = await addSongToPlaylist(playlistId, song, user.id);
        setIsOpen(false); // Close the menu after action
        return result;
      } catch (error) {
        console.error('Error adding song to playlist:', error);
        toast({
          title: "Error",
          description: "Failed to add song to playlist. Please try again.",
          variant: "destructive"
        });
        return false;
      }
    } else {
      toast({
        title: "Sign in required",
        description: "Please sign in to add songs to playlists.",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleAddToQueue = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToQueue(song);
    setIsOpen(false); // Close the menu after action
  };

  // Prevent click on the button from propagating to parent elements
  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen(!isOpen); // Toggle menu open state
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild onClick={handleTriggerClick}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0 hover:bg-white/10 animate-fade-in"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="right"
        align="start"
        className="w-56 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem onClick={handleAddToQueue} className="hover-scale">
          <ListPlus className="mr-2 h-4 w-4" />
          Add to Queue
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleLike} className="hover-scale">
          <Heart className={cn("mr-2 h-4 w-4", liked && "fill-neon-pink text-neon-pink")} />
          {liked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="hover-scale">
            <ListPlus className="mr-2 h-4 w-4" />
            Add to Playlist
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="animate-fade-in">
            {loading ? (
              <DropdownMenuLabel className="text-sm text-muted-foreground">
                <div className="flex justify-center py-2">
                  <div className="flex gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div 
                        key={i}
                        className="w-1 h-1 bg-primary rounded-full animate-pulse"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </DropdownMenuLabel>
            ) : !user ? (
              <DropdownMenuLabel className="text-sm text-muted-foreground">
                Sign in to add to playlist
              </DropdownMenuLabel>
            ) : playlists.length > 0 ? (
              playlists.map((playlist) => (
                <DropdownMenuItem
                  key={playlist.id}
                  onClick={() => handleAddToPlaylist(playlist.id)}
                  className="hover-scale"
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
