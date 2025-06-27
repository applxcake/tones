import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Smartphone,
  Wifi,
  Battery
} from 'lucide-react';
import { backgroundAudioService } from '@/services/backgroundAudioService';
import { usePlayer } from '@/contexts/PlayerContext';

export const BackgroundAudioStatus: React.FC = () => {
  const { currentTrack, isPlaying, togglePlayPause, nextTrack, previousTrack } = usePlayer();
  const [isBackgroundEnabled, setIsBackgroundEnabled] = useState(false);
  const [isServiceWorkerActive, setIsServiceWorkerActive] = useState(false);
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);
  const [isMediaSessionSupported, setIsMediaSessionSupported] = useState(false);

  useEffect(() => {
    // Check if background audio features are supported
    const checkBackgroundAudioSupport = async () => {
      // Check service worker support
      setIsServiceWorkerActive('serviceWorker' in navigator);
      
      // Check wake lock support
      setIsWakeLockActive('wakeLock' in navigator);
      
      // Check media session support
      setIsMediaSessionSupported('mediaSession' in navigator);
      
      // Check if background audio service is initialized
      setIsBackgroundEnabled(backgroundAudioService.isServiceInitialized);
    };

    checkBackgroundAudioSupport();
  }, []);

  const handleToggleBackgroundAudio = async () => {
    if (!isBackgroundEnabled) {
      try {
        const success = await backgroundAudioService.initialize();
        setIsBackgroundEnabled(success);
        if (success) {
          console.log('Background audio enabled');
        }
      } catch (error) {
        console.error('Failed to enable background audio:', error);
      }
    } else {
      try {
        await backgroundAudioService.cleanup();
        setIsBackgroundEnabled(false);
        console.log('Background audio disabled');
      } catch (error) {
        console.error('Failed to disable background audio:', error);
      }
    }
  };

  const getStatusColor = (isSupported: boolean, isActive: boolean) => {
    if (!isSupported) return 'destructive';
    if (isActive) return 'default';
    return 'secondary';
  };

  const getStatusText = (isSupported: boolean, isActive: boolean) => {
    if (!isSupported) return 'Not Supported';
    if (isActive) return 'Active';
    return 'Inactive';
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Background Audio
          <Badge variant={isBackgroundEnabled ? "default" : "secondary"}>
            {isBackgroundEnabled ? "Enabled" : "Disabled"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Background Audio Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="background-audio" className="text-sm font-medium">
            Enable Background Playback
          </Label>
          <Switch
            id="background-audio"
            checked={isBackgroundEnabled}
            onCheckedChange={handleToggleBackgroundAudio}
          />
        </div>

        {/* Feature Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              Service Worker
            </span>
            <Badge variant={getStatusColor(isServiceWorkerActive, isServiceWorkerActive)}>
              {getStatusText(isServiceWorkerActive, isServiceWorkerActive)}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Battery className="h-4 w-4" />
              Wake Lock
            </span>
            <Badge variant={getStatusColor(isWakeLockActive, isWakeLockActive)}>
              {getStatusText(isWakeLockActive, isWakeLockActive)}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Media Session
            </span>
            <Badge variant={getStatusColor(isMediaSessionSupported, isMediaSessionSupported)}>
              {getStatusText(isMediaSessionSupported, isMediaSessionSupported)}
            </Badge>
          </div>
        </div>

        {/* Media Controls */}
        {currentTrack && (
          <div className="space-y-3">
            <div className="text-sm">
              <div className="font-medium">Now Playing</div>
              <div className="text-muted-foreground truncate">{currentTrack.title}</div>
              <div className="text-muted-foreground text-xs">{currentTrack.channelTitle}</div>
            </div>
            
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={previousTrack}
                disabled={!isBackgroundEnabled}
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={togglePlayPause}
                disabled={!isBackgroundEnabled}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={nextTrack}
                disabled={!isBackgroundEnabled}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>• Music continues playing when app is in background</div>
          <div>• Lock screen controls available on supported devices</div>
          <div>• Wake lock prevents device sleep during playback</div>
          <div>• Requires user interaction to start playback</div>
        </div>
      </CardContent>
    </Card>
  );
}; 