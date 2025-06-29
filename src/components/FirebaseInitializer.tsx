import React, { useEffect, useState } from 'react';
import { auth } from '@/integrations/firebase/config';
import { onAuthStateChange } from '@/integrations/firebase/auth';

interface FirebaseInitializerProps {
  children: React.ReactNode;
}

export const FirebaseInitializer: React.FC<FirebaseInitializerProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        // Wait for Firebase to be ready
        await new Promise<void>((resolve) => {
          const unsubscribe = onAuthStateChange((user) => {
            // Firebase is ready when auth state listener is called
            unsubscribe();
            resolve();
          });
          
          // If no auth state change happens quickly, resolve anyway
          setTimeout(() => {
            unsubscribe();
            resolve();
          }, 1000);
        });

        console.log('Firebase initialized successfully');
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize Firebase:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize Firebase');
      }
    };

    initializeFirebase();
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Firebase Initialization Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Initializing Firebase...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}; 