document.addEventListener('DOMContentLoaded', function () {

  Auth.guardRedirect();

  const USERS_KEY = 'vn_users';

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

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

    loginForm.addEventListener('submit', function (e) {
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

      if (!valid) return;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Logging in...';

      setTimeout(function () {
        const users = getUsers();
        const user = users.find(function (u) {
          return u.email === email && u.password === password;
        });

        if (!user) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Log In';
          setFieldError(passwordEl, 'Incorrect email or password.');
          showAlert('Login failed. Check your details.', 'error');
          return;
        }

        Auth.save({
          username: user.username,
          email: user.email
        });

        showAlert('Welcome back, ' + user.username + '!', 'success');

        setTimeout(function () {
          window.location.href = 'dashboard.html';
        }, 700);

      }, 780);
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

    signupForm.addEventListener('submit', function (e) {
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

      if (!valid) return;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating account...';

      setTimeout(function () {
        const users = getUsers();

        if (users.find(function (u) { return u.email === email; })) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Create Account';
          setFieldError(emailEl, 'This email is already registered.');
          showAlert('Email already in use. Try logging in.', 'error');
          return;
        }

        users.push({
          username: username,
          email: email,
          password: password,
          createdAt: Date.now()
        });

        saveUsers(users);

        Auth.save({
          username: username,
          email: email
        });

        showAlert('Account created! Welcome, ' + username + '!', 'success');

        setTimeout(function () {
          window.location.href = 'dashboard.html';
        }, 750);

      }, 820);
    });
  }

});