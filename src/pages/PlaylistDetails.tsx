
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, MoreVertical, ArrowLeft, Trash, ListPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPlaylistById, removeSongFromPlaylist, deletePlaylist } from '@/services/playlistService';
import { usePlayer } from '@/contexts/PlayerContext';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const PlaylistDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playTrack, addToQueue, isPlaying, currentTrack, togglePlayPause } = usePlayer();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [playlist, setPlaylist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadPlaylist = async () => {
      if (id) {
        setLoading(true);
        try {
          const playlistData = await getPlaylistById(id);
          setPlaylist(playlistData);
        } catch (error) {
          console.error('Error fetching playlist:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadPlaylist();
  }, [id]);

  useEffect(() => {
    if (!loading && !playlist) {
      navigate('/playlists');
    }
  }, [playlist, navigate, loading]);

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

  if (!playlist) {
    return null;
  }

  const handlePlaySong = (song: any) => {
    playTrack(song);
  };

  const handleRemoveSong = async (songId: string) => {
    if (await removeSongFromPlaylist(playlist.id, songId)) {
      // Refresh playlist data
      const updatedPlaylist = await getPlaylistById(playlist.id);
      setPlaylist(updatedPlaylist);
    }
  };

  const handleDeletePlaylist = async () => {
    if (await deletePlaylist(playlist.id)) {
      navigate('/playlists');
    }
  };

  const handleBackClick = () => {
    navigate('/playlists');
  };

  const handlePlayAll = () => {
    if (playlist.songs.length > 0) {
      // Play the first song
      playTrack(playlist.songs[0]);
      
      // Add the rest to queue
      playlist.songs.slice(1).forEach((song: any) => {
        addToQueue(song);
      });
    }
  };

  return (
    <div className="pt-6 pb-24 animate-slide-in">
      <Button 
        variant="ghost" 
        className="flex items-center mb-6 animate-fade-in"
        onClick={handleBackClick}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Playlists
      </Button>

      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold">{playlist.name}</h1>
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
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="hover-scale">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="animate-scale-in">
                <DropdownMenuItem 
                  className="text-red-500 hover-scale"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Playlist
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="text-red-500 hover-scale" 
                  onClick={() => handleRemoveSong(song.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center glass-panel rounded-lg animate-fade-in">
          <p className="text-gray-400">This playlist is empty. Add songs from the search page!</p>
        </div>
      )}

      {/* Delete Playlist Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="animate-scale-in">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Playlist</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this playlist? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover-scale">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePlaylist}
              className="bg-red-500 hover:bg-red-600 hover-scale"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PlaylistDetails;
