
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import VolumeDial from './VolumeDial';
import RetroTapeDeck from './RetroTapeDeck';
import EmojiReactions from './EmojiReactions';
import ParticleBackground from './ParticleBackground';
import { useToast } from '@/hooks/use-toast';
import { usePlayer } from '@/contexts/PlayerContext';
import LiquidAudioVisualizer from './LiquidAudioVisualizer';
import MagneticDragQueue from './MagneticDragQueue';
import BPMPulser from './BPMPulser';
import { Flame, MusicIcon, Sliders } from 'lucide-react';
import { Button } from './ui/button';

interface EnhancedPlayerUIProps {
  className?: string;
}

const EnhancedPlayerUI: React.FC<EnhancedPlayerUIProps> = ({ className }) => {
  const { currentTrack } = usePlayer();
  const { toast } = useToast();
  const [showFireFX, setShowFireFX] = useState(false);
  const [showMusicSheet, setShowMusicSheet] = useState(false);
  const [showEQ, setShowEQ] = useState(false);
  
  if (!currentTrack) return null;

  // Handle emoji reactions
  const handleEmojiReact = (emoji: string) => {
    toast({
      title: `You reacted with ${emoji}`,
      description: `to "${currentTrack.title}"`,
      variant: "default",
    });
  };

  // Toggle fire/smoke effects
  const toggleFireFX = () => {
    setShowFireFX(prev => !prev);
    toast({
      title: showFireFX ? "Fire effects disabled" : "Fire effects enabled",
      description: showFireFX ? "Visual effects turned off" : "High energy visual effects enabled",
      variant: "default",
    });
  };
  
  // Toggle sheet music mode
  const toggleMusicSheet = () => {
    setShowMusicSheet(prev => !prev);
    toast({
      title: showMusicSheet ? "Sheet music hidden" : "Sheet music mode",
      description: showMusicSheet ? "Returning to standard view" : "Now showing animated sheet music notation",
      variant: "default",
    });
  };
  
  // Toggle EQ sliders
  const toggleEQ = () => {
    setShowEQ(prev => !prev);
    toast({
      title: showEQ ? "EQ controls hidden" : "EQ controls enabled",
      description: showEQ ? "Basic audio settings restored" : "Advanced equalizer controls now available",
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
          mood={showFireFX ? "energetic" : "calm"}
          colors={showFireFX ? ['#F97316', '#ea384c', '#D946EF'] : ['#9b87f5', '#D946EF', '#0EA5E9']}
        />
        
        {/* Fire/smoke effects if enabled */}
        {showFireFX && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Animated flames */}
            <div className="absolute bottom-0 left-0 right-0 h-20 opacity-70">
              <div className="relative h-full w-full">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute bottom-0 rounded-full bg-gradient-to-t from-orange-600 via-orange-500 to-yellow-400 animate-flame"
                    style={{
                      left: `${i * 8 + Math.random() * 5}%`,
                      width: `${Math.random() * 30 + 15}px`,
                      height: `${Math.random() * 60 + 40}px`,
                      animationDuration: `${Math.random() * 2 + 1}s`,
                      animationDelay: `${Math.random() * 1}s`,
                      filter: 'blur(4px)'
                    }}
                  />
                ))}
              </div>
            </div>
            
            {/* Smoke particles */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`smoke-${i}`}
                className="absolute bottom-10 rounded-full bg-white/5 animate-float-smoke"
                style={{
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 40 + 20}px`,
                  height: `${Math.random() * 40 + 20}px`,
                  animationDuration: `${Math.random() * 5 + 3}s`,
                  animationDelay: `${Math.random() * 2}s`,
                  filter: 'blur(8px)'
                }}
              />
            ))}
          </div>
        )}
      </div>
      
      <BPMPulser className="relative z-10">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left section with tape deck animation */}
          <div className="w-full md:w-1/2 flex flex-col items-center">
            <h3 className="text-xl font-bold text-white mb-2 text-center text-gradient animate-pulse-slow">
              Now Playing
            </h3>
            
            {showMusicSheet ? (
              <div className="w-full h-40 bg-white/10 rounded-md p-2 backdrop-blur-sm overflow-hidden">
                <div className="w-full h-full relative">
                  {/* Music staff lines */}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="absolute left-0 right-0 h-px bg-gray-400"
                      style={{ top: `${20 + i * 10}%` }}
                    />
                  ))}
                  
                  {/* Animated music notes */}
                  <div className="absolute inset-0">
                    <div className="animate-scroll-notes w-[200%] h-full">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <div
                          key={`note-${i}`}
                          className="absolute w-4 h-5 flex flex-col justify-between"
                          style={{
                            left: `${(i * 8) % 200}%`,
                            top: `${[20, 25, 30, 35, 40, 45, 50, 55, 60][i % 9]}%`
                          }}
                        >
                          <div className="w-full h-3 rounded-full bg-gray-200" />
                          <div className="w-1 h-10 bg-gray-200 ml-3 rounded-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <RetroTapeDeck width={250} height={180} className="mb-4" />
            )}
            
            {/* Liquid audio visualizer */}
            <LiquidAudioVisualizer 
              height={40} 
              className="w-full mt-2" 
            />
          </div>
          
          {/* Right section with controls */}
          <div className="w-full md:w-1/2 flex flex-col items-center gap-6">
            {/* Volume dial */}
            <div className="flex flex-col items-center">
              <p className="text-sm text-gray-300 mb-1">Volume Control</p>
              <VolumeDial />
            </div>
            
            {/* EQ sliders if enabled */}
            {showEQ && (
              <div className="w-full px-4">
                <p className="text-sm text-gray-300 mb-1 text-center">Equalizer</p>
                <div className="flex justify-between h-20">
                  {['60Hz', '150Hz', '400Hz', '1KHz', 'Treble'].map((freq, i) => (
                    <div key={freq} className="flex flex-col items-center justify-between">
                      <div 
                        className="w-1 bg-gradient-to-t from-neon-purple to-neon-pink rounded-full cursor-pointer relative h-16"
                      >
                        <div 
                          className="absolute w-3 h-3 bg-white rounded-full left-1/2 -translate-x-1/2 shadow-glow cursor-grab"
                          style={{ bottom: `${Math.sin(i * 1.5) * 40 + 50}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">{freq}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Emoji reactions */}
            <div className="w-full">
              <p className="text-sm text-gray-300 mb-1 text-center">Quick Reactions</p>
              <EmojiReactions className="w-full" onReact={handleEmojiReact} />
            </div>
            
            {/* Magnetic drag to queue */}
            <MagneticDragQueue 
              song={currentTrack} 
              className="mt-2 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-full border border-neon-purple/30" 
            />
            
            {/* Control buttons */}
            <div className="flex gap-2 mt-2">
              <Button 
                size="icon" 
                variant="outline" 
                className={cn(
                  "border-white/10 bg-black/20",
                  showFireFX && "border-orange-500/50 bg-orange-500/10 text-orange-500"
                )}
                onClick={toggleFireFX}
              >
                <Flame size={18} />
              </Button>
              
              <Button 
                size="icon" 
                variant="outline"
                className={cn(
                  "border-white/10 bg-black/20",
                  showMusicSheet && "border-blue-400/50 bg-blue-500/10 text-blue-400"
                )}
                onClick={toggleMusicSheet}
              >
                <MusicIcon size={18} />
              </Button>
              
              <Button 
                size="icon" 
                variant="outline"
                className={cn(
                  "border-white/10 bg-black/20",
                  showEQ && "border-green-400/50 bg-green-500/10 text-green-400"
                )}
                onClick={toggleEQ}
              >
                <Sliders size={18} />
              </Button>
            </div>
          </div>
        </div>
      </BPMPulser>
    </div>
  );
};

export default EnhancedPlayerUI;
