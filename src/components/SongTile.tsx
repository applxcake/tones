import { useState } from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, Heart, MoreHorizontal, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { usePlayer } from '@/contexts/PlayerContext';
import { YouTubeVideo } from '@/services/youtubeService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PlaylistSelector from './PlaylistSelector';

interface SongTileProps {
  song: YouTubeVideo;
  showFavoriteButton?: boolean;
  isFavorited?: boolean;
  onFavoriteChange?: (isFavorited: boolean) => void;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const SongTile = ({ 
  song, 
  showFavoriteButton = false, 
  isFavorited = false,
  onFavoriteChange,
  size = 'medium',
  className 
}: SongTileProps) => {
  const { playTrack, addToQueue, isCurrentSong, isPlaying, toggleLike, isLiked } = usePlayer();
  const [isHovered, setIsHovered] = useState(false);
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);
  const isCurrentlyPlaying = isCurrentSong(song.id) && isPlaying;
  const songIsLiked = showFavoriteButton ? isFavorited : isLiked(song.id);

  const handlePlay = () => {
    playTrack(song);
  };

  const handleLike = async () => {
    const newLikedState = await toggleLike(song);
    onFavoriteChange?.(newLikedState);
  };

  const sizeClasses = {
    small: 'aspect-square',
    medium: 'aspect-square',
    large: 'aspect-[4/3]'
  };

  return (
    <>
      <Card
        className={cn(
          "group bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-200 cursor-pointer",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handlePlay}
      >
        <CardContent className="p-3">
          <div className={cn("relative mb-3 rounded-lg overflow-hidden", sizeClasses[size])}>
            <img
              src={song.thumbnailUrl}
              alt={song.title}
              className="w-full h-full object-cover"
            />
            
            {/* Play button overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered || isCurrentlyPlaying ? 1 : 0 }}
              className="absolute inset-0 bg-black/40 flex items-center justify-center"
            >
              <Button
                size="icon"
                className={cn(
                  "rounded-full w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white",
                  isCurrentlyPlaying && "animate-pulse"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlay();
                }}
              >
                <PlayCircle className="w-5 h-5 ml-0.5" />
              </Button>
            </motion.div>

            {/* Action buttons */}
            <div className="absolute top-2 right-2 flex gap-1">
              {showFavoriteButton && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike();
                  }}
                  className={cn(
                    "w-8 h-8 bg-black/50 hover:bg-black/70",
                    songIsLiked ? "text-red-500" : "text-white"
                  )}
                >
                  <Heart className={cn("w-4 h-4", songIsLiked && "fill-current")} />
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => e.stopPropagation()}
                    className="w-8 h-8 bg-black/50 hover:bg-black/70 text-white"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-900 border-gray-700">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      addToQueue(song);
                    }}
                    className="text-white hover:bg-gray-700"
                  >
                    Add to Queue
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPlaylistSelector(true);
                    }}
                    className="text-white hover:bg-gray-700"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add to Playlist
                  </DropdownMenuItem>
                  {!showFavoriteButton && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike();
                      }}
                      className="text-white hover:bg-gray-700"
                    >
                      <Heart className={cn("w-4 h-4 mr-2", songIsLiked && "fill-current text-red-500")} />
                      {songIsLiked ? 'Unlike' : 'Like'}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="font-medium text-white text-sm line-clamp-2 leading-tight">
              {song.title}
            </h3>
            <p className="text-xs text-gray-400 truncate">
              {song.channelTitle}
            </p>
          </div>
        </CardContent>
      </Card>

      <PlaylistSelector
        isOpen={showPlaylistSelector}
        onClose={() => setShowPlaylistSelector(false)}
        song={song}
      />
    </>
  );
};

export default SongTile;
