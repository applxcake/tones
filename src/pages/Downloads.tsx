
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import SongTile from '@/components/SongTile';
import { Download, HardDrive, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { YouTubeVideo } from '@/services/youtubeService';

const Downloads = () => {
  const [downloadedSongs, setDownloadedSongs] = useState<(YouTubeVideo & { size: string; downloadDate: string })[]>([]);
  const [offlineMode, setOfflineMode] = useState(false);

  useEffect(() => {
    const downloads = JSON.parse(localStorage.getItem('downloadedSongs') || '[]');
    setDownloadedSongs(downloads);
  }, []);

  // Calculate total storage used
  const totalSize = downloadedSongs.reduce((total, song) => {
    const sizeNum = parseFloat(song.size.replace(' MB', ''));
    return total + sizeNum;
  }, 0);

  const handleRemoveDownload = (songId: string) => {
    const updated = downloadedSongs.filter(song => song.id !== songId);
    setDownloadedSongs(updated);
    localStorage.setItem('downloadedSongs', JSON.stringify(updated));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Download className="h-8 w-8 text-green-500" />
          <div>
            <h1 className="text-3xl font-bold">Downloads</h1>
            <p className="text-muted-foreground">
              {downloadedSongs.length} songs • {totalSize.toFixed(1)} MB used
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            <span className="text-sm">Offline Mode</span>
            <Switch 
              checked={offlineMode}
              onCheckedChange={setOfflineMode}
            />
          </div>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download More
          </Button>
        </div>
      </div>

      {downloadedSongs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <Download className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">No downloads yet</h2>
            <p className="text-muted-foreground mb-4">
              Download songs to listen offline anywhere, anytime.
            </p>
            <Button>
              Start Downloading
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {downloadedSongs.map((song, index) => (
            <motion.div
              key={song.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <SongTile 
                song={song} 
                showFavoriteButton={false}
              />
              {/* Downloaded badge */}
              <div className="absolute top-2 left-2 bg-green-500/90 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Downloaded
              </div>
              
              {/* Song metadata overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-xs opacity-0 hover:opacity-100 transition-opacity">
                <p>Size: {song.size}</p>
                <p>Downloaded: {new Date(song.downloadDate).toLocaleDateString()}</p>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  className="mt-1 h-6 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveDownload(song.id);
                  }}
                >
                  Remove
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {offlineMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          🔒 Offline Mode Active
        </motion.div>
      )}
    </div>
  );
};

export default Downloads;
