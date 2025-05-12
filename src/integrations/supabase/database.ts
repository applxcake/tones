
import { supabase } from './client';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

// Generate a unique ID (using uuid)
export function generateId(): string {
  return uuidv4();
}

// Generic function to insert a record
export async function insertRecord<T extends object>(
  table: string, 
  data: T
): Promise<{ data: any; error: any }> {
  try {
    const { data: insertedData, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single();
      
    if (error) throw error;
    return { data: insertedData, error: null };
  } catch (error) {
    console.error(`Error inserting into ${table}:`, error);
    return { data: null, error };
  }
}

// Generic function to fetch records
export async function fetchRecords<T = any>(
  table: string,
  query: {
    column?: string;
    value?: any;
    limit?: number;
    orderBy?: { column: string; ascending?: boolean };
    filters?: Array<{ column: string; operator: string; value: any }>;
  } = {}
): Promise<{ data: T[]; error: any }> {
  try {
    let queryBuilder = supabase.from(table).select();
    
    // Apply column filter if provided
    if (query.column && query.value !== undefined) {
      queryBuilder = queryBuilder.eq(query.column, query.value);
    }
    
    // Apply additional filters if provided
    if (query.filters && query.filters.length > 0) {
      query.filters.forEach(filter => {
        switch (filter.operator) {
          case 'eq':
            queryBuilder = queryBuilder.eq(filter.column, filter.value);
            break;
          case 'neq':
            queryBuilder = queryBuilder.neq(filter.column, filter.value);
            break;
          case 'gt':
            queryBuilder = queryBuilder.gt(filter.column, filter.value);
            break;
          case 'gte':
            queryBuilder = queryBuilder.gte(filter.column, filter.value);
            break;
          case 'lt':
            queryBuilder = queryBuilder.lt(filter.column, filter.value);
            break;
          case 'lte':
            queryBuilder = queryBuilder.lte(filter.column, filter.value);
            break;
          case 'like':
            queryBuilder = queryBuilder.like(filter.column, `%${filter.value}%`);
            break;
        }
      });
    }
    
    // Apply order if provided
    if (query.orderBy) {
      queryBuilder = queryBuilder.order(
        query.orderBy.column, 
        { ascending: query.orderBy.ascending ?? true }
      );
    }
    
    // Apply limit if provided
    if (query.limit) {
      queryBuilder = queryBuilder.limit(query.limit);
    }
    
    const { data, error } = await queryBuilder;
    
    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error(`Error fetching from ${table}:`, error);
    return { data: [], error };
  }
}

// Generic function to fetch a single record
export async function fetchRecord<T = any>(
  table: string,
  id: string | number,
  idColumn: string = 'id'
): Promise<{ data: T | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from(table)
      .select()
      .eq(idColumn, id)
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching from ${table} with id ${id}:`, error);
    return { data: null, error };
  }
}

// Generic function to update a record
export async function updateRecord<T extends object>(
  table: string,
  id: string | number,
  data: Partial<T>,
  idColumn: string = 'id'
): Promise<{ data: any; error: any }> {
  try {
    const { data: updatedData, error } = await supabase
      .from(table)
      .update(data)
      .eq(idColumn, id)
      .select()
      .single();
    
    if (error) throw error;
    return { data: updatedData, error: null };
  } catch (error) {
    console.error(`Error updating ${table} with id ${id}:`, error);
    return { data: null, error };
  }
}

// Generic function to delete a record
export async function deleteRecord(
  table: string,
  id: string | number,
  idColumn: string = 'id'
): Promise<{ success: boolean; error: any }> {
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq(idColumn, id);
    
    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error(`Error deleting from ${table} with id ${id}:`, error);
    return { success: false, error };
  }
}

// Function to handle relationships - fetch related records
export async function fetchRelatedRecords<T = any>(
  table: string,
  foreignKey: string,
  foreignValue: string | number,
  select: string = '*'
): Promise<{ data: T[]; error: any }> {
  try {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .eq(foreignKey, foreignValue);
    
    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error(`Error fetching related records from ${table}:`, error);
    return { data: [], error };
  }
}

// Get user playlist data
export async function getUserPlaylists(userId: string) {
  try {
    // First get the playlists
    const { data: playlists, error: playlistsError } = await supabase
      .from('playlists')
      .select('*')
      .eq('user_id', userId);
      
    if (playlistsError) throw playlistsError;
    
    // For each playlist, get its songs
    const playlistsWithSongs = await Promise.all(
      playlists.map(async (playlist) => {
        const { data: playlistSongs, error: songsError } = await supabase
          .from('playlist_songs')
          .select(`
            *,
            songs:song_id (*)
          `)
          .eq('playlist_id', playlist.id);
          
        if (songsError) throw songsError;
        
        const songs = playlistSongs.map(item => ({
          id: item.songs.id,
          title: item.songs.title,
          thumbnailUrl: item.songs.thumbnail_url,
          channelTitle: item.songs.channel_title,
          publishedAt: item.songs.published_at || new Date().toISOString(),
        }));
        
        return {
          ...playlist,
          songs,
        };
      })
    );
    
    return { data: playlistsWithSongs, error: null };
  } catch (error) {
    console.error('Error fetching user playlists:', error);
    return { data: [], error };
  }
}

// User profile operations
export async function updateUserProfile(userId: string, profileData: any) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ 
        id: userId, 
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { data: null, error };
  }
}

// Upload a file to Supabase storage
export async function uploadFile(
  bucket: string,
  filePath: string,
  file: File
): Promise<{ url: string | null; error: any }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        upsert: true,
      });
      
    if (error) throw error;
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);
      
    return { url: publicUrl, error: null };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { url: null, error };
  }
}

// Helper function to create all necessary tables
export const setupSupabaseTables = async () => {
  console.log('Setting up Supabase tables...');
  // We don't need to create tables manually in Supabase
  // as they are created through the Supabase dashboard
  // This function is kept for compatibility with the existing code
  return true;
};
