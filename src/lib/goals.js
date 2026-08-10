import { supabase, safeCall } from './supabaseClient.js';

export async function listGoals() {
  const { data, error } = await safeCall(
    supabase.from('goals').select('*').order('created_at', { ascending: false })
  );

  return { data: data || [], error };
}

export async function createGoal(userId, { title, due_date }) {
  return safeCall(
    supabase.from('goals').insert({ user_id: userId, title, due_date: due_date || null }).select().single()
  );
}

export async function toggleGoalDone(id, done) {
  return safeCall(
    supabase.from('goals').update({ done }).eq('id', id).select().single()
  );
}

export async function deleteGoal(id) {
  return safeCall(supabase.from('goals').delete().eq('id', id));
}
