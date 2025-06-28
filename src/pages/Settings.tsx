import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BackgroundAudioStatus } from '@/components/BackgroundAudioStatus';
import ThemeToggle from '@/components/ThemeToggle';
import AutoPlayToggle from '@/components/AutoPlayToggle';
import AudioQualityControl from '@/components/AudioQualityControl';

export const Settings: React.FC = () => {
  const handleAutoPlayToggle = (enabled: boolean) => {
    console.log('Auto-play toggled:', enabled);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Background Audio Settings */}
        <BackgroundAudioStatus />

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Dark Mode</span>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        {/* Playback Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Playback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Auto-play</span>
              <AutoPlayToggle onToggle={handleAutoPlayToggle} />
            </div>
            <AudioQualityControl />
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Tones Music Player v1.0.0</p>
            <p>A modern music player with background playback support.</p>
            <p>Built with React, TypeScript, and Tailwind CSS.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
