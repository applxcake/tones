
import React from 'react';
import { cn } from '@/lib/utils';
import VolumeDial from './VolumeDial';
import RetroTapeDeck from './RetroTapeDeck';
import EmojiReactions from './EmojiReactions';
import ParticleBackground from './ParticleBackground';
import { useToast } from '@/hooks/use-toast';
import { usePlayer } from '@/contexts/PlayerContext';

interface EnhancedPlayerUIProps {
  className?: string;
}

const EnhancedPlayerUI: React.FC<EnhancedPlayerUIProps> = ({ className }) => {
  const { currentTrack } = usePlayer();
  const { toast } = useToast();
  
  if (!currentTrack) return null;

  // Handle emoji reactions
  const handleEmojiReact = (emoji: string) => {
    toast({
      title: `You reacted with ${emoji}`,
      description: `to "${currentTrack.title}"`,
      variant: "default",
    });
  };
  
  return (
    <div className={cn(
      "fixed bottom-24 md:bottom-20 left-1/2 transform -translate-x-1/2 glass-panel border-neon-purple/30 animate-fade-in-slow p-4 rounded-lg w-[90vw] max-w-lg z-40",
      className
    )}>
      {/* Particle background in container */}
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        <ParticleBackground 
          density={5} 
          mood="calm"
          colors={['#9b87f5', '#D946EF', '#0EA5E9']}
        />
      </div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left section with tape deck animation */}
        <div className="w-full md:w-1/2 flex flex-col items-center">
          <h3 className="text-xl font-bold text-white mb-2 text-center text-gradient animate-pulse-slow">
            Now Playing
          </h3>
          <RetroTapeDeck width={250} height={180} className="mb-4" />
        </div>
        
        {/* Right section with controls */}
        <div className="w-full md:w-1/2 flex flex-col items-center gap-6">
          {/* Volume dial */}
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-300 mb-1">Volume Control</p>
            <VolumeDial />
          </div>
          
          {/* Emoji reactions */}
          <div className="w-full">
            <p className="text-sm text-gray-300 mb-1 text-center">Quick Reactions</p>
            <EmojiReactions className="w-full" onReact={handleEmojiReact} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPlayerUI;
