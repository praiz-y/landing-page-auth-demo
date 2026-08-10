import { showAlert, setUserChrome, escapeHtml, formatRelativeTime } from './utils.js';
import { guard, getUsername, logout } from './lib/auth.js';
import { listNotes } from './lib/notes.js';
import { listGoals } from './lib/goals.js';
import {
  currentStreak,
  longestStreak,
  weeklyNoteCounts,
  notesThisWeek,
  notesToday,
  goalsDueToday,
  goalsOverdue,
  buildActivityFeed
} from './lib/stats.js';

document.addEventListener('DOMContentLoaded', async function () {

  const session = await guard();
  if (!session) return;

  const username = getUsername(session);
  setUserChrome(username);

  document.querySelectorAll('.js-logout').forEach(function (btn) {
    btn.addEventListener('click', function () {
      logout('index.html');
    });
  });

  function animateCount(el, end, suffix) {
    const duration = 1000;
    let start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const value = Math.floor((1 - Math.pow(1 - progress, 3)) * end);
      el.textContent = value.toLocaleString() + (suffix || '');
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function renderChart(weekly) {
    const wrap = document.getElementById('weeklyChart');
    const maxCount = Math.max.apply(null, weekly.counts.concat([1]));

    wrap.innerHTML = weekly.counts.map(function (count, i) {
      const heightPx = count === 0 ? 3 : Math.round((count / maxCount) * 80);
      const isToday = i === weekly.todayIndex;

      return (
        '<div class="chart-bar-col">' +
          '<div class="chart-bar' + (isToday ? ' active' : '') + '" style="height:0" data-h="' + heightPx + 'px" title="' + count + ' note' + (count === 1 ? '' : 's') + '"></div>' +
          '<div class="chart-bar-lbl">' + escapeHtml(weekly.labels[i]) + '</div>' +
        '</div>'
      );
    }).join('');

    wrap.querySelectorAll('.chart-bar').forEach(function (bar, index) {
      const height = bar.dataset.h;
      setTimeout(function () {
        bar.style.height = height;
        bar.style.transition = 'height 0.6s cubic-bezier(0.34,1.2,0.64,1)';
      }, 200 + index * 60);
    });
  }

  function renderActivity(feed) {
    const list = document.querySelector('.activity-list');
    const empty = document.getElementById('activityEmpty');

    empty.hidden = feed.length > 0;

    list.innerHTML = feed.map(function (event) {
      const label = event.type === 'note-updated'
        ? 'Note updated: ' + escapeHtml(event.title)
        : event.type === 'goal-created'
          ? 'Goal set: ' + escapeHtml(event.title)
          : 'Note created: ' + escapeHtml(event.title);

      return (
        '<div class="activity-item">' +
          '<div class="activity-dot' + (event.kind === 'goal' ? ' dim' : '') + '"></div>' +
          '<div>' +
            '<div class="activity-text">' + label + '</div>' +
            '<div class="activity-time">' + formatRelativeTime(event.timestamp) + '</div>' +
          '</div>' +
        '</div>'
      );
    }).join('');
  }

  const [notesResult, goalsResult] = await Promise.all([listNotes(), listGoals()]);

  if (notesResult.error || goalsResult.error) {
    showAlert('Could not load your workspace data.', 'error');
    return;
  }

  const notes = notesResult.data;
  const goals = goalsResult.data;
  const goalsDone = goals.filter(function (g) { return g.done; }).length;
  const goalsActive = goals.length - goalsDone;
  const streak = currentStreak(notes, goals);
  const best = longestStreak(notes, goals);
  const weekly = weeklyNoteCounts(notes);

  setTimeout(function () {
    animateCount(document.getElementById('statNotes'), notes.length);
    animateCount(document.getElementById('statGoalsDone'), goalsDone);
    animateCount(document.getElementById('statStreak'), streak, 'd');
    animateCount(document.getElementById('statGoalsTotal'), goals.length);
  }, 200);

  document.getElementById('statNotesChange').textContent = notesThisWeek(notes) + ' this week';
  document.getElementById('statGoalsDoneChange').textContent = goals.length + ' total goal' + (goals.length === 1 ? '' : 's');
  document.getElementById('statStreakChange').textContent = 'Best: ' + best + 'd';
  document.getElementById('statGoalsTotalChange').textContent = goalsActive + ' active';

  const dueToday = goalsDueToday(goals);
  const overdue = goalsOverdue(goals);

  document.getElementById('infoDueToday').textContent = dueToday;
  document.getElementById('infoNotesToday').textContent = notesToday(notes);

  const overdueEl = document.getElementById('infoOverdue');
  overdueEl.textContent = overdue;
  overdueEl.classList.toggle('red', overdue > 0);

  renderChart(weekly);
  renderActivity(buildActivityFeed(notes, goals, 5));

  showAlert('Welcome back, ' + username + '!', 'success', 3000);
});
