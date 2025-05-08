
import { useEffect, useState } from 'react';
import { initializeTables } from '@/integrations/neondb/client';

const NeonDBInitializer = () => {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeTables();
        setInitialized(true);
        console.log('NeonDB tables initialized successfully');
      } catch (err) {
        console.error('Failed to initialize NeonDB tables:', err);
        setError(err instanceof Error ? err.message : String(err));
      }
    };

    init();
  }, []);

  // This component doesn't render anything visual
  return null;
};

export default NeonDBInitializer;
