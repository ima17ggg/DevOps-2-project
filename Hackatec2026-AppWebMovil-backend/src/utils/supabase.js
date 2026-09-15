import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_KEY in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getSupabaseUser(token) {
  if (!token) return null;

  const { data } = await supabase.auth.getUser(token);
  return data?.user || null;
}
