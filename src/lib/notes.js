import { supabase, safeCall } from './supabaseClient.js';

export async function listNotes() {
  const { data, error } = await safeCall(
    supabase.from('notes').select('*').order('updated_at', { ascending: false })
  );

  return { data: data || [], error };
}

export async function createNote(userId, { title, body }) {
  return safeCall(
    supabase.from('notes').insert({ user_id: userId, title, body }).select().single()
  );
}

export async function updateNote(id, { title, body }) {
  return safeCall(
    supabase.from('notes').update({ title, body }).eq('id', id).select().single()
  );
}

export async function deleteNote(id) {
  return safeCall(supabase.from('notes').delete().eq('id', id));
}
