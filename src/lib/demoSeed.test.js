import { describe, it, expect, vi } from 'vitest';

vi.mock('./notes.js', function () {
  return { createNote: vi.fn().mockResolvedValue({ data: {}, error: null }) };
});
vi.mock('./goals.js', function () {
  return { createGoal: vi.fn().mockResolvedValue({ data: {}, error: null }) };
});

import { createNote } from './notes.js';
import { createGoal } from './goals.js';
import { sampleWorkspace, seedGuestWorkspace } from './demoSeed.js';

describe('sampleWorkspace', function () {
  it('returns notes with a non-empty title', function () {
    const sample = sampleWorkspace();
    expect(sample.notes.length).toBeGreaterThan(0);
    sample.notes.forEach(function (note) {
      expect(typeof note.title).toBe('string');
      expect(note.title.length).toBeGreaterThan(0);
    });
  });

  it('returns goals with a non-empty title', function () {
    const sample = sampleWorkspace();
    expect(sample.goals.length).toBeGreaterThan(0);
    sample.goals.forEach(function (goal) {
      expect(typeof goal.title).toBe('string');
      expect(goal.title.length).toBeGreaterThan(0);
    });
  });
});

describe('seedGuestWorkspace', function () {
  it('creates every sample note and goal for the given user', async function () {
    createNote.mockClear();
    createGoal.mockClear();

    const sample = sampleWorkspace();
    await seedGuestWorkspace('user-1');

    expect(createNote).toHaveBeenCalledTimes(sample.notes.length);
    expect(createGoal).toHaveBeenCalledTimes(sample.goals.length);
    expect(createNote).toHaveBeenCalledWith('user-1', sample.notes[0]);
    expect(createGoal).toHaveBeenCalledWith('user-1', sample.goals[0]);
  });
});
