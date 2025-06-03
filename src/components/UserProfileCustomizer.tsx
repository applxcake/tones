
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Palette, User, Music, Save } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserProfileData {
  displayName: string;
  bio: string;
  favoriteGenres: string[];
  profileColor: string;
  avatar: string;
}

interface UserProfileCustomizerProps {
  className?: string;
}

const UserProfileCustomizer = ({ className }: UserProfileCustomizerProps) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfileData>({
    displayName: '',
    bio: '',
    favoriteGenres: [],
    profileColor: '#9b87f5',
    avatar: '',
  });
  const [loading, setLoading] = useState(false);

  const genres = [
    'Pop', 'Rock', 'Hip Hop', 'Electronic', 'Classical', 'Jazz',
    'Country', 'R&B', 'Reggae', 'Blues', 'Folk', 'Punk',
    'Metal', 'Alternative', 'Indie', 'Soul'
  ];

  const colorThemes = [
    { name: 'Purple', value: '#9b87f5' },
    { name: 'Pink', value: '#D946EF' },
    { name: 'Blue', value: '#0EA5E9' },
    { name: 'Green', value: '#10B981' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Red', value: '#EF4444' },
  ];

  useEffect(() => {
    // Load profile data from localStorage
    const savedProfile = localStorage.getItem(`userProfile_${user?.id}`);
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else if (user) {
      setProfile(prev => ({
        ...prev,
        displayName: user.username || '',
        avatar: user.avatar || '',
      }));
    }
  }, [user]);

  const updateProfile = (updates: Partial<UserProfileData>) => {
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
  };

  const toggleGenre = (genre: string) => {
    const newGenres = profile.favoriteGenres.includes(genre)
      ? profile.favoriteGenres.filter(g => g !== genre)
      : [...profile.favoriteGenres, genre];
    updateProfile({ favoriteGenres: newGenres });
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      // Save to localStorage (in a real app, this would save to backend)
      localStorage.setItem(`userProfile_${user?.id}`, JSON.stringify(profile));
      
      // Apply theme color to document
      document.documentElement.style.setProperty('--user-theme-color', profile.profileColor);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated!",
        variant: "success"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Sign in to customize your profile</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Customization
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Profile Preview */}
        <div className="flex items-center gap-4 p-4 rounded-lg border">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatar} />
            <AvatarFallback style={{ backgroundColor: profile.profileColor }}>
              {profile.displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{profile.displayName || 'Your Name'}</h3>
            <p className="text-sm text-muted-foreground">{profile.bio || 'Your bio'}</p>
            <div className="flex gap-1 mt-2">
              {profile.favoriteGenres.slice(0, 3).map(genre => (
                <Badge key={genre} variant="secondary" className="text-xs">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Display Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Display Name</label>
          <Input
            value={profile.displayName}
            onChange={(e) => updateProfile({ displayName: e.target.value })}
            placeholder="Enter your display name"
          />
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Bio</label>
          <Textarea
            value={profile.bio}
            onChange={(e) => updateProfile({ bio: e.target.value })}
            placeholder="Tell us about your musical taste..."
            rows={3}
          />
        </div>

        {/* Avatar URL */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Avatar URL</label>
          <Input
            value={profile.avatar}
            onChange={(e) => updateProfile({ avatar: e.target.value })}
            placeholder="https://example.com/avatar.jpg"
            type="url"
          />
        </div>

        {/* Color Theme */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Palette className="h-4 w-4" />
            Profile Color
          </label>
          <div className="flex gap-2 flex-wrap">
            {colorThemes.map(({ name, value }) => (
              <motion.button
                key={value}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => updateProfile({ profileColor: value })}
                className={`w-8 h-8 rounded-full border-2 ${
                  profile.profileColor === value ? 'border-white shadow-lg' : 'border-gray-300'
                }`}
                style={{ backgroundColor: value }}
                title={name}
              />
            ))}
          </div>
        </div>

        {/* Favorite Genres */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Music className="h-4 w-4" />
            Favorite Genres
          </label>
          <div className="flex gap-2 flex-wrap">
            {genres.map(genre => (
              <Badge
                key={genre}
                variant={profile.favoriteGenres.includes(genre) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleGenre(genre)}
              >
                {genre}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Select your favorite genres to get better recommendations
          </p>
        </div>

        {/* Save Button */}
        <Button
          onClick={saveProfile}
          disabled={loading}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Profile'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default UserProfileCustomizer;
