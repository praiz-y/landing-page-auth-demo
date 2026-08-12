import { describe, it, expect } from 'vitest';
import { isGuest, getUsername } from './auth.js';

describe('isGuest', function () {
  it('is true when the session user is anonymous', function () {
    expect(isGuest({ user: { is_anonymous: true } })).toBe(true);
  });

  it('is false for a regular signed-up user', function () {
    expect(isGuest({ user: { is_anonymous: false } })).toBe(false);
  });

  it('is false for a missing session or user', function () {
    expect(isGuest(null)).toBe(false);
    expect(isGuest({})).toBe(false);
  });
});

describe('getUsername', function () {
  it('prefers the username in user_metadata', function () {
    const session = { user: { user_metadata: { username: 'praiz' }, email: 'p@example.com' } };
    expect(getUsername(session)).toBe('praiz');
  });

  it('falls back to the email local part when there is no username', function () {
    const session = { user: { user_metadata: {}, email: 'p@example.com' } };
    expect(getUsername(session)).toBe('p');
  });

  it('falls back to "there" when there is no session at all', function () {
    expect(getUsername(null)).toBe('there');
  });
});
