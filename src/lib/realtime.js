import { supabase } from './supabaseClient.js';

// Pure: applies a single Supabase Postgres Changes payload
// (`{ eventType, new, old }`) to a list, returning a new array — never
// mutates `list`. INSERT/UPDATE upsert by `id` (so a duplicate or
// out-of-order echo of a change we already applied is a no-op, not a
// second row); DELETE removes by `old.id`. `sortFn`, if given, re-sorts the
// result so a change landing out of order still displays in the right
// place (Realtime delivers changes as they commit, not in list order).
export function applyRealtimeChange(list, change, options) {
  const sortFn = (options || {}).sortFn;

  if (change.eventType === 'DELETE') {
    return list.filter(function (item) { return item.id !== change.old.id; });
  }

  const incoming = change.new;
  const exists = list.some(function (item) { return item.id === incoming.id; });

  const next = exists
    ? list.map(function (item) { return item.id === incoming.id ? incoming : item; })
    : list.concat([incoming]);

  return sortFn ? next.slice().sort(sortFn) : next;
}

// Subscribes to changes on `table` scoped to one user's rows. Returns an
// unsubscribe function. A unique channel name per user avoids collisions if
// something else on the page opens a channel with the same table name.
export function subscribeToTable(table, userId, onChange) {
  const channel = supabase
    .channel(table + '-changes-' + userId)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: table, filter: 'user_id=eq.' + userId },
      onChange
    )
    .subscribe();

  return function unsubscribe() {
    supabase.removeChannel(channel);
  };
}
