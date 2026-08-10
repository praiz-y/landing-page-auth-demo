// Pure data-shaping for the dashboard. No DOM, no network — takes note/goal
// rows already fetched from Supabase and derives everything the dashboard
// displays. Kept separate so the date math can be unit-tested directly.

const MS_PER_DAY = 86400000;

// Converts an instant to an opaque integer "day number" anchored on its
// LOCAL calendar date. Never converted back into a Date — used only for
// consistent integer arithmetic, which sidesteps the local/UTC mismatch you
// get from round-tripping through `new Date("YYYY-MM-DD")` (that parses as
// UTC midnight, while .getFullYear()/.getDate() read in local time).
function dayNumber(date) {
  const d = new Date(date);
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / MS_PER_DAY);
}

function dateKey(date) {
  const d = new Date(date);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function activityDayNumbers(notes, goals) {
  const days = new Set();
  notes.forEach(function (n) { days.add(dayNumber(n.created_at)); });
  goals.forEach(function (g) { days.add(dayNumber(g.created_at)); });
  return days;
}

// Consecutive days up to and including today (or yesterday, if nothing
// happened yet today) with at least one note or goal created.
export function currentStreak(notes, goals, today) {
  const days = activityDayNumbers(notes, goals);
  let cursor = dayNumber(today || new Date());

  if (!days.has(cursor)) {
    cursor -= 1;
    if (!days.has(cursor)) return 0;
  }

  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor -= 1;
  }
  return streak;
}

// Longest run of consecutive active days across all history, not just the
// current run — this is what backs the "Best: Nd" sub-label honestly,
// without needing a stored high-water-mark column.
export function longestStreak(notes, goals) {
  const days = activityDayNumbers(notes, goals);
  if (days.size === 0) return 0;

  const sorted = Array.from(days).sort(function (a, b) { return a - b; });
  let longest = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i++) {
    current = sorted[i] === sorted[i - 1] + 1 ? current + 1 : 1;
    longest = Math.max(longest, current);
  }
  return longest;
}

// Notes created per day for the last 7 days (today inclusive, today last).
export function weeklyNoteCounts(notes, today) {
  const base = today || new Date();
  const todayNum = dayNumber(base);
  const counts = new Array(7).fill(0);
  const labels = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    labels.push(d.toLocaleDateString(undefined, { weekday: 'narrow' }));
  }

  notes.forEach(function (n) {
    const diff = todayNum - dayNumber(n.created_at);
    if (diff >= 0 && diff < 7) counts[6 - diff]++;
  });

  return { labels: labels, counts: counts, todayIndex: 6 };
}

export function notesThisWeek(notes, today) {
  return weeklyNoteCounts(notes, today).counts.reduce(function (a, b) { return a + b; }, 0);
}

export function notesToday(notes, today) {
  const todayNum = dayNumber(today || new Date());
  return notes.filter(function (n) { return dayNumber(n.created_at) === todayNum; }).length;
}

export function goalsDueToday(goals, today) {
  const key = dateKey(today || new Date());
  return goals.filter(function (g) { return !g.done && g.due_date === key; }).length;
}

export function goalsOverdue(goals, today) {
  const key = dateKey(today || new Date());
  return goals.filter(function (g) { return !g.done && g.due_date && g.due_date < key; }).length;
}

// Merges note + goal rows into one recency-sorted feed. Goal completion is
// deliberately NOT an event here — the schema only has created_at for
// goals, not a completion timestamp, so a "completed" event would have to
// borrow the creation time and could show a badly wrong "3 days ago" for a
// goal that was just finished. Completion status shows on the Goals page
// and in the aggregate stat instead, where it doesn't need a timestamp.
export function buildActivityFeed(notes, goals, limit) {
  const EPSILON_MS = 2000; // ignore the sub-2s gap between insert and its own updated_at

  const noteEvents = notes.map(function (n) {
    const created = new Date(n.created_at).getTime();
    const updated = new Date(n.updated_at).getTime();
    const wasEdited = updated - created > EPSILON_MS;

    return {
      kind: 'note',
      type: wasEdited ? 'note-updated' : 'note-created',
      title: n.title,
      timestamp: wasEdited ? n.updated_at : n.created_at
    };
  });

  const goalEvents = goals.map(function (g) {
    return {
      kind: 'goal',
      type: 'goal-created',
      title: g.title,
      timestamp: g.created_at
    };
  });

  return noteEvents.concat(goalEvents)
    .sort(function (a, b) { return new Date(b.timestamp) - new Date(a.timestamp); })
    .slice(0, limit || 5);
}
