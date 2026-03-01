document.addEventListener('DOMContentLoaded', function () {

  if (!Auth.guard()) return;

  const user = Auth.get();

  const initial = user.username.charAt(0).toUpperCase();
  document.querySelectorAll('.js-username').forEach(function (el) {
    el.textContent = user.username;
  });
  document.querySelectorAll('.js-initial').forEach(function (el) {
    el.textContent = initial;
  });

  function animateCount(el, end, suffix) {
    const duration = 1400;
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

  setTimeout(function () {
    document.querySelectorAll('[data-count]').forEach(function (el) {
      animateCount(el, +el.dataset.count, el.dataset.suffix);
    });
  }, 300);

  document.querySelectorAll('.chart-bar').forEach(function (bar, index) {
    const height = bar.dataset.h;
    bar.style.height = '0';

    setTimeout(function () {
      bar.style.height = height;
      bar.style.transition = 'height 0.6s cubic-bezier(0.34,1.2,0.64,1)';
    }, 500 + index * 60);
  });

  const items = [
    ['Note created: Project Ideas', '2 min ago', false],
    ['Goal completed: Read 10 pages', '15 min ago', true],
    ['Board updated: Q2 Plans', '1 hr ago', false],
    ['Note created: Meeting takeaways', '3 hr ago', true],
    ['Goal set: Ship landing page', 'Yesterday', true]
  ];

  const list = document.querySelector('.activity-list');

  if (list) {
    list.innerHTML = items.map(function (item) {
      return (
        '<div class="activity-item">' +
          '<div class="activity-dot' + (item[2] ? ' dim' : '') + '"></div>' +
          '<div>' +
            '<div class="activity-text">' + item[0] + '</div>' +
            '<div class="activity-time">' + item[1] + '</div>' +
          '</div>' +
        '</div>'
      );
    }).join('');
  }

  document.querySelectorAll('.js-logout').forEach(function (btn) {
    btn.addEventListener('click', logout);
  });

  showAlert('Welcome back, ' + user.username + '!', 'success', 3000);
});