import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { toSearchTerm, debounce } from './search.js';

describe('toSearchTerm', function () {
  it('returns null for empty input', function () {
    expect(toSearchTerm('')).toBeNull();
    expect(toSearchTerm(undefined)).toBeNull();
  });

  it('returns null for whitespace-only input', function () {
    expect(toSearchTerm('   ')).toBeNull();
  });

  it('trims surrounding whitespace', function () {
    expect(toSearchTerm('  launch ideas  ')).toBe('launch ideas');
  });

  it('passes through a normal query unchanged', function () {
    expect(toSearchTerm('roadmap')).toBe('roadmap');
  });
});

describe('debounce', function () {
  beforeEach(function () {
    vi.useFakeTimers();
  });

  afterEach(function () {
    vi.useRealTimers();
  });

  it('only calls fn once after the wait period, with the latest args', function () {
    const fn = vi.fn();
    const debounced = debounce(fn, 200);

    debounced('a');
    debounced('b');
    debounced('c');

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('c');
  });

  it('cancel() prevents a pending call from firing', function () {
    const fn = vi.fn();
    const debounced = debounce(fn, 200);

    debounced('x');
    debounced.cancel();

    vi.advanceTimersByTime(200);

    expect(fn).not.toHaveBeenCalled();
  });

  it('separate bursts each produce their own call', function () {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced('first');
    vi.advanceTimersByTime(100);
    debounced('second');
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(1, 'first');
    expect(fn).toHaveBeenNthCalledWith(2, 'second');
  });
});
