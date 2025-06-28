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
  Battery,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { backgroundAudioService } from '@/services/backgroundAudioService';
import { usePlayer } from '@/contexts/PlayerContext';

export const BackgroundAudioStatus: React.FC = () => {
  const { currentTrack, isPlaying, togglePlayPause, nextTrack, previousTrack } = usePlayer();
  const [isBackgroundEnabled, setIsBackgroundEnabled] = useState(false);
  const [isServiceWorkerActive, setIsServiceWorkerActive] = useState(false);
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);
  const [isMediaSessionSupported, setIsMediaSessionSupported] = useState(false);
  const [testResults, setTestResults] = useState<{[key: string]: boolean}>({});

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

  const testBackgroundPlayback = async () => {
    const results: {[key: string]: boolean} = {};
    
    // Test 1: Service Worker
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      results.serviceWorker = !!registration?.active;
    } catch (error) {
      results.serviceWorker = false;
    }

    // Test 2: Wake Lock
    try {
      if ('wakeLock' in navigator) {
        const wakeLock = await navigator.wakeLock.request('screen');
        results.wakeLock = true;
        wakeLock.release();
      } else {
        results.wakeLock = false;
      }
    } catch (error) {
      results.wakeLock = false;
    }

    // Test 3: Media Session
    try {
      results.mediaSession = 'mediaSession' in navigator;
    } catch (error) {
      results.mediaSession = false;
    }

    // Test 4: Audio Context
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      results.audioContext = audioContext.state === 'running' || audioContext.state === 'suspended';
    } catch (error) {
      results.audioContext = false;
    }

    setTestResults(results);
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

  const getTestIcon = (passed: boolean | undefined) => {
    if (passed === undefined) return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    if (passed) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Background Audio Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Background Audio Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="background-audio" className="text-sm font-medium">
            Background Playback
          </Label>
          <Switch
            id="background-audio"
            checked={isBackgroundEnabled}
            onCheckedChange={handleToggleBackgroundAudio}
          />
        </div>

        {/* Feature Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Service Worker</span>
            <Badge variant={getStatusColor(isServiceWorkerActive, isBackgroundEnabled)}>
              {getStatusText(isServiceWorkerActive, isBackgroundEnabled)}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Wake Lock</span>
            <Badge variant={getStatusColor(isWakeLockActive, isWakeLockActive)}>
              {getStatusText(isWakeLockActive, isWakeLockActive)}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Media Session</span>
            <Badge variant={getStatusColor(isMediaSessionSupported, isMediaSessionSupported)}>
              {getStatusText(isMediaSessionSupported, isMediaSessionSupported)}
            </Badge>
          </div>
        </div>

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Test Results</h4>
            <div className="space-y-1">
              {Object.entries(testResults).map(([test, passed]) => (
                <div key={test} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{test.replace(/([A-Z])/g, ' $1')}</span>
                  {getTestIcon(passed)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={testBackgroundPlayback}
            className="flex-1"
          >
            Test Features
          </Button>
          {currentTrack && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                if (isPlaying) {
                  togglePlayPause();
                } else {
                  togglePlayPause();
                }
              }}
              className="flex-1"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Background playback works best on mobile devices</p>
          <p>• Ensure the app is added to home screen for best results</p>
          <p>• Some browsers may require user interaction first</p>
        </div>
      </CardContent>
    </Card>
  );
}; 