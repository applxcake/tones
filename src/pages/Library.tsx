
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ListMusic, Music } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import SongTile from '@/components/SongTile';
import { usePlayer } from '@/contexts/PlayerContext';

const Library = () => {
  const { likedSongs, queue, clearQueue } = usePlayer();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Music className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Your Library</h1>
          <p className="text-muted-foreground">
            Your liked songs and queue
          </p>
        </div>
      </div>

      <Tabs defaultValue="liked" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="liked" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Liked Songs ({likedSongs.length})
          </TabsTrigger>
          <TabsTrigger value="queue" className="flex items-center gap-2">
            <ListMusic className="h-4 w-4" />
            Queue ({queue.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="liked" className="mt-6">
          {likedSongs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-16">
                <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-bold mb-2">No liked songs yet</h2>
                <p className="text-muted-foreground mb-4">
                  Start liking songs to see them here.
                </p>
                <Button>
                  Discover Music
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {likedSongs.map((song, index) => (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <SongTile 
                    song={song} 
                    isFavorited={true}
                    showFavoriteButton={true}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="queue" className="mt-6">
          {queue.length === 0 ? (
            <Card>
              <CardContent className="text-center py-16">
                <ListMusic className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-bold mb-2">Queue is empty</h2>
                <p className="text-muted-foreground mb-4">
                  Add songs to your queue to see them here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Up Next</h3>
                <Button variant="outline" onClick={clearQueue}>
                  Clear Queue
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {queue.map((song, index) => (
                  <motion.div
                    key={`${song.id}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <SongTile song={song} />
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Library;
