import { showAlert, validateEmail, setFieldError, clearFieldError, clearAllErrors, focusFirstInvalid } from './utils.js';
import { signUp, signIn, guardRedirect } from './lib/auth.js';

document.addEventListener('DOMContentLoaded', async function () {

  await guardRedirect();

  // Login
  const loginForm = document.getElementById('loginForm');

  if (loginForm) {
    const emailEl = document.getElementById('loginEmail');
    const passwordEl = document.getElementById('loginPassword');
    const submitBtn = document.getElementById('loginBtn');

    [emailEl, passwordEl].forEach(function (el) {
      if (!el) return;
      el.addEventListener('input', function () {
        clearFieldError(el);
      });
    });

    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      clearAllErrors(loginForm);

      const email = emailEl.value.trim();
      const password = passwordEl.value;
      let valid = true;

      if (!email) {
        setFieldError(emailEl, 'Email is required.');
        valid = false;
      } else if (!validateEmail(email)) {
        setFieldError(emailEl, 'Enter a valid email.');
        valid = false;
      }

      if (!password) {
        setFieldError(passwordEl, 'Password is required.');
        valid = false;
      }

      if (!valid) {
        focusFirstInvalid(loginForm);
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Logging in...';

      const { error } = await signIn({ email, password });

      if (error) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Log In';
        setFieldError(passwordEl, 'Incorrect email or password.');
        passwordEl.focus();
        showAlert('Login failed. Check your details.', 'error');
        return;
      }

      showAlert('Welcome back!', 'success');

      setTimeout(function () {
        window.location.href = 'dashboard.html';
      }, 700);
    });
  }

  // Signup
  const signupForm = document.getElementById('signupForm');

  if (signupForm) {
    const usernameEl = document.getElementById('signupUsername');
    const emailEl = document.getElementById('signupEmail');
    const passwordEl = document.getElementById('signupPassword');
    const confirmEl = document.getElementById('signupConfirm');
    const submitBtn = document.getElementById('signupBtn');

    [usernameEl, emailEl, passwordEl, confirmEl].forEach(function (el) {
      if (!el) return;
      el.addEventListener('input', function () {
        clearFieldError(el);
      });
    });

    signupForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      clearAllErrors(signupForm);

      const username = usernameEl.value.trim();
      const email = emailEl.value.trim();
      const password = passwordEl.value;
      const confirm = confirmEl.value;

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

      if (password !== confirm) {
        setFieldError(confirmEl, 'Passwords do not match.');
        valid = false;
      }

      if (!valid) {
        focusFirstInvalid(signupForm);
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating account...';

      const { data, error } = await signUp({ username, email, password });

      if (error) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
        setFieldError(emailEl, error.message);
        emailEl.focus();
        showAlert(error.message, 'error');
        return;
      }

      // Supabase returns a user with no session when email confirmation
      // is required — there's nothing to log in to yet.
      if (!data.session) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
        showAlert('Account created! Check your email to confirm before logging in.', 'success', 5000);
        return;
      }

      showAlert('Account created! Welcome, ' + username + '!', 'success');

      setTimeout(function () {
        window.location.href = 'dashboard.html';
      }, 750);
    });
  }

});
