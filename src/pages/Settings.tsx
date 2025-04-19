import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, updateUserProfile } from '@/services/userService';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Settings = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    language: 'en',
    theme: 'dark'
  });

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    avatar: '',
  });
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (authUser) {
        setLoading(true);
        const userData = await getCurrentUser(authUser.id);
        setCurrentUser(userData);
        
        if (userData) {
          setFormData({
            username: userData.username || '',
            email: userData.email || '',
            bio: userData.bio || '',
            avatar: userData.avatar || '',
          });
        }
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [authUser]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authUser) {
      await updateUserProfile(formData, authUser.id);
      toast({
        title: "Settings saved",
        description: "Your profile has been updated successfully.",
      });
    }
  };

  const handlePreferenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPreferences(prev => ({ ...prev, [name]: value }));
    
    if (name === 'theme') {
      document.documentElement.className = value;
      localStorage.setItem('theme', value);
    }
    if (name === 'language') {
      localStorage.setItem('language', value);
    }
    
    toast({
      title: "Preferences Updated",
      description: `Your ${name} preference has been saved.`,
    });
  };

  if (loading) {
    return (
      <div className="pt-6 pb-24 animate-slide-in">
        <div className="flex justify-center py-12">
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div 
                key={i}
                className="w-2 h-2 bg-neon-purple rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="pt-6 pb-24 animate-slide-in">
      <Button 
        variant="ghost" 
        className="flex items-center mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>
      
      <div className="glass-panel rounded-lg p-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3 flex justify-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full glass-panel flex items-center justify-center overflow-hidden">
                    {formData.avatar ? (
                      <img src={formData.avatar} alt={formData.username} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-16 h-16 text-white/70" />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="md:w-2/3 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input 
                    id="avatar"
                    name="avatar"
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={formData.avatar}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio"
                name="bio"
                placeholder="Tell us about yourself"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
              />
            </div>
            
            <div className="pt-4">
              <Button type="submit" className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </div>
      
      <div className="mt-8 glass-panel rounded-lg p-6 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Preferences</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <select 
              id="language"
              name="language"
              value={preferences.language}
              onChange={handlePreferenceChange}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <select 
              id="theme"
              name="theme"
              value={preferences.theme}
              onChange={handlePreferenceChange}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="dark">Dark (Default)</option>
              <option value="light">Light</option>
              <option value="system">System Preference</option>
            </select>
          </div>
        </div>
        
        <div className="pt-4">
          <Button variant="outline" className="w-full">
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
