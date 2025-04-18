
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCurrentUser, updateUserProfile } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';

const Settings = () => {
  const currentUser = getCurrentUser();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    username: currentUser?.username || '',
    bio: currentUser?.bio || '',
    email: user?.email || '',
  });

  const [preferences, setPreferences] = useState({
    theme: 'dark',
    autoplay: true,
    notifications: true,
    quality: 'high',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences({ ...preferences, [key]: value });
  };

  const handleProfileSave = () => {
    updateUserProfile({
      username: formData.username,
      bio: formData.bio,
    });
  };

  const handlePreferencesSave = () => {
    // In a real app, save these to user preferences
    // For now just show a toast via the updateUserProfile method
    updateUserProfile({});
  };

  return (
    <div className="pt-6 pb-24 animate-slide-in">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="space-y-6">
          <div className="glass-panel rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
            
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  name="username"
                  value={formData.username} 
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email"
                  value={formData.email} 
                  onChange={handleInputChange}
                  readOnly
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed. Contact support for assistance.
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea 
                  id="bio" 
                  name="bio"
                  value={formData.bio} 
                  onChange={handleInputChange}
                  placeholder="Tell others about yourself..."
                  rows={4}
                />
              </div>

              <Button onClick={handleProfileSave}>
                Save Changes
              </Button>
            </div>
          </div>

          <div className="glass-panel rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6 text-red-500">Danger Zone</h2>
            
            <div className="space-y-4">
              <Button 
                variant="destructive" 
                className="w-full sm:w-auto"
              >
                Delete Account
              </Button>
              <p className="text-xs text-muted-foreground">
                This action is irreversible. All your data will be permanently deleted.
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="preferences" className="space-y-6">
          <div className="glass-panel rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">App Preferences</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Theme</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred theme
                  </p>
                </div>
                <Select 
                  value={preferences.theme} 
                  onValueChange={(value) => handlePreferenceChange('theme', value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Autoplay</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatically play songs when selected
                  </p>
                </div>
                <Switch 
                  checked={preferences.autoplay}
                  onCheckedChange={(checked) => handlePreferenceChange('autoplay', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about new followers and comments
                  </p>
                </div>
                <Switch 
                  checked={preferences.notifications}
                  onCheckedChange={(checked) => handlePreferenceChange('notifications', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Streaming Quality</h3>
                  <p className="text-sm text-muted-foreground">
                    Select your preferred audio quality
                  </p>
                </div>
                <Select 
                  value={preferences.quality} 
                  onValueChange={(value) => handlePreferenceChange('quality', value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Select quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handlePreferencesSave}>
                Save Preferences
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="privacy" className="space-y-6">
          <div className="glass-panel rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Privacy Settings</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Profile Visibility</h3>
                  <p className="text-sm text-muted-foreground">
                    Who can see your profile
                  </p>
                </div>
                <Select defaultValue="public">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="followers">Followers Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Playlist Visibility</h3>
                  <p className="text-sm text-muted-foreground">
                    Who can see your playlists
                  </p>
                </div>
                <Select defaultValue="public">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="followers">Followers Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button>
                Save Privacy Settings
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
