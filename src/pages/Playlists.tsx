
import { useState } from 'react';
import { ListMusic, Plus, MoreVertical, Trash, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getUserPlaylists, createPlaylist, deletePlaylist } from '@/services/playlistService';
import { useNavigate } from 'react-router-dom';

const Playlists = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const navigate = useNavigate();
  
  const playlists = getUserPlaylists();

  const handleCreatePlaylist = () => {
    if (playlistName.trim()) {
      createPlaylist(playlistName.trim(), playlistDescription.trim());
      setDialogOpen(false);
      setPlaylistName('');
      setPlaylistDescription('');
    }
  };

  const handleDeletePlaylist = (id: string) => {
    deletePlaylist(id);
  };

  const viewPlaylist = (id: string) => {
    navigate(`/playlists/${id}`);
  };

  return (
    <div className="pt-6 pb-24 animate-slide-in">
      <h1 className="text-3xl font-bold mb-8">Your Playlists</h1>
      
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Create Playlist Button */}
        <div 
          className="glass-panel rounded-lg overflow-hidden border border-dashed border-white/20 flex flex-col items-center justify-center h-64 cursor-pointer hover:neon-glow-purple"
          onClick={() => setDialogOpen(true)}
        >
          <Button 
            size="icon" 
            className="h-14 w-14 rounded-full mb-3 bg-neon-purple/20 hover:bg-neon-purple/40 border border-neon-purple/30"
          >
            <Plus className="h-6 w-6" />
          </Button>
          <p className="font-medium">Create New Playlist</p>
        </div>
        
        {/* Playlists */}
        {playlists.map((playlist) => (
          <div key={playlist.id} className="glass-panel rounded-lg overflow-hidden hover-scale">
            <div 
              className="h-40 bg-gradient-to-br from-gray-700/80 to-gray-900/80 flex items-center justify-center cursor-pointer"
              onClick={() => viewPlaylist(playlist.id)}
            >
              <ListMusic className="h-12 w-12 text-white/60" />
            </div>
            <div className="p-4 flex justify-between items-center">
              <div>
                <h3 className="font-medium">{playlist.name}</h3>
                <p className="text-sm text-gray-400">{playlist.songs.length} songs</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => viewPlaylist(playlist.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-500"
                    onClick={() => handleDeletePlaylist(playlist.id)}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {/* Create Playlist Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Playlist</DialogTitle>
            <DialogDescription>
              Give your playlist a name and optional description.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Playlist Name
              </label>
              <Input
                id="name"
                placeholder="My Awesome Playlist"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description (Optional)
              </label>
              <Textarea
                id="description"
                placeholder="What's this playlist about?"
                value={playlistDescription}
                onChange={(e) => setPlaylistDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePlaylist}>
              Create Playlist
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Playlists;
