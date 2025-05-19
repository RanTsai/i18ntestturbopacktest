import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ijuyminrnhiekoxybhgm.supabase.co';
const supabaseKey = process.env.SUPABASE_API_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;