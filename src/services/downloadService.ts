
import { YouTubeVideo } from '@/services/youtubeService';
import { toast } from '@/components/ui/use-toast';

export interface DownloadedSong extends YouTubeVideo {
  downloadDate: string;
  size: string;
  localUrl?: string;
}

export const downloadSong = async (song: YouTubeVideo): Promise<boolean> => {
  try {
    // Simulate download process - in real app, this would download actual audio
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const downloadedSong: DownloadedSong = {
      ...song,
      downloadDate: new Date().toISOString(),
      size: `${(Math.random() * 3 + 2).toFixed(1)} MB`
    };
    
    const downloads = getDownloadedSongs();
    downloads.push(downloadedSong);
    localStorage.setItem('downloadedSongs', JSON.stringify(downloads));
    
    toast({
      title: "Downloaded Successfully",
      description: `${song.title} is now available offline.`,
    });
    
    return true;
  } catch (error) {
    toast({
      title: "Download Failed",
      description: "Could not download the song. Please try again.",
      variant: "destructive"
    });
    return false;
  }
};

export const getDownloadedSongs = (): DownloadedSong[] => {
  const downloads = localStorage.getItem('downloadedSongs');
  return downloads ? JSON.parse(downloads) : [];
};

export const isDownloaded = (songId: string): boolean => {
  const downloads = getDownloadedSongs();
  return downloads.some(song => song.id === songId);
};

export const removeDownload = (songId: string): void => {
  const downloads = getDownloadedSongs();
  const updated = downloads.filter(song => song.id !== songId);
  localStorage.setItem('downloadedSongs', JSON.stringify(updated));
};
