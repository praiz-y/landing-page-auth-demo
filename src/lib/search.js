// Trims a raw search box value down to something worth sending to Postgres.
// Returns null for empty/whitespace-only input so callers can tell "no
// search" apart from "search for empty string" without re-checking .trim().
export function toSearchTerm(raw) {
  const trimmed = (raw || '').trim();
  return trimmed.length > 0 ? trimmed : null;
}

// Debounces `fn`, waiting `wait` ms of silence before calling it with the
// latest arguments. Exposes `.cancel()` so callers can clear a pending call
// (e.g. when the search box is cleared) without needing their own timer.
export function debounce(fn, wait) {
  let timer = null;

  function debounced(...args) {
    clearTimeout(timer);
    timer = setTimeout(function () {
      timer = null;
      fn.apply(null, args);
    }, wait);
  }

  debounced.cancel = function () {
    clearTimeout(timer);
    timer = null;
  };

  return debounced;
}
