import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AutoPlayToggle from '@/components/AutoPlayToggle';
import AudioQualityControl from '@/components/AudioQualityControl';
import UserProfileCustomizer from '@/components/UserProfileCustomizer';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export const Settings: React.FC = () => {
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Edit Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <button
              className="px-4 py-2 rounded bg-neon-purple text-white font-semibold hover:bg-neon-purple/80 transition"
              onClick={() => setEditProfileOpen(true)}
            >
              Edit Profile
            </button>
            {editProfileOpen && <UserProfileCustomizer />}
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Tones Music Player v2.0</p>
            <p>A modern music player with background playback support.</p>
            <p>Built with React, TypeScript, and Tailwind CSS.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
