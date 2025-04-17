
import { ListMusic, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Playlists = () => {
  return (
    <div className="pt-6 pb-24 animate-slide-in">
      <h1 className="text-3xl font-bold mb-8">Your Playlists</h1>
      
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Create Playlist Button */}
        <div className="glass-panel rounded-lg overflow-hidden border border-dashed border-white/20 flex flex-col items-center justify-center h-64">
          <Button 
            size="icon" 
            className="h-14 w-14 rounded-full mb-3 bg-neon-purple/20 hover:bg-neon-purple/40 border border-neon-purple/30"
          >
            <Plus className="h-6 w-6" />
          </Button>
          <p className="font-medium">Create New Playlist</p>
        </div>
        
        {/* Placeholder Playlists */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="glass-panel rounded-lg overflow-hidden cursor-pointer hover-scale">
            <div 
              className="h-40 bg-gradient-to-br from-gray-700/80 to-gray-900/80 flex items-center justify-center"
            >
              <ListMusic className="h-12 w-12 text-white/60" />
            </div>
            <div className="p-4">
              <h3 className="font-medium">Playlist {i + 1}</h3>
              <p className="text-sm text-gray-400">{Math.floor(Math.random() * 20)} songs</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Playlists;
