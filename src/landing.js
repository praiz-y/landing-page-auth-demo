import './utils.js';
import { getSession, logout } from './lib/auth.js';

document.addEventListener('DOMContentLoaded', async function () {

  const session = await getSession();

  if (session) {
    const authBtns = document.querySelector('.auth-buttons');

    if (authBtns) {
      authBtns.innerHTML =
        '<a href="dashboard.html" class="login-btn">Dashboard</a>' +
        '<button class="signup-btn js-logout">Logout</button>';
    }

    const mobileAuth = document.querySelector('.mobile-auth');

    if (mobileAuth) {
      mobileAuth.innerHTML =
        '<a href="dashboard.html" class="login-btn">Dashboard</a>' +
        '<button class="signup-btn js-logout">Logout</button>';
    }
  }

  function animateCount(el, end, suffix) {
    const duration = 1600;
    let start = null;

    function step(timestamp) {
      if (!start) start = timestamp;

      const progress = Math.min((timestamp - start) / duration, 1);
      const value = Math.floor((1 - Math.pow(1 - progress, 3)) * end);

      el.textContent = value.toLocaleString() + (suffix || '');

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  setTimeout(function () {
    document.querySelectorAll('[data-count]').forEach(function (el) {
      animateCount(el, +el.dataset.count, el.dataset.suffix);
    });
  }, 500);

  document.addEventListener('click', function (e) {
    if (e.target && e.target.classList.contains('js-logout')) {
      logout('index.html');
    }
  });

});
