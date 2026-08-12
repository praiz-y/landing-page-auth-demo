const alertContainer = document.createElement('div');
alertContainer.className = 'alert-container';
alertContainer.setAttribute('role', 'status');
alertContainer.setAttribute('aria-live', 'polite');
document.body.appendChild(alertContainer);

// Visually-hidden live region for transient state changes that sighted
// users already see (e.g. a delete button arming) and don't need a visible
// toast for, but screen reader users otherwise get zero signal from.
const srAnnouncer = document.createElement('div');
srAnnouncer.className = 'sr-only';
srAnnouncer.setAttribute('role', 'status');
srAnnouncer.setAttribute('aria-live', 'assertive');
document.body.appendChild(srAnnouncer);

export function announce(message) {
  srAnnouncer.textContent = message;
}

export function showAlert(message, type, duration) {
  const icons = { success: '✓', error: '✕', info: '•' };
  const el = document.createElement('div');

  el.className = 'alert alert-' + (type || 'info');
  el.innerHTML = '<span>' + (icons[type] || icons.info) + '</span><span>' + message + '</span>';

  alertContainer.appendChild(el);

  setTimeout(function () {
    el.classList.add('hide');
    el.addEventListener('animationend', function () {
      el.remove();
    }, { once: true });
  }, duration || 3200);
}

const navbar = document.querySelector('.navbar');

if (navbar) {
  window.addEventListener('scroll', function () {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');

function closeMobileMenu() {
  if (hamburger) hamburger.classList.remove('active');
  if (mobileMenu) mobileMenu.classList.remove('open');
}

function openMobileMenu() {
  if (hamburger) hamburger.classList.add('active');
  if (mobileMenu) mobileMenu.classList.add('open');
}

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', function (e) {
    e.stopPropagation();

    if (mobileMenu.classList.contains('open')) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  mobileMenu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMobileMenu);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      closeMobileMenu();
    }
  });

  document.addEventListener('click', function (e) {
    if (
      mobileMenu.classList.contains('open') &&
      !mobileMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      closeMobileMenu();
    }
  });
}

function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  els.forEach(function (el) {
    observer.observe(el);
  });
}

initScrollReveal();

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Escapes user content before it's interpolated into an innerHTML template.
export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

export function formatRelativeTime(iso) {
  const then = new Date(iso).getTime();
  const diffSec = Math.max(0, Math.floor((Date.now() - then) / 1000));

  if (diffSec < 60) return 'Just now';

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return diffMin + ' min ago';

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return diffHr + ' hr ago';

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return diffDay + ' days ago';

  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// Arms a destructive button on first click (shows a "confirm?" state for a
// few seconds); a second click while armed actually runs the action. Any
// other click, or letting the window expire, reverts it. No modal — this
// runs on a freshly-created button every render, so no cross-render state
// tracking is needed.
export function wireConfirmDelete(btn, onConfirm, options) {
  const opts = options || {};
  const armedAriaLabel = opts.armedAriaLabel || 'Click again to confirm delete';
  const originalText = btn.textContent;
  const originalAriaLabel = btn.getAttribute('aria-label');

  function disarm() {
    clearTimeout(btn._confirmTimer);
    btn.classList.remove('confirming');
    if (opts.armedText) btn.textContent = originalText;
    if (originalAriaLabel) {
      btn.setAttribute('aria-label', originalAriaLabel);
    } else {
      btn.removeAttribute('aria-label');
    }
  }

  btn.addEventListener('click', function () {
    if (btn.classList.contains('confirming')) {
      disarm();
      onConfirm();
      return;
    }

    btn.classList.add('confirming');
    if (opts.armedText) btn.textContent = opts.armedText;
    btn.setAttribute('aria-label', armedAriaLabel);
    announce(armedAriaLabel);
    btn._confirmTimer = setTimeout(disarm, 3000);
  });
}

export function setUserChrome(username) {
  const initial = username.charAt(0).toUpperCase();

  document.querySelectorAll('.js-username').forEach(function (el) {
    el.textContent = username;
  });
  document.querySelectorAll('.js-initial').forEach(function (el) {
    el.textContent = initial;
  });
}

export function setFieldError(input, message) {
  input.classList.add('error');
  input.setAttribute('aria-invalid', 'true');

  const err = input.closest('.form-group')?.querySelector('.form-error');
  if (err) {
    if (!err.id) err.id = input.id + '-error';
    err.textContent = message;
    err.classList.add('show');
    input.setAttribute('aria-describedby', err.id);
  }
}

export function clearFieldError(input) {
  input.classList.remove('error');
  input.removeAttribute('aria-invalid');
  input.removeAttribute('aria-describedby');

  const err = input.closest('.form-group')?.querySelector('.form-error');
  if (err) {
    err.classList.remove('show');
  }
}

export function clearAllErrors(form) {
  form.querySelectorAll('.form-control').forEach(clearFieldError);
}

// Call after validation fails, so keyboard/screen-reader users land on the
// first problem instead of a form that silently did nothing.
export function focusFirstInvalid(form) {
  const firstInvalid = form.querySelector('.form-control.error');
  if (firstInvalid) firstInvalid.focus();
}

document.querySelectorAll('.pwd-toggle').forEach(function (btn) {
  btn.addEventListener('click', function () {
    const input = btn.previousElementSibling;
    const hidden = input.type === 'password';

    input.type = hidden ? 'text' : 'password';
    btn.textContent = hidden ? 'hide' : 'show';
  });
});
