
import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Save, Languages, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, updateUserProfile } from '@/services/userService';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Progress } from '@/components/ui/progress';

const Settings = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    avatar: '',
  });
  
  // Set theme on mount and when changed
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
    
    // Update CSS variables for theme
    if (theme === 'light') {
      document.documentElement.style.setProperty('--background', '0 0% 100%');
      document.documentElement.style.setProperty('--foreground', '240 10% 3.9%');
      document.documentElement.style.setProperty('--card', '0 0% 100%');
      document.documentElement.style.setProperty('--card-foreground', '240 10% 3.9%');
      document.documentElement.style.setProperty('--popover', '0 0% 100%');
      document.documentElement.style.setProperty('--popover-foreground', '240 10% 3.9%');
      document.documentElement.style.setProperty('--primary', '240 5.9% 10%');
      document.documentElement.style.setProperty('--primary-foreground', '0 0% 98%');
      document.documentElement.style.setProperty('--secondary', '240 4.8% 95.9%');
      document.documentElement.style.setProperty('--secondary-foreground', '240 5.9% 10%');
      document.documentElement.style.setProperty('--muted', '240 4.8% 95.9%');
      document.documentElement.style.setProperty('--muted-foreground', '240 3.8% 46.1%');
      document.documentElement.style.setProperty('--accent', '240 4.8% 95.9%');
      document.documentElement.style.setProperty('--accent-foreground', '240 5.9% 10%');
    } else {
      document.documentElement.style.setProperty('--background', '240 10% 3.9%');
      document.documentElement.style.setProperty('--foreground', '0 0% 98%');
      document.documentElement.style.setProperty('--card', '240 10% 3.9%');
      document.documentElement.style.setProperty('--card-foreground', '0 0% 98%');
      document.documentElement.style.setProperty('--popover', '240 10% 3.9%');
      document.documentElement.style.setProperty('--popover-foreground', '0 0% 98%');
      document.documentElement.style.setProperty('--primary', '262 80% 75%');
      document.documentElement.style.setProperty('--primary-foreground', '240 5.9% 10%');
      document.documentElement.style.setProperty('--secondary', '240 3.7% 15.9%');
      document.documentElement.style.setProperty('--secondary-foreground', '0 0% 98%');
      document.documentElement.style.setProperty('--muted', '240 3.7% 15.9%');
      document.documentElement.style.setProperty('--muted-foreground', '240 5% 64.9%');
      document.documentElement.style.setProperty('--accent', '262 80% 55%');
      document.documentElement.style.setProperty('--accent-foreground', '0 0% 98%');
    }
  }, [theme]);

  // Set language on mount and when changed
  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem('language', language);
  }, [language]);
  
  // Fetch current user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      if (authUser) {
        setLoading(true);
        try {
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
        } catch (error) {
          console.error('Error fetching user data:', error);
          toast({
            title: "Error loading profile",
            description: "Could not load your profile data. Please try again.",
            variant: "destructive"
          });
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchUserData();
  }, [authUser]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authUser) {
      setLoading(true);
      try {
        const updatedUser = await updateUserProfile(formData, authUser.id);
        if (updatedUser) {
          setCurrentUser(updatedUser);
          toast({
            title: "Settings saved",
            description: "Your profile has been updated successfully.",
          });
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Error saving settings",
          description: "Could not update your profile. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePreferencesSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Preferences saved",
      description: "Your preferences have been updated successfully.",
    });
  };
  
  const translations = {
    en: {
      settings: "Settings",
      back: "Back",
      username: "Username",
      email: "Email",
      avatarUrl: "Avatar URL",
      bio: "Bio",
      bioPlaceholder: "Tell us about yourself",
      saveChanges: "Save Changes",
      preferences: "Preferences",
      language: "Language",
      theme: "Theme",
      dark: "Dark (Default)",
      light: "Light",
      system: "System Preference",
      savePreferences: "Save Preferences",
    },
    es: {
      settings: "Configuración",
      back: "Atrás",
      username: "Nombre de usuario",
      email: "Correo electrónico",
      avatarUrl: "URL de avatar",
      bio: "Biografía",
      bioPlaceholder: "Cuéntanos sobre ti",
      saveChanges: "Guardar cambios",
      preferences: "Preferencias",
      language: "Idioma",
      theme: "Tema",
      dark: "Oscuro (Predeterminado)",
      light: "Claro",
      system: "Preferencia del sistema",
      savePreferences: "Guardar Preferencias",
    },
    fr: {
      settings: "Paramètres",
      back: "Retour",
      username: "Nom d'utilisateur",
      email: "Email",
      avatarUrl: "URL de l'avatar",
      bio: "Biographie",
      bioPlaceholder: "Parlez-nous de vous",
      saveChanges: "Enregistrer les modifications",
      preferences: "Préférences",
      language: "Langue",
      theme: "Thème",
      dark: "Sombre (Par défaut)",
      light: "Clair",
      system: "Préférence système",
      savePreferences: "Enregistrer les préférences",
    },
    de: {
      settings: "Einstellungen",
      back: "Zurück",
      username: "Benutzername",
      email: "E-Mail",
      avatarUrl: "Avatar-URL",
      bio: "Biografie",
      bioPlaceholder: "Erzählen Sie uns von sich",
      saveChanges: "Änderungen speichern",
      preferences: "Einstellungen",
      language: "Sprache",
      theme: "Thema",
      dark: "Dunkel (Standard)",
      light: "Hell",
      system: "Systemeinstellung",
      savePreferences: "Einstellungen speichern",
    }
  };
  
  // Get current translations based on language
  const t = translations[language as keyof typeof translations] || translations.en;
  
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
        <Progress value={30} className="w-1/2 mx-auto mt-4" />
      </div>
    );
  }
  
  return (
    <div className="pt-6 pb-24 animate-slide-in">
      <Button 
        variant="ghost" 
        className="flex items-center mb-6 hover-scale animate-fade-in"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t.back}
      </Button>
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold animate-fade-in">{t.settings}</h1>
      </div>
      
      <div className="glass-panel rounded-lg p-6 max-w-2xl mx-auto animate-fade-in">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3 flex justify-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full glass-panel flex items-center justify-center overflow-hidden hover-scale animate-scale-in">
                    {formData.avatar ? (
                      <img 
                        src={formData.avatar} 
                        alt={formData.username} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to user icon if image fails to load
                          e.currentTarget.onerror = null;
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            const iconEl = document.createElement('div');
                            iconEl.className = 'w-full h-full flex items-center justify-center';
                            iconEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white/70"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                            parent.appendChild(iconEl);
                          }
                        }}
                      />
                    ) : (
                      <User className="w-16 h-16 text-white/70" />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="md:w-2/3 space-y-4">
                <div className="space-y-2 animate-fade-in">
                  <Label htmlFor="username">{t.username}</Label>
                  <Input 
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <Label htmlFor="email">{t.email}</Label>
                  <Input 
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <Label htmlFor="avatar">{t.avatarUrl}</Label>
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
            
            <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Label htmlFor="bio">{t.bio}</Label>
              <Textarea 
                id="bio"
                name="bio"
                placeholder={t.bioPlaceholder}
                value={formData.bio}
                onChange={handleChange}
                rows={4}
              />
            </div>
            
            <div className="pt-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Button type="submit" className="flex items-center gap-2 hover-scale" disabled={loading}>
                {loading ? (
                  <div className="flex gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div 
                        key={i}
                        className="w-1 h-1 bg-white rounded-full animate-pulse"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {t.saveChanges}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
      
      <div className="mt-8 glass-panel rounded-lg p-6 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          {t.preferences}
        </h2>
        
        <form onSubmit={handlePreferencesSave}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language" className="flex items-center gap-2">
                <Languages className="h-4 w-4" />
                {t.language}
              </Label>
              <select 
                id="language"
                name="language"
                value={language}
                onChange={handleLanguageChange}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-fade-in"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="theme" className="flex items-center gap-2">
                {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                {t.theme}
              </Label>
              <select 
                id="theme"
                name="theme"
                value={theme}
                onChange={handleThemeChange}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-fade-in"
              >
                <option value="dark">{t.dark}</option>
                <option value="light">{t.light}</option>
              </select>
            </div>
          </div>
          
          <div className="pt-4">
            <Button type="submit" variant="outline" className="w-full hover-scale">
              {t.savePreferences}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
