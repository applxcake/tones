import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { getUserPlaylists, createPlaylist, addSongToPlaylist } from '@/services/playlistService';
import { YouTubeVideo } from '@/services/youtubeService';
import { Plus, ListMusic } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface PlaylistSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  song: YouTubeVideo;
}

const PlaylistSelector = ({ isOpen, onClose, song }: PlaylistSelectorProps) => {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadPlaylists();
    }
  }, [isOpen, user]);

  const loadPlaylists = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userPlaylists = await getUserPlaylists(user.id);
      setPlaylists(userPlaylists || []);
    } catch (error) {
      console.error('Error loading playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim() || !user) return;
    
    const newPlaylist = await createPlaylist(newPlaylistName.trim(), '', user.id);
    if (newPlaylist) {
      await addSongToPlaylist(newPlaylist.id, song, user.id);
      await loadPlaylists();
      setNewPlaylistName('');
      setShowCreateForm(false);
      onClose();
    }
  };

  const handleAddToPlaylist = async (playlistId: string, playlistName: string) => {
    if (!user) return;
    // Validate song object
    if (!song.id || !song.title || !song.thumbnailUrl) {
      toast({
        title: 'Invalid Song',
        description: 'This song cannot be added to a playlist.',
        variant: 'destructive'
      });
      return;
    }
    const success = await addSongToPlaylist(playlistId, song, user.id);
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Add to Playlist</DialogTitle>
          <DialogDescription>
            Select a playlist or create a new one to add this song.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Song Info */}
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            <img
              src={song.thumbnailUrl}
              alt={song.title}
              className="w-12 h-12 rounded object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate max-w-xs" title={song.title}>{song.title}</p>
              <p className="text-sm text-gray-400 truncate max-w-xs" title={song.channelTitle}>{song.channelTitle}</p>
            </div>
          </div>

          {/* Create New Playlist */}
          {showCreateForm ? (
            <div className="space-y-3">
              <Input
                placeholder="Playlist name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="bg-white/5 border-white/10"
              />
              <div className="flex gap-2">
                <Button onClick={handleCreatePlaylist} size="sm">
                  Create & Add
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowCreateForm(false)}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowCreateForm(true)}
              className="w-full border-white/10 hover:bg-white/5"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Playlist
            </Button>
          )}

          {/* Existing Playlists */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {playlists.map((playlist) => {
                // playlist.songs is an array of song IDs
                const alreadyInPlaylist = Array.isArray(playlist.songs) && playlist.songs.includes(song.id);
                return (
                  <Button
                    key={playlist.id}
                    variant="ghost"
                    onClick={() => !alreadyInPlaylist && handleAddToPlaylist(playlist.id, playlist.name)}
                    className="w-full justify-start hover:bg-white/5"
                    disabled={alreadyInPlaylist}
                    title={alreadyInPlaylist ? 'Song already in this playlist' : ''}
                  >
                    <ListMusic className="w-4 h-4 mr-3" />
                    <span className="truncate">{playlist.name}</span>
                    <span className="text-sm text-gray-400 ml-auto">
                      {playlist.songs.length}
                    </span>
                    {alreadyInPlaylist && (
                      <span className="ml-2 text-xs text-neon-purple">Already added</span>
                    )}
                  </Button>
                );
              })}
              
              {playlists.length === 0 && !showCreateForm && (
                <p className="text-center text-gray-400 py-4">
                  No playlists yet. Create your first one!
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlaylistSelector;
