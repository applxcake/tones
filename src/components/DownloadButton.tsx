
import { useState } from 'react';
import { Download, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { YouTubeVideo } from '@/services/youtubeService';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

interface DownloadButtonProps {
  song: YouTubeVideo;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const DownloadButton = ({ song, size = 'sm', className }: DownloadButtonProps) => {
  const [isDownloaded, setIsDownloaded] = useState(() => {
    const downloads = JSON.parse(localStorage.getItem('downloadedSongs') || '[]');
    return downloads.some((d: any) => d.id === song.id);
  });
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isDownloaded) {
      // Remove from downloads
      const downloads = JSON.parse(localStorage.getItem('downloadedSongs') || '[]');
      const updated = downloads.filter((d: any) => d.id !== song.id);
      localStorage.setItem('downloadedSongs', JSON.stringify(updated));
      setIsDownloaded(false);
      
      toast({
        title: "Removed from Downloads",
        description: `${song.title} has been removed from your downloads.`,
      });
      return;
    }

    setIsDownloading(true);
    
    try {
      // Simulate download process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Save to localStorage (in real app, this would download actual audio)
      const downloads = JSON.parse(localStorage.getItem('downloadedSongs') || '[]');
      const downloadedSong = {
        ...song,
        downloadDate: new Date().toISOString(),
        size: `${(Math.random() * 3 + 2).toFixed(1)} MB`
      };
      
      downloads.push(downloadedSong);
      localStorage.setItem('downloadedSongs', JSON.stringify(downloads));
      
      setIsDownloaded(true);
      toast({
        title: "Downloaded Successfully",
        description: `${song.title} is now available offline.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download the song. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={handleDownload}
      disabled={isDownloading}
      className={cn(
        "transition-all duration-200 hover:scale-110",
        size === 'sm' && "h-6 w-6",
        size === 'md' && "h-8 w-8", 
        size === 'lg' && "h-10 w-10",
        isDownloaded && "text-green-500 hover:text-green-400",
        className
      )}
    >
      <motion.div
        animate={isDownloading ? { rotate: 360 } : {}}
        transition={{ duration: 1, repeat: isDownloading ? Infinity : 0, ease: "linear" }}
      >
        {isDownloaded ? (
          <Check className={iconSize} />
        ) : (
          <Download className={iconSize} />
        )}
      </motion.div>
    </Button>
  );
};

export default DownloadButton;
