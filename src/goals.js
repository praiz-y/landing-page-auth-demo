import { showAlert, setUserChrome, escapeHtml, setFieldError, clearAllErrors, focusFirstInvalid, wireConfirmDelete } from './utils.js';
import { guard, getUsername, logout } from './lib/auth.js';
import { listGoals, createGoal, toggleGoalDone, deleteGoal } from './lib/goals.js';

document.addEventListener('DOMContentLoaded', async function () {

  const session = await guard();
  if (!session) return;

  const userId = session.user.id;
  setUserChrome(getUsername(session));

  document.querySelectorAll('.js-logout').forEach(function (btn) {
    btn.addEventListener('click', function () {
      logout('index.html');
    });
  });

  const form = document.getElementById('goalForm');
  const titleEl = document.getElementById('goalTitle');
  const dueEl = document.getElementById('goalDue');
  const submitBtn = document.getElementById('goalSubmitBtn');
  const listEl = document.querySelector('.goals-list');
  const emptyEl = document.querySelector('.goals-empty');

  // Arrived from a note's "→ Goal" quick-create link (notes.js). The note
  // itself is left untouched — this only pre-fills the form.
  const incomingTitle = new URLSearchParams(window.location.search).get('title');
  if (incomingTitle) {
    titleEl.value = incomingTitle;
    titleEl.focus();
    titleEl.select();
    window.history.replaceState({}, '', 'goals.html');
  }

  function todayDateKey() {
    const t = new Date();
    return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
  }

  function formatDueDate(dateStr) {
    // dateStr is a plain 'YYYY-MM-DD' from Postgres — parse the parts
    // directly rather than via `new Date(dateStr)`, which reads it as UTC
    // midnight and can display a day off depending on local timezone.
    const parts = dateStr.split('-').map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  function renderGoalRow(goal) {
    const overdue = !goal.done && goal.due_date && goal.due_date < todayDateKey();

    return (
      '<div class="goal-item' + (goal.done ? ' done' : '') + '">' +
        '<label class="goal-check">' +
          '<input type="checkbox" class="js-toggle-goal" data-id="' + goal.id + '"' + (goal.done ? ' checked' : '') + '>' +
          '<span class="goal-title">' + escapeHtml(goal.title) + '</span>' +
        '</label>' +
        (goal.due_date ? '<span class="goal-due' + (overdue ? ' overdue' : '') + '">' + (overdue ? 'Overdue: ' : 'Due ') + escapeHtml(formatDueDate(goal.due_date)) + '</span>' : '') +
        '<button type="button" class="goal-delete js-delete-goal" data-id="' + goal.id + '" aria-label="Delete goal">✕</button>' +
      '</div>'
    );
  }

  // Full-list re-render replaces every node inside listEl, which would
  // otherwise drop keyboard focus to <body>. Remember what had focus (if
  // it was inside the list) and try to restore it afterward — this
  // actually finds a match after a toggle (the row survives, only its
  // done state changes), and falls back to the form's title field when it
  // doesn't (e.g. the row was just deleted).
  function render(goals) {
    const active = document.activeElement;
    const activeRole = active && listEl.contains(active) && active.dataset.id
      ? ['js-toggle-goal', 'js-delete-goal'].find(function (c) { return active.classList.contains(c); })
      : null;
    const activeId = activeRole ? active.dataset.id : null;

    emptyEl.hidden = goals.length > 0;
    listEl.innerHTML = goals.map(renderGoalRow).join('');

    listEl.querySelectorAll('.js-toggle-goal').forEach(function (cb) {
      cb.addEventListener('change', function () {
        handleToggle(cb.dataset.id, cb.checked);
      });
    });

    listEl.querySelectorAll('.js-delete-goal').forEach(function (btn) {
      wireConfirmDelete(btn, function () {
        handleDelete(btn.dataset.id);
      }, { armedText: 'Confirm?', armedAriaLabel: 'Click again to permanently delete this goal' });
    });

    if (activeRole) {
      const restored = listEl.querySelector('.' + activeRole + '[data-id="' + activeId + '"]');
      (restored || titleEl).focus();
    }
  }

  async function refresh() {
    const { data, error } = await listGoals();

    if (error) {
      showAlert('Could not load goals.', 'error');
      return;
    }

    render(data);
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearAllErrors(form);

    const title = titleEl.value.trim();
    const dueDate = dueEl.value;

    if (!title) {
      setFieldError(titleEl, 'Title is required.');
      focusFirstInvalid(form);
      return;
    }

    submitBtn.disabled = true;
    const { error } = await createGoal(userId, { title, due_date: dueDate });
    submitBtn.disabled = false;

    if (error) {
      showAlert('Could not create goal.', 'error');
      return;
    }

    showAlert('Goal added.', 'success');
    form.reset();
    refresh();
  });

  async function handleToggle(id, done) {
    const { error } = await toggleGoalDone(id, done);

    if (error) {
      showAlert('Could not update goal.', 'error');
    }

    refresh();
  }

  async function handleDelete(id) {
    const { error } = await deleteGoal(id);

    if (error) {
      showAlert('Could not delete goal.', 'error');
      return;
    }

    showAlert('Goal deleted.', 'success');
    refresh();
  }

  refresh();
});
