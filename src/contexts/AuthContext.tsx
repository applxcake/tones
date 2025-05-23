import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

type User = {
  id: string;
  email: string;
  username?: string;
  avatarUrl?: string;  // Added avatarUrl property
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
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            username: session.user.user_metadata?.username,
            avatarUrl: session.user.user_metadata?.avatar_url,
          });
          
          console.log('Auth session restored successfully');
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
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            username: session.user.user_metadata?.username,
            avatarUrl: session.user.user_metadata?.avatar_url,
          });
          
          // Create/update profile in profiles table
          try {
            // Use a different approach to bypass TypeScript's type checking for RPC parameters
            const params = {
              user_id: session.user.id,
              user_username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || '',
              user_created_at: new Date().toISOString()
            };
            
            // Call the RPC function with type assertion at the function call level
            const { error } = await (supabase.rpc as any)('upsert_profile', params);
            
            if (error) {
              console.error('Error updating user profile:', error);
            }
          } catch (error) {
            console.error('Error updating profile on auth change:', error);
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
    const result = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);
    
    if (result.error) {
      toast({
        title: "Sign in failed",
        description: result.error.message,
        variant: "destructive"
      });
    } else if (result.data?.user) {
      toast({
        title: "Signed in successfully",
        description: `Welcome back, ${result.data.user.email?.split('@')[0]}!`,
      });
    }
    
    return result;
  };

  const signUp = async (email: string, password: string, username?: string) => {
    setIsLoading(true);
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split('@')[0], // Use first part of email as default username
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
        description: "Please check your email to verify your account.",
      });
    }
    
    setIsLoading(false);
    return result;
  };

  const signOut = async () => {
    setIsLoading(true);
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
    
    setIsLoading(false);
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
