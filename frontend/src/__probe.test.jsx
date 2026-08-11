import { describe, it, expect } from 'vitest';

describe('probe: querySelector with a user-supplied nav id', () => {
  it('throws on ids a client could plausibly type', () => {
    // Section ids are editable in Global Settings -> Navigation.
    for (const id of ['1deals', 'daily deals', 'deals!', '#']) {
      let threw = false;
      try { document.querySelector(`#${id}`); } catch { threw = true; }
      console.log(`   "#${id}" -> ${threw ? 'THROWS' : 'ok'}`);
    }
    expect(() => document.querySelector('#1deals')).toThrow();
  });
});
