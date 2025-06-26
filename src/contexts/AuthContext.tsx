
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

type User = {
  id: string;
  email: string;
  username?: string;
  avatarUrl?: string;
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
  signUp: (email: string, password: string, username?: string) => Promise<{
    error: Error | null;
    data: any | null;
  }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and set the user
    const initializeAuth = async () => {
      setIsLoading(true);
      
      try {
        // Restore session on load
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && session.user) {
          const userData = {
            id: session.user.id,
            email: session.user.email || '',
            username: session.user.user_metadata?.username || session.user.email?.split('@')[0],
            avatarUrl: session.user.user_metadata?.avatar_url,
          };
          setUser(userData);
          console.log('Auth session restored successfully', userData);
        } else {
          console.log('No active auth session found');
          setUser(null);
        }
      } catch (error) {
        console.error('Error restoring auth session:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Auth state changed: ${event}`);
        
        if (session && session.user) {
          const userData = {
            id: session.user.id,
            email: session.user.email || '',
            username: session.user.user_metadata?.username || session.user.email?.split('@')[0],
            avatarUrl: session.user.user_metadata?.avatar_url,
          };
          setUser(userData);
          
          // Try to create/update profile, but don't fail if it doesn't work
          try {
            const { error } = await supabase
              .from('profiles')
              .upsert({
                id: session.user.id,
                username: userData.username,
                created_at: new Date().toISOString()
              }, {
                onConflict: 'id'
              });
            
            if (error) {
              console.warn('Could not update profile (this is okay if profiles table does not exist):', error.message);
            }
          } catch (error) {
            console.warn('Profile update failed (this is okay):', error);
          }
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const result = await supabase.auth.signInWithPassword({ email, password });
      
      if (result.error) {
        toast({
          title: "Sign in failed",
          description: result.error.message,
          variant: "destructive"
        });
      } else if (result.data?.user) {
        toast({
          title: "Signed in successfully",
          description: `Welcome back!`,
        });
      }
      
      setIsLoading(false);
      return result;
    } catch (error) {
      setIsLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive"
      });
      return { error: error instanceof Error ? error : new Error(errorMessage), data: null };
    }
  };

  const signUp = async (email: string, password: string, username?: string) => {
    setIsLoading(true);
    
    try {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username || email.split('@')[0],
          }
        }
      });
      
      if (result.error) {
        toast({
          title: "Sign up failed",
          description: result.error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Account created successfully",
          description: "Welcome to Tones!",
        });
      }
      
      setIsLoading(false);
      return result;
    } catch (error) {
      setIsLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast({
        title: "Sign up failed",
        description: errorMessage,
        variant: "destructive"
      });
      return { error: error instanceof Error ? error : new Error(errorMessage), data: null };
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Signed out successfully",
          description: "You have been signed out.",
        });
      }
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
