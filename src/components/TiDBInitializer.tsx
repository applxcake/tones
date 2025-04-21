
import { useEffect, useState } from 'react';
import { initializeTables } from '@/integrations/tidb/client';
import { toast } from '@/components/ui/use-toast';

const TiDBInitializer = () => {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeTables();
        setInitialized(true);
        console.log('TiDB tables initialized successfully');
      } catch (err) {
        console.error('Failed to initialize TiDB tables:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        toast({
          title: "Database Error",
          description: "Could not connect to TiDB. Some features may not work properly.",
          variant: "destructive"
        });
      }
    };

    initialize();
  }, []);

  // This component doesn't render anything visible
  return null;
};

export default TiDBInitializer;
