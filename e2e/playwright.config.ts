import { defineConfig, devices } from '@playwright/test';

const MOBILE_PORT = 8391;
const BACKOFFICE_PORT = 5391;

// Les deux apps pointent vers des URL factices, interceptées par les tests :
// aucune requête ne part vers le vrai Supabase ni vers l'API du backoffice.
const FAKE_SUPABASE = 'http://supabase.test';
const FAKE_API = 'http://api.test/api';

const mobileBuild = process.env.E2E_SKIP_BUILD
  ? 'true'
  : [
      'cd ../frontend &&',
      'EXPO_OFFLINE=1 EXPO_NO_TELEMETRY=1',
      `EXPO_PUBLIC_SUPABASE_URL=${FAKE_SUPABASE} EXPO_PUBLIC_SUPABASE_KEY=e2e-anon-key`,
      'npx expo export --platform web --output-dir dist-e2e',
    ].join(' ');

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'mobile-web',
      testDir: './tests/mobile',
      use: { ...devices['Pixel 7'], baseURL: `http://localhost:${MOBILE_PORT}` },
    },
    {
      name: 'backoffice',
      testDir: './tests/backoffice',
      use: { ...devices['Desktop Chrome'], baseURL: `http://localhost:${BACKOFFICE_PORT}` },
    },
  ],
  webServer: [
    {
      command: `${mobileBuild} && cd ../e2e && node scripts/serve-spa.mjs ../frontend/dist-e2e ${MOBILE_PORT}`,
      url: `http://localhost:${MOBILE_PORT}`,
      timeout: 300_000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `cd ../backoffice/client && VITE_SUPABASE_URL=${FAKE_SUPABASE} VITE_SUPABASE_ANON_KEY=e2e-anon-key VITE_API_URL=${FAKE_API} npx vite --port ${BACKOFFICE_PORT} --strictPort`,
      url: `http://localhost:${BACKOFFICE_PORT}`,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
