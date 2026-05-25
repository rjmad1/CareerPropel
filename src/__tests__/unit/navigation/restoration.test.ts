/**
 * Unit tests for src/lib/navigation/restoration.ts
 *
 * jsdom provides sessionStorage in the jest/node environment.
 */

import {
  saveRestoration,
  loadRestoration,
  clearRestoration,
} from '@/lib/navigation/restoration';

// Patch requestAnimationFrame for jsdom
if (typeof requestAnimationFrame === 'undefined') {
  (global as any).requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(cb, 0);
}

const KEY = '/jobs';

beforeEach(() => {
  sessionStorage.clear();
});

describe('saveRestoration', () => {
  it('saves an entry', () => {
    saveRestoration(KEY, { scrollY: 420 });
    const raw = sessionStorage.getItem('cp_restore__jobs');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.scrollY).toBe(420);
  });

  it('saves payload alongside scrollY', () => {
    saveRestoration(KEY, { scrollY: 100, payload: { stage: 'applied' } });
    const raw = sessionStorage.getItem('cp_restore__jobs');
    const parsed = JSON.parse(raw!);
    expect(parsed.payload).toEqual({ stage: 'applied' });
  });
});

describe('loadRestoration', () => {
  it('returns null when nothing saved', () => {
    expect(loadRestoration('/nonexistent')).toBeNull();
  });

  it('returns saved entry', () => {
    saveRestoration(KEY, { scrollY: 200 });
    const entry = loadRestoration(KEY);
    expect(entry).not.toBeNull();
    expect(entry!.scrollY).toBe(200);
  });

  it('returns null for entries older than 2 hours', () => {
    saveRestoration(KEY, { scrollY: 50 });
    const raw = sessionStorage.getItem('cp_restore__jobs');
    const parsed = JSON.parse(raw!);
    // Backdate by 3 hours
    parsed.timestamp = Date.now() - 3 * 60 * 60 * 1000;
    sessionStorage.setItem('cp_restore__jobs', JSON.stringify(parsed));

    const result = loadRestoration(KEY);
    expect(result).toBeNull();
    // Should have been removed from sessionStorage
    expect(sessionStorage.getItem('cp_restore__jobs')).toBeNull();
  });
});

describe('clearRestoration', () => {
  it('removes saved entry', () => {
    saveRestoration(KEY, { scrollY: 300 });
    clearRestoration(KEY);
    expect(loadRestoration(KEY)).toBeNull();
  });
});
