import { useState, useEffect } from 'react';
import { ListMusic, Plus, MoreVertical, Trash, Edit, Play, Shuffle, Share2, Copy, Globe, Lock } from 'lucide-react';
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { getUserPlaylists, createPlaylist, deletePlaylist, Playlist, togglePlaylistSharing, copyPlaylistShareUrl } from '@/services/playlistService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayer } from '@/contexts/PlayerContext';

const Playlists = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [playlistImageUrl, setPlaylistImageUrl] = useState('');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playPlaylist } = usePlayer();
  
  useEffect(() => {
    const fetchPlaylists = async () => {
      if (user) {
        setLoading(true);
        try {
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
  }, [user]);

  const handleCreatePlaylist = async () => {
    if (playlistName.trim() && user) {
      const newPlaylist = await createPlaylist(playlistName.trim(), playlistDescription.trim(), user.id, playlistImageUrl.trim());
      if (newPlaylist) {
        setPlaylists(prev => [...prev, newPlaylist]);
      }
      setDialogOpen(false);
      setPlaylistName('');
      setPlaylistDescription('');
      setPlaylistImageUrl('');
    }
  };

  const handleDeletePlaylist = async (id: string) => {
    const success = await deletePlaylist(id);
    if (success) {
      setPlaylists(prev => prev.filter(playlist => playlist.id !== id));
    }
  };

  const handleToggleSharing = async (playlist: Playlist) => {
    const success = await togglePlaylistSharing(playlist.id, !playlist.isPublic);
    if (success) {
      // Refresh playlists to get updated sharing status
      const updatedPlaylists = await getUserPlaylists(user?.id);
      setPlaylists(updatedPlaylists || []);
    }
  };

  const handleCopyShareLink = async (playlist: Playlist) => {
    if (playlist.shareToken) {
      await copyPlaylistShareUrl(playlist.shareToken);
    }
  };

  const viewPlaylist = (id: string) => {
    navigate(`/playlists/${id}`);
  };

  if (loading) {
    return (
      <div className="pt-6 pb-24 animate-slide-in">
        <h1 className="text-3xl font-bold mb-8">Your Playlists</h1>
        <div className="flex justify-center py-12">
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
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
      <h1 className="text-3xl font-bold mb-8 animate-fade-in">Your Playlists</h1>
      
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Create Playlist Button */}
        <div 
          className="glass-panel rounded-lg overflow-hidden border border-dashed border-white/20 flex flex-col items-center justify-center h-64 cursor-pointer hover:neon-glow-purple hover:border-neon-purple/50 transition-all duration-300 ease-in-out transform hover:scale-105 animate-fade-in"
          onClick={() => setDialogOpen(true)}
          style={{ animationDelay: '0.1s' }}
        >
          <Button 
            size="icon" 
            className="h-14 w-14 rounded-full mb-3 bg-neon-purple/20 hover:bg-neon-purple/40 border border-neon-purple/30 transition-all duration-300 hover:shadow-glow-lg"
          >
            <Plus className="h-6 w-6 animate-pulse" />
          </Button>
          <p className="font-medium">Create New Playlist</p>
        </div>
        
        {/* Playlists */}
        {playlists.map((playlist, index) => {
          // Normalize image_url to imageUrl for compatibility
          const imageUrl = playlist.imageUrl || (playlist as any).image_url;
          return (
            <div 
              key={playlist.id} 
              className="glass-panel rounded-lg overflow-hidden hover-scale transform transition-all duration-300 hover:shadow-glow animate-fade-in" 
              style={{ animationDelay: `${0.15 * (index + 1)}s` }}
            >
              <div 
                className="h-40 bg-gradient-to-br from-gray-700/80 to-gray-900/80 flex items-center justify-center cursor-pointer relative group"
                onClick={() => viewPlaylist(playlist.id)}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={playlist.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ zIndex: 1 }}
                    onError={e => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <ListMusic className="h-12 w-12 text-white/60 group-hover:text-white/90 transition-all duration-300 z-10" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-20" />
                <div className="absolute inset-0 bg-neon-purple/0 group-hover:bg-neon-purple/20 transition-all duration-300 z-30"></div>
                
                {/* Play button overlay on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex gap-2">
                    <Button 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (playlist.songs.length > 0) {
                          playPlaylist(playlist.songs, false);
                        }
                      }}
                      disabled={playlist.songs.length === 0}
                      className="bg-neon-purple/80 hover:bg-neon-purple text-white rounded-full h-10 w-10 shadow-glow transform scale-90 hover:scale-100 transition-all duration-300"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (playlist.songs.length > 0) {
                          playPlaylist(playlist.songs, true);
                        }
                      }}
                      disabled={playlist.songs.length === 0}
                      className="bg-neon-purple/80 hover:bg-neon-purple text-white rounded-full h-10 w-10 shadow-glow transform scale-90 hover:scale-100 transition-all duration-300"
                    >
                      <Shuffle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-4 flex justify-between items-center">
                <div className="group cursor-pointer" onClick={() => viewPlaylist(playlist.id)}>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium group-hover:text-neon-purple transition-colors duration-300">{playlist.name}</h3>
                    {playlist.isPublic && (
                      <div className="flex items-center gap-1 text-neon-purple">
                        <Share2 className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                  {playlist.description && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{playlist.description}</p>
                  )}
                  <p className="text-sm text-gray-400">{playlist.songs.length} songs</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover-scale">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="animate-scale-in">
                    <DropdownMenuItem onClick={() => viewPlaylist(playlist.id)} className="hover-scale">
                      <Edit className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleToggleSharing(playlist)}
                      className="hover-scale"
                    >
                      {playlist.isPublic ? (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Make Private
                        </>
                      ) : (
                        <>
                          <Globe className="mr-2 h-4 w-4" />
                          Make Public
                        </>
                      )}
                    </DropdownMenuItem>
                    {playlist.isPublic && playlist.shareToken && (
                      <DropdownMenuItem 
                        onClick={() => handleCopyShareLink(playlist)}
                        className="hover-scale"
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Link
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-500 hover-scale"
                      onClick={() => handleDeletePlaylist(playlist.id)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Playlist Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="animate-scale-in">
          <DialogHeader>
            <DialogTitle>Create New Playlist</DialogTitle>
            <DialogDescription>
              Give your playlist a name and optional description.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2 animate-fade-in" style={{animationDelay: '0.1s'}}>
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Playlist Name
              </label>
              <Input
                id="name"
                placeholder="My Awesome Playlist"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                className="focus:ring-neon-purple focus:border-neon-purple transition-all duration-300"
              />
            </div>
            
            <div className="space-y-2 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <label htmlFor="description" className="text-sm font-medium">
                Description (Optional)
              </label>
              <Textarea
                id="description"
                placeholder="What's this playlist about?"
                value={playlistDescription}
                onChange={(e) => setPlaylistDescription(e.target.value)}
                rows={3}
                className="focus:ring-neon-purple focus:border-neon-purple transition-all duration-300"
              />
            </div>
            
            <div className="space-y-2 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <label htmlFor="imageUrl" className="text-sm font-medium">
                Playlist Image URL (Optional)
              </label>
              <Input
                id="imageUrl"
                placeholder="https://..."
                value={playlistImageUrl}
                onChange={e => setPlaylistImageUrl(e.target.value)}
                className="focus:ring-neon-purple focus:border-neon-purple transition-all duration-300"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="hover-scale">
              Cancel
            </Button>
            <Button 
              onClick={handleCreatePlaylist}
              className="bg-neon-purple hover:bg-neon-purple/80 text-white hover-scale shadow-glow-sm hover:shadow-glow transition-all duration-300"
            >
              Create Playlist
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Playlists;
