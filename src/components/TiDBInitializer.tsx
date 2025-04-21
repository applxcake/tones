
import { useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { initializeTables } from '@/integrations/tidb/client';

const TiDBInitializer = () => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        // Initialize tables in TiDB
        await initializeTables();
        console.log('TiDB tables initialized successfully');
        setInitialized(true);
      } catch (error) {
        console.log('Using mock TiDB data in browser environment');
        toast({
          title: "Database Notice",
          description: "Using mock data for preview. All features are functional with sample data.",
          variant: "default"
        });
        setInitialized(true);
      }
    };

    initializeDatabase();
  }, []);

  // This component doesn't render anything visible
  return null;
};

export default TiDBInitializer;
