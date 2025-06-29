import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { 
  onAuthStateChange, 
  getCurrentUser, 
  signInWithEmail, 
  signUpWithEmail, 
  signOutUser,
  signInWithGoogle,
  updateUserProfile,
  resetPassword as firebaseResetPassword
} from '@/integrations/firebase/auth';
import { User as FirebaseUser } from 'firebase/auth';

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
  signInWithGoogle: () => Promise<{
    error: Error | null;
    data: any | null;
  }>;
  signOut: () => Promise<void>;
  updateProfile: (displayName?: string, photoURL?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Convert Firebase user to our User type
const convertFirebaseUser = (firebaseUser: FirebaseUser): User => {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
    avatarUrl: firebaseUser.photoURL || undefined,
  };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const currentUser = getCurrentUser();
        
        if (mounted) {
          if (currentUser) {
            const userData = convertFirebaseUser(currentUser);
            setUser(userData);
            console.log('Auth session restored:', userData);
          } else {
            setUser(null);
            console.log('No active session found');
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen to auth state changes
    const unsubscribe = onAuthStateChange((firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? 'user logged in' : 'user logged out');
      if (!mounted) return;
      
      try {
        if (firebaseUser) {
          const userData = convertFirebaseUser(firebaseUser);
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error in onAuthStateChange:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { user: firebaseUser, error } = await signInWithEmail(email, password);

      if (error) {
        toast({
          title: "Sign in failed",
          description: error,
          variant: "destructive"
        });
        return { error: new Error(error), data: null };
      }

      if (firebaseUser) {
        const userData = convertFirebaseUser(firebaseUser);
        setUser(userData);
      }

      return { error: null, data: firebaseUser };
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Sign in failed');
      toast({
        title: "Sign in failed",
        description: err.message,
        variant: "destructive"
      });
      return { error: err, data: null };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username?: string) => {
    try {
      setIsLoading(true);
      const { user: firebaseUser, error } = await signUpWithEmail(email, password, username);

      if (error) {
        toast({
          title: "Sign up failed",
          description: error,
          variant: "destructive"
        });
        return { error: new Error(error), data: null };
      }

      if (firebaseUser) {
        const userData = convertFirebaseUser(firebaseUser);
        setUser(userData);
        
        toast({
          title: "Account created successfully",
          description: "Welcome to Tones!",
        });
      }

      return { error: null, data: firebaseUser };
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Sign up failed');
      toast({
        title: "Sign up failed",
        description: err.message,
        variant: "destructive"
      });
      return { error: err, data: null };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogleAuth = async () => {
    try {
      setIsLoading(true);
      const { user: firebaseUser, error } = await signInWithGoogle();

      if (error) {
        toast({
          title: "Google sign in failed",
          description: error,
          variant: "destructive"
        });
        return { error: new Error(error), data: null };
      }

      if (firebaseUser) {
        const userData = convertFirebaseUser(firebaseUser);
        setUser(userData);
      }

      return { error: null, data: firebaseUser };
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Google sign in failed');
      toast({
        title: "Google sign in failed",
        description: err.message,
        variant: "destructive"
      });
      return { error: err, data: null };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await signOutUser();
      
      if (error) {
        toast({
          title: "Sign out failed",
          description: error,
          variant: "destructive"
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfileData = async (displayName?: string, photoURL?: string) => {
    try {
      const { error } = await updateUserProfile(displayName, photoURL);
      
      if (error) {
        toast({
          title: "Profile update failed",
          description: error,
          variant: "destructive"
        });
      } else {
        // Update local user state
        if (user) {
          setUser({
            ...user,
            username: displayName || user.username,
            avatarUrl: photoURL || user.avatarUrl,
          });
        }
        
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Profile update failed",
        description: "An error occurred while updating your profile.",
        variant: "destructive"
      });
    }
  };

  const resetPassword = async (email: string) => {
    return await firebaseResetPassword(email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !isLoading,
        isLoading,
        signIn,
        signUp,
        signInWithGoogle: signInWithGoogleAuth,
        signOut,
        updateProfile: updateUserProfileData,
        resetPassword,
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
