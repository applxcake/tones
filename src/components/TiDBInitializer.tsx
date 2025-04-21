
import { useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';

const TiDBInitializer = () => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const showBrowserWarning = () => {
      console.log('Using mock TiDB data in browser environment');
      toast({
        title: "Database Notice",
        description: "Using mock data for preview. All features are functional with sample data.",
        variant: "default"
      });
      setInitialized(true);
    };

    showBrowserWarning();
  }, []);

  // This component doesn't render anything visible
  return null;
};

export default TiDBInitializer;
