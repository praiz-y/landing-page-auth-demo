import { supabase, safeCall } from './supabaseClient.js';
import { showAlert } from '../utils.js';

export async function signUp({ username, email, password }) {
  return safeCall(supabase.auth.signUp({
    email,
    password,
    options: { data: { username } }
  }));
}

export async function signIn({ email, password }) {
  return safeCall(supabase.auth.signInWithPassword({ email, password }));
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function getUsername(session) {
  return (
    session?.user?.user_metadata?.username ||
    session?.user?.email?.split('@')[0] ||
    'there'
  );
}

// Redirects to login if there's no session. Returns the session (or null,
// after redirecting) so callers can `const session = await guard(); if (!session) return;`
export async function guard() {
  const session = await getSession();

  if (!session) {
    showAlert('Please log in first.', 'error');
    setTimeout(function () {
      window.location.href = 'login.html';
    }, 1100);
    return null;
  }

  return session;
}

// For login/signup pages: bounce already-logged-in users to the dashboard.
export async function guardRedirect() {
  const session = await getSession();

  if (session) {
    window.location.href = 'dashboard.html';
    return true;
  }

  return false;
}

export async function logout(redirectTo) {
  await safeCall(supabase.auth.signOut());
  showAlert('Logged out. See you soon!', 'success');

  setTimeout(function () {
    window.location.href = redirectTo || 'index.html';
  }, 1000);
}
