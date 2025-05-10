import React, { useRef, useEffect, useState } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX, 
  Heart, ListPlus, AudioWaveform, Sparkle, Repeat, Repeat1
} from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { usePlayer } from '@/contexts/PlayerContext';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import VinylRecordDisplay from './VinylRecordDisplay';
import { Toggle } from "@/components/ui/toggle";
import VisualVolumePeaks from './VisualVolumePeaks';
import EnhancedPlayerUI from './EnhancedPlayerUI';
import ParticleBackground from './ParticleBackground';

// Add a container for the invisible YouTube player
const YouTubePlayerContainer = () => {
  return <div id="youtube-player-container"></div>;
};

const MusicPlayer = () => {
  const { 
    currentTrack, 
    isPlaying, 
    progress, 
    volume, 
    togglePlayPause, 
    nextTrack, 
    prevTrack,
    setVolume,
    addToQueue,
    toggleLike,
    isLiked,
    seekToPosition,
    duration,
    loopMode,
    toggleLoopMode
  } = usePlayer();
  
  const progressBarRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [showVinyl, setShowVinyl] = useState(true);
  const [animatedBg, setAnimatedBg] = useState(Math.floor(Math.random() * 5));
  const [showEnhancedUI, setShowEnhancedUI] = useState(false);
  const [showVolumeVisualizer, setShowVolumeVisualizer] = useState(true);
  
  // Change background animation every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedBg(prev => (prev + 1) % 5);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Show nothing if no track is selected
  if (!currentTrack) {
    return <YouTubePlayerContainer />;
  }
  
  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  // Calculate current time based on progress percentage
  const currentTime = progress * duration / 100;

  // Handle progress bar clicks for seeking
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickPosition = (e.clientX - rect.left) / rect.width;
      const newProgress = clickPosition * 100;
      seekToPosition(newProgress);
    }
  };

  // Generate visualizer bars based on isPlaying
  const visualizerBars = () => {
    if (!isPlaying) return Array(15).fill(0);
    
    // Generate random heights that change every second
    const now = Math.floor(Date.now() / 150); // More frequent updates
    const seed = now + (currentTrack?.id || '').charCodeAt(0);
    const randomHeights = Array.from({ length: 25 }, (_, i) => { // More bars
      // Use seed + index to create pseudo-random but deterministic heights
      const val = Math.sin(seed + i * 0.5) * 0.5 + 0.5;
      return Math.max(3, val * 30); // Taller max height
    });
    
    return randomHeights;
  };

  // Toggle audio visualizer
  const toggleVisualizer = () => {
    setShowVisualizer(prev => !prev);
    toast({
      title: showVisualizer ? "Visualizer disabled" : "Audio visualizer enabled",
      description: showVisualizer ? 
        "Standard wave visualizer mode" : 
        "Enhanced audio visualization active",
      variant: "default",
    });
  };

  // Toggle vinyl display
  const toggleVinyl = () => {
    setShowVinyl(prev => !prev);
    toast({
      title: showVinyl ? "Standard view enabled" : "Vinyl view enabled",
      description: showVinyl ? 
        "Showing standard album art" : 
        "Now showing vinyl record view",
      variant: "default",
    });
  };

  // Toggle enhanced UI
  const toggleEnhancedUI = () => {
    setShowEnhancedUI(prev => !prev);
    toast({
      title: showEnhancedUI ? "Standard UI" : "Enhanced UI enabled",
      description: showEnhancedUI ? 
        "Using standard player controls" : 
        "Showing enhanced player controls with additional features",
      variant: "default",
    });
  };

  // Toggle volume visualizer
  const toggleVolumeVisualizer = () => {
    setShowVolumeVisualizer(prev => !prev);
  };

  return (
    <>
      <YouTubePlayerContainer />
      
      {/* Volume Peaks Visualizer */}
      {showVolumeVisualizer && isPlaying && (
        <VisualVolumePeaks position="right" barCount={30} className="animate-fade-in" />
      )}
      
      {/* Enhanced Player UI */}
      {showEnhancedUI && currentTrack && (
        <EnhancedPlayerUI />
      )}
      
      <div className="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-lg glass-panel border-t border-white/10 z-50 animate-slide-in">
        {/* Particle background for glassmorphism effect */}
        <div className="absolute inset-0 opacity-10 z-0 overflow-hidden pointer-events-none">
          <ParticleBackground 
            density={5} 
            interactive={false} 
            colors={['#9b87f5', '#D946EF', '#0EA5E9']}
            mood={isPlaying ? 'energetic' : 'calm'}
          />
        </div>
        
        {/* Animated background gradient */}
        <div className="absolute inset-0 opacity-30 z-0 overflow-hidden">
          {animatedBg === 0 && (
            <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/30 via-neon-pink/20 to-neon-blue/30 animate-pulse-soft"></div>
          )}
          {animatedBg === 1 && (
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-purple-600/10 to-fuchsia-500/20 animate-float"></div>
          )}
          {animatedBg === 2 && (
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-indigo-400/10 to-cyan-600/20 animate-pulse-soft"></div>
          )}
          {animatedBg === 3 && (
            <div className="absolute inset-0 bg-gradient-to-bl from-pink-500/20 via-rose-600/10 to-purple-400/20 animate-float"></div>
          )}
          {animatedBg === 4 && (
            <div className="absolute inset-0 bg-gradient-to-tl from-emerald-500/20 via-teal-400/10 to-cyan-500/20 animate-pulse-soft"></div>
          )}
          
          {/* Animated circles - now with more variety */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-20"
              style={{
                width: `${Math.random() * 120 + 30}px`,
                height: `${Math.random() * 120 + 30}px`,
                left: `${i * 13}%`,
                top: `${Math.random() * 100}%`,
                background: `radial-gradient(circle, 
                  ${i % 4 === 0 ? '#9b87f5' : 
                    i % 4 === 1 ? '#D946EF' : 
                    i % 4 === 2 ? '#0EA5E9' : '#8B5CF6'} 0%, 
                  rgba(0,0,0,0) 70%)`,
                transform: `scale(${Math.random() * 0.5 + 0.5})`,
                animation: `float ${Math.random() * 5 + 3}s ease-in-out infinite`,
                animationDelay: `${i * 0.7}s`
              }}
            />
          ))}
          
          {/* Twinkling stars effect */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={`star-${i}`}
              className="absolute rounded-full"
              style={{
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: i % 3 === 0 ? '#fff' : i % 3 === 1 ? '#9b87f5' : '#0EA5E9',
                opacity: Math.random() * 0.6 + 0.2,
                animation: `twinkle ${Math.random() * 4 + 2}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>
        
        {/* Player with vinyl display */}
        <div className="container mx-auto flex items-stretch justify-between px-4 relative z-10">
          {/* Left section: Album art / Vinyl record */}
          <div className="flex items-center gap-3 w-1/4 min-w-[200px] animate-fade-in py-4">
            <div className="hidden md:block w-16 h-16 mr-2">
              {showVinyl ? (
                <VinylRecordDisplay 
                  thumbnailUrl={currentTrack.thumbnailUrl}
                  title={currentTrack.title}
                  className="w-16 h-16"
                />
              ) : (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden neon-border hover-scale group">
                  <img 
                    src={currentTrack.thumbnailUrl} 
                    alt={currentTrack.title}
                    className="w-full h-full object-cover animate-float-subtle"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent animate-pulse"></div>
                  {/* Sparkle effects on hover */}
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Sparkle size={12} className="text-white animate-pulse" />
                  </div>
                  <div className="absolute bottom-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ animationDelay: "0.2s" }}>
                    <Sparkle size={10} className="text-neon-blue animate-pulse" />
                  </div>
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ animationDelay: "0.4s" }}>
                    <Sparkle size={8} className="text-neon-pink animate-pulse" />
                  </div>
                </div>
              )}
            </div>
            <div className="truncate md:ml-2">
              <h4 className="text-sm font-medium truncate animate-fade-in" style={{animationDelay: '0.1s'}}>{currentTrack.title}</h4>
              <p className="text-xs text-gray-400 truncate animate-fade-in" style={{animationDelay: '0.2s'}}>{currentTrack.channelTitle}</p>
              
              <div className="flex items-center mt-1">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-6 w-6 p-0 mr-2 hover:rotate-12 transition-transform"
                  onClick={toggleVinyl}
                >
                  <div className="w-4 h-4 rounded-full bg-neon-purple/70 flex items-center justify-center animate-pulse-slow">
                    <div className="w-1 h-1 rounded-full bg-white"></div>
                  </div>
                </Button>

                {/* Enhanced UI toggle button */}
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className={cn(
                    "h-6 w-6 p-0 mr-2 transition-colors",
                    showEnhancedUI && "text-neon-pink"
                  )}
                  onClick={toggleEnhancedUI}
                >
                  <Sparkle className={cn(
                    "h-4 w-4",
                    showEnhancedUI && "animate-twinkle text-neon-pink"
                  )} />
                </Button>
                
                {/* Volume visualizer toggle */}
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className={cn(
                    "h-6 w-6 p-0 mr-2 transition-colors",
                    showVolumeVisualizer && "text-neon-blue"
                  )}
                  onClick={toggleVolumeVisualizer}
                >
                  <AudioWaveform className={cn(
                    "h-4 w-4",
                    showVolumeVisualizer && "animate-pulse text-neon-blue"
                  )} />
                </Button>
                
                {/* Small visualizer bars on mobile */}
                <div className="flex items-end h-4 gap-[1px] ml-1">
                  {visualizerBars().slice(0, 8).map((height, i) => (
                    <div
                      key={i}
                      className="w-[1px] rounded-full animate-wave"
                      style={{
                        height: `${isPlaying ? Math.min(height, 12) : 1}px`,
                        animationDelay: `${i * 0.05}s`,
                        backgroundColor: '#9b87f5'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Center section: Controls and progress */}
          <div className="flex flex-col items-center justify-center w-2/4 animate-fade-in py-4" style={{animationDelay: '0.1s'}}>
            {/* Player controls */}
            <div className="flex items-center gap-4">
              <Button 
                size="icon" 
                variant="ghost" 
                className="text-gray-400 hover:text-white hover-scale transform hover:rotate-[-5deg] transition-all"
                onClick={prevTrack}
              >
                <SkipBack className="h-5 w-5" />
              </Button>
              
              <Button 
                size="icon" 
                variant="secondary"
                onClick={togglePlayPause}
                className="rounded-full bg-neon-purple/80 hover:bg-neon-purple text-white neon-glow-purple hover-scale transform transition-all hover:scale-110 group"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 animate-pulse group-hover:scale-90 transition-transform" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5 group-hover:scale-110 transition-transform" />
                )}
                <span className="absolute inset-0 rounded-full bg-white/10 group-hover:scale-125 group-hover:opacity-0 transition-all duration-700"></span>
              </Button>
              
              <Button 
                size="icon" 
                variant="ghost" 
                className="text-gray-400 hover:text-white hover-scale transform hover:rotate-[5deg] transition-all"
                onClick={nextTrack}
              >
                <SkipForward className="h-5 w-5" />
              </Button>
              
              <Toggle
                variant="outline"
                size="sm"
                pressed={loopMode !== 'none'}
                onPressedChange={toggleLoopMode}
                className={cn(
                  "border-none ml-1 px-1 h-8 w-8 rounded-full transition-colors hover:text-white text-gray-400",
                  loopMode === 'one' && "text-neon-pink bg-neon-pink/20",
                  loopMode === 'all' && "text-neon-blue bg-neon-blue/20"
                )}
                aria-label="Toggle loop mode"
              >
                {loopMode === 'one' ? (
                  <Repeat1 className="h-4 w-4 animate-pulse" />
                ) : loopMode === 'all' ? (
                  <Repeat className="h-4 w-4 animate-pulse" />
                ) : (
                  <Repeat className="h-4 w-4" />
                )}
              </Toggle>
            </div>

            <div 
              className="w-full max-w-md mt-1 px-4 flex items-center gap-2 cursor-pointer"
              ref={progressBarRef}
              onClick={handleProgressClick}
            >
              <span className="text-xs text-gray-400 animate-fade-in" style={{animationDelay: '0.3s'}}>{formatTime(currentTime)}</span>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden relative">
                {/* Pulsing glow under progress bar */}
                <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/20 via-neon-pink/20 to-neon-purple/20 animate-pulse"></div>
                <div 
                  className="h-full bg-gradient-to-r from-neon-purple to-neon-pink rounded-full absolute top-0 left-0 transition-all duration-300 ease-in-out"
                  style={{ width: `${progress}%` }}
                />
                <div 
                  className="absolute top-0 left-0 right-0 bottom-0 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Progress value={progress} className="h-2" />
                </div>
                <div 
                  className="absolute top-1/2 transform -translate-y-1/2 bg-white rounded-full w-3 h-3 shadow-glow transition-all duration-300 ease-in-out"
                  style={{ left: `${progress}%` }}
                ></div>
                
                {/* Ripple effect when clicked */}
                {isPlaying && (
                  <div className="absolute top-1/2 left-0 transform -translate-y-1/2 pointer-events-none" style={{ left: `${progress}%` }}>
                    <div className="w-3 h-3 bg-white/50 rounded-full animate-ripple absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-400 animate-fade-in" style={{animationDelay: '0.4s'}}>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right section: Volume and buttons */}
          <div className="hidden md:flex items-center gap-4 w-1/4 justify-end animate-fade-in py-4" style={{animationDelay: '0.2s'}}>
            <Button 
              size="icon" 
              variant="ghost" 
              className={cn(
                "text-gray-400 hover:text-white transition-all hover-scale", 
                isLiked(currentTrack.id) && "text-neon-pink neon-glow-pink"
              )}
              onClick={() => toggleLike(currentTrack)}
            >
              <Heart 
                className={cn(
                  "h-5 w-5 transform transition-transform duration-300", 
                  isLiked(currentTrack.id) ? "fill-neon-pink scale-110 animate-heartbeat" : "scale-100"
                )}
              />
            </Button>
            
            <Button 
              size="icon" 
              variant="ghost" 
              className="text-gray-400 hover:text-white hover-scale group"
              onClick={() => {
                addToQueue(currentTrack);
                toast({
                  title: "Added to queue",
                  description: `${currentTrack.title} has been added to your queue`,
                  variant: "default",
                });
              }}
            >
              <ListPlus className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="absolute inset-0 rounded-full bg-white/10 scale-0 group-hover:scale-75 group-hover:opacity-0 transition-all duration-500"></span>
            </Button>

            <Button 
              size="icon" 
              variant="ghost" 
              className={cn(
                "text-gray-400 hover:text-white hover-scale transition-all group",
                showVisualizer && "text-neon-blue neon-glow-blue"
              )}
              onClick={toggleVisualizer}
            >
              <AudioWaveform className={cn(
                "h-5 w-5 transition-transform", 
                showVisualizer && "animate-pulse"
              )} />
              <span className="absolute inset-0 rounded-full bg-neon-blue/5 scale-0 group-hover:scale-100 group-hover:opacity-0 transition-all duration-700"></span>
            </Button>
            
            <div className="flex items-center gap-2">
              <Button 
                size="icon" 
                variant="ghost" 
                className="text-gray-400 hover:text-white hover-scale group"
                onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
              >
                {volume === 0 ? (
                  <VolumeX className="h-4 w-4 group-hover:scale-110 transition-transform" />
                ) : volume < 0.5 ? (
                  <Volume1 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                ) : (
                  <Volume2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                )}
              </Button>
              
              <div className="w-20 relative group">
                <Slider
                  value={[volume * 100]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(values) => setVolume(values[0] / 100)}
                  className="h-1 hover:shadow-glow transition-all"
                />
                {/* Volume level tooltip */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 px-2 py-0.5 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  {Math.round(volume * 100)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced audio visualizer waves with conditional rendering based on showVisualizer */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center h-0.5">
          <div className="flex items-end gap-[1px]">
            {visualizerBars().map((height, i) => (
              <div
                key={i}
                className={`w-[2px] rounded-full animate-wave transition-all duration-150 ease-in-out`}
                style={{
                  height: `${isPlaying ? height : 1}px`,
                  animationDelay: `${i * 0.04}s`,
                  backgroundColor: showVisualizer 
                    ? (i % 7 === 0 ? '#9b87f5' : 
                       i % 5 === 0 ? '#D946EF' : 
                       i % 3 === 0 ? '#0EA5E9' : 
                       i % 2 === 0 ? '#8B5CF6' : '#6A5ACD')
                    : (i % 3 === 0 ? '#8A2BE2' : i % 2 === 0 ? '#6A5ACD' : '#9370DB'),
                  boxShadow: isPlaying 
                    ? (showVisualizer 
                        ? `0 0 8px ${i % 7 === 0 ? 'rgba(155, 135, 245, 0.8)' : 
                           i % 5 === 0 ? 'rgba(217, 70, 239, 0.8)' : 
                           i % 3 === 0 ? 'rgba(14, 165, 233, 0.8)' :
                           i % 2 === 0 ? 'rgba(139, 92, 246, 0.8)' : 'rgba(106, 90, 205, 0.8)'}`
                        : '0 0 5px rgba(138, 43, 226, 0.7)')
                    : 'none'
                }}
              />
            ))}
          </div>
        </div>

        {/* Additional particle effects when music is playing */}
        {isPlaying && showVisualizer && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 12 }).map((_, i) => (
              <div 
                key={`particle-${i}`} 
                className="absolute w-1 h-1 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `100%`,
                  opacity: Math.random() * 0.7 + 0.3,
                  backgroundColor: i % 5 === 0 ? '#9b87f5' : 
                                   i % 4 === 0 ? '#D946EF' : 
                                   i % 3 === 0 ? '#0EA5E9' : 
                                   i % 2 === 0 ? '#8B5CF6' : '#fff',
                  boxShadow: `0 0 3px ${i % 5 === 0 ? '#9b87f5' : 
                                i % 4 === 0 ? '#D946EF' : 
                                i % 3 === 0 ? '#0EA5E9' : 
                                i % 2 === 0 ? '#8B5CF6' : '#fff'}`,
                  animation: `floatParticle ${Math.random() * 2 + 2}s linear infinite`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MusicPlayer;
