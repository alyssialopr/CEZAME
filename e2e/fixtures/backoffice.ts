import { test as base } from '@playwright/test';
import { BackofficeApiMock } from './apiMock';
import { SupabaseMock } from './supabaseMock';

export const ADMIN = { id: 'admin-1', email: 'admin@cezame.app', password: 'Admin123!', user_metadata: { username: 'admin' } };
export const LEARNER = { id: 'user-7', email: 'apprenant@cezame.app', password: 'Apprenant1!', user_metadata: {} };

// Fournit aux tests un Supabase (auth) et une API backoffice simulés, avec un
// admin et un simple apprenant déjà inscrits.
export const test = base.extend<{ supabase: SupabaseMock; api: BackofficeApiMock }>({
  supabase: [
    async ({ page }, use) => {
      const supabase = new SupabaseMock();
      supabase.users.push(ADMIN, LEARNER);
      await supabase.install(page);
      await use(supabase);
    },
    { auto: true },
  ],
  api: [
    async ({ page }, use) => {
      const api = new BackofficeApiMock();
      api.addAdmin(`token-${ADMIN.id}`, { id: ADMIN.id, email: ADMIN.email, role: 'admin', username: 'admin' });
      await api.install(page);
      await use(api);
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';

export async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByTestId('login-email').fill(ADMIN.email);
  await page.getByTestId('login-password').fill(ADMIN.password);
  await page.getByTestId('login-submit').click();
}
