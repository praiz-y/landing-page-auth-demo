import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set. ' +
    'Copy .env.example to .env.local and fill in your project credentials.'
  );
}

export const supabase = url && anonKey ? createClient(url, anonKey) : null;

const FRIENDLY_NETWORK_ERROR = 'Connection problem — check your network and try again.';
const NETWORK_ERROR_PATTERN = /fetch failed|failed to fetch|network ?error|ERR_NAME_NOT_RESOLVED/i;

// Network-level failures (DNS down, offline, project paused) don't behave
// consistently: verified directly that supabase-js catches them internally
// for both auth and table calls and RESOLVES with a raw, technical message
// like "TypeError: fetch failed" rather than throwing — so a plain
// try/catch here would never actually fire. This checks the resolved
// error message too, and only falls back to try/catch as a safety net for
// any call shape that behaves differently. Both paths return the same
// friendly message, so every existing `if (error) { showAlert(...) }`
// call site shows something a user can understand instead of a raw
// browser/library error string.
export async function safeCall(promise) {
  try {
    const result = await promise;

    if (result?.error && NETWORK_ERROR_PATTERN.test(result.error.message || '')) {
      return { data: null, error: { message: FRIENDLY_NETWORK_ERROR } };
    }

    return result;
  } catch (err) {
    return { data: null, error: { message: FRIENDLY_NETWORK_ERROR } };
  }
}
