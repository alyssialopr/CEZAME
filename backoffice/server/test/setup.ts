import { vi, beforeEach } from 'vitest';
import { resetFake } from './fakeSupabase';

vi.mock('../src/config/supabase.js', async () => (await import('./fakeSupabase')).supabaseModule);

beforeEach(() => {
  resetFake();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});
