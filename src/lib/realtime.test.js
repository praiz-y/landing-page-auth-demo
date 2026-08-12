import { describe, it, expect } from 'vitest';
import { applyRealtimeChange } from './realtime.js';

const byUpdatedAtDesc = function (a, b) {
  return new Date(b.updated_at) - new Date(a.updated_at);
};

describe('applyRealtimeChange', function () {
  it('INSERT adds a new row', function () {
    const list = [{ id: '1', title: 'a' }];
    const result = applyRealtimeChange(list, { eventType: 'INSERT', new: { id: '2', title: 'b' } });

    expect(result).toEqual([{ id: '1', title: 'a' }, { id: '2', title: 'b' }]);
    expect(list).toEqual([{ id: '1', title: 'a' }]); // original untouched
  });

  it('UPDATE replaces the matching row in place', function () {
    const list = [{ id: '1', title: 'a' }, { id: '2', title: 'b' }];
    const result = applyRealtimeChange(list, { eventType: 'UPDATE', new: { id: '1', title: 'a-edited' } });

    expect(result).toEqual([{ id: '1', title: 'a-edited' }, { id: '2', title: 'b' }]);
  });

  it('DELETE removes the matching row', function () {
    const list = [{ id: '1', title: 'a' }, { id: '2', title: 'b' }];
    const result = applyRealtimeChange(list, { eventType: 'DELETE', old: { id: '1' } });

    expect(result).toEqual([{ id: '2', title: 'b' }]);
  });

  it('INSERT for an id that already exists upserts instead of duplicating (own-write echo)', function () {
    const list = [{ id: '1', title: 'a' }];
    const result = applyRealtimeChange(list, { eventType: 'INSERT', new: { id: '1', title: 'a' } });

    expect(result).toHaveLength(1);
    expect(result).toEqual([{ id: '1', title: 'a' }]);
  });

  it('DELETE for an unknown id is a no-op', function () {
    const list = [{ id: '1', title: 'a' }];
    const result = applyRealtimeChange(list, { eventType: 'DELETE', old: { id: 'zzz' } });

    expect(result).toEqual(list);
  });

  it('re-sorts the result when sortFn is given', function () {
    const list = [
      { id: '1', updated_at: '2026-01-01T00:00:00Z' },
      { id: '2', updated_at: '2026-01-03T00:00:00Z' }
    ];
    const result = applyRealtimeChange(
      list,
      { eventType: 'INSERT', new: { id: '3', updated_at: '2026-01-05T00:00:00Z' } },
      { sortFn: byUpdatedAtDesc }
    );

    expect(result.map(function (r) { return r.id; })).toEqual(['3', '2', '1']);
  });
});
