import { createNote } from './notes.js';
import { createGoal } from './goals.js';

// Pure: the actual seed content, kept separate from the Supabase calls so
// its shape is testable without a network round trip.
export function sampleWorkspace() {
  return {
    notes: [
      {
        title: 'Welcome to Var Notes',
        body: 'This is a real guest workspace — everything here is stored for real, just not permanently. Edit this note, delete it, or add your own to get a feel for it.'
      },
      {
        title: 'Idea: weekend project',
        body: 'Sketch out a small tool that solves one annoying daily task. Keep the scope small enough to actually ship it in a weekend.'
      },
      {
        title: 'Try the command palette',
        body: 'Press Ctrl+K (or click the button in the top nav) to jump between pages or create something new without touching the mouse.'
      }
    ],
    goals: [
      { title: 'Search your notes', due_date: null },
      { title: 'Create a note of your own', due_date: null },
      { title: 'Ship the weekend project', due_date: null }
    ]
  };
}

// Fire-and-forget-safe: creates every sample note and goal for a brand new
// guest account. Errors are swallowed here rather than surfaced — this is
// best-effort onboarding content, not core functionality, so a partial
// seed (or a flaky insert) shouldn't block the guest from reaching their
// otherwise-working dashboard.
export async function seedGuestWorkspace(userId) {
  const sample = sampleWorkspace();

  await Promise.all(
    sample.notes.map(function (note) { return createNote(userId, note); })
      .concat(sample.goals.map(function (goal) { return createGoal(userId, goal); }))
  );
}
