import { showAlert, setUserChrome, escapeHtml, setFieldError, clearAllErrors, focusFirstInvalid, wireConfirmDelete } from './utils.js';
import { guard, getUsername, logout } from './lib/auth.js';
import { listNotes, createNote, updateNote, deleteNote } from './lib/notes.js';

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

  const form = document.getElementById('noteForm');
  const titleEl = document.getElementById('noteTitle');
  const bodyEl = document.getElementById('noteBody');
  const submitBtn = document.getElementById('noteSubmitBtn');
  const cancelBtn = document.getElementById('noteCancelBtn');
  const listEl = document.querySelector('.notes-list');
  const emptyEl = document.querySelector('.notes-empty');

  let notes = [];
  let editingId = null;

  function resetForm() {
    editingId = null;
    form.reset();
    clearAllErrors(form);
    submitBtn.textContent = 'Add Note';
    cancelBtn.hidden = true;
  }

  function formatTime(iso) {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });
  }

  function renderNoteCard(note) {
    return (
      '<div class="note-card">' +
        '<div class="note-card-top">' +
          '<div class="note-card-title">' + escapeHtml(note.title) + '</div>' +
          '<div class="note-card-actions">' +
            '<button type="button" class="js-edit-note" data-id="' + note.id + '">Edit</button>' +
            '<a class="js-note-to-goal" href="goals.html?title=' + encodeURIComponent(note.title) + '">&rarr; Goal</a>' +
            '<button type="button" class="js-delete-note" data-id="' + note.id + '">Delete</button>' +
          '</div>' +
        '</div>' +
        (note.body ? '<div class="note-card-body">' + escapeHtml(note.body) + '</div>' : '') +
        '<div class="note-card-time">Updated ' + formatTime(note.updated_at) + '</div>' +
      '</div>'
    );
  }

  // Full-list re-render replaces every node inside listEl, which would
  // otherwise drop keyboard focus to <body>. Remember what had focus (if
  // it was inside the list) and try to restore it afterward; if that exact
  // control no longer exists (e.g. its row was just deleted), land on the
  // form's title field instead of leaving focus stranded.
  function render() {
    const active = document.activeElement;
    const activeRole = active && listEl.contains(active) && active.dataset.id
      ? ['js-edit-note', 'js-delete-note'].find(function (c) { return active.classList.contains(c); })
      : null;
    const activeId = activeRole ? active.dataset.id : null;

    emptyEl.hidden = notes.length > 0;
    listEl.innerHTML = notes.map(renderNoteCard).join('');

    listEl.querySelectorAll('.js-edit-note').forEach(function (btn) {
      btn.addEventListener('click', function () {
        startEdit(btn.dataset.id);
      });
    });

    listEl.querySelectorAll('.js-delete-note').forEach(function (btn) {
      wireConfirmDelete(btn, function () {
        handleDelete(btn.dataset.id);
      }, { armedText: 'Confirm?', armedAriaLabel: 'Click again to permanently delete this note' });
    });

    if (activeRole) {
      const restored = listEl.querySelector('.' + activeRole + '[data-id="' + activeId + '"]');
      (restored || titleEl).focus();
    }
  }

  async function refresh() {
    const { data, error } = await listNotes();

    if (error) {
      showAlert('Could not load notes.', 'error');
      return;
    }

    notes = data;
    render();
  }

  function startEdit(id) {
    const note = notes.find(function (n) { return n.id === id; });
    if (!note) return;

    editingId = id;
    titleEl.value = note.title;
    bodyEl.value = note.body;
    submitBtn.textContent = 'Save Changes';
    cancelBtn.hidden = false;
    titleEl.focus();
  }

  cancelBtn.addEventListener('click', resetForm);

  bodyEl.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      form.requestSubmit();
    }
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearAllErrors(form);

    const title = titleEl.value.trim();
    const body = bodyEl.value.trim();

    if (!title) {
      setFieldError(titleEl, 'Title is required.');
      focusFirstInvalid(form);
      return;
    }

    submitBtn.disabled = true;

    const { error } = editingId
      ? await updateNote(editingId, { title, body })
      : await createNote(userId, { title, body });

    submitBtn.disabled = false;

    if (error) {
      showAlert(editingId ? 'Could not save changes.' : 'Could not create note.', 'error');
      return;
    }

    showAlert(editingId ? 'Note updated.' : 'Note created.', 'success');
    resetForm();
    refresh();
  });

  async function handleDelete(id) {
    const { error } = await deleteNote(id);

    if (error) {
      showAlert('Could not delete note.', 'error');
      return;
    }

    if (editingId === id) resetForm();
    showAlert('Note deleted.', 'success');
    refresh();
  }

  refresh();
});
