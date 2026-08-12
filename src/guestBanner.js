import { showAlert, validateEmail, setFieldError, clearAllErrors, focusFirstInvalid } from './utils.js';
import { convertGuestAccount } from './lib/auth.js';

// Inserts a banner at the top of the page's `.dash-main` for a guest
// (anonymous) session, with a collapsible inline form that upgrades the
// guest into a permanent account in place — same user_id, so every note
// and goal already created carries over without needing to be copied.
export function renderGuestBanner() {
  const main = document.querySelector('.dash-main');
  if (!main) return;

  const banner = document.createElement('div');
  banner.className = 'guest-banner';
  banner.innerHTML =
    '<div class="guest-banner-row">' +
      '<span>You’re browsing as a guest — this data isn’t permanent.</span>' +
      '<button type="button" class="guest-banner-btn" id="guestSaveBtn">Save this data — create account</button>' +
    '</div>' +
    '<form class="guest-banner-form" id="guestConvertForm" hidden novalidate>' +
      '<div class="form-group">' +
        '<label class="form-label" for="guestUsername">Username</label>' +
        '<input type="text" id="guestUsername" class="form-control" autocomplete="username">' +
        '<div class="form-error"></div>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="form-label" for="guestEmail">Email</label>' +
        '<input type="email" id="guestEmail" class="form-control" autocomplete="email">' +
        '<div class="form-error"></div>' +
      '</div>' +
      '<div class="form-group">' +
        '<label class="form-label" for="guestPassword">Password</label>' +
        '<input type="password" id="guestPassword" class="form-control" autocomplete="new-password">' +
        '<div class="form-error"></div>' +
      '</div>' +
      '<button type="submit" class="btn-auth btn-inline" id="guestConvertBtn">Create Account</button>' +
    '</form>';

  main.prepend(banner);

  const saveBtn = banner.querySelector('#guestSaveBtn');
  const form = banner.querySelector('#guestConvertForm');
  const usernameEl = banner.querySelector('#guestUsername');
  const emailEl = banner.querySelector('#guestEmail');
  const passwordEl = banner.querySelector('#guestPassword');
  const submitBtn = banner.querySelector('#guestConvertBtn');

  saveBtn.addEventListener('click', function () {
    form.hidden = !form.hidden;
    if (!form.hidden) usernameEl.focus();
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearAllErrors(form);

    const username = usernameEl.value.trim();
    const email = emailEl.value.trim();
    const password = passwordEl.value;
    let valid = true;

    if (!username || username.length < 2) {
      setFieldError(usernameEl, 'Username must be at least 2 characters.');
      valid = false;
    }

    if (!email) {
      setFieldError(emailEl, 'Email is required.');
      valid = false;
    } else if (!validateEmail(email)) {
      setFieldError(emailEl, 'Enter a valid email.');
      valid = false;
    }

    if (password.length < 6) {
      setFieldError(passwordEl, 'Password must be at least 6 characters.');
      valid = false;
    }

    if (!valid) {
      focusFirstInvalid(form);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    const { error } = await convertGuestAccount({ username, email, password });

    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Account';

    if (error) {
      showAlert(error.message, 'error');
      return;
    }

    showAlert('Account created! Check your email to confirm the change.', 'success', 5000);
    banner.remove();
  });
}
