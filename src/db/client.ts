import { createClient } from '@supabase/supabase-js';
import { config } from '../config/config.ts';

const supabaseUrl = config.database.supabaseUrl;
const supabaseKey = config.database.supabaseServiceRoleKey || config.database.supabaseAnonKey;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and key are required');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function testConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('knowledge_entries').select('count');
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Failed to test Supabase connection:', error);
    return false;
  }
}
