import { showAlert, setUserChrome, escapeHtml, setFieldError, clearAllErrors } from './utils.js';
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

  function renderGoalRow(goal) {
    return (
      '<div class="goal-item' + (goal.done ? ' done' : '') + '">' +
        '<label class="goal-check">' +
          '<input type="checkbox" class="js-toggle-goal" data-id="' + goal.id + '"' + (goal.done ? ' checked' : '') + '>' +
          '<span class="goal-title">' + escapeHtml(goal.title) + '</span>' +
        '</label>' +
        (goal.due_date ? '<span class="goal-due">Due ' + escapeHtml(goal.due_date) + '</span>' : '') +
        '<button type="button" class="goal-delete js-delete-goal" data-id="' + goal.id + '" aria-label="Delete goal">✕</button>' +
      '</div>'
    );
  }

  function render(goals) {
    emptyEl.hidden = goals.length > 0;
    listEl.innerHTML = goals.map(renderGoalRow).join('');

    listEl.querySelectorAll('.js-toggle-goal').forEach(function (cb) {
      cb.addEventListener('change', function () {
        handleToggle(cb.dataset.id, cb.checked);
      });
    });

    listEl.querySelectorAll('.js-delete-goal').forEach(function (btn) {
      btn.addEventListener('click', function () {
        handleDelete(btn.dataset.id);
      });
    });
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
