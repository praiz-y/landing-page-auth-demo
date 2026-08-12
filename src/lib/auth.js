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

// Requires "Allow anonymous sign-ins" enabled in the Supabase dashboard
// (Authentication > Sign In / Providers) — off by default, no SQL toggle.
export async function signInAsGuest() {
  return safeCall(supabase.auth.signInAnonymously());
}

export function isGuest(session) {
  return !!session?.user?.is_anonymous;
}

// Upgrades the current anonymous session into a real account in place —
// same user_id, so every note/goal the guest already created carries over
// automatically instead of needing to be copied.
export async function convertGuestAccount({ username, email, password }) {
  return safeCall(supabase.auth.updateUser({
    email,
    password,
    data: { username }
  }));
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
