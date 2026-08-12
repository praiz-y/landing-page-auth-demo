import { describe, it, expect, vi } from 'vitest';
import { filterCommands, buildDefaultCommands } from './commandPalette.js';

const sample = [
  { id: 'a', label: 'Go to Dashboard', keywords: 'home stats' },
  { id: 'b', label: 'New Note', keywords: 'create add' },
  { id: 'c', label: 'Log out', keywords: 'sign out' }
];

describe('filterCommands', function () {
  it('returns all commands for an empty query', function () {
    expect(filterCommands(sample, '')).toEqual(sample);
    expect(filterCommands(sample, '   ')).toEqual(sample);
  });

  it('matches case-insensitively against the label', function () {
    expect(filterCommands(sample, 'dashboard')).toEqual([sample[0]]);
    expect(filterCommands(sample, 'DASHBOARD')).toEqual([sample[0]]);
  });

  it('matches against keywords, not just the label', function () {
    expect(filterCommands(sample, 'sign')).toEqual([sample[2]]);
  });

  it('returns an empty array when nothing matches', function () {
    expect(filterCommands(sample, 'zzz')).toEqual([]);
  });
});

describe('buildDefaultCommands', function () {
  it('excludes the "go to" entry for the current page', function () {
    const commands = buildDefaultCommands({ page: 'notes', logout: vi.fn() });
    expect(commands.find(function (c) { return c.id === 'nav-notes'; })).toBeUndefined();
    expect(commands.find(function (c) { return c.id === 'nav-goals'; })).toBeDefined();
    expect(commands.find(function (c) { return c.id === 'nav-dashboard'; })).toBeDefined();
  });

  it('always includes create-note, create-goal and logout', function () {
    const commands = buildDefaultCommands({ page: 'dashboard', logout: vi.fn() });
    const ids = commands.map(function (c) { return c.id; });
    expect(ids).toEqual(expect.arrayContaining(['new-note', 'new-goal', 'logout']));
  });

  it('logout action calls the injected logout function', function () {
    const logout = vi.fn();
    const commands = buildDefaultCommands({ page: 'dashboard', logout });
    commands.find(function (c) { return c.id === 'logout'; }).action();
    expect(logout).toHaveBeenCalledWith('index.html');
  });
});
