// Pure: filter the command list by a query string. Case-insensitive
// substring match against the label plus any extra keywords; an empty
// query returns every command, in the order given.
export function filterCommands(commands, query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return commands;

  return commands.filter(function (cmd) {
    const haystack = (cmd.label + ' ' + (cmd.keywords || '')).toLowerCase();
    return haystack.includes(q);
  });
}

// Builds the standard nav/create/logout command set for the authenticated
// app shell (dashboard/notes/goals). The "go to the page you're already on"
// entry is dropped since it's a no-op; "New Note"/"New Goal" focus the
// existing form instead of navigating when you're already on that page.
export function buildDefaultCommands(ctx) {
  const page = ctx.page;

  const commands = [
    { id: 'nav-dashboard', label: 'Go to Dashboard', keywords: 'home stats', hint: 'nav', action: function () { window.location.href = 'dashboard.html'; } },
    { id: 'nav-notes', label: 'Go to Notes', keywords: 'notes', hint: 'nav', action: function () { window.location.href = 'notes.html'; } },
    { id: 'nav-goals', label: 'Go to Goals', keywords: 'goals tasks', hint: 'nav', action: function () { window.location.href = 'goals.html'; } },
    {
      id: 'new-note',
      label: 'New Note',
      keywords: 'create add',
      hint: page === 'notes' ? 'focus' : 'nav',
      action: function () {
        if (page === 'notes') {
          const el = document.getElementById('noteTitle');
          if (el) el.focus();
        } else {
          window.location.href = 'notes.html';
        }
      }
    },
    {
      id: 'new-goal',
      label: 'New Goal',
      keywords: 'create add',
      hint: page === 'goals' ? 'focus' : 'nav',
      action: function () {
        if (page === 'goals') {
          const el = document.getElementById('goalTitle');
          if (el) el.focus();
        } else {
          window.location.href = 'goals.html';
        }
      }
    },
    { id: 'logout', label: 'Log out', keywords: 'sign out', hint: 'auth', action: function () { ctx.logout('index.html'); } }
  ];

  return commands.filter(function (cmd) {
    return cmd.id !== 'nav-' + page;
  });
}

let overlay = null;
let listEl = null;
let inputEl = null;
let activeCommands = [];
let selectedIndex = 0;
let getCommandsFn = null;

function buildOverlay() {
  overlay = document.createElement('div');
  overlay.className = 'cmdk-overlay';
  overlay.hidden = true;

  overlay.innerHTML =
    '<div class="cmdk-box" role="dialog" aria-modal="true" aria-label="Command palette">' +
      '<input type="text" class="cmdk-input" placeholder="Type a command..." aria-label="Command palette input" autocomplete="off">' +
      '<div class="cmdk-list" role="listbox"></div>' +
    '</div>';

  document.body.appendChild(overlay);

  inputEl = overlay.querySelector('.cmdk-input');
  listEl = overlay.querySelector('.cmdk-list');

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });

  inputEl.addEventListener('input', function () {
    renderList(filterCommands(getCommandsFn(), inputEl.value));
  });

  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      move(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      move(-1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      runSelected();
    }
  });
}

function move(delta) {
  if (!activeCommands.length) return;
  selectedIndex = (selectedIndex + delta + activeCommands.length) % activeCommands.length;
  highlightSelected();
}

function highlightSelected() {
  const items = listEl.querySelectorAll('.cmdk-item');
  items.forEach(function (item, i) {
    const isSelected = i === selectedIndex;
    item.classList.toggle('selected', isSelected);
    item.setAttribute('aria-selected', isSelected ? 'true' : 'false');
  });
  const el = items[selectedIndex];
  if (el) el.scrollIntoView({ block: 'nearest' });
}

function renderList(commands) {
  activeCommands = commands;
  selectedIndex = 0;

  if (!commands.length) {
    listEl.innerHTML = '<div class="cmdk-empty">No matching commands</div>';
    return;
  }

  listEl.innerHTML = commands.map(function (cmd, i) {
    return (
      '<div class="cmdk-item' + (i === 0 ? ' selected' : '') + '" role="option" aria-selected="' + (i === 0 ? 'true' : 'false') + '" data-index="' + i + '">' +
        '<span class="cmdk-item-label">' + cmd.label + '</span>' +
        (cmd.hint ? '<span class="cmdk-item-hint">' + cmd.hint + '</span>' : '') +
      '</div>'
    );
  }).join('');

  listEl.querySelectorAll('.cmdk-item').forEach(function (item) {
    item.addEventListener('click', function () {
      selectedIndex = Number(item.dataset.index);
      runSelected();
    });
  });
}

function runSelected() {
  const cmd = activeCommands[selectedIndex];
  if (!cmd) return;
  close();
  cmd.action();
}

function open() {
  if (!overlay) buildOverlay();
  overlay.hidden = false;
  inputEl.value = '';
  renderList(filterCommands(getCommandsFn(), ''));
  inputEl.focus();
}

function close() {
  if (overlay) overlay.hidden = true;
}

// `getCommands` is called fresh every time the palette opens, so it reflects
// the current page/session instead of being computed once at init. Returns
// `{ open }` so callers can also trigger it from a visible button, not just
// the Ctrl/Cmd+K shortcut.
export function initCommandPalette(getCommands) {
  getCommandsFn = getCommands;

  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (overlay && !overlay.hidden) {
        close();
      } else {
        open();
      }
    }
  });

  return { open };
}
