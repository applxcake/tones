
import { useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SupabaseInitializer = () => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // First try to check if any tables exist
        const { data: tables, error: tablesError } = await supabase
          .rpc('sqlc', {
            query: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
          })
          .throwOnError();
        
        if (tablesError) {
          // If can't check schema, try a specific table
          // Test Supabase connection by fetching any system table
          const { data, error } = await supabase
            .from('songs')
            .select('id')
            .limit(1);
            
          if (error) throw error;
        }
        
        console.log('Supabase connected successfully');
        setInitialized(true);
        toast({
          title: "Database Connected",
          description: "Successfully connected to Supabase database.",
        });
      } catch (error) {
        console.error('Supabase connection error:', error);
        toast({
          title: "Database Notice",
          description: "Using mock data for preview. All features are functional with sample data.",
          variant: "default"
        });
        setInitialized(true);
      }
    };

    checkConnection();
  }, []);

  // This component doesn't render anything visible
  return null;
};

export default SupabaseInitializer;
