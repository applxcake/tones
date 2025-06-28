import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, MoreVertical, ArrowLeft, Trash, ListPlus, Shuffle, SortAsc, SortDesc, Share2, Copy, Globe, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPlaylistById, removeSongFromPlaylist, deletePlaylist, togglePlaylistSharing, copyPlaylistShareUrl, getPlaylistShareUrl } from '@/services/playlistService';
import { usePlayer } from '@/contexts/PlayerContext';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
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
import SocialShareButton from '@/components/SocialShareButton';

type SortOption = 'default' | 'title-asc' | 'title-desc' | 'artist-asc' | 'artist-desc' | 'date-added';

const PlaylistDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playTrack, addToQueue, isPlaying, currentTrack, togglePlayPause, playPlaylist } = usePlayer();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [playlist, setPlaylist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [sortedSongs, setSortedSongs] = useState<any[]>([]);
  const [isSharing, setIsSharing] = useState(false);
  
  useEffect(() => {
    const loadPlaylist = async () => {
      if (id) {
        setLoading(true);
        try {
          const playlistData = await getPlaylistById(id);
          setPlaylist(playlistData);
          setSortedSongs(playlistData?.songs || []);
          setIsSharing(playlistData?.isPublic || false);
        } catch (error) {
          console.error('Error fetching playlist:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadPlaylist();
  }, [id]);

  // Sort songs based on selected option
  useEffect(() => {
    if (!playlist?.songs) return;

    let sorted = [...playlist.songs];
    
    switch (sortOption) {
      case 'title-asc':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'artist-asc':
        sorted.sort((a, b) => a.channelTitle.localeCompare(b.channelTitle));
        break;
      case 'artist-desc':
        sorted.sort((a, b) => b.channelTitle.localeCompare(a.channelTitle));
        break;
      case 'date-added':
        sorted.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        break;
      default:
        // Keep original order (by position in playlist)
        sorted = [...playlist.songs];
    }
    
    setSortedSongs(sorted);
  }, [playlist, sortOption]);

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
    if (sortedSongs.length > 0) {
      playPlaylist(sortedSongs, false);
    }
  };

  const handleShufflePlay = () => {
    if (sortedSongs.length > 0) {
      playPlaylist(sortedSongs, true);
    }
  };

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
  };

  const handleToggleSharing = async () => {
    if (playlist) {
      const success = await togglePlaylistSharing(playlist.id, !isSharing);
      if (success) {
        setIsSharing(!isSharing);
        // Refresh playlist data to get updated share token
        const updatedPlaylist = await getPlaylistById(playlist.id);
        setPlaylist(updatedPlaylist);
      }
    }
  };

  const handleCopyShareLink = async () => {
    if (playlist?.shareToken) {
      await copyPlaylistShareUrl(playlist.shareToken);
    }
  };

  const getSortIcon = () => {
    switch (sortOption) {
      case 'title-asc':
      case 'artist-asc':
        return <SortAsc className="h-4 w-4" />;
      case 'title-desc':
      case 'artist-desc':
        return <SortDesc className="h-4 w-4" />;
      default:
        return <SortAsc className="h-4 w-4" />;
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
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">{playlist.name}</h1>
              {isSharing && (
                <div className="flex items-center gap-1 text-neon-purple">
                  <Share2 className="h-4 w-4" />
                  <span className="text-sm">Shared</span>
                </div>
              )}
            </div>
            {playlist.description && (
              <p className="mt-2 text-gray-400">{playlist.description}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              {sortedSongs.length} {sortedSongs.length === 1 ? 'song' : 'songs'}
              {sortOption !== 'default' && (
                <span className="ml-2 text-neon-purple">
                  • Sorted by {sortOption.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              )}
            </p>
          </div>

          <div className="flex space-x-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Button 
              onClick={handlePlayAll}
              disabled={sortedSongs.length === 0}
              className="flex items-center gap-2 hover-scale"
            >
              <Play className="h-4 w-4" />
              Play All
            </Button>

            <Button 
              onClick={handleShufflePlay}
              disabled={sortedSongs.length === 0}
              variant="outline"
              className="flex items-center gap-2 hover-scale"
            >
              <Shuffle className="h-4 w-4" />
              Shuffle
            </Button>

            <Button 
              onClick={handleToggleSharing}
              variant={isSharing ? "default" : "outline"}
              className="flex items-center gap-2 hover-scale"
            >
              {isSharing ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              {isSharing ? 'Public' : 'Private'}
            </Button>

            {isSharing && playlist?.shareToken && (
              <Button 
                onClick={handleCopyShareLink}
                variant="outline"
                className="flex items-center gap-2 hover-scale"
              >
                <Copy className="h-4 w-4" />
                Copy Link
              </Button>
            )}

            {isSharing && playlist?.shareToken && (
              <SocialShareButton
                url={getPlaylistShareUrl(playlist.shareToken)}
                title={playlist.name}
                description={`Check out this awesome playlist: ${playlist.name}`}
              />
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="hover-scale">
                  {getSortIcon()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="animate-scale-in">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleSortChange('default')}
                  className={sortOption === 'default' ? 'bg-neon-purple/20' : ''}
                >
                  Default Order
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleSortChange('title-asc')}
                  className={sortOption === 'title-asc' ? 'bg-neon-purple/20' : ''}
                >
                  Title (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleSortChange('title-desc')}
                  className={sortOption === 'title-desc' ? 'bg-neon-purple/20' : ''}
                >
                  Title (Z-A)
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleSortChange('artist-asc')}
                  className={sortOption === 'artist-asc' ? 'bg-neon-purple/20' : ''}
                >
                  Artist (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleSortChange('artist-desc')}
                  className={sortOption === 'artist-desc' ? 'bg-neon-purple/20' : ''}
                >
                  Artist (Z-A)
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleSortChange('date-added')}
                  className={sortOption === 'date-added' ? 'bg-neon-purple/20' : ''}
                >
                  Date Added
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
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

      {sortedSongs.length > 0 ? (
        <div className="space-y-2">
          {sortedSongs.map((song: any, index: number) => (
            <div 
              key={song.id} 
              className={cn(
                "flex items-center justify-between p-3 rounded-lg glass-panel hover:neon-glow-purple animate-fade-in",
                { "neon-glow-blue": currentTrack?.id === song.id && isPlaying }
              )}
              style={{ animationDelay: `${0.1 * (index % 10)}s` }}
            >
              <div className="flex items-center flex-1 min-w-0">
                <span className="text-sm text-gray-400 mr-3 w-6 text-center">
                  {index + 1}
                </span>
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
