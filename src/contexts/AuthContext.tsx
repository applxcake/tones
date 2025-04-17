
import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast } from "sonner";

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a function to determine if the environment variables are set
const areSupabaseCredentialsSet = () => {
  return supabaseUrl !== '' && supabaseAnonKey !== '';
};

// Only create the client if credentials are available
let supabase = null;
if (areSupabaseCredentialsSet()) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

type User = {
  id: string;
  email: string;
  username?: string;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if Supabase credentials are set
    if (!areSupabaseCredentialsSet()) {
      console.error('Supabase credentials are not set. Authentication will not work.');
      toast.error('Authentication is not configured. Please set Supabase credentials.');
      setIsLoading(false);
      return;
    }

    // Check active sessions and set the user
    setIsLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          username: session.user.user_metadata.username,
        });
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session && session.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            username: session.user.user_metadata.username,
          });
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
    if (!areSupabaseCredentialsSet()) {
      return {
        error: new Error('Authentication is not configured'),
        data: null
      };
    }

    setIsLoading(true);
    const result = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);
    return result;
  };

  const signUp = async (email: string, password: string, username?: string) => {
    if (!areSupabaseCredentialsSet()) {
      return {
        error: new Error('Authentication is not configured'),
        data: null
      };
    }

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
    setIsLoading(false);
    return result;
  };

  const signOut = async () => {
    if (!areSupabaseCredentialsSet()) {
      return;
    }

    setIsLoading(true);
    await supabase.auth.signOut();
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
