// Throwaway connectivity check. Run once .env.local has real credentials:
//   npm run check:supabase
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Fill in .env.local first.');
  process.exit(1);
}

const supabase = createClient(url, anonKey);

// auth.getSession() reads local storage and never touches the network —
// it "succeeds" even with zero connectivity. Query a real table instead,
// which forces an actual HTTP round trip through DNS + TLS + PostgREST.
// RLS blocks anonymous rows (returns an empty array), which is fine —
// what matters is that a real response came back at all.
try {
  const { error } = await supabase.from('notes').select('id').limit(1);

  if (error) {
    console.error('Could not reach Supabase:', error.message);
    process.exit(1);
  }

  console.log('Connected to Supabase project at', url);
} catch (err) {
  console.error('Could not reach Supabase (network-level failure):', err.message);
  process.exit(1);
}
