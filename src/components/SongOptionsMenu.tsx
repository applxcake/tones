
import { useState } from 'react';
import { MoreVertical, ListPlus, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayer } from '@/contexts/PlayerContext';
import { getUserPlaylists, addSongToPlaylist } from '@/services/playlistService';
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
  const playlists = getUserPlaylists();
  const [liked, setLiked] = useState(isLiked(song.id));

  const handleLike = () => {
    const isLikedNow = toggleLike(song);
    setLiked(isLikedNow);
  };

  const handleAddToPlaylist = (playlistId: string) => {
    addSongToPlaylist(playlistId, song);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 p-0 hover:bg-white/10"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" className="w-56">
        <DropdownMenuItem onClick={() => addToQueue(song)}>
          <ListPlus className="mr-2 h-4 w-4" />
          Add to Queue
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleLike}>
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
            {playlists.length > 0 ? (
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
