const alertContainer = document.createElement('div');
alertContainer.className = 'alert-container';
document.body.appendChild(alertContainer);

function showAlert(message, type, duration) {
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

const Auth = {
  save: function (user) {
    sessionStorage.setItem('vn_user', JSON.stringify(user));
  },

  get: function () {
    try {
      return JSON.parse(sessionStorage.getItem('vn_user'));
    } catch (e) {
      return null;
    }
  },

  clear: function () {
    sessionStorage.removeItem('vn_user');
  },

  isLoggedIn: function () {
    return !!this.get();
  },

  guard: function () {
    if (!this.isLoggedIn()) {
      showAlert('Please log in first.', 'error');
      setTimeout(function () {
        window.location.href = 'login.html';
      }, 1100);
      return false;
    }
    return true;
  },

  guardRedirect: function () {
    if (this.isLoggedIn()) {
      window.location.href = 'dashboard.html';
      return true;
    }
    return false;
  }
};

function logout() {
  Auth.clear();
  showAlert('Logged out. See you soon!', 'success');

  setTimeout(function () {
    window.location.href = 'index.html';
  }, 1000);
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

document.addEventListener('DOMContentLoaded', initScrollReveal);

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function setFieldError(input, message) {
  input.classList.add('error');

  const err = input.closest('.form-group')?.querySelector('.form-error');
  if (err) {
    err.textContent = message;
    err.classList.add('show');
  }
}

function clearFieldError(input) {
  input.classList.remove('error');

  const err = input.closest('.form-group')?.querySelector('.form-error');
  if (err) {
    err.classList.remove('show');
  }
}

function clearAllErrors(form) {
  form.querySelectorAll('.form-control').forEach(clearFieldError);
}

document.querySelectorAll('.pwd-toggle').forEach(function (btn) {
  btn.addEventListener('click', function () {
    const input = btn.previousElementSibling;
    const hidden = input.type === 'password';

    input.type = hidden ? 'text' : 'password';
    btn.textContent = hidden ? 'hide' : 'show';
  });
});