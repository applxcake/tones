
import { supabase } from './client';

// Simplified function to check if a table exists
export const checkTableExists = async (tableName: string): Promise<boolean> => {
  try {
    // Instead of calling RPC functions which may not exist,
    // we'll just check if we can query the table
    if (tableName === 'songs') {
      const { data, error } = await supabase
        .from('songs')
        .select('id')
        .limit(1);
      return !error;
    }
    
    return false;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
};

// Placeholder for future RPC setup functionality
export const setupRPCFunctions = async () => {
  console.log('Setting up RPC functions for Supabase...');
  
  try {
    const songsExist = await checkTableExists('songs');
    
    if (songsExist) {
      console.log('Required tables exist');
      return true;
    }
    
    console.log('Required tables do not exist, using fallback mock data');
    return false;
  } catch (error) {
    console.error('Error setting up RPC functions:', error);
    console.log('Using fallback mock data instead');
    return false;
  }
};
