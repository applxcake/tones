
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, MoreVertical, ArrowLeft, Trash, ListPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPlaylistById, removeSongFromPlaylist, deletePlaylist } from '@/services/playlistService';
import { usePlayer } from '@/contexts/PlayerContext';
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
  const { playTrack, addToQueue } = usePlayer();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [playlist, setPlaylist] = useState(getPlaylistById(id || ''));
  
  useEffect(() => {
    if (!playlist) {
      navigate('/playlists');
    }
  }, [playlist, navigate]);

  if (!playlist) {
    return null;
  }

  const handlePlaySong = (song: any) => {
    playTrack(song);
  };

  const handleRemoveSong = (songId: string) => {
    removeSongFromPlaylist(playlist.id, songId);
    setPlaylist(getPlaylistById(playlist.id));
  };

  const handleDeletePlaylist = () => {
    deletePlaylist(playlist.id);
    navigate('/playlists');
  };

  const handleBackClick = () => {
    navigate('/playlists');
  };

  const handlePlayAll = () => {
    if (playlist.songs.length > 0) {
      // Play the first song
      playTrack(playlist.songs[0]);
      
      // Add the rest to queue
      playlist.songs.slice(1).forEach(song => {
        addToQueue(song);
      });
    }
  };

  return (
    <div className="pt-6 pb-24 animate-slide-in">
      <Button 
        variant="ghost" 
        className="flex items-center mb-6"
        onClick={handleBackClick}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Playlists
      </Button>

      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{playlist.name}</h1>
            {playlist.description && (
              <p className="mt-2 text-gray-400">{playlist.description}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              {playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'}
            </p>
          </div>

          <div className="flex space-x-2">
            <Button 
              onClick={handlePlayAll}
              disabled={playlist.songs.length === 0}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Play All
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem 
                  className="text-red-500"
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
          {playlist.songs.map((song) => (
            <div 
              key={song.id} 
              className="flex items-center justify-between p-3 rounded-lg glass-panel hover:neon-glow-purple"
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
                >
                  <Play className="h-4 w-4" />
                </Button>
                
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => addToQueue(song)}
                >
                  <ListPlus className="h-4 w-4" />
                </Button>
                
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="text-red-500" 
                  onClick={() => handleRemoveSong(song.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center glass-panel rounded-lg">
          <p className="text-gray-400">This playlist is empty. Add songs from the search page!</p>
        </div>
      )}

      {/* Delete Playlist Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Playlist</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this playlist? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePlaylist}
              className="bg-red-500 hover:bg-red-600"
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
