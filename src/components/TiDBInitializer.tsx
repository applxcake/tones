
import { useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';

const TiDBInitializer = () => {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const showBrowserWarning = () => {
      console.warn('TiDB connection cannot be established directly from the browser due to security restrictions.');
      toast({
        title: "Database Notice",
        description: "TiDB connections require a server environment. Features will use mock data in browser preview.",
        variant: "default"
      });
      setInitialized(true); // Mark as initialized so the app continues
    };

    // In browser environment, show warning and use mock data
    showBrowserWarning();
  }, []);

  // This component doesn't render anything visible
  return null;
};

export default TiDBInitializer;
