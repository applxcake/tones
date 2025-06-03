
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

const Settings = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
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
      savePreferences: "Einstellungen speichern",
    }
  };
  
  // Get current translations based on language
  const t = translations[language as keyof typeof translations] || translations.en;
  
  return (
    <div className="pt-6 pb-24">
      <Button 
        variant="ghost" 
        className="flex items-center mb-6"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t.back}
      </Button>
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t.settings}</h1>
      </div>
      
      <div className="bg-card rounded-lg p-6 max-w-2xl mx-auto border">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3 flex justify-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {formData.avatar ? (
                      <img 
                        src={formData.avatar} 
                        alt={formData.username} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <User className="w-16 h-16 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="md:w-2/3 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">{t.username}</Label>
                  <Input 
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">{t.email}</Label>
                  <Input 
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
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
            
            <div className="space-y-2">
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
            
            <div className="pt-4">
              <Button type="submit" className="flex items-center gap-2" disabled={loading}>
                <Save className="h-4 w-4" />
                {t.saveChanges}
              </Button>
            </div>
          </div>
        </form>
      </div>
      
      <div className="mt-8 bg-card rounded-lg p-6 max-w-2xl mx-auto border">
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
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="dark">{t.dark}</option>
                <option value="light">{t.light}</option>
              </select>
            </div>
          </div>
          
          <div className="pt-4">
            <Button type="submit" variant="outline" className="w-full">
              {t.savePreferences}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
